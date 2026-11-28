export interface SavingsGoalInput {
  /** Target savings goal amount (> 0) */
  targetAmount: number
  /** Savings duration in years (integer, 1 - 100) */
  years: number
  /** Expected annual rate of return in percentage (0 - 100, 0 allowed) */
  annualRatePercent: number
  /** Existing initial savings (>= 0) */
  initialSavings?: number
}

export interface YearlySavingsRow {
  year: number
  /** Total recurring deposits made during this year */
  yearlyDeposit: number
  /** Interest earned during this specific year */
  yearlyInterest: number
  /** Cumulative principal contributed up to end of this year (initial + recurring) */
  cumulativePrincipal: number
  /** Cumulative interest earned up to end of this year */
  cumulativeInterest: number
  /** Ending balance at end of this year */
  endingBalance: number
}

export interface SavingsGoalResult {
  targetAmount: number
  years: number
  annualRatePercent: number
  initialSavings: number
  /** Required monthly deposit to reach targetAmount (0 if existing savings already suffice) */
  monthlyDeposit: number
  /** Total months (years * 12) */
  totalMonths: number
  /** Total principal contributed (initial savings + all monthly deposits) */
  totalPrincipal: number
  /** Total recurring deposits (monthlyDeposit * totalMonths) */
  totalRecurringDeposits: number
  /** Total interest earned over the period */
  totalInterest: number
  /** Projected final balance at maturity (>= targetAmount) */
  finalBalance: number
  /** Whether initial savings alone (with growth) already meet or exceed the target */
  alreadyReached: boolean
  /** Principal share percentage (0 - 100) */
  principalRatio: number
  /** Interest share percentage (0 - 100) */
  interestRatio: number
  /** Effective Annual Rate (EAR) in percentage under monthly compounding */
  effectiveAnnualRate: number
  /** Year-by-year savings schedule */
  yearlySchedule: YearlySavingsRow[]
}

export type SavingsGoalErrorCode =
  | 'invalid_target'
  | 'target_out_of_range'
  | 'invalid_years'
  | 'years_out_of_range'
  | 'invalid_rate'
  | 'rate_out_of_range'
  | 'invalid_initial'
  | 'initial_out_of_range'

export type SavingsGoalOutput =
  | { ok: true; data: SavingsGoalResult }
  | { ok: false; errors: SavingsGoalErrorCode[] }

export const MAX_SAVINGS_AMOUNT = 1_000_000_000
export const MAX_SAVINGS_RATE = 100
export const MAX_SAVINGS_YEARS = 100

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function validateSavingsGoalInput(
  input: SavingsGoalInput
): SavingsGoalErrorCode[] {
  const errors: SavingsGoalErrorCode[] = []
  const initialSavings = input.initialSavings ?? 0

  if (!Number.isFinite(input.targetAmount) || input.targetAmount <= 0) {
    errors.push('invalid_target')
  } else if (input.targetAmount > MAX_SAVINGS_AMOUNT) {
    errors.push('target_out_of_range')
  }

  if (
    !Number.isFinite(input.years) ||
    input.years <= 0 ||
    !Number.isInteger(input.years)
  ) {
    errors.push('invalid_years')
  } else if (input.years > MAX_SAVINGS_YEARS) {
    errors.push('years_out_of_range')
  }

  if (!Number.isFinite(input.annualRatePercent) || input.annualRatePercent < 0) {
    errors.push('invalid_rate')
  } else if (input.annualRatePercent > MAX_SAVINGS_RATE) {
    errors.push('rate_out_of_range')
  }

  if (!Number.isFinite(initialSavings) || initialSavings < 0) {
    errors.push('invalid_initial')
  } else if (initialSavings > MAX_SAVINGS_AMOUNT) {
    errors.push('initial_out_of_range')
  }

  return errors
}

