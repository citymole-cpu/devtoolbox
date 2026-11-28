export type RepaymentMethod = 'equal-payment' | 'equal-principal'

export type MortgageErrorCode =
  | 'invalid_amount'
  | 'amount_out_of_range'
  | 'invalid_rate'
  | 'rate_out_of_range'
  | 'invalid_years'
  | 'years_out_of_range'

export type PrepaymentErrorCode =
  | 'invalid_prepay_amount'
  | 'invalid_prepay_month'

export interface MortgageInput {
  /** Loan principal in yuan (元) */
  principalYuan: number
  /** Annual interest rate in percentage, e.g. 3.5 for 3.5% */
  annualRatePercent: number
  /** Loan term in years (integer, 1..50) */
  years: number
  method: RepaymentMethod
}

export interface ScheduleRow {
  month: number
  payment: number
  principal: number
  interest: number
  remainingPrincipal: number
}

export interface MortgageSummary {
  method: RepaymentMethod
  principalYuan: number
  annualRatePercent: number
  years: number
  totalMonths: number
  monthlyRate: number
  /** Fixed monthly payment for equal-payment; first month payment for equal-principal */
  firstMonthPayment: number
  /** Fixed monthly payment for equal-payment; last month payment for equal-principal */
  lastMonthPayment: number
  /** 0 for equal-payment; positive monthly decrease for equal-principal */
  monthlyDecrease: number
  totalInterest: number
  totalPayment: number
  schedule: ScheduleRow[]
  first12: ScheduleRow[]
  last12: ScheduleRow[]
  omittedCount: number
}

export type MortgageCalcResult =
  | { ok: true; data: MortgageSummary }
  | { ok: false; errors: MortgageErrorCode[] }

export interface PrepaymentInput {
  /** Extra principal payment in yuan (元) */
  prepayAmountYuan: number
  /** Month index after which prepayment is made (1 .. totalMonths - 1) */
  afterMonth: number
}

export interface PrepaymentSummary {
  afterMonth: number
  requestedPrepayYuan: number
  effectivePrepayYuan: number
  remainingBeforePrepay: number
  remainingAfterPrepay: number
  paidOffEarly: boolean
  originalTotalMonths: number
  newTotalMonths: number
  monthsShortened: number
  originalTotalInterest: number
  newTotalInterest: number
  interestSaved: number
  newMonthlyPayment: number
}

export type PrepaymentCalcResult =
  | { ok: true; data: PrepaymentSummary }
  | { ok: false; errors: PrepaymentErrorCode[] }

export const MAX_PRINCIPAL_YUAN = 1_000_000_000 // 10 亿元 (100,000 万元)
export const MAX_ANNUAL_RATE_PERCENT = 100
export const MIN_YEARS = 1
export const MAX_YEARS = 50

export function validateMortgageInput(input: MortgageInput): MortgageErrorCode[] {
  const errors: MortgageErrorCode[] = []

  if (!Number.isFinite(input.principalYuan) || input.principalYuan <= 0) {
    errors.push('invalid_amount')
  } else if (input.principalYuan > MAX_PRINCIPAL_YUAN) {
    errors.push('amount_out_of_range')
  }

  if (!Number.isFinite(input.annualRatePercent) || input.annualRatePercent <= 0) {
    errors.push('invalid_rate')
  } else if (input.annualRatePercent > MAX_ANNUAL_RATE_PERCENT) {
    errors.push('rate_out_of_range')
  }

  if (!Number.isFinite(input.years) || !Number.isInteger(input.years) || input.years <= 0) {
    errors.push('invalid_years')
  } else if (input.years < MIN_YEARS || input.years > MAX_YEARS) {
    errors.push('years_out_of_range')
  }

  return errors
}

export function calculateMortgage(input: MortgageInput): MortgageCalcResult {
  const errors = validateMortgageInput(input)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const { principalYuan: P, annualRatePercent, years, method } = input
  const n = years * 12
  const r = annualRatePercent / 100 / 12

  const schedule: ScheduleRow[] = []
  let firstMonthPayment = 0
  let lastMonthPayment = 0
  let monthlyDecrease = 0
  let totalInterest = 0
  let totalPayment = 0

  if (method === 'equal-payment') {
    const factor = Math.pow(1 + r, n)
    const monthlyPayment = (P * r * factor) / (factor - 1)
    firstMonthPayment = monthlyPayment
    lastMonthPayment = monthlyPayment
    monthlyDecrease = 0
    totalPayment = monthlyPayment * n
    totalInterest = totalPayment - P

    let remaining = P
    for (let m = 1; m <= n; m++) {
      const interest = remaining * r
      let principal = monthlyPayment - interest
      let payment = monthlyPayment
      if (m === n) {
        principal = remaining
        payment = principal + interest
        remaining = 0
      } else {
        remaining = Math.max(0, remaining - principal)
      }
      schedule.push({
        month: m,
        payment,
        principal,
        interest,
        remainingPrincipal: remaining,
      })
    }
  } else {
    const monthlyPrincipal = P / n
    monthlyDecrease = monthlyPrincipal * r
    firstMonthPayment = monthlyPrincipal + P * r
    lastMonthPayment = monthlyPrincipal + monthlyPrincipal * r
    totalInterest = ((n + 1) / 2) * P * r
    totalPayment = P + totalInterest

    let remaining = P
    for (let m = 1; m <= n; m++) {
      const interest = remaining * r
      const principal = m === n ? remaining : monthlyPrincipal
      const payment = principal + interest
      remaining = m === n ? 0 : Math.max(0, remaining - principal)
      schedule.push({
        month: m,
        payment,
        principal,
        interest,
        remainingPrincipal: remaining,
      })
    }
  }

  const first12 = schedule.slice(0, Math.min(12, schedule.length))
  const last12 =
    schedule.length > 24
      ? schedule.slice(schedule.length - 12)
      : schedule.slice(first12.length)
  const omittedCount = Math.max(0, schedule.length - first12.length - last12.length)

  return {
    ok: true,
    data: {
      method,
      principalYuan: P,
      annualRatePercent,
      years,
      totalMonths: n,
      monthlyRate: r,
      firstMonthPayment,
      lastMonthPayment,
      monthlyDecrease,
      totalInterest,
      totalPayment,
      schedule,
      first12,
      last12,
      omittedCount,
    },
  }
}

