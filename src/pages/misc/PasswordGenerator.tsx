import { useState, useEffect, useCallback } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { RefreshCw, Shield, KeyRound, Check } from 'lucide-react'

export default function PasswordGenerator() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [includeUpper, setIncludeUpper] = useState(true)
  const [includeLower, setIncludeLower] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)

  // Batch generation
  const [batchCount, setBatchCount] = useState(5)
  const [batchList, setBatchList] = useState<string[]>([])

  const generateSinglePassword = useCallback(() => {
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let lower = 'abcdefghijklmnopqrstuvwxyz'
    let numbers = '0123456789'
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (excludeAmbiguous) {
      // Remove ambiguous chars: 0 O o I l 1
      upper = upper.replace(/[OI]/g, '')
      lower = lower.replace(/[ol]/g, '')
      numbers = numbers.replace(/[01]/g, '')
    }

    let charPool = ''
    const requiredChars: string[] = []

    if (includeUpper && upper) {
      charPool += upper
      requiredChars.push(upper[Math.floor(Math.random() * upper.length)])
    }
    if (includeLower && lower) {
      charPool += lower
      requiredChars.push(lower[Math.floor(Math.random() * lower.length)])
    }
    if (includeNumbers && numbers) {
      charPool += numbers
      requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)])
    }
    if (includeSymbols && symbols) {
      charPool += symbols
      requiredChars.push(symbols[Math.floor(Math.random() * symbols.length)])
    }

    if (!charPool) return ''

    const randomValues = new Uint32Array(length)
    crypto.getRandomValues(randomValues)

    let pwdChars = [...requiredChars]
    for (let i = pwdChars.length; i < length; i++) {
      const idx = randomValues[i] % charPool.length
      pwdChars.push(charPool[idx])
    }

    // Shuffle characters
    for (let i = pwdChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pwdChars[i], pwdChars[j]] = [pwdChars[j], pwdChars[i]]
    }

    return pwdChars.join('')
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous])

  const handleGenerate = useCallback(() => {
    setPassword(generateSinglePassword())
  }, [generateSinglePassword])

  const handleGenerateBatch = () => {
    const list: string[] = []
    for (let i = 0; i < batchCount; i++) {
      list.push(generateSinglePassword())
    }
    setBatchList(list)
  }

  useEffect(() => {
    handleGenerate()
  }, [handleGenerate])

  // Password strength calculation
  const getStrength = () => {
    if (!password) return { score: 0, label: '无', color: 'bg-gray-200' }
    let score = 0
    if (password.length >= 8) score += 1
    if (password.length >= 14) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) return { score, label: '弱', color: 'bg-red-500' }
    if (score <= 4) return { score, label: '中等', color: 'bg-amber-500' }
    if (score <= 5) return { score, label: '强', color: 'bg-blue-500' }
    return { score, label: '极强', color: 'bg-green-500' }
  }

  const strength = getStrength()

  return (
    <ToolPage title="随机密码生成器" description="生成高强度安全随机密码，支持自定义字符集与批量生成">
      <div className="flex flex-col gap-6">
        {/* Main Password Output */}
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border">
            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-brand-600 dark:text-brand-400 break-all select-all">
              {password || '请至少勾选一种字符类型'}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleGenerate}
                className="btn-icon p-2 hover:bg-gray-200 dark:hover:bg-gray-800"
                title="重新生成"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <CopyButton text={password} />
            </div>
          </div>

          {/* Strength meter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-500">密码强度:</span>
              <span className="font-semibold">{strength.label}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${(strength.score / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4">密码规则配置</h2>

          <div className="flex flex-col gap-5">
            {/* Length */}
            <div>
              <div className="flex justify-between items-center text-sm font-medium mb-2">
                <span>密码长度: {length} 位</span>
                <span className="text-xs text-gray-400">推荐 14 位以上</span>
              </div>
              <input
                type="range"
                min="6"
                max="64"
                value={length}
                onChange={e => setLength(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={e => setIncludeUpper(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>包含大写字母 (A-Z)</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={e => setIncludeLower(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>包含小写字母 (a-z)</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={e => setIncludeNumbers(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>包含数字 (0-9)</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={e => setIncludeSymbols(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>包含特殊符号 (!@#$...)</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none sm:col-span-2">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={e => setExcludeAmbiguous(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>排除易混淆字符 (例如: 0, O, o, 1, l, I)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Batch Generate */}
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-semibold">批量生成密码</h2>
            <div className="flex items-center gap-3">
              <select
                value={batchCount}
                onChange={e => setBatchCount(Number(e.target.value))}
                className="select-field text-sm"
              >
                <option value={5}>生成 5 个</option>
                <option value={10}>生成 10 个</option>
                <option value={20}>生成 20 个</option>
                <option value={50}>生成 50 个</option>
              </select>
              <button onClick={handleGenerateBatch} className="btn-primary btn-sm">
                批量生成
              </button>
            </div>
          </div>

          {batchList.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-end mb-1">
                <CopyButton text={batchList.join('\n')} label="复制全部密码" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border font-mono text-sm max-h-60 overflow-y-auto space-y-1">
                {batchList.map((pwd, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b last:border-b-0">
                    <span className="truncate mr-2">{pwd}</span>
                    <CopyButton text={pwd} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}

