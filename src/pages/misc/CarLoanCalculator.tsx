import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  calculateCarLoan,
  downPaymentPercentFromYuan,
  downPaymentYuanFromPercent,
  type CarLoanErrorCode,
  type RepaymentMethod,
  type ScheduleRow,
} from '../../lib/carLoanCalculator'
import {
  AlertCircle,
  Car,
  Info,
  Sparkles,
  Trash2,
} from 'lucide-react'

type AmountUnit = 'wan' | 'yuan'
type DownPaymentAnchor = 'percent' | 'amount'

interface CarLoanPreset {
  id: string
  carPriceWan: string
  downPaymentPercent: string
  years: string
  rate: string
  label: {
    'zh-CN': string
    'en-US': string
    'ja-JP': string
  }
}

const CAR_LOAN_PRESETS: CarLoanPreset[] = [
  {
    id: '20w-30p-3y-4.5',
    carPriceWan: '20',
    downPaymentPercent: '30',
    years: '3',
    rate: '4.5',
    label: {
      'zh-CN': '20万 / 30%首付 / 3年 / 4.5%',
      'en-US': '200K / 30% down / 3 yrs / 4.5%',
      'ja-JP': '20万 / 頭金30% / 3年 / 4.5%',
    },
  },
  {
    id: '30w-20p-5y-5.0',
    carPriceWan: '30',
    downPaymentPercent: '20',
    years: '5',
    rate: '5.0',
    label: {
      'zh-CN': '30万 / 20%首付 / 5年 / 5.0%',
      'en-US': '300K / 20% down / 5 yrs / 5.0%',
      'ja-JP': '30万 / 頭金20% / 5年 / 5.0%',
    },
  },
  {
    id: '15w-30p-3y-3.8',
    carPriceWan: '15',
    downPaymentPercent: '30',
    years: '3',
    rate: '3.8',
    label: {
      'zh-CN': '15万 / 30%首付 / 3年 / 3.8%',
      'en-US': '150K / 30% down / 3 yrs / 3.8%',
      'ja-JP': '15万 / 頭金30% / 3年 / 3.8%',
    },
  },
  {
    id: '50w-40p-5y-4.2',
    carPriceWan: '50',
    downPaymentPercent: '40',
    years: '5',
    rate: '4.2',
    label: {
      'zh-CN': '50万 / 40%首付 / 5年 / 4.2%',
      'en-US': '500K / 40% down / 5 yrs / 4.2%',
      'ja-JP': '50万 / 頭金40% / 5年 / 4.2%',
    },
  },
]

const QUICK_DOWN_PERCENTS = [0, 20, 30, 40, 50]
const QUICK_YEARS = [1, 2, 3, 4, 5, 7]

