import type { Language } from './i18n'
import {
  formatISODate,
  getTodayISO,
  getWeekdayLabel,
  parseISODate,
  type ParsedDate,
} from './dateCalculator'

export type AgeErrorCode =
  | 'empty_birth'
  | 'invalid_birth'
  | 'invalid_target'
  | 'birth_in_future'
  | 'birth_after_target'

export interface ZodiacSignInfo {
  id: string
  symbol: string
  range: string
  names: Record<Language, string>
}

export interface ChineseZodiacInfo {
  id: string
  emoji: string
  names: Record<Language, string>
}

export interface NextBirthdayInfo {
  date: ParsedDate
  daysUntil: number
  isToday: boolean
  upcomingAge: number
  isLeapBirth: boolean
  /** True when birth is Feb 29 and next birthday falls on Feb 28 in a non-leap year */
  observedOnFeb28: boolean
  /** For Feb 29 births, the next actual Feb 29 leap-day date and countdown */
  nextTrueLeapBirthday?: {
    date: ParsedDate
    daysUntil: number
  }
}

export interface AgeCalculationResult {
  ok: true
  birth: ParsedDate
  target: ParsedDate
  years: number
  months: number
  days: number
  totalDays: number
  totalWeeks: number
  remainingDaysInWeeks: number
  totalWeeksDecimal: number
  totalMonths: number
  remainingDaysInMonths: number
  totalMonthsDecimal: number
  totalHours: number
  birthWeekday: number
  nextBirthday: NextBirthdayInfo
  chineseZodiac: ChineseZodiacInfo
  zodiacSign: ZodiacSignInfo
}

export interface AgeCalculationError {
  ok: false
  error: AgeErrorCode
}

const MS_PER_DAY = 86_400_000

const CHINESE_ZODIAC_LIST: readonly ChineseZodiacInfo[] = [
  { id: 'rat', emoji: '🐭', names: { 'zh-CN': '鼠', 'en-US': 'Rat', 'ja-JP': '子（ねずみ）' } },
  { id: 'ox', emoji: '🐮', names: { 'zh-CN': '牛', 'en-US': 'Ox', 'ja-JP': '丑（うし）' } },
  { id: 'tiger', emoji: '🐯', names: { 'zh-CN': '虎', 'en-US': 'Tiger', 'ja-JP': '寅（とら）' } },
  { id: 'rabbit', emoji: '🐰', names: { 'zh-CN': '兔', 'en-US': 'Rabbit', 'ja-JP': '卯（うさぎ）' } },
  { id: 'dragon', emoji: '🐲', names: { 'zh-CN': '龙', 'en-US': 'Dragon', 'ja-JP': '辰（たつ）' } },
  { id: 'snake', emoji: '🐍', names: { 'zh-CN': '蛇', 'en-US': 'Snake', 'ja-JP': '巳（へび）' } },
  { id: 'horse', emoji: '🐴', names: { 'zh-CN': '马', 'en-US': 'Horse', 'ja-JP': '午（うま）' } },
  { id: 'goat', emoji: '🐑', names: { 'zh-CN': '羊', 'en-US': 'Goat', 'ja-JP': '未（ひつじ）' } },
  { id: 'monkey', emoji: '🐵', names: { 'zh-CN': '猴', 'en-US': 'Monkey', 'ja-JP': '申（さる）' } },
  { id: 'rooster', emoji: '🐔', names: { 'zh-CN': '鸡', 'en-US': 'Rooster', 'ja-JP': '酉（とり）' } },
  { id: 'dog', emoji: '🐶', names: { 'zh-CN': '狗', 'en-US': 'Dog', 'ja-JP': '戌（いぬ）' } },
  { id: 'pig', emoji: '🐷', names: { 'zh-CN': '猪', 'en-US': 'Pig', 'ja-JP': '亥（いのしし）' } },
]

