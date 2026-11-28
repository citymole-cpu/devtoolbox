export type PromoMode = 'discount' | 'threshold'
export type DiscountFormat = 'fold' | 'percentOff'

export interface CartItemInput {
  id: string
  name: string
  unitPrice: string
  quantity: string
}

export interface DiscountCalcItem {
  id: string
  name: string
  unitPrice: number
  quantity: number
  originalSubtotal: number
  finalSubtotal: number
  savedSubtotal: number
}

export type DiscountErrorCode =
  | 'invalid_price'
  | 'price_out_of_range'
  | 'invalid_quantity'
  | 'empty_items'
  | 'invalid_fold'
  | 'fold_out_of_range'
  | 'invalid_percent_off'
  | 'percent_off_out_of_range'
  | 'invalid_threshold'
  | 'invalid_reduction'
  | 'reduction_exceeds_threshold'

export interface DiscountCalcResult {
  promoMode: PromoMode
  originalTotal: number
  finalTotal: number
  savedAmount: number
  savedPercent: number
  effectiveFold: number
  items: DiscountCalcItem[]
  /** Threshold-specific details (present when promoMode === 'threshold') */
  threshold?: {
    thresholdAmount: number
    reductionAmount: number
    stackable: boolean
    qualified: boolean
    appliedTimes: number
    shortfall: number
  }
}

export type DiscountCalcOutcome =
  | { ok: true; data: DiscountCalcResult }
  | { ok: false; errors: DiscountErrorCode[] }

const MAX_PRICE = 1_000_000_000_000 // 1 trillion

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function parseStrictNumber(raw: string): number {
  const trimmed = raw.trim()
  if (!trimmed) return Number.NaN
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : Number.NaN
}

/** Convert Chinese fold (0-10, e.g. 8 = 8折) to percent off (0-100, e.g. 20 = 20% OFF). */
export function foldToPercentOff(fold: number): number {
  return round2((10 - fold) * 10)
}

/** Convert percent off (0-100, e.g. 20 = 20% OFF) to Chinese fold (0-10, e.g. 8 = 8折). */
export function percentOffToFold(percentOff: number): number {
  return round2((100 - percentOff) / 10)
}

export interface CalculateDiscountParams {
  itemMode: 'single' | 'multi'
  singlePrice: string
  items: CartItemInput[]
  promoMode: PromoMode
  discountFormat: DiscountFormat
  discountValue: string
  thresholdAmount: string
  reductionAmount: string
  stackableThreshold?: boolean
}

