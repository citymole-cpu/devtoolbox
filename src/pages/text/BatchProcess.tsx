import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'

export default function BatchProcess() {
  const [input, setInput] = useState('apple\nbanana\norange\npeach\nwatermelon')
  const [output, setOutput] = useState('')

  // Settings
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const [filterMode, setFilterMode] = useState<'include' | 'exclude'>('include')

  const applyProcessing = (
    text: string,
    pFix = prefix,
    sFix = suffix,
    fWord = filterKeyword,
    fMode = filterMode
  ) => {
    let lines = text.split('\n')

    // Filter lines
    if (fWord.trim()) {
      lines = lines.filter(line => {
        const has = line.includes(fWord)
        return fMode === 'include' ? has : !has
      })
    }

    // Add prefix & suffix
    const processed = lines.map(line => `${pFix}${line}${sFix}`)
    setOutput(processed.join('\n'))
  }

  const handleInputChange = (val: string) => {
    setInput(val)
    applyProcessing(val)
  }

  const handleTrimWhitespace = () => {
    const lines = input.split('\n').map(l => l.trim())
    setInput(lines.join('\n'))
    applyProcessing(lines.join('\n'))
  }

  const handleRemoveEmptyLines = () => {
    const lines = input.split('\n').filter(l => l.trim() !== '')
    setInput(lines.join('\n'))
    applyProcessing(lines.join('\n'))
  }

  const handleWrapQuotes = () => {
    const lines = input.split('\n').map(l => `"${l.replace(/"/g, '\\"')}"`)
    setInput(lines.join('\n'))
    applyProcessing(lines.join('\n'))
  }

  const handleAddComma = () => {
    const lines = input.split('\n').map((l, i, arr) => (i === arr.length - 1 ? l : `${l},`))
    setInput(lines.join('\n'))
    applyProcessing(lines.join('\n'))
  }

  return (
    <ToolPage title="文本批量行处理" description="每行批量添加统一前后缀、去除空格、按关键词行过滤与快速包裹引号/逗号">
      <div className="flex flex-col gap-5">
        {/* Actions bar */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="label text-xs">统一添加行前缀</label>
              <input
                type="text"
                value={prefix}
                onChange={e => {
                  setPrefix(e.target.value)
                  applyProcessing(input, e.target.value)
                }}
                placeholder="如: SELECT * FROM "
                className="input-field text-xs font-mono"
              />
            </div>

            <div>
              <label className="label text-xs">统一添加行后缀</label>
              <input
                type="text"
                value={suffix}
                onChange={e => {
                  setSuffix(e.target.value)
                  applyProcessing(input, prefix, e.target.value)
                }}
                placeholder="如: ; 或 ,"
                className="input-field text-xs font-mono"
              />
            </div>

            <div>
              <label className="label text-xs">按行关键词过滤</label>
              <input
                type="text"
                value={filterKeyword}
                onChange={e => {
                  setFilterKeyword(e.target.value)
                  applyProcessing(input, prefix, suffix, e.target.value)
                }}
                placeholder="输入匹配的字词..."
                className="input-field text-xs"
              />
            </div>

            <div className="flex items-end gap-2">
              <select
                value={filterMode}
                onChange={e => {
                  const m = e.target.value as 'include' | 'exclude'
                  setFilterMode(m)
                  applyProcessing(input, prefix, suffix, filterKeyword, m)
                }}
                className="select-field text-xs w-full"
              >
                <option value="include">仅保留包含行</option>
                <option value="exclude">剔除包含行</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <button onClick={handleTrimWhitespace} className="btn-secondary btn-sm text-xs">
              去除每行首尾空格
            </button>
            <button onClick={handleRemoveEmptyLines} className="btn-secondary btn-sm text-xs">
              剔除所有空白行
            </button>
            <button onClick={handleWrapQuotes} className="btn-secondary btn-sm text-xs">
              批量添加双引号 ("...")
            </button>
            <button onClick={handleAddComma} className="btn-secondary btn-sm text-xs">
              每行末尾追加逗号 (,)
            </button>
          </div>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={handleInputChange}
          inputLabel="原始多行文本"
          outputLabel="处理后文本输出"
        />
      </div>
    </ToolPage>
  )
}

