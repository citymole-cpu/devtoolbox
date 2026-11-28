import CryptoJS from 'crypto-js'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export type TotpDigits = 6 | 8
export type TotpPeriod = 30 | 60

export type Base32ErrorCode =
  | 'EMPTY'
  | 'INVALID_CHARS'
  | 'INVALID_LENGTH'
  | 'INVALID_PADDING'

export interface Base32DecodeResult {
  ok: boolean
  cleaned: string
  bytes?: Uint8Array
  error?: Base32ErrorCode
}

export interface TotpSnapshot {
  current: string
  previous: string | null
  next: string
  remainingSeconds: number
  progress: number
  counter: number
  cleanedSecret: string
}

/**
 * Clean user-supplied Base32 secret: strip whitespace and convert to uppercase.
 */
export function cleanBase32Secret(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase()
}

/**
 * Decode an RFC 4648 Base32 string into raw bytes.
 * Supports spaces and mixed case (cleaned automatically) and optional trailing '=' padding.
 */
export function decodeBase32(raw: string): Base32DecodeResult {
  const cleaned = cleanBase32Secret(raw)
  if (!cleaned) {
    return { ok: false, cleaned, error: 'EMPTY' }
  }

  // Only A-Z, 2-7 and optional trailing '=' are permitted
  if (!/^[A-Z2-7]+=*$/.test(cleaned)) {
    return { ok: false, cleaned, error: 'INVALID_CHARS' }
  }

  // If '=' padding is used, total length must be a multiple of 8
  if (cleaned.includes('=') && cleaned.length % 8 !== 0) {
    return { ok: false, cleaned, error: 'INVALID_PADDING' }
  }

  const unpadded = cleaned.replace(/=+$/, '')
  const rem = unpadded.length % 8
  // RFC 4648 valid unpadded block remainders are 0, 2, 4, 5, 7 (1, 3, 6 are invalid)
  if (unpadded.length === 0 || rem === 1 || rem === 3 || rem === 6) {
    return { ok: false, cleaned: unpadded, error: 'INVALID_LENGTH' }
  }

  const outLength = Math.floor((unpadded.length * 5) / 8)
  const bytes = new Uint8Array(outLength)

  let buffer = 0
  let bitsLeft = 0
  let index = 0

  for (let i = 0; i < unpadded.length; i++) {
    const val = BASE32_ALPHABET.indexOf(unpadded[i])
    if (val === -1) {
      return { ok: false, cleaned: unpadded, error: 'INVALID_CHARS' }
    }
    buffer = (buffer << 5) | val
    bitsLeft += 5
    if (bitsLeft >= 8) {
      bitsLeft -= 8
      bytes[index++] = (buffer >>> bitsLeft) & 0xff
    }
  }

  return { ok: true, cleaned: unpadded, bytes }
}

/**
 * Encode raw bytes to RFC 4648 Base32 (without '=' padding).
 */
export function encodeBase32(bytes: Uint8Array): string {
  let result = ''
  let buffer = 0
  let bitsLeft = 0

  for (let i = 0; i < bytes.length; i++) {
    buffer = (buffer << 8) | bytes[i]
    bitsLeft += 8
    while (bitsLeft >= 5) {
      bitsLeft -= 5
      result += BASE32_ALPHABET[(buffer >>> bitsLeft) & 0x1f]
    }
  }

  if (bitsLeft > 0) {
    result += BASE32_ALPHABET[(buffer << (5 - bitsLeft)) & 0x1f]
  }

  return result
}

/**
 * Generate a cryptographically random Base32 secret (default 20 bytes = 160 bits = 32 Base32 chars).
 */
export function generateRandomBase32Secret(byteLength = 20): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return encodeBase32(bytes)
}

function bytesToWordArray(bytes: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = []
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2] = (words[i >>> 2] || 0) | (bytes[i] << (24 - (i % 4) * 8))
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length)
}