export function calculateDiscount(params: CalculateDiscountParams): DiscountCalcOutcome {
  const errors: DiscountErrorCode[] = []
  const parsedItems: Array<{
    id: string
    name: string
    unitPrice: number
    quantity: number
    originalSubtotal: number
  }> = []

  if (params.itemMode === 'single') {
    const price = parseStrictNumber(params.singlePrice)
    if (Number.isNaN(price) || price <= 0) {
      errors.push('invalid_price')
    } else if (price > MAX_PRICE) {
      errors.push('price_out_of_range')
    } else {
      parsedItems.push({
        id: 'single',
        name: '',
        unitPrice: price,
        quantity: 1,
        originalSubtotal: price,
      })
    }
  } else {
    if (!params.items || params.items.length === 0) {
      errors.push('empty_items')
    } else {
      let hasPriceErr = false
      let hasRangeErr = false
      let hasQtyErr = false
      for (const item of params.items) {
        const unitPrice = parseStrictNumber(item.unitPrice)
        const qty = parseStrictNumber(item.quantity)
        if (Number.isNaN(unitPrice) || unitPrice <= 0) {
          hasPriceErr = true
        } else if (unitPrice > MAX_PRICE) {
          hasRangeErr = true
        }
        if (Number.isNaN(qty) || !Number.isInteger(qty) || qty < 1 || qty > 1_000_000) {
          hasQtyErr = true
        }
        if (!hasPriceErr && !hasRangeErr && !hasQtyErr) {
          parsedItems.push({
            id: item.id,
            name: item.name,
            unitPrice,
            quantity: qty,
            originalSubtotal: unitPrice * qty,
          })
        }
      }
      if (hasPriceErr) errors.push('invalid_price')
      if (hasRangeErr) errors.push('price_out_of_range')
      if (hasQtyErr) errors.push('invalid_quantity')
    }
  }

  let payRatio = 1
  let thresholdMeta: DiscountCalcResult['threshold'] | undefined

  if (params.promoMode === 'discount') {
    const val = parseStrictNumber(params.discountValue)
    if (params.discountFormat === 'fold') {
      if (Number.isNaN(val)) {
        errors.push('invalid_fold')
      } else if (val < 0 || val > 10) {
        errors.push('fold_out_of_range')
      } else {
        payRatio = val / 10
      }
    } else {
      if (Number.isNaN(val)) {
        errors.push('invalid_percent_off')
      } else if (val < 0 || val > 100) {
        errors.push('percent_off_out_of_range')
      } else {
        payRatio = (100 - val) / 100
      }
    }
  } else {
    const threshold = parseStrictNumber(params.thresholdAmount)
    const reduction = parseStrictNumber(params.reductionAmount)
    if (Number.isNaN(threshold) || threshold <= 0 || threshold > MAX_PRICE) {
      errors.push('invalid_threshold')
    }
    if (Number.isNaN(reduction) || reduction <= 0 || reduction > MAX_PRICE) {
      errors.push('invalid_reduction')
    }
    if (
      !Number.isNaN(threshold) &&
      threshold > 0 &&
      !Number.isNaN(reduction) &&
      reduction > 0 &&
      reduction > threshold
    ) {
      errors.push('reduction_exceeds_threshold')
    }

    if (errors.length === 0) {
      const originalTotalRaw = parsedItems.reduce((sum, it) => sum + it.originalSubtotal, 0)
      const stackable = Boolean(params.stackableThreshold)
      const qualified = originalTotalRaw >= threshold
      const appliedTimes = qualified
        ? stackable
          ? Math.floor(originalTotalRaw / threshold)
          : 1
        : 0
      const totalReduction = Math.min(originalTotalRaw, appliedTimes * reduction)
      payRatio = originalTotalRaw > 0 ? (originalTotalRaw - totalReduction) / originalTotalRaw : 1
      thresholdMeta = {
        thresholdAmount: round2(threshold),
        reductionAmount: round2(reduction),
        stackable,
        qualified,
        appliedTimes,
        shortfall: qualified ? 0 : round2(threshold - originalTotalRaw),
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const originalTotalRaw = parsedItems.reduce((sum, it) => sum + it.originalSubtotal, 0)
  let finalTotalRaw: number
  if (params.promoMode === 'threshold' && thresholdMeta) {
    const totalReduction = Math.min(
      originalTotalRaw,
      thresholdMeta.appliedTimes * thresholdMeta.reductionAmount
    )
    finalTotalRaw = Math.max(0, originalTotalRaw - totalReduction)
  } else {
    finalTotalRaw = Math.max(0, originalTotalRaw * payRatio)
  }

  const originalTotal = round2(originalTotalRaw)
  const finalTotal = round2(finalTotalRaw)
  const savedAmount = round2(Math.max(0, originalTotal - finalTotal))
  const savedPercent = originalTotal > 0 ? round2((savedAmount / originalTotal) * 100) : 0
  const effectiveFold = originalTotal > 0 ? round2((finalTotal / originalTotal) * 10) : 10

  const calcItems: DiscountCalcItem[] = parsedItems.map(it => {
    const orig = round2(it.originalSubtotal)
    const fin = round2(it.originalSubtotal * payRatio)
    const saved = round2(Math.max(0, orig - fin))
    return {
      id: it.id,
      name: it.name,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      originalSubtotal: orig,
      finalSubtotal: fin,
      savedSubtotal: saved,
    }
  })

  return {
    ok: true,
    data: {
      promoMode: params.promoMode,
      originalTotal,
      finalTotal,
      savedAmount,
      savedPercent,
      effectiveFold,
      items: calcItems,
      threshold: thresholdMeta,
    },
  }
}
