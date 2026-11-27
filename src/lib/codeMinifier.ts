export type MinifyLanguage = 'css' | 'javascript' | 'html'

export interface MinifyResult {
  output: string
  originalBytes: number
  minifiedBytes: number
  savedBytes: number
  ratio: number // 0..100
}

export function getUtf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export function detectCodeLanguage(code: string): MinifyLanguage | null {
  const trimmed = code.trim()
  if (!trimmed) return null

  // HTML detection: DOCTYPE or common HTML tags
  if (
    /^<!doctype\s+html/i.test(trimmed) ||
    /<(html|head|body|div|span|section|article|header|footer|main|nav|form|table|ul|ol|li|p|h[1-6]|pre|textarea|script|style|a|img|input|button)\b[^>]*>/i.test(
      trimmed
    )
  ) {
    return 'html'
  }

  // JS detection: common JS keywords/syntax
  if (
    /\b(function|const|let|var|import|export|return|async|await|class|console\.)\b/.test(trimmed) ||
    /=>/.test(trimmed)
  ) {
    return 'javascript'
  }

  // CSS detection: selectors + property: value inside braces or @rules
  if (
    /@(media|keyframes|import|font-face|supports|layer)\b/.test(trimmed) ||
    /[.#a-zA-Z0-9_\-*[\]=:()>\s,]+\{[^}]*:[^}]*\}/.test(trimmed)
  ) {
    return 'css'
  }

  return null
}

/**
 * Safe CSS minifier:
 * - Strips comments (outside strings & url())
 * - Preserves single/double quoted strings and url(...) intact
 * - Preserves spaces inside calc(...) and before ':' (e.g. `div :hover`)
 */
export function minifyCss(input: string): string {
  const placeholders: string[] = []
  const makePlaceholder = (raw: string): string => {
    const idx = placeholders.length
    placeholders.push(raw)
    return `\uE000CSSPH${idx}\uE001`
  }

  let out = ''
  const len = input.length
  let i = 0

  while (i < len) {
    const ch = input[i]

    // Quoted string
    if (ch === '"' || ch === "'") {
      const quote = ch
      let j = i + 1
      let closed = false
      while (j < len) {
        if (input[j] === '\\') {
          j += 2
          continue
        }
        if (input[j] === quote) {
          closed = true
          j++
          break
        }
        j++
      }
      if (!closed) {
        throw new Error('CSS 中存在未闭合的字符串引号')
      }
      out += makePlaceholder(input.slice(i, j))
      i = j
      continue
    }

    // Block comment /* ... */
    if (ch === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2)
      if (end === -1) {
        throw new Error('CSS 中存在未闭合的块级注释 /* ... */')
      }
      out += ' '
      i = end + 2
      continue
    }

    // url(...)
    if (
      (ch === 'u' || ch === 'U') &&
      input.slice(i, i + 4).toLowerCase() === 'url(' &&
      (i === 0 || !/[a-zA-Z0-9_-]/.test(input[i - 1]))
    ) {
      let j = i + 4
      let closed = false
      let inQuote: string | null = null
      while (j < len) {
        const c = input[j]
        if (inQuote) {
          if (c === '\\') {
            j += 2
            continue
          }
          if (c === inQuote) {
            inQuote = null
          }
        } else {
          if (c === '"' || c === "'") {
            inQuote = c
          } else if (c === ')') {
            closed = true
            j++
            break
          }
        }
        j++
      }
      if (!closed) {
        throw new Error('CSS 中存在未闭合的 url(...)')
      }
      out += makePlaceholder(input.slice(i, j))
      i = j
      continue
    }

    out += ch
    i++
  }

  // Collapse whitespace and remove safe redundant spaces
  let minified = out
    .replace(/\s+/g, ' ')
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/:\s+/g, ':')
    .replace(/\s*>\s*/g, '>')
    .replace(/\s*~\s*/g, '~')
    .replace(/;}/g, '}')
    .trim()

  // Restore placeholders
  minified = minified.replace(/\uE000CSSPH(\d+)\uE001/g, (_, idx) => placeholders[Number(idx)])

  return minified
}

/**
 * Safe JavaScript minifier:
 * - Preserves string literals, template literals, and regex literals verbatim
 * - Strips // and /* *\/ comments safely
 * - Collapses redundant whitespace while preserving newlines where ASI could be affected
 * - Never renames variables or performs unsafe AST transforms
 */
