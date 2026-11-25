import { useState, useEffect, useCallback } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Search, Loader2, MapPin } from 'lucide-react'

interface IpInfo {
  ip: string
  version?: string
  city?: string
  region?: string
  country_name?: string
  country_code?: string
  org?: string
  asn?: string
  timezone?: string
  latitude?: number
  longitude?: number
  postal?: string
  error?: boolean
  reason?: string
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm font-medium mt-0.5 break-all">{value === undefined || value === '' ? '—' : String(value)}</div>
    </div>
  )
}

export default function IpLookup() {
  const [input, setInput] = useState('')
  const [info, setInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSelf, setIsSelf] = useState(true)

  const lookup = useCallback(async (target?: string) => {
    setLoading(true)
    setError('')
    try {
      const url = target
        ? `https://ipapi.co/${encodeURIComponent(target)}/json/`
        : 'https://ipapi.co/json/'
      const res = await fetch(url)
      if (!res.ok) throw new Error(`查询失败（HTTP ${res.status}）`)
      const data = (await res.json()) as IpInfo
      if (data.error) throw new Error(data.reason || '该 IP 无归属信息')
      setInfo(data)
      setIsSelf(!target)
    } catch (e) {
      setError(e instanceof Error ? e.message : '查询失败，请检查网络后重试')
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // 打开页面时自动查询本机公网 IP
  useEffect(() => {
    lookup()
  }, [lookup])

  const query = () => {
    const ip = input.trim()
    if (!ip) {
      lookup()
      return
    }
    lookup(ip)
  }

  return (
    <ToolPage title="IP 查询" description="查询公网 IP 的归属地、运营商、ASN 与时区；打开页面自动显示你的本机出口 IP">
      <div className="flex flex-col gap-6">
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && query()}
              placeholder="输入要查询的 IP（留空查询本机 IP）"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
            数据来自公开的 ipapi.co 接口，仅做查询展示，不收集、不存储任何 IP 信息。
          </p>
        </div>

        {error && (
          <div className="card p-6 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {loading && !info && (
          <div className="card p-6 text-sm text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> 正在查询…
          </div>
        )}

        {info && (
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-bold font-mono">{info.ip}</span>
              {isSelf && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  你的本机出口 IP
                </span>
              )}
              {info.version && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  IPv{info.version === 'IPv4' ? '4' : info.version}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="国家 / 地区" value={info.country_name ? `${info.country_name}${info.country_code ? ` (${info.country_code})` : ''}` : undefined} />
              <Field label="城市" value={info.city} />
              <Field label="省份 / 州" value={info.region} />
              <Field label="邮编" value={info.postal} />
              <Field label="运营商 / 组织" value={info.org} />
              <Field label="ASN" value={info.asn} />
              <Field label="时区" value={info.timezone} />
              <Field label="纬度" value={info.latitude} />
              <Field label="经度" value={info.longitude} />
            </div>
            {info.latitude !== undefined && info.longitude !== undefined && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                坐标约为 {info.latitude}, {info.longitude}（归属地为运营商登记位置，非精确定位）。
              </p>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
