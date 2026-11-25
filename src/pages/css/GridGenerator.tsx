import { useState, useMemo } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

const BOX_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
  'bg-pink-500', 'bg-lime-500', 'bg-sky-500', 'bg-fuchsia-500',
]

const JUSTIFY_ITEMS = ['stretch', 'start', 'center', 'end'] as const
const ALIGN_ITEMS = ['stretch', 'start', 'center', 'end'] as const

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

export default function GridGenerator() {
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(2)
  const [gap, setGap] = useState(12)
  const [justifyItems, setJustifyItems] = useState<string>('stretch')
  const [alignItems, setAlignItems] = useState<string>('stretch')
  const [autoFill, setAutoFill] = useState(false)

  const total = columns * rows

  const columnsCss = autoFill
    ? 'repeat(auto-fill, minmax(120px, 1fr))'
    : `repeat(${columns}, 1fr)`

  const css = useMemo(() => {
    return `.container {\n  display: grid;\n  grid-template-columns: ${columnsCss};\n  grid-template-rows: repeat(${rows}, 1fr);\n  gap: ${gap}px;\n  justify-items: ${justifyItems};\n  align-items: ${alignItems};\n}`
  }, [columnsCss, rows, gap, justifyItems, alignItems])

  const items = Array.from({ length: total }, (_, i) => i + 1)

  return (
    <ToolPage title="Grid 布局生成器" description="可视化配置 CSS Grid 行列、间距与对齐方式，实时预览并生成 CSS 代码">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 控制面板 */}
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold">网格属性</h2>
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span>列数</span>
                <span>{columns} 列</span>
              </div>
              <input
                type="range" min="1" max="6" value={columns}
                onChange={e => setColumns(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span>行数</span>
                <span>{rows} 行</span>
              </div>
              <input
                type="range" min="1" max="4" value={rows}
                onChange={e => setRows(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span>gap（间距）</span>
                <span>{gap}px</span>
              </div>
              <input
                type="range" min="0" max="40" value={gap}
                onChange={e => setGap(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <Select label="justify-items（水平对齐）" value={justifyItems} onChange={setJustifyItems} options={JUSTIFY_ITEMS} />
            <Select label="align-items（垂直对齐）" value={alignItems} onChange={setAlignItems} options={ALIGN_ITEMS} />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFill}
                onChange={e => setAutoFill(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              响应式列（auto-fill + minmax，列数随容器宽度自适应）
            </label>
          </div>

          {/* 实时预览 */}
          <div className="card p-6">
            <h2 className="text-base font-semibold mb-4">实时预览</h2>
            <div
              className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 overflow-auto"
              style={{
                display: 'grid',
                gridTemplateColumns: columnsCss,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap: `${gap}px`,
                justifyItems: justifyItems as React.CSSProperties['justifyItems'],
                alignItems: alignItems as React.CSSProperties['alignItems'],
                minHeight: 240,
              }}
            >
              {items.map(i => (
                <div
                  key={i}
                  className={`${BOX_COLORS[(i - 1) % BOX_COLORS.length]} text-white font-bold rounded-lg flex items-center justify-center`}
                  style={{ minHeight: 56 }}
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              当前共 {total} 个网格项（{columns} 列 × {rows} 行）。开启「响应式列」后，列宽会随容器宽度自动换行。
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
