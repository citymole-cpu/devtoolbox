export type DeclarationStyle = 'interface' | 'type'

export interface JsonToTsOptions {
  rootName?: string
  style?: DeclarationStyle
  indent?: 2 | 4
  useExport?: boolean
  allOptional?: boolean
}

export interface JsonParseErrorInfo {
  message: string
  line: number | null
  column: number | null
}

export interface JsonToTsResult {
  code: string
  error: JsonParseErrorInfo | null
}

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
interface JsonObject {
  [key: string]: JsonValue
}

interface FieldSpec {
  type: string
  optional: boolean
}

interface NamedDefinition {
  name: string
  fields: Map<string, FieldSpec>
}

const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function sanitizeTypeName(raw: string, fallback = 'Root'): string {
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  const parts = trimmed
    .replace(/[^A-Za-z0-9_$]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return fallback
  let name = parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  if (!/^[A-Za-z_$]/.test(name)) {
    name = `T${name}`
  }
  return name
}

function singularize(word: string): string {
  if (word.length <= 2) return word
  if (/ies$/i.test(word)) return word.slice(0, -3) + 'y'
  if (/(ses|xes|zes|ches|shes)$/i.test(word)) return word.slice(0, -2)
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1)
  return word
}

function toPascalCase(key: string, isArrayItem = false): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return isArrayItem ? 'Item' : 'NestedObject'

  if (isArrayItem) {
    const last = words[words.length - 1]
    const singular = singularize(last)
    words[words.length - 1] = singular === last ? `${last}Item` : singular
  }

  let name = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

  if (!/^[A-Za-z_$]/.test(name)) {
    name = `T${name}`
  }
  return name
}

function formatPropertyKey(key: string): string {
  return VALID_IDENTIFIER.test(key) ? key : JSON.stringify(key)
}

function splitUnionMembers(typeStr: string): string[] {
  const members: string[] = []
  let depth = 0
  let current = ''
  for (let i = 0; i < typeStr.length; i++) {
    const ch = typeStr[i]
    if (ch === '(' || ch === '<' || ch === '{' || ch === '[') depth++
    else if (ch === ')' || ch === '>' || ch === '}' || ch === ']') depth--

    if (ch === '|' && depth === 0) {
      const trimmed = current.trim()
      if (trimmed) members.push(trimmed)
      current = ''
    } else {
      current += ch
    }
  }
  const last = current.trim()
  if (last) members.push(last)
  return members
}

function buildUnion(types: string[]): string {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const t of types) {
    for (const part of splitUnionMembers(t)) {
      if (!seen.has(part)) {
        seen.add(part)
        ordered.push(part)
      }
    }
  }
  if (ordered.length === 0) return 'unknown'
  return ordered.join(' | ')
}

function wrapArrayElement(typeStr: string): string {
  const needsParens = splitUnionMembers(typeStr).length > 1
  return needsParens ? `(${typeStr})[]` : `${typeStr}[]`
}

function offsetToLineColumn(source: string, offset: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(offset, source.length))
  let line = 1
  let column = 1
  for (let i = 0; i < clamped; i++) {
    if (source[i] === '\n') {
      line++
      column = 1
    } else {
      column++
    }
  }
  return { line, column }
}

function locateJsonSyntaxError(source: string): { line: number; column: number } {
  let i = 0
  const len = source.length

  const skipWs = () => {
    while (i < len && (source[i] === ' ' || source[i] === '\t' || source[i] === '\n' || source[i] === '\r')) {
      i++
    }
  }

  const fail = (): never => {
    throw i
  }

  const parseString = () => {
    if (source[i] !== '"') fail()
    i++
    while (i < len) {
      const ch = source[i]
      if (ch === '"') {
        i++
        return
      }
      if (ch === '\\') {
        i++
        if (i >= len) fail()
        const esc = source[i]
        if (esc === 'u') {
          if (!/^[0-9a-fA-F]{4}/.test(source.slice(i + 1, i + 5))) fail()
          i += 5
        } else if ('"\\/bfnrt'.includes(esc)) {
          i++
        } else {
          fail()
        }
      } else if (ch.charCodeAt(0) < 0x20) {
        fail()
      } else {
        i++
      }
    }
    fail()
  }

  const parseNumber = () => {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(i))
    if (!match) fail()
    i += match[0].length
  }

  const parseValue = () => {
    skipWs()
    if (i >= len) fail()
    const ch = source[i]
    if (ch === '{') {
      i++
      skipWs()
      if (source[i] === '}') {
        i++
        return
      }
      while (true) {
        skipWs()
        parseString()
        skipWs()
        if (source[i] !== ':') fail()
        i++
        parseValue()
        skipWs()
        if (source[i] === ',') {
          i++
          continue
        }
        if (source[i] === '}') {
          i++
          return
        }
        fail()
      }
    } else if (ch === '[') {
      i++
      skipWs()
      if (source[i] === ']') {
        i++
        return
      }
      while (true) {
        parseValue()
        skipWs()
        if (source[i] === ',') {
          i++
          continue
        }
        if (source[i] === ']') {
          i++
          return
        }
        fail()
      }
    } else if (ch === '"') {
      parseString()
    } else if (ch === 't' && source.startsWith('true', i)) {
      i += 4
    } else if (ch === 'f' && source.startsWith('false', i)) {
      i += 5
    } else if (ch === 'n' && source.startsWith('null', i)) {
      i += 4
    } else if (ch === '-' || (ch >= '0' && ch <= '9')) {
      parseNumber()
    } else {
      fail()
    }
  }

  try {
    parseValue()
    skipWs()
    if (i < len) fail()
  } catch (pos) {
    if (typeof pos === 'number') {
      return offsetToLineColumn(source, pos)
    }
  }
  return offsetToLineColumn(source, i)
}

