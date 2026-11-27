import type { Language } from './i18n'

export interface ParsedDate {
  iso: string
  year: number
  month: number
  day: number
  utcMs: number
  dayOfWeek: number // 0 = Sunday ... 6 = Saturday
  isWeekend: boolean
}

export type DateErrorCode = 'empty' | 'invalid_date' | 'reversed_range' | 'invalid_offset' | 'out_of_range'

export interface IntervalResult {
  ok: true
  start: ParsedDate
  end: ParsedDate
  totalDays: number
  workdays: number
  weekendDays: number
  weeks: number
  remainingDays: number
  totalWeeksDecimal: number
  years: number
  months: number
  days: number
  totalMonths: number
  totalMonthsDecimal: number
}

export interface IntervalError {
  ok: false
  error: DateErrorCode
}

export interface AddDaysResult {
  ok: true
  base: ParsedDate
  target: ParsedDate
  inputDelta: number
  workdaysOnly: boolean
  calendarDaysDiff: number
}

export interface AddDaysError {
  ok: false
  error: DateErrorCode
}

export interface CountdownResult {
  ok: true
  today: ParsedDate
  target: ParsedDate
  diffDays: number // positive = future, 0 = today, negative = past
  absDays: number
  status: 'future' | 'today' | 'past'
  weeks: number
  remainingDays: number
  workdays: number
}

export interface CountdownError {
  ok: false
  error: DateErrorCode
}

export type QuickPreset = 'today' | 'tomorrow' | 'nextMonday' | 'nextMonthFirst' | 'yearEnd'

const MS_PER_DAY = 86_400_000
const MAX_OFFSET_DAYS = 365_000 // ~1000 years