function formatMoney(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatInputNumber(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return ''
  return String(Number(value.toFixed(maxDecimals)))
}

export default function CarLoanCalculator() {
  const { language } = useI18n()

  const [unit, setUnit] = useState<AmountUnit>('wan')
  const [carPriceInput, setCarPriceInput] = useState<string>('20')
  const [downPercentInput, setDownPercentInput] = useState<string>('30')
  const [downAmountInput, setDownAmountInput] = useState<string>('6')
  const [downAnchor, setDownAnchor] = useState<DownPaymentAnchor>('percent')
  const [yearsInput, setYearsInput] = useState<string>('3')
  const [rateInput, setRateInput] = useState<string>('4.5')
  const [method, setMethod] = useState<RepaymentMethod>('equal-payment')

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        presetsTitle: 'Quick Presets',
        carPrice: 'Vehicle Price',
        unitWan: '×10,000',
        unitYuan: 'Exact',
        unitWanShort: '×10k',
        currencyUnit: '',
        downPaymentPercent: 'Down Payment (%)',
        downPaymentAmount: 'Down Payment Amount',
        downPaymentLinkedHint: 'Linked with down payment %',
        loanYears: 'Loan Term (Years)',
        yearsPlaceholder: '1–7',
        yearShort: (y: number) => `${y}y`,
        annualRate: 'Annual Interest Rate (%)',
        ratePlaceholder: 'e.g. 4.5',
        pricePlaceholderWan: 'e.g. 20 (= 200,000)',
        pricePlaceholderYuan: 'e.g. 200000',
        repaymentMethod: 'Repayment Method',
        equalPayment: 'Equal Principal & Interest',
        equalPaymentHint: 'Fixed monthly payment throughout the term',
        equalPrincipal: 'Equal Principal',
        equalPrincipalHint: 'Higher initial payment, decreasing every month',
        clear: 'Clear',
        copyResult: 'Copy Result',
        loanAmount: 'Loan Amount',
        downPaymentLabel: 'Down Payment',
        monthlyPayment: 'Monthly Payment',
        firstMonthPayment: 'First Month Payment',
        lastMonthPayment: 'Last Month Payment',
        monthlyDecrease: 'Monthly Decrease',
        totalInterest: 'Total Interest',
        totalPayment: 'Total Repayment',
        totalVehicleCost: 'Total Cost (incl. Down Payment)',
        principalLabel: 'Loan Principal',
        totalMonthsLabel: (m: number) => `${m} months`,
        principalRatio: 'Principal / Interest Ratio',
        scheduleTitle: 'First 12 Months Amortization Schedule',
        scheduleTitleAll: 'Amortization Schedule (All Months)',
        colPeriod: 'Month',
        colPayment: 'Payment',
        colPrincipal: 'Principal',
        colInterest: 'Interest',
        colRemaining: 'Remaining Balance',
        disclaimer:
          'For reference only. Actual monthly payments, interest rates, and fees are subject to your bank or auto finance contract.',
        emptyHint:
          'Enter a valid vehicle price, down payment, annual interest rate, and loan term (1–7 years) to view results.',
        errors: {
          invalid_car_price: 'Vehicle price must be a positive number greater than 0.',
          car_price_out_of_range:
            'Vehicle price exceeds the supported maximum (1,000,000,000).',
          invalid_down_payment: 'Down payment must be a valid number.',
          down_payment_out_of_range:
            'Down payment must be at least 0% and strictly less than 100% of vehicle price.',
          invalid_rate: 'Annual interest rate must be greater than 0%.',
          rate_out_of_range: 'Annual interest rate cannot exceed 100%.',
          invalid_years: 'Loan term must be a positive integer (years).',
          years_out_of_range: 'Auto loan term must be between 1 and 7 years.',
        } as Record<CarLoanErrorCode, string>,
      }
    }

    if (language === 'ja-JP') {
      return {
        presetsTitle: 'よく使うプリセット',
        carPrice: '車両価格',
        unitWan: '万単位',
        unitYuan: '円/元',
        unitWanShort: '万',
        currencyUnit: '元',
        downPaymentPercent: '頭金割合（%）',
        downPaymentAmount: '頭金金額',
        downPaymentLinkedHint: '頭金割合と自動連動',
        loanYears: '返済期間（年）',
        yearsPlaceholder: '1〜7',
        yearShort: (y: number) => `${y}年`,
        annualRate: '年利率（%）',
        ratePlaceholder: '例: 4.5',
        pricePlaceholderWan: '例: 20（20万）',
        pricePlaceholderYuan: '例: 200000',
        repaymentMethod: '返済方式',
        equalPayment: '元利均等返済',
        equalPaymentHint: '毎月の返済額が一定',
        equalPrincipal: '元金均等返済',
        equalPrincipalHint: '初回が高く、毎月一定額ずつ減少',
        clear: 'クリア',
        copyResult: '結果をコピー',
        loanAmount: '借入金額',
        downPaymentLabel: '頭金',
        monthlyPayment: '毎月返済額',
        firstMonthPayment: '初回返済額',
        lastMonthPayment: '最終回返済額',
        monthlyDecrease: '毎月の減少額',
        totalInterest: '総利息',
        totalPayment: '返済総額',
        totalVehicleCost: '支払総額（頭金込み）',
        principalLabel: '借入元金',
        totalMonthsLabel: (m: number) => `全 ${m} 回`,
        principalRatio: '元金・利息の内訳',
        scheduleTitle: '返済明細（最初の12回）',
        scheduleTitleAll: '返済明細（全期間）',
        colPeriod: '回数',
        colPayment: '返済額',
        colPrincipal: '元金',
        colInterest: '利息',
        colRemaining: '残元金',
        disclaimer:
          '計算結果は参考値です。実際の返済額や金利条件は銀行・自動車ローン会社の契約内容に従います。',
        emptyHint:
          '有効な車両価格・頭金・年利率・返済期間（1〜7年）を入力すると計算結果が表示されます。',
        errors: {
          invalid_car_price: '車両価格は 0 より大きい数値を入力してください。',
          car_price_out_of_range: '車両価格が上限（10億）を超えています。',
          invalid_down_payment: '頭金は有効な数値を入力してください。',
          down_payment_out_of_range:
            '頭金は 0% 以上かつ車両価格の 100% 未満で入力してください。',
          invalid_rate: '年利率は 0% より大きい数値を入力してください。',
          rate_out_of_range: '年利率は 100% 以下で入力してください。',
          invalid_years: '返済期間は正の整数（年）で入力してください。',
          years_out_of_range: '自動車ローンの返済期間は 1〜7 年の範囲で入力してください。',
        } as Record<CarLoanErrorCode, string>,
      }
    }

    return {
      presetsTitle: '常用预设一键填入',
      carPrice: '车辆总价',
      unitWan: '万元',
      unitYuan: '元',
      unitWanShort: '万元',
      currencyUnit: '元',
      downPaymentPercent: '首付比例（%）',
      downPaymentAmount: '首付金额',
      downPaymentLinkedHint: '与首付比例自动联动',
      loanYears: '贷款年限（年）',
      yearsPlaceholder: '1 - 7 年',
      yearShort: (y: number) => `${y}年`,
      annualRate: '年利率（%）',
      ratePlaceholder: '例如 4.5',
      pricePlaceholderWan: '例如 20（即 20 万元）',
      pricePlaceholderYuan: '例如 200000',
      repaymentMethod: '还款方式',
      equalPayment: '等额本息',
      equalPaymentHint: '每月还款额固定，便于规划月度预算',
      equalPrincipal: '等额本金',
      equalPrincipalHint: '每月偿还固定本金，月供逐月递减、总利息更少',
      clear: '清空',
      copyResult: '复制结果',
      loanAmount: '贷款金额',
      downPaymentLabel: '首付金额',
      monthlyPayment: '每月月供',
      firstMonthPayment: '首月月供',
      lastMonthPayment: '末月月供',
      monthlyDecrease: '每月递减',
      totalInterest: '总利息',
      totalPayment: '还款总额',
      totalVehicleCost: '购车总支出（含首付）',
      principalLabel: '贷款本金',
      totalMonthsLabel: (m: number) => `共 ${m} 期`,
      principalRatio: '本金与利息占比',
      scheduleTitle: '前 12 期还款明细表',
      scheduleTitleAll: '还款明细表（全部 12 期）',
      colPeriod: '期数',
      colPayment: '当期月供',
      colPrincipal: '偿还本金',
      colInterest: '偿还利息',
      colRemaining: '剩余本金',
      disclaimer:
        '以上计算结果仅供参考，实际月供、利率与相关费用以银行/汽车金融实际合同为准。',
      emptyHint:
        '请输入有效的车辆总价、首付比例/金额、贷款年限（1–7年）与年利率以查看计算结果。',
      errors: {
        invalid_car_price: '车辆总价必须为大于 0 的数字。',
        car_price_out_of_range: '车辆总价超出支持上限（最大 10 亿元 / 100,000 万元）。',
        invalid_down_payment: '首付比例或首付金额必须为有效数字。',
        down_payment_out_of_range: '首付比例需大于等于 0% 且严格小于 100%（首付金额须小于车价）。',
        invalid_rate: '年利率必须大于 0%。',
        rate_out_of_range: '年利率不能超过 100%。',
        invalid_years: '贷款年限必须为正整数（年）。',
        years_out_of_range: '车贷年限需在 1 至 7 年之间。',
      } as Record<CarLoanErrorCode, string>,
    }
  }, [language])

  const unitMultiplier = unit === 'wan' ? 10000 : 1

  const parsedCarPriceYuan = useMemo(() => {
    const trimmed = carPriceInput.trim()
    if (!trimmed) return Number.NaN
    const num = Number(trimmed)
    return Number.isFinite(num) ? num * unitMultiplier : Number.NaN
  }, [carPriceInput, unitMultiplier])

  const parsedDownPaymentPercent = useMemo(() => {
    if (downAnchor === 'amount') {
      const trimmedAmt = downAmountInput.trim()
      if (!trimmedAmt) return Number.NaN
      const amt = Number(trimmedAmt)
      if (!Number.isFinite(amt)) return Number.NaN
      const amtYuan = amt * unitMultiplier
      if (!Number.isFinite(parsedCarPriceYuan) || parsedCarPriceYuan <= 0) {
        return amtYuan < 0 ? -1 : Number.NaN
      }
      return downPaymentPercentFromYuan(parsedCarPriceYuan, amtYuan)
    }
    const trimmedPct = downPercentInput.trim()
    if (!trimmedPct) return Number.NaN
    return Number(trimmedPct)
  }, [downAnchor, downAmountInput, downPercentInput, parsedCarPriceYuan, unitMultiplier])

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
      calculateCarLoan({
        carPriceYuan: parsedCarPriceYuan,
        downPaymentPercent: parsedDownPaymentPercent,
        annualRatePercent: parsedRate,
        years: parsedYears,
        method,
      }),
    [parsedCarPriceYuan, parsedDownPaymentPercent, parsedRate, parsedYears, method]
  )

  const handleCarPriceChange = (value: string) => {
    setCarPriceInput(value)
    const trimmed = value.trim()
    const priceInUnit = trimmed ? Number(trimmed) : Number.NaN
    if (!Number.isFinite(priceInUnit) || priceInUnit <= 0) return

    if (downAnchor === 'percent') {
      const pct = Number(downPercentInput.trim())
      if (downPercentInput.trim() && Number.isFinite(pct)) {
        const amtInUnit = downPaymentYuanFromPercent(priceInUnit, pct)
        setDownAmountInput(formatInputNumber(amtInUnit, unit === 'wan' ? 4 : 2))
      }
    } else {
      const amtInUnit = Number(downAmountInput.trim())
      if (downAmountInput.trim() && Number.isFinite(amtInUnit)) {
        const pct = downPaymentPercentFromYuan(priceInUnit, amtInUnit)
        setDownPercentInput(formatInputNumber(pct, 2))
      }
    }
  }

  const handleDownPercentChange = (value: string) => {
    setDownAnchor('percent')
    setDownPercentInput(value)
    const trimmedPct = value.trim()
    const trimmedPrice = carPriceInput.trim()
    if (!trimmedPct) {
      setDownAmountInput('')
      return
    }
    const pct = Number(trimmedPct)
    const priceInUnit = Number(trimmedPrice)
    if (trimmedPrice && Number.isFinite(pct) && Number.isFinite(priceInUnit) && priceInUnit > 0) {
      const amtInUnit = downPaymentYuanFromPercent(priceInUnit, pct)
      setDownAmountInput(formatInputNumber(amtInUnit, unit === 'wan' ? 4 : 2))
    }
  }

  const handleDownAmountChange = (value: string) => {
    setDownAnchor('amount')
    setDownAmountInput(value)
    const trimmedAmt = value.trim()
    const trimmedPrice = carPriceInput.trim()
    if (!trimmedAmt) {
      setDownPercentInput('')
      return
    }
    const amtInUnit = Number(trimmedAmt)
    const priceInUnit = Number(trimmedPrice)
    if (trimmedPrice && Number.isFinite(amtInUnit) && Number.isFinite(priceInUnit) && priceInUnit > 0) {
      const pct = downPaymentPercentFromYuan(priceInUnit, amtInUnit)
      setDownPercentInput(formatInputNumber(pct, 2))
    }
  }

  const handleUnitChange = (nextUnit: AmountUnit) => {
    if (nextUnit === unit) return
    const convertValue = (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return ''
      const num = Number(trimmed)
      if (!Number.isFinite(num)) return raw
      const converted = nextUnit === 'yuan' ? num * 10000 : num / 10000
      return formatInputNumber(converted, 6)
    }
    setCarPriceInput(prev => convertValue(prev))
    setDownAmountInput(prev => convertValue(prev))
    setUnit(nextUnit)
  }

  const applyPreset = (preset: CarLoanPreset) => {
    const priceInUnit =
      unit === 'wan' ? Number(preset.carPriceWan) : Number(preset.carPriceWan) * 10000
    const pct = Number(preset.downPaymentPercent)
    const amtInUnit = downPaymentYuanFromPercent(priceInUnit, pct)

    setCarPriceInput(formatInputNumber(priceInUnit, 6))
    setDownAnchor('percent')
    setDownPercentInput(preset.downPaymentPercent)
    setDownAmountInput(formatInputNumber(amtInUnit, unit === 'wan' ? 4 : 2))
    setYearsInput(preset.years)
    setRateInput(preset.rate)
  }

  const handleClear = () => {
    setCarPriceInput('')
    setDownPercentInput('')
    setDownAmountInput('')
    setYearsInput('')
    setRateInput('')
    setDownAnchor('percent')
  }

  const copySummaryText = useMemo(() => {
    if (!calcResult.ok) return ''
    const d = calcResult.data
    const u = ui.currencyUnit ? ` ${ui.currencyUnit}` : ''
    const methodLabel =
      d.method === 'equal-payment' ? ui.equalPayment : ui.equalPrincipal

    const lines = [
      `${ui.repaymentMethod}: ${methodLabel}`,
      `${ui.carPrice}: ${formatMoney(d.carPriceYuan)}${u}`,
      `${ui.downPaymentLabel}: ${formatMoney(d.downPaymentYuan)}${u} (${d.downPaymentPercent.toFixed(1)}%)`,
      `${ui.loanAmount}: ${formatMoney(d.loanAmountYuan)}${u}`,
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
    lines.push(`${ui.totalVehicleCost}: ${formatMoney(d.totalVehicleCost)}${u}`)
    lines.push(ui.disclaimer)
    return lines.join('\n')
  }, [calcResult, ui])

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
    ? (calcResult.data.loanAmountYuan / calcResult.data.totalPayment) * 100
    : 0
  const interestPercent = calcResult.ok ? 100 - principalPercent : 0

  const hasAnyInput = Boolean(
    carPriceInput || downPercentInput || downAmountInput || rateInput || yearsInput
  )

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
            {CAR_LOAN_PRESETS.map(preset => (
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

          {/* Row 1: Vehicle Price + Down Payment % + Down Payment Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vehicle Price */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {ui.carPrice}
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
                value={carPriceInput}
                onChange={e => handleCarPriceChange(e.target.value)}
                placeholder={
                  unit === 'wan' ? ui.pricePlaceholderWan : ui.pricePlaceholderYuan
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>

            {/* Down Payment Percent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.downPaymentPercent}
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="1"
                min="0"
                max="99.99"
                value={downPercentInput}
                onChange={e => handleDownPercentChange(e.target.value)}
                placeholder="0 - 99"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_DOWN_PERCENTS.map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleDownPercentChange(String(pct))}
                    className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors ${
                      downPercentInput === String(pct)
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Down Payment Amount (Linked) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {ui.downPaymentAmount} ({unit === 'wan' ? ui.unitWan : ui.unitYuan})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={downAmountInput}
                onChange={e => handleDownAmountChange(e.target.value)}
                placeholder={unit === 'wan' ? 'e.g. 6' : 'e.g. 60000'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {ui.downPaymentLinkedHint}
              </div>
            </div>
          </div>

          {/* Row 2: Loan Years (1-7) + Annual Interest Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                max="7"
                value={yearsInput}
                onChange={e => setYearsInput(e.target.value)}
                placeholder={ui.yearsPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_YEARS.map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYearsInput(String(y))}
                    className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors ${
                      yearsInput === String(y)
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'
                    }`}
                  >
                    {ui.yearShort(y)}
                  </button>
                ))}
              </div>
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
              <Car className="w-4 h-4" />
              <span>{ui.emptyHint}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {calcResult.ok && (
          <>
            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Loan Amount */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.loanAmount}
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tracking-tight">
                  {formatMoney(calcResult.data.loanAmountYuan)}
                  {ui.currencyUnit && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      {ui.currencyUnit}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {ui.downPaymentLabel}: {(calcResult.data.downPaymentYuan / 10000).toFixed(2)}{' '}
                  {ui.unitWanShort} ({calcResult.data.downPaymentPercent.toFixed(1)}%)
                </div>
              </div>

              {/* Monthly Payment */}
              {calcResult.data.method === 'equal-payment' ? (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/70 dark:from-orange-950/40 dark:to-gray-900 border border-orange-200/80 dark:border-orange-900/60 rounded-xl p-5">
                  <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    {ui.monthlyPayment}
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-gray-900 dark:text-gray-50 tracking-tight">
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

              {/* Total Interest */}
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

              {/* Total Repayment */}
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
                  {ui.totalVehicleCost}: {(calcResult.data.totalVehicleCost / 10000).toFixed(2)}{' '}
                  {ui.unitWanShort}
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

            {/* First 12 Months Amortization Schedule */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {calcResult.data.totalMonths <= 12
                    ? ui.scheduleTitleAll
                    : ui.scheduleTitle}
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
