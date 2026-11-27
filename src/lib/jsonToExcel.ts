import type { Cell, Row, SheetData } from 'write-excel-file/browser'

export interface ExcelColumnConfig {
  width?: number
}

export type JsonToExcelErrorCode =
  | 'SYNTAX_ERROR'
  | 'INVALID_ROOT'
  | 'EMPTY_ARRAY'
  | 'INVALID_ROW'
  | 'NO_COLUMNS'

export interface JsonToExcelParseError {
  code: JsonToExcelErrorCode
  detail?: string
}

export interface ParsedTableData {
  columns: string[]
  rows: Record<string, unknown>[]
  previewRows: string[][]
  totalRows: number
}

export interface ParseResult {
  data: ParsedTableData | null
  error: JsonToExcelParseError | null
}

export interface BuildSheetOptions {
  includeHeaders: boolean
  preserveDateStrings: boolean
}

const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:?\d{2})?$/

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function formatCellForPreview(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

export function parseJsonForExcel(input: string, maxPreviewRows = 20): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { data: null, error: null }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch (err) {
    return {
      data: null,
      error: {
        code: 'SYNTAX_ERROR',
        detail: err instanceof Error ? err.message : String(err),
      },
    }
  }

  let rows: Record<string, unknown>[]
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { data: null, error: { code: 'EMPTY_ARRAY' } }
    }
    const invalidIndex = parsed.findIndex((item) => !isPlainObject(item))
    if (invalidIndex !== -1) {
      return {
        data: null,
        error: { code: 'INVALID_ROW', detail: String(invalidIndex + 1) },
      }
    }
    rows = parsed as Record<string, unknown>[]
  } else if (isPlainObject(parsed)) {
    rows = [parsed]
  } else {
    return { data: null, error: { code: 'INVALID_ROOT' } }
  }

  const columnSet = new Set<string>()
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      columnSet.add(key)
    }
  }
  const columns = Array.from(columnSet)
  if (columns.length === 0) {
    return { data: null, error: { code: 'NO_COLUMNS' } }
  }

  const previewRows = rows.slice(0, maxPreviewRows).map((row) =>
    columns.map((col) => formatCellForPreview(row[col]))
  )

  return {
    data: {
      columns,
      rows,
      previewRows,
      totalRows: rows.length,
    },
    error: null,
  }
}

function estimateDisplayWidth(text: string): number {
  let width = 0
  for (const ch of text) {
    width += ch.charCodeAt(0) > 255 ? 2 : 1
  }
  return width
}

function toExcelCell(value: unknown, preserveDateStrings: boolean): Cell {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'number') {
    if (Number.isFinite(value)) {
      return { type: Number, value }
    }
    return { type: String, value: String(value) }
  }
  if (typeof value === 'boolean') {
    return { type: Boolean, value }
  }
  if (typeof value === 'string') {
    if (!preserveDateStrings) {
      if (ISO_DATE_ONLY_RE.test(value)) {
        const [y, m, d] = value.split('-').map(Number)
        const date = new Date(Date.UTC(y, m - 1, d))
        if (!Number.isNaN(date.getTime())) {
          return { type: Date, value: date, format: 'yyyy-mm-dd' }
        }
      } else if (ISO_DATETIME_RE.test(value)) {
        const date = new Date(value)
        if (!Number.isNaN(date.getTime())) {
          return { type: Date, value: date, format: 'yyyy-mm-dd hh:mm:ss' }
        }
      }
    }
    return { type: String, value }
  }
  // Nested objects or arrays are flattened as JSON strings
  return { type: String, value: JSON.stringify(value) }
}

export function buildExcelSheetData(
  table: ParsedTableData,
  options: BuildSheetOptions
): { sheetData: SheetData; columns: ExcelColumnConfig[] } {
  const sheetData: SheetData = []
  const maxWidths = table.columns.map((col) =>
    options.includeHeaders ? estimateDisplayWidth(col) : 8
  )

  if (options.includeHeaders) {
    const headerRow: Row = table.columns.map((col) => ({
      value: col,
      type: String,
      fontWeight: 'bold',
      backgroundColor: '#f3f4f6',
    }))
    sheetData.push(headerRow)
  }

  for (const row of table.rows) {
    const excelRow: Row = table.columns.map((col, idx) => {
      const raw = row[col]
      const preview = formatCellForPreview(raw)
      const w = estimateDisplayWidth(preview)
      if (w > maxWidths[idx]) {
        maxWidths[idx] = w
      }
      return toExcelCell(raw, options.preserveDateStrings)
    })
    sheetData.push(excelRow)
  }

  const columns: ExcelColumnConfig[] = maxWidths.map((w) => ({
    width: Math.min(Math.max(w + 4, 10), 50),
  }))

  return { sheetData, columns }
}

export function normalizeExcelFilename(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '_')
  if (!cleaned) return 'data.xlsx'
  return cleaned.toLowerCase().endsWith('.xlsx') ? cleaned : `${cleaned}.xlsx`
}