export function minifyJs(input: string): string {
  type TokenKind = 'code' | 'string' | 'regex' | 'space' | 'newline'
  interface Token {
    kind: TokenKind
    value: string
  }

  const tokens: Token[] = []
  const len = input.length
  let i = 0

  const getLastSignificant = (): Token | undefined => {
    for (let k = tokens.length - 1; k >= 0; k--) {
      if (tokens[k].kind !== 'space' && tokens[k].kind !== 'newline') {
        return tokens[k]
      }
    }
    return undefined
  }

  const canStartRegex = (): boolean => {
    const prev = getLastSignificant()
    if (!prev) return true
    if (prev.kind === 'string' || prev.kind === 'regex') return false
    const v = prev.value
    if (
      /^(return|case|throw|in|instanceof|typeof|void|delete|new|else|do|yield|await|of)$/.test(v)
    ) {
      return true
    }
    const lastChar = v[v.length - 1]
    return /[=(,[!&|?:;{}\-+*%^~<>]/.test(lastChar)
  }

  const pushSpace = (isNewline: boolean) => {
    const last = tokens[tokens.length - 1]
    if (!last) return
    if (last.kind === 'newline') return
    if (last.kind === 'space') {
      if (isNewline) last.kind = 'newline'
      return
    }
    tokens.push({ kind: isNewline ? 'newline' : 'space', value: isNewline ? '\n' : ' ' })
  }

  while (i < len) {
    const ch = input[i]

    // Whitespace
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      let hasNewline = ch === '\n' || ch === '\r'
      i++
      while (i < len && (input[i] === ' ' || input[i] === '\t' || input[i] === '\r' || input[i] === '\n')) {
        if (input[i] === '\n' || input[i] === '\r') hasNewline = true
        i++
      }
      pushSpace(hasNewline)
      continue
    }

    // Single-line comment //
    if (ch === '/' && input[i + 1] === '/') {
      i += 2
      while (i < len && input[i] !== '\n' && input[i] !== '\r') {
        i++
      }
      pushSpace(true)
      continue
    }

    // Multi-line comment /* ... */
    if (ch === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2)
      if (end === -1) {
        throw new Error('JavaScript 中存在未闭合的块级注释 /* ... */')
      }
      const commentBody = input.slice(i + 2, end)
      pushSpace(/[\r\n]/.test(commentBody))
      i = end + 2
      continue
    }

    // Single/double quoted strings
    if (ch === '"' || ch === "'") {
      const quote = ch
      let j = i + 1
      let closed = false
      while (j < len) {
        if (input[j] === '\\') {
          j += 2
          continue
        }
        if (input[j] === '\n' || input[j] === '\r') {
          break
        }
        if (input[j] === quote) {
          closed = true
          j++
          break
        }
        j++
      }
      if (!closed) {
        throw new Error('JavaScript 中存在未闭合的字符串字面量')
      }
      tokens.push({ kind: 'string', value: input.slice(i, j) })
      i = j
      continue
    }

    // Template literal `...` (preserves content including ${...})
    if (ch === '`') {
      let j = i + 1
      let closed = false
      let exprDepth = 0
      while (j < len) {
        const c = input[j]
        if (c === '\\') {
          j += 2
          continue
        }
        if (exprDepth === 0 && c === '`') {
          closed = true
          j++
          break
        }
        if (c === '$' && input[j + 1] === '{') {
          exprDepth++
          j += 2
          continue
        }
        if (exprDepth > 0 && c === '}') {
          exprDepth--
          j++
          continue
        }
        j++
      }
      if (!closed) {
        throw new Error('JavaScript 中存在未闭合的模板字符串')
      }
      tokens.push({ kind: 'string', value: input.slice(i, j) })
      i = j
      continue
    }

    // Regex literal /pattern/flags
    if (ch === '/' && canStartRegex()) {
      let j = i + 1
      let inClass = false
      let closed = false
      while (j < len) {
        const c = input[j]
        if (c === '\\') {
          j += 2
          continue
        }
        if (c === '\n' || c === '\r') {
          break
        }
        if (c === '[') {
          inClass = true
        } else if (c === ']') {
          inClass = false
        } else if (c === '/' && !inClass) {
          closed = true
          j++
          while (j < len && /[a-zA-Z]/.test(input[j])) j++
          break
        }
        j++
      }
      if (closed) {
        tokens.push({ kind: 'regex', value: input.slice(i, j) })
        i = j
        continue
      }
    }

    // Identifier / number word
    if (/[A-Za-z0-9_$]/.test(ch)) {
      let j = i + 1
      while (j < len && /[A-Za-z0-9_$]/.test(input[j])) j++
      tokens.push({ kind: 'code', value: input.slice(i, j) })
      i = j
      continue
    }

    // Multi-char operators or single punctuator
    tokens.push({ kind: 'code', value: ch })
    i++
  }

  // Reassemble tokens safely
  const isWordChar = (c: string) => /[A-Za-z0-9_$]/.test(c)

  let result = ''
  let prevToken: Token | null = null
  let pendingSpace: 'none' | 'space' | 'newline' = 'none'

  for (const tok of tokens) {
    if (tok.kind === 'space') {
      if (pendingSpace === 'none') pendingSpace = 'space'
      continue
    }
    if (tok.kind === 'newline') {
      pendingSpace = 'newline'
      continue
    }

    if (prevToken) {
      const prevEnd = prevToken.value[prevToken.value.length - 1]
      const nextStart = tok.value[0]

      if (pendingSpace === 'newline') {
        const safeToDropNewline =
          (prevToken.kind === 'code' && (prevEnd === ';' || prevEnd === '{' || prevEnd === ',')) ||
          (tok.kind === 'code' && nextStart === '}') ||
          (prevToken.kind === 'code' &&
            prevEnd === '}' &&
            tok.kind === 'code' &&
            /^(else|catch|finally|[)\];,])$/.test(tok.value))

        if (!safeToDropNewline) {
          result += '\n'
        } else if (isWordChar(prevEnd) && isWordChar(nextStart)) {
          result += ' '
        }
      } else if (pendingSpace === 'space') {
        const needsSpace =
          (isWordChar(prevEnd) && isWordChar(nextStart)) ||
          (prevEnd === '+' && nextStart === '+') ||
          (prevEnd === '-' && nextStart === '-') ||
          (prevEnd === '/' && (nextStart === '/' || nextStart === '*')) ||
          (prevEnd === '<' && (nextStart === '!' || nextStart === '-'))

        if (needsSpace) {
          result += ' '
        }
      }
    }

    result += tok.value
    prevToken = tok
    pendingSpace = 'none'
  }

  return result.trim()
}

