import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  calculateSavingsGoal,
  type SavingsGoalErrorCode,
} from '../../lib/savingsGoal'
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Info,
  PiggyBank,
  Sparkles,
  Trash2,
} from 'lucide-react'

interface SavingsPreset {
  id: string
  targetAmount: string
  years: string
  rate: string
  initialSavings: string
  label: {
    'zh-CN': string
    'en-US': string
    'ja-JP': string
  }
}

const SAVINGS_PRESETS: SavingsPreset[] = [
  {
    id: 'travel-10w-3y',
    targetAmount: '100000',
    years: '3',
    rate: '3',
    initialSavings: '0',
    label: {
      'zh-CN': '10万旅游基金 / 3年',
      'en-US': '100K Travel Fund / 3 yrs',
      'ja-JP': '10万旅行資金 / 3年',
    },
  },
  {
    id: 'downpayment-50w-5y',
    targetAmount: '500000',
    years: '5',
    rate: '4',
    initialSavings: '100000',
    label: {
      'zh-CN': '50万首付 / 5年',
      'en-US': '500K Down Payment / 5 yrs',
      'ja-JP': '50万頭金 / 5年',
    },
  },
  {
    id: 'retirement-100w-20y',
    targetAmount: '1000000',
    years: '20',
    rate: '6',
    initialSavings: '50000',
    label: {
      'zh-CN': '100万养老 / 20年',
      'en-US': '1M Retirement / 20 yrs',
      'ja-JP': '100万老後資金 / 20年',
    },
  },
  {
    id: 'emergency-5w-1y-zero',
    targetAmount: '50000',
    years: '1',
    rate: '0',
    initialSavings: '5000',
    label: {
      'zh-CN': '5万应急金 / 1年（0%收益）',
      'en-US': '50K Emergency / 1 yr (0%)',
      'ja-JP': '5万緊急資金 / 1年（0%）',
    },
  },
]

