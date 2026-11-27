import { useEffect, useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import { AlertCircle, CheckCircle2, FileCode2, Globe, Loader2, ShieldCheck, Trash2 } from 'lucide-react'

type InputMode = 'text' | 'url'
type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512'
type ResourceTypeMode = 'auto' | 'js' | 'css'
type DetectedResourceType = 'js' | 'css'

const ALGORITHMS: { id: HashAlgorithm; prefix: string; bits: number }[] = [
  { id: 'SHA-256', prefix: 'sha256', bits: 256 },
  { id: 'SHA-384', prefix: 'sha384', bits: 384 },
  { id: 'SHA-512', prefix: 'sha512', bits: 512 },
]

const SAMPLE_JS = `console.log("Hello, Subresource Integrity!");`

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

async function computeSriHash(data: Uint8Array, algorithm: HashAlgorithm): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('WEB_CRYPTO_UNAVAILABLE')
  }
  const normalized =
    data.buffer instanceof ArrayBuffer
      ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
      : new Uint8Array(data)
  const digest = await crypto.subtle.digest(algorithm, normalized)
  const prefix = algorithm.toLowerCase().replace('-', '')
  return `${prefix}-${arrayBufferToBase64(digest)}`
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function detectResourceTypeFromUrl(url: string, contentType?: string | null): DetectedResourceType {
  if (contentType) {
    const ct = contentType.toLowerCase()
    if (ct.includes('text/css')) return 'css'
    if (ct.includes('javascript') || ct.includes('ecmascript')) return 'js'
  }
  try {
    const pathname = new URL(url).pathname.toLowerCase()
    if (pathname.endsWith('.css')) return 'css'
    if (pathname.endsWith('.js') || pathname.endsWith('.mjs') || pathname.endsWith('.cjs')) return 'js'
  } catch {
    // Fallback to simple extension check
    const clean = url.split(/[?#]/)[0].toLowerCase()
    if (clean.endsWith('.css')) return 'css'
  }
  return 'js'
}

function detectResourceTypeFromText(text: string): DetectedResourceType {
  const sample = text.slice(0, 4000).trim()
  if (!sample) return 'js'
  const looksLikeJs =
    /\b(function|const|let|var|import|export|return|window|document|console)\b/.test(sample) ||
    /=>/.test(sample)
  if (looksLikeJs) return 'js'
  const looksLikeCss =
    /(^|[\s}])(@media|@import|@keyframes|@font-face|:root|[.#]?[a-zA-Z_-][\w-]*\s*\{[^}]*:[^{}]+\})/m.test(
      sample,
    )
  return looksLikeCss ? 'css' : 'js'
}

function buildHtmlTag(
  resourceType: DetectedResourceType,
  integrity: string,
  resourceUrl: string,
): string {
  const fallbackUrl =
    resourceType === 'css'
      ? 'https://cdn.example.com/style.min.css'
      : 'https://cdn.example.com/script.min.js'
  const safeUrl = escapeHtmlAttr(resourceUrl.trim() || fallbackUrl)
  const safeIntegrity = escapeHtmlAttr(integrity)

  if (resourceType === 'css') {
    return `<link rel="stylesheet" href="${safeUrl}" integrity="${safeIntegrity}" crossorigin="anonymous" />`
  }
  return `<script src="${safeUrl}" integrity="${safeIntegrity}" crossorigin="anonymous"></script>`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function SriHash() {
  const { language } = useI18n()

  const [mode, setMode] = useState<InputMode>('text')
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-384')
  const [resourceTypeMode, setResourceTypeMode] = useState<ResourceTypeMode>('auto')

  const [fetchedBytes, setFetchedBytes] = useState<Uint8Array | null>(null)
  const [fetchedUrl, setFetchedUrl] = useState('')
  const [fetchedContentType, setFetchedContentType] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [hashes, setHashes] = useState<Record<HashAlgorithm, string> | null>(null)
  const [hashError, setHashError] = useState<string | null>(null)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        modeText: 'Paste Content',
        modeUrl: 'Fetch CDN URL',
        algorithmLabel: 'Hash Algorithm',
        recommended: 'Recommended',
        resourceTypeLabel: 'Tag Type',
        typeAuto: 'Auto-detect',
        typeJs: 'JavaScript (<script>)',
        typeCss: 'CSS (<link>)',
        textLabel: 'Resource File Content (JS / CSS)',
        textPlaceholder: 'Paste JS or CSS content here, e.g. hello ...',
        fillSample: 'Load Sample',
        clear: 'Clear',
        urlLabel: 'CDN Resource URL',
        urlPlaceholder: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
        fetchBtn: 'Fetch & Calculate',
        fetching: 'Fetching...',
        urlTip:
          'Fetched directly in your browser. If the target CDN blocks cross-origin requests (CORS), copy the file content and switch to Paste Content mode.',
        switchToPaste: 'Switch to Paste Mode',
        invalidUrl: 'Please enter a valid http:// or https:// URL.',
        fetchHttpError: (status: number, statusText: string) =>
          `Failed to fetch URL (HTTP ${status} ${statusText}). Please check the URL or switch to "Paste Content" mode.`,
        fetchNetworkError:
          'Unable to fetch this URL from the browser (likely blocked by CORS or a network error). Please open the URL, copy its content, and use "Paste Content" mode instead.',
        cryptoUnavailable:
          'Web Crypto API (crypto.subtle) is unavailable in this browser context. Please use HTTPS or localhost.',
        fetchedSuccess: (size: string) => `Fetched ${size} successfully`,
        byteSize: 'Payload Size',
        detectedAs: (t: DetectedResourceType) =>
          t === 'css' ? 'Detected: CSS (<link>)' : 'Detected: JavaScript (<script>)',
        resultIntegrityAttr: 'integrity Attribute',
        resultRawHash: 'SRI Hash Value',
        resultHtmlTag: 'HTML Tag Example',
        allAlgorithmsTitle: 'All Algorithms Comparison',
        copyAttr: 'Copy Attribute',
        copyHash: 'Copy Hash',
        copyTag: 'Copy Tag',
        emptyHint: 'Paste text content or fetch a CDN URL above to generate its SRI hash and HTML tag.',
        aboutTitle: 'What is Subresource Integrity (SRI)?',
        aboutDesc:
          'SRI allows browsers to verify that files fetched from CDNs have not been tampered with. Always include crossorigin="anonymous" alongside the integrity attribute on cross-origin <script> and <link> tags.',
      }
    }
    if (language === 'ja-JP') {
      return {
        modeText: 'テキスト貼り付け',
        modeUrl: 'CDN URL から取得',
        algorithmLabel: 'ハッシュアルゴリズム',
        recommended: '推奨',
        resourceTypeLabel: 'タグ種別',
        typeAuto: '自動判定',
        typeJs: 'JavaScript (<script>)',
        typeCss: 'CSS (<link>)',
        textLabel: 'リソースファイル内容 (JS / CSS)',
        textPlaceholder: 'JS または CSS の内容を貼り付けてください（例: hello）...',
        fillSample: 'サンプルを入力',
        clear: 'クリア',
        urlLabel: 'CDN リソース URL',
        urlPlaceholder: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
        fetchBtn: '取得して計算',
        fetching: '取得中...',
        urlTip:
          'ブラウザから直接 fetch します。CORS 制限により取得できない場合は、ファイル内容をコピーして「テキスト貼り付け」モードをご利用ください。',
        switchToPaste: '貼り付けモードへ切替',
        invalidUrl: '有効な http:// または https:// URL を入力してください。',
        fetchHttpError: (status: number, statusText: string) =>
          `URL の取得に失敗しました (HTTP ${status} ${statusText})。URL を確認するか、「テキスト貼り付け」モードをご利用ください。`,
        fetchNetworkError:
          'ブラウザから URL を取得できませんでした（CORS 制限またはネットワークエラーの可能性があります）。ファイル内容をコピーして「テキスト貼り付け」モードをご利用ください。',
        cryptoUnavailable:
          'この環境では Web Crypto API (crypto.subtle) を利用できません。HTTPS または localhost で開いてください。',
        fetchedSuccess: (size: string) => `${size} を正常に取得しました`,
        byteSize: 'データサイズ',
        detectedAs: (t: DetectedResourceType) =>
          t === 'css' ? '自動判定: CSS (<link>)' : '自動判定: JavaScript (<script>)',
        resultIntegrityAttr: 'integrity 属性',
        resultRawHash: 'SRI ハッシュ値',
        resultHtmlTag: 'HTML タグ例',
        allAlgorithmsTitle: '全アルゴリズム一覧',
        copyAttr: '属性をコピー',
        copyHash: 'ハッシュをコピー',
        copyTag: 'タグをコピー',
        emptyHint: '上でテキストを貼り付けるか CDN URL を取得すると、SRI ハッシュと HTML タグが生成されます。',
        aboutTitle: 'Subresource Integrity (SRI) とは？',
        aboutDesc:
          'SRI は CDN から読み込む外部ファイルが改ざんされていないかをブラウザ側で検証する仕組みです。クロスオリジンの <script> / <link> タグには crossorigin="anonymous" を併用してください。',
      }
    }
    return {
      modeText: '粘贴文件内容',
      modeUrl: '输入 CDN URL',
      algorithmLabel: '哈希算法',
      recommended: '推荐默认',
      resourceTypeLabel: '引入标签类型',
      typeAuto: '自动识别',
      typeJs: 'JavaScript (<script>)',
      typeCss: 'CSS (<link>)',
      textLabel: '资源文件内容（JS / CSS 或任意文本）',
      textPlaceholder: '在此粘贴 JS / CSS 文件内容，或输入任意文本（如 hello）实时计算...',
      fillSample: '填入示例',
      clear: '清空',
      urlLabel: 'CDN 资源 URL',
      urlPlaceholder: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
      fetchBtn: '获取并计算',
      fetching: '获取中...',
      urlTip:
        '通过浏览器端 fetch 直接拉取资源。若目标服务器未开启 CORS 跨域头导致获取失败，请改用「粘贴文件内容」模式。',
      switchToPaste: '改用粘贴方式',
      invalidUrl: '请输入有效的 http:// 或 https:// 资源地址。',
      fetchHttpError: (status: number, statusText: string) =>
        `获取资源失败（HTTP ${status} ${statusText}）。请检查 URL 是否可访问，或建议改用「粘贴文件内容」方式计算。`,
      fetchNetworkError:
        '浏览器端获取该 URL 失败（常见原因为目标站点未允许 CORS 跨域访问或网络异常）。建议打开该链接复制内容后，改用「粘贴文件内容」方式计算。',
      cryptoUnavailable:
        '当前浏览器上下文不支持 Web Crypto API（crypto.subtle），请在 HTTPS 或 localhost 环境下使用。',
      fetchedSuccess: (size: string) => `已成功获取资源（${size}）`,
      byteSize: '内容大小',
      detectedAs: (t: DetectedResourceType) =>
        t === 'css' ? '自动识别：CSS (<link>)' : '自动识别：JavaScript (<script>)',
      resultIntegrityAttr: 'integrity 属性',
      resultRawHash: 'SRI 哈希值',
      resultHtmlTag: '完整 HTML 引入标签示例',
      allAlgorithmsTitle: '全部算法哈希对比',
      copyAttr: '复制属性',
      copyHash: '复制哈希',
      copyTag: '复制标签',
      emptyHint: '请在上方粘贴文件内容或获取 CDN URL，即可实时生成 SRI integrity 哈希与引入标签。',
      aboutTitle: '什么是子资源完整性 (SRI)？',
      aboutDesc:
        'Subresource Integrity (SRI) 允许浏览器校验从 CDN 加载的 JS/CSS 文件是否被篡改。跨域引入时建议始终配合 crossorigin="anonymous" 属性使用。',
    }
  }, [language])

  const activeBytes = useMemo(() => {
    if (mode === 'text') {
      if (!textInput) return null
      return new TextEncoder().encode(textInput)
    }
    return fetchedBytes
  }, [mode, textInput, fetchedBytes])

  useEffect(() => {
    let cancelled = false

    if (!activeBytes) {
      setHashes(null)
      setHashError(null)
      return
    }

    ;(async () => {
      try {
        const [sha256, sha384, sha512] = await Promise.all([
          computeSriHash(activeBytes, 'SHA-256'),
          computeSriHash(activeBytes, 'SHA-384'),
          computeSriHash(activeBytes, 'SHA-512'),
        ])
        if (!cancelled) {
          setHashes({
            'SHA-256': sha256,
            'SHA-384': sha384,
            'SHA-512': sha512,
          })
          setHashError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setHashes(null)
          if (err instanceof Error && err.message === 'WEB_CRYPTO_UNAVAILABLE') {
            setHashError(ui.cryptoUnavailable)
          } else {
            setHashError(err instanceof Error ? err.message : String(err))
          }
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [activeBytes, ui.cryptoUnavailable])

  const handleFetchUrl = async () => {
    const trimmed = urlInput.trim()
    setFetchError(null)

    let parsed: URL
    try {
      parsed = new URL(trimmed)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('invalid protocol')
      }
    } catch {
      setFetchError(ui.invalidUrl)
      return
    }

    setIsFetching(true)
    try {
      const response = await fetch(parsed.href, { mode: 'cors' })
      if (!response.ok) {
        setFetchedBytes(null)
        setFetchedUrl('')
        setFetchedContentType(null)
        setFetchError(ui.fetchHttpError(response.status, response.statusText))
        return
      }
      const buffer = await response.arrayBuffer()
      setFetchedBytes(new Uint8Array(buffer))
      setFetchedUrl(parsed.href)
      setFetchedContentType(response.headers.get('content-type'))
    } catch {
      setFetchedBytes(null)
      setFetchedUrl('')
      setFetchedContentType(null)
      setFetchError(ui.fetchNetworkError)
    } finally {
      setIsFetching(false)
    }
  }

  const detectedType: DetectedResourceType = useMemo(() => {
    if (resourceTypeMode !== 'auto') return resourceTypeMode
    if (mode === 'url') {
      return detectResourceTypeFromUrl(fetchedUrl || urlInput, fetchedContentType)
    }
    return detectResourceTypeFromText(textInput)
  }, [resourceTypeMode, mode, fetchedUrl, urlInput, fetchedContentType, textInput])

  const selectedHash = hashes ? hashes[algorithm] : ''
  const integrityAttr = selectedHash ? `integrity="${selectedHash}"` : ''
  const htmlTag = selectedHash
    ? buildHtmlTag(detectedType, selectedHash, mode === 'url' ? fetchedUrl || urlInput : '')
    : ''

  return (
    <ToolPage
      title="SRI Hash 生成器"
      description="为 CDN 引入的 JS/CSS 资源生成 Subresource Integrity (SRI) 完整性哈希与 HTML 标签"
    >
      <div className="card p-6 flex flex-col gap-6">
        {/* 模式切换与参数选择 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-900 p-1 border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'text'
                  ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              {ui.modeText}
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'url'
                  ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              {ui.modeUrl}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {ui.algorithmLabel}:
              </label>
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 border border-gray-200 dark:border-gray-800">
                {ALGORITHMS.map(alg => (
                  <button
                    key={alg.id}
                    type="button"
                    onClick={() => setAlgorithm(alg.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                      algorithm === alg.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {alg.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="sri-resource-type"
                className="text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {ui.resourceTypeLabel}:
              </label>
              <select
                id="sri-resource-type"
                value={resourceTypeMode}
                onChange={e => setResourceTypeMode(e.target.value as ResourceTypeMode)}
                className="select-field text-sm"
              >
                <option value="auto">{ui.typeAuto}</option>
                <option value="js">{ui.typeJs}</option>
                <option value="css">{ui.typeCss}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 输入区 */}
        {mode === 'text' ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="sri-text-input" className="font-semibold text-sm">
                {ui.textLabel}
              </label>
              <div className="flex items-center gap-2">
                {activeBytes && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {ui.byteSize}: {formatBytes(activeBytes.byteLength)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setTextInput(SAMPLE_JS)}
                  className="btn-ghost btn-sm text-xs"
                >
                  {ui.fillSample}
                </button>
                <button
                  type="button"
                  onClick={() => setTextInput('')}
                  disabled={!textInput}
                  className="btn-ghost btn-sm text-xs inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {ui.clear}
                </button>
              </div>
            </div>
            <textarea
              id="sri-text-input"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={ui.textPlaceholder}
              rows={6}
              className="input-field font-mono text-sm resize-y"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
            <label htmlFor="sri-url-input" className="font-semibold text-sm">
              {ui.urlLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="sri-url-input"
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleFetchUrl()
                  }
                }}
                placeholder={ui.urlPlaceholder}
                className="input-field font-mono text-sm flex-1"
              />
              <button
                type="button"
                onClick={handleFetchUrl}
                disabled={isFetching || !urlInput.trim()}
                className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {ui.fetching}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    {ui.fetchBtn}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{ui.urlTip}</p>

            {fetchError && (
              <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{fetchError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('text')
                    setFetchError(null)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 text-xs font-medium whitespace-nowrap transition-colors"
                >
                  {ui.switchToPaste}
                </button>
              </div>
            )}

            {fetchedBytes && !fetchError && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{ui.fetchedSuccess(formatBytes(fetchedBytes.byteLength))}</span>
              </div>
            )}
          </div>
        )}

        {hashError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{hashError}</span>
          </div>
        )}

        {/* 结果区 */}
        {selectedHash ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* integrity 属性 */}
              <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-900">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-brand-700 dark:text-brand-300 text-sm">
                    {ui.resultIntegrityAttr} ({algorithm})
                  </label>
                  <CopyButton text={integrityAttr} label={ui.copyAttr} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={integrityAttr}
                  className="input-field font-mono text-sm"
                />
              </div>

              {/* 纯哈希值 */}
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-purple-700 dark:text-purple-300 text-sm">
                    {ui.resultRawHash} ({algorithm})
                  </label>
                  <CopyButton text={selectedHash} label={ui.copyHash} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={selectedHash}
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>

            {/* 完整 HTML 标签 */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
                    {ui.resultHtmlTag}
                  </label>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    {ui.detectedAs(detectedType)}
                  </span>
                </div>
                <CopyButton text={htmlTag} label={ui.copyTag} />
              </div>
              <pre className="p-3 rounded-lg bg-white/80 dark:bg-gray-950/80 border border-emerald-200/80 dark:border-emerald-900/60 font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap break-all select-all">
                {htmlTag}
              </pre>
            </div>

            {/* 全部算法对比 */}
            {hashes && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {ui.allAlgorithmsTitle}
                </div>
                <div className="flex flex-col gap-2">
                  {ALGORITHMS.map(alg => {
                    const val = hashes[alg.id]
                    const isSelected = alg.id === algorithm
                    return (
                      <div
                        key={alg.id}
                        className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg border ${
                          isSelected
                            ? 'bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800'
                            : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-[110px]">
                          <span className="font-mono text-xs font-bold">{alg.id}</span>
                          {alg.id === 'SHA-384' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
                              {ui.recommended}
                            </span>
                          )}
                        </div>
                        <code className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all flex-1">
                          {val}
                        </code>
                        <CopyButton text={`integrity="${val}"`} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            {ui.emptyHint}
          </div>
        )}

        {/* 说明卡片 */}
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <div className="font-semibold mb-1">{ui.aboutTitle}</div>
          <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">{ui.aboutDesc}</p>
        </div>
      </div>
    </ToolPage>
  )
}
