import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  calculateCompoundInterest,
  type CompoundErrorCode,
  type CompoundFrequency,
  type YearlyGrowthRow,
} from '../../lib/compoundInterest'
import {
  AlertCircle,
  BarChart3,
  Calculator,
  Info,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react'

interface CompoundPreset {
  id: string
  principal: string
  rate: string
  years: string
  frequency: CompoundFrequency
  monthlyContribution: string
  label: {
    'zh-CN': string
    'en-US': string
    'ja-JP': string
  }
}

const COMPOUND_PRESETS: CompoundPreset[] = [
  {
    id: '10w-5-10y',
    principal: '100000',
    rate: '5',
    years: '10',
    frequency: 'annually',
    monthlyContribution: '0',
    label: {
      'zh-CN': '10万 / 5% / 10年（年复利）',
      'en-US': '100K / 5% / 10 yrs (Annual)',
      'ja-JP': '10万 / 5% / 10年（年複利）',
    },
  },
  {
    id: 'dca-1000-8-20y',
    principal: '0',
    rate: '8',
    years: '20',
    frequency: 'monthly',
    monthlyContribution: '1000',
    label: {
      'zh-CN': '月投1000 / 8% / 20年（月复利）',
      'en-US': '1K/mo / 8% / 20 yrs (Monthly)',
      'ja-JP': '毎月1000 / 8% / 20年（月複利）',
    },
  },
  {
    id: '5w-dca-2000-7-15y',
    principal: '50000',
    rate: '7',
    years: '15',
    frequency: 'monthly',
    monthlyContribution: '2000',
    label: {
      'zh-CN': '5万 + 月投2000 / 7% / 15年',
      'en-US': '50K + 2K/mo / 7% / 15 yrs',
      'ja-JP': '5万 + 毎月2000 / 7% / 15年',
    },
  },
  {
    id: '50w-3.5-30y-quarterly',
    principal: '500000',
    rate: '3.5',
    years: '30',
    frequency: 'quarterly',
    monthlyContribution: '0',
    label: {
      'zh-CN': '50万 / 3.5% / 30年（季复利）',
      'en-US': '500K / 3.5% / 30 yrs (Quarterly)',
      'ja-JP': '50万 / 3.5% / 30年（四半期）',
    },
  },
]

const FREQUENCY_ORDER: CompoundFrequency[] = [
  'annually',
  'semiannually',
  'quarterly',
  'monthly',
  'daily',
]

function formatMoney(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatCompactAxis(value: number, language: string): string {
  if (value === 0) return '0'
  if (language === 'en-US') {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return value.toFixed(0)
  }
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}亿`
  if (value >= 10_000) return `${(value / 10_000).toFixed(value >= 100_000 ? 0 : 1)}万`
  return value.toFixed(0)
}

export default function CompoundInterest() {
  const { language } = useI18n()

  const [principalInput, setPrincipalInput] = useState<string>('100000')
  const [rateInput, setRateInput] = useState<string>('5')
  const [yearsInput, setYearsInput] = useState<string>('10')
  const [frequency, setFrequency] = useState<CompoundFrequency>('annually')
  const [contributionInput, setContributionInput] = useState<string>('0')
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        presetsTitle: 'Quick Presets',
        principal: 'Initial Principal',
        principalPlaceholder: 'e.g. 100000 (0 allowed with monthly contribution)',
        annualRate: 'Annual Interest Rate (%)',
        ratePlaceholder: 'e.g. 5',
        years: 'Investment Period (Years)',
        yearsPlaceholder: '1–100',
        frequency: 'Compounding Frequency',
        monthlyContribution: 'Monthly Contribution (Optional)',
        contributionPlaceholder: 'e.g. 1000 (leave 0 for lump sum)',
        currencyUnit: '',
        unitWanShort: '×10k',
        clear: 'Clear',
        copyResult: 'Copy Result',
        finalAmount: 'Final Balance',
        totalInterest: 'Total Interest',
        totalPrincipal: 'Total Principal',
        principalRatio: 'Principal Share',
        interestRatio: 'Interest Share',
        returnMultiple: 'Total Return',
        effectiveRate: 'Effective Annual Rate (EAR)',
        ratioTitle: 'Principal vs Interest Breakdown',
        chartTitle: 'Year-by-Year Growth Chart',
        tableTitle: 'Yearly Growth Breakdown',
        colYear: 'Year',
        colPrincipal: 'Cumulative Principal',
        colInterest: 'Cumulative Interest',
        colYearlyInterest: 'Annual Interest',
        colTotal: 'Total Balance',
        yearLabel: (y: number) => `Yr ${y}`,
        freqLabels: {
          annually: 'Annually (1×/yr)',
          semiannually: 'Semiannually (2×/yr)',
          quarterly: 'Quarterly (4×/yr)',
          monthly: 'Monthly (12×/yr)',
          daily: 'Daily (365×/yr)',
        } as Record<CompoundFrequency, string>,
        disclaimer:
          'Results are theoretical estimates only and do not account for taxes, fees, or inflation. For reference only.',
        emptyHint:
          'Enter principal (or monthly contribution), annual rate, and investment period to calculate.',
        errors: {
          invalid_principal: 'Initial principal must be a number greater than or equal to 0.',
          principal_out_of_range: 'Initial principal cannot exceed 1,000,000,000.',
          invalid_contribution: 'Monthly contribution must be a number greater than or equal to 0.',
          contribution_out_of_range: 'Monthly contribution cannot exceed 100,000,000.',
          zero_investment: 'Initial principal and monthly contribution cannot both be 0.',
          invalid_rate: 'Annual interest rate must be a number greater than or equal to 0%.',
          rate_out_of_range: 'Annual interest rate cannot exceed 100%.',
          invalid_years: 'Investment period must be a positive integer (years).',
          years_out_of_range: 'Investment period must be between 1 and 100 years.',
        } as Record<CompoundErrorCode, string>,
      }
    }

    if (language === 'ja-JP') {
      return {
        presetsTitle: 'よく使うプリセット',
        principal: '初期元金',
        principalPlaceholder: '例: 100000（毎月積立がある場合は 0 も可）',
        annualRate: '年利率（%）',
        ratePlaceholder: '例: 5',
        years: '運用期間（年）',
        yearsPlaceholder: '1〜100',
        frequency: '複利頻度',
        monthlyContribution: '毎月の積立額（任意）',
        contributionPlaceholder: '例: 1000（一括投資のみの場合は 0）',
        currencyUnit: '元',
        unitWanShort: '万',
        clear: 'クリア',
        copyResult: '結果をコピー',
        finalAmount: '満期元利合計',
        totalInterest: '総利息',
        totalPrincipal: '累計元金',
        principalRatio: '元金比率',
        interestRatio: '利息比率',
        returnMultiple: '累計収益率',
        effectiveRate: '実効年利率（EAR）',
        ratioTitle: '元金・利息の内訳',
        chartTitle: '年次推移グラフ',
        tableTitle: '年別成長明細',
        colYear: '年次',
        colPrincipal: '累計元金',
        colInterest: '累計利息',
        colYearlyInterest: '当年利息',
        colTotal: '期末合計',
        yearLabel: (y: number) => `${y}年目`,
        freqLabels: {
          annually: '年1回（年複利）',
          semiannually: '年2回（半年複利）',
          quarterly: '年4回（四半期複利）',
          monthly: '年12回（月複利）',
          daily: '年365回（日複利）',
        } as Record<CompoundFrequency, string>,
        disclaimer:
          '計算結果は理論上の試算であり、税金・手数料・インフレは考慮していません。参考値としてご利用ください。',
        emptyHint:
          '有効な初期元金（または毎月積立額）・年利率・運用期間を入力すると計算結果が表示されます。',
        errors: {
          invalid_principal: '初期元金は 0 以上の数値を入力してください。',
          principal_out_of_range: '初期元金が上限（10億）を超えています。',
          invalid_contribution: '毎月の積立額は 0 以上の数値を入力してください。',
          contribution_out_of_range: '毎月の積立額が上限（1億）を超えています。',
          zero_investment: '初期元金と毎月の積立額を同時に 0 にはできません。',
          invalid_rate: '年利率は 0% 以上の数値を入力してください。',
          rate_out_of_range: '年利率は 100% 以下で入力してください。',
          invalid_years: '運用期間は正の整数（年）で入力してください。',
          years_out_of_range: '運用期間は 1〜100 年の範囲で入力してください。',
        } as Record<CompoundErrorCode, string>,
      }
    }

    return {
      presetsTitle: '常用预设',
      principal: '初始本金（元）',
      principalPlaceholder: '例如 100000（纯定投可填 0）',
      annualRate: '年利率（%）',
      ratePlaceholder: '例如 5',
      years: '投资年限（年）',
      yearsPlaceholder: '1–100',
      frequency: '复利频率',
      monthlyContribution: '每月定投金额（元，可选）',
      contributionPlaceholder: '例如 1000（不定投可留空或填 0）',
      currencyUnit: '元',
      unitWanShort: '万',
      clear: '清空',
      copyResult: '复制结果',
      finalAmount: '到期本息总额',
      totalInterest: '总利息收益',
      totalPrincipal: '累计投入本金',
      principalRatio: '本金占比',
      interestRatio: '利息占比',
      returnMultiple: '累计收益率',
      effectiveRate: '实际年化收益率（EAR）',
      ratioTitle: '本金与利息占比',
      chartTitle: '逐年本息增长简图',
      tableTitle: '逐年本息增长明细',
      colYear: '年份',
      colPrincipal: '本金累计',
      colInterest: '利息累计',
      colYearlyInterest: '当年利息',
      colTotal: '期末总额',
      yearLabel: (y: number) => `第 ${y} 年`,
      freqLabels: {
        annually: '每年复利',
        semiannually: '每半年复利',
        quarterly: '每季度复利',
        monthly: '每月复利',
        daily: '每日复利',
      } as Record<CompoundFrequency, string>,
      disclaimer: '结果为理论测算，未计税费与通胀，仅供参考。',
      emptyHint: '请输入有效的初始本金（或每月定投金额）、年利率与投资年限以查看测算结果。',
      errors: {
        invalid_principal: '初始本金须为大于或等于 0 的数字。',
        principal_out_of_range: '初始本金不能超过 10 亿元。',
        invalid_contribution: '每月定投金额须为大于或等于 0 的数字。',
        contribution_out_of_range: '每月定投金额不能超过 1 亿元。',
        zero_investment: '初始本金与每月定投金额不能同时为 0。',
        invalid_rate: '年利率须为大于或等于 0% 的数字。',
        rate_out_of_range: '年利率不能超过 100%。',
        invalid_years: '投资年限须为正整数（年）。',
        years_out_of_range: '投资年限须在 1 到 100 年之间。',
      } as Record<CompoundErrorCode, string>,
    }
  }, [language])

  const parsedPrincipal =
    principalInput.trim() === '' ? 0 : Number(principalInput)
  const parsedRate = rateInput.trim() === '' ? NaN : Number(rateInput)
  const parsedYears = yearsInput.trim() === '' ? NaN : Number(yearsInput)
  const parsedContribution =
    contributionInput.trim() === '' ? 0 : Number(contributionInput)

  const hasAnyInput = Boolean(
    principalInput.trim() ||
      rateInput.trim() ||
      yearsInput.trim() ||
      contributionInput.trim()
  )

  const calcResult = useMemo(() => {
    return calculateCompoundInterest({
      principal: parsedPrincipal,
      annualRatePercent: parsedRate,
      years: parsedYears,
      frequency,
      monthlyContribution: parsedContribution,
    })
  }, [
    parsedPrincipal,
    parsedRate,
    parsedYears,
    frequency,
    parsedContribution,
  ])

  const applyPreset = (preset: CompoundPreset) => {
    setPrincipalInput(preset.principal)
    setRateInput(preset.rate)
    setYearsInput(preset.years)
    setFrequency(preset.frequency)
    setContributionInput(preset.monthlyContribution)
    setHoveredYear(null)
  }

  const handleClear = () => {
    setPrincipalInput('')
    setRateInput('')
    setYearsInput('')
    setContributionInput('')
    setFrequency('annually')
    setHoveredYear(null)
  }

  const copySummaryText = useMemo(() => {
    if (!calcResult.ok) return ''
    const d = calcResult.data
    const unit = ui.currencyUnit ? ` ${ui.currencyUnit}` : ''
    const returnPct =
      d.totalPrincipal > 0
        ? ((d.totalInterest / d.totalPrincipal) * 100).toFixed(2)
        : '0.00'
    return [
      `${ui.principal}: ${formatMoney(d.principal)}${unit}`,
      `${ui.monthlyContribution}: ${formatMoney(d.monthlyContribution)}${unit}`,
      `${ui.annualRate}: ${d.annualRatePercent}% (${ui.freqLabels[d.frequency]})`,
      `${ui.years}: ${d.years}`,
      `---`,
      `${ui.finalAmount}: ${formatMoney(d.finalAmount)}${unit}`,
      `${ui.totalPrincipal}: ${formatMoney(d.totalPrincipal)}${unit} (${d.principalRatio.toFixed(2)}%)`,
      `${ui.totalInterest}: ${formatMoney(d.totalInterest)}${unit} (${d.interestRatio.toFixed(2)}%)`,
      `${ui.returnMultiple}: +${returnPct}%`,
      `${ui.effectiveRate}: ${d.effectiveAnnualRate.toFixed(2)}%`,
    ].join('\n')
  }, [calcResult, ui])

  // SVG chart metrics
  const chartData = useMemo(() => {
    if (!calcResult.ok) return null
    const rows = calcResult.data.yearlySchedule
    const maxVal = Math.max(...rows.map(r => r.totalAmount), 1)
    const width = 680
    const height = 240
    const padLeft = 56
    const padRight = 16
    const padTop = 18
    const padBottom = 32
    const plotWidth = width - padLeft - padRight
    const plotHeight = height - padTop - padBottom
    const barSlot = plotWidth / rows.length
    const barWidth = Math.max(4, Math.min(28, barSlot * 0.68))

    const ticks = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
      value: maxVal * ratio,
      y: padTop + plotHeight * (1 - ratio),
    }))

    const labelStep =
      rows.length <= 12
        ? 1
        : rows.length <= 25
          ? 2
          : rows.length <= 50
            ? 5
            : 10

    const bars = rows.map((row, index) => {
      const centerX = padLeft + barSlot * index + barSlot / 2
      const totalH = (row.totalAmount / maxVal) * plotHeight
      const principalH = (row.cumulativePrincipal / maxVal) * plotHeight
      const interestH = Math.max(0, totalH - principalH)
      const totalY = padTop + plotHeight - totalH
      const principalY = padTop + plotHeight - principalH
      const showLabel =
        row.year === 1 ||
        row.year === rows.length ||
        row.year % labelStep === 0
      return {
        row,
        x: centerX - barWidth / 2,
        centerX,
        barWidth,
        totalY,
        principalY,
        principalH,
        interestH,
        showLabel,
      }
    })

    const linePoints = bars.map(b => `${b.centerX.toFixed(1)},${b.totalY.toFixed(1)}`).join(' ')

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotWidth,
      plotHeight,
      ticks,
      bars,
      linePoints,
    }
  }, [calcResult])

  const hoveredRow: YearlyGrowthRow | null = useMemo(() => {
    if (!calcResult.ok || hoveredYear === null) return null
    return (
      calcResult.data.yearlySchedule.find(r => r.year === hoveredYear) ?? null
    )
  }, [calcResult, hoveredYear])

  return (
    <ToolPage>
      <div className="space-y-6">
        {/* Presets & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              {ui.presetsTitle}
            </span>
            {COMPOUND_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {preset.label[language] ?? preset.label['zh-CN']}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {calcResult.ok && (
              <CopyButton text={copySummaryText} label={ui.copyResult} />
            )}
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {ui.clear}
            </button>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.principal}
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={principalInput}
                onChange={e => setPrincipalInput(e.target.value)}
                placeholder={ui.principalPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>

            {/* Annual Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.annualRate}
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="100"
                value={rateInput}
                onChange={e => setRateInput(e.target.value)}
                placeholder={ui.ratePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>

            {/* Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.years}
              </label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                max="100"
                value={yearsInput}
                onChange={e => setYearsInput(e.target.value)}
                placeholder={ui.yearsPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>

            {/* Monthly Contribution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.monthlyContribution}
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={contributionInput}
                onChange={e => setContributionInput(e.target.value)}
                placeholder={ui.contributionPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Compounding Frequency Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {ui.frequency}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FREQUENCY_ORDER.map(freq => {
                const active = frequency === freq
                return (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                      active
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {ui.freqLabels[freq]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Validation Errors */}
          {'errors' in calcResult && hasAnyInput && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3.5 text-sm text-red-700 dark:text-red-300 space-y-1">
              {calcResult.errors.map(err => (
                <div key={err} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{ui.errors[err]}</span>
                </div>
              ))}
            </div>
          )}

          {!calcResult.ok && !hasAnyInput && (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>{ui.emptyHint}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {calcResult.ok && (
          <>
            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50/70 dark:from-orange-950/40 dark:to-gray-900 border border-orange-200/80 dark:border-orange-900/60 rounded-xl p-5">
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {ui.finalAmount}
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-gray-50 tracking-tight break-all">
                  {formatMoney(calcResult.data.finalAmount)}
                  {ui.currencyUnit && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {ui.currencyUnit}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {(calcResult.data.finalAmount / 10000).toFixed(2)} {ui.unitWanShort}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.totalInterest}
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight break-all">
                  +{formatMoney(calcResult.data.totalInterest)}
                  {ui.currencyUnit && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {ui.currencyUnit}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {ui.returnMultiple}: +
                  {calcResult.data.totalPrincipal > 0
                    ? (
                        (calcResult.data.totalInterest /
                          calcResult.data.totalPrincipal) *
                        100
                      ).toFixed(2)
                    : '0.00'}
                  %
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.totalPrincipal}
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-gray-900 dark:text-gray-100 tracking-tight break-all">
                  {formatMoney(calcResult.data.totalPrincipal)}
                  {ui.currencyUnit && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {ui.currencyUnit}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {ui.principalRatio}: {calcResult.data.principalRatio.toFixed(1)}% ·{' '}
                  {ui.effectiveRate}: {calcResult.data.effectiveAnnualRate.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Principal vs Interest Ratio Bar */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {ui.ratioTitle}
                </span>
                <div className="flex items-center gap-4 font-mono">
                  <span className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    {ui.totalPrincipal}: {calcResult.data.principalRatio.toFixed(1)}%
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {ui.totalInterest}: {calcResult.data.interestRatio.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${calcResult.data.principalRatio}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${calcResult.data.interestRatio}%` }}
                />
              </div>
            </div>

            {/* Growth Chart (Pure SVG Stacked Bar + Trend Line) */}
            {chartData && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <BarChart3 className="w-4 h-4 text-orange-500" />
                    {ui.chartTitle}
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                      {ui.colPrincipal}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                      {ui.colInterest}
                    </span>
                  </div>
                </div>

                {/* Hover Summary Strip */}
                <div className="min-h-[24px] text-xs font-mono text-gray-600 dark:text-gray-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                  {hoveredRow ? (
                    <>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {ui.yearLabel(hoveredRow.year)}
                      </span>
                      <span>
                        {ui.colPrincipal}: {formatMoney(hoveredRow.cumulativePrincipal)}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {ui.colInterest}: +{formatMoney(hoveredRow.cumulativeInterest)}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {ui.colTotal}: {formatMoney(hoveredRow.totalAmount)}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                      {ui.yearLabel(calcResult.data.years)} · {ui.colTotal}:{' '}
                      {formatMoney(calcResult.data.finalAmount)}
                    </span>
                  )}
                </div>

                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                    className="w-full h-auto min-w-[420px] select-none"
                    role="img"
                    aria-label={ui.chartTitle}
                  >
                    {/* Horizontal gridlines & Y-axis labels */}
                    {chartData.ticks.map((tick, idx) => (
                      <g key={idx}>
                        <line
                          x1={chartData.padLeft}
                          y1={tick.y}
                          x2={chartData.width - chartData.padRight}
                          y2={tick.y}
                          stroke="currentColor"
                          className="text-gray-200 dark:text-gray-800"
                          strokeDasharray={idx === 0 ? undefined : '3 3'}
                        />
                        <text
                          x={chartData.padLeft - 8}
                          y={tick.y + 4}
                          textAnchor="end"
                          className="fill-gray-400 dark:fill-gray-500 text-[10px] font-mono"
                        >
                          {formatCompactAxis(tick.value, language)}
                        </text>
                      </g>
                    ))}

                    {/* Stacked Bars */}
                    {chartData.bars.map(bar => {
                      const isHovered = hoveredYear === bar.row.year
                      return (
                        <g
                          key={bar.row.year}
                          onMouseEnter={() => setHoveredYear(bar.row.year)}
                          onMouseLeave={() => setHoveredYear(null)}
                          className="cursor-pointer"
                        >
                          {/* Cumulative Principal bar (bottom) */}
                          <rect
                            x={bar.x}
                            y={bar.principalY}
                            width={bar.barWidth}
                            height={Math.max(0, bar.principalH)}
                            rx={1}
                            className={
                              isHovered
                                ? 'fill-blue-600 dark:fill-blue-400'
                                : 'fill-blue-500/85 dark:fill-blue-500/80'
                            }
                          />
                          {/* Cumulative Interest bar (top) */}
                          <rect
                            x={bar.x}
                            y={bar.totalY}
                            width={bar.barWidth}
                            height={Math.max(0, bar.interestH)}
                            rx={1}
                            className={
                              isHovered
                                ? 'fill-emerald-600 dark:fill-emerald-400'
                                : 'fill-emerald-500/85 dark:fill-emerald-500/80'
                            }
                          />
                          {/* X-axis Year Label */}
                          {bar.showLabel && (
                            <text
                              x={bar.centerX}
                              y={chartData.height - 10}
                              textAnchor="middle"
                              className="fill-gray-500 dark:fill-gray-400 text-[10px] font-mono"
                            >
                              {bar.row.year}
                            </text>
                          )}
                        </g>
                      )
                    })}

                    {/* Total Balance Trend Polyline */}
                    {chartData.bars.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={chartData.linePoints}
                        className="pointer-events-none"
                      />
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* Yearly Breakdown Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {ui.tableTitle}
                </h2>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {calcResult.data.years}{' '}
                  {language === 'en-US' ? 'yrs' : '年'}
                </span>
              </div>
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/70 text-xs text-gray-500 dark:text-gray-400 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">{ui.colYear}</th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        {ui.colPrincipal}
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        {ui.colInterest}
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        {ui.colYearlyInterest}
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        {ui.colTotal}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono text-xs sm:text-sm">
                    {calcResult.data.yearlySchedule.map(row => (
                      <tr
                        key={row.year}
                        className="hover:bg-orange-50/40 dark:hover:bg-orange-950/20 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-sans font-medium">
                          {ui.yearLabel(row.year)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">
                          {formatMoney(row.cumulativePrincipal)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                          +{formatMoney(row.cumulativeInterest)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400">
                          +{formatMoney(row.yearlyInterest)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100">
                          {formatMoney(row.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 px-1">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
          <span>{ui.disclaimer}</span>
        </div>
      </div>
    </ToolPage>
  )
}
