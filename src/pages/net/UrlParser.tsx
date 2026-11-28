import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  mergeQueryParams,
  parseUrl,
  rebuildUrlWithQueryParams,
  type QueryParamEntry,
  type UrlParseError,
} from '../../lib/urlParser'
import {
  AlertCircle,
  ArrowUpRight,
  Link as LinkIcon,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react'

interface UrlPreset {
  id: string
  url: string
}

const PRESETS: UrlPreset[] = [
  {
    id: 'port',
    url: 'https://api.example.com:8443/v2/projects/42/deployments?env=prod&tag=web&tag=v2#logs',
  },
  {
    id: 'auth',
    url: 'postgresql://admin:demoPass123@db.internal.local:5432/analytics?sslmode=require&timeout=30',
  },
  {
    id: 'chinese',
    url: 'https://search.example.org/docs/指南/快速开始?关键词=前端开发&分类=工具&标签=URL&标签=解析器#使用说明',
  },
  {
    id: 'ipv6',
    url: 'http://[2001:db8:85a3::8a2e:370:7334]:8080/api/v1/status?format=json&verbose=true#health',
  },
]

const DEFAULT_URL = PRESETS[0].url

interface FieldCardProps {
  label: string
  value: string
  subValue?: string
  badge?: string
  emptyText: string
}

function FieldCard({ label, value, subValue, badge, emptyText }: FieldCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200/80 dark:border-gray-800 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
          {badge && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-medium">
              {badge}
            </span>
          )}
        </div>
        <CopyButton text={value} className="!px-1.5 !py-0.5 text-xs flex-shrink-0" />
      </div>
      <div
        className={`text-sm font-mono break-all ${
          value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600 italic'
        }`}
      >
        {value || emptyText}
      </div>
      {subValue && subValue !== value && (
        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
          {subValue}
        </div>
      )}
    </div>
  )
}

