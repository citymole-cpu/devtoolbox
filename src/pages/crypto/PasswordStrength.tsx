import { useState, useMemo } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Check, X, ShieldAlert } from 'lucide-react'

// 常见弱密码黑名单（小写比对）
const COMMON_PASSWORDS = new Set([
  '123456', '123456789', '12345678', '12345', '1234567', '1234567890', '123123',
  '1234', '123', '000000', '111111', '654321', '666666', '888888', '123321',
  '112233', 'password', 'password1', 'passw0rd', 'qwerty', 'qwerty123', 'abc123',
  'abc123456', 'a123456', '123456a', 'admin', 'administrator', 'letmein', 'welcome',
  'welcome1', 'monkey', 'dragon', 'master', 'sunshine', 'princess', 'football',
  'iloveyou', 'shadow', 'superman', 'michael', 'charlie', 'aa123456', 'woaini',
  'woaini1314', '5201314', '1314520', 'qazwsx', '1qaz2wsx', 'qwe123', 'test',
  'test123', 'demo', 'user', 'root', 'guest', 'changeme', 'default',
])

interface CheckItem {
  label: string
  passed: boolean
  hint: string
}

function hasSequential(pwd: string): boolean {
  const lower = pwd.toLowerCase()
  for (let i = 0; i < lower.length - 2; i++) {
    const a = lower.charCodeAt(i)
    const b = lower.charCodeAt(i + 1)
    const c = lower.charCodeAt(i + 2)
    if (b === a + 1 && c === b + 1) return true
    if (b === a - 1 && c === b - 1) return true
  }
  return false
}

function hasRepeated(pwd: string): boolean {
  return /(.)\1{2,}/.test(pwd)
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '几乎无限'
  if (seconds < 1) return '不到 1 秒'
  if (seconds < 60) return `约 ${Math.round(seconds)} 秒`
  const minutes = seconds / 60
  if (minutes < 60) return `约 ${Math.round(minutes)} 分钟`
  const hours = minutes / 60
  if (hours < 24) return `约 ${Math.round(hours)} 小时`
  const days = hours / 24
  if (days < 365) return `约 ${Math.round(days)} 天`
  const years = days / 365
  if (years < 1000) return `约 ${Math.round(years)} 年`
  if (years < 1e6) return `约 ${(years / 1000).toFixed(1)} 千年`
  if (years < 1e9) return `约 ${(years / 1e6).toFixed(1)} 百万年`
  return `约 ${(years / 1e9).toFixed(1)} 十亿年`
}

