import { useCallback, useMemo, useState } from 'react'
import { ArrowLeftRight, Sparkles, Trash2 } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'
import { useI18n } from '../../components/I18nProvider'

type EncodingScheme = 'base32' | 'base58'
type Direction = 'encode' | 'decode'
type DataMode = 'utf8' | 'hex'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const BASE32_MAP = new Map<string, number>(
  Array.from(BASE32_ALPHABET).map((ch, idx) => [ch, idx])
)

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE58_MAP = new Map<string, number>(
  Array.from(BASE58_ALPHABET).map((ch, idx) => [ch, idx])
)

export class CodecError extends Error {
  code:
    | 'INVALID_HEX_CHAR'
    | 'INVALID_HEX_LENGTH'
    | 'INVALID_BASE32_CHAR'
    | 'INVALID_BASE32_PADDING'
    | 'INVALID_BASE32_LENGTH'
    | 'INVALID_BASE58_CHAR'
    | 'INVALID_UTF8'
  detail?: string

  constructor(
    code: CodecError['code'],
    detail?: string
  ) {
    super(code)
    this.code = code
    this.detail = detail
  }
}

export function hexToBytes(hexInput: string): Uint8Array {
  const cleaned = hexInput.replace(/0x/gi, '').replace(/[\s:_-]+/g, '')
  if (cleaned.length === 0) return new Uint8Array(0)
  const badMatch = cleaned.match(/[^0-9a-fA-F]/)
  if (badMatch) {
    throw new CodecError('INVALID_HEX_CHAR', badMatch[0])
  }
  if (cleaned.length % 2 !== 0) {
    throw new CodecError('INVALID_HEX_LENGTH', String(cleaned.length))
  }
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0')
  }
  return out
}

export function encodeBase32(bytes: Uint8Array, usePadding = true): string {
  if (bytes.length === 0) return ''
  let bits = 0
  let value = 0
  let output = ''
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }
  if (usePadding) {
    const rem = output.length % 8
    if (rem !== 0) {
      output += '='.repeat(8 - rem)
    }
  }
  return output
}

export function decodeBase32(input: string): Uint8Array {
  const cleaned = input.replace(/\s+/g, '').toUpperCase()
  if (cleaned.length === 0) return new Uint8Array(0)

  const firstPad = cleaned.indexOf('=')
  let body = cleaned
  if (firstPad !== -1) {
    if (cleaned.length % 8 !== 0) {
      throw new CodecError('INVALID_BASE32_PADDING')
    }
    const padPart = cleaned.slice(firstPad)
    if (!/^=+$/.test(padPart) || ![1, 3, 4, 6].includes(padPart.length)) {
      throw new CodecError('INVALID_BASE32_PADDING')
    }
    body = cleaned.slice(0, firstPad)
  }

  const mod = body.length % 8
  if (mod === 1 || mod === 3 || mod === 6) {
    throw new CodecError('INVALID_BASE32_LENGTH', String(body.length))
  }

  const output: number[] = []
  let bits = 0
  let value = 0
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    const idx = BASE32_MAP.get(ch)
    if (idx === undefined) {
      throw new CodecError('INVALID_BASE32_CHAR', ch)
    }
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(output)
}

export function encodeBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return ''
  let zeros = 0
  while (zeros < bytes.length && bytes[zeros] === 0) {
    zeros++
  }

  const size = Math.floor(((bytes.length - zeros) * 138) / 100) + 1
  const b58 = new Uint8Array(size)
  let length = 0

  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i]
    let j = 0
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 256 * b58[k]
      b58[k] = carry % 58
      carry = Math.floor(carry / 58)
    }
    length = j
  }

  let it = size - length
  while (it < size && b58[it] === 0) {
    it++
  }

  let result = '1'.repeat(zeros)
  for (; it < size; it++) {
    result += BASE58_ALPHABET[b58[it]]
  }
  return result
}

export function decodeBase58(input: string): Uint8Array {
  const cleaned = input.replace(/\s+/g, '')
  if (cleaned.length === 0) return new Uint8Array(0)

  let zeros = 0
  while (zeros < cleaned.length && cleaned[zeros] === '1') {
    zeros++
  }

  const size = Math.floor(((cleaned.length - zeros) * 733) / 1000) + 1
  const b256 = new Uint8Array(size)
  let length = 0

  for (let i = zeros; i < cleaned.length; i++) {
    const ch = cleaned[i]
    const val = BASE58_MAP.get(ch)
    if (val === undefined) {
      throw new CodecError('INVALID_BASE58_CHAR', ch)
    }
    let carry = val
    let j = 0
    for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
      carry += 58 * b256[k]
      b256[k] = carry & 0xff
      carry >>= 8
    }
    length = j
  }

  let it = size - length
  while (it < size && b256[it] === 0) {
    it++
  }

  const out = new Uint8Array(zeros + (size - it))
  let pos = zeros
  while (it < size) {
    out[pos++] = b256[it++]
  }
  return out
}

