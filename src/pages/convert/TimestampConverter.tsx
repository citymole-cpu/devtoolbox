import { useEffect, useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import type { Language } from '../../lib/i18n'
import { Clock, Pause, Play, RefreshCw } from 'lucide-react'

type TsUnitMode = 'auto' | 's' | 'ms'
type TzMode = 'local' | 'utc'

const pad2 = (n: number) => String(n).padStart(2, '0')
const pad3 = (n: number) => String(n).padStart(3, '0')

function getLocalOffsetLabel(date: Date): string {
  const offsetMin = -date.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  const hh = pad2(Math.floor(abs / 60))
  const mm = pad2(abs % 60)
  return `UTC${sign}${hh}:${mm}`
}

function formatLocalDateTime(date: Date, includeMs: boolean): string {
  const base = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  return includeMs ? `${base}.${pad3(date.getMilliseconds())}` : base
}

function formatUtcDateTime(date: Date, includeMs: boolean): string {
  const base = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())} ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`
  return includeMs ? `${base}.${pad3(date.getUTCMilliseconds())} UTC` : `${base} UTC`
}

function toDateTimeLocalInput(date: Date, tz: TzMode): string {
  if (tz === 'utc') {
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}T${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

function parseDateTimeInput(value: string, tz: TzMode): Date | null {
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2]) - 1
  const day = Number(m[3])
  const hour = Number(m[4])
  const minute = Number(m[5])
  const second = m[6] ? Number(m[6]) : 0
  const ms = m[7] ? Number(m[7].padEnd(3, '0')) : 0

  const d =
    tz === 'utc'
      ? new Date(Date.UTC(year, month, day, hour, minute, second, ms))
      : new Date(year, month, day, hour, minute, second, ms)

  return Number.isNaN(d.getTime()) ? null : d
}

function formatRelativeTime(targetMs: number, nowMs: number, language: Language): string {
  const diffSec = Math.round((targetMs - nowMs) / 1000)
  const absSec = Math.abs(diffSec)

  if (absSec < 5) {
    if (language === 'en-US') return 'just now'
    if (language === 'ja-JP') return 'たった今'
    return '刚刚'
  }

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ]

  for (const { unit, seconds } of units) {
    if (absSec >= seconds) {
      const value = Math.trunc(diffSec / seconds)
      if (typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function') {
        const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
        return rtf.format(value, unit)
      }
      return `${value} ${unit}`
    }
  }
  return ''
}

export default function TimestampConverter() {
  const { language } = useI18n()

  // Live current clock
  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [isLive])

  // Section 1: Timestamp -> Date
  const [tsInput, setTsInput] = useState<string>(() => String(Math.floor(Date.now() / 1000)))
  const [unitMode, setUnitMode] = useState<TsUnitMode>('auto')

  // Section 2: Date -> Timestamp
  const [tzMode, setTzMode] = useState<TzMode>('local')
  const [dateInput, setDateInput] = useState<string>(() => toDateTimeLocalInput(new Date(), 'local'))

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        currentTime: 'Current Unix Timestamp',
        secLabel: 'Seconds (10 digits)',
        msLabel: 'Milliseconds (13 digits)',
        pause: 'Pause live clock',
        resume: 'Resume live clock',
        tsToDateTitle: 'Timestamp → Date & Time',
        tsPlaceholder: 'Enter 10-digit (s) or 13-digit (ms) Unix timestamp...',
        unitAuto: 'Auto',
        unitSec: 'Seconds (s)',
        unitMs: 'Milliseconds (ms)',
        detectedSec: 'Auto-detected: Seconds (s)',
        detectedMs: 'Auto-detected: Milliseconds (ms)',
        btnNowSec: 'Current (s)',
        btnNowMs: 'Current (ms)',
        invalidTs: 'Please enter a valid integer Unix timestamp',
        outOfRange: 'Timestamp is out of valid Date range',
        localTime: 'Local Time',
        utcTime: 'UTC Time',
        iso8601: 'ISO 8601',
        relativeTime: 'Relative Time',
        dateToTsTitle: 'Date & Time → Timestamp',
        dateInputLabel: 'Date & Time',
        timezoneLabel: 'Timezone',
        tzLocal: 'Local',
        tzUtc: 'UTC',
        btnCurrentTime: 'Current Time',
        invalidDate: 'Please select a valid date and time',
        outSec: 'Unix Timestamp (Seconds · 10-digit)',
        outMs: 'Unix Timestamp (Milliseconds · 13-digit)',
        parsedIso: 'ISO 8601 Preview',
      }
    }
    if (language === 'ja-JP') {
      return {
        currentTime: '現在の Unix タイムスタンプ',
        secLabel: '秒 (10桁)',
        msLabel: 'ミリ秒 (13桁)',
        pause: '時計を一時停止',
        resume: '時計を再開',
        tsToDateTitle: 'タイムスタンプ → 日時',
        tsPlaceholder: '10桁（秒）または 13桁（ミリ秒）のタイムスタンプを入力...',
        unitAuto: '自動判定',
        unitSec: '秒 (s)',
        unitMs: 'ミリ秒 (ms)',
        detectedSec: '自動判定：秒 (s)',
        detectedMs: '自動判定：ミリ秒 (ms)',
        btnNowSec: '現在時刻 (秒)',
        btnNowMs: '現在時刻 (ミリ秒)',
        invalidTs: '有効な整数の Unix タイムスタンプを入力してください',
        outOfRange: 'タイムスタンプが有効な日時範囲外です',
        localTime: 'ローカル時刻',
        utcTime: 'UTC 時刻',
        iso8601: 'ISO 8601',
        relativeTime: '相対時間',
        dateToTsTitle: '日時 → タイムスタンプ',
        dateInputLabel: '日時を選択',
        timezoneLabel: 'タイムゾーン',
        tzLocal: 'ローカル',
        tzUtc: 'UTC',
        btnCurrentTime: '現在時刻',
        invalidDate: '有効な日時を選択してください',
        outSec: 'Unix タイムスタンプ（秒・10桁）',
        outMs: 'Unix タイムスタンプ（ミリ秒・13桁）',
        parsedIso: 'ISO 8601 プレビュー',
      }
    }
    return {
      currentTime: '当前 Unix 时间戳',
      secLabel: '秒 (10位)',
      msLabel: '毫秒 (13位)',
      pause: '暂停实时时钟',
      resume: '继续实时时钟',
      tsToDateTitle: '时间戳 → 日期时间',
      tsPlaceholder: '输入 10 位（秒）或 13 位（毫秒）Unix 时间戳...',
      unitAuto: '自动识别',
      unitSec: '秒 (s)',
      unitMs: '毫秒 (ms)',
      detectedSec: '已自动识别：秒 (s)',
      detectedMs: '已自动识别：毫秒 (ms)',
      btnNowSec: '当前时间 (秒)',
      btnNowMs: '当前时间 (毫秒)',
      invalidTs: '请输入有效的整数 Unix 时间戳',
      outOfRange: '时间戳超出有效日期范围',
      localTime: '本地时间',
      utcTime: 'UTC 时间',
      iso8601: 'ISO 8601',
      relativeTime: '相对时间',
      dateToTsTitle: '日期时间 → 时间戳',
      dateInputLabel: '选择日期时间',
      timezoneLabel: '时区',
      tzLocal: '本地时区',
      tzUtc: 'UTC',
      btnCurrentTime: '当前时间',
      invalidDate: '请选择有效的日期时间',
      outSec: 'Unix 时间戳（秒 · 10位）',
      outMs: 'Unix 时间戳（毫秒 · 13位）',
      parsedIso: 'ISO 8601 预览',
    }
  }, [language])

  const localOffset = useMemo(() => getLocalOffsetLabel(new Date(nowMs)), [nowMs])
  const currentSec = Math.floor(nowMs / 1000)

  // Parse Timestamp -> Date
  const tsParsed = useMemo(() => {
    const raw = tsInput.trim()
    if (!raw) {
      return { error: '', detectedUnit: null as 's' | 'ms' | null, result: null }
    }
    if (!/^-?\d+$/.test(raw)) {
      return { error: ui.invalidTs, detectedUnit: null as 's' | 'ms' | null, result: null }
    }
    const num = Number(raw)
    if (!Number.isFinite(num)) {
      return { error: ui.outOfRange, detectedUnit: null as 's' | 'ms' | null, result: null }
    }

    const digits = raw.replace(/^-/, '').length
    const effectiveUnit: 's' | 'ms' =
      unitMode === 'auto' ? (digits >= 12 ? 'ms' : 's') : unitMode
    const ms = effectiveUnit === 'ms' ? num : num * 1000

    if (Math.abs(ms) > 8.64e15) {
      return { error: ui.outOfRange, detectedUnit: effectiveUnit, result: null }
    }

    const date = new Date(ms)
    if (Number.isNaN(date.getTime())) {
      return { error: ui.outOfRange, detectedUnit: effectiveUnit, result: null }
    }

    const showMs = effectiveUnit === 'ms'
    return {
      error: '',
      detectedUnit: effectiveUnit,
      result: {
        local: formatLocalDateTime(date, showMs),
        localOffset: getLocalOffsetLabel(date),
        utc: formatUtcDateTime(date, showMs),
        rfc: date.toUTCString(),
        iso: date.toISOString(),
        relative: formatRelativeTime(ms, nowMs, language),
      },
    }
  }, [tsInput, unitMode, nowMs, language, ui.invalidTs, ui.outOfRange])

  // Parse Date -> Timestamp
  const dateParsed = useMemo(() => {
    if (!dateInput.trim()) return { error: '', result: null }
    const d = parseDateTimeInput(dateInput, tzMode)
    if (!d) return { error: ui.invalidDate, result: null }
    const ms = d.getTime()
    return {
      error: '',
      result: {
        sec: String(Math.floor(ms / 1000)),
        ms: String(ms),
        iso: d.toISOString(),
      },
    }
  }, [dateInput, tzMode, ui.invalidDate])

  const handleSetCurrentDate = () => {
    const now = new Date()
    setDateInput(toDateTimeLocalInput(now, tzMode))
  }

  return (
    <ToolPage
      title="Unix 时间戳转换器"
      description="Unix 时间戳（秒/毫秒）与本地/UTC 日期时间双向实时互转，支持 ISO 8601 与相对时间"
    >
      <div className="flex flex-col gap-6">
        {/* Live Current Timestamp Banner */}
        <div className="card p-5 bg-gradient-to-r from-brand-50/70 via-indigo-50/50 to-purple-50/50 dark:from-brand-950/30 dark:via-indigo-950/20 dark:to-purple-950/20 border-brand-200 dark:border-brand-900/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-600 rounded-xl text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {ui.currentTime} ({localOffset})
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-gray-900 dark:text-gray-100">
                  {formatLocalDateTime(new Date(nowMs), false)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-mono">
                <span className="text-gray-500 dark:text-gray-400 text-xs">{ui.secLabel}:</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{currentSec}</span>
                <CopyButton text={String(currentSec)} />
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-mono">
                <span className="text-gray-500 dark:text-gray-400 text-xs">{ui.msLabel}:</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{nowMs}</span>
                <CopyButton text={String(nowMs)} />
              </div>
              <button
                type="button"
                onClick={() => setIsLive(v => !v)}
                className="btn-secondary btn-sm p-2"
                title={isLive ? ui.pause : ui.resume}
                aria-label={isLive ? ui.pause : ui.resume}
              >
                {isLive ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Timestamp -> Date */}
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{ui.tsToDateTitle}</h2>
              {unitMode === 'auto' && tsParsed.detectedUnit && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                  {tsParsed.detectedUnit === 'ms' ? ui.detectedMs : ui.detectedSec}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTsInput(String(Math.floor(Date.now() / 1000)))}
                className="btn-secondary btn-sm inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{ui.btnNowSec}</span>
              </button>
              <button
                type="button"
                onClick={() => setTsInput(String(Date.now()))}
                className="btn-secondary btn-sm inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{ui.btnNowMs}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={tsInput}
              onChange={e => setTsInput(e.target.value)}
              placeholder={ui.tsPlaceholder}
              className="input-field font-mono font-semibold text-base flex-1"
            />
            <select
              value={unitMode}
              onChange={e => setUnitMode(e.target.value as TsUnitMode)}
              className="select-field text-sm sm:w-44"
              aria-label="Timestamp unit"
            >
              <option value="auto">{ui.unitAuto}</option>
              <option value="s">{ui.unitSec}</option>
              <option value="ms">{ui.unitMs}</option>
            </select>
          </div>

          {tsParsed.error && (
            <div className="text-sm text-red-600 dark:text-red-400">{tsParsed.error}</div>
          )}

          {tsParsed.result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local Time */}
              <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-900">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-brand-700 dark:text-brand-300 text-sm">
                    {ui.localTime} ({tsParsed.result.localOffset})
                  </span>
                  <CopyButton text={tsParsed.result.local} />
                </div>
                <div className="font-mono font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 break-all">
                  {tsParsed.result.local}
                </div>
              </div>

              {/* UTC Time */}
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">
                    {ui.utcTime}
                  </span>
                  <CopyButton text={tsParsed.result.utc} />
                </div>
                <div className="font-mono font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 break-all">
                  {tsParsed.result.utc}
                </div>
                <div className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400">
                  {tsParsed.result.rfc}
                </div>
              </div>

              {/* ISO 8601 */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
                    {ui.iso8601}
                  </span>
                  <CopyButton text={tsParsed.result.iso} />
                </div>
                <div className="font-mono font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 break-all">
                  {tsParsed.result.iso}
                </div>
              </div>

              {/* Relative Time */}
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-amber-700 dark:text-amber-300 text-sm">
                    {ui.relativeTime}
                  </span>
                  <CopyButton text={tsParsed.result.relative} />
                </div>
                <div className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
                  {tsParsed.result.relative}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Date -> Timestamp */}
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{ui.dateToTsTitle}</h2>
            <button
              type="button"
              onClick={handleSetCurrentDate}
              className="btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{ui.btnCurrentTime}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {ui.dateInputLabel}
              </label>
              <input
                type="datetime-local"
                step="1"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                className="input-field font-mono text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {ui.timezoneLabel}
              </label>
              <select
                value={tzMode}
                onChange={e => setTzMode(e.target.value as TzMode)}
                className="select-field w-full text-sm h-[42px]"
              >
                <option value="local">{ui.tzLocal} ({localOffset})</option>
                <option value="utc">{ui.tzUtc} (UTC+00:00)</option>
              </select>
            </div>
          </div>

          {dateParsed.error && (
            <div className="text-sm text-red-600 dark:text-red-400">{dateParsed.error}</div>
          )}

          {dateParsed.result && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-900">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-brand-700 dark:text-brand-300 text-sm">
                      {ui.outSec}
                    </span>
                    <CopyButton text={dateParsed.result.sec} />
                  </div>
                  <div className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">
                    {dateParsed.result.sec}
                  </div>
                </div>

                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">
                      {ui.outMs}
                    </span>
                    <CopyButton text={dateParsed.result.ms} />
                  </div>
                  <div className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">
                    {dateParsed.result.ms}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-600 dark:text-gray-400">
                <span className="truncate">
                  {ui.parsedIso}: <strong className="text-gray-900 dark:text-gray-200">{dateParsed.result.iso}</strong>
                </span>
                <CopyButton text={dateParsed.result.iso} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
