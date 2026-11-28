export type CompoundFrequency =
  | 'annually'
  | 'semiannually'
  | 'quarterly'
  | 'monthly'
  | 'daily'

export const COMPOUND_FREQUENCY_MAP: Record<CompoundFrequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
}

export interface CompoundInterestInput {
  /** Initial principal amount (>= 0) */
  principal: number
  /** Annual interest rate in percentage, e.g. 5 for 5% (0 - 100) */
  annualRatePercent: number
  /** Investment duration in years (integer, 1 - 100) */
  years: number
  /** Compounding frequency */
  frequency: CompoundFrequency
  /** Optional monthly recurring contribution (>= 0) */
  monthlyContribution?: number
}

export interface YearlyGrowthRow {
  year: number
  /** Cumulative principal invested up to end of this year */
  cumulativePrincipal: number
  /** Cumulative interest earned up to end of this year */
  cumulativeInterest: number
  /** Interest earned during this specific year */
  yearlyInterest: number
  /** Total balance at end of this year */
  totalAmount: number
}

export interface CompoundInterestResult {
  principal: number
  monthlyContribution: number
  annualRatePercent: number
  years: number
  frequency: CompoundFrequency
  compoundsPerYear: number
  /** Final maturity total (principal + interest) */
  finalAmount: number
  /** Total principal contributed (initial + all monthly contributions) */
  totalPrincipal: number
  /** Total interest earned */
  totalInterest: number
  /** Principal share percentage (0 - 100) */
  principalRatio: number
  /** Interest share percentage (0 - 100) */
  interestRatio: number
  /** Effective Annual Rate in percentage */
  effectiveAnnualRate: number
  /** Year-by-year growth schedule */
  yearlySchedule: YearlyGrowthRow[]
}

export type CompoundErrorCode =
  | 'invalid_principal'
  | 'principal_out_of_range'
  | 'invalid_contribution'
  | 'contribution_out_of_range'
  | 'zero_investment'
  | 'invalid_rate'
  | 'rate_out_of_range'
  | 'invalid_years'
  | 'years_out_of_range'

export type CompoundCalculationOutput =
  | { ok: true; data: CompoundInterestResult }
  | { ok: false; errors: CompoundErrorCode[] }

export const MAX_PRINCIPAL = 1_000_000_000
export const MAX_MONTHLY_CONTRIBUTION = 100_000_000
export const MAX_RATE_PERCENT = 100
export const MAX_YEARS = 100

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function validateCompoundInput(
  input: CompoundInterestInput
): CompoundErrorCode[] {
  const errors: CompoundErrorCode[] = []
  const contribution = input.monthlyContribution ?? 0

  if (!Number.isFinite(input.principal) || input.principal < 0) {
    errors.push('invalid_principal')
  } else if (input.principal > MAX_PRINCIPAL) {
    errors.push('principal_out_of_range')
  }

  if (!Number.isFinite(contribution) || contribution < 0) {
    errors.push('invalid_contribution')
  } else if (contribution > MAX_MONTHLY_CONTRIBUTION) {
    errors.push('contribution_out_of_range')
  }

  if (
    Number.isFinite(input.principal) &&
    Number.isFinite(contribution) &&
    input.principal === 0 &&
    contribution === 0
  ) {
    errors.push('zero_investment')
  }

  if (!Number.isFinite(input.annualRatePercent) || input.annualRatePercent < 0) {
    errors.push('invalid_rate')
  } else if (input.annualRatePercent > MAX_RATE_PERCENT) {
    errors.push('rate_out_of_range')
  }

  if (
    !Number.isFinite(input.years) ||
    input.years <= 0 ||
    !Number.isInteger(input.years)
  ) {
    errors.push('invalid_years')
  } else if (input.years > MAX_YEARS) {
    errors.push('years_out_of_range')
  }

  return errors
}

/**
 * Pure compound interest calculation:
 * - Lump sum: A_P(t) = P * (1 + r / n)^(n * t)
 * - Monthly recurring contribution (ordinary annuity):
 *   A_PMT(t) = PMT * ((1 + i_m)^(12 * t) - 1) / i_m
 *   where i_m = (1 + r / n)^(n / 12) - 1 (for monthly compounding, i_m = r / 12).
 */
export function calculateCompoundInterest(
  input: CompoundInterestInput
): CompoundCalculationOutput {
  const errors = validateCompoundInput(input)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const principal = input.principal
  const monthlyContribution = input.monthlyContribution ?? 0
  const r = input.annualRatePercent / 100
  const n = COMPOUND_FREQUENCY_MAP[input.frequency]
  const years = input.years

  const effectiveAnnualRate =
    r === 0 ? 0 : (Math.pow(1 + r / n, n) - 1) * 100
  const monthlyEffectiveRate =
    r === 0 ? 0 : Math.pow(1 + r / n, n / 12) - 1

  const yearlySchedule: YearlyGrowthRow[] = []
  let prevCumulativeInterest = 0

  for (let t = 1; t <= years; t++) {
    const principalFutureValue =
      r === 0 ? principal : principal * Math.pow(1 + r / n, n * t)

    let contributionFutureValue = 0
    if (monthlyContribution > 0) {
      if (r === 0) {
        contributionFutureValue = monthlyContribution * 12 * t
      } else {
        const growthFactor = Math.pow(1 + r / n, n * t)
        contributionFutureValue =
          monthlyContribution * ((growthFactor - 1) / monthlyEffectiveRate)
      }
    }

    const totalAmount = principalFutureValue + contributionFutureValue
    const cumulativePrincipal = principal + monthlyContribution * 12 * t
    const cumulativeInterest = Math.max(0, totalAmount - cumulativePrincipal)
    const yearlyInterest = Math.max(
      0,
      cumulativeInterest - prevCumulativeInterest
    )
    prevCumulativeInterest = cumulativeInterest

    yearlySchedule.push({
      year: t,
      cumulativePrincipal: round2(cumulativePrincipal),
      cumulativeInterest: round2(cumulativeInterest),
      yearlyInterest: round2(yearlyInterest),
      totalAmount: round2(totalAmount),
    })
  }

  const lastRow = yearlySchedule[yearlySchedule.length - 1]
  const finalAmount = lastRow.totalAmount
  const totalPrincipal = lastRow.cumulativePrincipal
  const totalInterest = round2(Math.max(0, finalAmount - totalPrincipal))
  const principalRatio =
    finalAmount > 0 ? round2((totalPrincipal / finalAmount) * 100) : 0
  const interestRatio =
    finalAmount > 0 ? round2(100 - principalRatio) : 0

  return {
    ok: true,
    data: {
      principal,
      monthlyContribution,
      annualRatePercent: input.annualRatePercent,
      years,
      frequency: input.frequency,
      compoundsPerYear: n,
      finalAmount,
      totalPrincipal,
      totalInterest,
      principalRatio,
      interestRatio,
      effectiveAnnualRate: round2(effectiveAnnualRate),
      yearlySchedule,
    },
  }
}
