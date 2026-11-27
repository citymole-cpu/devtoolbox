import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { CodeEditor } from '../../components/CodeEditor'
import { useI18n } from '../../components/I18nProvider'
import { AlertCircle, CheckCircle2, Download, RotateCcw, SlidersHorizontal, Trash2 } from 'lucide-react'

const CHANGEFREQ_OPTIONS = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
] as const

type ChangeFreq = (typeof CHANGEFREQ_OPTIONS)[number]

const PRIORITY_OPTIONS = [
  '1.0',
  '0.9',
  '0.8',
  '0.7',
  '0.6',
  '0.5',
  '0.4',
  '0.3',
  '0.2',
  '0.1',
  '0.0',
] as const

interface UrlOverride {
  changefreq?: ChangeFreq
  priority?: string
}

interface ParsedUrlsResult {
  validUrls: string[]
  invalidEntries: { line: number; raw: string }[]
  duplicateCount: number
}

const SAMPLE_URLS = [
  'https://example.com/',
  'https://example.com/about',
  'https://example.com/blog',
  'https://example.com/blog/sitemap-guide',
  'https://example.com/contact',
].join('\n')

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function isValidHttpUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    if (!parsed.hostname || !parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
      return null
    }
    return parsed.href
  } catch {
    return null
  }
}

function parseUrlLines(input: string): ParsedUrlsResult {
  const lines = input.split(/\r?\n/)
  const seen = new Set<string>()
  const validUrls: string[] = []
  const invalidEntries: { line: number; raw: string }[] = []
  let duplicateCount = 0

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return

    const normalized = isValidHttpUrl(trimmed)
    if (!normalized) {
      invalidEntries.push({ line: idx + 1, raw: trimmed })
      return
    }

    if (seen.has(normalized)) {
      duplicateCount += 1
      return
    }

    seen.add(normalized)
    validUrls.push(normalized)
  })

  return { validUrls, invalidEntries, duplicateCount }
}

function getTodayIsoDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function generateSitemapXml(
  urls: string[],
  defaultChangefreq: ChangeFreq,
  defaultPriority: string,
  overrides: Record<string, UrlOverride>,
  includeLastmod: boolean,
  lastmodDate: string,
): string {
  if (urls.length === 0) return ''

  const items = urls.map(url => {
    const override = overrides[url]
    const changefreq = override?.changefreq ?? defaultChangefreq
    const priority = override?.priority ?? defaultPriority
    const lines = [
      '  <url>',
      `    <loc>${escapeXml(url)}</loc>`,
    ]
    if (includeLastmod && lastmodDate.trim()) {
      lines.push(`    <lastmod>${escapeXml(lastmodDate.trim())}</lastmod>`)
    }
    lines.push(`    <changefreq>${changefreq}</changefreq>`)
    lines.push(`    <priority>${priority}</priority>`)
    lines.push('  </url>')
    return lines.join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...items,
    '</urlset>',
  ].join('\n')
}

export default function SitemapGenerator() {
  const { language } = useI18n()
  const [urlInput, setUrlInput] = useState(SAMPLE_URLS)
  const [defaultChangefreq, setDefaultChangefreq] = useState<ChangeFreq>('weekly')
  const [defaultPriority, setDefaultPriority] = useState<string>('0.8')
  const [includeLastmod, setIncludeLastmod] = useState<boolean>(false)
  const [lastmodDate, setLastmodDate] = useState<string>(getTodayIsoDate)
  const [overrides, setOverrides] = useState<Record<string, UrlOverride>>({})
  const [showOverrides, setShowOverrides] = useState<boolean>(false)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        inputTitle: 'URL List (one per line)',
        urlPlaceholder: 'https://example.com/\nhttps://example.com/about\nhttps://example.com/blog',
        loadSample: 'Load Sample',
        clearAll: 'Clear',
        globalSettings: 'Global Defaults',
        defaultChangefreq: 'Default changefreq',
        defaultPriority: 'Default priority',
        includeLastmod: 'Include lastmod date',
        lastmodDate: 'Last modified date',
        validCount: 'Valid URLs',
        duplicateCount: 'Duplicates removed',
        invalidCount: 'Invalid URLs',
        invalidTitle: 'Invalid URL lines (skipped):',
        linePrefix: 'Line',
        overrideToggle: 'Per-URL Overrides',
        resetOverrides: 'Reset Overrides',
        defaultOption: 'Default',
        urlCol: 'URL',
        freqCol: 'changefreq',
        priorityCol: 'priority',
        outputTitle: 'Generated sitemap.xml',
        copyXml: 'Copy XML',
        downloadXml: 'Download sitemap.xml',
        emptyHint: 'Enter at least one valid http:// or https:// URL on the left to generate sitemap.xml in real time.',
      }
    }
    if (language === 'ja-JP') {
      return {
        inputTitle: 'URL リスト（1行に1つ）',
        urlPlaceholder: 'https://example.com/\nhttps://example.com/about\nhttps://example.com/blog',
        loadSample: 'サンプル読込',
        clearAll: 'クリア',
        globalSettings: 'グローバル既定値',
        defaultChangefreq: '既定の changefreq',
        defaultPriority: '既定の priority',
        includeLastmod: 'lastmod 日付を含める',
        lastmodDate: '最終更新日 (lastmod)',
        validCount: '有効な URL',
        duplicateCount: '重複除外',
        invalidCount: '無効な URL',
        invalidTitle: '無効な URL 行（スキップされました）:',
        linePrefix: '行',
        overrideToggle: 'URL ごとの個別設定',
        resetOverrides: '個別設定をリセット',
        defaultOption: '既定値',
        urlCol: 'URL',
        freqCol: 'changefreq',
        priorityCol: 'priority',
        outputTitle: '生成された sitemap.xml',
        copyXml: 'XML をコピー',
        downloadXml: 'sitemap.xml をダウンロード',
        emptyHint: '左側に有効な http:// または https:// URL を入力すると sitemap.xml がリアルタイムで生成されます。',
      }
    }
    return {
      inputTitle: 'URL 列表（每行一个）',
      urlPlaceholder: 'https://example.com/\nhttps://example.com/about\nhttps://example.com/blog',
      loadSample: '填入示例',
      clearAll: '清空',
      globalSettings: '全局默认配置',
      defaultChangefreq: '默认更新频率 (changefreq)',
      defaultPriority: '默认权重 (priority)',
      includeLastmod: '包含最后修改日期 (lastmod)',
      lastmodDate: '最后修改日期',
      validCount: '有效 URL',
      duplicateCount: '已去重',
      invalidCount: '非法 URL',
      invalidTitle: '以下行不是合法的 http/https URL（已跳过）：',
      linePrefix: '第',
      overrideToggle: '单条 URL 独立覆盖配置',
      resetOverrides: '重置覆盖',
      defaultOption: '使用默认',
      urlCol: 'URL',
      freqCol: 'changefreq',
      priorityCol: 'priority',
      outputTitle: '生成的 sitemap.xml',
      copyXml: '复制 XML',
      downloadXml: '下载 sitemap.xml',
      emptyHint: '请在左侧输入至少一条合法的 http:// 或 https:// URL，将实时生成标准 sitemap.xml。',
    }
  }, [language])

  const parsed = useMemo(() => parseUrlLines(urlInput), [urlInput])

  const generatedXml = useMemo(
    () =>
      generateSitemapXml(
        parsed.validUrls,
        defaultChangefreq,
        defaultPriority,
        overrides,
        includeLastmod,
        lastmodDate,
      ),
    [parsed.validUrls, defaultChangefreq, defaultPriority, overrides, includeLastmod, lastmodDate],
  )

  const activeOverrideCount = useMemo(() => {
    const validSet = new Set(parsed.validUrls)
    return Object.entries(overrides).filter(
      ([url, ov]) => validSet.has(url) && (ov.changefreq !== undefined || ov.priority !== undefined),
    ).length
  }, [overrides, parsed.validUrls])

  const updateUrlOverride = (url: string, field: 'changefreq' | 'priority', value: string) => {
    setOverrides(prev => {
      const current = prev[url] ?? {}
      const next: UrlOverride = { ...current }
      if (!value) {
        delete next[field]
      } else if (field === 'changefreq') {
        next.changefreq = value as ChangeFreq
      } else {
        next.priority = value
      }
      if (!next.changefreq && !next.priority) {
        const copy = { ...prev }
        delete copy[url]
        return copy
      }
      return { ...prev, [url]: next }
    })
  }

  const handleDownload = () => {
    if (!generatedXml) return
    const blob = new Blob([`${generatedXml}\n`], { type: 'application/xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = 'sitemap.xml'
    link.click()
    URL.revokeObjectURL(blobUrl)
  }

  const handleLoadSample = () => {
    setUrlInput(SAMPLE_URLS)
    setOverrides({
      'https://example.com/': { changefreq: 'daily', priority: '1.0' },
    })
  }

  const handleClear = () => {
    setUrlInput('')
    setOverrides({})
  }

  return (
    <ToolPage
      title="Sitemap 生成器"
      description="批量输入 URL 自动去重校验，实时生成标准 sitemap.xml，支持配置更新频率与权重并一键复制下载"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: URL Input & Settings */}
        <div className="lg:col-span-6 card p-5 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{ui.inputTitle}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleLoadSample} className="btn-secondary text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                {ui.loadSample}
              </button>
              <button type="button" onClick={handleClear} className="btn-secondary text-xs">
                <Trash2 className="w-3.5 h-3.5" />
                {ui.clearAll}
              </button>
            </div>
          </div>

          <CodeEditor
            value={urlInput}
            onChange={setUrlInput}
            placeholder={ui.urlPlaceholder}
            minHeight="210px"
            wrap={false}
          />

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {ui.validCount}: {parsed.validUrls.length}
            </span>
            {parsed.duplicateCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                {ui.duplicateCount}: {parsed.duplicateCount}
              </span>
            )}
            {parsed.invalidEntries.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                <AlertCircle className="w-3.5 h-3.5" />
                {ui.invalidCount}: {parsed.invalidEntries.length}
              </span>
            )}
          </div>

          {/* Invalid URL Warnings */}
          {parsed.invalidEntries.length > 0 && (
            <div className="p-3 rounded-lg bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {ui.invalidTitle}
              </div>
              <ul className="space-y-0.5 max-h-28 overflow-y-auto font-mono">
                {parsed.invalidEntries.map(item => (
                  <li key={`${item.line}-${item.raw}`} className="truncate">
                    {language === 'zh-CN' ? `${ui.linePrefix} ${item.line} 行` : `${ui.linePrefix} ${item.line}`}: {item.raw}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Global Default Settings */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
              {ui.globalSettings}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {ui.defaultChangefreq}
                </label>
                <select
                  value={defaultChangefreq}
                  onChange={e => setDefaultChangefreq(e.target.value as ChangeFreq)}
                  className="select-field w-full text-sm"
                >
                  {CHANGEFREQ_OPTIONS.map(freq => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {ui.defaultPriority}
                </label>
                <select
                  value={defaultPriority}
                  onChange={e => setDefaultPriority(e.target.value)}
                  className="select-field w-full text-sm"
                >
                  {PRIORITY_OPTIONS.map(prio => (
                    <option key={prio} value={prio}>
                      {prio}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeLastmod}
                  onChange={e => setIncludeLastmod(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
                />
                {ui.includeLastmod}
              </label>
              {includeLastmod && (
                <input
                  type="date"
                  value={lastmodDate}
                  onChange={e => setLastmodDate(e.target.value)}
                  aria-label={ui.lastmodDate}
                  className="input-field text-xs py-1 px-2.5 w-auto"
                />
              )}
            </div>
          </div>

          {/* Per-URL Optional Overrides */}
          {parsed.validUrls.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/60">
                <button
                  type="button"
                  onClick={() => setShowOverrides(prev => !prev)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {ui.overrideToggle}
                  {activeOverrideCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-[11px]">
                      {activeOverrideCount}
                    </span>
                  )}
                </button>
                {activeOverrideCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setOverrides({})}
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {ui.resetOverrides}
                  </button>
                )}
              </div>

              {showOverrides && (
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {parsed.validUrls.map(url => {
                    const ov = overrides[url]
                    return (
                      <div key={url} className="px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                        <span className="font-mono text-gray-700 dark:text-gray-300 truncate flex-1" title={url}>
                          {url}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            aria-label={`${ui.freqCol} ${url}`}
                            value={ov?.changefreq ?? ''}
                            onChange={e => updateUrlOverride(url, 'changefreq', e.target.value)}
                            className="select-field text-xs py-1 px-2"
                          >
                            <option value="">{ui.defaultOption} ({defaultChangefreq})</option>
                            {CHANGEFREQ_OPTIONS.map(freq => (
                              <option key={freq} value={freq}>
                                {freq}
                              </option>
                            ))}
                          </select>
                          <select
                            aria-label={`${ui.priorityCol} ${url}`}
                            value={ov?.priority ?? ''}
                            onChange={e => updateUrlOverride(url, 'priority', e.target.value)}
                            className="select-field text-xs py-1 px-2"
                          >
                            <option value="">{ui.defaultOption} ({defaultPriority})</option>
                            {PRIORITY_OPTIONS.map(prio => (
                              <option key={prio} value={prio}>
                                {prio}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: XML Preview */}
        <div className="lg:col-span-6 card p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{ui.outputTitle}</h2>
            <div className="flex items-center gap-2">
              <CopyButton text={generatedXml} label={ui.copyXml} />
              <button
                type="button"
                onClick={handleDownload}
                disabled={!generatedXml}
                className="btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                {ui.downloadXml}
              </button>
            </div>
          </div>

          {generatedXml ? (
            <CodeEditor
              value={generatedXml}
              readOnly
              language="xml"
              minHeight="460px"
              wrap={false}
            />
          ) : (
            <div className="flex-1 min-h-[300px] flex items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {ui.emptyHint}
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
