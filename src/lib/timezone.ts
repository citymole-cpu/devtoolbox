import type { Language } from './i18n'

export interface TimezoneOption {
  iana: string
  zh: string
  en: string
  ja: string
  keywords: string[]
  common?: boolean
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { iana: 'UTC', zh: '协调世界时 (UTC)', en: 'Coordinated Universal Time (UTC)', ja: '協定世界時 (UTC)', keywords: ['utc', 'gmt', 'z', '世界时', '格林威治'], common: true },
  { iana: 'Asia/Shanghai', zh: '北京 / 上海', en: 'Beijing / Shanghai', ja: '北京 / 上海', keywords: ['beijing', 'shanghai', 'china', 'cst', '北京', '上海', '中国'], common: true },
  { iana: 'Asia/Tokyo', zh: '东京', en: 'Tokyo', ja: '東京', keywords: ['tokyo', 'japan', 'jst', '东京', '東京', '日本'], common: true },
  { iana: 'Europe/London', zh: '伦敦', en: 'London', ja: 'ロンドン', keywords: ['london', 'uk', 'gmt', 'bst', '伦敦', '英国'], common: true },
  { iana: 'America/New_York', zh: '纽约', en: 'New York', ja: 'ニューヨーク', keywords: ['new york', 'nyc', 'est', 'edt', 'us east', '纽约', '美东'], common: true },
  { iana: 'America/Los_Angeles', zh: '洛杉矶', en: 'Los Angeles', ja: 'ロサンゼルス', keywords: ['los angeles', 'la', 'pst', 'pdt', 'us west', '洛杉矶', '美西', '硅谷'], common: true },
  { iana: 'Australia/Sydney', zh: '悉尼', en: 'Sydney', ja: 'シドニー', keywords: ['sydney', 'australia', 'aest', 'aedt', '悉尼', '澳洲'], common: true },
  { iana: 'Asia/Hong_Kong', zh: '香港', en: 'Hong Kong', ja: '香港', keywords: ['hong kong', 'hk', 'hkt', '香港'], common: true },
  { iana: 'Asia/Taipei', zh: '台北', en: 'Taipei', ja: '台北', keywords: ['taipei', 'taiwan', '台北', '台湾'], common: true },
  { iana: 'Asia/Singapore', zh: '新加坡', en: 'Singapore', ja: 'シンガポール', keywords: ['singapore', 'sgt', '新加坡'], common: true },
  { iana: 'Asia/Seoul', zh: '首尔', en: 'Seoul', ja: 'ソウル', keywords: ['seoul', 'korea', 'kst', '首尔', '韩国'], common: true },
  { iana: 'Asia/Bangkok', zh: '曼谷', en: 'Bangkok', ja: 'バンコク', keywords: ['bangkok', 'thailand', 'ict', '曼谷', '泰国'], common: true },
  { iana: 'Asia/Kolkata', zh: '孟买 / 新德里', en: 'Mumbai / New Delhi', ja: 'ムンバイ / ニューデリー', keywords: ['india', 'kolkata', 'mumbai', 'delhi', 'ist', '印度', '孟买', '新德里'], common: true },
  { iana: 'Asia/Dubai', zh: '迪拜', en: 'Dubai', ja: 'ドバイ', keywords: ['dubai', 'uae', 'gst', '迪拜'], common: true },
  { iana: 'Europe/Paris', zh: '巴黎', en: 'Paris', ja: 'パリ', keywords: ['paris', 'france', 'cet', 'cest', '巴黎', '法国'], common: true },
  { iana: 'Europe/Berlin', zh: '柏林', en: 'Berlin', ja: 'ベルリン', keywords: ['berlin', 'germany', 'cet', 'cest', '柏林', '德国'], common: true },
  { iana: 'Europe/Moscow', zh: '莫斯科', en: 'Moscow', ja: 'モスクワ', keywords: ['moscow', 'russia', 'msk', '莫斯科', '俄罗斯'], common: true },
  { iana: 'America/Chicago', zh: '芝加哥', en: 'Chicago', ja: 'シカゴ', keywords: ['chicago', 'cst', 'cdt', 'us central', '芝加哥', '美中'], common: true },
  { iana: 'America/Denver', zh: '丹佛', en: 'Denver', ja: 'デンバー', keywords: ['denver', 'mst', 'mdt', '丹佛'], common: true },
  { iana: 'America/Toronto', zh: '多伦多', en: 'Toronto', ja: 'トロント', keywords: ['toronto', 'canada', 'est', 'edt', '多伦多', '加拿大'], common: true },
  { iana: 'America/Vancouver', zh: '温哥华', en: 'Vancouver', ja: 'バンクーバー', keywords: ['vancouver', 'canada', 'pst', 'pdt', '温哥华', '加拿大'], common: true },
  { iana: 'America/Sao_Paulo', zh: '圣保罗', en: 'São Paulo', ja: 'サンパウロ', keywords: ['sao paulo', 'brazil', 'brt', '圣保罗', '巴西'], common: true },
  { iana: 'Pacific/Auckland', zh: '奥克兰', en: 'Auckland', ja: 'オークランド', keywords: ['auckland', 'new zealand', 'nzst', 'nzdt', '奥克兰', '新西兰'], common: true },
  { iana: 'Pacific/Honolulu', zh: '檀香山', en: 'Honolulu', ja: 'ホノルル', keywords: ['honolulu', 'hawaii', 'hst', '檀香山', '夏威夷'], common: true },
]

