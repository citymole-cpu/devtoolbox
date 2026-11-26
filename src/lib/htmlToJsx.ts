export interface HtmlToJsxOptions {
  wrapComponent?: boolean
  componentName?: string
}

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

const ATTR_MAP: Record<string, string> = {
  // Core HTML -> JSX
  class: 'className',
  for: 'htmlFor',

  // Standard HTML DOM attributes
  'accept-charset': 'acceptCharset',
  accesskey: 'accessKey',
  allowfullscreen: 'allowFullScreen',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  charset: 'charSet',
  classid: 'classID',
  colspan: 'colSpan',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  controlslist: 'controlsList',
  crossorigin: 'crossOrigin',
  datetime: 'dateTime',
  enctype: 'encType',
  enterkeyhint: 'enterKeyHint',
  formaction: 'formAction',
  formenctype: 'formEncType',
  formmethod: 'formMethod',
  formnovalidate: 'formNoValidate',
  formtarget: 'formTarget',
  frameborder: 'frameBorder',
  hreflang: 'hrefLang',
  'http-equiv': 'httpEquiv',
  inputmode: 'inputMode',
  keyparams: 'keyParams',
  keytype: 'keyType',
  marginheight: 'marginHeight',
  marginwidth: 'marginWidth',
  maxlength: 'maxLength',
  mediagroup: 'mediaGroup',
  minlength: 'minLength',
  nomodule: 'noModule',
  novalidate: 'noValidate',
  playsinline: 'playsInline',
  radiogroup: 'radioGroup',
  readonly: 'readOnly',
  referrerpolicy: 'referrerPolicy',
  rowspan: 'rowSpan',
  spellcheck: 'spellCheck',
  srcdoc: 'srcDoc',
  srclang: 'srcLang',
  srcset: 'srcSet',
  tabindex: 'tabIndex',
  usemap: 'useMap',
  wmode: 'wmode',

  // Common Event Handlers
  onabort: 'onAbort',
  onblur: 'onBlur',
  onchange: 'onChange',
  onclick: 'onClick',
  oncontextmenu: 'onContextMenu',
  ondblclick: 'onDoubleClick',
  ondrag: 'onDrag',
  ondragend: 'onDragEnd',
  ondragenter: 'onDragEnter',
  ondragleave: 'onDragLeave',
  ondragover: 'onDragOver',
  ondragstart: 'onDragStart',
  ondrop: 'onDrop',
  onerror: 'onError',
  onfocus: 'onFocus',
  oninput: 'onInput',
  oninvalid: 'onInvalid',
  onkeydown: 'onKeyDown',
  onkeypress: 'onKeyPress',
  onkeyup: 'onKeyUp',
  onload: 'onLoad',
  onmousedown: 'onMouseDown',
  onmouseenter: 'onMouseEnter',
  onmouseleave: 'onMouseLeave',
  onmousemove: 'onMouseMove',
  onmouseout: 'onMouseOut',
  onmouseover: 'onMouseOver',
  onmouseup: 'onMouseUp',
  onpaste: 'onPaste',
  onreset: 'onReset',
  onscroll: 'onScroll',
  onselect: 'onSelect',
  onsubmit: 'onSubmit',
  ontouchcancel: 'onTouchCancel',
  ontouchend: 'onTouchEnd',
  ontouchmove: 'onTouchMove',
  ontouchstart: 'onTouchStart',
  onwheel: 'onWheel',

  // Common SVG attributes
  'accent-height': 'accentHeight',
  'alignment-baseline': 'alignmentBaseline',
  'arabic-form': 'arabicForm',
  'baseline-shift': 'baselineShift',
  'cap-height': 'capHeight',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'color-profile': 'colorProfile',
  'color-rendering': 'colorRendering',
  'dominant-baseline': 'dominantBaseline',
  'enable-background': 'enableBackground',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-size-adjust': 'fontSizeAdjust',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'horiz-adv-x': 'horizAdvX',
  'horiz-origin-x': 'horizOriginX',
  'image-rendering': 'imageRendering',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'overline-position': 'overlinePosition',
  'overline-thickness': 'overlineThickness',
  'paint-order': 'paintOrder',
  'panose-1': 'panose1',
  'pointer-events': 'pointerEvents',
  preserveaspectratio: 'preserveAspectRatio',
  'rendering-intent': 'renderingIntent',
  'shape-rendering': 'shapeRendering',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'strikethrough-position': 'strikethroughPosition',
  'strikethrough-thickness': 'strikethroughThickness',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'underline-position': 'underlinePosition',
  'underline-thickness': 'underlineThickness',
  'unicode-bidi': 'unicodeBidi',
  'unicode-range': 'unicodeRange',
  'units-per-em': 'unitsPerEm',
  'v-alphabetic': 'vAlphabetic',
  'v-hanging': 'vHanging',
  'v-ideographic': 'vIdeographic',
  'v-mathematical': 'vMathematical',
  'vector-effect': 'vectorEffect',
  'vert-adv-y': 'vertAdvY',
  'vert-origin-x': 'vertOriginX',
  'vert-origin-y': 'vertOriginY',
  viewbox: 'viewBox',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'x-height': 'xHeight',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xlink:href': 'xlinkHref',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:title': 'xlinkTitle',
  'xlink:type': 'xlinkType',
  'xml:base': 'xmlBase',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
  'xmlns:xlink': 'xmlnsXlink',
}