export default function UrlParser() {
  const { language } = useI18n()
  const [urlInput, setUrlInput] = useState(DEFAULT_URL)
  const [editedParams, setEditedParams] = useState<QueryParamEntry[] | null>(null)
  const [nextRowId, setNextRowId] = useState(1000)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        inputLabel: 'URL Input',
        inputPlaceholder: 'Paste any URL, e.g. https://example.com:8080/path?foo=bar#section',
        loadSample: 'Load Sample',
        clear: 'Clear',
        presetsLabel: 'Quick Presets:',
        presetNames: {
          port: 'With Port',
          auth: 'With Auth',
          chinese: 'Chinese Params',
          ipv6: 'IPv6 Host',
        } as Record<string, string>,
        emptyHint: 'Paste or type a URL above to inspect its protocol, host, port, path segments, query parameters, and fragment.',
        overviewTitle: 'URL Components',
        protocol: 'Protocol',
        origin: 'Origin',
        username: 'Username',
        password: 'Password',
        hostname: 'Hostname',
        port: 'Port',
        portExplicit: 'Explicit',
        portDefault: 'Default',
        pathname: 'Path',
        hash: 'Fragment (Hash)',
        emptyValue: '(empty)',
        pathSegmentsTitle: 'Path Segments',
        noSegments: 'Root path (no segments)',
        queryTitle: 'Query Parameters',
        mergedTitle: 'Merged View (Duplicate Keys Grouped)',
        editableTitle: 'Editable Query Parameters (Rebuild URL)',
        addParam: 'Add Parameter',
        resetParams: 'Reset Edits',
        keyCol: 'Key',
        valueCol: 'Value',
        actionCol: 'Action',
        keyPlaceholder: 'Parameter key',
        valuePlaceholder: 'Parameter value',
        noParams: 'No query parameters in this URL.',
        rebuiltTitle: 'Rebuilt Full URL',
        rebuiltModified: 'Modified',
        applyToInput: 'Apply to Input',
        copyFullUrl: 'Copy URL',
        clientOnlyNote: '100% client-side parsing — your URLs and credentials are never sent to any server.',
        duplicateBadge: (n: number) => `${n} values`,
        errors: {
          whitespace: 'Invalid URL: contains spaces, tabs, or line breaks. Please remove whitespace or percent-encode spaces as %20.',
          missing_protocol: 'Invalid URL: missing protocol/scheme. Add a prefix such as https:// or http://.',
          invalid_protocol: (d?: string) =>
            `Invalid protocol${d ? ` ("${d}")` : ''}: must start with a letter and only contain letters, digits, +, -, or .`,
          invalid_port: (d?: string) =>
            `Invalid port${d ? ` ("${d}")` : ''}: port must be an integer between 0 and 65535.`,
          invalid_ipv6: (d?: string) =>
            `Invalid IPv6 host${d ? ` ("${d}")` : ''}: IPv6 addresses must be enclosed in square brackets [ ] with valid hex groups.`,
          missing_host: 'Invalid URL: missing hostname after protocol (e.g. https://example.com).',
          invalid_host: (d?: string) =>
            `Invalid hostname${d ? ` ("${d}")` : ''}: check domain characters or authority format.`,
          invalid_syntax: 'Invalid URL syntax: please verify the overall structure (protocol://host[:port]/path?query#hash).',
        },
      }
    }
    if (language === 'ja-JP') {
      return {
        inputLabel: 'URL 入力',
        inputPlaceholder: '任意の URL を貼り付け（例: https://example.com:8080/path?foo=bar#section）',
        loadSample: 'サンプル入力',
        clear: 'クリア',
        presetsLabel: 'サンプル例:',
        presetNames: {
          port: 'ポート付き',
          auth: '認証情報付き',
          chinese: 'マルチバイト引数',
          ipv6: 'IPv6 ホスト',
        } as Record<string, string>,
        emptyHint: '上に URL を入力すると、プロトコル・ホスト・ポート・パス・クエリパラメータ・フラグメントを自動分解します。',
        overviewTitle: 'URL 構成要素',
        protocol: 'プロトコル',
        origin: 'オリジン (Origin)',
        username: 'ユーザー名',
        password: 'パスワード',
        hostname: 'ホスト名',
        port: 'ポート',
        portExplicit: '明示指定',
        portDefault: '既定ポート',
        pathname: 'パス',
        hash: 'フラグメント (#)',
        emptyValue: '（なし）',
        pathSegmentsTitle: 'パスセグメント',
        noSegments: 'ルートパス（セグメントなし）',
        queryTitle: 'クエリパラメータ',
        mergedTitle: '重複キー統合ビュー',
        editableTitle: 'クエリパラメータ編集（URL 再構築）',
        addParam: 'パラメータ追加',
        resetParams: '編集をリセット',
        keyCol: 'キー',
        valueCol: '値',
        actionCol: '操作',
        keyPlaceholder: 'キー名',
        valuePlaceholder: '値',
        noParams: 'クエリパラメータはありません。',
        rebuiltTitle: '再構築された完全な URL',
        rebuiltModified: '編集済み',
        applyToInput: '入力欄に反映',
        copyFullUrl: 'URL をコピー',
        clientOnlyNote: '完全クライアント側処理：入力した URL や認証情報は外部サーバーへ一切送信されません。',
        duplicateBadge: (n: number) => `${n} 件`,
        errors: {
          whitespace: '無効な URL：空白・タブ・改行が含まれています。空白を削除するか %20 でエンコードしてください。',
          missing_protocol: '無効な URL：プロトコルがありません。https:// や http:// などを先頭に付けてください。',
          invalid_protocol: (d?: string) =>
            `プロトコルが不正です${d ? `（"${d}"）` : ''}：英字で始まり、英数字・+・-・. のみ使用できます。`,
          invalid_port: (d?: string) =>
            `ポート番号が不正です${d ? `（"${d}"）` : ''}：0〜65535 の整数を指定してください。`,
          invalid_ipv6: (d?: string) =>
            `IPv6 ホストが不正です${d ? `（"${d}"）` : ''}：IPv6 アドレスは [ ] で正しく囲んでください。`,
          missing_host: '無効な URL：ホスト名が空です（例: https://example.com）。',
          invalid_host: (d?: string) =>
            `ホスト名が不正です${d ? `（"${d}"）` : ''}：ドメイン文字やホスト部を確認してください。`,
          invalid_syntax: 'URL 構文が不正です：protocol://host[:port]/path?query#hash の形式を確認してください。',
        },
      }
    }
    return {
      inputLabel: 'URL 输入',
      inputPlaceholder: '粘贴任意 URL，例如 https://example.com:8080/path?foo=bar#section',
      loadSample: '填入示例',
      clear: '清空',
      presetsLabel: '常用示例：',
      presetNames: {
        port: '带端口',
        auth: '带认证信息',
        chinese: '含中文参数',
        ipv6: 'IPv6 主机',
      } as Record<string, string>,
      emptyHint: '在上方粘贴或输入任意 URL，即可实时拆解协议、认证信息、主机、端口、路径分段、查询参数与锚点。',
      overviewTitle: 'URL 组成部分',
      protocol: '协议 (Protocol)',
      origin: '源 (Origin)',
      username: '用户名 (Username)',
      password: '密码 (Password)',
      hostname: '主机名 (Hostname)',
      port: '端口 (Port)',
      portExplicit: '显式端口',
      portDefault: '默认端口',
      pathname: '路径 (Pathname)',
      hash: '锚点 (Fragment)',
      emptyValue: '（无）',
      pathSegmentsTitle: '路径分段',
      noSegments: '根路径（无分段）',
      queryTitle: '查询参数 (Query Parameters)',
      mergedTitle: '键值汇总（重复键已合并）',
      editableTitle: '逐项编辑查询参数（实时重拼 URL）',
      addParam: '新增参数',
      resetParams: '重置编辑',
      keyCol: '参数名 (Key)',
      valueCol: '参数值 (Value)',
      actionCol: '操作',
      keyPlaceholder: '输入参数名',
      valuePlaceholder: '输入参数值',
      noParams: '当前 URL 不包含查询参数。',
      rebuiltTitle: '重拼后的完整 URL',
      rebuiltModified: '已修改',
      applyToInput: '同步到输入框',
      copyFullUrl: '复制完整 URL',
      clientOnlyNote: '纯前端本地解析，你输入的 URL 及认证信息不会发送到任何服务器。',
      duplicateBadge: (n: number) => `${n} 个值`,
      errors: {
        whitespace: 'URL 格式错误（空白字符）：包含空格、制表符或换行符，请删除空白或将空格编码为 %20。',
        missing_protocol: 'URL 格式错误（缺少协议）：请补全协议头，例如 https:// 或 http://。',
        invalid_protocol: (d?: string) =>
          `URL 格式错误（协议非法${d ? `："${d}"` : ''}）：协议必须以字母开头，仅允许字母、数字、+、-、.。`,
        invalid_port: (d?: string) =>
          `URL 格式错误（端口非法${d ? `："${d}"` : ''}）：端口必须为 0 ~ 65535 之间的整数。`,
        invalid_ipv6: (d?: string) =>
          `URL 格式错误（IPv6 主机非法${d ? `："${d}"` : ''}）：IPv6 地址需使用方括号 [ ] 包裹且符合格式规范。`,
        missing_host: 'URL 格式错误（缺少主机名）：协议后缺少有效主机名（如 https://example.com）。',
        invalid_host: (d?: string) =>
          `URL 格式错误（主机名非法${d ? `："${d}"` : ''}）：请检查域名字符或主机格式。`,
        invalid_syntax: 'URL 语法无效：请检查整体结构（protocol://host[:port]/path?query#hash）。',
      },
    }
  }, [language])

  const formatError = (err: UrlParseError): string => {
    switch (err.code) {
      case 'whitespace':
        return ui.errors.whitespace
      case 'missing_protocol':
        return ui.errors.missing_protocol
      case 'invalid_protocol':
        return ui.errors.invalid_protocol(err.detail)
      case 'invalid_port':
        return ui.errors.invalid_port(err.detail)
      case 'invalid_ipv6':
        return ui.errors.invalid_ipv6(err.detail)
      case 'missing_host':
        return ui.errors.missing_host
      case 'invalid_host':
        return ui.errors.invalid_host(err.detail)
      default:
        return ui.errors.invalid_syntax
    }
  }

  const trimmedInput = urlInput.trim()
  const outcome = useMemo(() => (trimmedInput ? parseUrl(trimmedInput) : null), [trimmedInput])
  const parsed = outcome && outcome.ok === true ? outcome.data : null
  const parseError = outcome && outcome.ok === false ? outcome.error : null

  const activeParams = editedParams ?? parsed?.queryEntries ?? []
  const mergedParams = useMemo(() => mergeQueryParams(activeParams), [activeParams])

  const rebuiltUrl = useMemo(() => {
    if (!parsed) return ''
    if (editedParams === null) return parsed.href
    try {
      return rebuildUrlWithQueryParams(parsed.href, editedParams)
    } catch {
      return parsed.href
    }
  }, [parsed, editedParams])

  const isQueryModified = editedParams !== null && parsed !== null && rebuiltUrl !== parsed.href

  const handleInputChange = (next: string) => {
    setUrlInput(next)
    setEditedParams(null)
  }

  const handleUpdateParam = (id: number, field: 'key' | 'value', val: string) => {
    const base = editedParams ?? parsed?.queryEntries ?? []
    setEditedParams(base.map(item => (item.id === id ? { ...item, [field]: val } : item)))
  }

  const handleDeleteParam = (id: number) => {
    const base = editedParams ?? parsed?.queryEntries ?? []
    setEditedParams(base.filter(item => item.id !== id))
  }

  const handleAddParam = () => {
    const base = editedParams ?? parsed?.queryEntries ?? []
    const id = nextRowId
    setNextRowId(prev => prev + 1)
    setEditedParams([...base, { id, key: '', value: '' }])
  }

  const handleApplyRebuilt = () => {
    if (!rebuiltUrl) return
    setUrlInput(rebuiltUrl)
    setEditedParams(null)
  }

  return (
    <ToolPage>
      <div className="flex flex-col gap-6">
        {/* Input Card */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="url-parser-input"
              className="text-sm font-semibold text-gray-800 dark:text-gray-200 inline-flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4 text-brand-500" />
              {ui.inputLabel}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInputChange(DEFAULT_URL)}
                className="btn-secondary btn-sm inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {ui.loadSample}
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('')}
                disabled={!urlInput}
                className="btn-ghost btn-sm inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {ui.clear}
              </button>
            </div>
          </div>

          <textarea
            id="url-parser-input"
            rows={2}
            value={urlInput}
            onChange={e => handleInputChange(e.target.value)}
            placeholder={ui.inputPlaceholder}
            spellCheck={false}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
          />

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{ui.presetsLabel}</span>
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleInputChange(preset.url)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  urlInput.trim() === preset.url
                    ? 'border-brand-400 dark:border-brand-600 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:border-brand-400 dark:hover:border-brand-600'
                }`}
              >
                {ui.presetNames[preset.id]}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">{ui.clientOnlyNote}</p>
        </div>

        {/* Empty State */}
        {!trimmedInput && (
          <div className="card p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {ui.emptyHint}
          </div>
        )}

        {/* Error Alert */}
        {parseError && (
          <div
            role="alert"
            className="card p-4 border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 flex items-start gap-3 text-sm text-red-700 dark:text-red-300"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>{formatError(parseError)}</div>
          </div>
        )}

        {/* Parsed Results */}
        {parsed && (
          <>
            {/* Core Components Grid */}
            <div className="card p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {ui.overviewTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <FieldCard
                  label={ui.protocol}
                  value={parsed.protocol}
                  emptyText={ui.emptyValue}
                />
                <FieldCard
                  label={ui.hostname}
                  value={parsed.hostname}
                  emptyText={ui.emptyValue}
                />
                <FieldCard
                  label={ui.port}
                  value={parsed.effectivePort}
                  badge={
                    parsed.explicitPort
                      ? ui.portExplicit
                      : parsed.isDefaultPort
                        ? ui.portDefault
                        : undefined
                  }
                  emptyText={ui.emptyValue}
                />
                <FieldCard
                  label={ui.username}
                  value={parsed.username}
                  emptyText={ui.emptyValue}
                />
                <FieldCard
                  label={ui.password}
                  value={parsed.password}
                  emptyText={ui.emptyValue}
                />
                <FieldCard
                  label={ui.origin}
                  value={parsed.origin}
                  emptyText={ui.emptyValue}
                />
                <FieldCard
                  label={ui.pathname}
                  value={parsed.pathname}
                  emptyText={ui.emptyValue}
                />
                <FieldCard
                  label={ui.hash}
                  value={parsed.hash}
                  subValue={parsed.hashDecoded}
                  emptyText={ui.emptyValue}
                />
              </div>
            </div>

            {/* Path Segments Card */}
            <div className="card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {ui.pathSegmentsTitle}
                  <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                    ({parsed.pathSegments.length})
                  </span>
                </h2>
                <CopyButton text={parsed.pathname} label={ui.pathname} />
              </div>

              {parsed.pathSegments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{ui.noSegments}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {parsed.pathSegments.map((seg, index) => (
                    <div
                      key={`${index}-${seg.raw}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                    >
                      <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                        {seg.decoded}
                      </span>
                      {seg.decoded !== seg.raw && (
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                          ({seg.raw})
                        </span>
                      )}
                      <CopyButton text={seg.decoded} className="!px-1 !py-0.5 text-xs" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Query Parameters Card */}
            <div className="card p-5 flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {ui.queryTitle}
                  <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                    ({activeParams.length})
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  {editedParams !== null && (
                    <button
                      type="button"
                      onClick={() => setEditedParams(null)}
                      className="btn-ghost btn-sm inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {ui.resetParams}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddParam}
                    className="btn-secondary btn-sm inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {ui.addParam}
                  </button>
                </div>
              </div>

              {/* Merged Duplicate Keys Summary */}
              {mergedParams.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {ui.mergedTitle}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="px-3 py-2 font-medium w-1/3">{ui.keyCol}</th>
                          <th className="px-3 py-2 font-medium">{ui.valueCol}</th>
                          <th className="px-3 py-2 font-medium w-20 text-right">{ui.actionCol}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {mergedParams.map(group => (
                          <tr
                            key={group.key}
                            className="bg-white dark:bg-gray-950/40"
                          >
                            <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100 break-all align-top">
                              <span>{group.key || ui.emptyValue}</span>
                              {group.values.length > 1 && (
                                <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-sans">
                                  {ui.duplicateBadge(group.values.length)}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300 break-all align-top">
                              {group.values.length === 1 ? (
                                <span>{group.values[0] || ui.emptyValue}</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {group.values.map((val, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs"
                                    >
                                      {val || ui.emptyValue}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right align-top">
                              <CopyButton
                                text={
                                  group.values.length === 1
                                    ? group.values[0]
                                    : JSON.stringify(group.values)
                                }
                                className="!px-1.5 !py-0.5 text-xs"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Editable Query Parameters Table */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {ui.editableTitle}
                </div>
                {activeParams.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ui.noParams}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {activeParams.map(row => (
                      <div
                        key={row.id}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto] gap-2 items-center"
                      >
                        <input
                          type="text"
                          value={row.key}
                          onChange={e => handleUpdateParam(row.id, 'key', e.target.value)}
                          placeholder={ui.keyPlaceholder}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={e => handleUpdateParam(row.id, 'value', e.target.value)}
                          placeholder={ui.valuePlaceholder}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <div className="flex items-center justify-end gap-1">
                          <CopyButton
                            text={`${row.key}=${row.value}`}
                            className="!px-2 !py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteParam(row.id)}
                            aria-label="Delete parameter"
                            className="btn-ghost btn-sm !px-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rebuilt URL Preview */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {ui.rebuiltTitle}
                    </span>
                    {isQueryModified && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
                        {ui.rebuiltModified}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isQueryModified && (
                      <button
                        type="button"
                        onClick={handleApplyRebuilt}
                        className="btn-secondary btn-sm inline-flex items-center gap-1"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {ui.applyToInput}
                      </button>
                    )}
                    <CopyButton text={rebuiltUrl} label={ui.copyFullUrl} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs sm:text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {rebuiltUrl}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
