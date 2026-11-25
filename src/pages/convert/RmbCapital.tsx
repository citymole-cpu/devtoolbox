import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Coins } from 'lucide-react'

// Convert number to Chinese RMB capital
function digitToChinese(n: string): string {
  if (!n || isNaN(Number(n))) return ''

  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]

  const num = Math.abs(parseFloat(n))
  let head = parseFloat(n) < 0 ? '欠' : ''

  let s = ''

  // Fraction part
  const decPart = Math.floor(num * 100) % 100
  const jiao = Math.floor(decPart / 10)
  const fen = decPart % 10

  if (jiao === 0 && fen === 0) {
    s = '整'
  } else {
    if (jiao !== 0) s += digit[jiao] + fraction[0]
    if (fen !== 0) s += digit[fen] + fraction[1]
  }

  // Integer part
  let integerPart = Math.floor(num)
  for (let i = 0; i < unit[0].length && integerPart > 0; i++) {
    let p = ''
    for (let j = 0; j < unit[1].length && integerPart > 0; j++) {
      p = digit[integerPart % 10] + unit[1][j] + p
      integerPart = Math.floor(integerPart / 10)
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
  }

  const result = head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整')
  return result || '零元整'
}

export default function RmbCapital() {
  const [numInput, setNumInput] = useState('1234567.89')
  const [capital, setCapital] = useState('')

  useEffect(() => {
    setCapital(digitToChinese(numInput))
  }, [numInput])

  const quickSamples = ['100.50', '2008.00', '1000000', '58420.35', '99999999.99']

  return (
    <ToolPage title="人民币大写转换" description="数字金额快速转换为财务标准大写汉字（发票、支票、合同规范）">
      <div className="card p-6 flex flex-col gap-6">
        <div>
          <label className="label">输入阿拉伯数字金额 (元)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={numInput}
              onChange={e => setNumInput(e.target.value)}
              placeholder="例如: 12345.67"
              className="input-field text-xl font-mono font-bold"
            />
            <button onClick={() => setNumInput('')} className="btn-secondary btn-sm">清空</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-gray-500">示例金额:</span>
            {quickSamples.map(s => (
              <button
                key={s}
                onClick={() => setNumInput(s)}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                ¥ {s}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-200 dark:border-amber-900/50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">大写中文金额 (发票/报销规范)</span>
            <CopyButton text={capital} label="复制大写" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wide select-all break-all">
            {capital || '请输入有效金额'}
          </div>
        </div>

        {/* Notes */}
        <div className="text-xs text-gray-500 leading-relaxed bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
          <p className="font-semibold mb-1 text-gray-700 dark:text-gray-300">中文大写金额书写规范：</p>
          <p>1. 中文大写金额数字到“元”为止的，在“元”之后应写“整”（或“正”）字；在“角”之后可以不写“整”（或“正”）字；大写金额数字有“分”的，“分”后面不写“整”（或“正”）字。</p>
          <p>2. 阿拉伯金额数字中间有“0”时，中文大写要写“零”字；阿拉伯金额数字中间连续有几个“0”时，中文大写金额只写一个“零”字。</p>
        </div>
      </div>
    </ToolPage>
  )
}

