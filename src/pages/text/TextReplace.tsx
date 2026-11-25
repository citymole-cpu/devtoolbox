import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'
import { Replace } from 'lucide-react'

export default function TextReplace() {
  const [input, setInput] = useState('2024-01-15: Order 1001 processed.\n2024-01-16: Order 1002 processed.\n2024-01-17: Order 1003 processed.')
  const [findStr, setFindStr] = useState('Order (\\d+)')
  const [replaceStr, setReplaceStr] = useState('订单号 #$1')
  const [isRegex, setIsRegex] = useState(true)
  const [matchCase, setMatchCase] = useState(false)
  const [output, setOutput] = useState('')
  const [replaceCount, setReplaceCount] = useState(0)
  const [error, setError] = useState('')

  const handleProcess = (
    text: string,
    f = findStr,
    r = replaceStr,
    reg = isRegex,
    mc = matchCase
  ) => {
    setInput(text)
    if (!text || !f) {
      setOutput(text)
      setReplaceCount(0)
      setError('')
      return
    }

    try {
      let count = 0
      if (reg) {
        const flags = `g${mc ? '' : 'i'}`
        const regex = new RegExp(f, flags)
        const matches = text.match(regex)
        count = matches ? matches.length : 0
        const res = text.replace(regex, r)
        setOutput(res)
      } else {
        const flags = `g${mc ? '' : 'i'}`
        const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escaped, flags)
        const matches = text.match(regex)
        count = matches ? matches.length : 0
        const res = text.replace(regex, r)
        setOutput(res)
      }
      setReplaceCount(count)
      setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '正则表达式语法有误')
    }
  }

  useEffect(() => {
    handleProcess(input, findStr, replaceStr, isRegex, matchCase)
  }, [findStr, replaceStr, isRegex, matchCase])

  return (
    <ToolPage title="文本查找替换" description="支持普通字符串与正则表达式(RegExp)批量搜索、全局替换与捕获组引用">
      <div className="flex flex-col gap-5">
        <div className="card p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">查找内容 (支持正则或普通文本)</label>
              <input
                type="text"
                value={findStr}
                onChange={e => setFindStr(e.target.value)}
                placeholder="输入要查找的文本或正则表达式..."
                className="input-field font-mono text-sm"
              />
            </div>
            <div>
              <label className="label text-xs">替换为 (支持 $1, $2 捕获组)</label>
              <input
                type="text"
                value={replaceStr}
                onChange={e => setReplaceStr(e.target.value)}
                placeholder="输入替换后的文本..."
                className="input-field font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRegex}
                  onChange={e => setIsRegex(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>正则表达式模式 (RegExp)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={e => setMatchCase(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>区分大小写</span>
              </label>
            </div>

            <div className="text-xs text-gray-500 font-mono">
              共匹配并替换: <span className="font-bold text-brand-600">{replaceCount}</span> 处
            </div>
          </div>

          {error && <div className="error-text text-xs">{error}</div>}
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => handleProcess(val)}
          inputLabel="原始文本"
          outputLabel="替换后输出"
        />
      </div>
    </ToolPage>
  )
}