const UNITLESS_CSS_PROPS = new Set([
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
])

function escapeJsSingleQuote(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
}

function cssPropertyToJs(prop: string): { key: string; isCustom: boolean } {
  const trimmed = prop.trim()
  if (trimmed.startsWith('--')) {
    return { key: `'${escapeJsSingleQuote(trimmed)}'`, isCustom: true }
  }
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('-ms-')) {
    const rest = lower.slice(4).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    return {
      key: `ms${rest ? rest[0].toUpperCase() + rest.slice(1) : ''}`,
      isCustom: false,
    }
  }
  const camel = lower.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  return { key: camel, isCustom: false }
}

/**
 * Splits a CSS inline style string into declarations while respecting quotes and parentheses
 * (e.g. `background-image: url("data:image/svg+xml;utf8,...")`).
 */
function splitStyleDeclarations(styleText: string): string[] {
  const declarations: string[] = []
  let current = ''
  let quote: string | null = null
  let parenDepth = 0

  for (let i = 0; i < styleText.length; i++) {
    const ch = styleText[i]
    if (quote) {
      current += ch
      if (ch === '\\' && i + 1 < styleText.length) {
        current += styleText[++i]
      } else if (ch === quote) {
        quote = null
      }
      continue
    }

    if (ch === '"' || ch === "'") {
      quote = ch
      current += ch
    } else if (ch === '(') {
      parenDepth++
      current += ch
    } else if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1)
      current += ch
    } else if (ch === ';' && parenDepth === 0) {
      if (current.trim()) declarations.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }

  if (current.trim()) declarations.push(current.trim())
  return declarations
}

export function convertStyleToJsx(styleText: string): string {
  const declarations = splitStyleDeclarations(styleText)
  if (declarations.length === 0) return '{{}}'

  const entries: string[] = []
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':')
    if (colonIdx === -1) continue
    const rawProp = decl.slice(0, colonIdx).trim()
    const rawVal = decl.slice(colonIdx + 1).trim()
    if (!rawProp || !rawVal) continue

    const { key, isCustom } = cssPropertyToJs(rawProp)
    const isPureNumber = /^-?(?:\d+\.?\d*|\.\d+)$/.test(rawVal)
    const canBeNumeric =
      isPureNumber && !isCustom && (rawVal === '0' || UNITLESS_CSS_PROPS.has(key))

    const formattedVal = canBeNumeric ? rawVal : `'${escapeJsSingleQuote(rawVal)}'`
    entries.push(`${key}: ${formattedVal}`)
  }

  if (entries.length === 0) return '{{}}'
  return `{{ ${entries.join(', ')} }}`
}