const SAMPLE_UTF8 = '你好，世界！Hello DevToolBox — Base32 & Base58'
const SAMPLE_HEX = '000068656c6c6f20776f726c64'

export default function Base32Base58() {
  const { language } = useI18n()
  const [scheme, setScheme] = useState<EncodingScheme>('base32')
  const [direction, setDirection] = useState<Direction>('encode')
  const [dataMode, setDataMode] = useState<DataMode>('utf8')
  const [usePadding, setUsePadding] = useState(true)
  const [input, setInput] = useState('')

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        schemeLabel: 'Encoding',
        base32Label: 'Base32 (RFC 4648)',
        base58Label: 'Base58 (Bitcoin)',
        encode: 'Encode',
        decode: 'Decode',
        dataModeLabel: 'Data Format',
        utf8Mode: 'UTF-8 Text',
        hexMode: 'Hex',
        paddingLabel: 'Include "=" Padding',
        fillSample: 'Load Sample',
        swapDirection: 'Swap Direction',
        clear: 'Clear',
        rawText: 'Plain Text (UTF-8)',
        rawHex: 'Hex Bytes',
        encodedLabel: (s: EncodingScheme) => (s === 'base32' ? 'Base32' : 'Base58'),
        inputPlaceholderEncodeUtf8: 'Enter UTF-8 text to encode...',
        inputPlaceholderEncodeHex: 'Enter hex bytes to encode, e.g. 000068656c6c6f...',
        inputPlaceholderDecode: (s: EncodingScheme) =>
          s === 'base32'
            ? 'Enter Base32 string (A-Z, 2-7, optional =)...'
            : 'Enter Base58 string (Bitcoin alphabet)...',
        bytesCount: (n: number) => `${n} bytes`,
        alphabetHintTitle: (s: EncodingScheme) =>
          s === 'base32' ? 'Base32 (RFC 4648) Specification' : 'Base58 (Bitcoin) Specification',
        alphabetHintDesc: (s: EncodingScheme) =>
          s === 'base32'
            ? 'Uses A-Z and 2-7 (32 characters, case-insensitive on decode). Optional "=" padding aligns output to 8-character blocks.'
            : 'Uses Bitcoin alphabet (excludes 0, O, I, l to avoid visual ambiguity). Leading 0x00 bytes are preserved as leading "1" characters.',
        errors: {
          INVALID_HEX_CHAR: (ch?: string) => `Invalid hex character: "${ch ?? ''}". Only 0-9 and A-F are allowed.`,
          INVALID_HEX_LENGTH: (len?: string) => `Hex input must have an even number of digits (got ${len ?? 0}).`,
          INVALID_BASE32_CHAR: (ch?: string) => `Invalid Base32 character: "${ch ?? ''}". Expected A-Z or 2-7.`,
          INVALID_BASE32_PADDING: () => 'Invalid Base32 "=" padding format.',
          INVALID_BASE32_LENGTH: () => 'Invalid Base32 length (incomplete trailing quantum).',
          INVALID_BASE58_CHAR: (ch?: string) => `Invalid Base58 character: "${ch ?? ''}". Characters 0, O, I, l and symbols are not allowed.`,
          INVALID_UTF8: () => 'Decoded bytes are not valid UTF-8. Switch Data Format to "Hex" to inspect raw bytes.',
          UNKNOWN: () => 'Conversion failed.',
        },
      }
    }
    if (language === 'ja-JP') {
      return {
        schemeLabel: 'エンコード方式',
        base32Label: 'Base32 (RFC 4648)',
        base58Label: 'Base58 (Bitcoin)',
        encode: 'エンコード',
        decode: 'デコード',
        dataModeLabel: 'データ形式',
        utf8Mode: 'UTF-8 テキスト',
        hexMode: '16進数 (Hex)',
        paddingLabel: '"=" パディングを付与',
        fillSample: 'サンプルを入力',
        swapDirection: '方向を入れ替え',
        clear: 'クリア',
        rawText: '元のテキスト (UTF-8)',
        rawHex: '16進数バイト列 (Hex)',
        encodedLabel: (s: EncodingScheme) => (s === 'base32' ? 'Base32' : 'Base58'),
        inputPlaceholderEncodeUtf8: 'エンコードする UTF-8 テキストを入力...',
        inputPlaceholderEncodeHex: 'エンコードする16進数バイト列を入力（例: 000068656c6c6f）...',
        inputPlaceholderDecode: (s: EncodingScheme) =>
          s === 'base32'
            ? 'Base32 文字列を入力（A-Z, 2-7, 任意の =）...'
            : 'Base58 文字列を入力（Bitcoin アルファベット）...',
        bytesCount: (n: number) => `${n} バイト`,
        alphabetHintTitle: (s: EncodingScheme) =>
          s === 'base32' ? 'Base32 (RFC 4648) 仕様' : 'Base58 (Bitcoin) 仕様',
        alphabetHintDesc: (s: EncodingScheme) =>
          s === 'base32'
            ? 'A-Z と 2-7 の32文字を使用します（デコード時は大文字小文字を区別しません）。パディング "=" あり/なしに対応しています。'
            : 'Bitcoin アルファベット（0, O, I, l を除外）を使用します。先頭の 0x00 バイトは先頭の "1" として保持されます。',
        errors: {
          INVALID_HEX_CHAR: (ch?: string) => `無効な16進数文字です: "${ch ?? ''}"（0-9, A-F のみ使用可能）。`,
          INVALID_HEX_LENGTH: (len?: string) => `16進数入力は偶数桁である必要があります（現在 ${len ?? 0} 桁）。`,
          INVALID_BASE32_CHAR: (ch?: string) => `無効な Base32 文字です: "${ch ?? ''}"（A-Z, 2-7 のみ有効）。`,
          INVALID_BASE32_PADDING: () => 'Base32 の "=" パディング形式が不正です。',
          INVALID_BASE32_LENGTH: () => 'Base32 文字列の長さが不正です。',
          INVALID_BASE58_CHAR: (ch?: string) => `無効な Base58 文字です: "${ch ?? ''}"（0, O, I, l や記号は使用不可）。`,
          INVALID_UTF8: () => 'デコード結果が有効な UTF-8 ではありません。データ形式を「16進数 (Hex)」に切り替えてください。',
          UNKNOWN: () => '変換に失敗しました。',
        },
      }
    }
    return {
      schemeLabel: '编码方式',
      base32Label: 'Base32 (RFC 4648)',
      base58Label: 'Base58 (Bitcoin)',
      encode: '编码',
      decode: '解码',
      dataModeLabel: '数据格式',
      utf8Mode: 'UTF-8 文本',
      hexMode: '十六进制 (Hex)',
      paddingLabel: '使用 "=" 填充',
      fillSample: '填入示例',
      swapDirection: '交换方向',
      clear: '清空',
      rawText: '原始文本 (UTF-8)',
      rawHex: '十六进制字节 (Hex)',
      encodedLabel: (s: EncodingScheme) => (s === 'base32' ? 'Base32' : 'Base58'),
      inputPlaceholderEncodeUtf8: '请输入要编码的 UTF-8 文本...',
      inputPlaceholderEncodeHex: '请输入十六进制字节，例如 000068656c6c6f...',
      inputPlaceholderDecode: (s: EncodingScheme) =>
        s === 'base32'
          ? '请输入 Base32 字符串（A-Z、2-7，可选 = 填充）...'
          : '请输入 Base58 字符串（Bitcoin 字母表）...',
      bytesCount: (n: number) => `${n} 字节`,
      alphabetHintTitle: (s: EncodingScheme) =>
        s === 'base32' ? 'Base32 (RFC 4648) 说明' : 'Base58 (Bitcoin) 说明',
      alphabetHintDesc: (s: EncodingScheme) =>
        s === 'base32'
          ? '采用 RFC 4648 标准字母表（A-Z、2-7），解码时不区分大小写，支持有/无 "=" 填充。'
          : '采用 Bitcoin 标准字母表（剔除易混淆字符 0、O、I、l），自动将前导 0x00 字节映射为前缀 "1" 并无损还原。',
      errors: {
        INVALID_HEX_CHAR: (ch?: string) => `包含非法十六进制字符：“${ch ?? ''}”，仅支持 0-9 与 A-F。`,
        INVALID_HEX_LENGTH: (len?: string) => `十六进制字符长度必须为偶数（当前 ${len ?? 0} 位）。`,
        INVALID_BASE32_CHAR: (ch?: string) => `包含非法 Base32 字符：“${ch ?? ''}”，仅允许 A-Z 与 2-7。`,
        INVALID_BASE32_PADDING: () => 'Base32 的 "=" 填充格式不正确。',
        INVALID_BASE32_LENGTH: () => 'Base32 长度不合法，无法构成完整字节序列。',
        INVALID_BASE58_CHAR: (ch?: string) => `包含非法 Base58 字符：“${ch ?? ''}”（不包含 0、O、I、l 及符号）。`,
        INVALID_UTF8: () => '解码得到的字节不是有效的 UTF-8 文本，请切换数据格式为「十六进制 (Hex)」查看原始字节。',
        UNKNOWN: () => '转换失败。',
      },
    }
  }, [language])

  const { output, error, byteLength } = useMemo(() => {
    if (!input) {
      return { output: '', error: '', byteLength: 0 }
    }
    try {
      if (direction === 'encode') {
        const bytes =
          dataMode === 'utf8' ? new TextEncoder().encode(input) : hexToBytes(input)
        const encoded =
          scheme === 'base32' ? encodeBase32(bytes, usePadding) : encodeBase58(bytes)
        return { output: encoded, error: '', byteLength: bytes.length }
      } else {
        const bytes = scheme === 'base32' ? decodeBase32(input) : decodeBase58(input)
        if (dataMode === 'hex') {
          return { output: bytesToHex(bytes), error: '', byteLength: bytes.length }
        }
        try {
          const decodedText = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
          return { output: decodedText, error: '', byteLength: bytes.length }
        } catch {
          throw new CodecError('INVALID_UTF8')
        }
      }
    } catch (err) {
      if (err instanceof CodecError) {
        const formatter = ui.errors[err.code]
        return { output: '', error: formatter(err.detail), byteLength: 0 }
      }
      return {
        output: '',
        error: err instanceof Error ? err.message : ui.errors.UNKNOWN(),
        byteLength: 0,
      }
    }
  }, [input, direction, dataMode, scheme, usePadding, ui])

  const handleSwap = useCallback(() => {
    const nextDir: Direction = direction === 'encode' ? 'decode' : 'encode'
    setDirection(nextDir)
    if (output) {
      setInput(output)
    }
  }, [direction, output])

  const handleLoadSample = useCallback(() => {
    if (direction === 'encode') {
      setInput(dataMode === 'utf8' ? SAMPLE_UTF8 : SAMPLE_HEX)
    } else {
      const bytes =
        dataMode === 'utf8'
          ? new TextEncoder().encode(SAMPLE_UTF8)
          : hexToBytes(SAMPLE_HEX)
      const encoded =
        scheme === 'base32' ? encodeBase32(bytes, usePadding) : encodeBase58(bytes)
      setInput(encoded)
    }
  }, [direction, dataMode, scheme, usePadding])

  const rawLabel = dataMode === 'utf8' ? ui.rawText : ui.rawHex
  const encodedLabel = ui.encodedLabel(scheme)
  const inputPlaceholder =
    direction === 'encode'
      ? dataMode === 'utf8'
        ? ui.inputPlaceholderEncodeUtf8
        : ui.inputPlaceholderEncodeHex
      : ui.inputPlaceholderDecode(scheme)

  return (
    <ToolPage
      title="Base32 / Base58 编解码"
      description="Base32 (RFC 4648) 与 Base58 (Bitcoin) 实时双向编解码，支持 UTF-8 文本与十六进制模式"
    >
      <div className="card p-6 flex flex-col gap-5">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Scheme switch */}
            <div className="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setScheme('base32')}
                className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                  scheme === 'base32'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {ui.base32Label}
              </button>
              <button
                type="button"
                onClick={() => setScheme('base58')}
                className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                  scheme === 'base58'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {ui.base58Label}
              </button>
            </div>

            {/* Direction switch */}
            <div className="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setDirection('encode')}
                className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                  direction === 'encode'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {ui.encode}
              </button>
              <button
                type="button"
                onClick={() => setDirection('decode')}
                className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                  direction === 'decode'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {ui.decode}
              </button>
            </div>

            {/* Data mode switch */}
            <div className="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setDataMode('utf8')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  dataMode === 'utf8'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {ui.utf8Mode}
              </button>
              <button
                type="button"
                onClick={() => setDataMode('hex')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  dataMode === 'hex'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {ui.hexMode}
              </button>
            </div>

            {/* Base32 padding option */}
            {scheme === 'base32' && (
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={usePadding}
                  onChange={(e) => setUsePadding(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                {ui.paddingLabel}
              </label>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {byteLength > 0 && !error && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {ui.bytesCount(byteLength)}
              </span>
            )}
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {ui.fillSample}
            </button>
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {ui.swapDirection}
            </button>
            <button
              type="button"
              onClick={() => setInput('')}
              disabled={!input}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {ui.clear}
            </button>
          </div>
        </div>

        {/* Dual Editor */}
        <DualEditor
          input={input}
          output={output}
          onInputChange={setInput}
          inputLabel={direction === 'encode' ? rawLabel : encodedLabel}
          outputLabel={direction === 'encode' ? encodedLabel : rawLabel}
          inputPlaceholder={inputPlaceholder}
          error={error}
          swappable={true}
          onSwap={handleSwap}
          outputFilename={
            direction === 'encode'
              ? `${scheme}-encoded.txt`
              : dataMode === 'hex'
                ? 'decoded-hex.txt'
                : 'decoded.txt'
          }
        />

        {/* Spec note */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {ui.alphabetHintTitle(scheme)}
          </div>
          <p className="leading-relaxed">{ui.alphabetHintDesc(scheme)}</p>
        </div>
      </div>
    </ToolPage>
  )
}
