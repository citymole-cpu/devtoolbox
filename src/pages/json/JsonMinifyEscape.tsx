import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'

export default function JsonMinifyEscape() {
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')
  const [input, setInput] = useState('{\n  "service": "auth-center",\n  "port": 8080,\n  "enabled": true,\n  "tags": ["prod", "oauth2"]\n}')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleConvert = (text: string, currentMode: 'escape' | 'unescape') => {
    setInput(text)
    if (!text.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      if (currentMode === 'escape') {
        // Parse to ensure valid JSON, then minify to 1 line, then escape quotes
        const parsed = JSON.parse(text)
        const minified = JSON.stringify(parsed)
        // Escape quotes and backslashes for string literals
        const escaped = minified.replace(/"/g, '\\"')
        setOutput(escaped)
        setError('')
      } else {
        // Unescape backslashed quotes, then format
        let clean = text.trim()
        // If wrapped in outer quotes, strip
        if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
          clean = clean.slice(1, -1)
        }
        clean = clean.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
        const parsed = JSON.parse(clean)
        setOutput(JSON.stringify(parsed, null, 2))
        setError('')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '解析失败，请检查输入格式')
      setOutput('')
    }
  }

  const handleSwap = () => {
    const nextMode = mode === 'escape' ? 'unescape' : 'escape'
    setMode(nextMode)
    const oldOut = output
    handleConvert(oldOut, nextMode)
  }

  return (
    <ToolPage title="JSON 压缩转义" description="JSON 一键压缩为单行并转义双引号 (适合注入配置/命令行)，或将转义字符串还原美化">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('escape'); handleConvert(input, 'escape') }}
            className={`btn btn-sm ${mode === 'escape' ? 'btn-primary' : 'btn-secondary'}`}
          >
            JSON ➔ 单行转义字符串
          </button>
          <button
            onClick={() => { setMode('unescape'); handleConvert(input, 'unescape') }}
            className={`btn btn-sm ${mode === 'unescape' ? 'btn-primary' : 'btn-secondary'}`}
          >
            转义字符串 ➔ 还原美化 JSON
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => handleConvert(val, mode)}
          inputLabel={mode === 'escape' ? '标准 JSON (多行或单行)' : '转义后的字符串'}
          outputLabel={mode === 'escape' ? '单行转义结果 (适合命令行/ENV)' : '还原格式化 JSON'}
          error={error}
          swappable={true}
          onSwap={handleSwap}
        />
      </div>
    </ToolPage>
  )
}