const WESTERN_ZODIAC_LIST: readonly (ZodiacSignInfo & { startMonth: number; startDay: number })[] = [
  { id: 'capricorn', symbol: '♑', range: '12/22 – 01/19', startMonth: 12, startDay: 22, names: { 'zh-CN': '摩羯座', 'en-US': 'Capricorn', 'ja-JP': '山羊座' } },
  { id: 'aquarius', symbol: '♒', range: '01/20 – 02/18', startMonth: 1, startDay: 20, names: { 'zh-CN': '水瓶座', 'en-US': 'Aquarius', 'ja-JP': '水瓶座' } },
  { id: 'pisces', symbol: '♓', range: '02/19 – 03/20', startMonth: 2, startDay: 19, names: { 'zh-CN': '双鱼座', 'en-US': 'Pisces', 'ja-JP': '魚座' } },
  { id: 'aries', symbol: '♈', range: '03/21 – 04/19', startMonth: 3, startDay: 21, names: { 'zh-CN': '白羊座', 'en-US': 'Aries', 'ja-JP': '牡羊座' } },
  { id: 'taurus', symbol: '♉', range: '04/20 – 05/20', startMonth: 4, startDay: 20, names: { 'zh-CN': '金牛座', 'en-US': 'Taurus', 'ja-JP': '牡牛座' } },
  { id: 'gemini', symbol: '♊', range: '05/21 – 06/21', startMonth: 5, startDay: 21, names: { 'zh-CN': '双子座', 'en-US': 'Gemini', 'ja-JP': '双子座' } },
  { id: 'cancer', symbol: '♋', range: '06/22 – 07/22', startMonth: 6, startDay: 22, names: { 'zh-CN': '巨蟹座', 'en-US': 'Cancer', 'ja-JP': '蟹座' } },
  { id: 'leo', symbol: '♌', range: '07/23 – 08/22', startMonth: 7, startDay: 23, names: { 'zh-CN': '狮子座', 'en-US': 'Leo', 'ja-JP': '獅子座' } },
  { id: 'virgo', symbol: '♍', range: '08/23 – 09/22', startMonth: 8, startDay: 23, names: { 'zh-CN': '处女座', 'en-US': 'Virgo', 'ja-JP': '乙女座' } },
  { id: 'libra', symbol: '♎', range: '09/23 – 10/23', startMonth: 9, startDay: 23, names: { 'zh-CN': '天秤座', 'en-US': 'Libra', 'ja-JP': '天秤座' } },
  { id: 'scorpio', symbol: '♏', range: '10/24 – 11/22', startMonth: 10, startDay: 24, names: { 'zh-CN': '天蝎座', 'en-US': 'Scorpio', 'ja-JP': '蠍座' } },
  { id: 'sagittarius', symbol: '♐', range: '11/23 – 12/21', startMonth: 11, startDay: 23, names: { 'zh-CN': '射手座', 'en-US': 'Sagittarius', 'ja-JP': '射手座' } },
]

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Parse flexible user date input (YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD) strictly against calendar validity.
 */
export function parseFlexibleDate(input: string): ParsedDate | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(trimmed)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1 || year > 9999) return null
  return parseISODate(formatISODate(year, month, day))
}

/**
 * Chinese Zodiac by Gregorian birth year: (year - 4) mod 12.
 */
export function getChineseZodiac(year: number): ChineseZodiacInfo {
  const idx = (((year - 4) % 12) + 12) % 12
  return CHINESE_ZODIAC_LIST[idx]
}

/**
 * Western Zodiac sign by Gregorian birth month & day.
 */
export function getZodiacSign(month: number, day: number): ZodiacSignInfo {
  const md = month * 100 + day
  if (md >= 1222 || md <= 119) return WESTERN_ZODIAC_LIST[0] // Capricorn
  if (md >= 120 && md <= 218) return WESTERN_ZODIAC_LIST[1] // Aquarius
  if (md >= 219 && md <= 320) return WESTERN_ZODIAC_LIST[2] // Pisces
  if (md >= 321 && md <= 419) return WESTERN_ZODIAC_LIST[3] // Aries
  if (md >= 420 && md <= 520) return WESTERN_ZODIAC_LIST[4] // Taurus
  if (md >= 521 && md <= 621) return WESTERN_ZODIAC_LIST[5] // Gemini
  if (md >= 622 && md <= 722) return WESTERN_ZODIAC_LIST[6] // Cancer
  if (md >= 723 && md <= 822) return WESTERN_ZODIAC_LIST[7] // Leo
  if (md >= 823 && md <= 922) return WESTERN_ZODIAC_LIST[8] // Virgo
  if (md >= 923 && md <= 1023) return WESTERN_ZODIAC_LIST[9] // Libra
  if (md >= 1024 && md <= 1122) return WESTERN_ZODIAC_LIST[10] // Scorpio
  return WESTERN_ZODIAC_LIST[11] // Sagittarius
}