/**
 * Simulate a one-time prepayment after `afterMonth` payments, keeping monthly payment
 * (or monthly principal for equal-principal) unchanged to shorten the loan term.
 */
export function calculatePrepayment(
  base: MortgageSummary,
  input: PrepaymentInput
): PrepaymentCalcResult {
  const errors: PrepaymentErrorCode[] = []

  if (!Number.isFinite(input.prepayAmountYuan) || input.prepayAmountYuan <= 0) {
    errors.push('invalid_prepay_amount')
  }

  if (
    !Number.isFinite(input.afterMonth) ||
    !Number.isInteger(input.afterMonth) ||
    input.afterMonth < 1 ||
    input.afterMonth >= base.totalMonths
  ) {
    errors.push('invalid_prepay_month')
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const { afterMonth, prepayAmountYuan } = input
  const r = base.monthlyRate
  const rowAtPrepay = base.schedule[afterMonth - 1]
  const remainingBeforePrepay = rowAtPrepay.remainingPrincipal

  let paidInterestSoFar = 0
  for (let i = 0; i < afterMonth; i++) {
    paidInterestSoFar += base.schedule[i].interest
  }

  const originalRemainingInterest = Math.max(0, base.totalInterest - paidInterestSoFar)

  if (prepayAmountYuan >= remainingBeforePrepay - 1e-6) {
    return {
      ok: true,
      data: {
        afterMonth,
        requestedPrepayYuan: prepayAmountYuan,
        effectivePrepayYuan: remainingBeforePrepay,
        remainingBeforePrepay,
        remainingAfterPrepay: 0,
        paidOffEarly: true,
        originalTotalMonths: base.totalMonths,
        newTotalMonths: afterMonth,
        monthsShortened: base.totalMonths - afterMonth,
        originalTotalInterest: base.totalInterest,
        newTotalInterest: paidInterestSoFar,
        interestSaved: originalRemainingInterest,
        newMonthlyPayment: 0,
      },
    }
  }

  const remainingAfterPrepay = remainingBeforePrepay - prepayAmountYuan
  let rem = remainingAfterPrepay
  let newRemainingInterest = 0
  let newRemainingMonths = 0
  let newMonthlyPayment = 0

  if (base.method === 'equal-payment') {
    const fixedPayment = base.firstMonthPayment
    newMonthlyPayment = fixedPayment
    // Guard against infinite loop in extreme edge cases
    const maxSteps = base.totalMonths - afterMonth + 12
    while (rem > 1e-6 && newRemainingMonths < maxSteps) {
      const interest = rem * r
      newRemainingInterest += interest
      newRemainingMonths += 1
      if (rem + interest <= fixedPayment + 1e-6) {
        rem = 0
      } else {
        rem = rem - (fixedPayment - interest)
      }
    }
  } else {
    const monthlyPrincipal = base.principalYuan / base.totalMonths
    newMonthlyPayment = Math.min(rem, monthlyPrincipal) + rem * r
    const maxSteps = base.totalMonths - afterMonth + 12
    while (rem > 1e-6 && newRemainingMonths < maxSteps) {
      const interest = rem * r
      newRemainingInterest += interest
      newRemainingMonths += 1
      const principal = Math.min(rem, monthlyPrincipal)
      rem = Math.max(0, rem - principal)
    }
  }

  const newTotalMonths = afterMonth + newRemainingMonths
  const monthsShortened = Math.max(0, base.totalMonths - newTotalMonths)
  const newTotalInterest = paidInterestSoFar + newRemainingInterest
  const interestSaved = Math.max(0, base.totalInterest - newTotalInterest)

  return {
    ok: true,
    data: {
      afterMonth,
      requestedPrepayYuan: prepayAmountYuan,
      effectivePrepayYuan: prepayAmountYuan,
      remainingBeforePrepay,
      remainingAfterPrepay,
      paidOffEarly: false,
      originalTotalMonths: base.totalMonths,
      newTotalMonths,
      monthsShortened,
      originalTotalInterest: base.totalInterest,
      newTotalInterest,
      interestSaved,
      newMonthlyPayment,
    },
  }
}