/**
 * Pure savings goal calculation (monthly compounding, end-of-month deposits):
 * - Monthly rate i = (annualRatePercent / 100) / 12
 * - Total months N = years * 12
 * - Future value of existing savings: FV_0 = P_0 * (1 + i)^N (or P_0 if i === 0)
 * - Gap = targetAmount - FV_0
 * - If Gap <= 0: monthlyDeposit = 0 (existing savings already reach target)
 * - Else if i === 0: monthlyDeposit = Gap / N
 * - Else: monthlyDeposit = Gap * i / ((1 + i)^N - 1)
 */
export function calculateSavingsGoal(
  input: SavingsGoalInput
): SavingsGoalOutput {
  const errors = validateSavingsGoalInput(input)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const targetAmount = input.targetAmount
  const years = input.years
  const annualRatePercent = input.annualRatePercent
  const initialSavings = input.initialSavings ?? 0
  const totalMonths = years * 12
  const r = annualRatePercent / 100
  const monthlyRate = r / 12

  const effectiveAnnualRate =
    r === 0 ? 0 : (Math.pow(1 + monthlyRate, 12) - 1) * 100

  const initialFutureValue =
    r === 0
      ? initialSavings
      : initialSavings * Math.pow(1 + monthlyRate, totalMonths)

  const gap = targetAmount - initialFutureValue
  const alreadyReached = gap <= 0

  let rawMonthlyDeposit = 0
  if (!alreadyReached) {
    if (r === 0) {
      rawMonthlyDeposit = gap / totalMonths
    } else {
      const annuityFactor =
        (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
      rawMonthlyDeposit = gap / annuityFactor
    }
  }

  const yearlySchedule: YearlySavingsRow[] = []
  let prevCumulativeInterest = 0

  for (let t = 1; t <= years; t++) {
    const monthsElapsed = t * 12
    const cumulativePrincipal =
      initialSavings + rawMonthlyDeposit * monthsElapsed

    let endingBalance: number
    if (r === 0) {
      endingBalance = cumulativePrincipal
    } else {
      const growthFactor = Math.pow(1 + monthlyRate, monthsElapsed)
      const fvInitial = initialSavings * growthFactor
      const fvDeposits =
        rawMonthlyDeposit > 0
          ? rawMonthlyDeposit * ((growthFactor - 1) / monthlyRate)
          : 0
      endingBalance = fvInitial + fvDeposits
    }

    const cumulativeInterest = Math.max(0, endingBalance - cumulativePrincipal)
    const yearlyInterest = Math.max(
      0,
      cumulativeInterest - prevCumulativeInterest
    )
    prevCumulativeInterest = cumulativeInterest

    yearlySchedule.push({
      year: t,
      yearlyDeposit: round2(rawMonthlyDeposit * 12),
      yearlyInterest: round2(yearlyInterest),
      cumulativePrincipal: round2(cumulativePrincipal),
      cumulativeInterest: round2(cumulativeInterest),
      endingBalance: round2(endingBalance),
    })
  }

  const lastRow = yearlySchedule[yearlySchedule.length - 1]
  const finalBalance = lastRow.endingBalance
  const totalPrincipal = lastRow.cumulativePrincipal
  const totalRecurringDeposits = round2(rawMonthlyDeposit * totalMonths)
  const totalInterest = round2(Math.max(0, finalBalance - totalPrincipal))
  const principalRatio =
    finalBalance > 0 ? round2((totalPrincipal / finalBalance) * 100) : 0
  const interestRatio =
    finalBalance > 0 ? round2(Math.max(0, 100 - principalRatio)) : 0

  return {
    ok: true,
    data: {
      targetAmount: round2(targetAmount),
      years,
      annualRatePercent,
      initialSavings: round2(initialSavings),
      monthlyDeposit: round2(rawMonthlyDeposit),
      totalMonths,
      totalPrincipal,
      totalRecurringDeposits,
      totalInterest,
      finalBalance,
      alreadyReached,
      principalRatio,
      interestRatio,
      effectiveAnnualRate: round2(effectiveAnnualRate),
      yearlySchedule,
    },
  }
}