function formatMoney(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function SavingsGoalCalculator() {
  const { language } = useI18n()

  const [targetInput, setTargetInput] = useState<string>('100000')
  const [yearsInput, setYearsInput] = useState<string>('3')
  const [rateInput, setRateInput] = useState<string>('3')
  const [initialInput, setInitialInput] = useState<string>('0')

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        presetsTitle: 'Goal Presets',
        targetAmount: 'Target Savings Goal',
        targetPlaceholder: 'e.g. 100000',
        years: 'Savings Horizon (Years)',
        yearsPlaceholder: '1–100',
        annualRate: 'Expected Annual Return (%)',
        ratePlaceholder: 'e.g. 4 (0 allowed)',
        initialSavings: 'Existing Savings (Optional)',
        initialPlaceholder: 'e.g. 20000 (leave 0 if none)',
        currencyUnit: '',
        unitWanShort: '×10k',
        clear: 'Clear',
        copyResult: 'Copy Result',
        monthlyDeposit: 'Required Monthly Deposit',
        perMonth: '/ mo',
        totalPrincipal: 'Total Principal Contributed',
        totalInterest: 'Total Interest Earned',
        effectiveRate: 'Effective Annual Rate (EAR)',
        principalRatio: 'Principal Share',
        interestRatio: 'Interest Share',
        finalBalance: 'Projected Final Balance',
        alreadyReachedBadge:
          'Your existing savings (with expected returns) already meet or exceed the goal — no extra monthly deposit is needed.',
        ratioTitle: 'Principal vs Interest Breakdown',
        tableTitle: 'Year-by-Year Savings Plan',
        colYear: 'Year',
        colYearlyDeposit: 'Annual Deposit',
        colYearlyInterest: 'Annual Interest',
        colCumulativePrincipal: 'Cumulative Principal',
        colBalance: 'Ending Balance',
        yearLabel: (y: number) => `Year ${y}`,
        disclaimer:
          'Calculations are theoretical estimates based on monthly compounding and do not account for taxes, fees, or inflation. For reference only and not investment advice.',
        emptyHint:
          'Enter a target savings goal, horizon (years), and expected annual return to calculate the required monthly deposit.',
        errors: {
          invalid_target: 'Target amount must be a number greater than 0.',
          target_out_of_range: 'Target amount cannot exceed 1,000,000,000.',
          invalid_years: 'Savings horizon must be a positive integer (years).',
          years_out_of_range: 'Savings horizon must be between 1 and 100 years.',
          invalid_rate: 'Expected annual return must be a number greater than or equal to 0%.',
          rate_out_of_range: 'Expected annual return cannot exceed 100%.',
          invalid_initial: 'Existing savings must be a number greater than or equal to 0.',
          initial_out_of_range: 'Existing savings cannot exceed 1,000,000,000.',
        } as Record<SavingsGoalErrorCode, string>,
      }
    }

    if (language === 'ja-JP') {
      return {
        presetsTitle: '目標プリセット',
        targetAmount: '目標金額',
        targetPlaceholder: '例: 100000',
        years: '積立期間（年）',
        yearsPlaceholder: '1〜100',
        annualRate: '想定年利（%）',
        ratePlaceholder: '例: 4（0 も入力可）',
        initialSavings: '現在の貯蓄額（任意）',
        initialPlaceholder: '例: 20000（なければ 0）',
        currencyUnit: '元',
        unitWanShort: '万',
        clear: 'クリア',
        copyResult: '結果をコピー',
        monthlyDeposit: '毎月必要な積立額',
        perMonth: '/ 月',
        totalPrincipal: '総積立元金',
        totalInterest: '運用益（利息）',
        effectiveRate: '実効年利（EAR）',
        principalRatio: '元金比率',
        interestRatio: '利息比率',
        finalBalance: '満期予想残高',
        alreadyReachedBadge:
          '現在の貯蓄額（および想定運用益）のみで目標金額に到達するため、追加の毎月積立は不要です。',
        ratioTitle: '元金と利息の内訳',
        tableTitle: '年別積立プラン明細',
        colYear: '年次',
        colYearlyDeposit: '年間積立額',
        colYearlyInterest: '当年利息',
        colCumulativePrincipal: '累計元金',
        colBalance: '期末残高',
        yearLabel: (y: number) => `${y}年目`,
        disclaimer:
          '計算結果は月次複利に基づく理論試算であり、税金・手数料・インフレは考慮していません。参考値としてご利用ください（投資助言ではありません）。',
        emptyHint:
          '目標金額・積立期間・想定年利を入力すると、毎月必要な積立額と年別プランが表示されます。',
        errors: {
          invalid_target: '目標金額は 0 より大きい数値を入力してください。',
          target_out_of_range: '目標金額は 10 億以下で入力してください。',
          invalid_years: '積立期間は正の整数（年）で入力してください。',
          years_out_of_range: '積立期間は 1〜100 年の範囲で入力してください。',
          invalid_rate: '想定年利は 0% 以上の数値を入力してください。',
          rate_out_of_range: '想定年利は 100% 以下で入力してください。',
          invalid_initial: '現在の貯蓄額は 0 以上の数値を入力してください。',
          initial_out_of_range: '現在の貯蓄額は 10 億以下で入力してください。',
        } as Record<SavingsGoalErrorCode, string>,
      }
    }

    return {
      presetsTitle: '常用目标预设',
      targetAmount: '目标金额（元）',
      targetPlaceholder: '例如 100000',
      years: '储蓄年限（年）',
      yearsPlaceholder: '1–100',
      annualRate: '预期年化收益率（%）',
      ratePlaceholder: '例如 4（可填 0）',
      initialSavings: '已有存款（元，可选）',
      initialPlaceholder: '例如 20000（无则留空或填 0）',
      currencyUnit: '元',
      unitWanShort: '万',
      clear: '清空',
      copyResult: '复制结果',
      monthlyDeposit: '每月需存金额',
      perMonth: '/ 月',
      totalPrincipal: '总存入本金',
      totalInterest: '利息收益',
      effectiveRate: '实际年化收益率（EAR）',
      principalRatio: '本金占比',
      interestRatio: '利息占比',
      finalBalance: '到期预计余额',
      alreadyReachedBadge:
        '当前已有存款（含预期收益）已达到或超过目标金额，无需额外按月存入。',
      ratioTitle: '本金与利息占比',
      tableTitle: '逐年储蓄计划明细',
      colYear: '年份',
      colYearlyDeposit: '每年存入',
      colYearlyInterest: '当年利息',
      colCumulativePrincipal: '累计本金',
      colBalance: '本金余额（期末）',
      yearLabel: (y: number) => `第 ${y} 年`,
      disclaimer:
        '测算基于按月复利、月末定存假设，未计税费与通胀。测算仅供参考，不构成投资建议。',
      emptyHint:
        '请输入有效的目标金额、储蓄年限与预期年化收益率以反推每月需存金额。',
      errors: {
        invalid_target: '目标金额须为大于 0 的数字。',
        target_out_of_range: '目标金额不能超过 10 亿元。',
        invalid_years: '储蓄年限须为正整数（年）。',
        years_out_of_range: '储蓄年限须在 1 到 100 年之间。',
        invalid_rate: '预期年化收益率须为大于或等于 0% 的数字。',
        rate_out_of_range: '预期年化收益率不能超过 100%。',
        invalid_initial: '已有存款须为大于或等于 0 的数字。',
        initial_out_of_range: '已有存款不能超过 10 亿元。',
      } as Record<SavingsGoalErrorCode, string>,
    }
  }, [language])

  const parsedTarget = targetInput.trim() === '' ? NaN : Number(targetInput)
  const parsedYears = yearsInput.trim() === '' ? NaN : Number(yearsInput)
  const parsedRate = rateInput.trim() === '' ? NaN : Number(rateInput)
  const parsedInitial =
    initialInput.trim() === '' ? 0 : Number(initialInput)

  const hasAnyInput = Boolean(
    targetInput.trim() ||
      yearsInput.trim() ||
      rateInput.trim() ||
      initialInput.trim()
  )

  const calcResult = useMemo(() => {
    return calculateSavingsGoal({
      targetAmount: parsedTarget,
      years: parsedYears,
      annualRatePercent: parsedRate,
      initialSavings: parsedInitial,
    })
  }, [parsedTarget, parsedYears, parsedRate, parsedInitial])

  const applyPreset = (preset: SavingsPreset) => {
    setTargetInput(preset.targetAmount)
    setYearsInput(preset.years)
    setRateInput(preset.rate)
    setInitialInput(preset.initialSavings)
  }

  const handleClear = () => {
    setTargetInput('')
    setYearsInput('')
    setRateInput('')
    setInitialInput('')
  }

  const copySummaryText = useMemo(() => {
    if (!calcResult.ok) return ''
    const d = calcResult.data
    const unit = ui.currencyUnit ? ` ${ui.currencyUnit}` : ''
    return [
      `${ui.targetAmount}: ${formatMoney(d.targetAmount)}${unit}`,
      `${ui.years}: ${d.years}`,
      `${ui.annualRate}: ${d.annualRatePercent}%`,
      `${ui.initialSavings}: ${formatMoney(d.initialSavings)}${unit}`,
      `---`,
      `${ui.monthlyDeposit}: ${formatMoney(d.monthlyDeposit)}${unit} ${ui.perMonth}`,
      `${ui.totalPrincipal}: ${formatMoney(d.totalPrincipal)}${unit} (${d.principalRatio.toFixed(2)}%)`,
      `${ui.totalInterest}: ${formatMoney(d.totalInterest)}${unit} (${d.interestRatio.toFixed(2)}%)`,
      `${ui.finalBalance}: ${formatMoney(d.finalBalance)}${unit}`,
      `${ui.effectiveRate}: ${d.effectiveAnnualRate.toFixed(2)}%`,
    ].join('\n')
  }, [calcResult, ui])

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
            {SAVINGS_PRESETS.map(preset => (
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
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.targetAmount}
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={targetInput}
                onChange={e => setTargetInput(e.target.value)}
                placeholder={ui.targetPlaceholder}
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

            {/* Expected Annual Rate */}
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

            {/* Initial Savings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.initialSavings}
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={initialInput}
                onChange={e => setInitialInput(e.target.value)}
                placeholder={ui.initialPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
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
            {calcResult.data.alreadyReached && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{ui.alreadyReachedBadge}</span>
              </div>
            )}

            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50/70 dark:from-orange-950/40 dark:to-gray-900 border border-orange-200/80 dark:border-orange-900/60 rounded-xl p-5">
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                  <PiggyBank className="w-3.5 h-3.5" />
                  {ui.monthlyDeposit}
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-gray-50 tracking-tight break-all">
                  {formatMoney(calcResult.data.monthlyDeposit)}
                  {ui.currencyUnit && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {ui.currencyUnit}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {calcResult.data.totalMonths} {ui.perMonth}
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
                  {ui.principalRatio}: {calcResult.data.principalRatio.toFixed(1)}%
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
                  {ui.interestRatio}: {calcResult.data.interestRatio.toFixed(1)}%
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.effectiveRate}
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tracking-tight">
                  {calcResult.data.effectiveAnnualRate.toFixed(2)}%
                </div>
                <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {ui.finalBalance}: {(calcResult.data.finalBalance / 10000).toFixed(2)}{' '}
                  {ui.unitWanShort}
                </div>
              </div>
            </div>

            {/* Pure SVG Principal vs Interest Ratio Bar */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {ui.ratioTitle}
                </span>
                <div className="flex flex-wrap items-center gap-4 font-mono">
                  <span className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    {ui.totalPrincipal}: {formatMoney(calcResult.data.totalPrincipal)} (
                    {calcResult.data.principalRatio.toFixed(1)}%)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {ui.totalInterest}: {formatMoney(calcResult.data.totalInterest)} (
                    {calcResult.data.interestRatio.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <svg
                viewBox="0 0 600 28"
                className="w-full h-7 select-none"
                role="img"
                aria-label={`${ui.ratioTitle}: ${calcResult.data.principalRatio.toFixed(1)}% / ${calcResult.data.interestRatio.toFixed(1)}%`}
              >
                <defs>
                  <clipPath id="savings-ratio-clip">
                    <rect x="0" y="2" width="600" height="24" rx="12" ry="12" />
                  </clipPath>
                </defs>
                <g clipPath="url(#savings-ratio-clip)">
                  <rect
                    x="0"
                    y="2"
                    width="600"
                    height="24"
                    className="fill-gray-100 dark:fill-gray-800"
                  />
                  <rect
                    x="0"
                    y="2"
                    width={Math.max(0, (calcResult.data.principalRatio / 100) * 600)}
                    height="24"
                    className="fill-blue-500 transition-all"
                  />
                  <rect
                    x={(calcResult.data.principalRatio / 100) * 600}
                    y="2"
                    width={Math.max(0, (calcResult.data.interestRatio / 100) * 600)}
                    height="24"
                    className="fill-emerald-500 transition-all"
                  />
                </g>
                {calcResult.data.principalRatio >= 14 && (
                  <text
                    x={((calcResult.data.principalRatio / 100) * 600) / 2}
                    y="18"
                    textAnchor="middle"
                    className="fill-white text-[11px] font-mono font-semibold"
                  >
                    {calcResult.data.principalRatio.toFixed(1)}%
                  </text>
                )}
                {calcResult.data.interestRatio >= 14 && (
                  <text
                    x={
                      (calcResult.data.principalRatio / 100) * 600 +
                      ((calcResult.data.interestRatio / 100) * 600) / 2
                    }
                    y="18"
                    textAnchor="middle"
                    className="fill-white text-[11px] font-mono font-semibold"
                  >
                    {calcResult.data.interestRatio.toFixed(1)}%
                  </text>
                )}
              </svg>
            </div>

            {/* Yearly Savings Schedule Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {ui.tableTitle}
                </h2>
                <span className="text-xs font-mono text-gray-400">
                  {calcResult.data.yearlySchedule.length}
                </span>
              </div>
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/70 text-xs text-gray-500 dark:text-gray-400 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">{ui.colYear}</th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        {ui.colYearlyDeposit}
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        {ui.colYearlyInterest}
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        {ui.colCumulativePrincipal}
                      </th>
                      <th className="px-4 py-2.5 font-medium text-right">
                        {ui.colBalance}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono text-xs sm:text-sm">
                    {calcResult.data.yearlySchedule.map(row => (
                      <tr
                        key={row.year}
                        className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-sans font-medium whitespace-nowrap">
                          {ui.yearLabel(row.year)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">
                          {formatMoney(row.yearlyDeposit)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                          +{formatMoney(row.yearlyInterest)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-blue-600 dark:text-blue-400">
                          {formatMoney(row.cumulativePrincipal)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100">
                          {formatMoney(row.endingBalance)}
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
        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
          <span>{ui.disclaimer}</span>
        </div>
      </div>
    </ToolPage>
  )
}