const WEEKDAY_NAMES: Record<Language, readonly string[]> = {
  'zh-CN': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'ja-JP': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatISODate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}`
}

export function fromUtcMs(utcMs: number): ParsedDate {
  const d = new Date(utcMs)
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  const dayOfWeek = d.getUTCDay()
  return {
    iso: formatISODate(year, month, day),
    year,
    month,
    day,
    utcMs,
    dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
  }
}

export function parseISODate(input: string): ParsedDate | null {
  const trimmed = input.trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const utcMs = Date.UTC(year, month - 1, day)
  const d = new Date(utcMs)
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null
  }
  const dayOfWeek = d.getUTCDay()
  return {
    iso: formatISODate(year, month, day),
    year,
    month,
    day,
    utcMs,
    dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
  }
}

export function getTodayISO(now: Date = new Date()): string {
  return formatISODate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function getWeekdayLabel(dayOfWeek: number, language: Language): string {
  const names = WEEKDAY_NAMES[language] ?? WEEKDAY_NAMES['zh-CN']
  return names[((dayOfWeek % 7) + 7) % 7]
}

export function countWorkdaysBetween(startUtcMs: number, endUtcMs: number): { workdays: number; weekendDays: number } {
  const totalDays = Math.round((endUtcMs - startUtcMs) / MS_PER_DAY)
  if (totalDays <= 0) {
    return { workdays: 0, weekendDays: 0 }
  }
  const fullWeeks = Math.floor(totalDays / 7)
  let workdays = fullWeeks * 5
  let weekendDays = fullWeeks * 2
  const remainder = totalDays % 7
  const startDow = new Date(startUtcMs).getUTCDay()
  for (let i = 1; i <= remainder; i++) {
    const dow = (startDow + i) % 7
    if (dow === 0 || dow === 6) {
      weekendDays += 1
    } else {
      workdays += 1
    }
  }
  return { workdays, weekendDays }
}

export function calculateDateInterval(startStr: string, endStr: string): IntervalResult | IntervalError {
  if (!startStr.trim() || !endStr.trim()) {
    return { ok: false, error: 'empty' }
  }
  const start = parseISODate(startStr)
  const end = parseISODate(endStr)
  if (!start || !end) {
    return { ok: false, error: 'invalid_date' }
  }
  if (start.utcMs > end.utcMs) {
    return { ok: false, error: 'reversed_range' }
  }

  const totalDays = Math.round((end.utcMs - start.utcMs) / MS_PER_DAY)
  const { workdays, weekendDays } = countWorkdaysBetween(start.utcMs, end.utcMs)
  const weeks = Math.floor(totalDays / 7)
  const remainingDays = totalDays % 7
  const totalWeeksDecimal = Number((totalDays / 7).toFixed(2))

  let years = end.year - start.year
  let months = end.month - start.month
  let days = end.day - start.day

  if (days < 0) {
    months -= 1
    const prevMonthDays = new Date(Date.UTC(end.year, end.month - 1, 0)).getUTCDate()
    days += prevMonthDays
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const totalMonths = years * 12 + months
  const totalMonthsDecimal = Number((totalDays / 30.436875).toFixed(2))

  return {
    ok: true,
    start,
    end,
    totalDays,
    workdays,
    weekendDays,
    weeks,
    remainingDays,
    totalWeeksDecimal,
    years,
    months,
    days,
    totalMonths,
    totalMonthsDecimal,
  }
}

export function addDaysToDate(
  baseStr: string,
  delta: number,
  workdaysOnly: boolean
): AddDaysResult | AddDaysError {
  if (!baseStr.trim()) {
    return { ok: false, error: 'empty' }
  }
  const base = parseISODate(baseStr)
  if (!base) {
    return { ok: false, error: 'invalid_date' }
  }
  if (!Number.isFinite(delta) || !Number.isInteger(delta)) {
    return { ok: false, error: 'invalid_offset' }
  }
  if (Math.abs(delta) > MAX_OFFSET_DAYS) {
    return { ok: false, error: 'out_of_range' }
  }

  if (!workdaysOnly || delta === 0) {
    const target = fromUtcMs(base.utcMs + delta * MS_PER_DAY)
    return {
      ok: true,
      base,
      target,
      inputDelta: delta,
      workdaysOnly,
      calendarDaysDiff: delta,
    }
  }

  const step = delta > 0 ? 1 : -1
  let remaining = Math.abs(delta)
  let currentMs = base.utcMs

  // If starting on a weekend, step until we reach the first workday
  const startDow = new Date(currentMs).getUTCDay()
  if (startDow === 0 || startDow === 6) {
    while (true) {
      currentMs += step * MS_PER_DAY
      const dow = new Date(currentMs).getUTCDay()
      if (dow !== 0 && dow !== 6) {
        remaining -= 1
        break
      }
    }
  }

  // From any weekday, every 5 workdays equals exactly 7 calendar days
  const fullWeeks = Math.floor(remaining / 5)
  currentMs += step * fullWeeks * 7 * MS_PER_DAY
  remaining = remaining % 5

  while (remaining > 0) {
    currentMs += step * MS_PER_DAY
    const dow = new Date(currentMs).getUTCDay()
    if (dow !== 0 && dow !== 6) {
      remaining -= 1
    }
  }

  const target = fromUtcMs(currentMs)
  const calendarDaysDiff = Math.round((target.utcMs - base.utcMs) / MS_PER_DAY)

  return {
    ok: true,
    base,
    target,
    inputDelta: delta,
    workdaysOnly,
    calendarDaysDiff,
  }
}

export function calculateCountdown(targetStr: string, todayStr?: string): CountdownResult | CountdownError {
  if (!targetStr.trim()) {
    return { ok: false, error: 'empty' }
  }
  const today = parseISODate(todayStr ?? getTodayISO())
  const target = parseISODate(targetStr)
  if (!today || !target) {
    return { ok: false, error: 'invalid_date' }
  }

  const diffDays = Math.round((target.utcMs - today.utcMs) / MS_PER_DAY)
  const absDays = Math.abs(diffDays)
  const status: 'future' | 'today' | 'past' =
    diffDays > 0 ? 'future' : diffDays < 0 ? 'past' : 'today'
  const weeks = Math.floor(absDays / 7)
  const remainingDays = absDays % 7
  const earlierMs = Math.min(today.utcMs, target.utcMs)
  const laterMs = Math.max(today.utcMs, target.utcMs)
  const { workdays } = countWorkdaysBetween(earlierMs, laterMs)

  return {
    ok: true,
    today,
    target,
    diffDays,
    absDays,
    status,
    weeks,
    remainingDays,
    workdays,
  }
}

export function getQuickDatePreset(preset: QuickPreset, baseTodayStr?: string): string {
  const today = parseISODate(baseTodayStr ?? getTodayISO()) ?? fromUtcMs(Date.UTC(2026, 0, 1))
  switch (preset) {
    case 'today':
      return today.iso
    case 'tomorrow':
      return fromUtcMs(today.utcMs + MS_PER_DAY).iso
    case 'nextMonday': {
      const daysUntilNextMon = today.dayOfWeek === 0 ? 1 : 8 - today.dayOfWeek
      return fromUtcMs(today.utcMs + daysUntilNextMon * MS_PER_DAY).iso
    }
    case 'nextMonthFirst': {
      if (today.month === 12) {
        return formatISODate(today.year + 1, 1, 1)
      }
      return formatISODate(today.year, today.month + 1, 1)
    }
    case 'yearEnd':
      return formatISODate(today.year, 12, 31)
  }
}