let cachedAllTimezones: TimezoneOption[] | null = null

export function getAllTimezones(): TimezoneOption[] {
  if (cachedAllTimezones) return cachedAllTimezones
  const seen = new Set(COMMON_TIMEZONES.map(t => t.iana))
  const extra: TimezoneOption[] = []

  try {
    const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf
    if (typeof supportedValuesOf === 'function') {
      for (const iana of supportedValuesOf('timeZone')) {
        if (seen.has(iana)) continue
        seen.add(iana)
        const label = iana.replace(/_/g, ' ')
        extra.push({
          iana,
          zh: label,
          en: label,
          ja: label,
          keywords: [iana.toLowerCase(), label.toLowerCase()],
          common: false,
        })
      }
    }
  } catch {
    // Fallback to COMMON_TIMEZONES if Intl.supportedValuesOf is unavailable
  }

  cachedAllTimezones = [...COMMON_TIMEZONES, ...extra]
  return cachedAllTimezones
}

export function getTimezoneLabel(iana: string, language: Language): string {
  const found = getAllTimezones().find(t => t.iana === iana)
  if (!found) return iana
  if (language === 'en-US') return found.en
  if (language === 'ja-JP') return found.ja
  return found.zh
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export interface WallTimeParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export function getTimeZoneParts(date: Date, timeZone: string): WallTimeParts {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = dtf.formatToParts(date)
  const map: Record<string, number> = {}
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = Number(part.value)
    }
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour === 24 ? 0 : map.hour,
    minute: map.minute,
    second: map.second,
  }
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const p = getTimeZoneParts(date, timeZone)
  const asUtcMs = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  const realSecMs = Math.floor(date.getTime() / 1000) * 1000
  return Math.round((asUtcMs - realSecMs) / 60000)
}

export function formatOffsetLabel(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hh = pad2(Math.floor(abs / 60))
  const mm = pad2(abs % 60)
  return `UTC${sign}${hh}:${mm}`
}

export function formatIsoOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return 'Z'
  const sign = offsetMinutes > 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  return `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`
}

export function isDaylightSavingTime(date: Date, timeZone: string): boolean {
  const year = date.getUTCFullYear()
  const janOffset = getTimeZoneOffsetMinutes(new Date(Date.UTC(year, 0, 1, 12, 0, 0)), timeZone)
  const julOffset = getTimeZoneOffsetMinutes(new Date(Date.UTC(year, 6, 1, 12, 0, 0)), timeZone)
  if (janOffset === julOffset) return false
  const standardOffset = Math.min(janOffset, julOffset)
  return getTimeZoneOffsetMinutes(date, timeZone) > standardOffset
}

export function getTimeZoneAbbreviation(date: Date, timeZone: string, locale = 'en-US'): string {
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(date)
    return parts.find(p => p.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
  }
}

function isValidCalendarDate(year: number, month: number, day: number, hour: number, minute: number, second: number): boolean {
  if (year < 1900 || year > 2100) return false
  if (month < 1 || month > 12) return false
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return false
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return day >= 1 && day <= maxDay
}

export function zonedWallTimeToDate(parts: WallTimeParts, timeZone: string, ms = 0): { date: Date; isDstGap: boolean } {
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, ms)
  const offset1 = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone)
  const candidate1 = utcGuess - offset1 * 60000
  const offset2 = getTimeZoneOffsetMinutes(new Date(candidate1), timeZone)
  const candidate2 = utcGuess - offset2 * 60000
  const finalDate = new Date(candidate2)

  // Check if wall time fell into a DST spring-forward gap
  const roundTrip = getTimeZoneParts(finalDate, timeZone)
  const isDstGap =
    roundTrip.year !== parts.year ||
    roundTrip.month !== parts.month ||
    roundTrip.day !== parts.day ||
    roundTrip.hour !== parts.hour ||
    roundTrip.minute !== parts.minute

  return { date: finalDate, isDstGap }
}

export type ParseErrorCode = 'empty' | 'format' | 'calendar' | 'invalid_tz'

export interface ParseDateTimeResult {
  ok: boolean
  date?: Date
  errorCode?: ParseErrorCode
  hasExplicitOffset?: boolean
  isDstGap?: boolean
}

const EXPLICIT_ISO_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})$/i

const WALL_TIME_REGEX =
  /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d{1,3}))?)?)?$/

