import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  calculateMortgage,
  calculatePrepayment,
  type MortgageErrorCode,
  type PrepaymentErrorCode,
  type RepaymentMethod,
  type ScheduleRow,
} from '../../lib/mortgageCalculator'
import {
  AlertCircle,
  Calculator,
  Info,
  Sparkles,
  Trash2,
  TrendingDown,
} from 'lucide-react'

type AmountUnit = 'wan' | 'yuan'

interface MortgagePreset {
  id: string
  amountWan: string
  years: string
  rate: string
  label: {
    'zh-CN': string
    'en-US': string
    'ja-JP': string
  }
}

const MORTGAGE_PRESETS: MortgagePreset[] = [
  {
    id: '100w-30y-3.5',
    amountWan: '100',
    years: '30',
    rate: '3.5',
    label: {
      'zh-CN': '100万 / 30年 / 3.5%',
      'en-US': '1M / 30 yrs / 3.5%',
      'ja-JP': '100万 / 30年 / 3.5%',
    },
  },
  {
    id: '200w-20y-4.0',
    amountWan: '200',
    years: '20',
    rate: '4',
    label: {
      'zh-CN': '200万 / 20年 / 4.0%',
      'en-US': '2M / 20 yrs / 4.0%',
      'ja-JP': '200万 / 20年 / 4.0%',
    },
  },
  {
    id: '150w-25y-3.1',
    amountWan: '150',
    years: '25',
    rate: '3.1',
    label: {
      'zh-CN': '150万 / 25年 / 3.1%',
      'en-US': '1.5M / 25 yrs / 3.1%',
      'ja-JP': '150万 / 25年 / 3.1%',
    },
  },
  {
    id: '50w-15y-2.85',
    amountWan: '50',
    years: '15',
    rate: '2.85',
    label: {
      'zh-CN': '50万 / 15年 / 2.85%',
      'en-US': '500K / 15 yrs / 2.85%',
      'ja-JP': '50万 / 15年 / 2.85%',
    },
  },
]

