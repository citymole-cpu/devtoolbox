import { useState, useMemo } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

const BOX_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
]

const DIRECTIONS = ['row', 'row-reverse', 'column', 'column-reverse'] as const
const JUSTIFY = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'] as const
const ALIGN = ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'] as const
const WRAPS = ['nowrap', 'wrap', 'wrap-reverse'] as const

function Select({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export default function FlexboxGenerator() {
  const [direction, setDirection] = useState<string>('row')
  const [justify, setJustify] = useState<string>('flex-start')
  const [align, setAlign] = useState<string>('center')
  const [wrap, setWrap] = useState<string>('nowrap')
  const [gap, setGap] = useState(16)
  const [itemCount, setItemCount] = useState(4)
  const [containerHeight, setContainerHeight] = useState(240)

  const css = useMemo(() => {
    return `.container {\n  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n  flex-wrap: ${wrap};\n  gap: ${gap}px;\n}`
  }, [direction, justify, align, wrap, gap])

  const items = Array.from({ length: itemCount }, (_, i) => i + 1)

  return (
    <ToolPage title="Flexbox 布局生成器" description="可视化调整 Flexbox 容器属性，实时预览布局效果并生成 CSS 代码">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 控制面板 */}
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold">容器属性</h2>
            <Select label="flex-direction（主轴方向）" value={direction} onChange={setDirection} options={DIRECTIONS} />
            <Select label="justify-content（主轴对齐）" value={justify} onChange={setJustify} options={JUSTIFY} />
            <Select label="align-items（交叉轴对齐）" value={align} onChange={setAlign} options={ALIGN} />
            <Select label="flex-wrap（换行）" value={wrap} onChange={setWrap} options={WRAPS} />
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span>gap（间距）</span>
                <span>{gap}px</span>
              </div>
              <input
                type="range" min="0" max="48" value={gap}
                onChange={e => setGap(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span>子元素数量</span>
                <span>{itemCount} 个</span>
              </div>
              <input
                type="range" min="1" max="8" value={itemCount}
                onChange={e => setItemCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span>容器高度</span>
                <span>{containerHeight}px</span>
              </div>
              <input
                type="range" min="120" max="400" step="20" value={containerHeight}
                onChange={e => setContainerHeight(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* 实时预览 */}
          <div className="card p-6">
            <h2 className="text-base font-semibold mb-4">实时预览</h2>
            <div
              className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 overflow-auto"
              style={{
                display: 'flex',
                flexDirection: direction as React.CSSProperties['flexDirection'],
                justifyContent: justify as React.CSSProperties['justifyContent'],
                alignItems: align as React.CSSProperties['alignItems'],
                flexWrap: wrap as React.CSSProperties['flexWrap'],
                gap: `${gap}px`,
                minHeight: containerHeight,
              }}
            >
              {items.map(i => (
                <div
                  key={i}
                  className={`${BOX_COLORS[(i - 1) % BOX_COLORS.length]} text-white font-bold rounded-lg flex items-center justify-center shrink-0`}
                  style={{ width: 64, height: i % 3 === 0 ? 96 : 64 }}
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              提示：调整左侧属性，预览区会实时变化；子元素高度交替为 64 / 96px，便于观察 align-items 的效果。
            </p>
          </div>
        </div>

        {/* 生成的 CSS */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">生成的 CSS</h2>
            <CopyButton text={css} label="复制 CSS" />
          </div>
          <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre">{css}</pre>
        </div>
      </div>
    </ToolPage>
  )
}
