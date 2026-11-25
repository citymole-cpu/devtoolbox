import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'

export default function QueryString() {
  const [direction, setDirection] = useState<'toQuery' | 'toJson'>('toJson')
  const [input, setInput] = useState('https://api.example.com/search?keyword=react&page=1&sort=desc&filters=frontend&tags=javascript&tags=typescript')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleConvert = (text: string, dir: 'toQuery' | 'toJson') => {
    setInput(text)
    if (!text.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      if (dir === 'toJson') {
        // Query string or full URL to JSON
        let queryPart = text.trim()
        if (queryPart.includes('?')) {
          queryPart = queryPart.split('?')[1]
        }
        if (queryPart.includes('#')) {
          queryPart = queryPart.split('#')[0]
        }

        const params = new URLSearchParams(queryPart)
        const obj: Record<string, any> = {}

        params.forEach((val, key) => {
          if (obj[key] !== undefined) {
            if (Array.isArray(obj[key])) {
              obj[key].push(val)
            } else {
              obj[key] = [obj[key], val]
            }
          } else {
            // try parse boolean or number
            if (val === 'true') obj[key] = true
            else if (val === 'false') obj[key] = false
            else if (!isNaN(Number(val)) && val.trim() !== '') obj[key] = Number(val)
            else obj[key] = val
          }
        })

        setOutput(JSON.stringify(obj, null, 2))
        setError('')
      } else {
        // JSON to Query string
        const parsed = JSON.parse(text)
        const params = new URLSearchParams()

        Object.entries(parsed).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach(item => params.append(key, String(item)))
          } else if (val !== null && val !== undefined) {
            params.append(key, String(val))
          }
        })

        setOutput(params.toString())
        setError('')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '解析失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    const nextDir = direction === 'toJson' ? 'toQuery' : 'toJson'
    setDirection(nextDir)
    const oldOut = output
    handleConvert(oldOut, nextDir)
  }

  return (
    <ToolPage title="URL 参数 ↔ JSON" description="URL QueryString 与格式化 JSON 对象双向解析转换">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDirection('toJson'); handleConvert(input, 'toJson') }}
            className={`btn btn-sm ${direction === 'toJson' ? 'btn-primary' : 'btn-secondary'}`}
          >
            QueryString ➔ JSON
          </button>
          <button
            onClick={() => { setDirection('toQuery'); handleConvert(input, 'toQuery') }}
            className={`btn btn-sm ${direction === 'toQuery' ? 'btn-primary' : 'btn-secondary'}`}
          >
            JSON ➔ QueryString
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => handleConvert(val, direction)}
          inputLabel={direction === 'toJson' ? 'URL 或 QueryString' : 'JSON 格式数据'}
          outputLabel={direction === 'toJson' ? '解析后的 JSON 对象' : 'URL 参数 (QueryString)'}
          inputPlaceholder={direction === 'toJson' ? '输入包含 ?a=1&b=2 的完整 URL 或参数...' : '输入 JSON 对象...'}
          error={error}
          swappable={true}
          onSwap={handleSwap}
        />
      </div>
    </ToolPage>
  )
}