function mapAttributeName(rawName: string): string {
  const lower = rawName.toLowerCase()
  if (lower.startsWith('data-') || lower.startsWith('aria-')) {
    return rawName
  }
  return ATTR_MAP[lower] ?? rawName
}

function transformOpenTag(tagContent: string): string {
  // tagContent is the text inside `<` and `>` (excluding `<` and `>`)
  let selfClosing = false
  let inner = tagContent
  if (/\/\s*$/.test(inner)) {
    selfClosing = true
    inner = inner.replace(/\/\s*$/, '')
  }

  const tagNameMatch = inner.match(/^([^\s/]+)/)
  if (!tagNameMatch) return `<${tagContent}>`

  const tagName = tagNameMatch[1]
  const isVoid = VOID_ELEMENTS.has(tagName.toLowerCase())
  let idx = tagName.length
  const parts: string[] = [tagName]

  while (idx < inner.length) {
    // Capture whitespace before attribute
    const wsStart = idx
    while (idx < inner.length && /\s/.test(inner[idx])) idx++
    const ws = inner.slice(wsStart, idx)
    if (idx >= inner.length) {
      if (ws && !isVoid && !selfClosing) parts.push(ws)
      break
    }

    // Parse attribute name
    const nameStart = idx
    while (idx < inner.length && !/[\s=/>]/.test(inner[idx])) idx++
    const rawName = inner.slice(nameStart, idx)
    if (!rawName) {
      idx++
      continue
    }

    // Check for `=`
    let tempIdx = idx
    while (tempIdx < inner.length && /\s/.test(inner[tempIdx])) tempIdx++

    let hasValue = false
    let quoteChar = ''
    let rawValue = ''

    if (tempIdx < inner.length && inner[tempIdx] === '=') {
      hasValue = true
      idx = tempIdx + 1
      while (idx < inner.length && /\s/.test(inner[idx])) idx++

      if (idx < inner.length && (inner[idx] === '"' || inner[idx] === "'")) {
        quoteChar = inner[idx]
        idx++
        const valStart = idx
        while (idx < inner.length && inner[idx] !== quoteChar) {
          if (inner[idx] === '\\' && idx + 1 < inner.length) {
            idx += 2
          } else {
            idx++
          }
        }
        rawValue = inner.slice(valStart, idx)
        if (idx < inner.length && inner[idx] === quoteChar) idx++
      } else {
        const valStart = idx
        while (idx < inner.length && !/[\s>]/.test(inner[idx])) idx++
        rawValue = inner.slice(valStart, idx)
      }
    }

    const lowerName = rawName.toLowerCase()
    const mappedName = mapAttributeName(rawName)

    if (lowerName === 'style' && hasValue) {
      parts.push(`${ws}style=${convertStyleToJsx(rawValue)}`)
    } else if (hasValue) {
      const q = quoteChar || '"'
      parts.push(`${ws}${mappedName}=${q}${rawValue}${q}`)
    } else {
      parts.push(`${ws}${mappedName}`)
    }
  }

  const joined = parts.join('').replace(/\s+$/, '')
  if (isVoid || selfClosing) {
    return `<${joined} />`
  }
  return `<${joined}>`
}

