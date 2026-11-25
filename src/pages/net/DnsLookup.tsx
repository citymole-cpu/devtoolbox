import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Search, Loader2 } from 'lucide-react'

const TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA'] as const

interface DnsAnswer {
  name: string
  type: number
  TTL: number
  data: string
}

interface DnsResult {
  status: number
  answer?: DnsAnswer[]
  authority?: DnsAnswer[]
}

const TYPE_NAME: Record<number, string> = {
  1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 15: 'MX', 16: 'TXT', 28: 'AAAA', 257: 'CAA',
}

const STATUS_TEXT: Record<number, string> = {
  0: '查询成功（NOERROR）',
  2: '服务器错误（SERVFAIL）',
  3: '域名不存在（NXDOMAIN）',
}

export default function DnsLookup() {
  const [domain, setDomain] = useState('example.com')
  const [type, setType] = useState<string>('A')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DnsResult | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [queried, setQueried] = useState('')

  const query = async () => {
    const name = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (!name) {
      setError('请输入要查询的域名')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    const start = performance.now()
    try {
      const res = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`
      )
      if (!res.ok) throw new Error(`DoH 请求失败（HTTP ${res.status}）`)
      const data = (await res.json()) as DnsResult
      setResult(data)
      setQueried(name)
      setElapsed(Math.round(performance.now() - start))
    } catch (e) {
      setError(e instanceof Error ? e.message : '查询失败，请检查网络后重试')
    } finally {
      setLoading(false)
    }
  }

  const answers = result?.answer ?? []

  return (
    <ToolPage title="DNS 查询" description="浏览器端通过 DoH 查询域名的 A / AAAA / CNAME / MX / TXT 等记录，结果不经过本站服务器">
      <div className="flex flex-col gap-6">
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && query()}
              placeholder="输入域名，如 example.com"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={query}
              disabled={loading}
              className="px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? '查询中…' : '查询'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            通过 Google Public DNS 的 DoH 接口（dns.google）实时查询；域名与查询结果仅在你的浏览器内处理，不上传到任何服务器。
          </p>
        </div>

        {error && (
          <div className="card p-6 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {result && (
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-sm">
              <span className="font-semibold">{queried}</span>
              <span className="text-gray-500 dark:text-gray-400">{type} 记录</span>
              <span className={result.status === 0 ? 'text-green-600' : 'text-amber-600'}>
                {STATUS_TEXT[result.status] ?? `状态码 ${result.status}`}
              </span>
              <span className="text-gray-400">耗时 {elapsed}ms</span>
            </div>
            {answers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                该域名没有 {type} 记录（可能是不存在、未配置该类型，或需更换记录类型再试）。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 pr-4 font-medium">名称</th>
                      <th className="py-2 pr-4 font-medium">类型</th>
                      <th className="py-2 pr-4 font-medium">TTL</th>
                      <th className="py-2 font-medium">记录值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {answers.map((a, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <td className="py-2 pr-4 font-mono break-all">{a.name}</td>
                        <td className="py-2 pr-4">{TYPE_NAME[a.type] ?? a.type}</td>
                        <td className="py-2 pr-4 font-mono">{a.TTL}s</td>
                        <td className="py-2 font-mono break-all">{a.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!result && !error && (
          <div className="card p-6 text-sm text-gray-500 dark:text-gray-400">
            输入域名并选择记录类型后点击查询。常用场景：确认域名解析是否生效、查看 MX 邮箱记录、核对 TXT 验证记录、排查 CDN 的 CNAME 指向。
          </div>
        )}
      </div>
    </ToolPage>
  )
}
