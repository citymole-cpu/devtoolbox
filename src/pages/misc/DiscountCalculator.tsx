import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  calculateDiscount,
  foldToPercentOff,
  percentOffToFold,
  type CartItemInput,
  type DiscountErrorCode,
  type DiscountFormat,
  type PromoMode,
} from '../../lib/discountCalculator'
import {
  AlertCircle,
  CheckCircle2,
  Percent,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react'

type ItemMode = 'single' | 'multi'

const QUICK_DISCOUNTS = [
  { fold: 9, percentOff: 10 },
  { fold: 8, percentOff: 20 },
  { fold: 7, percentOff: 30 },
  { fold: 5, percentOff: 50 },
]

const THRESHOLD_PRESETS = [
  { threshold: '100', reduction: '15' },
  { threshold: '200', reduction: '30' },
  { threshold: '300', reduction: '50' },
  { threshold: '500', reduction: '100' },
]

function formatMoney(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatNumberTrim(value: number): string {
  if (!Number.isFinite(value)) return ''
  return String(Number(value.toFixed(2)))
}

let nextItemSeq = 3

function createDefaultItems(): CartItemInput[] {
  return [
    { id: 'item-1', name: '', unitPrice: '129', quantity: '2' },
    { id: 'item-2', name: '', unitPrice: '88', quantity: '1' },
  ]
}

export default function DiscountCalculator() {
  const { language } = useI18n()

  const [itemMode, setItemMode] = useState<ItemMode>('single')
  const [singlePrice, setSinglePrice] = useState<string>('299')
  const [items, setItems] = useState<CartItemInput[]>(createDefaultItems)

  const [promoMode, setPromoMode] = useState<PromoMode>('discount')
  const [discountFormat, setDiscountFormat] = useState<DiscountFormat>('fold')
  const [discountValue, setDiscountValue] = useState<string>('8')

  const [thresholdAmount, setThresholdAmount] = useState<string>('300')
  const [reductionAmount, setReductionAmount] = useState<string>('50')
  const [stackableThreshold, setStackableThreshold] = useState<boolean>(false)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        promoModeLabel: 'Promotion Mode',
        modeDiscount: 'Discount Rate',
        modeDiscountHint: 'Apply fold (0–10) or % OFF (0–100%)',
        modeThreshold: 'Spend X Save Y',
        modeThresholdHint: 'Auto-check if order meets the threshold',
        itemModeLabel: 'Items Mode',
        singleItem: 'Single Item',
        multiItem: 'Multiple Items',
        originalPrice: 'Original Price',
        pricePlaceholder: 'e.g. 299',
        discountInputLabel: 'Discount',
        formatFold: 'Fold (0–10)',
        formatPercentOff: '% OFF (0–100%)',
        foldPlaceholder: 'e.g. 8 (= 20% OFF)',
        percentPlaceholder: 'e.g. 20 (= 20% OFF)',
        foldHint: '0 = Free (100% OFF), 8 = pay 80% (20% OFF), 10 = Original price',
        percentHint: '0% = Original price, 20% = 20% OFF, 100% = Free',
        quickDiscounts: 'Quick Discounts',
        quickLabel: (fold: number, pct: number) => `${pct}% OFF (${fold}折)`,
        thresholdPresets: 'Common Thresholds',
        thresholdPresetLabel: (x: string, y: string) => `Spend ${x} Save ${y}`,
        thresholdLabel: 'Spend Threshold (X)',
        reductionLabel: 'Reduction Amount (Y)',
        stackableLabel: 'Stackable (every X saves Y)',
        addItem: 'Add Item',
        itemNamePlaceholder: (idx: number) => `Item ${idx} (optional)`,
        colItem: 'Item',
        colUnitPrice: 'Unit Price',
        colQty: 'Qty',
        colOriginal: 'Original',
        colDiscounted: 'After Discount',
        colSaved: 'Saved',
        clear: 'Clear',
        copyResult: 'Copy Result',
        resultOriginalTotal: 'Original Total',
        resultFinalTotal: 'Final Price',
        resultSavedAmount: 'You Save',
        resultSavedPercent: 'Savings Ratio',
        effectiveRateLabel: (fold: number) => `Equivalent to ${formatNumberTrim(fold)}/10`,
        thresholdQualified: (times: number, saved: number) =>
          times > 1
            ? `Threshold met ×${times} — total reduction ${formatMoney(saved)}`
            : `Threshold met — reduction ${formatMoney(saved)} applied`,
        thresholdUnmet: (shortfall: number) =>
          `Threshold not met — add ${formatMoney(shortfall)} more to qualify`,
        emptyHint: 'Enter valid price and discount/threshold parameters to see live results.',
        itemBreakdownTitle: 'Multi-Item Breakdown',
        copySummary: (d: {
          mode: PromoMode
          orig: string
          fin: string
          saved: string
          pct: string
          rule: string
        }) =>
          [
            `Discount Calculator Result (${d.mode === 'discount' ? 'Discount' : 'Spend & Save'})`,
            `Rule: ${d.rule}`,
            `Original Total: ${d.orig}`,
            `Final Price: ${d.fin}`,
            `Saved Amount: ${d.saved} (${d.pct}%)`,
          ].join('\n'),
        ruleDiscountFold: (v: string) => `${v}/10 (${formatNumberTrim(foldToPercentOff(Number(v)))}% OFF)`,
        ruleDiscountPct: (v: string) => `${v}% OFF`,
        ruleThreshold: (x: string, y: string, stack: boolean) =>
          stack ? `Every ${x} save ${y}` : `Spend ${x} save ${y}`,
        errors: {
          invalid_price: 'Price must be a valid number greater than 0.',
          price_out_of_range: 'Price exceeds the supported maximum.',
          invalid_quantity: 'Quantity must be a positive integer (1 – 1,000,000).',
          empty_items: 'Please add at least one item.',
          invalid_fold: 'Discount rate must be a valid number.',
          fold_out_of_range: 'Discount fold must be between 0 and 10 (0 = free, 10 = full price).',
          invalid_percent_off: 'Discount percentage must be a valid number.',
          percent_off_out_of_range: 'Discount percentage must be between 0% and 100%.',
          invalid_threshold: 'Spend threshold (X) must be a positive number.',
          invalid_reduction: 'Reduction amount (Y) must be a positive number.',
          reduction_exceeds_threshold: 'Reduction amount (Y) cannot exceed spend threshold (X).',
        } as Record<DiscountErrorCode, string>,
      }
    }

    if (language === 'ja-JP') {
      return {
        promoModeLabel: '割引モード',
        modeDiscount: '割引率計算',
        modeDiscountHint: '折数（0〜10）または割引率（0〜100% OFF）',
        modeThreshold: '購入額条件割引（満 X 減 Y）',
        modeThresholdHint: '条件金額に達しているか自動判定',
        itemModeLabel: '商品入力モード',
        singleItem: '単品',
        multiItem: '複数商品まとめ',
        originalPrice: '定価（元の価格）',
        pricePlaceholder: '例: 299',
        discountInputLabel: '割引設定',
        formatFold: '折数（0〜10）',
        formatPercentOff: '割引率（% OFF）',
        foldPlaceholder: '例: 8（20% OFF）',
        percentPlaceholder: '例: 20（20% OFF）',
        foldHint: '0 = 無料（100% OFF）、8 = 20% OFF、10 = 定価（割引なし）',
        percentHint: '0% = 割引なし、20% = 20% OFF、100% = 無料',
        quickDiscounts: 'よく使う割引',
        quickLabel: (fold: number, pct: number) => `${pct}% OFF（${fold}折）`,
        thresholdPresets: 'よく使う条件割引',
        thresholdPresetLabel: (x: string, y: string) => `${x}以上で${y}引`,
        thresholdLabel: '条件金額 (X)',
        reductionLabel: '値引き額 (Y)',
        stackableLabel: '繰り返し適用（XごとにY引き）',
        addItem: '商品を追加',
        itemNamePlaceholder: (idx: number) => `商品 ${idx}（任意）`,
        colItem: '商品',
        colUnitPrice: '単価',
        colQty: '数量',
        colOriginal: '元の小計',
        colDiscounted: '割引後小計',
        colSaved: '節約額',
        clear: 'クリア',
        copyResult: '結果をコピー',
        resultOriginalTotal: '元の合計',
        resultFinalTotal: '割引後価格',
        resultSavedAmount: '節約金額',
        resultSavedPercent: '割引率',
        effectiveRateLabel: (fold: number) => `実質 ${formatNumberTrim(fold)} 折`,
        thresholdQualified: (times: number, saved: number) =>
          times > 1
            ? `条件達成（×${times}）— 合計 ${formatMoney(saved)} 割引`
            : `条件達成 — ${formatMoney(saved)} 割引が適用されました`,
        thresholdUnmet: (shortfall: number) =>
          `条件未達 — あと ${formatMoney(shortfall)} 追加で割引対象になります`,
        emptyHint: '有効な価格と割引条件を入力すると計算結果が表示されます。',
        itemBreakdownTitle: '複数商品内訳',
        copySummary: (d: {
          mode: PromoMode
          orig: string
          fin: string
          saved: string
          pct: string
          rule: string
        }) =>
          [
            `割引計算結果（${d.mode === 'discount' ? '割引率' : '条件割引'}）`,
            `ルール: ${d.rule}`,
            `元の合計: ${d.orig}`,
            `割引後価格: ${d.fin}`,
            `節約金額: ${d.saved}（${d.pct}% OFF）`,
          ].join('\n'),
        ruleDiscountFold: (v: string) => `${v}折（${formatNumberTrim(foldToPercentOff(Number(v)))}% OFF）`,
        ruleDiscountPct: (v: string) => `${v}% OFF`,
        ruleThreshold: (x: string, y: string, stack: boolean) =>
          stack ? `${x}ごとに${y}引き` : `${x}以上で${y}引き`,
        errors: {
          invalid_price: '価格は 0 より大きい有効な数値を入力してください。',
          price_out_of_range: '価格が対応上限を超えています。',
          invalid_quantity: '数量は 1 以上の整数を入力してください。',
          empty_items: '商品を 1 件以上追加してください。',
          invalid_fold: '折数は有効な数値を入力してください。',
          fold_out_of_range: '折数は 0〜10 の範囲で入力してください（0=無料、10=定価）。',
          invalid_percent_off: '割引率は有効な数値を入力してください。',
          percent_off_out_of_range: '割引率は 0〜100% の範囲で入力してください。',
          invalid_threshold: '条件金額 (X) は 0 より大きい数値を入力してください。',
          invalid_reduction: '値引き額 (Y) は 0 より大きい数値を入力してください。',
          reduction_exceeds_threshold: '値引き額 (Y) は条件金額 (X) 以下にしてください。',
        } as Record<DiscountErrorCode, string>,
      }
    }

    return {
      promoModeLabel: '优惠计算模式',
      modeDiscount: '折扣计算',
      modeDiscountHint: '支持输入折数（如 8 折）或折扣百分比（如减 20%）',
      modeThreshold: '满减计算（满 X 减 Y）',
      modeThresholdHint: '输入满减门槛与减免金额，自动判断是否达标',
      itemModeLabel: '商品模式',
      singleItem: '单件商品',
      multiItem: '多件商品汇总',
      originalPrice: '商品原价',
      pricePlaceholder: '例如 299',
      discountInputLabel: '折扣设置',
      formatFold: '按折数（0–10 折）',
      formatPercentOff: '按减免百分比（% OFF）',
      foldPlaceholder: '例如 8（表示 8 折）',
      percentPlaceholder: '例如 20（表示省 20%）',
      foldHint: '0 折 = 免费（省 100%），8 折 = 付 80%（省 20%），10 折 = 原价（不打折）',
      percentHint: '0% = 不打折，20% = 减免 20%（8 折），100% = 免费',
      quickDiscounts: '常用折扣快捷按钮',
      quickLabel: (fold: number, pct: number) => `${fold} 折（省 ${pct}%）`,
      thresholdPresets: '常用满减快捷预设',
      thresholdPresetLabel: (x: string, y: string) => `满 ${x} 减 ${y}`,
      thresholdLabel: '满减门槛 (X)',
      reductionLabel: '减免金额 (Y)',
      stackableLabel: '每满 X 减 Y（支持叠加）',
      addItem: '添加商品行',
      itemNamePlaceholder: (idx: number) => `商品 ${idx}（选填）`,
      colItem: '商品',
      colUnitPrice: '单价',
      colQty: '数量',
      colOriginal: '原价小计',
      colDiscounted: '折后小计',
      colSaved: '节省',
      clear: '清空',
      copyResult: '复制结果',
      resultOriginalTotal: '原价总额',
      resultFinalTotal: '折后实付',
      resultSavedAmount: '节省金额',
      resultSavedPercent: '节省比例',
      effectiveRateLabel: (fold: number) => `折合 ${formatNumberTrim(fold)} 折`,
      thresholdQualified: (times: number, saved: number) =>
        times > 1
          ? `已达标（叠加 ${times} 次）— 共减免 ${formatMoney(saved)}`
          : `已达标 — 已减免 ${formatMoney(saved)}`,
      thresholdUnmet: (shortfall: number) =>
        `未达满减门槛 — 还差 ${formatMoney(shortfall)} 可享满减`,
      emptyHint: '请输入有效的原价与折扣/满减参数，实时查看折后价与节省金额。',
      itemBreakdownTitle: '多件商品费用明细',
      copySummary: (d: {
        mode: PromoMode
        orig: string
        fin: string
        saved: string
        pct: string
        rule: string
      }) =>
        [
          `折扣计算结果（${d.mode === 'discount' ? '折扣模式' : '满减模式'}）`,
          `优惠规则：${d.rule}`,
          `原价总额：${d.orig}`,
          `折后实付：${d.fin}`,
          `节省金额：${d.saved}（省 ${d.pct}%）`,
        ].join('\n'),
      ruleDiscountFold: (v: string) => `${v} 折（省 ${formatNumberTrim(foldToPercentOff(Number(v)))}%）`,
      ruleDiscountPct: (v: string) => `减免 ${v}%（${formatNumberTrim(percentOffToFold(Number(v)))} 折）`,
      ruleThreshold: (x: string, y: string, stack: boolean) =>
        stack ? `每满 ${x} 减 ${y}` : `满 ${x} 减 ${y}`,
      errors: {
        invalid_price: '商品价格必须是大于 0 的有效数字。',
        price_out_of_range: '商品价格超出支持上限。',
        invalid_quantity: '商品数量必须是大于等于 1 的正整数。',
        empty_items: '请至少保留一件商品。',
        invalid_fold: '折扣率必须是有效数字。',
        fold_out_of_range: '折扣率必须在 0 到 10 折之间（0 折免费，10 折原价）。',
        invalid_percent_off: '折扣百分比必须是有效数字。',
        percent_off_out_of_range: '折扣百分比必须在 0% 到 100% 之间。',
        invalid_threshold: '满减门槛 (X) 必须是大于 0 的有效数字。',
        invalid_reduction: '减免金额 (Y) 必须是大于 0 的有效数字。',
        reduction_exceeds_threshold: '减免金额 (Y) 不能大于满减门槛 (X)。',
      } as Record<DiscountErrorCode, string>,
    }
  }, [language])

  const handleDiscountFormatChange = (nextFormat: DiscountFormat) => {
    if (nextFormat === discountFormat) return
    const num = Number(discountValue.trim())
    if (discountValue.trim() !== '' && Number.isFinite(num)) {
      if (nextFormat === 'percentOff' && num >= 0 && num <= 10) {
        setDiscountValue(formatNumberTrim(foldToPercentOff(num)))
      } else if (nextFormat === 'fold' && num >= 0 && num <= 100) {
        setDiscountValue(formatNumberTrim(percentOffToFold(num)))
      }
    }
    setDiscountFormat(nextFormat)
  }

  const handleQuickDiscount = (fold: number, percentOff: number) => {
    setPromoMode('discount')
    setDiscountValue(discountFormat === 'fold' ? String(fold) : String(percentOff))
  }

  const handleAddItem = () => {
    const id = `item-${nextItemSeq++}`
    setItems(prev => [...prev, { id, name: '', unitPrice: '', quantity: '1' }])
  }

  const handleRemoveItem = (id: string) => {
    setItems(prev => (prev.length <= 1 ? prev : prev.filter(item => item.id !== id)))
  }

  const handleUpdateItem = (id: string, field: keyof Omit<CartItemInput, 'id'>, value: string) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleClear = () => {
    setSinglePrice('')
    setItems([{ id: `item-${nextItemSeq++}`, name: '', unitPrice: '', quantity: '1' }])
    setDiscountValue('')
    setThresholdAmount('')
    setReductionAmount('')
    setStackableThreshold(false)
  }

  const hasAnyInput = useMemo(() => {
    const hasPrice =
      itemMode === 'single'
        ? singlePrice.trim() !== ''
        : items.some(it => it.unitPrice.trim() !== '' || it.name.trim() !== '')
    const hasPromo =
      promoMode === 'discount'
        ? discountValue.trim() !== ''
        : thresholdAmount.trim() !== '' || reductionAmount.trim() !== ''
    return hasPrice || hasPromo
  }, [itemMode, singlePrice, items, promoMode, discountValue, thresholdAmount, reductionAmount])

  const outcome = useMemo(
    () =>
      calculateDiscount({
        itemMode,
        singlePrice,
        items,
        promoMode,
        discountFormat,
        discountValue,
        thresholdAmount,
        reductionAmount,
        stackableThreshold,
      }),
    [
      itemMode,
      singlePrice,
      items,
      promoMode,
      discountFormat,
      discountValue,
      thresholdAmount,
      reductionAmount,
      stackableThreshold,
    ]
  )

  const copyText = useMemo(() => {
    if (!outcome.ok) return ''
    const d = outcome.data
    const rule =
      d.promoMode === 'discount'
        ? discountFormat === 'fold'
          ? ui.ruleDiscountFold(discountValue.trim())
          : ui.ruleDiscountPct(discountValue.trim())
        : ui.ruleThreshold(thresholdAmount.trim(), reductionAmount.trim(), stackableThreshold)
    return ui.copySummary({
      mode: d.promoMode,
      orig: formatMoney(d.originalTotal),
      fin: formatMoney(d.finalTotal),
      saved: formatMoney(d.savedAmount),
      pct: formatNumberTrim(d.savedPercent),
      rule,
    })
  }, [outcome, discountFormat, discountValue, thresholdAmount, reductionAmount, stackableThreshold, ui])

  return (
    <ToolPage>
      <div className="space-y-6">
        {/* Main Input Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-5">
          {/* Promo Mode & Actions Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-orange-500" />
              {ui.promoModeLabel}
            </span>
            <div className="flex items-center gap-2">
              {outcome.ok && <CopyButton text={copyText} label={ui.copyResult} />}
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {ui.clear}
              </button>
            </div>
          </div>

          {/* Promo Mode Switch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPromoMode('discount')}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                promoMode === 'discount'
                  ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 ring-1 ring-orange-500/30'
                  : 'border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700'
              }`}
            >
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-orange-500" />
                {ui.modeDiscount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {ui.modeDiscountHint}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPromoMode('threshold')}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                promoMode === 'threshold'
                  ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 ring-1 ring-orange-500/30'
                  : 'border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700'
              }`}
            >
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                {ui.modeThreshold}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {ui.modeThresholdHint}
              </div>
            </button>
          </div>

          {/* Item Mode Switch */}
          <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-orange-500" />
                {ui.itemModeLabel}
              </span>
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setItemMode('single')}
                  className={`px-3 py-1 font-medium transition-colors ${
                    itemMode === 'single'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {ui.singleItem}
                </button>
                <button
                  type="button"
                  onClick={() => setItemMode('multi')}
                  className={`px-3 py-1 font-medium transition-colors ${
                    itemMode === 'multi'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {ui.multiItem}
                </button>
              </div>
            </div>

            {itemMode === 'single' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {ui.originalPrice}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={singlePrice}
                  onChange={e => setSinglePrice(e.target.value)}
                  placeholder={ui.pricePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleUpdateItem(item.id, 'name', e.target.value)}
                      placeholder={ui.itemNamePlaceholder(idx + 1)}
                      className="col-span-12 sm:col-span-5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={item.unitPrice}
                      onChange={e => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                      placeholder={ui.colUnitPrice}
                      aria-label={ui.colUnitPrice}
                      className="col-span-6 sm:col-span-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      step="1"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleUpdateItem(item.id, 'quantity', e.target.value)}
                      placeholder={ui.colQty}
                      aria-label={ui.colQty}
                      className="col-span-4 sm:col-span-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                    />
                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length <= 1}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-600 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title={ui.clear}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-orange-300 dark:border-orange-700 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {ui.addItem}
                </button>
              </div>
            )}
          </div>

          {/* Discount or Threshold Inputs */}
          <div className="pt-1 border-t border-gray-100 dark:border-gray-800 space-y-3">
            {promoMode === 'discount' ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ui.discountInputLabel}
                  </label>
                  <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => handleDiscountFormatChange('fold')}
                      className={`px-2.5 py-1 font-medium transition-colors ${
                        discountFormat === 'fold'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {ui.formatFold}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDiscountFormatChange('percentOff')}
                      className={`px-2.5 py-1 font-medium transition-colors ${
                        discountFormat === 'percentOff'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {ui.formatPercentOff}
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max={discountFormat === 'fold' ? '10' : '100'}
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  placeholder={
                    discountFormat === 'fold' ? ui.foldPlaceholder : ui.percentPlaceholder
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                />

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {discountFormat === 'fold' ? ui.foldHint : ui.percentHint}
                </p>

                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {ui.quickDiscounts}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_DISCOUNTS.map(q => {
                      const active =
                        discountFormat === 'fold'
                          ? Number(discountValue) === q.fold && discountValue.trim() !== ''
                          : Number(discountValue) === q.percentOff && discountValue.trim() !== ''
                      return (
                        <button
                          key={q.fold}
                          type="button"
                          onClick={() => handleQuickDiscount(q.fold, q.percentOff)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            active
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-700'
                          }`}
                        >
                          {ui.quickLabel(q.fold, q.percentOff)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {ui.thresholdLabel}
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={thresholdAmount}
                      onChange={e => setThresholdAmount(e.target.value)}
                      placeholder="300"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {ui.reductionLabel}
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={reductionAmount}
                      onChange={e => setReductionAmount(e.target.value)}
                      placeholder="50"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                    />
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={stackableThreshold}
                    onChange={e => setStackableThreshold(e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span>{ui.stackableLabel}</span>
                </label>

                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {ui.thresholdPresets}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {THRESHOLD_PRESETS.map(p => {
                      const active =
                        thresholdAmount === p.threshold && reductionAmount === p.reduction
                      return (
                        <button
                          key={`${p.threshold}-${p.reduction}`}
                          type="button"
                          onClick={() => {
                            setThresholdAmount(p.threshold)
                            setReductionAmount(p.reduction)
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            active
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-700'
                          }`}
                        >
                          {ui.thresholdPresetLabel(p.threshold, p.reduction)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Validation Errors */}
          {'errors' in outcome && hasAnyInput && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3.5 text-sm text-red-700 dark:text-red-300 space-y-1">
              {outcome.errors.map(err => (
                <div key={err} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{ui.errors[err]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Section */}
        {outcome.ok ? (
          <div className="space-y-5">
            {/* Threshold Qualification Banner */}
            {outcome.data.threshold && (
              <div
                className={`rounded-xl border p-4 flex items-center gap-3 text-sm font-medium ${
                  outcome.data.threshold.qualified
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
                }`}
              >
                {outcome.data.threshold.qualified ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <span>
                  {outcome.data.threshold.qualified
                    ? ui.thresholdQualified(
                        outcome.data.threshold.appliedTimes,
                        outcome.data.savedAmount
                      )
                    : ui.thresholdUnmet(outcome.data.threshold.shortfall)}
                </span>
              </div>
            )}

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/70 dark:bg-orange-950/30 p-4">
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300">
                  {ui.resultFinalTotal}
                </div>
                <div className="mt-1.5 text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
                  {formatMoney(outcome.data.finalTotal)}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {ui.effectiveRateLabel(outcome.data.effectiveFold)}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.resultOriginalTotal}
                </div>
                <div className="mt-1.5 text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
                  {formatMoney(outcome.data.originalTotal)}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-4">
                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {ui.resultSavedAmount}
                </div>
                <div className="mt-1.5 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatMoney(outcome.data.savedAmount)}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.resultSavedPercent}
                </div>
                <div className="mt-1.5 text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
                  {formatNumberTrim(outcome.data.savedPercent)}%
                </div>
              </div>
            </div>

            {/* Multi-Item Breakdown Table */}
            {itemMode === 'multi' && outcome.data.items.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {ui.itemBreakdownTitle}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-950/60 text-xs text-gray-500 dark:text-gray-400">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium">{ui.colItem}</th>
                        <th className="text-right px-4 py-2.5 font-medium">{ui.colUnitPrice}</th>
                        <th className="text-right px-4 py-2.5 font-medium">{ui.colQty}</th>
                        <th className="text-right px-4 py-2.5 font-medium">{ui.colOriginal}</th>
                        <th className="text-right px-4 py-2.5 font-medium">{ui.colDiscounted}</th>
                        <th className="text-right px-4 py-2.5 font-medium">{ui.colSaved}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
                      {outcome.data.items.map((it, idx) => (
                        <tr key={it.id}>
                          <td className="px-4 py-2.5 font-sans text-gray-900 dark:text-gray-100">
                            {it.name.trim() || `#${idx + 1}`}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-300">
                            {formatMoney(it.unitPrice)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-300">
                            {it.quantity}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-200">
                            {formatMoney(it.originalSubtotal)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-orange-600 dark:text-orange-400">
                            {formatMoney(it.finalSubtotal)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                            -{formatMoney(it.savedSubtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          !hasAnyInput && (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {ui.emptyHint}
            </div>
          )
        )}
      </div>
    </ToolPage>
  )
}
