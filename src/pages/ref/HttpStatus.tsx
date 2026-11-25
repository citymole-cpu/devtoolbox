import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Search } from 'lucide-react'

const HTTP_CODES = [
  // 1xx
  { code: 100, name: 'Continue', desc: '继续。客户端应继续其请求。' },
  { code: 101, name: 'Switching Protocols', desc: '切换协议。服务器根据客户端的请求切换协议（如 WebSocket 升级）。' },
  // 2xx
  { code: 200, name: 'OK', desc: '请求成功。常规响应的标准状态码。' },
  { code: 201, name: 'Created', desc: '已创建。成功请求并在服务器上创建了新资源（常见于 POST）。' },
  { code: 202, name: 'Accepted', desc: '已接受。已接受请求进行处理，但处理尚未完成（异步任务）。' },
  { code: 204, name: 'No Content', desc: '无内容。服务器成功处理了请求，但不返回任何响应内容。' },
  { code: 206, name: 'Partial Content', desc: '部分内容。服务器成功处理了部分 GET 请求（断点续传/分片下载）。' },
  // 3xx
  { code: 301, name: 'Moved Permanently', desc: '永久移动。请求的资源已被永久移动到新 URI，搜索引擎会转移权重。' },
  { code: 302, name: 'Found (Temporary Redirect)', desc: '临时重定向。请求的资源临时从不同的 URI 响应。' },
  { code: 304, name: 'Not Modified', desc: '未修改。客户端可继续使用缓存版本（协商缓存）。' },
  { code: 307, name: 'Temporary Redirect', desc: '临时重定向。类似 302，但要求请求方法（如 POST）不能改变。' },
  { code: 308, name: 'Permanent Redirect', desc: '永久重定向。类似 301，但要求请求方法不能改变。' },
  // 4xx
  { code: 400, name: 'Bad Request', desc: '错误请求。服务器无法理解请求格式，通常由于客户端请求语法错误。' },
  { code: 401, name: 'Unauthorized', desc: '未授权。当前请求需要用户验证（Token 缺失或已过期）。' },
  { code: 403, name: 'Forbidden', desc: '禁止访问。服务器理解请求，但拒绝执行（无权限）。' },
  { code: 404, name: 'Not Found', desc: '未找到。服务器无法根据客户端请求找到对应资源。' },
  { code: 405, name: 'Method Not Allowed', desc: '方法不允许。请求中指定的方法不适用于该目标资源。' },
  { code: 408, name: 'Request Timeout', desc: '请求超时。服务器等待客户端发送请求的时间过长。' },
  { code: 409, name: 'Conflict', desc: '冲突。由于当前资源状态冲突导致无法完成请求（如并发修改或唯一索引冲突）。' },
  { code: 413, name: 'Payload Too Large', desc: '请求实体过大。客户端发送的请求体超过了服务器的处理能力限制。' },
  { code: 415, name: 'Unsupported Media Type', desc: '不支持的媒体类型。请求体格式服务器不支持（如未设置 Content-Type）。' },
  { code: 422, name: 'Unprocessable Entity', desc: '无法处理的实体。请求格式正确，但包含语义错误（常见于 RESTful 表单校验失败）。' },
  { code: 429, name: 'Too Many Requests', desc: '请求过于频繁。用户在给定的时间内发送了过多请求（限流拦截）。' },
  // 5xx
  { code: 500, name: 'Internal Server Error', desc: '服务器内部错误。服务器遇到了意外情况导致无法完成请求。' },
  { code: 502, name: 'Bad Gateway', desc: '网关错误。作为网关或代理的服务器从上游服务器收到了无效响应。' },
  { code: 503, name: 'Service Unavailable', desc: '服务不可用。由于超载或系统维护，服务器暂时无法处理请求。' },
  { code: 504, name: 'Gateway Timeout', desc: '网关超时。作为网关或代理的服务器未及时从上游服务器收到响应。' },
]

export default function HttpStatus() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const filtered = HTTP_CODES.filter(item => {
    const matchCat =
      category === 'all' ||
      (category === '1xx' && item.code < 200) ||
      (category === '2xx' && item.code >= 200 && item.code < 300) ||
      (category === '3xx' && item.code >= 300 && item.code < 400) ||
      (category === '4xx' && item.code >= 400 && item.code < 500) ||
      (category === '5xx' && item.code >= 500)

    const q = query.toLowerCase()
    const matchQuery =
      !query ||
      item.code.toString().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)

    return matchCat && matchQuery
  })

  const getBadgeColor = (code: number) => {
    if (code < 200) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    if (code < 300) return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
    if (code < 400) return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
    if (code < 500) return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
  }

  return (
    <ToolPage title="HTTP 状态码速查" description="1xx、2xx、3xx、4xx、5xx 完整 HTTP 响应状态码及中文业务场景速查">
      <div className="flex flex-col gap-6">
        {/* Search & Tabs */}
        <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索状态码、英文名称或含义 (例如: 404, 200, timeout)..."
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', '1xx', '2xx', '3xx', '4xx', '5xx'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.code} className="card p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-full ${getBadgeColor(item.code)}`}>
                    {item.code}
                  </span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 font-mono truncate ml-2">
                    {item.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-2">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}