export function parseDateTimeWithZone(input: string, sourceTimeZone: string): ParseDateTimeResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, errorCode: 'empty' }

  // 1. Explicit ISO 8601 with Z or +/-HH:MM offset
  const isoMatch = trimmed.match(EXPLICIT_ISO_REGEX)
  if (isoMatch) {
    const year = Number(isoMatch[1])
    const month = Number(isoMatch[2])
    const day = Number(isoMatch[3])
    const hour = Number(isoMatch[4])
    const minute = Number(isoMatch[5])
    const second = isoMatch[6] ? Number(isoMatch[6]) : 0
    const ms = isoMatch[7] ? Number(isoMatch[7].padEnd(3, '0')) : 0
    const tzToken = isoMatch[8].toUpperCase()

    if (!isValidCalendarDate(year, month, day, hour, minute, second)) {
      return { ok: false, errorCode: 'calendar' }
    }

    let offsetMin = 0
    if (tzToken !== 'Z') {
      const sign = tzToken[0] === '+' ? 1 : -1
      const digits = tzToken.slice(1).replace(':', '')
      const offH = Number(digits.slice(0, 2))
      const offM = Number(digits.slice(2, 4))
      if (offH > 23 || offM > 59) return { ok: false, errorCode: 'format' }
      offsetMin = sign * (offH * 60 + offM)
    }

    const utcMs = Date.UTC(year, month - 1, day, hour, minute, second, ms) - offsetMin * 60000
    const date = new Date(utcMs)
    if (Number.isNaN(date.getTime())) return { ok: false, errorCode: 'format' }
    return { ok: true, date, hasExplicitOffset: true, isDstGap: false }
  }

  // 2. Wall time without offset -> interpret in sourceTimeZone
  const wallMatch = trimmed.match(WALL_TIME_REGEX)
  if (!wallMatch) {
    return { ok: false, errorCode: 'format' }
  }

  const year = Number(wallMatch[1])
  const month = Number(wallMatch[2])
  const day = Number(wallMatch[3])
  const hour = wallMatch[4] ? Number(wallMatch[4]) : 0
  const minute = wallMatch[5] ? Number(wallMatch[5]) : 0
  const second = wallMatch[6] ? Number(wallMatch[6]) : 0
  const ms = wallMatch[7] ? Number(wallMatch[7].padEnd(3, '0')) : 0

  if (!isValidCalendarDate(year, month, day, hour, minute, second)) {
    return { ok: false, errorCode: 'calendar' }
  }

  try {
    const { date, isDstGap } = zonedWallTimeToDate(
      { year, month, day, hour, minute, second },
      sourceTimeZone,
      ms
    )
    if (Number.isNaN(date.getTime())) return { ok: false, errorCode: 'format' }
    return { ok: true, date, hasExplicitOffset: false, isDstGap }
  } catch {
    return { ok: false, errorCode: 'invalid_tz' }
  }
}

export interface ConvertedTimezoneResult {
  timeZone: string
  formatted: string
  dateStr: string
  timeStr: string
  iso: string
  weekday: string
  offsetMinutes: number
  offsetLabel: string
  isDst: boolean
  tzAbbr: string
  dayDiff: number
}

export function formatDateTimeInTimeZone(
  date: Date,
  targetTimeZone: string,
  sourceTimeZone: string,
  language: Language
): ConvertedTimezoneResult {
  const parts = getTimeZoneParts(date, targetTimeZone)
  const srcParts = getTimeZoneParts(date, sourceTimeZone)

  const dateStr = `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`
  const timeStr = `${pad2(parts.hour)}:${pad2(parts.minute)}:${pad2(parts.second)}`
  const formatted = `${dateStr} ${timeStr}`

  const offsetMinutes = getTimeZoneOffsetMinutes(date, targetTimeZone)
  const offsetLabel = formatOffsetLabel(offsetMinutes)
  const iso = `${dateStr}T${timeStr}${formatIsoOffset(offsetMinutes)}`
  const isDst = isDaylightSavingTime(date, targetTimeZone)
  const tzAbbr = getTimeZoneAbbreviation(date, targetTimeZone, 'en-US')

  const weekday = new Intl.DateTimeFormat(language, {
    timeZone: targetTimeZone,
    weekday: 'short',
  }).format(date)

  const targetDayUtc = Date.UTC(parts.year, parts.month - 1, parts.day)
  const sourceDayUtc = Date.UTC(srcParts.year, srcParts.month - 1, srcParts.day)
  const dayDiff = Math.round((targetDayUtc - sourceDayUtc) / 86400000)

  return {
    timeZone: targetTimeZone,
    formatted,
    dateStr,
    timeStr,
    iso,
    weekday,
    offsetMinutes,
    offsetLabel,
    isDst,
    tzAbbr,
    dayDiff,
  }
}

export function formatNowInTimeZone(timeZone: string, now: Date = new Date()): string {
  const p = getTimeZoneParts(now, timeZone)
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)} ${pad2(p.hour)}:${pad2(p.minute)}:${pad2(p.second)}`
}

export function detectLocalTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz) return tz
  } catch {
    // ignore
  }
  return 'Asia/Shanghai'
}