function formatMoney(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function MortgageCalculator() {
  const { language } = useI18n()

  const [unit, setUnit] = useState<AmountUnit>('wan')
  const [amountInput, setAmountInput] = useState<string>('100')
  const [rateInput, setRateInput] = useState<string>('3.5')
  const [yearsInput, setYearsInput] = useState<string>('30')
  const [method, setMethod] = useState<RepaymentMethod>('equal-payment')

  // Optional prepayment simulation
  const [enablePrepay, setEnablePrepay] = useState<boolean>(false)
  const [prepayAmountInput, setPrepayAmountInput] = useState<string>('20')
  const [prepayMonthInput, setPrepayMonthInput] = useState<string>('36')

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        presetsTitle: 'Quick Presets',
        loanAmount: 'Loan Amount',
        unitWan: '×10,000',
        unitYuan: 'Exact',
        unitWanShort: '×10k',
        currencyUnit: '',
        annualRate: 'Annual Interest Rate (%)',
        loanYears: 'Loan Term (Years)',
        yearsPlaceholder: '1–50',
        ratePlaceholder: 'e.g. 3.5',
        amountPlaceholderWan: 'e.g. 100 (= 1,000,000)',
        amountPlaceholderYuan: 'e.g. 1000000',
        repaymentMethod: 'Repayment Method',
        equalPayment: 'Equal Principal & Interest',
        equalPaymentHint: 'Fixed monthly payment throughout the term',
        equalPrincipal: 'Equal Principal',
        equalPrincipalHint: 'Higher initial payment, decreasing every month',
        clear: 'Clear',
        copyResult: 'Copy Result',
        monthlyPayment: 'Monthly Payment',
        firstMonthPayment: 'First Month Payment',
        lastMonthPayment: 'Last Month Payment',
        monthlyDecrease: 'Monthly Decrease',
        totalInterest: 'Total Interest',
        totalPayment: 'Total Repayment',
        principalLabel: 'Loan Principal',
        totalMonthsLabel: (m: number) => `${m} months`,
        principalRatio: 'Principal / Interest Ratio',
        prepayTitle: 'Prepayment Simulation (Optional)',
        prepayToggle: 'Enable early repayment calculation (shorten term)',
        prepayAmount: 'Prepayment Amount',
        prepayMonth: 'Prepay After Month #',
        prepayMonthPlaceholder: 'e.g. 36 (after 3 years)',
        interestSaved: 'Interest Saved',
        termShortened: 'Term Shortened',
        newTotalInterest: 'New Total Interest',
        remainingAfterPrepay: 'Remaining Principal After Prepay',
        paidOffEarly: 'Fully paid off early!',
        scheduleTitle: 'Amortization Schedule (First 12 & Last 12 Months)',
        scheduleTitleAll: 'Amortization Schedule (All Months)',
        colPeriod: 'Month',
        colPayment: 'Payment',
        colPrincipal: 'Principal',
        colInterest: 'Interest',
        colRemaining: 'Remaining Balance',
        omittedRow: (count: number) => `... ${count} middle months omitted ...`,
        formatMonths: (m: number) => {
          const y = Math.floor(m / 12)
          const rem = m % 12
          if (y === 0) return `${rem} mo${rem === 1 ? '' : 's'}`
          if (rem === 0) return `${y} yr${y === 1 ? '' : 's'}`
          return `${y} yr${y === 1 ? '' : 's'} ${rem} mo${rem === 1 ? '' : 's'}`
        },
        disclaimer:
          'For reference only. Actual monthly payments and interest are subject to your bank contract and lending terms.',
        emptyHint: 'Enter a valid loan amount, annual interest rate, and term to view results.',
        errors: {
          invalid_amount: 'Loan amount must be a positive number greater than 0.',
          amount_out_of_range: 'Loan amount exceeds the supported maximum (1,000,000,000).',
          invalid_rate: 'Annual interest rate must be greater than 0%.',
          rate_out_of_range: 'Annual interest rate cannot exceed 100%.',
          invalid_years: 'Loan term must be a positive integer (years).',
          years_out_of_range: 'Loan term must be between 1 and 50 years.',
        } as Record<MortgageErrorCode, string>,
        prepayErrors: {
          invalid_prepay_amount: 'Prepayment amount must be a positive number.',
          invalid_prepay_month: (max: number) =>
            `Prepayment month must be an integer between 1 and ${max}.`,
        },
      }
    }

    if (language === 'ja-JP') {
      return {
        presetsTitle: 'よく使うプリセット',
        loanAmount: '借入金額',
        unitWan: '万単位',
        unitYuan: '円/元',
        unitWanShort: '万',
        currencyUnit: '元',
        annualRate: '年利率（%）',
        loanYears: '返済期間（年）',
        yearsPlaceholder: '1〜50',
        ratePlaceholder: '例: 3.5',
        amountPlaceholderWan: '例: 100（100万）',
        amountPlaceholderYuan: '例: 1000000',
        repaymentMethod: '返済方式',
        equalPayment: '元利均等返済',
        equalPaymentHint: '毎月の返済額が一定',
        equalPrincipal: '元金均等返済',
        equalPrincipalHint: '初回が高く、毎月一定額ずつ減少',
        clear: 'クリア',
        copyResult: '結果をコピー',
        monthlyPayment: '毎月返済額',
        firstMonthPayment: '初回返済額',
        lastMonthPayment: '最終回返済額',
        monthlyDecrease: '毎月の減少額',
        totalInterest: '総利息',
        totalPayment: '返済総額',
        principalLabel: '借入元金',
        totalMonthsLabel: (m: number) => `全 ${m} 回`,
        principalRatio: '元金・利息の内訳',
        prepayTitle: '繰上返済シミュレーション（任意）',
        prepayToggle: '繰上返済（期間短縮型）を試算する',
        prepayAmount: '繰上返済額',
        prepayMonth: '繰上返済の時期（何回目返済後）',
        prepayMonthPlaceholder: '例: 36（3年後）',
        interestSaved: '軽減される利息',
        termShortened: '短縮される期間',
        newTotalInterest: '繰上後の総利息',
        remainingAfterPrepay: '繰上後の残元金',
        paidOffEarly: '一括完済となります',
        scheduleTitle: '返済明細（最初の12回・最後の12回）',
        scheduleTitleAll: '返済明細（全期間）',
        colPeriod: '回数',
        colPayment: '返済額',
        colPrincipal: '元金',
        colInterest: '利息',
        colRemaining: '残元金',
        omittedRow: (count: number) => `… 中間 ${count} 回を省略 …`,
        formatMonths: (m: number) => {
          const y = Math.floor(m / 12)
          const rem = m % 12
          if (y === 0) return `${rem}ヶ月`
          if (rem === 0) return `${y}年`
          return `${y}年${rem}ヶ月`
        },
        disclaimer:
          '計算結果は参考値です。実際の返済額や金利条件は金融機関の契約内容に従います。',
        emptyHint: '有効な借入金額・年利率・返済期間を入力すると計算結果が表示されます。',
        errors: {
          invalid_amount: '借入金額は 0 より大きい数値を入力してください。',
          amount_out_of_range: '借入金額が上限（10億）を超えています。',
          invalid_rate: '年利率は 0% より大きい数値を入力してください。',
          rate_out_of_range: '年利率は 100% 以下で入力してください。',
          invalid_years: '返済期間は正の整数（年）で入力してください。',
          years_out_of_range: '返済期間は 1〜50 年の範囲で入力してください。',
        } as Record<MortgageErrorCode, string>,
        prepayErrors: {
          invalid_prepay_amount: '繰上返済額は 0 より大きい数値を入力してください。',
          invalid_prepay_month: (max: number) =>
            `繰上返済の時期は 1〜${max} 回の整数で入力してください。`,
        },
      }
    }

    return {
      presetsTitle: '常用预设一键填入',
      loanAmount: '贷款总额',
      unitWan: '万元',
      unitYuan: '元',
      unitWanShort: '万元',
      currencyUnit: '元',
      annualRate: '年利率（%）',
      loanYears: '贷款年限（年）',
      yearsPlaceholder: '1 - 50 年',
      ratePlaceholder: '例如 3.5',
      amountPlaceholderWan: '例如 100（即 100 万元）',
      amountPlaceholderYuan: '例如 1000000',
      repaymentMethod: '还款方式',
      equalPayment: '等额本息',
      equalPaymentHint: '每月还款额固定，前期利息占比高',
      equalPrincipal: '等额本金',
      equalPrincipalHint: '每月偿还固定本金，月供逐月递减',
      clear: '清空',
      copyResult: '复制结果',
      monthlyPayment: '每月月供',
      firstMonthPayment: '首月月供',
      lastMonthPayment: '末月月供',
      monthlyDecrease: '每月递减',
      totalInterest: '总利息',
      totalPayment: '还款总额',
      principalLabel: '贷款本金',
      totalMonthsLabel: (m: number) => `共 ${m} 期`,
      principalRatio: '本金与利息占比',
      prepayTitle: '提前还款试算（可选）',
      prepayToggle: '开启提前还款试算（缩短年限）',
      prepayAmount: '提前还款金额',
      prepayMonth: '提前还款时间（第几期还款后）',
      prepayMonthPlaceholder: '例如 36（满 3 年后）',
      interestSaved: '节省利息',
      termShortened: '缩短年限',
      newTotalInterest: '调整后总利息',
      remainingAfterPrepay: '提前还款后剩余本金',
      paidOffEarly: '已一次性结清全部剩余本金',
      scheduleTitle: '还款明细表（前 12 期与后 12 期）',
      scheduleTitleAll: '还款明细表（全部期数）',
      colPeriod: '期数',
      colPayment: '当期月供',
      colPrincipal: '偿还本金',
      colInterest: '偿还利息',
      colRemaining: '剩余本金',
      omittedRow: (count: number) => `…… 中间省略 ${count} 期 ……`,
      formatMonths: (m: number) => {
        const y = Math.floor(m / 12)
        const rem = m % 12
        if (y === 0) return `${rem} 个月`
        if (rem === 0) return `${y} 年`
        return `${y} 年 ${rem} 个月`
      },
      disclaimer: '以上计算结果仅供参考，实际月供与利息以银行实际合同与放款测算为准。',
      emptyHint: '请输入有效的贷款总额、年利率与贷款年限以查看计算结果。',
      errors: {
        invalid_amount: '贷款总额必须为大于 0 的数字。',
        amount_out_of_range: '贷款总额超出支持上限（最大 10 亿元 / 100,000 万元）。',
        invalid_rate: '年利率必须大于 0%。',
        rate_out_of_range: '年利率不能超过 100%。',
        invalid_years: '贷款年限必须为正整数（年）。',
        years_out_of_range: '贷款年限需在 1 至 50 年之间。',
      } as Record<MortgageErrorCode, string>,
      prepayErrors: {
        invalid_prepay_amount: '提前还款金额必须为大于 0 的数字。',
        invalid_prepay_month: (max: number) =>
          `提前还款期数需为 1 至 ${max} 之间的整数。`,
      },
    }
  }, [language])

  const unitMultiplier = unit === 'wan' ? 10000 : 1

  const parsedPrincipalYuan = useMemo(() => {
    const trimmed = amountInput.trim()
    if (!trimmed) return Number.NaN
    const num = Number(trimmed)
    return Number.isFinite(num) ? num * unitMultiplier : Number.NaN
  }, [amountInput, unitMultiplier])

  const parsedRate = useMemo(() => {
    const trimmed = rateInput.trim()
    if (!trimmed) return Number.NaN
    return Number(trimmed)
  }, [rateInput])

  const parsedYears = useMemo(() => {
    const trimmed = yearsInput.trim()
    if (!trimmed) return Number.NaN
    return Number(trimmed)
  }, [yearsInput])

  const calcResult = useMemo(
    () =>
      calculateMortgage({
        principalYuan: parsedPrincipalYuan,
        annualRatePercent: parsedRate,
        years: parsedYears,
        method,
      }),
    [parsedPrincipalYuan, parsedRate, parsedYears, method]
  )

  const prepayResult = useMemo(() => {
    if (!enablePrepay || !calcResult.ok) return null
    const amt = prepayAmountInput.trim() ? Number(prepayAmountInput.trim()) * unitMultiplier : Number.NaN
    const mon = prepayMonthInput.trim() ? Number(prepayMonthInput.trim()) : Number.NaN
    return calculatePrepayment(calcResult.data, {
      prepayAmountYuan: amt,
      afterMonth: mon,
    })
  }, [enablePrepay, calcResult, prepayAmountInput, prepayMonthInput, unitMultiplier])

  const handleUnitChange = (nextUnit: AmountUnit) => {
    if (nextUnit === unit) return
    const convertValue = (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return ''
      const num = Number(trimmed)
      if (!Number.isFinite(num)) return raw
      const converted = nextUnit === 'yuan' ? num * 10000 : num / 10000
      return String(Number(converted.toFixed(6)))
    }
    setAmountInput(prev => convertValue(prev))
    setPrepayAmountInput(prev => convertValue(prev))
    setUnit(nextUnit)
  }

  const applyPreset = (preset: MortgagePreset) => {
    setAmountInput(
      unit === 'wan' ? preset.amountWan : String(Number(preset.amountWan) * 10000)
    )
    setYearsInput(preset.years)
    setRateInput(preset.rate)
  }

  const handleClear = () => {
    setAmountInput('')
    setRateInput('')
    setYearsInput('')
    setEnablePrepay(false)
    setPrepayAmountInput('')
    setPrepayMonthInput('')
  }

  const copySummaryText = useMemo(() => {
    if (!calcResult.ok) return ''
    const d = calcResult.data
    const u = ui.currencyUnit ? ` ${ui.currencyUnit}` : ''
    const methodLabel =
      d.method === 'equal-payment' ? ui.equalPayment : ui.equalPrincipal

    const lines = [
      `${ui.repaymentMethod}: ${methodLabel}`,
      `${ui.principalLabel}: ${formatMoney(d.principalYuan)}${u}`,
      `${ui.annualRate}: ${d.annualRatePercent}%`,
      `${ui.loanYears}: ${d.years} (${ui.totalMonthsLabel(d.totalMonths)})`,
    ]

    if (d.method === 'equal-payment') {
      lines.push(`${ui.monthlyPayment}: ${formatMoney(d.firstMonthPayment)}${u}`)
    } else {
      lines.push(`${ui.firstMonthPayment}: ${formatMoney(d.firstMonthPayment)}${u}`)
      lines.push(`${ui.lastMonthPayment}: ${formatMoney(d.lastMonthPayment)}${u}`)
      lines.push(`${ui.monthlyDecrease}: ${formatMoney(d.monthlyDecrease)}${u}`)
    }

    lines.push(`${ui.totalInterest}: ${formatMoney(d.totalInterest)}${u}`)
    lines.push(`${ui.totalPayment}: ${formatMoney(d.totalPayment)}${u}`)

    if (enablePrepay && prepayResult?.ok) {
      const p = prepayResult.data
      lines.push('---')
      lines.push(`${ui.prepayTitle}`)
      lines.push(`${ui.prepayMonth}: #${p.afterMonth}`)
      lines.push(`${ui.prepayAmount}: ${formatMoney(p.effectivePrepayYuan)}${u}`)
      lines.push(`${ui.interestSaved}: ${formatMoney(p.interestSaved)}${u}`)
      lines.push(
        `${ui.termShortened}: ${ui.formatMonths(p.monthsShortened)} (${p.monthsShortened})`
      )
    }

    lines.push(ui.disclaimer)
    return lines.join('\n')
  }, [calcResult, enablePrepay, prepayResult, ui])

  const renderScheduleRow = (row: ScheduleRow) => (
    <tr
      key={row.month}
      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
    >
      <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        #{row.month}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
        {formatMoney(row.payment)}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-right text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
        {formatMoney(row.principal)}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-right text-amber-700 dark:text-amber-400 whitespace-nowrap">
        {formatMoney(row.interest)}
      </td>
      <td className="px-3 py-2 font-mono text-xs text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {formatMoney(row.remainingPrincipal)}
      </td>
    </tr>
  )

  const principalPercent = calcResult.ok
    ? (calcResult.data.principalYuan / calcResult.data.totalPayment) * 100
    : 0
  const interestPercent = calcResult.ok ? 100 - principalPercent : 0

  return (
    <ToolPage>
      <div className="space-y-6">
        {/* Quick Presets */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <Sparkles className="w-4 h-4 text-orange-500" />
              {ui.presetsTitle}
            </span>
            <div className="flex items-center gap-2">
              {copySummaryText && (
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
          <div className="flex flex-wrap gap-2">
            {MORTGAGE_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 hover:border-orange-400 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                {preset.label[language]}
              </button>
            ))}
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 space-y-5">
          {/* Repayment Method Switch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {ui.repaymentMethod}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('equal-payment')}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  method === 'equal-payment'
                    ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 ring-1 ring-orange-500/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {ui.equalPayment}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {ui.equalPaymentHint}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('equal-principal')}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  method === 'equal-principal'
                    ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 ring-1 ring-orange-500/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {ui.equalPrincipal}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {ui.equalPrincipalHint}
                </div>
              </button>
            </div>
          </div>

          {/* Numeric Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Loan Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {ui.loanAmount}
                </label>
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => handleUnitChange('wan')}
                    className={`px-2 py-0.5 font-medium transition-colors ${
                      unit === 'wan'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {ui.unitWan}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange('yuan')}
                    className={`px-2 py-0.5 font-medium transition-colors ${
                      unit === 'yuan'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {ui.unitYuan}
                  </button>
                </div>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                placeholder={
                  unit === 'wan' ? ui.amountPlaceholderWan : ui.amountPlaceholderYuan
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>

            {/* Annual Interest Rate */}
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

            {/* Loan Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.loanYears}
              </label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                max="50"
                value={yearsInput}
                onChange={e => setYearsInput(e.target.value)}
                placeholder={ui.yearsPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Validation Errors */}
          {'errors' in calcResult && (amountInput || rateInput || yearsInput) && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3.5 text-sm text-red-700 dark:text-red-300 space-y-1">
              {calcResult.errors.map(err => (
                <div key={err} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{ui.errors[err]}</span>
                </div>
              ))}
            </div>
          )}

          {!calcResult.ok && !amountInput && !rateInput && !yearsInput && (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>{ui.emptyHint}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {calcResult.ok && (
          <>
            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {calcResult.data.method === 'equal-payment' ? (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/70 dark:from-orange-950/40 dark:to-gray-900 border border-orange-200/80 dark:border-orange-900/60 rounded-xl p-5">
                  <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    {ui.monthlyPayment}
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-gray-50 tracking-tight">
                    {formatMoney(calcResult.data.firstMonthPayment)}
                    {ui.currencyUnit && (
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                        {ui.currencyUnit}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {ui.totalMonthsLabel(calcResult.data.totalMonths)}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/70 dark:from-orange-950/40 dark:to-gray-900 border border-orange-200/80 dark:border-orange-900/60 rounded-xl p-5">
                  <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    {ui.firstMonthPayment}
                  </div>
                  <div className="mt-1.5 text-2xl font-bold font-mono text-gray-900 dark:text-gray-50 tracking-tight">
                    {formatMoney(calcResult.data.firstMonthPayment)}
                    {ui.currencyUnit && (
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                        {ui.currencyUnit}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-orange-200/60 dark:border-orange-900/50 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {ui.lastMonthPayment}
                      </div>
                      <div className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                        {formatMoney(calcResult.data.lastMonthPayment)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {ui.monthlyDecrease}
                      </div>
                      <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        -{formatMoney(calcResult.data.monthlyDecrease)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.totalInterest}
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
                  {formatMoney(calcResult.data.totalInterest)}
                  {ui.currencyUnit && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {ui.currencyUnit}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {(calcResult.data.totalInterest / 10000).toFixed(2)} {ui.unitWanShort}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.totalPayment}
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-gray-900 dark:text-gray-100 tracking-tight">
                  {formatMoney(calcResult.data.totalPayment)}
                  {ui.currencyUnit && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {ui.currencyUnit}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {(calcResult.data.totalPayment / 10000).toFixed(2)} {ui.unitWanShort}
                </div>
              </div>
            </div>

            {/* Principal vs Interest Bar */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {ui.principalRatio}
                </span>
                <div className="flex items-center gap-4 font-mono">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {ui.principalLabel}: {principalPercent.toFixed(1)}%
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {ui.totalInterest}: {interestPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${principalPercent}%` }}
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${interestPercent}%` }}
                />
              </div>
            </div>

            {/* Optional Prepayment Simulation */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  {ui.prepayTitle}
                </span>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enablePrepay}
                    onChange={e => setEnablePrepay(e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  {ui.prepayToggle}
                </label>
              </div>

              {enablePrepay && (
                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        {ui.prepayAmount} ({unit === 'wan' ? ui.unitWan : ui.unitYuan})
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={prepayAmountInput}
                        onChange={e => setPrepayAmountInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        {ui.prepayMonth} (1–{calcResult.data.totalMonths - 1})
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="1"
                        max={calcResult.data.totalMonths - 1}
                        value={prepayMonthInput}
                        onChange={e => setPrepayMonthInput(e.target.value)}
                        placeholder={ui.prepayMonthPlaceholder}
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {prepayResult && 'errors' in prepayResult && (
                    <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 space-y-1">
                      {prepayResult.errors.map((err: PrepaymentErrorCode) => (
                        <div key={err} className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>
                            {err === 'invalid_prepay_amount'
                              ? ui.prepayErrors.invalid_prepay_amount
                              : ui.prepayErrors.invalid_prepay_month(
                                  calcResult.data.totalMonths - 1
                                )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {prepayResult && prepayResult.ok && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 p-3.5">
                        <div className="text-xs text-emerald-700 dark:text-emerald-300">
                          {ui.interestSaved}
                        </div>
                        <div className="mt-1 text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                          {formatMoney(prepayResult.data.interestSaved)}
                          {ui.currencyUnit && (
                            <span className="text-xs font-normal ml-1">
                              {ui.currencyUnit}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 p-3.5">
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          {ui.termShortened}
                        </div>
                        <div className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">
                          {ui.formatMonths(prepayResult.data.monthsShortened)}
                        </div>
                        <div className="text-xs text-blue-600/80 dark:text-blue-400/80 font-mono">
                          -{prepayResult.data.monthsShortened} ({ui.totalMonthsLabel(prepayResult.data.newTotalMonths)})
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3.5">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {prepayResult.data.paidOffEarly
                            ? ui.newTotalInterest
                            : ui.remainingAfterPrepay}
                        </div>
                        <div className="mt-1 text-lg font-bold font-mono text-gray-900 dark:text-gray-100">
                          {formatMoney(
                            prepayResult.data.paidOffEarly
                              ? prepayResult.data.newTotalInterest
                              : prepayResult.data.remainingAfterPrepay
                          )}
                          {ui.currencyUnit && (
                            <span className="text-xs font-normal text-gray-500 ml-1">
                              {ui.currencyUnit}
                            </span>
                          )}
                        </div>
                        {prepayResult.data.paidOffEarly && (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400">
                            {ui.paidOffEarly}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amortization Schedule Table (First 12 & Last 12) */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {calcResult.data.omittedCount > 0
                    ? ui.scheduleTitle
                    : ui.scheduleTitleAll}
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {ui.totalMonthsLabel(calcResult.data.totalMonths)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/60 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <th className="px-3 py-2.5 whitespace-nowrap">{ui.colPeriod}</th>
                      <th className="px-3 py-2.5 text-right whitespace-nowrap">
                        {ui.colPayment}
                      </th>
                      <th className="px-3 py-2.5 text-right whitespace-nowrap">
                        {ui.colPrincipal}
                      </th>
                      <th className="px-3 py-2.5 text-right whitespace-nowrap">
                        {ui.colInterest}
                      </th>
                      <th className="px-3 py-2.5 text-right whitespace-nowrap">
                        {ui.colRemaining}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calcResult.data.first12.map(renderScheduleRow)}
                    {calcResult.data.omittedCount > 0 && (
                      <tr className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/30">
                        <td
                          colSpan={5}
                          className="px-3 py-2.5 text-center text-xs text-gray-500 dark:text-gray-400 italic"
                        >
                          {ui.omittedRow(calcResult.data.omittedCount)}
                        </td>
                      </tr>
                    )}
                    {calcResult.data.last12.map(renderScheduleRow)}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
          <span>{ui.disclaimer}</span>
        </div>
      </div>
    </ToolPage>
  )
}
