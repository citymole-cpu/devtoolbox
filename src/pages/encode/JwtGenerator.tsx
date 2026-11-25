import { useState, useCallback } from 'react'
import CryptoJS from 'crypto-js'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

type Alg = 'HS256' | 'HS384' | 'HS512'

function base64UrlEncode(wordArray: CryptoJS.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(wordArray)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlEncodeStr(str: string): string {
  return base64UrlEncode(CryptoJS.enc.Utf8.parse(str))
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4
  if (pad) b64 += '='.repeat(4 - pad)
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(b64))
}

function sign(data: string, secret: string, alg: Alg): string {
  const hmac =
    alg === 'HS384'
      ? CryptoJS.HmacSHA384(data, secret)
      : alg === 'HS512'
        ? CryptoJS.HmacSHA512(data, secret)
        : CryptoJS.HmacSHA256(data, secret)
  return base64UrlEncode(hmac)
}

function defaultPayload(): string {
  const now = Math.floor(Date.now() / 1000)
  return JSON.stringify(
    { sub: '1234567890', name: 'DevToolBox', iat: now, exp: now + 3600 },
    null,
    2
  )
}

const inputCls =
  'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const btnCls =
  'px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
const btnPrimaryCls =
  'px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors'

export default function JwtGenerator() {
  const [mode, setMode] = useState<'generate' | 'verify'>('generate')
  const [alg, setAlg] = useState<Alg>('HS256')
  const [header, setHeader] = useState(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)
  )
  const [payload, setPayload] = useState(defaultPayload)
  const [secret, setSecret] = useState('your-256-bit-secret')
  const [showSecret, setShowSecret] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [verifyInput, setVerifyInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean
    header: string
    payload: string
  } | null>(null)
  const [verifyError, setVerifyError] = useState('')

  const generate = useCallback(() => {
    setError('')
    try {
      const headerObj = JSON.parse(header)
      const payloadObj = JSON.parse(payload)
      if (typeof headerObj !== 'object' || headerObj === null || Array.isArray(headerObj)) {
        throw new Error('Header 必须是 JSON 对象')
      }
      if (typeof payloadObj !== 'object' || payloadObj === null || Array.isArray(payloadObj)) {
        throw new Error('Payload 必须是 JSON 对象')
      }
      if (!secret) throw new Error('请填写签名密钥')
      headerObj.alg = alg
      headerObj.typ = headerObj.typ || 'JWT'
      const encHeader = base64UrlEncodeStr(JSON.stringify(headerObj))
      const encPayload = base64UrlEncodeStr(JSON.stringify(payloadObj))
      const signature = sign(`${encHeader}.${encPayload}`, secret, alg)
      setToken(`${encHeader}.${encPayload}.${signature}`)
    } catch (e: any) {
      setError(e.message || '生成失败')
      setToken('')
    }
  }, [header, payload, secret, alg])

  const addClaim = useCallback(
    (key: string, value: number) => {
      try {
        const obj = JSON.parse(payload)
        obj[key] = value
        setPayload(JSON.stringify(obj, null, 2))
      } catch {
        setError('Payload 不是合法 JSON，无法添加声明')
      }
    },
    [payload]
  )

  const verify = useCallback(() => {
    setVerifyError('')
    setVerifyResult(null)
    try {
      const parts = verifyInput.trim().split('.')
      if (parts.length !== 3) throw new Error('无效的 JWT 格式：应为 Header.Payload.Signature 三段')
      const headerJson = base64UrlDecode(parts[0])
      const payloadJson = base64UrlDecode(parts[1])
      const headerObj = JSON.parse(headerJson)
      const payloadObj = JSON.parse(payloadJson)
      if (!secret) throw new Error('请填写签名密钥')
      const algOfToken = (headerObj.alg as Alg) || 'HS256'
      if (algOfToken !== 'HS256' && algOfToken !== 'HS384' && algOfToken !== 'HS512') {
        throw new Error(`不支持的签名算法：${algOfToken}（仅支持 HS256 / HS384 / HS512）`)
      }
      const expected = sign(`${parts[0]}.${parts[1]}`, secret, algOfToken)
      setVerifyResult({
        valid: expected === parts[2],
        header: JSON.stringify(headerObj, null, 2),
        payload: JSON.stringify(payloadObj, null, 2),
      })
    } catch (e: any) {
      setVerifyError(e.message || '验证失败')
    }
  }, [verifyInput, secret])

  const now = Math.floor(Date.now() / 1000)

  return (
    <ToolPage title="JWT 生成器" description="在线签发 HS256 / HS384 / HS512 JWT，并可验证已有 Token 的签名">
      {/* 模式切换 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setMode('generate')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            mode === 'generate'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          生成 Token
        </button>
        <button
          onClick={() => setMode('verify')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            mode === 'verify'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          验证签名
        </button>
      </div>

      {mode === 'generate' ? (
        <div className="flex flex-col gap-6">
          {/* 算法与密钥 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                签名算法
              </label>
              <select
                value={alg}
                onChange={e => {
                  const next = e.target.value as Alg
                  setAlg(next)
                  try {
                    const h = JSON.parse(header)
                    h.alg = next
                    setHeader(JSON.stringify(h, null, 2))
                  } catch {
                    /* Header 非法时不联动 */
                  }
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HS256">HS256（HMAC + SHA-256）</option>
                <option value="HS384">HS384（HMAC + SHA-384）</option>
                <option value="HS512">HS512（HMAC + SHA-512）</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                签名密钥（Secret）
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  placeholder="your-256-bit-secret"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={() => setShowSecret(v => !v)} className={btnCls}>
                  {showSecret ? '隐藏' : '显示'}
                </button>
              </div>
            </div>
          </div>

          {/* Header / Payload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Header（JSON）
              </label>
              <textarea
                value={header}
                onChange={e => setHeader(e.target.value)}
                spellCheck={false}
                className={`${inputCls} h-36 resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payload（JSON）
              </label>
              <textarea
                value={payload}
                onChange={e => setPayload(e.target.value)}
                spellCheck={false}
                className={`${inputCls} h-36 resize-none`}
              />
            </div>
          </div>

          {/* 快捷声明 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">快捷添加声明：</span>
            <button onClick={() => addClaim('iat', now)} className={btnCls}>
              iat = 现在
            </button>
            <button onClick={() => addClaim('exp', now + 3600)} className={btnCls}>
              exp = 1 小时后
            </button>
            <button onClick={() => addClaim('exp', now + 86400)} className={btnCls}>
              exp = 24 小时后
            </button>
            <button onClick={() => addClaim('nbf', now)} className={btnCls}>
              nbf = 现在
            </button>
          </div>

          <div>
            <button onClick={generate} className={btnPrimaryCls}>
              生成 JWT
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {token && (
            <div className="rounded-lg border-2 border-green-300 dark:border-green-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-900/30 border-b border-green-300 dark:border-green-700">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  生成的 JWT
                </span>
                <CopyButton text={token} />
              </div>
              <pre className="p-4 bg-white dark:bg-gray-800 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto break-all whitespace-pre-wrap">
                {token}
              </pre>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-green-200 dark:border-green-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  签名在浏览器本地完成，密钥不会上传。生成的 Token 可直接粘贴到「验证签名」中校验。
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              JWT Token
            </label>
            <textarea
              value={verifyInput}
              onChange={e => setVerifyInput(e.target.value)}
              placeholder="请粘贴要验证的 JWT Token..."
              spellCheck={false}
              className={`${inputCls} h-28 resize-none`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              签名密钥（Secret）
            </label>
            <div className="flex gap-2">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="your-256-bit-secret"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => setShowSecret(v => !v)} className={btnCls}>
                {showSecret ? '隐藏' : '显示'}
              </button>
            </div>
          </div>
          <div>
            <button onClick={verify} className={btnPrimaryCls}>
              验证签名
            </button>
          </div>

          {verifyError && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {verifyError}
            </div>
          )}

          {verifyResult && (
            <div
              className={`rounded-lg border-2 overflow-hidden ${
                verifyResult.valid
                  ? 'border-green-300 dark:border-green-700'
                  : 'border-red-300 dark:border-red-700'
              }`}
            >
              <div
                className={`px-4 py-3 text-sm font-semibold ${
                  verifyResult.valid
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}
              >
                {verifyResult.valid ? '✅ 签名有效' : '⛔ 签名无效（密钥不匹配或 Token 被篡改）'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Header</div>
                  <pre className="text-sm font-mono text-blue-800 dark:text-blue-300 overflow-x-auto">
                    {verifyResult.header}
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Payload</div>
                  <pre className="text-sm font-mono text-green-800 dark:text-green-300 overflow-x-auto">
                    {verifyResult.payload}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  )
}
