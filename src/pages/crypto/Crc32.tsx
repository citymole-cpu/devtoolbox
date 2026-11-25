import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

// Pure JS CRC32 implementation
function makeCrcTable() {
  let c: number
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
}

const crcTable = makeCrcTable()

function crc32(str: string): number {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  let crc = 0 ^ -1
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff]
  }
  return (crc ^ -1) >>> 0
}

// Adler32 implementation
function adler32(str: string): number {
  const bytes = new TextEncoder().encode(str)
  let a = 1
  let b = 0
  const MOD = 65521
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % MOD
    b = (b + a) % MOD
  }
  return ((b << 16) | a) >>> 0
}

export default function Crc32() {
  const [input, setInput] = useState('DevToolBox - 开发者工具箱')
  const [crcHex, setCrcHex] = useState('')
  const [crcDec, setCrcDec] = useState('')
  const [adlerHex, setAdlerHex] = useState('')
  const [adlerDec, setAdlerDec] = useState('')

  useEffect(() => {
    if (!input) {
      setCrcHex('')
      setCrcDec('')
      setAdlerHex('')
      setAdlerDec('')
      return
    }

    const c = crc32(input)
    setCrcHex(c.toString(16).toUpperCase().padStart(8, '0'))
    setCrcDec(c.toString(10))

    const a = adler32(input)
    setAdlerHex(a.toString(16).toUpperCase().padStart(8, '0'))
    setAdlerDec(a.toString(10))
  }, [input])

  return (
    <ToolPage title="CRC32 / 校验码计算" description="计算文本与数据的 CRC-32 与 Adler-32 循环冗余校验值 (Hex / 十进制)">
      <div className="flex flex-col gap-6">
        <div className="card p-5">
          <label className="label">输入需要计算校验码的文本</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={5}
            className="editor-area text-sm resize-none"
            placeholder="输入文本内容..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900">
            <span className="text-xs text-gray-500 font-semibold">CRC-32 (十六进制 Hex)</span>
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono font-bold text-xl text-brand-600 dark:text-brand-400">
                {crcHex || '-'}
              </span>
              <CopyButton text={crcHex} />
            </div>
          </div>

          <div className="card p-5">
            <span className="text-xs text-gray-500 font-semibold">CRC-32 (十进制 Dec)</span>
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono font-bold text-xl">{crcDec || '-'}</span>
              <CopyButton text={crcDec} />
            </div>
          </div>

          <div className="card p-5 bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
            <span className="text-xs text-gray-500 font-semibold">Adler-32 (十六进制 Hex)</span>
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono font-bold text-xl text-purple-600 dark:text-purple-400">
                {adlerHex || '-'}
              </span>
              <CopyButton text={adlerHex} />
            </div>
          </div>

          <div className="card p-5">
            <span className="text-xs text-gray-500 font-semibold">Adler-32 (十进制 Dec)</span>
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono font-bold text-xl">{adlerDec || '-'}</span>
              <CopyButton text={adlerDec} />
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