function getBirthdayInYear(birthMonth: number, birthDay: number, year: number): { date: ParsedDate; observedOnFeb28: boolean } {
  const isLeapBirth = birthMonth === 2 && birthDay === 29
  if (isLeapBirth && !isLeapYear(year)) {
    const d = parseISODate(formatISODate(year, 2, 28))!
    return { date: d, observedOnFeb28: true }
  }
  const d = parseISODate(formatISODate(year, birthMonth, birthDay))!
  return { date: d, observedOnFeb28: false }
}

function findNextTrueLeapBirthday(target: ParsedDate): { date: ParsedDate; daysUntil: number } {
  let y = target.year
  if (isLeapYear(y)) {
    const candidate = parseISODate(formatISODate(y, 2, 29))!
    if (candidate.utcMs >= target.utcMs) {
      return {
        date: candidate,
        daysUntil: Math.round((candidate.utcMs - target.utcMs) / MS_PER_DAY),
      }
    }
  }
  y += 1
  while (!isLeapYear(y)) {
    y += 1
  }
  const nextLeap = parseISODate(formatISODate(y, 2, 29))!
  return {
    date: nextLeap,
    daysUntil: Math.round((nextLeap.utcMs - target.utcMs) / MS_PER_DAY),
  }
}

export function calculateAge(
  birthStr: string,
  targetStr?: string,
  defaultTodayStr?: string
): AgeCalculationResult | AgeCalculationError {
  if (!birthStr.trim()) {
    return { ok: false, error: 'empty_birth' }
  }

  const birth = parseFlexibleDate(birthStr)
  if (!birth) {
    return { ok: false, error: 'invalid_birth' }
  }

  const usingDefaultTarget = !targetStr || !targetStr.trim()
  const resolvedTargetStr = usingDefaultTarget ? (defaultTodayStr ?? getTodayISO()) : targetStr
  const target = parseFlexibleDate(resolvedTargetStr)
  if (!target) {
    return { ok: false, error: 'invalid_target' }
  }

  if (birth.utcMs > target.utcMs) {
    return {
      ok: false,
      error: usingDefaultTarget ? 'birth_in_future' : 'birth_after_target',
    }
  }

  const totalDays = Math.round((target.utcMs - birth.utcMs) / MS_PER_DAY)
  const totalWeeks = Math.floor(totalDays / 7)
  const remainingDaysInWeeks = totalDays % 7
  const totalWeeksDecimal = Number((totalDays / 7).toFixed(2))
  const totalHours = totalDays * 24

  let years = target.year - birth.year
  let months = target.month - birth.month
  let days = target.day - birth.day

  if (days < 0) {
    months -= 1
    const prevMonthDays = new Date(Date.UTC(target.year, target.month - 1, 0)).getUTCDate()
    days += prevMonthDays
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const totalMonths = years * 12 + months
  const totalMonthsDecimal = Number((totalDays / 30.436875).toFixed(2))

  // Next birthday relative to target date
  const isLeapBirth = birth.month === 2 && birth.day === 29
  let candidate = getBirthdayInYear(birth.month, birth.day, target.year)
  if (candidate.date.utcMs < target.utcMs) {
    candidate = getBirthdayInYear(birth.month, birth.day, target.year + 1)
  }

  const daysUntil = Math.round((candidate.date.utcMs - target.utcMs) / MS_PER_DAY)
  const isToday = daysUntil === 0
  const upcomingAge = candidate.date.year - birth.year

  const nextBirthday: NextBirthdayInfo = {
    date: candidate.date,
    daysUntil,
    isToday,
    upcomingAge,
    isLeapBirth,
    observedOnFeb28: candidate.observedOnFeb28,
    ...(isLeapBirth ? { nextTrueLeapBirthday: findNextTrueLeapBirthday(target) } : {}),
  }

  return {
    ok: true,
    birth,
    target,
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    remainingDaysInWeeks,
    totalWeeksDecimal,
    totalMonths,
    remainingDaysInMonths: days,
    totalMonthsDecimal,
    totalHours,
    birthWeekday: birth.dayOfWeek,
    nextBirthday,
    chineseZodiac: getChineseZodiac(birth.year),
    zodiacSign: getZodiacSign(birth.month, birth.day),
  }
}

export { getTodayISO, getWeekdayLabel }
