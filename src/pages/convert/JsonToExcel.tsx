import { useMemo, useState, useCallback } from 'react'
import writeXlsxFile from 'write-excel-file/browser'
import { Download, FileSpreadsheet, Trash2, Sparkles, AlertCircle } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { useI18n } from '../../components/I18nProvider'
import {
  buildExcelSheetData,
  normalizeExcelFilename,
  parseJsonForExcel,
  type JsonToExcelParseError,
} from '../../lib/jsonToExcel'

const SAMPLE_JSON = `[
  {
    "id": 1001,
    "姓名": "张三",
    "部门": "研发部",
    "入职日期": "2024-03-15",
    "在职": true,
    "标签": ["React", "TypeScript"],
    "联系方式": { "city": "北京", "ext": 801 }
  },
  {
    "id": 1002,
    "姓名": "李四",
    "部门": "产品部",
    "入职日期": "2025-07-01",
    "在职": true,
    "标签": ["B端", "数据分析"],
    "联系方式": { "city": "上海", "ext": 802 }
  },
  {
    "id": 1003,
    "姓名": "王五",
    "部门": "设计部",
    "入职日期": "2023-11-20",
    "在职": false,
    "标签": ["UI", "Figma"],
    "联系方式": { "city": "深圳", "ext": 803 }
  }
]`

const MAX_PREVIEW_ROWS = 20

