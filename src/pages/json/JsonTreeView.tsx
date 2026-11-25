import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { ChevronRight, ChevronDown, Braces, Copy } from 'lucide-react'
import { CopyButton } from '../../components/CopyButton'

// Recursive tree node component
function TreeNode({ keyName, value, depth = 0 }: { keyName?: string; value: any; depth?: number }) {
  const [expanded, setExpanded] = useState(true)

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value)
  const isArray = Array.isArray(value)
  const isContainer = isObject || isArray

  const getTypeBadge = (val: any) => {
    if (val === null) return <span className="text-[10px] text-gray-400 font-mono">null</span>
    if (Array.isArray(val)) return <span className="text-[10px] text-purple-500 font-mono">Array[{val.length}]</span>
    if (typeof val === 'object') return <span className="text-[10px] text-blue-500 font-mono">Object</span>
    if (typeof val === 'string') return <span className="text-[10px] text-green-600 dark:text-green-400 font-mono">string</span>
    if (typeof val === 'number') return <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">number</span>
    if (typeof val === 'boolean') return <span className="text-[10px] text-red-500 font-mono">bool</span>
    return null
  }

  return (
    <div className="font-mono text-xs select-text">
      <div
        className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
        onClick={() => isContainer && setExpanded(!expanded)}
      >
        {isContainer ? (
          <span className="text-gray-400">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5" />
        )}

        {keyName !== undefined && (
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            "{keyName}":
          </span>
        )}

        {isContainer ? (
          <div className="flex items-center gap-2">
            {getTypeBadge(value)}
            {!expanded && <span className="text-gray-400">{isArray ? '[ ... ]' : '{ ... }'}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={
                typeof value === 'string'
                  ? 'text-green-600 dark:text-green-400'
                  : typeof value === 'number'
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : typeof value === 'boolean'
                  ? 'text-red-500 font-bold'
                  : 'text-gray-400 italic'
              }
            >
              {typeof value === 'string' ? `"${value}"` : String(value)}
            </span>
            {getTypeBadge(value)}
          </div>
        )}
      </div>

      {isContainer && expanded && (
        <div className="pl-4 border-l border-gray-200 dark:border-gray-800 ml-2 mt-0.5 space-y-0.5">
          {Object.entries(value).map(([k, v]) => (
            <TreeNode key={k} keyName={k} value={v} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function JsonTreeView() {
  const [jsonInput, setJsonInput] = useState(`{
  "name": "DevToolBox",
  "version": "1.0.0",
  "isProduction": true,
  "metrics": {
    "dailyActiveUsers": 12500,
    "uptime": 99.98
  },
  "features": [
    "JSON格式化与树形图",
    "cURL转代码",
    "CIDR网络计算",
    "WebSocket调试"
  ],
  "author": null
}`)
  const [parsedObj, setParsedObj] = useState<any>(null)
  const [error, setError] = useState('')

  const handleParse = (text: string) => {
    setJsonInput(text)
    if (!text.trim()) {
      setParsedObj(null)
      setError('')
      return
    }

    try {
      const obj = JSON.parse(text)
      setParsedObj(obj)
      setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'JSON 格式错误')
      setParsedObj(null)
    }
  }

  return (
    <ToolPage title="JSON 树形视图" description="以可视化的多层折叠树状结构浏览、审阅与分析复杂嵌套 JSON 数据">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="card p-5 flex flex-col gap-3">
          <label className="label">JSON 数据源输入</label>
          <textarea
            value={jsonInput}
            onChange={e => handleParse(e.target.value)}
            rows={18}
            className="editor-area text-xs font-mono resize-none"
            placeholder="粘贴 JSON 数据进行树状解析..."
          />
          {error && <div className="error-text text-xs">{error}</div>}
        </div>

        {/* Tree View Display */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">交互式节点树 (点击箭头折叠/展开)</span>
            {parsedObj && <CopyButton text={JSON.stringify(parsedObj, null, 2)} label="复制格式化" />}
          </div>

          <div className="w-full h-[400px] bg-gray-50 dark:bg-gray-900/60 rounded-xl border p-4 overflow-y-auto">
            {parsedObj ? (
              <TreeNode value={parsedObj} />
            ) : (
              <div className="text-center text-gray-400 py-32 text-xs">
                {error ? 'JSON 语法错误，无法构建节点树' : '输入有效 JSON 后在此实时生成树状图'}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

