import {
  calculateMortgage,
  MAX_ANNUAL_RATE_PERCENT,
  MAX_PRINCIPAL_YUAN,
  type MortgageSummary,
  type RepaymentMethod,
  type ScheduleRow,
} from './mortgageCalculator'

export type { RepaymentMethod, ScheduleRow }

export type CarLoanErrorCode =
  | 'invalid_car_price'
  | 'car_price_out_of_range'
  | 'invalid_down_payment'
  | 'down_payment_out_of_range'
  | 'invalid_rate'
  | 'rate_out_of_range'
  | 'invalid_years'
  | 'years_out_of_range'

export interface CarLoanInput {
  /** Vehicle price in yuan (元) */
  carPriceYuan: number
  /** Down payment percentage in [0, 100) */
  downPaymentPercent: number
  /** Annual interest rate in percentage, e.g. 4.5 for 4.5% */
  annualRatePercent: number
  /** Loan term in years (integer, 1..7) */
  years: number
  method: RepaymentMethod
}

export interface CarLoanSummary {
  carPriceYuan: number
  downPaymentPercent: number
  downPaymentYuan: number
  loanAmountYuan: number
  totalVehicleCost: number
  method: RepaymentMethod
  annualRatePercent: number
  years: number
  totalMonths: number
  monthlyRate: number
  firstMonthPayment: number
  lastMonthPayment: number
  monthlyDecrease: number
  totalInterest: number
  totalPayment: number
  schedule: ScheduleRow[]
  first12: ScheduleRow[]
}

export type CarLoanCalcResult =
  | { ok: true; data: CarLoanSummary }
  | { ok: false; errors: CarLoanErrorCode[] }

export const CAR_LOAN_MIN_YEARS = 1
export const CAR_LOAN_MAX_YEARS = 7
export const CAR_LOAN_MAX_PRICE_YUAN = MAX_PRINCIPAL_YUAN
export const CAR_LOAN_MAX_RATE_PERCENT = MAX_ANNUAL_RATE_PERCENT

export function downPaymentYuanFromPercent(
  carPriceYuan: number,
  downPaymentPercent: number
): number {
  if (!Number.isFinite(carPriceYuan) || !Number.isFinite(downPaymentPercent)) {
    return Number.NaN
  }
  return (carPriceYuan * downPaymentPercent) / 100
}

export function downPaymentPercentFromYuan(
  carPriceYuan: number,
  downPaymentYuan: number
): number {
  if (
    !Number.isFinite(carPriceYuan) ||
    carPriceYuan <= 0 ||
    !Number.isFinite(downPaymentYuan)
  ) {
    return Number.NaN
  }
  return (downPaymentYuan / carPriceYuan) * 100
}

export function validateCarLoanInput(input: CarLoanInput): CarLoanErrorCode[] {
  const errors: CarLoanErrorCode[] = []

  if (!Number.isFinite(input.carPriceYuan) || input.carPriceYuan <= 0) {
    errors.push('invalid_car_price')
  } else if (input.carPriceYuan > CAR_LOAN_MAX_PRICE_YUAN) {
    errors.push('car_price_out_of_range')
  }

  if (!Number.isFinite(input.downPaymentPercent)) {
    errors.push('invalid_down_payment')
  } else if (input.downPaymentPercent < 0 || input.downPaymentPercent >= 100) {
    errors.push('down_payment_out_of_range')
  }

  if (!Number.isFinite(input.annualRatePercent) || input.annualRatePercent <= 0) {
    errors.push('invalid_rate')
  } else if (input.annualRatePercent > CAR_LOAN_MAX_RATE_PERCENT) {
    errors.push('rate_out_of_range')
  }

  if (
    !Number.isFinite(input.years) ||
    !Number.isInteger(input.years) ||
    input.years <= 0
  ) {
    errors.push('invalid_years')
  } else if (
    input.years < CAR_LOAN_MIN_YEARS ||
    input.years > CAR_LOAN_MAX_YEARS
  ) {
    errors.push('years_out_of_range')
  }

  return errors
}

/**
 * Calculate auto loan summary and amortization schedule by reusing
 * `calculateMortgage` from `./mortgageCalculator`.
 */
export function calculateCarLoan(input: CarLoanInput): CarLoanCalcResult {
  const errors = validateCarLoanInput(input)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const downPaymentYuan = downPaymentYuanFromPercent(
    input.carPriceYuan,
    input.downPaymentPercent
  )
  const loanAmountYuan = input.carPriceYuan - downPaymentYuan

  if (!Number.isFinite(loanAmountYuan) || loanAmountYuan <= 0) {
    return { ok: false, errors: ['down_payment_out_of_range'] }
  }

  const mortgageResult = calculateMortgage({
    principalYuan: loanAmountYuan,
    annualRatePercent: input.annualRatePercent,
    years: input.years,
    method: input.method,
  })

  if (!mortgageResult.ok) {
    return { ok: false, errors: ['invalid_car_price'] }
  }

  const m: MortgageSummary = mortgageResult.data

  return {
    ok: true,
    data: {
      carPriceYuan: input.carPriceYuan,
      downPaymentPercent: input.downPaymentPercent,
      downPaymentYuan,
      loanAmountYuan,
      totalVehicleCost: downPaymentYuan + m.totalPayment,
      method: m.method,
      annualRatePercent: m.annualRatePercent,
      years: m.years,
      totalMonths: m.totalMonths,
      monthlyRate: m.monthlyRate,
      firstMonthPayment: m.firstMonthPayment,
      lastMonthPayment: m.lastMonthPayment,
      monthlyDecrease: m.monthlyDecrease,
      totalInterest: m.totalInterest,
      totalPayment: m.totalPayment,
      schedule: m.schedule,
      first12: m.first12,
    },
  }
}
