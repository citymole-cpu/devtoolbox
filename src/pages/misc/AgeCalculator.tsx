import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  calculateAge,
  getTodayISO,
  getWeekdayLabel,
  parseFlexibleDate,
  type AgeErrorCode,
} from '../../lib/ageCalculator'
import {
  AlertCircle,
  Cake,
  Calendar,
  CalendarClock,
  Clock,
  Info,
  Sparkles,
  Trash2,
} from 'lucide-react'

const SAMPLE_BIRTHDATES = [
  { iso: '1995-06-15', key: 'sample95' as const },
  { iso: '2000-02-29', key: 'sampleLeap' as const },
  { iso: '2010-10-01', key: 'sample10' as const },
]

export default function AgeCalculator() {
  const { language } = useI18n()

  const todayISO = useMemo(() => getTodayISO(), [])
  const [birthInput, setBirthInput] = useState<string>('1995-06-15')
  const [targetInput, setTargetInput] = useState<string>(todayISO)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        birthLabel: 'Date of Birth',
        birthPlaceholder: 'YYYY-MM-DD (e.g. 1995-06-15)',
        targetLabel: 'Calculate Age As Of (optional, default Today)',
        targetPlaceholder: `Default: ${todayISO}`,
        setToday: 'Today',
        quickSamples: 'Quick Examples',
        sample95: '1995-06-15',
        sampleLeap: '2000-02-29 (Leap Day)',
        sample10: '2010-10-01',
        clear: 'Clear',
        copyResult: 'Copy Result',
        exactAgeTitle: 'Exact Age',
        yearsUnit: 'yrs',
        monthsUnit: 'mos',
        daysUnit: 'days',
        weeksUnit: 'wks',
        hoursUnit: 'hrs',
        totalDays: 'Total Days Lived',
        totalWeeks: 'Total Weeks',
        totalMonths: 'Total Months',
        totalHours: 'Total Hours (approx.)',
        nextBirthday: 'Next Birthday',
        birthdayTodayBadge: 'Happy Birthday! Today is the birthday',
        countdownText: (days: number, age: number) =>
          days === 0
            ? `Turning ${age} today!`
            : `${days} day${days === 1 ? '' : 's'} until turning ${age}`,
        leapObservedNote: 'Observed on Feb 28 in non-leap year',
        nextTrueLeapLabel: 'Next actual Feb 29',
        daysRemainingShort: (n: number) => (n === 0 ? 'Today' : `in ${n} day${n === 1 ? '' : 's'}`),
        birthWeekday: 'Born on Weekday',
        chineseZodiac: 'Chinese Zodiac',
        westernZodiac: 'Western Zodiac',
        approx: 'approx.',
        rulesTitle: 'Calculation Notes',
        rulesItems: [
          'Exact age (years, months, days) is calculated by calendar date difference between birth date and target date.',
          'Chinese Zodiac is derived from the Gregorian birth year ((year - 4) mod 12), without Lunar New Year / Lichun boundary adjustment.',
          'Western Zodiac is derived from the standard Gregorian month/day date ranges.',
          'For Feb 29 leap-day births, the annual birthday countdown uses Feb 28 in non-leap years and also displays the next actual Feb 29.',
        ],
        errors: {
          empty_birth: 'Please enter or select a date of birth to calculate.',
          invalid_birth: 'Invalid birth date format or nonexistent calendar date (expected YYYY-MM-DD).',
          invalid_target: 'Invalid target date format or nonexistent calendar date (expected YYYY-MM-DD).',
          birth_in_future: 'Birth date cannot be in the future (later than today).',
          birth_after_target: 'Birth date cannot be later than the target calculation date.',
        } as Record<AgeErrorCode, string>,
        summaryHeader: 'Age Calculation Result',
        summaryBirth: 'Birth Date',
        summaryTarget: 'Calculated As Of',
        summaryAge: 'Exact Age',
      }
    }

    if (language === 'ja-JP') {
      return {
        birthLabel: '生年月日',
        birthPlaceholder: 'YYYY-MM-DD（例: 1995-06-15）',
        targetLabel: '基準日（任意・デフォルトは今日）',
        targetPlaceholder: `デフォルト: ${todayISO}`,
        setToday: '今日にする',
        quickSamples: 'サンプル日付',
        sample95: '1995-06-15',
        sampleLeap: '2000-02-29（うるう日）',
        sample10: '2010-10-01',
        clear: 'クリア',
        copyResult: '結果をコピー',
        exactAgeTitle: '満年齢（正確）',
        yearsUnit: '歳',
        monthsUnit: 'ヶ月',
        daysUnit: '日',
        weeksUnit: '週',
        hoursUnit: '時間',
        totalDays: '生まれてからの総日数',
        totalWeeks: '総週数',
        totalMonths: '総月数',
        totalHours: '総時間数（概算）',
        nextBirthday: '次の誕生日',
        birthdayTodayBadge: 'お誕生日おめでとうございます！今日が誕生日です',
        countdownText: (days: number, age: number) =>
          days === 0
            ? `今日で ${age} 歳になります！`
            : `${age} 歳の誕生日まであと ${days} 日`,
        leapObservedNote: '平年は 2 月 28 日換算',
        nextTrueLeapLabel: '次の本当の 2 月 29 日',
        daysRemainingShort: (n: number) => (n === 0 ? '今日' : `あと ${n} 日`),
        birthWeekday: '生まれた曜日',
        chineseZodiac: '干支（十二支）',
        westernZodiac: '星座（12星座）',
        approx: '約',
        rulesTitle: '計算ルールについて',
        rulesItems: [
          '正確な年齢（歳・ヶ月・日）は、生年月日と基準日の暦差に基づいて算出します。',
          '干支（十二支）は西暦の生まれ年（(年 - 4) mod 12）で判定しています（立春・旧正月の境界は考慮しません）。',
          '星座は一般的な西暦の月日区分に基づいて判定しています。',
          '2 月 29 日生まれの場合、平年の誕生日カウントダウンは 2 月 28 日を基準とし、併せて次の本当の 2 月 29 日も表示します。',
        ],
        errors: {
          empty_birth: '生年月日を入力または選択してください。',
          invalid_birth: '生年月日の形式が不正か、存在しない日付です（YYYY-MM-DD 形式）。',
          invalid_target: '基準日の形式が不正か、存在しない日付です（YYYY-MM-DD 形式）。',
          birth_in_future: '未来の日付は生年月日として指定できません。',
          birth_after_target: '生年月日が基準日より後の日付になっています。',
        } as Record<AgeErrorCode, string>,
        summaryHeader: '年齢計算結果',
        summaryBirth: '生年月日',
        summaryTarget: '基準日',
        summaryAge: '満年齢',
      }
    }

    return {
      birthLabel: '出生日期',
      birthPlaceholder: 'YYYY-MM-DD（如 1995-06-15）',
      targetLabel: '计算到哪一天（可选，默认今天）',
      targetPlaceholder: `默认今天：${todayISO}`,
      setToday: '设为今天',
      quickSamples: '常用示例',
      sample95: '1995-06-15',
      sampleLeap: '2000-02-29（闰年生日）',
      sample10: '2010-10-01',
      clear: '清空',
      copyResult: '复制结果',
      exactAgeTitle: '精确周岁年龄',
      yearsUnit: '岁',
      monthsUnit: '个月',
      daysUnit: '天',
      weeksUnit: '周',
      hoursUnit: '小时',
      totalDays: '累计生存天数',
      totalWeeks: '总周数',
      totalMonths: '总月数',
      totalHours: '总小时数（估算）',
      nextBirthday: '下个生日',
      birthdayTodayBadge: '生日快乐！今天就是生日',
      countdownText: (days: number, age: number) =>
        days === 0 ? `今天满 ${age} 岁！` : `距离 ${age} 岁生日还有 ${days} 天`,
      leapObservedNote: '非闰年按 2 月 28 日计算',
      nextTrueLeapLabel: '下一个真正的 2 月 29 日',
      daysRemainingShort: (n: number) => (n === 0 ? '就是今天' : `还有 ${n} 天`),
      birthWeekday: '出生星期几',
      chineseZodiac: '生肖',
      westernZodiac: '星座',
      approx: '约',
      rulesTitle: '计算规则说明',
      rulesItems: [
        '精确年龄（岁 / 月 / 天）按出生日期至目标日期的公历自然年月日差计算。',
        '生肖按公历出生年份常规规则推算（(年份 - 4) % 12），未按农历春节或立春分界细分。',
        '星座按常规公历出生月日区间划分。',
        '闰年 2 月 29 日出生者在非闰年默认按 2 月 28 日计算每年倒计时，并同时显示下一个真正的 2 月 29 日。',
      ],
      errors: {
        empty_birth: '请输入或选择出生日期以开始计算。',
        invalid_birth: '出生日期格式非法或该日期不存在（请使用 YYYY-MM-DD 格式，如 1995-06-15）。',
        invalid_target: '目标计算日期格式非法或不存在（请使用 YYYY-MM-DD 格式）。',
        birth_in_future: '出生日期不能是未来日期（晚于今天）。',
        birth_after_target: '出生日期不能晚于所选的计算基准日期。',
      } as Record<AgeErrorCode, string>,
      summaryHeader: '年龄计算结果',
      summaryBirth: '出生日期',
      summaryTarget: '计算基准日',
      summaryAge: '精确年龄',
    }
  }, [language, todayISO])

  const result = useMemo(
    () => calculateAge(birthInput, targetInput, todayISO),
    [birthInput, targetInput, todayISO]
  )

  const birthPickerValue = useMemo(() => parseFlexibleDate(birthInput)?.iso ?? '', [birthInput])
  const targetPickerValue = useMemo(
    () => (targetInput.trim() ? (parseFlexibleDate(targetInput)?.iso ?? '') : todayISO),
    [targetInput, todayISO]
  )

  const copyText = useMemo(() => {
    if (!result.ok) return ''
    const birthWd = getWeekdayLabel(result.birthWeekday, language)
    const nextBdayWd = getWeekdayLabel(result.nextBirthday.date.dayOfWeek, language)
    const lines = [
      ui.summaryHeader,
      `${ui.summaryBirth}: ${result.birth.iso} (${birthWd})`,
      `${ui.summaryTarget}: ${result.target.iso}`,
      `${ui.summaryAge}: ${result.years} ${ui.yearsUnit} ${result.months} ${ui.monthsUnit} ${result.days} ${ui.daysUnit}`,
      `${ui.totalDays}: ${result.totalDays.toLocaleString()} ${ui.daysUnit}`,
      `${ui.totalWeeks}: ${result.totalWeeks.toLocaleString()} ${ui.weeksUnit} ${result.remainingDaysInWeeks} ${ui.daysUnit} (${result.totalWeeksDecimal} ${ui.weeksUnit})`,
      `${ui.totalMonths}: ${result.totalMonths.toLocaleString()} ${ui.monthsUnit} ${result.remainingDaysInMonths} ${ui.daysUnit} (${ui.approx} ${result.totalMonthsDecimal} ${ui.monthsUnit})`,
      `${ui.nextBirthday}: ${result.nextBirthday.date.iso} (${nextBdayWd}) - ${ui.countdownText(result.nextBirthday.daysUntil, result.nextBirthday.upcomingAge)}`,
      `${ui.chineseZodiac}: ${result.chineseZodiac.names[language]}`,
      `${ui.westernZodiac}: ${result.zodiacSign.names[language]} (${result.zodiacSign.range})`,
    ]
    if (result.nextBirthday.nextTrueLeapBirthday) {
      lines.push(
        `${ui.nextTrueLeapLabel}: ${result.nextBirthday.nextTrueLeapBirthday.date.iso} (${ui.daysRemainingShort(result.nextBirthday.nextTrueLeapBirthday.daysUntil)})`
      )
    }
    return lines.join('\n')
  }, [result, language, ui])

  const handleClear = () => {
    setBirthInput('')
    setTargetInput(todayISO)
  }

  return (
    <ToolPage>
      <div className="flex flex-col gap-5">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {ui.quickSamples}:
            </span>
            {SAMPLE_BIRTHDATES.map(sample => (
              <button
                key={sample.iso}
                type="button"
                onClick={() => setBirthInput(sample.iso)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {ui[sample.key]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <CopyButton
              text={copyText}
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

        {/* Input Card */}
        <div className="card p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Birth Date Input: Manual text + Native Date Picker */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="age-birth-text" className="label text-xs flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-brand-500" />
                <span>{ui.birthLabel}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="age-birth-text"
                  type="text"
                  inputMode="numeric"
                  value={birthInput}
                  onChange={e => setBirthInput(e.target.value)}
                  placeholder={ui.birthPlaceholder}
                  className="input-field font-mono text-sm flex-1"
                />
                <input
                  aria-label={ui.birthLabel}
                  type="date"
                  value={birthPickerValue}
                  max={todayISO}
                  onChange={e => setBirthInput(e.target.value)}
                  className="input-field font-mono text-sm w-40 shrink-0"
                />
              </div>
            </div>

            {/* Target Date Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="age-target-text" className="label text-xs flex items-center gap-1.5 mb-0">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  <span>{ui.targetLabel}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTargetInput(todayISO)}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {ui.setToday}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="age-target-text"
                  type="text"
                  inputMode="numeric"
                  value={targetInput}
                  onChange={e => setTargetInput(e.target.value)}
                  placeholder={ui.targetPlaceholder}
                  className="input-field font-mono text-sm flex-1"
                />
                <input
                  aria-label={ui.targetLabel}
                  type="date"
                  value={targetPickerValue}
                  onChange={e => setTargetInput(e.target.value)}
                  className="input-field font-mono text-sm w-40 shrink-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {'error' in result && (
          <div
            role="alert"
            className="card p-4 border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 flex items-start gap-2.5 text-sm text-red-700 dark:text-red-300"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{ui.errors[result.error]}</span>
          </div>
        )}

        {/* Result Display */}
        {result.ok && (
          <>
            {/* Hero Exact Age Card */}
            <div className="card p-6 bg-gradient-to-br from-brand-50/70 via-white to-orange-50/40 dark:from-brand-950/30 dark:via-gray-900 dark:to-gray-900 border-brand-200/80 dark:border-brand-800/50">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {ui.exactAgeTitle}
                </span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {result.birth.iso} → {result.target.iso}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-bold font-mono text-gray-900 dark:text-white">
                    {result.years}
                  </span>
                  <span className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300">
                    {ui.yearsUnit}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-brand-600 dark:text-brand-400">
                    {result.months}
                  </span>
                  <span className="text-base font-medium text-gray-600 dark:text-gray-300">
                    {ui.monthsUnit}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-brand-600 dark:text-brand-400">
                    {result.days}
                  </span>
                  <span className="text-base font-medium text-gray-600 dark:text-gray-300">
                    {ui.daysUnit}
                  </span>
                </div>
              </div>

              {result.nextBirthday.isToday && (
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  <Cake className="w-3.5 h-3.5" />
                  <span>{ui.birthdayTodayBadge}</span>
                </div>
              )}
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{ui.totalDays}</span>
                <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
                  {result.totalDays.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{ui.daysUnit}</span>
              </div>

              <div className="card p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{ui.totalWeeks}</span>
                <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
                  {result.totalWeeks.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                    {ui.weeksUnit} {result.remainingDaysInWeeks} {ui.daysUnit}
                  </span>
                </span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {ui.approx} {result.totalWeeksDecimal.toLocaleString()} {ui.weeksUnit}
                </span>
              </div>

              <div className="card p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{ui.totalMonths}</span>
                <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
                  {result.totalMonths.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                    {ui.monthsUnit} {result.remainingDaysInMonths} {ui.daysUnit}
                  </span>
                </span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {ui.approx} {result.totalMonthsDecimal.toLocaleString()} {ui.monthsUnit}
                </span>
              </div>

              <div className="card p-4 flex flex-col gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {ui.totalHours}
                </span>
                <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
                  {result.totalHours.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{ui.hoursUnit}</span>
              </div>
            </div>

            {/* Next Birthday + Birth Info & Zodiacs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Next Birthday Card */}
              <div className="card p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-brand-500" />
                    {ui.nextBirthday}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {getWeekdayLabel(result.nextBirthday.date.dayOfWeek, language)}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                    {result.nextBirthday.date.iso}
                  </span>
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {ui.countdownText(result.nextBirthday.daysUntil, result.nextBirthday.upcomingAge)}
                  </span>
                </div>

                {result.nextBirthday.observedOnFeb28 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {ui.leapObservedNote}
                  </p>
                )}

                {result.nextBirthday.nextTrueLeapBirthday && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <span>{ui.nextTrueLeapLabel}</span>
                    <span className="font-mono font-semibold">
                      {result.nextBirthday.nextTrueLeapBirthday.date.iso} (
                      {ui.daysRemainingShort(result.nextBirthday.nextTrueLeapBirthday.daysUntil)})
                    </span>
                  </div>
                )}
              </div>

              {/* Weekday, Chinese Zodiac, Western Zodiac */}
              <div className="card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {ui.birthWeekday}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {getWeekdayLabel(result.birthWeekday, language)}
                  </span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {result.birth.iso}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {ui.chineseZodiac}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <span>{result.chineseZodiac.emoji}</span>
                    <span>{result.chineseZodiac.names[language]}</span>
                  </span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {result.birth.year}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {ui.westernZodiac}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <span>{result.zodiacSign.symbol}</span>
                    <span>{result.zodiacSign.names[language]}</span>
                  </span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {result.zodiacSign.range}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Rules / Notes Card */}
        <div className="card p-4 bg-gray-50/70 dark:bg-gray-900/50 text-xs text-gray-600 dark:text-gray-400 flex flex-col gap-1.5">
          <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-500" />
            <span>{ui.rulesTitle}</span>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {ui.rulesItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </ToolPage>
  )
}