function wordArrayToBytes(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const bytes = new Uint8Array(wordArray.sigBytes)
  for (let i = 0; i < wordArray.sigBytes; i++) {
    bytes[i] = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
  }
  return bytes
}

/**
 * Compute HOTP (RFC 4226) with HMAC-SHA1 using crypto-js for a given 64-bit counter.
 */
export function generateHotpFromBytes(
  keyBytes: Uint8Array,
  counter: number,
  digits: TotpDigits = 6,
): string {
  const counterBytes = new Uint8Array(8)
  const high = Math.floor(counter / 0x100000000)
  const low = counter >>> 0

  counterBytes[0] = (high >>> 24) & 0xff
  counterBytes[1] = (high >>> 16) & 0xff
  counterBytes[2] = (high >>> 8) & 0xff
  counterBytes[3] = high & 0xff
  counterBytes[4] = (low >>> 24) & 0xff
  counterBytes[5] = (low >>> 16) & 0xff
  counterBytes[6] = (low >>> 8) & 0xff
  counterBytes[7] = low & 0xff

  const hmac = CryptoJS.HmacSHA1(
    bytesToWordArray(counterBytes),
    bytesToWordArray(keyBytes),
  )
  const hmacBytes = wordArrayToBytes(hmac)

  // Dynamic truncation (RFC 4226 Section 5.4)
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f
  const binary =
    (((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff)) >>>
    0

  const mod = Math.pow(10, digits)
  return (binary % mod).toString().padStart(digits, '0')
}

/**
 * Compute TOTP (RFC 6238, SHA-1) for a Base32 secret at a specific Unix timestamp in seconds.
 */
export function generateTotp(
  base32Secret: string,
  options?: {
    digits?: TotpDigits
    period?: TotpPeriod
    timestampSec?: number
  },
): string {
  const decoded = decodeBase32(base32Secret)
  if (!decoded.ok || !decoded.bytes) {
    throw new Error(decoded.error || 'INVALID_SECRET')
  }
  const digits = options?.digits ?? 6
  const period = options?.period ?? 30
  const timestampSec = options?.timestampSec ?? Math.floor(Date.now() / 1000)
  const counter = Math.floor(timestampSec / period)
  return generateHotpFromBytes(decoded.bytes, counter, digits)
}

/**
 * Compute current, previous, and next TOTP codes along with remaining seconds & progress (0..1).
 */
export function computeTotpSnapshot(
  base32Secret: string,
  digits: TotpDigits = 6,
  period: TotpPeriod = 30,
  nowMs: number = Date.now(),
): { ok: true; data: TotpSnapshot } | { ok: false; error: Base32ErrorCode } {
  const decoded = decodeBase32(base32Secret)
  if (!decoded.ok || !decoded.bytes) {
    return { ok: false, error: decoded.error || 'INVALID_CHARS' }
  }

  const nowSec = nowMs / 1000
  const counter = Math.floor(nowSec / period)
  const elapsed = nowSec - counter * period
  const remainingExact = Math.max(0, period - elapsed)
  const remainingSeconds = Math.ceil(remainingExact) || period
  const progress = Math.min(1, Math.max(0, remainingExact / period))

  const current = generateHotpFromBytes(decoded.bytes, counter, digits)
  const previous =
    counter > 0 ? generateHotpFromBytes(decoded.bytes, counter - 1, digits) : null
  const next = generateHotpFromBytes(decoded.bytes, counter + 1, digits)

  return {
    ok: true,
    data: {
      current,
      previous,
      next,
      remainingSeconds,
      progress,
      counter,
      cleanedSecret: decoded.cleaned,
    },
  }
}

/**
 * Format OTP code with a middle space for readability (e.g. "123 456" or "1234 5678").
 */
export function formatOtpDisplay(code: string): string {
  const half = Math.floor(code.length / 2)
  return `${code.slice(0, half)} ${code.slice(half)}`
}
