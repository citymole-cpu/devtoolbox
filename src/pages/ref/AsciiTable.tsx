import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Search } from 'lucide-react'

// Generate full standard ASCII table 0 - 127
const ASCII_DATA = Array.from({ length: 128 }, (_, i) => {
  let charDisplay = String.fromCharCode(i)
  let desc = '普通可打印字符'

  if (i === 0) { charDisplay = 'NUL'; desc = '空字符 (Null)' }
  else if (i === 9) { charDisplay = '\\t (TAB)'; desc = '水平制表符' }
  else if (i === 10) { charDisplay = '\\n (LF)'; desc = '换行键' }
  else if (i === 13) { charDisplay = '\\r (CR)'; desc = '回车键' }
  else if (i === 27) { charDisplay = 'ESC'; desc = '退出键' }
  else if (i === 32) { charDisplay = 'SPACE'; desc = '空格键' }
  else if (i === 127) { charDisplay = 'DEL'; desc = '删除键' }
  else if (i < 32) { desc = '控制字符' }

  return {
    dec: i,
    hex: i.toString(16).toUpperCase().padStart(2, '0'),
    oct: i.toString(8).padStart(3, '0'),
    bin: i.toString(2).padStart(8, '0'),
    char: charDisplay,
    desc,
  }
})

export default function AsciiTable() {
  const [query, setQuery] = useState('')

  const filtered = ASCII_DATA.filter(item => {
    const q = query.toLowerCase()
    return (
      !query ||
      item.dec.toString() === q ||
      item.hex.toLowerCase() === q ||
      item.char.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    )
  })

  return (
    <ToolPage title="ASCII 码速查表" description="标准 0-127 ASCII 字符码对照表，支持十进制、十六进制、八进制与二进制转换">
      <div className="flex flex-col gap-5">
        <div className="card p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索字符、十进制 (如: 65) 或十六进制 (如: 41)..."
              className="input-field pl-9"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-mono">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b text-xs font-semibold text-gray-500 font-sans">
                <tr>
                  <th className="px-4 py-3">十进制 (Dec)</th>
                  <th className="px-4 py-3">十六进制 (Hex)</th>
                  <th className="px-4 py-3">二进制 (Bin)</th>
                  <th className="px-4 py-3">字符 (Char)</th>
                  <th className="px-4 py-3 font-sans">描述</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(item => (
                  <tr key={item.dec} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-2 font-bold text-brand-600 dark:text-brand-400">{item.dec}</td>
                    <td className="px-4 py-2 text-purple-600 dark:text-purple-400">0x{item.hex}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{item.bin}</td>
                    <td className="px-4 py-2 font-bold text-base text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800/40">
                      {item.char}
                    </td>
                    <td className="px-4 py-2 font-sans text-xs text-gray-500">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

