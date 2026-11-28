export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface ParsedColor {
  rgb: RgbColor
  hex: string
  rgbString: string
}

export type ColorParseError = 'empty' | 'invalid'

export type ColorParseResult =
  | { ok: true; color: ParsedColor }
  | { ok: false; error: ColorParseError }

export interface WcagRatings {
  aaNormal: boolean
  aaLarge: boolean
  aaaNormal: boolean
  aaaLarge: boolean
}

export interface ContrastResult {
  ratio: number
  ratioText: string
  fgLuminance: number
  bgLuminance: number
  ratings: WcagRatings
  level: 'AAA' | 'AA' | 'AA-Large' | 'Fail'
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function formatRgb({ r, g, b }: RgbColor): string {
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Parse HEX (#RGB, #RRGGBB, RGB, RRGGBB) or RGB (rgb(r, g, b), rgb(r g b), r, g, b) strings.
 */
export function parseColorInput(raw: string): ColorParseResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, error: 'empty' }
  }

  // Try HEX format: optional #, 3 or 6 hex digits
  const hexMatch = trimmed.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (hexMatch) {
    let digits = hexMatch[1]
    if (digits.length === 3) {
      digits = digits
        .split('')
        .map(ch => ch + ch)
        .join('')
    }
    const r = parseInt(digits.slice(0, 2), 16)
    const g = parseInt(digits.slice(2, 4), 16)
    const b = parseInt(digits.slice(4, 6), 16)
    const rgb = { r, g, b }
    return {
      ok: true,
      color: {
        rgb,
        hex: rgbToHex(rgb),
        rgbString: formatRgb(rgb),
      },
    }
  }

  // Try rgb(r, g, b) or rgb(r g b)
  const rgbFuncMatch = trimmed.match(
    /^rgb\(\s*(\d{1,3})\s*(?:,\s*|\s+)(\d{1,3})\s*(?:,\s*|\s+)(\d{1,3})\s*\)$/i
  )
  // Or plain "r, g, b"
  const rgbPlainMatch = !rgbFuncMatch
    ? trimmed.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/)
    : null

  const match = rgbFuncMatch || rgbPlainMatch
  if (match) {
    const r = Number(match[1])
    const g = Number(match[2])
    const b = Number(match[3])
    if (
      Number.isInteger(r) &&
      Number.isInteger(g) &&
      Number.isInteger(b) &&
      r >= 0 &&
      r <= 255 &&
      g >= 0 &&
      g <= 255 &&
      b >= 0 &&
      b <= 255
    ) {
      const rgb = { r, g, b }
      return {
        ok: true,
        color: {
          rgb,
          hex: rgbToHex(rgb),
          rgbString: formatRgb(rgb),
        },
      }
    }
  }

  return { ok: false, error: 'invalid' }
}

/**
 * WCAG 2.1 relative luminance (0 to 1)
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance({ r, g, b }: RgbColor): number {
  const linearize = (channel: number) => {
    const srgb = channel / 255
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  }
  const R = linearize(r)
  const G = linearize(g)
  const B = linearize(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/**
 * WCAG 2.1 contrast ratio (1 to 21)
 */
export function calculateContrast(fg: RgbColor, bg: RgbColor): ContrastResult {
  const fgLuminance = getRelativeLuminance(fg)
  const bgLuminance = getRelativeLuminance(bg)
  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)
  const ratio = (lighter + 0.05) / (darker + 0.05)

  const ratings: WcagRatings = {
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  }

  let level: ContrastResult['level'] = 'Fail'
  if (ratings.aaaNormal) {
    level = 'AAA'
  } else if (ratings.aaNormal) {
    level = 'AA'
  } else if (ratings.aaLarge) {
    level = 'AA-Large'
  }

  return {
    ratio,
    ratioText: `${ratio.toFixed(2)}:1`,
    fgLuminance,
    bgLuminance,
    ratings,
    level,
  }
}
