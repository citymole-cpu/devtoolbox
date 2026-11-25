import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Calculator } from 'lucide-react'

export default function Radix() {
  const [bin, setBin] = useState('101010')
  const [oct, setOct] = useState('52')
  const [dec, setDec] = useState('42')
  const [hex, setHex] = useState('2A')

  // Custom Radix
  const [customRadix, setCustomRadix] = useState(36)
  const [customVal, setCustomVal] = useState('16')

  const updateAllFromDec = (num: bigint) => {
    try {
      setBin(num.toString(2))
      setOct(num.toString(8))
      setDec(num.toString(10))
      setHex(num.toString(16).toUpperCase())
      setCustomVal(num.toString(customRadix).toUpperCase())
    } catch {
      // BigInt out of range or parse error
    }
  }

  const handleBinChange = (v: string) => {
    setBin(v)
    try {
      const clean = v.trim().replace(/^0b/i, '')
      if (!clean) return
      const n = BigInt('0b' + clean)
      updateAllFromDec(n)
    } catch { /* ignore */ }
  }

  const handleOctChange = (v: string) => {
    setOct(v)
    try {
      const clean = v.trim().replace(/^0o/i, '')
      if (!clean) return
      const n = BigInt('0o' + clean)
      updateAllFromDec(n)
    } catch { /* ignore */ }
  }

  const handleDecChange = (v: string) => {
    setDec(v)
    try {
      const clean = v.trim()
      if (!clean) return
      const n = BigInt(clean)
      updateAllFromDec(n)
    } catch { /* ignore */ }
  }

  const handleHexChange = (v: string) => {
    setHex(v)
    try {
      const clean = v.trim().replace(/^0x/i, '')
      if (!clean) return
      const n = BigInt('0x' + clean)
      updateAllFromDec(n)
    } catch { /* ignore */ }
  }

  const handleCustomChange = (v: string) => {
    setCustomVal(v)
    try {
      const clean = v.trim()
      if (!clean) return
      const n = BigInt(parseInt(clean, customRadix))
      updateAllFromDec(n)
    } catch { /* ignore */ }
  }

  return (
    <ToolPage title="进制转换器" description="2进制、8进制、10进制、16进制及 2-36 任意进制双向实时换算">
      <div className="card p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 10 进制 */}
          <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-900">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-brand-700 dark:text-brand-300 text-sm">十进制 (Decimal - 10)</label>
              <CopyButton text={dec} />
            </div>
            <input
              type="text"
              value={dec}
              onChange={e => handleDecChange(e.target.value)}
              placeholder="如: 42"
              className="input-field font-mono font-bold text-lg"
            />
          </div>

          {/* 16 进制 */}
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-purple-700 dark:text-purple-300 text-sm">十六进制 (Hex - 16)</label>
              <CopyButton text={hex} />
            </div>
            <input
              type="text"
              value={hex}
              onChange={e => handleHexChange(e.target.value)}
              placeholder="如: 2A"
              className="input-field font-mono font-bold text-lg uppercase"
            />
          </div>

          {/* 2 进制 */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">二进制 (Binary - 2)</label>
              <CopyButton text={bin} />
            </div>
            <input
              type="text"
              value={bin}
              onChange={e => handleBinChange(e.target.value)}
              placeholder="如: 101010"
              className="input-field font-mono font-bold text-lg"
            />
          </div>

          {/* 8 进制 */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-amber-700 dark:text-amber-300 text-sm">八进制 (Octal - 8)</label>
              <CopyButton text={oct} />
            </div>
            <input
              type="text"
              value={oct}
              onChange={e => handleOctChange(e.target.value)}
              placeholder="如: 52"
              className="input-field font-mono font-bold text-lg"
            />
          </div>
        </div>

        {/* 任意自定义进制 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-sm">任意进制 (2 - 36):</label>
              <select
                value={customRadix}
                onChange={e => {
                  const r = Number(e.target.value)
                  setCustomRadix(r)
                  try {
                    const n = BigInt(dec)
                    setCustomVal(n.toString(r).toUpperCase())
                  } catch {}
                }}
                className="select-field text-sm"
              >
                {Array.from({ length: 35 }, (_, i) => i + 2).map(r => (
                  <option key={r} value={r}>{r} 进制</option>
                ))}
              </select>
            </div>
            <CopyButton text={customVal} label="复制自定义进制" />
          </div>
          <input
            type="text"
            value={customVal}
            onChange={e => handleCustomChange(e.target.value)}
            className="input-field font-mono font-semibold"
          />
        </div>
      </div>
    </ToolPage>
  )
}

