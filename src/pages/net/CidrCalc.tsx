import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Network, HelpCircle } from 'lucide-react'

// IP helper utils
function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.')
}

export default function CidrCalc() {
  const [ipInput, setIpInput] = useState('192.168.1.50')
  const [maskBits, setMaskBits] = useState(24)
  const [result, setResult] = useState<{
    network: string
    broadcast: string
    firstIp: string
    lastIp: string
    totalHosts: number
    usableHosts: number
    mask: string
    wildcard: string
    ipBinary: string
    maskBinary: string
    ipType: string
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      let rawIp = ipInput.trim()
      let rawBits = maskBits

      if (rawIp.includes('/')) {
        const parts = rawIp.split('/')
        rawIp = parts[0]
        rawBits = parseInt(parts[1], 10)
        setMaskBits(rawBits)
      }

      const octets = rawIp.split('.')
      if (octets.length !== 4 || octets.some(o => isNaN(Number(o)) || Number(o) < 0 || Number(o) > 255)) {
        setError('请输入有效的 IPv4 地址 (如 192.168.1.1)')
        setResult(null)
        return
      }

      if (rawBits < 0 || rawBits > 32) {
        setError('掩码位数必须在 0 到 32 之间')
        setResult(null)
        return
      }

      const ipInt = ipToInt(rawIp)
      const maskInt = rawBits === 0 ? 0 : (0xffffffff << (32 - rawBits)) >>> 0
      const wildcardInt = ~maskInt >>> 0
      const networkInt = (ipInt & maskInt) >>> 0
      const broadcastInt = (networkInt | wildcardInt) >>> 0

      const totalHosts = Math.pow(2, 32 - rawBits)
      const usableHosts = rawBits >= 31 ? 0 : totalHosts - 2
      const firstIpInt = rawBits >= 31 ? networkInt : networkInt + 1
      const lastIpInt = rawBits >= 31 ? broadcastInt : broadcastInt - 1

      // Check IP type (Private / Public)
      let ipType = '公网 IP (Public IP)'
      const o0 = Number(octets[0])
      const o1 = Number(octets[1])
      if (o0 === 10) ipType = '私有私网 IP (Class A: 10.0.0.0/8)'
      else if (o0 === 172 && o1 >= 16 && o1 <= 31) ipType = '私有私网 IP (Class B: 172.16.0.0/12)'
      else if (o0 === 192 && o1 === 168) ipType = '私有私网 IP (Class C: 192.168.0.0/16)'
      else if (o0 === 127) ipType = '本地环回地址 (Loopback: 127.0.0.0/8)'

      setResult({
        network: intToIp(networkInt),
        broadcast: intToIp(broadcastInt),
        firstIp: intToIp(firstIpInt),
        lastIp: intToIp(lastIpInt),
        totalHosts,
        usableHosts,
        mask: intToIp(maskInt),
        wildcard: intToIp(wildcardInt),
        ipBinary: ipInt.toString(2).padStart(32, '0').match(/.{8}/g)?.join('.') || '',
        maskBinary: maskInt.toString(2).padStart(32, '0').match(/.{8}/g)?.join('.') || '',
        ipType,
      })
      setError('')
    } catch {
      setError('计算出错，请核对输入格式')
      setResult(null)
    }
  }, [ipInput, maskBits])

  return (
    <ToolPage title="CIDR 子网掩码计算" description="TCP/IP IPv4 地址与 CIDR 掩码位换算，规划子网网段与主机范围">
      <div className="flex flex-col gap-6">
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">IPv4 地址 (支持带 / 掩码位)</label>
              <input
                type="text"
                value={ipInput}
                onChange={e => setIpInput(e.target.value)}
                placeholder="例如: 192.168.1.100 或 10.0.0.1/16"
                className="input-field font-mono text-base font-semibold"
              />
            </div>
            <div>
              <label className="label">子网掩码位 (CIDR)</label>
              <select
                value={maskBits}
                onChange={e => setMaskBits(Number(e.target.value))}
                className="select-field w-full font-mono font-medium"
              >
                {Array.from({ length: 33 }, (_, i) => 32 - i).map(bits => (
                  <option key={bits} value={bits}>
                    /{bits} ({intToIp(bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0)})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-text mt-3">{error}</div>}
        </div>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card p-4 bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900">
              <span className="text-xs text-gray-500">网络地址 (Network ID)</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-mono font-bold text-lg text-brand-700 dark:text-brand-300">{result.network}</span>
                <CopyButton text={result.network} />
              </div>
            </div>

            <div className="card p-4 bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
              <span className="text-xs text-gray-500">广播地址 (Broadcast)</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-mono font-bold text-lg text-purple-700 dark:text-purple-300">{result.broadcast}</span>
                <CopyButton text={result.broadcast} />
              </div>
            </div>

            <div className="card p-4 bg-green-50/40 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <span className="text-xs text-gray-500">可用主机数量 (Usable Hosts)</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-mono font-bold text-lg text-green-700 dark:text-green-300">{result.usableHosts.toLocaleString()} 台</span>
                <CopyButton text={result.usableHosts.toString()} />
              </div>
            </div>

            <div className="card p-4">
              <span className="text-xs text-gray-500">可用 IP 起始 ~ 结束范围</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-mono font-semibold text-sm">{result.firstIp} ~ {result.lastIp}</span>
                <CopyButton text={`${result.firstIp} ~ ${result.lastIp}`} />
              </div>
            </div>

            <div className="card p-4">
              <span className="text-xs text-gray-500">子网掩码 (Subnet Mask)</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-mono font-semibold text-sm">{result.mask}</span>
                <CopyButton text={result.mask} />
              </div>
            </div>

            <div className="card p-4">
              <span className="text-xs text-gray-500">反向掩码 (Wildcard Mask)</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-mono font-semibold text-sm">{result.wildcard}</span>
                <CopyButton text={result.wildcard} />
              </div>
            </div>

            <div className="card p-4 md:col-span-2 lg:col-span-3">
              <span className="text-xs text-gray-500">IP 属性与二进制</span>
              <div className="mt-2 text-xs font-mono space-y-1">
                <div><span className="text-gray-400">地址分类:</span> <span className="font-sans font-semibold text-brand-600 dark:text-brand-400">{result.ipType}</span></div>
                <div><span className="text-gray-400">IP 二进制:</span> <span className="text-gray-700 dark:text-gray-300">{result.ipBinary}</span></div>
                <div><span className="text-gray-400">掩码二进制:</span> <span className="text-gray-700 dark:text-gray-300">{result.maskBinary}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

