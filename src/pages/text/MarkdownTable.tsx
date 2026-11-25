import { useState, useMemo } from 'react'
import Papa from 'papaparse'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { downloadFile } from '../../lib/utils'
import { Plus, Trash2, Download, RotateCcw, TableProperties, AlignLeft, AlignCenter, AlignRight, FileUp } from 'lucide-react'

type Align = 'left' | 'center' | 'right'

const DEFAULT_CELLS: string[][] = [
  ['名称', '数量', '单价'],
  ['苹果', '10', '¥5.00'],
  ['香蕉', '20', '¥3.50'],
  ['橙子', '15', '¥4.20'],
]
const DEFAULT_ALIGNS: Align[] = ['left', 'center', 'right']

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
}

function buildMarkdown(cells: string[][], aligns: Align[], hasHeader: boolean): string {
  if (cells.length === 0 || cells[0].length === 0) return ''
  const cols = cells[0].length
  const sep = aligns.slice(0, cols).map(a => (a === 'left' ? ':---' : a === 'center' ? ':---:' : '---:'))
  const header = hasHeader ? cells[0] : Array<string>(cols).fill('')
  const body = hasHeader ? cells.slice(1) : cells
  const lines = [
    `| ${header.map(escapeCell).join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...body.map(row => `| ${row.map(escapeCell).join(' | ')} |`),
  ]
  return lines.join('\n')
}

const ALIGN_LABEL: Record<Align, string> = { left: '左对齐', center: '居中', right: '右对齐' }

export default function MarkdownTable() {
  const [cells, setCells] = useState<string[][]>(DEFAULT_CELLS)
  const [aligns, setAligns] = useState<Align[]>(DEFAULT_ALIGNS)
  const [hasHeader, setHasHeader] = useState(true)
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState('')

  const rows = cells.length
  const cols = cells.length > 0 ? cells[0].length : 0

  const markdown = useMemo(() => buildMarkdown(cells, aligns, hasHeader), [cells, aligns, hasHeader])

  const setCell = (r: number, c: number, value: string) => {
    setCells(prev => prev.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row)))
  }

  const addRow = () => setCells(prev => [...prev, Array<string>(cols).fill('')])
  const removeRow = (r: number) => {
    if (rows <= 1) return
    setCells(prev => prev.filter((_, ri) => ri !== r))
  }
  const addCol = () => {
    setCells(prev => prev.map(row => [...row, '']))
    setAligns(prev => [...prev, 'left'])
  }
  const removeCol = (c: number) => {
    if (cols <= 1) return
    setCells(prev => prev.map(row => row.filter((_, ci) => ci !== c)))
    setAligns(prev => prev.filter((_, ci) => ci !== c))
  }
  const setAlign = (c: number, a: Align) => {
    setAligns(prev => prev.map((v, ci) => (ci === c ? a : v)))
  }

  const resetAll = () => {
    setCells(DEFAULT_CELLS)
    setAligns(DEFAULT_ALIGNS)
    setHasHeader(true)
    setImportText('')
    setImportMsg('')
  }

  const doImport = () => {
    const text = importText.trim()
    if (!text) {
      setImportMsg('请先粘贴 CSV 或制表符分隔的文本')
      return
    }
    const delimiter = text.includes('\t') ? '\t' : ','
    const result = Papa.parse<string[]>(text, { delimiter, skipEmptyLines: true })
    const parsed = (result.data as string[][]).filter(row => row.some(cell => cell.trim() !== ''))
    if (parsed.length === 0) {
      setImportMsg('未能解析出任何数据，请检查格式')
      return
    }
    const maxCols = Math.max(...parsed.map(row => row.length))
    const normalized = parsed.map(row => {
      const r = [...row]
      while (r.length < maxCols) r.push('')
      return r
    })
    setCells(normalized)
    setAligns(Array<Align>(maxCols).fill('left'))
    setHasHeader(true)
    setImportMsg(`已导入 ${normalized.length} 行 × ${maxCols} 列（${delimiter === '\t' ? '制表符' : '逗号'}分隔）`)
  }

  const downloadMd = () => {
    if (!markdown) return
    downloadFile(markdown, 'table.md', 'text/markdown')
  }

  return (
    <ToolPage title="Markdown 表格生成器" description="可视化编辑表格，实时生成标准 Markdown 表格：点格子直接改内容，逐列设对齐，支持 CSV / 制表符粘贴导入">
      <div className="flex flex-col gap-6">
        {/* 工具栏 */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <TableProperties className="w-4 h-4" /> 表格设置
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              当前 {rows} 行 × {cols} 列
            </span>
            <button onClick={addRow} className="btn-secondary btn-sm inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> 添加行
            </button>
            <button onClick={addCol} className="btn-secondary btn-sm inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> 添加列
            </button>
            <button onClick={resetAll} className="btn-ghost btn-sm inline-flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> 恢复示例
            </button>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none ml-auto">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={e => setHasHeader(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <span>首行作为表头</span>
            </label>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            点击任意格子直接编辑；单元格里的竖线 | 会自动转义为 \|，换行会被替换为空格。
          </p>
        </div>

        {/* 可视化编辑器 */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {aligns.map((a, c) => (
                    <th key={c} className="p-2 border-b border-gray-200 dark:border-gray-700 min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <select
                          value={a}
                          onChange={e => setAlign(c, e.target.value as Align)}
                          className="flex-1 min-w-0 px-2 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title={`第 ${c + 1} 列对齐方式`}
                        >
                          <option value="left">左对齐</option>
                          <option value="center">居中</option>
                          <option value="right">右对齐</option>
                        </select>
                        <button
                          onClick={() => removeCol(c)}
                          disabled={cols <= 1}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="删除该列"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-10" />
                </tr>
              </thead>
              <tbody>
                {cells.map((row, r) => (
                  <tr key={r} className={hasHeader && r === 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                    {row.map((cell, c) => (
                      <td key={c} className="p-1.5 border-b border-gray-100 dark:border-gray-700/50">
                        <input
                          value={cell}
                          onChange={e => setCell(r, c, e.target.value)}
                          placeholder={hasHeader && r === 0 ? `列 ${c + 1} 标题` : ''}
                          className={`w-full px-2.5 py-2 rounded-md border border-transparent bg-transparent text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-gray-800 ${
                            aligns[c] === 'center' ? 'text-center' : aligns[c] === 'right' ? 'text-right' : 'text-left'
                          } ${hasHeader && r === 0 ? 'font-semibold' : ''}`}
                        />
                      </td>
                    ))}
                    <td className="p-1.5 border-b border-gray-100 dark:border-gray-700/50 text-center">
                      <button
                        onClick={() => removeRow(r)}
                        disabled={rows <= 1}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="删除该行"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            {aligns.map((a, c) => (
              <span key={c} className="inline-flex items-center gap-1">
                {a === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : a === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                第 {c + 1} 列：{ALIGN_LABEL[a]}
              </span>
            ))}
          </div>
        </div>

        {/* 导入 */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
            <FileUp className="w-4 h-4" /> 从 CSV / 制表符文本导入
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            从 Excel 或其他表格复制多行多列粘贴进来（逗号分隔或制表符分隔均可，引号包裹的字段也能正确解析），导入后会替换当前表格。
          </p>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            spellCheck={false}
            placeholder={'例如：\n名称,数量,单价\n苹果,10,¥5.00\n香蕉,20,¥3.50'}
            className="w-full h-24 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center gap-3 mt-3">
            <button onClick={doImport} className="btn-primary btn-sm">
              导入并替换表格
            </button>
            {importMsg && <span className="text-xs text-gray-600 dark:text-gray-300">{importMsg}</span>}
          </div>
        </div>

        {/* 生成的 Markdown */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">生成的 Markdown</span>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadMd}
                disabled={!markdown}
                className="btn-ghost btn-sm inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载 .md</span>
              </button>
              <CopyButton text={markdown} label="复制" />
            </div>
          </div>
          <pre className="px-4 py-3 bg-white dark:bg-gray-800 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre">
            {markdown || '（表格为空）'}
          </pre>
        </div>

        {/* 实时预览 */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4">实时预览</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {(hasHeader ? cells[0] : cells[0].map(() => '')).map((h, c) => (
                    <th
                      key={c}
                      className={`px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100 ${
                        aligns[c] === 'center' ? 'text-center' : aligns[c] === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h || ' '}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(hasHeader ? cells.slice(1) : cells).map((row, r) => (
                  <tr key={r} className="border-b last:border-b-0 border-gray-100 dark:border-gray-700/50">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`px-3 py-2.5 text-gray-700 dark:text-gray-300 ${
                          aligns[c] === 'center' ? 'text-center' : aligns[c] === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {cell || ' '}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            生成的表格是标准 Markdown 语法，在 GitHub、GitLab、Notion、Typora 等支持 Markdown 的地方都能直接渲染。
          </p>
        </div>
      </div>
    </ToolPage>
  )
}
