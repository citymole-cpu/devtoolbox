import { AD_UNITS, type AdSlotName } from '../lib/ads'

interface AdSlotProps {
  /** 广告位名称，对应 src/lib/ads.ts 里的 key */
  slot: AdSlotName
  /** A-ADS 尺寸参数，默认 Adaptive（自适应） */
  size?: string
  className?: string
}

/**
 * A-ADS 广告位占位组件（与 ZapBits 站内同一套 iframe 嵌入方式：
 * <iframe data-aa="UNIT_ID" src="//ad.a-ads.com/UNIT_ID/?size=...">）。
 * 单元 ID 未填时不渲染任何内容，不影响页面布局和工具使用。
 */
export function AdSlot({ slot, size = 'Adaptive', className = '' }: AdSlotProps) {
  const unit = AD_UNITS[slot]
  if (!unit) return null
  return (
    <div
      data-ad-slot={slot}
      className={`my-4 ${className}`}
      role="complementary"
      aria-label="Advertisement"
    >
      <div className="text-center text-[10px] tracking-wide text-gray-400 dark:text-gray-600 mb-1">
        Advertisement
      </div>
      <iframe
        data-aa={unit}
        src={`//ad.a-ads.com/${unit}/?size=${size}`}
        title="Advertisement"
        style={{
          border: 0,
          padding: 0,
          width: '100%',
          height: 'auto',
          overflow: 'hidden',
          display: 'block',
          margin: 'auto',
        }}
      />
    </div>
  )
}

export default AdSlot
