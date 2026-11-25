import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

export default function UnitConverter() {
  const [tab, setTab] = useState<'storage' | 'css'>('storage')

  // Storage states (in bytes)
  const [bytesVal, setBytesVal] = useState<number>(1073741824) // 1 GB
  const [base, setBase] = useState<1024 | 1000>(1024)

  // CSS states
  const [rootPx, setRootPx] = useState<number>(16)
  const [currentPx, setCurrentPx] = useState<number>(24)

  const kb = bytesVal / base
  const mb = kb / base
  const gb = mb / base
  const tb = gb / base

  const rem = currentPx / rootPx
  const pt = currentPx * 0.75
  const vwMobile = (currentPx / 375) * 100 // 375px mobile base
  const vwDesktop = (currentPx / 1920) * 100 // 1920px desktop base

  return (
    <ToolPage title="开发单位换算器" description="计算机存储容量 (Byte/KB/MB/GB/TB) 与前端 CSS 样式尺寸 (px/rem/pt/vw) 即时换算">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('storage')}
            className={`btn btn-sm ${tab === 'storage' ? 'btn-primary' : 'btn-secondary'}`}
          >
            计算机数据存储容量换算
          </button>
          <button
            onClick={() => setTab('css')}
            className={`btn btn-sm ${tab === 'css' ? 'btn-primary' : 'btn-secondary'}`}
          >
            前端 CSS 尺寸换算 (px ↔ rem)
          </button>
        </div>

        {tab === 'storage' ? (
          <div className="card p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">换算进制基准:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBase(1024)}
                  className={`btn btn-sm ${base === 1024 ? 'btn-primary' : 'btn-secondary'}`}
                >
                  1024 进制 (系统内存/二进制标准)
                </button>
                <button
                  onClick={() => setBase(1000)}
                  className={`btn btn-sm ${base === 1000 ? 'btn-primary' : 'btn-secondary'}`}
                >
                  1000 进制 (硬盘厂商/国际单位)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                <span className="text-xs text-gray-500 font-semibold">字节 (Bytes)</span>
                <input
                  type="number"
                  value={bytesVal}
                  onChange={e => setBytesVal(Number(e.target.value))}
                  className="input-field font-mono font-bold mt-1 text-sm"
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                <span className="text-xs text-gray-500 font-semibold">KB (千字节)</span>
                <input
                  type="number"
                  value={kb.toFixed(2)}
                  onChange={e => setBytesVal(Number(e.target.value) * base)}
                  className="input-field font-mono font-bold mt-1 text-sm"
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                <span className="text-xs text-gray-500 font-semibold">MB (兆字节)</span>
                <input
                  type="number"
                  value={mb.toFixed(2)}
                  onChange={e => setBytesVal(Number(e.target.value) * base * base)}
                  className="input-field font-mono font-bold mt-1 text-sm"
                />
              </div>

              <div className="p-3 bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900 rounded-xl border">
                <span className="text-xs text-brand-600 font-semibold">GB (吉字节)</span>
                <input
                  type="number"
                  value={gb.toFixed(4)}
                  onChange={e => setBytesVal(Number(e.target.value) * base * base * base)}
                  className="input-field font-mono font-bold mt-1 text-sm text-brand-600"
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                <span className="text-xs text-gray-500 font-semibold">TB (太字节)</span>
                <input
                  type="number"
                  value={tb.toFixed(6)}
                  onChange={e => setBytesVal(Number(e.target.value) * base * base * base * base)}
                  className="input-field font-mono font-bold mt-1 text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs">网页根节点字号 (Root html font-size)</label>
                <input
                  type="number"
                  value={rootPx}
                  onChange={e => setRootPx(Number(e.target.value))}
                  className="input-field font-mono text-sm"
                />
                <span className="text-[11px] text-gray-400">现代浏览器标准默认为 16px</span>
              </div>

              <div>
                <label className="label text-xs">当前像素尺寸 (px)</label>
                <input
                  type="number"
                  value={currentPx}
                  onChange={e => setCurrentPx(Number(e.target.value))}
                  className="input-field font-mono text-sm font-bold text-brand-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t">
              <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900 rounded-xl border">
                <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">rem 相对单位</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-mono font-bold text-lg">{rem.toFixed(4)} rem</span>
                  <CopyButton text={`${rem.toFixed(4)}rem`} />
                </div>
              </div>

              <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 rounded-xl border">
                <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">pt 印刷字号磅</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-mono font-bold text-lg">{pt.toFixed(2)} pt</span>
                  <CopyButton text={`${pt.toFixed(2)}pt`} />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                <span className="text-xs text-gray-500 font-semibold">vw (移动端 375px 设计稿)</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-mono font-bold text-base">{vwMobile.toFixed(3)} vw</span>
                  <CopyButton text={`${vwMobile.toFixed(3)}vw`} />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                <span className="text-xs text-gray-500 font-semibold">vw (桌面端 1920px 设计稿)</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-mono font-bold text-base">{vwDesktop.toFixed(3)} vw</span>
                  <CopyButton text={`${vwDesktop.toFixed(3)}vw`} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