export function extractJsonError(source: string, err: unknown): JsonParseErrorInfo {
  const rawMessage = err instanceof Error ? err.message : String(err)

  // Firefox / Safari / newer V8 format: "... line X column Y ..."
  const lineColMatch = rawMessage.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (lineColMatch) {
    return {
      message: rawMessage,
      line: Number(lineColMatch[1]),
      column: Number(lineColMatch[2]),
    }
  }

  // Older V8 format: "... at position N"
  const posMatch = rawMessage.match(/position\s+(\d+)/i)
  if (posMatch) {
    const pos = Number(posMatch[1])
    const { line, column } = offsetToLineColumn(source, pos)
    return { message: rawMessage, line, column }
  }

  // Fallback: locate exact line/column with RFC 8259 scanner
  const { line, column } = locateJsonSyntaxError(source)
  return { message: rawMessage, line, column }
}

export function jsonToTypescript(
  input: string,
  options: JsonToTsOptions = {}
): JsonToTsResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { code: '', error: null }
  }

  let parsed: JsonValue
  try {
    parsed = JSON.parse(input) as JsonValue
  } catch (err) {
    return {
      code: '',
      error: extractJsonError(input, err),
    }
  }

  const rootName = sanitizeTypeName(options.rootName ?? 'Root', 'Root')
  const style: DeclarationStyle = options.style ?? 'interface'
  const indentSize = options.indent ?? 2
  const indentStr = ' '.repeat(indentSize)
  const useExport = options.useExport ?? true
  const allOptional = options.allOptional ?? false

  const definitions: NamedDefinition[] = []
  const usedNames = new Set<string>()
  const signatureToName = new Map<string, string>()

  function allocateName(preferred: string): string {
    const base = sanitizeTypeName(preferred, 'Nested')
    if (!usedNames.has(base)) {
      usedNames.add(base)
      return base
    }
    let idx = 2
    while (usedNames.has(`${base}${idx}`)) {
      idx++
    }
    const candidate = `${base}${idx}`
    usedNames.add(candidate)
    return candidate
  }

  function computeSignature(fields: Map<string, FieldSpec>): string {
    return Array.from(fields.entries())
      .map(([k, v]) => `${k}${v.optional ? '?' : ''}:${v.type}`)
      .join(';')
  }

  function registerObjectGroup(
    objects: JsonObject[],
    suggestedName: string,
    isRoot = false
  ): string {
    const keyOrder: string[] = []
    const keyValues = new Map<string, JsonValue[]>()
    const keyCounts = new Map<string, number>()

    for (const obj of objects) {
      for (const [k, v] of Object.entries(obj)) {
        if (!keyValues.has(k)) {
          keyOrder.push(k)
          keyValues.set(k, [])
          keyCounts.set(k, 0)
        }
        keyValues.get(k)!.push(v)
        keyCounts.set(k, (keyCounts.get(k) ?? 0) + 1)
      }
    }

    const fields = new Map<string, FieldSpec>()
    for (const key of keyOrder) {
      const values = keyValues.get(key)!
      const missingInSome = (keyCounts.get(key) ?? 0) < objects.length
      const fieldType = inferValuesType(values, key)
      fields.set(key, {
        type: fieldType,
        optional: allOptional || missingInSome,
      })
    }

    const signature = computeSignature(fields)
    if (!isRoot && signatureToName.has(signature)) {
      return signatureToName.get(signature)!
    }

    const name = isRoot ? allocateName(rootName) : allocateName(suggestedName)
    if (!signatureToName.has(signature)) {
      signatureToName.set(signature, name)
    }
    definitions.push({ name, fields })
    return name
  }

  function inferValuesType(values: JsonValue[], hintKey: string): string {
    const objectBucket: JsonObject[] = []
    const arrayBucket: JsonValue[][] = []
    const primitiveTypes: string[] = []

    for (const val of values) {
      if (val === null) {
        primitiveTypes.push('null')
      } else if (Array.isArray(val)) {
        arrayBucket.push(val)
      } else if (isPlainObject(val)) {
        objectBucket.push(val)
      } else {
        primitiveTypes.push(typeof val)
      }
    }

    const resultTypes: string[] = [...primitiveTypes]

    if (objectBucket.length > 0) {
      const objTypeName = registerObjectGroup(objectBucket, toPascalCase(hintKey, false))
      resultTypes.push(objTypeName)
    }

    if (arrayBucket.length > 0) {
      const allElements: JsonValue[] = []
      for (const arr of arrayBucket) {
        allElements.push(...arr)
      }
      if (allElements.length === 0) {
        resultTypes.push('unknown[]')
      } else {
        const elemType = inferArrayElementsType(allElements, hintKey)
        resultTypes.push(wrapArrayElement(elemType))
      }
    }

    return buildUnion(resultTypes)
  }

  function inferArrayElementsType(elements: JsonValue[], hintKey: string): string {
    const objectBucket: JsonObject[] = []
    const nestedArrayBucket: JsonValue[][] = []
    const primitiveTypes: string[] = []

    for (const el of elements) {
      if (el === null) {
        primitiveTypes.push('null')
      } else if (Array.isArray(el)) {
        nestedArrayBucket.push(el)
      } else if (isPlainObject(el)) {
        objectBucket.push(el)
      } else {
        primitiveTypes.push(typeof el)
      }
    }

    const resultTypes: string[] = [...primitiveTypes]

    if (objectBucket.length > 0) {
      const itemName = registerObjectGroup(objectBucket, toPascalCase(hintKey, true))
      resultTypes.push(itemName)
    }

    if (nestedArrayBucket.length > 0) {
      const innerElements: JsonValue[] = []
      for (const arr of nestedArrayBucket) {
        innerElements.push(...arr)
      }
      if (innerElements.length === 0) {
        resultTypes.push('unknown[]')
      } else {
        const innerType = inferArrayElementsType(innerElements, hintKey)
        resultTypes.push(wrapArrayElement(innerType))
      }
    }

    return buildUnion(resultTypes)
  }

  const exportPrefix = useExport ? 'export ' : ''

  function renderDefinition(def: NamedDefinition): string {
    const header =
      style === 'interface'
        ? `${exportPrefix}interface ${def.name} {`
        : `${exportPrefix}type ${def.name} = {`

    if (def.fields.size === 0) {
      return style === 'interface'
        ? `${exportPrefix}interface ${def.name} {}`
        : `${exportPrefix}type ${def.name} = {}`
    }

    const lines = Array.from(def.fields.entries()).map(([key, spec]) => {
      const prop = formatPropertyKey(key)
      const opt = spec.optional ? '?' : ''
      return `${indentStr}${prop}${opt}: ${spec.type};`
    })

    return `${header}\n${lines.join('\n')}\n}`
  }

  let rootAliasLine: string | null = null

  if (isPlainObject(parsed)) {
    registerObjectGroup([parsed], rootName, true)
  } else if (Array.isArray(parsed)) {
    usedNames.add(rootName)
    if (parsed.length === 0) {
      rootAliasLine = `${exportPrefix}type ${rootName} = unknown[];`
    } else {
      const elemType = inferArrayElementsType(parsed, rootName)
      rootAliasLine = `${exportPrefix}type ${rootName} = ${wrapArrayElement(elemType)};`
    }
  } else {
    const primType = parsed === null ? 'null' : typeof parsed
    rootAliasLine = `${exportPrefix}type ${rootName} = ${primType};`
  }

  // Put Root definition first, followed by nested definitions in discovery order
  const orderedDefs = [...definitions].sort((a, b) => {
    if (a.name === rootName) return -1
    if (b.name === rootName) return 1
    return 0
  })

  const blocks: string[] = []
  if (rootAliasLine) {
    blocks.push(rootAliasLine)
  }
  for (const def of orderedDefs) {
    blocks.push(renderDefinition(def))
  }

  return {
    code: blocks.join('\n\n'),
    error: null,
  }
}
