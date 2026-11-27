import { useEffect, useMemo, useRef, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  COMMON_TIMEZONES,
  detectLocalTimeZone,
  formatDateTimeInTimeZone,
  formatNowInTimeZone,
  formatOffsetLabel,
  getAllTimezones,
  getTimeZoneOffsetMinutes,
  getTimezoneLabel,
  parseDateTimeWithZone,
  type TimezoneOption,
} from '../../lib/timezone'
import type { Language } from '../../lib/i18n'
import { ArrowLeftRight, ChevronDown, Clock, Globe, Plus, RefreshCw, Search, Sparkles, Trash2 } from 'lucide-react'

const MAX_TARGETS = 4

interface TimezonePickerProps {
  value: string
  onChange: (iana: string) => void
  referenceDate: Date
  language: Language
  searchPlaceholder: string
  commonGroupLabel: string
  allGroupLabel: string
  noMatchLabel: string
  ariaLabel?: string
}

function TimezonePicker({
  value,
  onChange,
  referenceDate,
  language,
  searchPlaceholder,
  commonGroupLabel,
  allGroupLabel,
  noMatchLabel,
  ariaLabel,
}: TimezonePickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allZones = useMemo(() => getAllTimezones(), [])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10)
    } else {
      setQuery('')
    }
  }, [open])

  const selectedOffset = useMemo(() => {
    try {
      return formatOffsetLabel(getTimeZoneOffsetMinutes(referenceDate, value))
    } catch {
      return 'UTC'
    }
  }, [referenceDate, value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return {
        common: COMMON_TIMEZONES,
        others: allZones.filter(z => !z.common),
      }
    }
    const matchZone = (z: TimezoneOption) => {
      if (z.iana.toLowerCase().includes(q)) return true
      if (z.zh.toLowerCase().includes(q)) return true
      if (z.en.toLowerCase().includes(q)) return true
      if (z.ja.toLowerCase().includes(q)) return true
      return z.keywords.some(k => k.includes(q))
    }
    const common = COMMON_TIMEZONES.filter(matchZone)
    const others = allZones.filter(z => !z.common && matchZone(z)).slice(0, 60)
    return { common, others }
  }, [query, allZones])

  const getOptionLabel = (z: TimezoneOption) => {
    if (language === 'en-US') return z.en
    if (language === 'ja-JP') return z.ja
    return z.zh
  }

  const getOptionOffset = (iana: string) => {
    try {
      return formatOffsetLabel(getTimeZoneOffsetMinutes(referenceDate, iana))
    } catch {
      return ''
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={ariaLabel}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-left text-sm hover:border-brand-400 dark:hover:border-brand-500 transition-colors"
      >
        <div className="min-w-0 flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-500 shrink-0" />
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {getTimezoneLabel(value, language)}
          </span>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">
            {selectedOffset}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full min-w-[260px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.common.length > 0 && (
              <>
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {commonGroupLabel}
                </div>
                {filtered.common.map(z => {
                  const isSelected = z.iana === value
                  return (
                    <button
                      key={z.iana}
                      type="button"
                      onClick={() => {
                        onChange(z.iana)
                        setOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 hover:bg-brand-50 dark:hover:bg-brand-950/40 ${
                        isSelected ? 'bg-brand-50/80 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium' : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate">{getOptionLabel(z)}</div>
                        <div className="text-[11px] font-mono text-gray-400 truncate">{z.iana}</div>
                      </div>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">
                        {getOptionOffset(z.iana)}
                      </span>
                    </button>
                  )
                })}
              </>
            )}

            {filtered.others.length > 0 && (
              <>
                <div className="px-3 py-1 mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {allGroupLabel}
                </div>
                {filtered.others.map(z => {
                  const isSelected = z.iana === value
                  return (
                    <button
                      key={z.iana}
                      type="button"
                      onClick={() => {
                        onChange(z.iana)
                        setOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 hover:bg-brand-50 dark:hover:bg-brand-950/40 ${
                        isSelected ? 'bg-brand-50/80 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium' : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <span className="truncate font-mono text-xs">{z.iana}</span>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">
                        {getOptionOffset(z.iana)}
                      </span>
                    </button>
                  )
                })}
              </>
            )}

            {filtered.common.length === 0 && filtered.others.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-gray-400">{noMatchLabel}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const DEFAULT_TARGETS = ['UTC', 'America/New_York', 'Asia/Tokyo']
const EXTRA_CANDIDATES = ['Europe/London', 'America/Los_Angeles', 'Australia/Sydney', 'Asia/Shanghai', 'Europe/Paris', 'Asia/Singapore']

export default function TimezoneConverter() {
  const { language } = useI18n()

  const [sourceTz, setSourceTz] = useState<string>(() => detectLocalTimeZone())
  const [dateInput, setDateInput] = useState<string>(() => formatNowInTimeZone(detectLocalTimeZone()))
  const [targetTzs, setTargetTzs] = useState<string[]>(() => {
    const local = detectLocalTimeZone()
    if (local === 'UTC') return ['Asia/Shanghai', 'America/New_York', 'Asia/Tokyo']
    return DEFAULT_TARGETS.filter(tz => tz !== local).slice(0, 3)
  })

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        pageTitle: 'Timezone Converter',
        pageDesc: 'Convert dates and times across global timezones in real time with automatic DST handling and multi-timezone comparison',
        sourceSection: 'Source Date & Time',
        dateTimeLabel: 'Date & Time (YYYY-MM-DD HH:mm:ss or ISO 8601)',
        datePlaceholder: 'e.g. 2026-03-08 09:30:00 or 2026-03-08T01:30:00Z',
        sourceTzLabel: 'Source Timezone',
        btnNow: 'Now',
        btnSample: 'Fill Sample',
        btnSwap: 'Swap with 1st target',
        searchPlaceholder: 'Search city or IANA timezone (e.g. Tokyo, UTC)...',
        commonGroup: 'Popular Timezones',
        allGroup: 'All IANA Timezones',
        noMatch: 'No matching timezone found',
        explicitOffsetNotice: 'Explicit UTC offset detected in input — converted directly from that exact instant.',
        dstGapNotice: 'This local time falls in a DST spring-forward gap and has been adjusted to the next valid instant.',
        errEmpty: 'Please enter a date and time to convert.',
        errFormat: 'Invalid format. Use YYYY-MM-DD HH:mm:ss or ISO 8601 (e.g. 2026-07-15 14:30:00 or 2026-07-15T06:30:00Z).',
        errCalendar: 'Invalid calendar date or time (check month, day, hour, minute, second).',
        errInvalidTz: 'Unsupported timezone identifier.',
        resultsSection: 'Converted Results',
        addTarget: 'Add Timezone',
        maxTargetsHint: `Up to ${MAX_TARGETS} target timezones`,
        copyAll: 'Copy Results',
        removeTarget: 'Remove timezone',
        dstBadge: 'DST',
        standardBadge: 'STD',
        sameDay: 'Same day',
        nextDay: '+1 day',
        prevDay: '-1 day',
        diffDays: (d: number) => (d > 0 ? `+${d} days` : `${d} days`),
        isoLabel: 'ISO 8601',
        unixLabel: 'Unix (s)',
        utcLabel: 'UTC Instant',
      }
    }
    if (language === 'ja-JP') {
      return {
        pageTitle: 'タイムゾーン変換',
        pageDesc: '世界各国のタイムゾーン間で日時をリアルタイム変換。サマータイム（DST）自動対応・最大 4 タイムゾーン同時表示',
        sourceSection: '変換元の日時',
        dateTimeLabel: '日時（YYYY-MM-DD HH:mm:ss または ISO 8601）',
        datePlaceholder: '例: 2026-03-08 09:30:00 または 2026-03-08T01:30:00Z',
        sourceTzLabel: '変換元タイムゾーン',
        btnNow: '現在時刻',
        btnSample: 'サンプル入力',
        btnSwap: '最初の変換先と入替',
        searchPlaceholder: '都市名または IANA タイムゾーンを検索...',
        commonGroup: 'よく使うタイムゾーン',
        allGroup: 'すべての IANA タイムゾーン',
        noMatch: '一致するタイムゾーンがありません',
        explicitOffsetNotice: '入力に明示的な UTC オフセットが含まれているため、その正確な瞬間を基準に変換しました。',
        dstGapNotice: '入力時刻はサマータイム開始時の存在しない時刻のため、直後の有効時刻に補正されました。',
        errEmpty: '変換する日時を入力してください。',
        errFormat: '日時形式が正しくありません。YYYY-MM-DD HH:mm:ss または ISO 8601 形式で入力してください。',
        errCalendar: '存在しない日付または時刻です（月・日・時・分・秒を確認してください）。',
        errInvalidTz: 'サポートされていないタイムゾーンです。',
        resultsSection: '変換結果',
        addTarget: 'タイムゾーンを追加',
        maxTargetsHint: `最大 ${MAX_TARGETS} 件まで同時表示`,
        copyAll: '結果をコピー',
        removeTarget: '削除',
        dstBadge: 'DST 夏時間',
        standardBadge: '標準時',
        sameDay: '同日',
        nextDay: '+1日',
        prevDay: '-1日',
        diffDays: (d: number) => (d > 0 ? `+${d}日` : `${d}日`),
        isoLabel: 'ISO 8601',
        unixLabel: 'Unix (秒)',
        utcLabel: 'UTC 時刻',
      }
    }
    return {
      pageTitle: '时区转换器',
      pageDesc: '全球多时区日期时间实时互转，基于浏览器原生 Intl 自动处理夏令时（DST），支持最多 4 个目标时区同时对比',
      sourceSection: '源日期与时间',
      dateTimeLabel: '日期时间（支持 YYYY-MM-DD HH:mm:ss 或 ISO 8601 格式）',
      datePlaceholder: '例如 2026-03-08 09:30:00 或 2026-03-08T01:30:00Z',
      sourceTzLabel: '源时区',
      btnNow: '现在',
      btnSample: '填入示例',
      btnSwap: '与首个目标互换',
      searchPlaceholder: '搜索城市或 IANA 时区（如 北京、Tokyo、UTC）...',
      commonGroup: '常用时区',
      allGroup: '全部 IANA 时区',
      noMatch: '未找到匹配的时区',
      explicitOffsetNotice: '检测到输入包含显式时区偏移（Z / ±HH:MM），已按该精确时刻直接转换。',
      dstGapNotice: '该本地时间处于夏令时春跳空档（不存在的时刻），已自动顺延至有效时刻。',
      errEmpty: '请输入需要转换的日期时间。',
      errFormat: '日期格式无效，请输入 YYYY-MM-DD HH:mm:ss 或 ISO 8601 格式（如 2026-07-15 14:30:00 或 2026-07-15T06:30:00Z）。',
      errCalendar: '非法日期或时间，请检查年、月、日与时分秒是否在合法范围内。',
      errInvalidTz: '不支持的时区标识。',
      resultsSection: '转换结果',
      addTarget: '添加目标时区',
      maxTargetsHint: `最多同时显示 ${MAX_TARGETS} 个目标时区`,
      copyAll: '复制结果',
      removeTarget: '移除时区',
      dstBadge: '夏令时 DST',
      standardBadge: '标准时',
      sameDay: '同一天',
      nextDay: '次日 (+1天)',
      prevDay: '前一日 (-1天)',
      diffDays: (d: number) => (d > 0 ? `+${d}天` : `${d}天`),
      isoLabel: 'ISO 8601',
      unixLabel: 'Unix 时间戳 (秒)',
      utcLabel: 'UTC 时刻',
    }
  }, [language])

  const parsed = useMemo(() => parseDateTimeWithZone(dateInput, sourceTz), [dateInput, sourceTz])

  const referenceDate = parsed.ok && parsed.date ? parsed.date : new Date()

  const errorMessage = useMemo(() => {
    if (parsed.ok) return ''
    switch (parsed.errorCode) {
      case 'empty':
        return ui.errEmpty
      case 'calendar':
        return ui.errCalendar
      case 'invalid_tz':
        return ui.errInvalidTz
      default:
        return ui.errFormat
    }
  }, [parsed, ui])

  const convertedList = useMemo(() => {
    if (!parsed.ok || !parsed.date) return []
    return targetTzs.map(tz => formatDateTimeInTimeZone(parsed.date!, tz, sourceTz, language))
  }, [parsed, targetTzs, sourceTz, language])

  const allResultsText = useMemo(() => {
    if (!parsed.ok || !parsed.date || convertedList.length === 0) return ''
    const srcInfo = formatDateTimeInTimeZone(parsed.date, sourceTz, sourceTz, language)
    const header = `${getTimezoneLabel(sourceTz, language)} (${srcInfo.offsetLabel}): ${srcInfo.formatted}`
    const lines = convertedList.map(
      item => `${getTimezoneLabel(item.timeZone, language)} (${item.offsetLabel}${item.isDst ? ', DST' : ''}): ${item.formatted}`
    )
    return [header, ...lines].join('\n')
  }, [parsed, convertedList, sourceTz, language])

  const handleNow = () => {
    setDateInput(formatNowInTimeZone(sourceTz, new Date()))
  }

  const handleSample = () => {
    // 跨夏令时示例：纽约 2026-03-08 03:30:00（刚进入夏令时 EDT UTC-04:00）
    setSourceTz('Asia/Shanghai')
    setDateInput('2026-03-08 15:30:00')
    setTargetTzs(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'])
  }

  const handleSwapWithFirst = () => {
    if (targetTzs.length === 0) return
    const first = targetTzs[0]
    const nextTargets = [sourceTz, ...targetTzs.slice(1)]
    setSourceTz(first)
    setTargetTzs(nextTargets)
    if (parsed.ok && parsed.date) {
      setDateInput(formatNowInTimeZone(first, parsed.date))
    }
  }

  const handleAddTarget = () => {
    if (targetTzs.length >= MAX_TARGETS) return
    const used = new Set([sourceTz, ...targetTzs])
    const next = EXTRA_CANDIDATES.find(tz => !used.has(tz)) ?? 'UTC'
    setTargetTzs(prev => [...prev, next])
  }

  const handleUpdateTarget = (index: number, nextIana: string) => {
    setTargetTzs(prev => prev.map((tz, i) => (i === index ? nextIana : tz)))
  }

  const handleRemoveTarget = (index: number) => {
    if (targetTzs.length <= 1) return
    setTargetTzs(prev => prev.filter((_, i) => i !== index))
  }

  const formatDayDiff = (diff: number) => {
    if (diff === 0) return ui.sameDay
    if (diff === 1) return ui.nextDay
    if (diff === -1) return ui.prevDay
    return ui.diffDays(diff)
  }

  const cardThemes = [
    'bg-brand-50/50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900',
    'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900',
    'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900',
    'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900',
  ]

  return (
    <ToolPage title={ui.pageTitle} description={ui.pageDesc}>
      <div className="flex flex-col gap-6">
        {/* Source DateTime & Timezone Card */}
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-600 rounded-xl text-white">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {ui.sourceSection}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleNow}
                className="btn-secondary btn-sm inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{ui.btnNow}</span>
              </button>
              <button
                type="button"
                onClick={handleSample}
                className="btn-secondary btn-sm inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{ui.btnSample}</span>
              </button>
              <button
                type="button"
                onClick={handleSwapWithFirst}
                className="btn-secondary btn-sm inline-flex items-center gap-1.5"
                disabled={targetTzs.length === 0}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{ui.btnSwap}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {ui.dateTimeLabel}
              </label>
              <input
                type="text"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                placeholder={ui.datePlaceholder}
                className="input-field font-mono font-semibold text-base w-full"
              />
            </div>

            <div className="lg:col-span-5">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {ui.sourceTzLabel}
              </label>
              <TimezonePicker
                value={sourceTz}
                onChange={setSourceTz}
                referenceDate={referenceDate}
                language={language}
                searchPlaceholder={ui.searchPlaceholder}
                commonGroupLabel={ui.commonGroup}
                allGroupLabel={ui.allGroup}
                noMatchLabel={ui.noMatch}
                ariaLabel={ui.sourceTzLabel}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {parsed.ok && parsed.hasExplicitOffset && (
            <div className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300">
              {ui.explicitOffsetNotice}
            </div>
          )}

          {parsed.ok && parsed.isDstGap && (
            <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300">
              {ui.dstGapNotice}
            </div>
          )}

          {parsed.ok && parsed.date && (
            <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-600 dark:text-gray-400">
              <span>
                {ui.utcLabel}: <strong className="text-gray-900 dark:text-gray-100">{parsed.date.toISOString()}</strong>
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span>
                {ui.unixLabel}: <strong className="text-gray-900 dark:text-gray-100">{Math.floor(parsed.date.getTime() / 1000)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Target Timezones Results */}
        <div className="card p-6 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {ui.resultsSection}
              </h2>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {targetTzs.length} / {MAX_TARGETS}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {allResultsText && (
                <CopyButton text={allResultsText} label={ui.copyAll} />
              )}
              <button
                type="button"
                onClick={handleAddTarget}
                disabled={targetTzs.length >= MAX_TARGETS}
                title={ui.maxTargetsHint}
                className="btn-primary btn-sm inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{ui.addTarget}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targetTzs.map((tz, index) => {
              const item = convertedList[index]
              const theme = cardThemes[index % cardThemes.length]
              return (
                <div
                  key={`${index}-${tz}`}
                  className={`p-4 rounded-xl border flex flex-col gap-3 ${theme}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <TimezonePicker
                        value={tz}
                        onChange={nextTz => handleUpdateTarget(index, nextTz)}
                        referenceDate={referenceDate}
                        language={language}
                        searchPlaceholder={ui.searchPlaceholder}
                        commonGroupLabel={ui.commonGroup}
                        allGroupLabel={ui.allGroup}
                        noMatchLabel={ui.noMatch}
                        ariaLabel={`${ui.resultsSection} #${index + 1}`}
                      />
                    </div>
                    {targetTzs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTarget(index)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title={ui.removeTarget}
                        aria-label={ui.removeTarget}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {item ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono font-bold text-xl sm:text-2xl text-gray-900 dark:text-gray-100 tracking-tight">
                            {item.formatted}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-gray-900/70 text-gray-700 dark:text-gray-300 font-medium border border-gray-200/70 dark:border-gray-700/70">
                              {item.weekday}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-gray-900/70 text-gray-700 dark:text-gray-300 font-mono border border-gray-200/70 dark:border-gray-700/70">
                              {item.offsetLabel}
                            </span>
                            {item.tzAbbr && (
                              <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-gray-900/70 text-gray-600 dark:text-gray-400 font-mono border border-gray-200/70 dark:border-gray-700/70">
                                {item.tzAbbr}
                              </span>
                            )}
                            {item.isDst && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 font-semibold">
                                {ui.dstBadge}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-md font-medium ${
                                item.dayDiff === 0
                                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                  : item.dayDiff > 0
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                              }`}
                            >
                              {formatDayDiff(item.dayDiff)}
                            </span>
                          </div>
                        </div>
                        <CopyButton text={item.formatted} />
                      </div>

                      <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                        <span className="truncate">
                          {ui.isoLabel}: <span className="text-gray-700 dark:text-gray-300">{item.iso}</span>
                        </span>
                        <CopyButton text={item.iso} />
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-sm text-gray-400 font-mono">--</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