function countTopLevelNodes(jsx: string): number {
  let count = 0
  let depth = 0
  let i = 0
  const s = jsx.trim()

  while (i < s.length) {
    if (s.startsWith('{/*', i)) {
      const end = s.indexOf('*/}', i + 3)
      if (end === -1) break
      i = end + 3
      continue
    }
    if (s[i] === '<') {
      if (s[i + 1] === '/') {
        const closeEnd = s.indexOf('>', i + 2)
        if (closeEnd === -1) break
        depth = Math.max(0, depth - 1)
        i = closeEnd + 1
        continue
      }
      // Scan to end of opening/self-closing tag respecting quotes and braces
      let j = i + 1
      let quote: string | null = null
      let braceDepth = 0
      while (j < s.length) {
        const ch = s[j]
        if (quote) {
          if (ch === '\\') {
            j += 2
            continue
          }
          if (ch === quote) quote = null
        } else if (ch === '"' || ch === "'") {
          quote = ch
        } else if (ch === '{') {
          braceDepth++
        } else if (ch === '}') {
          braceDepth = Math.max(0, braceDepth - 1)
        } else if (ch === '>' && braceDepth === 0) {
          break
        }
        j++
      }
      const tagStr = s.slice(i, j + 1)
      const isSelfClosing = /\/\s*>$/.test(tagStr)
      if (depth === 0) count++
      if (!isSelfClosing) depth++
      i = j + 1
      continue
    }
    i++
  }

  return count
}

export function htmlToJsx(html: string, options: HtmlToJsxOptions = {}): string {
  if (!html.trim()) return ''

  let result = ''
  let i = 0

  while (i < html.length) {
    // HTML comments: <!-- ... -->
    if (html.startsWith('<!--', i)) {
      const endIdx = html.indexOf('-->', i + 4)
      if (endIdx === -1) {
        const commentBody = html.slice(i + 4)
        result += `{/*${commentBody}*/}`
        break
      }
      const commentBody = html.slice(i + 4, endIdx)
      result += `{/*${commentBody}*/}`
      i = endIdx + 3
      continue
    }

    // DOCTYPE declaration: strip
    if (/^<!doctype\b/i.test(html.slice(i))) {
      const endIdx = html.indexOf('>', i)
      if (endIdx === -1) break
      i = endIdx + 1
      // Also strip immediate trailing newline after DOCTYPE
      if (html[i] === '\r') i++
      if (html[i] === '\n') i++
      continue
    }

    // Tags
    if (html[i] === '<' && i + 1 < html.length && /[a-zA-Z/]/.test(html[i + 1])) {
      // Closing tag
      if (html[i + 1] === '/') {
        const endIdx = html.indexOf('>', i + 2)
        if (endIdx === -1) {
          result += html.slice(i)
          break
        }
        result += html.slice(i, endIdx + 1)
        i = endIdx + 1
        continue
      }

      // Opening or self-closing tag: scan respecting quoted attribute values
      let j = i + 1
      let quote: string | null = null
      while (j < html.length) {
        const ch = html[j]
        if (quote) {
          if (ch === '\\' && j + 1 < html.length) {
            j += 2
            continue
          }
          if (ch === quote) quote = null
        } else if (ch === '"' || ch === "'") {
          quote = ch
        } else if (ch === '>') {
          break
        }
        j++
      }

      if (j >= html.length) {
        result += html.slice(i)
        break
      }

      const tagContent = html.slice(i + 1, j)
      result += transformOpenTag(tagContent)
      i = j + 1
      continue
    }

    result += html[i]
    i++
  }

  const trimmed = result.trim()
  if (!options.wrapComponent) {
    return trimmed
  }

  const componentName = (options.componentName || 'MyComponent').replace(/[^a-zA-Z0-9_$]/g, '') || 'MyComponent'
  const rootCount = countTopLevelNodes(trimmed)
  const needsFragment = rootCount !== 1

  const indentLines = (text: string, spaces: number) => {
    const pad = ' '.repeat(spaces)
    return text
      .split('\n')
      .map(line => (line.trim() ? `${pad}${line}` : ''))
      .join('\n')
  }

  if (needsFragment) {
    return `export default function ${componentName}() {\n  return (\n    <>\n${indentLines(trimmed, 6)}\n    </>\n  )\n}`
  }

  return `export default function ${componentName}() {\n  return (\n${indentLines(trimmed, 4)}\n  )\n}`
}
