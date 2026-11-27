import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { CodeEditor } from '../../components/CodeEditor'
import { useI18n } from '../../components/I18nProvider'
import { Download, RotateCcw, Trash2 } from 'lucide-react'

interface MetaFormState {
  title: string
  description: string
  url: string
  imageUrl: string
  siteName: string
  author: string
  keywords: string
  ogType: string
  twitterCard: string
  twitterHandle: string
  robots: string
  includeTwitter: boolean
  includeRobots: boolean
}

const DEFAULT_STATE: MetaFormState = {
  title: 'DevToolBox - Free Online Developer Toolbox',
  description: '142 handy online developer tools for JSON, encoding, crypto, formatting, SEO meta tags and more. Runs 100% locally in your browser.',
  url: 'https://zapbits.xyz/tools/net/meta-tags',
  imageUrl: 'https://zapbits.xyz/tools/og-image.png',
  siteName: 'DevToolBox',
  author: 'DevToolBox',
  keywords: 'developer tools, meta tags, open graph, twitter card, seo',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterHandle: '@devtoolbox',
  robots: 'index, follow',
  includeTwitter: true,
  includeRobots: true,
}

const EMPTY_STATE: MetaFormState = {
  title: '',
  description: '',
  url: '',
  imageUrl: '',
  siteName: '',
  author: '',
  keywords: '',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterHandle: '',
  robots: 'index, follow',
  includeTwitter: true,
  includeRobots: true,
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function normalizeTwitterHandle(handle: string): string {
  const trimmed = handle.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
}

function generateMetaTags(form: MetaFormState): string {
  const title = form.title.trim()
  const description = form.description.trim()
  const url = form.url.trim()
  const imageUrl = form.imageUrl.trim()
  const siteName = form.siteName.trim()
  const author = form.author.trim()
  const keywords = form.keywords.trim()
  const twitterHandle = normalizeTwitterHandle(form.twitterHandle)

  const sections: string[] = []

  // Basic SEO Meta
  const basicLines: string[] = []
  if (title) {
    basicLines.push(`<title>${escapeHtmlText(title)}</title>`)
    basicLines.push(`<meta name="title" content="${escapeAttr(title)}" />`)
  }
  if (description) {
    basicLines.push(`<meta name="description" content="${escapeAttr(description)}" />`)
  }
  if (keywords) {
    basicLines.push(`<meta name="keywords" content="${escapeAttr(keywords)}" />`)
  }
  if (author) {
    basicLines.push(`<meta name="author" content="${escapeAttr(author)}" />`)
  }
  if (form.includeRobots && form.robots) {
    basicLines.push(`<meta name="robots" content="${escapeAttr(form.robots)}" />`)
  }
  if (url) {
    basicLines.push(`<link rel="canonical" href="${escapeAttr(url)}" />`)
  }
  if (basicLines.length > 0) {
    sections.push(['<!-- Primary Meta Tags -->', ...basicLines].join('\n'))
  }

  // Open Graph
  const ogLines: string[] = []
  if (form.ogType) {
    ogLines.push(`<meta property="og:type" content="${escapeAttr(form.ogType)}" />`)
  }
  if (url) {
    ogLines.push(`<meta property="og:url" content="${escapeAttr(url)}" />`)
  }
  if (title) {
    ogLines.push(`<meta property="og:title" content="${escapeAttr(title)}" />`)
  }
  if (description) {
    ogLines.push(`<meta property="og:description" content="${escapeAttr(description)}" />`)
  }
  if (imageUrl) {
    ogLines.push(`<meta property="og:image" content="${escapeAttr(imageUrl)}" />`)
  }
  if (siteName) {
    ogLines.push(`<meta property="og:site_name" content="${escapeAttr(siteName)}" />`)
  }
  if (ogLines.length > 0) {
    sections.push(['<!-- Open Graph / Facebook -->', ...ogLines].join('\n'))
  }

  // Twitter Card
  if (form.includeTwitter) {
    const twLines: string[] = []
    if (form.twitterCard) {
      twLines.push(`<meta name="twitter:card" content="${escapeAttr(form.twitterCard)}" />`)
    }
    if (url) {
      twLines.push(`<meta name="twitter:url" content="${escapeAttr(url)}" />`)
    }
    if (title) {
      twLines.push(`<meta name="twitter:title" content="${escapeAttr(title)}" />`)
    }
    if (description) {
      twLines.push(`<meta name="twitter:description" content="${escapeAttr(description)}" />`)
    }
    if (imageUrl) {
      twLines.push(`<meta name="twitter:image" content="${escapeAttr(imageUrl)}" />`)
    }
    if (twitterHandle) {
      twLines.push(`<meta name="twitter:site" content="${escapeAttr(twitterHandle)}" />`)
      twLines.push(`<meta name="twitter:creator" content="${escapeAttr(twitterHandle)}" />`)
    }
    if (twLines.length > 0) {
      sections.push(['<!-- Twitter Card -->', ...twLines].join('\n'))
    }
  }

  return sections.join('\n\n')
}

export default function MetaTagsGenerator() {
  const { language } = useI18n()
  const [form, setForm] = useState<MetaFormState>(DEFAULT_STATE)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        basicSection: 'Basic Information',
        socialSection: 'Open Graph & Twitter Options',
        titleLabel: 'Page Title',
        titlePlaceholder: 'e.g. My Awesome Site - Home',
        descLabel: 'Description',
        descPlaceholder: 'Concise summary of the page (recommended 120–160 chars)',
        urlLabel: 'Page URL',
        urlPlaceholder: 'https://example.com/page',
        imageLabel: 'Image URL (OG / Twitter)',
        imagePlaceholder: 'https://example.com/og-image.png',
        siteNameLabel: 'Site Name',
        siteNamePlaceholder: 'e.g. MyBrand',
        authorLabel: 'Author',
        authorPlaceholder: 'e.g. Jane Doe',
        keywordsLabel: 'Keywords (comma-separated)',
        keywordsPlaceholder: 'seo, meta tags, web',
        ogTypeLabel: 'og:type',
        twitterHandleLabel: 'Twitter Handle',
        twitterHandlePlaceholder: '@username',
        twitterCardLabel: 'Twitter Card Type',
        robotsLabel: 'Robots Directive',
        includeTwitter: 'Include Twitter Card tags',
        includeRobots: 'Include robots meta tag',
        loadSample: 'Load Sample',
        clearAll: 'Clear',
        outputTitle: 'Generated HTML Meta Tags',
        copyCode: 'Copy Code',
        downloadHtml: 'Download HTML',
        chars: 'chars',
        emptyHint: 'Fill in the fields on the left to generate <meta> tags in real time.',
      }
    }
    if (language === 'ja-JP') {
      return {
        basicSection: '基本情報',
        socialSection: 'Open Graph・Twitter 設定',
        titleLabel: 'ページタイトル',
        titlePlaceholder: '例: サイト名 - トップページ',
        descLabel: 'ページ説明文 (Description)',
        descPlaceholder: 'ページの簡潔な説明（120〜160文字推奨）',
        urlLabel: 'ページ URL',
        urlPlaceholder: 'https://example.com/page',
        imageLabel: '画像 URL (OGP / Twitter)',
        imagePlaceholder: 'https://example.com/og-image.png',
        siteNameLabel: 'サイト名',
        siteNamePlaceholder: '例: MyBrand',
        authorLabel: '作成者 (Author)',
        authorPlaceholder: '例: 山田太郎',
        keywordsLabel: 'キーワード（カンマ区切り）',
        keywordsPlaceholder: 'seo, meta, ogp',
        ogTypeLabel: 'og:type',
        twitterHandleLabel: 'Twitter アカウント',
        twitterHandlePlaceholder: '@username',
        twitterCardLabel: 'Twitter カード形式',
        robotsLabel: 'Robots 設定',
        includeTwitter: 'Twitter Card タグを含める',
        includeRobots: 'robots メタタグを含める',
        loadSample: 'サンプル読込',
        clearAll: 'クリア',
        outputTitle: '生成された HTML Meta タグ',
        copyCode: 'コードをコピー',
        downloadHtml: 'HTML をダウンロード',
        chars: '文字',
        emptyHint: '左側のフォームに入力すると <meta> タグがリアルタイムで生成されます。',
      }
    }
    return {
      basicSection: '基础信息',
      socialSection: 'Open Graph 与 Twitter 选项',
      titleLabel: '页面标题 (Title)',
      titlePlaceholder: '例如：DevToolBox - 免费在线开发者工具箱',
      descLabel: '页面描述 (Description)',
      descPlaceholder: '简要概括页面内容（建议 120–160 字符）',
      urlLabel: '页面 URL',
      urlPlaceholder: 'https://example.com/page',
      imageLabel: '分享图片 URL (OG / Twitter)',
      imagePlaceholder: 'https://example.com/og-image.png',
      siteNameLabel: '网站名称 (Site Name)',
      siteNamePlaceholder: '例如：DevToolBox',
      authorLabel: '作者 (Author)',
      authorPlaceholder: '例如：张三',
      keywordsLabel: '关键词 (逗号分隔)',
      keywordsPlaceholder: 'seo, meta标签, open graph',
      ogTypeLabel: 'og:type 类型',
      twitterHandleLabel: 'Twitter 账号',
      twitterHandlePlaceholder: '@username',
      twitterCardLabel: 'Twitter Card 类型',
      robotsLabel: 'Robots 爬虫指令',
      includeTwitter: '包含 Twitter Card 标签',
      includeRobots: '包含 robots 标签',
      loadSample: '加载示例',
      clearAll: '清空',
      outputTitle: '生成的 HTML Meta 标签片段',
      copyCode: '复制代码',
      downloadHtml: '下载 HTML 片段',
      chars: '字符',
      emptyHint: '在左侧输入标题、描述或 URL，将实时生成标准 <meta> 标签代码。',
    }
  }, [language])

  const updateField = <K extends keyof MetaFormState>(key: K, value: MetaFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const generatedHtml = useMemo(() => generateMetaTags(form), [form])

  const handleDownload = () => {
    if (!generatedHtml) return
    const blob = new Blob([`${generatedHtml}\n`], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = 'meta-tags.html'
    link.click()
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <ToolPage
      title="Meta 标签生成器"
      description="在线生成基础 SEO、Open Graph 与 Twitter Card Meta 标签，支持实时预览与一键复制下载"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-6 card p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {ui.basicSection}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm(DEFAULT_STATE)}
                className="btn-ghost btn-sm inline-flex items-center gap-1 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{ui.loadSample}</span>
              </button>
              <button
                type="button"
                onClick={() => setForm(EMPTY_STATE)}
                className="btn-ghost btn-sm inline-flex items-center gap-1 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{ui.clearAll}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {ui.titleLabel}
                </label>
                <span className="text-xs text-gray-400">
                  {form.title.length} {ui.chars}
                </span>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder={ui.titlePlaceholder}
                className="input-field text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {ui.descLabel}
                </label>
                <span className="text-xs text-gray-400">
                  {form.description.length} {ui.chars}
                </span>
              </div>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder={ui.descPlaceholder}
                className="input-field text-sm resize-y"
              />
            </div>

            {/* URL & Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {ui.urlLabel}
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={e => updateField('url', e.target.value)}
                  placeholder={ui.urlPlaceholder}
                  className="input-field text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {ui.imageLabel}
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => updateField('imageUrl', e.target.value)}
                  placeholder={ui.imagePlaceholder}
                  className="input-field text-sm font-mono"
                />
              </div>
            </div>

            {/* Site Name & Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {ui.siteNameLabel}
                </label>
                <input
                  type="text"
                  value={form.siteName}
                  onChange={e => updateField('siteName', e.target.value)}
                  placeholder={ui.siteNamePlaceholder}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {ui.authorLabel}
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={e => updateField('author', e.target.value)}
                  placeholder={ui.authorPlaceholder}
                  className="input-field text-sm"
                />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {ui.keywordsLabel}
              </label>
              <input
                type="text"
                value={form.keywords}
                onChange={e => updateField('keywords', e.target.value)}
                placeholder={ui.keywordsPlaceholder}
                className="input-field text-sm"
              />
            </div>

            {/* Social & Crawl Options */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {ui.socialSection}
              </h3>

              {/* Toggle switches */}
              <div className="flex flex-wrap items-center gap-5">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.includeTwitter}
                    onChange={e => updateField('includeTwitter', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
                  />
                  <span>{ui.includeTwitter}</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.includeRobots}
                    onChange={e => updateField('includeRobots', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
                  />
                  <span>{ui.includeRobots}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {ui.ogTypeLabel}
                  </label>
                  <select
                    value={form.ogType}
                    onChange={e => updateField('ogType', e.target.value)}
                    className="select-field w-full text-sm"
                  >
                    <option value="website">website</option>
                    <option value="article">article</option>
                    <option value="product">product</option>
                    <option value="profile">profile</option>
                  </select>
                </div>

                {form.includeRobots && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {ui.robotsLabel}
                    </label>
                    <select
                      value={form.robots}
                      onChange={e => updateField('robots', e.target.value)}
                      className="select-field w-full text-sm"
                    >
                      <option value="index, follow">index, follow</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="index, nofollow">index, nofollow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                )}

                {form.includeTwitter && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {ui.twitterCardLabel}
                      </label>
                      <select
                        value={form.twitterCard}
                        onChange={e => updateField('twitterCard', e.target.value)}
                        className="select-field w-full text-sm"
                      >
                        <option value="summary_large_image">summary_large_image</option>
                        <option value="summary">summary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {ui.twitterHandleLabel}
                      </label>
                      <input
                        type="text"
                        value={form.twitterHandle}
                        onChange={e => updateField('twitterHandle', e.target.value)}
                        placeholder={ui.twitterHandlePlaceholder}
                        className="input-field text-sm font-mono"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Generated Code */}
        <div className="lg:col-span-6 card p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {ui.outputTitle}
            </h2>
            <div className="flex items-center gap-2">
              <CopyButton text={generatedHtml} label={ui.copyCode} />
              <button
                type="button"
                onClick={handleDownload}
                disabled={!generatedHtml}
                className="btn-primary btn-sm inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{ui.downloadHtml}</span>
              </button>
            </div>
          </div>

          <CodeEditor
            value={generatedHtml}
            readOnly
            placeholder={ui.emptyHint}
            minHeight="480px"
            className="flex-1 text-xs leading-relaxed"
          />
        </div>
      </div>
    </ToolPage>
  )
}