function analyze(pwd: string) {
  const len = pwd.length
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasDigit = /[0-9]/.test(pwd)
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd)
  const isCommon = COMMON_PASSWORDS.has(pwd.toLowerCase())
  const sequential = hasSequential(pwd)
  const repeated = hasRepeated(pwd)
  const classes = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length

  const checks: CheckItem[] = [
    { label: '长度至少 8 位', passed: len >= 8, hint: '少于 8 位极易被暴力破解' },
    { label: '长度达到 12 位', passed: len >= 12, hint: '12 位以上强度明显提升' },
    { label: '长度达到 16 位', passed: len >= 16, hint: '16 位以上可抵御离线暴力破解' },
    { label: '包含大写字母', passed: hasUpper, hint: '加入 A-Z 扩大字符空间' },
    { label: '包含小写字母', passed: hasLower, hint: '加入 a-z 扩大字符空间' },
    { label: '包含数字', passed: hasDigit, hint: '加入 0-9 扩大字符空间' },
    { label: '包含特殊符号', passed: hasSymbol, hint: '加入 !@#$ 等符号大幅提升强度' },
    { label: '不在常见弱密码中', passed: !isCommon, hint: '该密码出现在泄露密码表中，立即更换' },
    { label: '无连续字符（如 abc、123）', passed: !sequential, hint: '连续字符会被字典攻击优先尝试' },
    { label: '无三连重复字符（如 aaa）', passed: !repeated, hint: '重复字符会缩小有效搜索空间' },
  ]

  let score = 0
  score += Math.min(len * 4, 40)
  score += classes * 10
  if (isCommon) score = Math.min(score, 10)
  if (sequential) score -= 10
  if (repeated) score -= 10
  if (len > 0 && classes === 1) score -= 10
  score = Math.max(0, Math.min(100, score))

  let pool = 0
  if (hasLower) pool += 26
  if (hasUpper) pool += 26
  if (hasDigit) pool += 10
  if (hasSymbol) pool += 32
  const entropy = pool > 0 ? Math.round(len * Math.log2(pool)) : 0
  // 按每秒 100 亿次猜测估算暴力破解耗时
  const crackSeconds = pool > 0 ? Math.pow(pool, len) / 2 / 1e10 : 0

  const level =
    score < 20
      ? { label: '很弱', color: 'bg-red-600', text: 'text-red-600 dark:text-red-400' }
      : score < 40
        ? { label: '弱', color: 'bg-red-500', text: 'text-red-500' }
        : score < 60
          ? { label: '一般', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' }
          : score < 80
            ? { label: '强', color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' }
            : { label: '极强', color: 'bg-green-500', text: 'text-green-600 dark:text-green-400' }

  const suggestions: string[] = []
  if (len < 12) suggestions.push('把长度增加到 12 位以上（推荐 16 位）')
  if (!hasUpper) suggestions.push('加入大写字母')
  if (!hasLower) suggestions.push('加入小写字母')
  if (!hasDigit) suggestions.push('加入数字')
  if (!hasSymbol) suggestions.push('加入特殊符号，如 ! @ # $ %')
  if (isCommon) suggestions.push('不要使用任何常见密码或纯数字组合')
  if (sequential) suggestions.push('避免 abc、123 这类连续字符')
  if (repeated) suggestions.push('避免同一字符连续出现 3 次以上')
  if (suggestions.length === 0) suggestions.push('这个密码已经很强了，记得不要在多个网站重复使用')

  return { checks, score, level, entropy, crackSeconds, isCommon, suggestions }
}

export default function PasswordStrength() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const result = useMemo(() => (password ? analyze(password) : null), [password])

  return (
    <ToolPage title="密码强度检测器" description="本地检测密码强度：规则评分、熵值与破解耗时估算，不上传任何内容">
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输入密码进行检测
          </label>
          <div className="flex gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="输入要检测的密码..."
              autoComplete="off"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowPassword(v => !v)}
              className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {showPassword ? '隐藏' : '显示'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            检测完全在浏览器本地进行，密码不会发送到任何服务器。
          </p>
        </div>

        {result && (
          <>
            {/* 评分 */}
            <div className="card p-6">
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">综合评分</span>
                <span className={`text-3xl font-bold ${result.level.text}`}>
                  {result.score}
                  <span className="text-base text-gray-400 font-normal"> / 100 · {result.level.label}</span>
                </span>
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${result.level.color} transition-all duration-300`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border">
                  <div className="text-xs text-gray-500 dark:text-gray-400">信息熵</div>
                  <div className="text-lg font-semibold mt-0.5">{result.entropy} bit</div>
                  <div className="text-xs text-gray-400 mt-0.5">建议 60 bit 以上</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border">
                  <div className="text-xs text-gray-500 dark:text-gray-400">暴力破解预估耗时</div>
                  <div className="text-lg font-semibold mt-0.5">{formatTime(result.crackSeconds)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">按每秒 100 亿次猜测估算</div>
                </div>
              </div>
            </div>

            {/* 规则检查 */}
            <div className="card p-6">
              <h2 className="text-base font-semibold mb-4">规则检查</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.checks.map(c => (
                  <div
                    key={c.label}
                    className="flex items-start gap-2 text-sm py-1.5"
                    title={c.passed ? '' : c.hint}
                  >
                    {c.passed ? (
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={c.passed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100 font-medium'}>
                      {c.label}
                      {!c.passed && (
                        <span className="block text-xs text-gray-400 font-normal">{c.hint}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 改进建议 */}
            <div className="card p-6">
              <h2 className="text-base font-semibold mb-3">改进建议</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {result.suggestions.map(s => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {!result && (
          <div className="card p-6 text-sm text-gray-500 dark:text-gray-400">
            在上方输入密码，实时查看强度评分、熵值、破解耗时和改进建议。也可以用本站的「密码生成」工具先生成一个高强度密码再来检测。
          </div>
        )}
      </div>
    </ToolPage>
  )
}
