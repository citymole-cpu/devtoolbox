import { useEffect, useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  computeTotpSnapshot,
  formatOtpDisplay,
  generateRandomBase32Secret,
  type Base32ErrorCode,
  type TotpDigits,
  type TotpPeriod,
} from '../../lib/totp'
import {
  AlertCircle,
  Clock,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from 'lucide-react'

const RING_RADIUS = 26
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export default function TotpGenerator() {
  const { language } = useI18n()

  const [secret, setSecret] = useState('')
  const [digits, setDigits] = useState<TotpDigits>(6)
  const [period, setPeriod] = useState<TotpPeriod>(30)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now())
    }, 200)
    return () => window.clearInterval(timer)
  }, [])

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        secretLabel: 'Base32 Secret Key',
        secretPlaceholder: 'Enter Base32 secret (e.g. JBSWY3DPEHPK3PXP, spaces & lowercase allowed)...',
        generateRandom: 'Random Secret',
        clear: 'Clear',
        cleanedLabel: 'Normalized Secret',
        copySecret: 'Copy Secret',
        digitsLabel: 'Code Digits',
        digitsOption: (d: TotpDigits) => `${d} digits`,
        periodLabel: 'Time Step',
        periodOption: (p: TotpPeriod) => (p === 30 ? '30s (Standard)' : '60s'),
        algorithmBadge: 'HMAC-SHA1 · RFC 6238',
        currentCode: 'Current Verification Code',
        copyCode: 'Copy Code',
        remainingSec: (s: number) => `${s}s left`,
        expiringSoon: 'Expiring soon',
        prevCode: 'Previous Code',
        nextCode: 'Next Code',
        prevHint: (p: TotpPeriod) => `-${p}s window`,
        nextHint: (p: TotpPeriod) => `+${p}s window`,
        emptyHint:
          'Enter a Base32 secret key above or click "Random Secret" to generate a live TOTP verification code.',
        errors: {
          EMPTY: '',
          INVALID_CHARS:
            'Invalid Base32 secret: only letters A–Z, digits 2–7, spaces, and optional trailing "=" padding are allowed.',
          INVALID_PADDING:
            'Invalid Base32 padding: when "=" padding is present, the total length (excluding spaces) must be a multiple of 8.',
          INVALID_LENGTH:
            'Invalid Base32 secret length: cannot decode into valid key bytes. Please check for missing or extra characters.',
        } as Record<Base32ErrorCode, string>,
        securityTitle: 'Local Security Notice',
        securityDesc:
          'Your secret key is calculated strictly inside your browser using HMAC-SHA1 and is never uploaded to any server or logged. Avoid entering production 2FA secrets on untrusted or shared devices.',
      }
    }

    if (language === 'ja-JP') {
      return {
        secretLabel: 'Base32 シークレットキー',
        secretPlaceholder: 'Base32 鍵を入力（例: JBSWY3DPEHPK3PXP、スペース・小文字混在可）...',
        generateRandom: 'ランダム鍵を生成',
        clear: 'クリア',
        cleanedLabel: '正規化済みキー',
        copySecret: 'キーをコピー',
        digitsLabel: '桁数',
        digitsOption: (d: TotpDigits) => `${d} 桁`,
        periodLabel: '更新間隔',
        periodOption: (p: TotpPeriod) => (p === 30 ? '30 秒（標準）' : '60 秒'),
        algorithmBadge: 'HMAC-SHA1 · RFC 6238',
        currentCode: '現在の認証コード',
        copyCode: 'コードをコピー',
        remainingSec: (s: number) => `残り ${s} 秒`,
        expiringSoon: 'まもなく更新',
        prevCode: '1 つ前のコード',
        nextCode: '次のコード',
        prevHint: (p: TotpPeriod) => `-${p}秒`,
        nextHint: (p: TotpPeriod) => `+${p}秒`,
        emptyHint:
          '上の入力欄に Base32 シークレットキーを入力するか、「ランダム鍵を生成」をクリックすると TOTP コードが表示されます。',
        errors: {
          EMPTY: '',
          INVALID_CHARS:
            '無効な Base32 形式です。使用できる文字は A〜Z、2〜7、空白、および末尾のパディング "=" のみです。',
          INVALID_PADDING:
            'Base32 のパディングが不正です。"=" を含む場合は空白を除いた文字数が 8 の倍数である必要があります。',
          INVALID_LENGTH:
            'Base32 文字列の長さが不正です。文字の欠落や余分な文字がないか確認してください。',
        } as Record<Base32ErrorCode, string>,
        securityTitle: 'セキュリティに関するご注意',
        securityDesc:
          'シークレットキーはブラウザ内のみで計算され、サーバーへ送信されたりログに記録されたりすることはありません。信頼できない端末や共有 PC では本番用の 2FA キーを入力しないでください。',
      }
    }

    return {
      secretLabel: 'Base32 密钥',
      secretPlaceholder: '输入 Base32 密钥（如 JBSWY3DPEHPK3PXP，支持空格与大小写混写）...',
      generateRandom: '随机生成密钥',
      clear: '清空',
      cleanedLabel: '已清洗密钥',
      copySecret: '复制密钥',
      digitsLabel: '验证码位数',
      digitsOption: (d: TotpDigits) => `${d} 位`,
      periodLabel: '时间步长',
      periodOption: (p: TotpPeriod) => (p === 30 ? '30 秒（默认标准）' : '60 秒'),
      algorithmBadge: 'HMAC-SHA1 · RFC 6238',
      currentCode: '当前动态验证码',
      copyCode: '复制验证码',
      remainingSec: (s: number) => `剩余 ${s} 秒`,
      expiringSoon: '即将刷新',
      prevCode: '上一个验证码',
      nextCode: '下一个验证码',
      prevHint: (p: TotpPeriod) => `前 ${p} 秒窗口`,
      nextHint: (p: TotpPeriod) => `后 ${p} 秒窗口`,
      emptyHint:
        '请在上方输入 Base32 密钥，或点击「随机生成密钥」，即可实时生成与 Google Authenticator 一致的动态验证码。',
      errors: {
        EMPTY: '',
        INVALID_CHARS:
          'Base32 密钥格式非法：仅允许包含字母 A–Z、数字 2–7、空格以及末尾可选的 "=" 填充符（不含 0、1、8、9 等字符）。',
        INVALID_PADDING:
          'Base32 填充符非法：包含 "=" 时，去除空格后的总长度必须为 8 的倍数。',
        INVALID_LENGTH:
          'Base32 密钥长度无效：无法解码为有效密钥字节，请检查是否漏输或多输字符。',
      } as Record<Base32ErrorCode, string>,
      securityTitle: '安全提示',
      securityDesc:
        '密钥仅在浏览器本地通过 HMAC-SHA1 计算，绝不上传至任何服务器，也不会写入任何日志；请勿在不信任或公共设备上输入生产环境 2FA 密钥。',
    }
  }, [language])

  const snapshot = useMemo(() => {
    if (!secret.trim()) return null
    return computeTotpSnapshot(secret, digits, period, nowMs)
  }, [secret, digits, period, nowMs])

  const handleGenerateRandom = () => {
    setSecret(generateRandomBase32Secret(20))
  }

  const handleClear = () => {
    setSecret('')
  }

  const isExpiringSoon =
    snapshot?.ok === true && snapshot.data.remainingSeconds <= 5
  const ringOffset =
    snapshot?.ok === true
      ? RING_CIRCUMFERENCE * (1 - snapshot.data.progress)
      : 0

  return (
    <ToolPage
      title="TOTP 验证码生成器"
      description="输入 Base32 密钥，生成与 Google Authenticator 一致的 6/8 位动态验证码（RFC 6238），纯前端本地计算"
    >
      <div className="card p-6 flex flex-col gap-6">
        {/* 参数控制栏 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* 位数选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {ui.digitsLabel}:
              </span>
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 border border-gray-200 dark:border-gray-800">
                {([6, 8] as TotpDigits[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDigits(d)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      digits === d
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {ui.digitsOption(d)}
                  </button>
                ))}
              </div>
            </div>

            {/* 步长选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {ui.periodLabel}:
              </span>
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 border border-gray-200 dark:border-gray-800">
                {([30, 60] as TotpPeriod[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      period === p
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {ui.periodOption(p)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
            <KeyRound className="w-3.5 h-3.5" />
            {ui.algorithmBadge}
          </span>
        </div>

        {/* 密钥输入区 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="totp-secret-input" className="font-semibold text-sm">
              {ui.secretLabel}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="btn-secondary btn-sm text-xs inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {ui.generateRandom}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={!secret}
                className="btn-ghost btn-sm text-xs inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {ui.clear}
              </button>
            </div>
          </div>

          <input
            id="totp-secret-input"
            type="text"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder={ui.secretPlaceholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="input-field font-mono text-sm tracking-wider"
          />

          {snapshot?.ok && snapshot.data.cleanedSecret !== secret && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-mono break-all">
                {ui.cleanedLabel}: {snapshot.data.cleanedSecret}
              </span>
              <CopyButton text={snapshot.data.cleanedSecret} label={ui.copySecret} />
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {snapshot && snapshot.ok === false && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{ui.errors[snapshot.error]}</span>
          </div>
        )}

        {/* 验证码展示区 */}
        {snapshot?.ok ? (
          <div className="flex flex-col gap-5">
            {/* 当前验证码主卡片 */}
            <div className="p-6 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                    {ui.currentCode}
                  </span>
                  {isExpiringSoon && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-medium">
                      {ui.expiringSoon}
                    </span>
                  )}
                </div>
                <CopyButton text={snapshot.data.current} label={ui.copyCode} />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div
                  className={`font-mono text-4xl sm:text-5xl font-bold tracking-[0.2em] select-all ${
                    isExpiringSoon
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {formatOtpDisplay(snapshot.data.current)}
                </div>

                {/* 进度环 + 剩余秒数 */}
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r={RING_RADIUS}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="5"
                        className="text-gray-200 dark:text-gray-800"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r={RING_RADIUS}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={ringOffset}
                        className={`transition-[stroke-dashoffset] duration-150 ${
                          isExpiringSoon
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-brand-600 dark:text-brand-400'
                        }`}
                      />
                    </svg>
                    <span
                      className={`absolute font-mono text-sm font-bold ${
                        isExpiringSoon
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {snapshot.data.remainingSeconds}s
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ui.remainingSec(snapshot.data.remainingSeconds)}
                    </span>
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                      {period}s / {digits}d
                    </span>
                  </div>
                </div>
              </div>

              {/* 线性进度条 */}
              <div className="w-full h-2 rounded-full bg-gray-200/80 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-150 ${
                    isExpiringSoon
                      ? 'bg-red-500 dark:bg-red-400'
                      : 'bg-brand-600 dark:bg-brand-400'
                  }`}
                  style={{ width: `${(snapshot.data.progress * 100).toFixed(2)}%` }}
                />
              </div>
            </div>

            {/* 上一个 / 下一个验证码对照 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {ui.prevCode}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                      {ui.prevHint(period)}
                    </span>
                  </div>
                  <div className="font-mono text-xl font-semibold tracking-widest text-gray-700 dark:text-gray-300 select-all">
                    {snapshot.data.previous
                      ? formatOtpDisplay(snapshot.data.previous)
                      : '—'}
                  </div>
                </div>
                {snapshot.data.previous && (
                  <CopyButton text={snapshot.data.previous} />
                )}
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {ui.nextCode}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                      {ui.nextHint(period)}
                    </span>
                  </div>
                  <div className="font-mono text-xl font-semibold tracking-widest text-gray-700 dark:text-gray-300 select-all">
                    {formatOtpDisplay(snapshot.data.next)}
                  </div>
                </div>
                <CopyButton text={snapshot.data.next} />
              </div>
            </div>
          </div>
        ) : (
          !snapshot && (
            <div className="p-8 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              {ui.emptyHint}
            </div>
          )
        )}

        {/* 安全提示卡片 */}
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="font-semibold mb-1">{ui.securityTitle}</div>
            <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {ui.securityDesc}
            </p>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
