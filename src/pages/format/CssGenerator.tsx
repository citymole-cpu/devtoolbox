import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

export default function CssGenerator() {
  const [tab, setTab] = useState<'shadow' | 'gradient'>('shadow')

  // Box shadow states
  const [xOffset, setXOffset] = useState(0)
  const [yOffset, setYOffset] = useState(8)
  const [blur, setBlur] = useState(24)
  const [spread, setSpread] = useState(0)
  const [shadowColor, setShadowColor] = useState('#000000')
  const [shadowOpacity, setShadowOpacity] = useState(0.15)
  const [isInset, setIsInset] = useState(false)

  // Gradient states
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear')
  const [gradAngle, setGradAngle] = useState(135)
  const [color1, setColor1] = useState('#3B82F6')
  const [color2, setColor2] = useState('#8B5CF6')

  // Compute shadow
  const hexToRgba = (hex: string, alpha: number) => {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = (num >> 16) & 255
    const g = (num >> 8) & 255
    const b = num & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const shadowCss = `${isInset ? 'inset ' : ''}${xOffset}px ${yOffset}px ${blur}px ${spread}px ${hexToRgba(
    shadowColor,
    shadowOpacity
  )}`

  // Compute gradient
  const gradCss =
    gradType === 'linear'
      ? `linear-gradient(${gradAngle}deg, ${color1}, ${color2})`
      : `radial-gradient(circle, ${color1}, ${color2})`

  return (
    <ToolPage title="CSS 阴影与渐变生成器" description="可视化调整参数生成 CSS box-shadow 阴影与背景渐变代码并实时预览">
      <div className="flex flex-col gap-6">
        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('shadow')}
            className={`btn btn-sm ${tab === 'shadow' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Box-Shadow 阴影生成
          </button>
          <button
            onClick={() => setTab('gradient')}
            className={`btn btn-sm ${tab === 'gradient' ? 'btn-primary' : 'btn-secondary'}`}
          >
            CSS 渐变背景生成
          </button>
        </div>

        {tab === 'shadow' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="card p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>X 轴偏移: {xOffset}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={xOffset}
                    onChange={e => setXOffset(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Y 轴偏移: {yOffset}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={yOffset}
                    onChange={e => setYOffset(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>模糊半径 (Blur): {blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={blur}
                    onChange={e => setBlur(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>扩散大小 (Spread): {spread}px</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    value={spread}
                    onChange={e => setSpread(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="label text-xs">阴影颜色</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={shadowColor}
                      onChange={e => setShadowColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="font-mono text-xs">{shadowColor}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>透明度: {shadowOpacity}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={shadowOpacity}
                    onChange={e => setShadowOpacity(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer select-none mt-2">
                <input
                  type="checkbox"
                  checked={isInset}
                  onChange={e => setIsInset(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>内阴影 (Inset)</span>
              </label>

              {/* Generated Code */}
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border font-mono text-xs flex justify-between items-center">
                <span className="truncate mr-2">box-shadow: {shadowCss};</span>
                <CopyButton text={`box-shadow: ${shadowCss};`} />
              </div>
            </div>

            {/* Preview Box */}
            <div className="card p-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900/40">
              <div
                className="w-48 h-48 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center font-semibold text-sm transition-all duration-150"
                style={{ boxShadow: shadowCss }}
              >
                阴影效果预览
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gradient Controls */}
            <div className="card p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGradType('linear')}
                  className={`btn btn-sm ${gradType === 'linear' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  线性渐变 (Linear)
                </button>
                <button
                  onClick={() => setGradType('radial')}
                  className={`btn btn-sm ${gradType === 'radial' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  径向渐变 (Radial)
                </button>
              </div>

              {gradType === 'linear' && (
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>角度方向: {gradAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradAngle}
                    onChange={e => setGradAngle(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">起始颜色</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color1}
                      onChange={e => setColor1(e.target.value)}
                      className="w-9 h-9 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color1}
                      onChange={e => setColor1(e.target.value)}
                      className="input-field font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs">终止颜色</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color2}
                      onChange={e => setColor2(e.target.value)}
                      className="w-9 h-9 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color2}
                      onChange={e => setColor2(e.target.value)}
                      className="input-field font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Code */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border font-mono text-xs flex justify-between items-center">
                <span className="truncate mr-2">background: {gradCss};</span>
                <CopyButton text={`background: ${gradCss};`} />
              </div>
            </div>

            {/* Gradient Preview */}
            <div className="card p-6 flex items-center justify-center">
              <div
                className="w-full h-64 rounded-2xl shadow-md border flex items-center justify-center font-bold text-white text-base drop-shadow-md transition-all"
                style={{ background: gradCss }}
              >
                渐变背景预览
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