/**
 * Safe HTML minifier:
 * - Preserves <pre>, <textarea>, <script>, and <style> contents verbatim
 * - Removes HTML comments (preserving IE conditional comments <!--[if ...])
 * - Removes whitespace between tags and collapses redundant spaces outside protected blocks
 */
export function minifyHtml(input: string): string {
  const placeholders: string[] = []
  const store = (raw: string): string => {
    const idx = placeholders.length
    placeholders.push(raw)
    return `\uE000HTMLPH${idx}\uE001`
  }

  // 1. Protect <pre>, <textarea>, <script>, <style> blocks verbatim
  let working = input.replace(
    /<(pre|textarea|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    (match) => store(match)
  )

  // 2. Remove standard HTML comments (keep conditional comments <!--[if ...])
  working = working.replace(/<!--(?!\s*\[if\b)[\s\S]*?-->/g, '')

  // 3. Protect quoted attribute values inside tags so spaces inside attributes remain intact
  working = working.replace(/<[^>]+>/g, (tag) => {
    const attrProtected = tag.replace(/("[^"]*"|'[^']*')/g, (quoted) => store(quoted))
    return attrProtected
      .replace(/\s+/g, ' ')
      .replace(/\s*=\s*/g, '=')
      .replace(/<\s+/g, '<')
      .replace(/\s+>/g, '>')
      .replace(/\s+\/>/g, '/>')
  })

  // 4. Remove whitespace between tags and collapse remaining whitespace runs
  working = working
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim()

  // 5. Restore placeholders (loop in case attributes were nested or sequential)
  working = working.replace(/\uE000HTMLPH(\d+)\uE001/g, (_, idx) => placeholders[Number(idx)])

  return working
}

export function minifyCode(input: string, language: MinifyLanguage): MinifyResult {
  const originalBytes = getUtf8ByteLength(input)
  if (!input.trim()) {
    return {
      output: '',
      originalBytes,
      minifiedBytes: 0,
      savedBytes: 0,
      ratio: 0,
    }
  }

  let output: string
  if (language === 'css') {
    output = minifyCss(input)
  } else if (language === 'javascript') {
    output = minifyJs(input)
  } else {
    output = minifyHtml(input)
  }

  const minifiedBytes = getUtf8ByteLength(output)
  const savedBytes = Math.max(0, originalBytes - minifiedBytes)
  const ratio = originalBytes > 0 ? ((originalBytes - minifiedBytes) / originalBytes) * 100 : 0

  return {
    output,
    originalBytes,
    minifiedBytes,
    savedBytes,
    ratio,
  }
}
