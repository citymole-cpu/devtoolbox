import { useState } from 'react'
import * as bcrypt from 'bcryptjs'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function Bcrypt() {
  const [mode, setMode] = useState<'generate' | 'verify'>('generate')

  // 生成模式
  const [password, setPassword] = useState('')
  const [cost, setCost] = useState(10)
  const [hash, setHash] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  // 验证模式
  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  const generate = async () => {
    if (!password) {
      setGenError('请输入要加密的密码')
      return
    }
    setGenerating(true)
    setGenError('')
    setHash('')
    try {
      const salt = await bcrypt.genSalt(cost)
      const result = await bcrypt.hash(password, salt)
      setHash(result)
    } catch (e) {
      setGenError(e instanceof Error ? e.message : '生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  const verify = async () => {
    if (!verifyPassword || !verifyHash.trim()) {
      setVerifyError('请同时输入明文密码和 bcrypt 哈希')
      return
    }
    setVerifying(true)
    setVerifyError('')
    setVerifyResult(null)
    try {
      const ok = await bcrypt.compare(verifyPassword, verifyHash.trim())
      setVerifyResult(ok)
    } catch (e) {
      setVerifyError('哈希格式无效：请输入 $2a$ / $2b$ / $2y$ 开头的标准 bcrypt 哈希')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <ToolPage title="bcrypt 生成器" description="纯前端生成与验证 bcrypt 密码哈希（$2b$），密码不离开浏览器，适用于用户系统开发调试">
      <div className="flex flex-col gap-6">
        {/* 模式切换 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('generate')}
            className={`btn btn-sm ${mode === 'generate' ? 'btn-primary' : 'btn-secondary'}`}
          >
            生成哈希
          </button>
          <button
            onClick={() => setMode('verify')}
            className={`btn btn-sm ${mode === 'verify' ? 'btn-primary' : 'btn-secondary'}`}
          >
            验证哈希
          </button>
        </div>

        {mode === 'generate' ? (
          <>
            <div className="card p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  明文密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generate()}
                  placeholder="输入要加密的密码..."
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span>Cost 因子（计算强度）</span>
                  <span>{cost}（2^{cost} 次迭代）</span>
                </div>
                <input
                  type="range" min="4" max="12" value={cost}
                  onChange={e => setCost(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  cost 每 +1，耗时翻倍：cost 10 约几百毫秒，cost 12 约数秒。生产环境推荐 10–12；不要在前端用超过 12。
                </p>
              </div>
              <div>
                <button
                  onClick={generate}
                  disabled={generating || !password}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {generating ? '生成中…' : '生成 bcrypt 哈希'}
                </button>
              </div>
              {genError && <p className="text-sm text-red-600 dark:text-red-400">{genError}</p>}
            </div>

            {hash && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold">生成的哈希</h2>
                  <CopyButton text={hash} label="复制哈希" />
                </div>
                <p className="font-mono text-sm break-all bg-gray-50 dark:bg-gray-900 rounded-lg p-4">{hash}</p>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  哈希中已包含盐值与 cost 参数，可直接存入数据库；验证时只需用 bcrypt.compare(明文, 哈希) 即可，无需单独保存盐。
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="card p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  明文密码
                </label>
                <input
                  type="password"
                  value={verifyPassword}
                  onChange={e => setVerifyPassword(e.target.value)}
                  placeholder="输入要验证的明文密码..."
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  bcrypt 哈希
                </label>
                <input
                  type="text"
                  value={verifyHash}
                  onChange={e => setVerifyHash(e.target.value)}
                  placeholder="$2b$10$..."
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <button
                  onClick={verify}
                  disabled={verifying || !verifyPassword || !verifyHash.trim()}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
                  {verifying ? '验证中…' : '验证是否匹配'}
                </button>
              </div>
              {verifyError && <p className="text-sm text-red-600 dark:text-red-400">{verifyError}</p>}
            </div>

            {verifyResult !== null && (
              <div className={`card p-6 flex items-start gap-3 ${verifyResult ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'}`}>
                {verifyResult ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`font-semibold ${verifyResult ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {verifyResult ? '密码与哈希匹配' : '密码与哈希不匹配'}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {verifyResult
                      ? '该明文密码就是生成此哈希的原始密码。'
                      : '请检查密码是否输错，或确认哈希是否完整复制（$2b$ 开头、共 60 个字符）。'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="card p-6 text-sm text-gray-500 dark:text-gray-400">
          全部计算在浏览器本地完成（bcryptjs），密码与哈希不会发送到任何服务器。bcrypt 是单向慢哈希，专为密码存储设计，无法反向解密。
        </div>
      </div>
    </ToolPage>
  )
}
