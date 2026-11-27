import { useMemo, useState } from 'react'
import { AlertCircle, Download, FileCode2, Sparkles, Trash2 } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import { downloadFile } from '../../lib/utils'
import {
  jsonToTypescript,
  sanitizeTypeName,
  type DeclarationStyle,
} from '../../lib/jsonToTypescript'

const SAMPLE_JSON = `{
  "id": 1024,
  "username": "dev_alex",
  "email": "alex@example.com",
  "nickname": null,
  "isActive": true,
  "roles": ["admin", "editor"],
  "profile": {
    "avatarUrl": "https://example.com/avatar.png",
    "bio": "Full-stack engineer",
    "socialLinks": {
      "github": "https://github.com/alex",
      "website": null
    }
  },
  "orders": [
    {
      "orderId": "ORD-2026-001",
      "amount": 199.5,
      "paid": true,
      "couponCode": "WELCOME10"
    },
    {
      "orderId": "ORD-2026-002",
      "amount": 89,
      "paid": false,
      "couponCode": null
    }
  ]
}`

export default function JsonToTypescript() {
  const { language } = useI18n()
  const [input, setInput] = useState(SAMPLE_JSON)
  const [rootName, setRootName] = useState('Root')
  const [style, setStyle] = useState<DeclarationStyle>('interface')
  const [indent, setIndent] = useState<2 | 4>(2)
  const [useExport, setUseExport] = useState(true)
  const [allOptional, setAllOptional] = useState(false)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        rootNameLabel: 'Root Type Name',
        rootNamePlaceholder: 'Root',
        styleLabel: 'Declaration',
        indentLabel: 'Indent',
        indent2: '2 Spaces',
        indent4: '4 Spaces',
        exportLabel: 'Add export',
        optionalLabel: 'All fields optional (?)',
        loadSample: 'Load Sample',
        clear: 'Clear',
        copy: 'Copy',
        download: 'Download .ts',
        inputTitle: 'JSON Input',
        outputTitle: 'TypeScript Output',
        inputPlaceholder: 'Paste JSON here to generate TypeScript types in real time...',
        outputPlaceholder: 'Generated TypeScript definitions will appear here',
        syntaxError: 'JSON Syntax Error',
        lineCol: (line: number, col: number | null) =>
          col !== null ? `Line ${line}, Column ${col}` : `Line ${line}`,
        linesUnit: 'lines',
        charsUnit: 'chars',
      }
    }
    if (language === 'ja-JP') {
      return {
        rootNameLabel: 'ルート型名',
        rootNamePlaceholder: 'Root',
        styleLabel: '宣言形式',
        indentLabel: 'インデント',
        indent2: 'スペース 2',
        indent4: 'スペース 4',
        exportLabel: 'export を付与',
        optionalLabel: '全プロパティを省略可能 (?)',
        loadSample: 'サンプルを入力',
        clear: 'クリア',
        copy: 'コピー',
        download: '.ts をダウンロード',
        inputTitle: 'JSON 入力',
        outputTitle: 'TypeScript 型定義',
        inputPlaceholder: 'JSON を貼り付けるとリアルタイムで TypeScript 型定義を生成します...',
        outputPlaceholder: '生成された TypeScript 型定義がここに表示されます',
        syntaxError: 'JSON 構文エラー',
        lineCol: (line: number, col: number | null) =>
          col !== null ? `${line} 行目、${col} 列目` : `${line} 行目`,
        linesUnit: '行',
        charsUnit: '文字',
      }
    }
    return {
      rootNameLabel: '根类型名',
      rootNamePlaceholder: 'Root',
      styleLabel: '声明方式',
      indentLabel: '缩进',
      indent2: '2 空格',
      indent4: '4 空格',
      exportLabel: '导出 (export)',
      optionalLabel: '全部可选字段 (?)',
      loadSample: '填入示例',
      clear: '清空',
      copy: '复制',
      download: '下载 .ts 文件',
      inputTitle: 'JSON 输入',
      outputTitle: 'TypeScript 类型定义',
      inputPlaceholder: '在此粘贴 JSON，实时生成 TypeScript interface / type 定义...',
      outputPlaceholder: '生成的 TypeScript 类型定义将显示在这里',
      syntaxError: 'JSON 语法错误',
      lineCol: (line: number, col: number | null) =>
        col !== null ? `第 ${line} 行，第 ${col} 列` : `第 ${line} 行`,
      linesUnit: '行',
      charsUnit: '字符',
    }
  }, [language])

  const result = useMemo(
    () =>
      jsonToTypescript(input, {
        rootName,
        style,
        indent,
        useExport,
        allOptional,
      }),
    [input, rootName, style, indent, useExport, allOptional]
  )

  const handleDownload = () => {
    if (!result.code) return
    const safeName = sanitizeTypeName(rootName, 'Root')
    const filename = `${safeName.charAt(0).toLowerCase()}${safeName.slice(1)}.ts`
    downloadFile(result.code, filename, 'text/typescript;charset=utf-8')
  }

  return (
    <ToolPage
      title="JSON 转 TypeScript"
      description="粘贴 JSON，实时生成 TypeScript interface / type 类型定义，支持嵌套对象、数组、联合类型与可选字段"
    >
      <div className="card p-6 flex flex-col gap-6">
        {/* Options Bar */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Root Type Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {ui.rootNameLabel}
              </label>
              <input
                type="text"
                value={rootName}
                onChange={e => setRootName(e.target.value)}
                placeholder={ui.rootNamePlaceholder}
                className="input-field font-mono"
              />
            </div>

            {/* Interface vs Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {ui.styleLabel}
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-gray-200/70 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setStyle('interface')}
                  className={`py-1.5 px-2.5 rounded-md text-xs font-mono font-medium transition-colors ${
                    style === 'interface'
                      ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  interface
                </button>
                <button
                  type="button"
                  onClick={() => setStyle('type')}
                  className={`py-1.5 px-2.5 rounded-md text-xs font-mono font-medium transition-colors ${
                    style === 'type'
                      ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  type
                </button>
              </div>
            </div>

            {/* Indent */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {ui.indentLabel}
              </label>
              <select
                value={indent}
                onChange={e => setIndent(Number(e.target.value) as 2 | 4)}
                className="select-field w-full"
              >
                <option value={2}>{ui.indent2}</option>
                <option value={4}>{ui.indent4}</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="flex flex-col justify-center gap-2 pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useExport}
                  onChange={e => setUseExport(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
                />
                <span>{ui.exportLabel}</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allOptional}
                  onChange={e => setAllOptional(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
                />
                <span>{ui.optionalLabel}</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-200/80 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setInput(SAMPLE_JSON)}
                className="btn-secondary btn-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{ui.loadSample}</span>
              </button>
              <button
                type="button"
                onClick={() => setInput('')}
                disabled={!input}
                className="btn-secondary btn-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{ui.clear}</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton text={result.code} label={ui.copy} />
              <button
                type="button"
                onClick={handleDownload}
                disabled={!result.code}
                className="btn-primary btn-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{ui.download}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Syntax Error Banner */}
        {result.error && (
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/30 text-red-700 dark:text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 text-sm">
              <div className="font-semibold flex flex-wrap items-center gap-2">
                <span>{ui.syntaxError}</span>
                {result.error.line !== null && (
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/60 font-mono text-xs">
                    {ui.lineCol(result.error.line, result.error.column)}
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-xs break-all opacity-90">
                {result.error.message}
              </p>
            </div>
          </div>
        )}

        {/* Responsive Dual Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* JSON Input Panel */}
          <div className="p-4 bg-brand-50/40 dark:bg-brand-950/15 rounded-xl border border-brand-200/80 dark:border-brand-900 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-brand-700 dark:text-brand-300 text-sm flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4" />
                <span>{ui.inputTitle}</span>
              </label>
              {input && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {input.split('\n').length} {ui.linesUnit} · {input.length} {ui.charsUnit}
                </span>
              )}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={ui.inputPlaceholder}
              spellCheck={false}
              className="editor-area min-h-[380px] bg-white dark:bg-gray-950"
            />
          </div>

          {/* TypeScript Output Panel */}
          <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/15 rounded-xl border border-emerald-200/80 dark:border-emerald-900 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4" />
                <span>{ui.outputTitle}</span>
              </label>
              <div className="flex items-center gap-2">
                {result.code && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {result.code.split('\n').length} {ui.linesUnit}
                  </span>
                )}
                <CopyButton text={result.code} />
              </div>
            </div>
            <textarea
              value={result.code}
              readOnly
              placeholder={ui.outputPlaceholder}
              spellCheck={false}
              className="editor-area min-h-[380px] bg-white dark:bg-gray-950"
            />
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
