import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  addDaysToDate,
  calculateCountdown,
  calculateDateInterval,
  getQuickDatePreset,
  getTodayISO,
  getWeekdayLabel,
  type DateErrorCode,
  type QuickPreset,
} from '../../lib/dateCalculator'
import {
  AlertCircle,
  ArrowLeftRight,
  Calendar,
  CalendarClock,
  CalendarPlus,
  Clock,
  Trash2,
} from 'lucide-react'

type ActiveTab = 'interval' | 'addsub' | 'countdown'

const QUICK_PRESETS: QuickPreset[] = ['today', 'tomorrow', 'nextMonday', 'nextMonthFirst', 'yearEnd']

export default function DateCalculator() {
  const { language } = useI18n()

  const todayISO = useMemo(() => getTodayISO(), [])
  const defaultYearEnd = useMemo(() => getQuickDatePreset('yearEnd', todayISO), [todayISO])

  const [tab, setTab] = useState<ActiveTab>('interval')

  // Tab 1: Date Interval
  const [startDate, setStartDate] = useState<string>(todayISO)
  const [endDate, setEndDate] = useState<string>(defaultYearEnd)
  const [intervalPresetTarget, setIntervalPresetTarget] = useState<'start' | 'end'>('end')

  // Tab 2: Date Add / Subtract
  const [baseDate, setBaseDate] = useState<string>(todayISO)
  const [offsetInput, setOffsetInput] = useState<string>('30')
  const [workdaysOnly, setWorkdaysOnly] = useState<boolean>(false)

  // Tab 3: Countdown
  const [countdownDate, setCountdownDate] = useState<string>(defaultYearEnd)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        tabInterval: 'Date Interval',
        tabAddSub: 'Add / Subtract Days',
        tabCountdown: 'Countdown',
        quickFill: 'Quick Fill',
        fillTargetStart: 'Fill Start',
        fillTargetEnd: 'Fill End',
        presets: {
          today: 'Today',
          tomorrow: 'Tomorrow',
          nextMonday: 'Next Monday',
          nextMonthFirst: '1st of Next Month',
          yearEnd: 'End of Year',
        } as Record<QuickPreset, string>,
        startDate: 'Start Date',
        endDate: 'End Date',
        swapDates: 'Swap',
        baseDate: 'Base Date',
        daysOffset: 'Days (+/-)',
        daysPlaceholder: 'e.g. 30 or -15',
        workdaysOnly: 'Workdays only (skip Sat & Sun)',
        targetDate: 'Target Date',
        clear: 'Clear',
        copyResult: 'Copy Result',
        totalDays: 'Total Days',
        workdays: 'Workdays (Mon–Fri)',
        weekendDays: 'Weekend Days',
        weeksLabel: 'Weeks',
        monthsLabel: 'Months (Calendar)',
        calendarBreakdown: 'Calendar Breakdown',
        targetResult: 'Target Date',
        weekday: 'Day of Week',
        calendarElapsed: 'Calendar Days Spanned',
        todayLabel: 'Today',
        daysUnit: 'days',
        weeksUnit: 'wks',
        monthsUnit: 'mos',
        yearsUnit: 'yrs',
        countdownFuture: (n: number) => `${n} day${n === 1 ? '' : 's'} remaining until target`,
        countdownPast: (n: number) => `${n} day${n === 1 ? '' : 's'} elapsed since target`,
        countdownToday: 'Target date is today (0 days)',
        countdownWorkdaysFuture: (n: number) => `${n} workday${n === 1 ? '' : 's'} remaining`,
        countdownWorkdaysPast: (n: number) => `${n} workday${n === 1 ? '' : 's'} elapsed`,
        errors: {
          empty: 'Please enter or pick valid date(s) to calculate.',
          invalid_date: 'Invalid date format or nonexistent calendar date (expected YYYY-MM-DD).',
          reversed_range: 'Start date cannot be later than end date. Please adjust or click Swap.',
          invalid_offset: 'Please enter a valid integer for the number of days (e.g. 10 or -7).',
          out_of_range: 'Day offset is out of supported range (±365,000 days).',
        } as Record<DateErrorCode, string>,
        approx: 'approx.',
        modeWorkdays: 'Workdays only',
        modeCalendar: 'Calendar days',
      }
    }

    if (language === 'ja-JP') {
      return {
        tabInterval: '日付の間隔',
        tabAddSub: '日数の加減算',
        tabCountdown: 'カウントダウン',
        quickFill: 'クイック入力',
        fillTargetStart: '開始日に入力',
        fillTargetEnd: '終了日に入力',
        presets: {
          today: '今日',
          tomorrow: '明日',
          nextMonday: '次の月曜',
          nextMonthFirst: '来月1日',
          yearEnd: '今年末',
        } as Record<QuickPreset, string>,
        startDate: '開始日',
        endDate: '終了日',
        swapDates: '入替',
        baseDate: '基準日',
        daysOffset: '加減日数 (+/-)',
        daysPlaceholder: '例: 30 または -15',
        workdaysOnly: '営業日のみ計算（土日を除外）',
        targetDate: '目標日',
        clear: 'クリア',
        copyResult: '結果をコピー',
        totalDays: '合計日数',
        workdays: '営業日（月〜金）',
        weekendDays: '土日日数',
        weeksLabel: '週数',
        monthsLabel: '月数（暦換算）',
        calendarBreakdown: '年月日の内訳',
        targetResult: '計算結果の日付',
        weekday: '曜日',
        calendarElapsed: '暦日数の変化',
        todayLabel: '今日',
        daysUnit: '日',
        weeksUnit: '週',
        monthsUnit: 'ヶ月',
        yearsUnit: '年',
        countdownFuture: (n: number) => `今日からあと ${n} 日`,
        countdownPast: (n: number) => `目標日から ${n} 日経過`,
        countdownToday: '目標日は今日です（0 日）',
        countdownWorkdaysFuture: (n: number) => `残り営業日 ${n} 日`,
        countdownWorkdaysPast: (n: number) => `経過営業日 ${n} 日`,
        errors: {
          empty: '計算する日付を入力または選択してください。',
          invalid_date: '日付形式が不正か、存在しない日付です（YYYY-MM-DD 形式）。',
          reversed_range: '開始日が終了日より後になっています。日付を修正するか「入替」を押してください。',
          invalid_offset: '加減日数には整数を入力してください（例: 10、-7）。',
          out_of_range: '日数の範囲が大きすぎます（±365,000 日以内で指定してください）。',
        } as Record<DateErrorCode, string>,
        approx: '約',
        modeWorkdays: '営業日のみ',
        modeCalendar: '暦日',
      }
    }

    return {
      tabInterval: '日期间隔',
      tabAddSub: '日期加减',
      tabCountdown: '倒数日',
      quickFill: '常用快捷',
      fillTargetStart: '填入开始日期',
      fillTargetEnd: '填入结束日期',
      presets: {
        today: '今天',
        tomorrow: '明天',
        nextMonday: '下周一',
        nextMonthFirst: '下月 1 号',
        yearEnd: '今年年底',
      } as Record<QuickPreset, string>,
      startDate: '开始日期',
      endDate: '结束日期',
      swapDates: '互换',
      baseDate: '基准日期',
      daysOffset: '加减天数（支持负数）',
      daysPlaceholder: '例如 30 或 -15',
      workdaysOnly: '仅算工作日（自动跳过周六、周日）',
      targetDate: '目标日期',
      clear: '清空',
      copyResult: '复制结果',
      totalDays: '相差天数',
      workdays: '工作日（周一至周五）',
      weekendDays: '周末天数',
      weeksLabel: '相差周数',
      monthsLabel: '相差月数',
      calendarBreakdown: '精确年月日差',
      targetResult: '目标日期',
      weekday: '星期',
      calendarElapsed: '实际跨越自然日',
      todayLabel: '今天',
      daysUnit: '天',
      weeksUnit: '周',
      monthsUnit: '个月',
      yearsUnit: '年',
      countdownFuture: (n: number) => `距今天还有 ${n} 天`,
      countdownPast: (n: number) => `已过 ${n} 天`,
      countdownToday: '就是今天（0 天）',
      countdownWorkdaysFuture: (n: number) => `含工作日 ${n} 天`,
      countdownWorkdaysPast: (n: number) => `已过工作日 ${n} 天`,
      errors: {
        empty: '请选择或输入完整日期以开始计算。',
        invalid_date: '日期格式非法或该日期不存在（请使用 YYYY-MM-DD 格式）。',
        reversed_range: '开始日期不能晚于结束日期，请调整或点击“互换”。',
        invalid_offset: '请输入合法的整数天数（例如 30 或 -15）。',
        out_of_range: '加减天数超出支持范围（±365,000 天以内）。',
      } as Record<DateErrorCode, string>,
      approx: '约',
      modeWorkdays: '仅算工作日',
      modeCalendar: '自然日',
    }
  }, [language])

  const intervalResult = useMemo(
    () => calculateDateInterval(startDate, endDate),
    [startDate, endDate]
  )

  const parsedOffset = useMemo(() => {
    const trimmed = offsetInput.trim()
    if (!trimmed || !/^[+-]?\d+$/.test(trimmed)) return Number.NaN
    return Number(trimmed)
  }, [offsetInput])

  const addSubResult = useMemo(
    () => addDaysToDate(baseDate, parsedOffset, workdaysOnly),
    [baseDate, parsedOffset, workdaysOnly]
  )

  const countdownResult = useMemo(
    () => calculateCountdown(countdownDate, todayISO),
    [countdownDate, todayISO]
  )

  const intervalCopyText = useMemo(() => {
    if (!intervalResult.ok) return ''
    const startWd = getWeekdayLabel(intervalResult.start.dayOfWeek, language)
    const endWd = getWeekdayLabel(intervalResult.end.dayOfWeek, language)
    return [
      `${ui.startDate}: ${intervalResult.start.iso} (${startWd})`,
      `${ui.endDate}: ${intervalResult.end.iso} (${endWd})`,
      `${ui.totalDays}: ${intervalResult.totalDays} ${ui.daysUnit}`,
      `${ui.weeksLabel}: ${intervalResult.weeks} ${ui.weeksUnit} ${intervalResult.remainingDays} ${ui.daysUnit} (${intervalResult.totalWeeksDecimal} ${ui.weeksUnit})`,
      `${ui.monthsLabel}: ${intervalResult.totalMonths} ${ui.monthsUnit} ${intervalResult.days} ${ui.daysUnit} (${ui.approx} ${intervalResult.totalMonthsDecimal} ${ui.monthsUnit})`,
      `${ui.calendarBreakdown}: ${intervalResult.years} ${ui.yearsUnit} ${intervalResult.months} ${ui.monthsUnit} ${intervalResult.days} ${ui.daysUnit}`,
      `${ui.workdays}: ${intervalResult.workdays} ${ui.daysUnit} (${ui.weekendDays}: ${intervalResult.weekendDays} ${ui.daysUnit})`,
    ].join('\n')
  }, [intervalResult, language, ui])

  const addSubCopyText = useMemo(() => {
    if (!addSubResult.ok) return ''
    const baseWd = getWeekdayLabel(addSubResult.base.dayOfWeek, language)
    const targetWd = getWeekdayLabel(addSubResult.target.dayOfWeek, language)
    const sign = addSubResult.inputDelta >= 0 ? '+' : ''
    const modeLabel = addSubResult.workdaysOnly ? ui.modeWorkdays : ui.modeCalendar
    return [
      `${ui.baseDate}: ${addSubResult.base.iso} (${baseWd})`,
      `${ui.daysOffset}: ${sign}${addSubResult.inputDelta} (${modeLabel})`,
      `${ui.targetResult}: ${addSubResult.target.iso} (${targetWd})`,
      `${ui.calendarElapsed}: ${addSubResult.calendarDaysDiff >= 0 ? '+' : ''}${addSubResult.calendarDaysDiff} ${ui.daysUnit}`,
    ].join('\n')
  }, [addSubResult, language, ui])

  const countdownCopyText = useMemo(() => {
    if (!countdownResult.ok) return ''
    const todayWd = getWeekdayLabel(countdownResult.today.dayOfWeek, language)
    const targetWd = getWeekdayLabel(countdownResult.target.dayOfWeek, language)
    const headline =
      countdownResult.status === 'future'
        ? ui.countdownFuture(countdownResult.absDays)
        : countdownResult.status === 'past'
          ? ui.countdownPast(countdownResult.absDays)
          : ui.countdownToday
    return [
      `${ui.todayLabel}: ${countdownResult.today.iso} (${todayWd})`,
      `${ui.targetDate}: ${countdownResult.target.iso} (${targetWd})`,
      headline,
      `${ui.weeksLabel}: ${countdownResult.weeks} ${ui.weeksUnit} ${countdownResult.remainingDays} ${ui.daysUnit}`,
      `${ui.workdays}: ${countdownResult.workdays} ${ui.daysUnit}`,
    ].join('\n')
  }, [countdownResult, language, ui])

  const handleQuickPreset = (preset: QuickPreset) => {
    const val = getQuickDatePreset(preset, todayISO)
    if (tab === 'interval') {
      if (intervalPresetTarget === 'start') {
        setStartDate(val)
      } else {
        setEndDate(val)
      }
    } else if (tab === 'addsub') {
      setBaseDate(val)
    } else {
      setCountdownDate(val)
    }
  }

  const handleClear = () => {
    if (tab === 'interval') {
      setStartDate('')
      setEndDate('')
    } else if (tab === 'addsub') {
      setBaseDate('')
      setOffsetInput('')
      setWorkdaysOnly(false)
    } else {
      setCountdownDate('')
    }
  }

  const activeCopyText =
    tab === 'interval' ? intervalCopyText : tab === 'addsub' ? addSubCopyText : countdownCopyText

  return (
    <ToolPage>
      <div className="flex flex-col gap-5">
        {/* Top bar: Mode Tabs + Clear / Copy */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('interval')}
              className={`btn btn-sm inline-flex items-center gap-1.5 ${
                tab === 'interval' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{ui.tabInterval}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('addsub')}
              className={`btn btn-sm inline-flex items-center gap-1.5 ${
                tab === 'addsub' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <CalendarPlus className="w-4 h-4" />
              <span>{ui.tabAddSub}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('countdown')}
              className={`btn btn-sm inline-flex items-center gap-1.5 ${
                tab === 'countdown' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>{ui.tabCountdown}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CopyButton
              text={activeCopyText}
              label={ui.copyResult}
              className="border border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={handleClear}
              className="btn-ghost btn-sm inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{ui.clear}</span>
            </button>
          </div>
        </div>

        {/* Quick Preset Bar */}
        <div className="card p-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">
            {ui.quickFill}:
          </span>
          {tab === 'interval' && (
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mr-1">
              <button
                type="button"
                onClick={() => setIntervalPresetTarget('start')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  intervalPresetTarget === 'start'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {ui.fillTargetStart}
              </button>
              <button
                type="button"
                onClick={() => setIntervalPresetTarget('end')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  intervalPresetTarget === 'end'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {ui.fillTargetEnd}
              </button>
            </div>
          )}
          {QUICK_PRESETS.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => handleQuickPreset(preset)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {ui.presets[preset]}
            </button>
          ))}
        </div>

        {/* TAB 1: Date Interval */}
        {tab === 'interval' && (
          <div className="card p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <div>
                <label htmlFor="dc-start-date" className="label text-xs">
                  {ui.startDate}
                </label>
                <input
                  id="dc-start-date"
                  type="date"
                  value={startDate}
                  onFocus={() => setIntervalPresetTarget('start')}
                  onChange={e => setStartDate(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setStartDate(endDate)
                  setEndDate(startDate)
                }}
                title={ui.swapDates}
                className="btn btn-secondary btn-sm inline-flex items-center justify-center gap-1.5 h-10 px-3"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{ui.swapDates}</span>
              </button>

              <div>
                <label htmlFor="dc-end-date" className="label text-xs">
                  {ui.endDate}
                </label>
                <input
                  id="dc-end-date"
                  type="date"
                  value={endDate}
                  onFocus={() => setIntervalPresetTarget('end')}
                  onChange={e => setEndDate(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>

            {!intervalResult.ok ? (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{ui.errors['error' in intervalResult ? intervalResult.error : 'invalid_date']}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                {/* Weekday badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{ui.startDate}</div>
                      <div className="font-mono font-semibold text-sm mt-0.5">{intervalResult.start.iso}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300">
                      {getWeekdayLabel(intervalResult.start.dayOfWeek, language)}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{ui.endDate}</div>
                      <div className="font-mono font-semibold text-sm mt-0.5">{intervalResult.end.iso}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300">
                      {getWeekdayLabel(intervalResult.end.dayOfWeek, language)}
                    </span>
                  </div>
                </div>

                {/* Primary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20">
                    <div className="text-xs font-semibold text-brand-700 dark:text-brand-300">{ui.totalDays}</div>
                    <div className="font-mono font-bold text-2xl mt-1 text-brand-600 dark:text-brand-400">
                      {intervalResult.totalDays.toLocaleString()} <span className="text-sm font-normal">{ui.daysUnit}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {intervalResult.years > 0 ? `${intervalResult.years} ${ui.yearsUnit} ` : ''}
                      {intervalResult.months} {ui.monthsUnit} {intervalResult.days} {ui.daysUnit}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">{ui.weeksLabel}</div>
                    <div className="font-mono font-bold text-xl mt-1">
                      {intervalResult.weeks} {ui.weeksUnit} {intervalResult.remainingDays} {ui.daysUnit}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {ui.approx} {intervalResult.totalWeeksDecimal} {ui.weeksUnit}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20">
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">{ui.monthsLabel}</div>
                    <div className="font-mono font-bold text-xl mt-1">
                      {intervalResult.totalMonths} {ui.monthsUnit} {intervalResult.days} {ui.daysUnit}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {ui.approx} {intervalResult.totalMonthsDecimal} {ui.monthsUnit}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{ui.workdays}</div>
                    <div className="font-mono font-bold text-2xl mt-1 text-emerald-600 dark:text-emerald-400">
                      {intervalResult.workdays.toLocaleString()} <span className="text-sm font-normal">{ui.daysUnit}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {ui.weekendDays}: {intervalResult.weekendDays.toLocaleString()} {ui.daysUnit}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Date Add / Subtract */}
        {tab === 'addsub' && (
          <div className="card p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dc-base-date" className="label text-xs">
                  {ui.baseDate}
                </label>
                <input
                  id="dc-base-date"
                  type="date"
                  value={baseDate}
                  onChange={e => setBaseDate(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>

              <div>
                <label htmlFor="dc-offset" className="label text-xs">
                  {ui.daysOffset}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="dc-offset"
                    type="number"
                    step={1}
                    value={offsetInput}
                    onChange={e => setOffsetInput(e.target.value)}
                    placeholder={ui.daysPlaceholder}
                    className="input-field font-mono text-sm"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {[-7, -1, 1, 7, 30].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setOffsetInput(String(n))}
                        className="px-2 py-1.5 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-brand-400 transition-colors"
                      >
                        {n > 0 ? `+${n}` : n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-200 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={workdaysOnly}
                onChange={e => setWorkdaysOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span>{ui.workdaysOnly}</span>
            </label>

            {!addSubResult.ok ? (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{ui.errors['error' in addSubResult ? addSubResult.error : 'invalid_date']}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20 md:col-span-2">
                  <div className="text-xs font-semibold text-brand-700 dark:text-brand-300">{ui.targetResult}</div>
                  <div className="flex flex-wrap items-baseline gap-3 mt-1">
                    <span className="font-mono font-bold text-2xl text-brand-600 dark:text-brand-400">
                      {addSubResult.target.iso}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-200">
                      {getWeekdayLabel(addSubResult.target.dayOfWeek, language)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    {ui.baseDate}: {addSubResult.base.iso} ({getWeekdayLabel(addSubResult.base.dayOfWeek, language)})
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{ui.calendarElapsed}</div>
                  <div className="font-mono font-bold text-2xl mt-1">
                    {addSubResult.calendarDaysDiff > 0 ? `+${addSubResult.calendarDaysDiff}` : addSubResult.calendarDaysDiff}{' '}
                    <span className="text-sm font-normal">{ui.daysUnit}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    {addSubResult.workdaysOnly ? ui.modeWorkdays : ui.modeCalendar}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Countdown */}
        {tab === 'countdown' && (
          <div className="card p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor="dc-countdown-date" className="label text-xs">
                  {ui.targetDate}
                </label>
                <input
                  id="dc-countdown-date"
                  type="date"
                  value={countdownDate}
                  onChange={e => setCountdownDate(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <span>{ui.todayLabel}</span>
                </div>
                <span className="font-mono text-sm font-semibold">
                  {todayISO}
                </span>
              </div>
            </div>

            {!countdownResult.ok ? (
              <div className="flex items-start gap-2.5 p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{ui.errors['error' in countdownResult ? countdownResult.error : 'invalid_date']}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div
                  className={`p-5 rounded-xl border md:col-span-2 ${
                    countdownResult.status === 'future'
                      ? 'border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20'
                      : countdownResult.status === 'past'
                        ? 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20'
                        : 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20'
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {countdownResult.target.iso} · {getWeekdayLabel(countdownResult.target.dayOfWeek, language)}
                  </div>
                  <div className="font-bold text-2xl mt-1.5">
                    {countdownResult.status === 'future'
                      ? ui.countdownFuture(countdownResult.absDays)
                      : countdownResult.status === 'past'
                        ? ui.countdownPast(countdownResult.absDays)
                        : ui.countdownToday}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    {countdownResult.weeks} {ui.weeksUnit} {countdownResult.remainingDays} {ui.daysUnit}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60 flex flex-col justify-center">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{ui.workdays}</div>
                  <div className="font-mono font-bold text-2xl mt-1">
                    {countdownResult.workdays.toLocaleString()} <span className="text-sm font-normal">{ui.daysUnit}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {countdownResult.status === 'past'
                      ? ui.countdownWorkdaysPast(countdownResult.workdays)
                      : ui.countdownWorkdaysFuture(countdownResult.workdays)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