export default function JsonToExcel() {
  const { language } = useI18n()
  const [input, setInput] = useState(SAMPLE_JSON)
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [preserveDateStrings, setPreserveDateStrings] = useState(true)
  const [filename, setFilename] = useState('data.xlsx')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        inputLabel: 'JSON Input (Array of Objects or Single Object)',
        inputPlaceholder: 'Paste a JSON array of objects, e.g. [{"name": "Alice", "age": 28}], or a single object {...}',
        loadSample: 'Load Sample',
        clear: 'Clear',
        includeHeaders: 'Include headers',
        preserveDates: 'Keep date strings as-is',
        filenameLabel: 'Filename:',
        filenamePlaceholder: 'data.xlsx',
        downloadBtn: 'Download .xlsx',
        downloading: 'Generating...',
        previewTitle: 'Table Preview',
        previewEmpty: 'Paste valid JSON above to preview the table',
        previewStats: (shown: number, total: number, cols: number) =>
          total > shown
            ? `Showing first ${shown} of ${total} rows · ${cols} columns`
            : `${total} rows · ${cols} columns`,
        noHeaderNotice: 'Header row is excluded from export (preview shows inferred keys)',
        exportFailed: 'Failed to generate .xlsx file: ',
        errors: {
          SYNTAX_ERROR: (d?: string) => `JSON syntax error: ${d || 'Invalid JSON'}`,
          INVALID_ROOT: () => 'JSON root must be an array of objects ([{...}]) or a single object ({...}).',
          EMPTY_ARRAY: () => 'JSON array is empty. Please provide at least one object.',
          INVALID_ROW: (d?: string) => `Item #${d || '?'} in the JSON array is not a plain object.`,
          NO_COLUMNS: () => 'No object keys found to generate table columns.',
        },
      }
    }
    if (language === 'ja-JP') {
      return {
        inputLabel: 'JSON 入力（オブジェクト配列または単一オブジェクト）',
        inputPlaceholder: 'JSON 配列（例: [{"name": "太郎", "age": 28}]）または単一オブジェクト {...} を貼り付け...',
        loadSample: 'サンプルを入力',
        clear: 'クリア',
        includeHeaders: 'ヘッダー行を含める',
        preserveDates: '日付文字列をそのまま保持',
        filenameLabel: 'ファイル名:',
        filenamePlaceholder: 'data.xlsx',
        downloadBtn: '.xlsx をダウンロード',
        downloading: '生成中...',
        previewTitle: 'テーブルプレビュー',
        previewEmpty: '上に有効な JSON を入力するとテーブルプレビューが表示されます',
        previewStats: (shown: number, total: number, cols: number) =>
          total > shown
            ? `先頭 ${shown} 行を表示（全 ${total} 行・${cols} 列）`
            : `全 ${total} 行・${cols} 列`,
        noHeaderNotice: 'エクスポート時はヘッダー行を出力しません（プレビューにはキー名を表示）',
        exportFailed: '.xlsx ファイルの生成に失敗しました: ',
        errors: {
          SYNTAX_ERROR: (d?: string) => `JSON 構文エラー: ${d || '不正な JSON'}`,
          INVALID_ROOT: () => 'JSON はオブジェクト配列 ([{...}]) または単一オブジェクト ({...}) である必要があります。',
          EMPTY_ARRAY: () => 'JSON 配列が空です。1 件以上のオブジェクトを入力してください。',
          INVALID_ROW: (d?: string) => `配列の ${d || '?'} 番目の要素がオブジェクトではありません。`,
          NO_COLUMNS: () => '列を生成できるキーが見つかりません。',
        },
      }
    }
    return {
      inputLabel: 'JSON 输入（对象数组或单个对象）',
      inputPlaceholder: '请粘贴 JSON 对象数组，例如 [{"name": "张三", "age": 28}]，或单个对象 {...}',
      loadSample: '填入示例',
      clear: '清空',
      includeHeaders: '包含表头',
      preserveDates: '日期格式保持原样',
      filenameLabel: '文件名:',
      filenamePlaceholder: 'data.xlsx',
      downloadBtn: '下载 .xlsx',
      downloading: '正在生成...',
      previewTitle: '表格预览',
      previewEmpty: '在上方输入有效 JSON 后，将在此实时预览前 20 行表格',
      previewStats: (shown: number, total: number, cols: number) =>
        total > shown
          ? `预览前 ${shown} 行（共 ${total} 行 · ${cols} 列）`
          : `共 ${total} 行 · ${cols} 列`,
      noHeaderNotice: '导出时不包含表头行（预览仍保留字段名便于核对）',
      exportFailed: '生成 .xlsx 文件失败：',
      errors: {
        SYNTAX_ERROR: (d?: string) => `JSON 语法错误：${d || '无法解析'}`,
        INVALID_ROOT: () => 'JSON 顶层必须是对象数组（[{...}, {...}]）或单个对象（{...}）',
        EMPTY_ARRAY: () => 'JSON 数组为空，请至少包含一条对象记录',
        INVALID_ROW: (d?: string) => `JSON 数组第 ${d || '?'} 项不是有效的对象结构`,
        NO_COLUMNS: () => '未检测到任何对象字段，无法生成表格列',
      },
    }
  }, [language])

  const { data: tableData, error: parseError } = useMemo(
    () => parseJsonForExcel(input, MAX_PREVIEW_ROWS),
    [input]
  )

  const formatParseError = (err: JsonToExcelParseError | null): string => {
    if (!err) return ''
    return ui.errors[err.code](err.detail)
  }

  const errorMessage = formatParseError(parseError) || exportError

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON)
    setExportError('')
  }, [])

  const handleClear = useCallback(() => {
    setInput('')
    setExportError('')
  }, [])

  const handleDownload = useCallback(async () => {
    if (!tableData) return
    setExporting(true)
    setExportError('')
    try {
      const { sheetData, columns } = buildExcelSheetData(tableData, {
        includeHeaders,
        preserveDateStrings,
      })
      const targetName = normalizeExcelFilename(filename)
      await writeXlsxFile(sheetData, {
        columns,
        sheet: 'Sheet1',
      }).toFile(targetName)
    } catch (err) {
      setExportError(ui.exportFailed + (err instanceof Error ? err.message : String(err)))
    } finally {
      setExporting(false)
    }
  }, [tableData, includeHeaders, preserveDateStrings, filename, ui.exportFailed])

  return (
    <ToolPage
      title="JSON 转 Excel"
      description="将 JSON 数组或对象实时预览为表格并导出下载标准 .xlsx 文件"
    >
      <div className="flex flex-col gap-5">
        {/* Options & Actions Bar */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span>{ui.includeHeaders}</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preserveDateStrings}
                onChange={(e) => setPreserveDateStrings(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span>{ui.preserveDates}</span>
            </label>

            <div className="flex items-center gap-2">
              <label
                htmlFor="xlsx-filename"
                className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
              >
                {ui.filenameLabel}
              </label>
              <input
                id="xlsx-filename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder={ui.filenamePlaceholder}
                className="w-40 sm:w-48 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{ui.loadSample}</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{ui.clear}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!tableData || exporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? ui.downloading : ui.downloadBtn}</span>
            </button>
          </div>
        </div>

        {/* JSON Input Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/60">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {ui.inputLabel}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setExportError('')
            }}
            placeholder={ui.inputPlaceholder}
            spellCheck={false}
            rows={10}
            className="w-full p-4 font-mono text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-y"
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="break-all">{errorMessage}</span>
          </div>
        )}

        {/* Table Preview Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 bg-gray-50 dark:bg-gray-900/60">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{ui.previewTitle}</span>
            </div>
            {tableData && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {ui.previewStats(
                  tableData.previewRows.length,
                  tableData.totalRows,
                  tableData.columns.length
                )}
              </span>
            )}
          </div>

          {!tableData ? (
            <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
              {ui.previewEmpty}
            </div>
          ) : (
            <>
              {!includeHeaders && (
                <div className="px-4 py-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/70 dark:border-amber-900/50">
                  {ui.noHeaderNotice}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                  <thead
                    className={
                      includeHeaders
                        ? 'bg-gray-100 dark:bg-gray-800/80'
                        : 'bg-gray-50 dark:bg-gray-900/40 opacity-60'
                    }
                  >
                    <tr>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500 w-10">
                        #
                      </th>
                      {tableData.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
                    {tableData.previewRows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-2 text-gray-800 dark:text-gray-200 font-mono text-xs max-w-xs truncate"
                            title={cell}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
