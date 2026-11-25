import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Send, Clock, Plus, Trash2 } from 'lucide-react'

export default function HttpClient() {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET')
  const [url, setUrl] = useState('https://httpbin.org/get')
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Accept', value: 'application/json' },
  ])
  const [body, setBody] = useState('{\n  "message": "Hello API"\n}')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<number | null>(null)
  const [time, setTime] = useState<number | null>(null)
  const [responseHeaders, setResponseHeaders] = useState<string>('')
  const [responseBody, setResponseBody] = useState<string>('')
  const [error, setError] = useState('')

  const handleAddHeader = () => {
    setHeaders(prev => [...prev, { key: '', value: '' }])
  }

  const handleRemoveHeader = (idx: number) => {
    setHeaders(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSend = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setStatus(null)
    setTime(null)
    setResponseBody('')
    setResponseHeaders('')

    const startTime = performance.now()
    try {
      const headerObj: Record<string, string> = {}
      headers.forEach(h => {
        if (h.key.trim()) headerObj[h.key.trim()] = h.value.trim()
      })

      const options: RequestInit = {
        method,
        headers: headerObj,
      }

      if (method !== 'GET' && body.trim()) {
        options.body = body
      }

      const res = await fetch(url.trim(), options)
      const duration = Math.round(performance.now() - startTime)

      setStatus(res.status)
      setTime(duration)

      // Headers
      const hLines: string[] = []
      res.headers.forEach((v, k) => {
        hLines.push(`${k}: ${v}`)
      })
      setResponseHeaders(hLines.join('\n'))

      // Body
      const text = await res.text()
      try {
        const json = JSON.parse(text)
        setResponseBody(JSON.stringify(json, null, 2))
      } catch {
        setResponseBody(text)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '网络请求失败，可能是跨域(CORS)拦截或网络不可达')
      setTime(Math.round(performance.now() - startTime))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolPage title="HTTP 接口在线调试" description="轻量级纯前端接口测试工具，在线模拟发送 GET/POST/PUT/DELETE 请求">
      <div className="flex flex-col gap-6">
        {/* Request URL bar */}
        <div className="card p-5 flex flex-col md:flex-row gap-3 items-center">
          <select
            value={method}
            onChange={e => setMethod(e.target.value as any)}
            className="select-field font-bold font-mono text-sm w-full md:w-32"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://api.example.com/v1/..."
            className="input-field flex-1 font-mono text-sm"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-1.5 px-6"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? '请求中...' : '发送请求'}</span>
          </button>
        </div>

        {/* Request Headers & Body Tabs */}
        <div className="card p-5 flex flex-col gap-4">
          <span className="text-sm font-semibold">请求 Headers 配置</span>
          <div className="flex flex-col gap-2">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={h.key}
                  onChange={e => {
                    const newH = [...headers]
                    newH[i].key = e.target.value
                    setHeaders(newH)
                  }}
                  placeholder="Header 键名 (如 Authorization)"
                  className="input-field font-mono text-xs flex-1"
                />
                <input
                  type="text"
                  value={h.value}
                  onChange={e => {
                    const newH = [...headers]
                    newH[i].value = e.target.value
                    setHeaders(newH)
                  }}
                  placeholder="Header 值"
                  className="input-field font-mono text-xs flex-1"
                />
                <button onClick={() => handleRemoveHeader(i)} className="btn-icon p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={handleAddHeader} className="btn-secondary btn-sm self-start flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>添加 Header</span>
            </button>
          </div>

          {method !== 'GET' && (
            <div className="pt-2 border-t">
              <label className="label text-xs">请求体 (Request Body - JSON / Form)</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                className="editor-area text-xs font-mono resize-none"
              />
            </div>
          )}
        </div>

        {/* Response Area */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">响应结果 (Response)</span>
              {status !== null && (
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                    status >= 200 && status < 300
                      ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  Status: {status}
                </span>
              )}
              {time !== null && (
                <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{time} ms</span>
                </span>
              )}
            </div>
            {responseBody && <CopyButton text={responseBody} label="复制响应 Body" />}
          </div>

          {error && (
            <div className="error-text text-xs p-3 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <textarea
            value={responseBody}
            readOnly
            rows={12}
            placeholder="发送请求后在此实时展示响应数据 (纯前端发送，若目标域名限制跨域请测试支持 CORS 的 API)..."
            className="editor-area text-xs font-mono resize-none"
          />
        </div>
      </div>
    </ToolPage>
  )
}

