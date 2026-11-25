import { ArrowRightLeft, Trash2, Download, Upload, Sparkles } from 'lucide-react'
import { CodeEditor } from './CodeEditor'
import { CopyButton } from './CopyButton'
import { downloadFile } from '../lib/utils'
import { useI18n } from './I18nProvider'

interface DualEditorProps {
  input: string
  output: string
  onInputChange: (value: string) => void
  inputLabel?: string
  outputLabel?: string
  inputPlaceholder?: string
  outputPlaceholder?: string
  error?: string
  swappable?: boolean
  onSwap?: () => void
  actions?: React.ReactNode
  inputLanguage?: string
  outputLanguage?: string
  outputFilename?: string
}

export function DualEditor({
  input,
  output,
  onInputChange,
  inputLabel,
  outputLabel,
  inputPlaceholder,
  outputPlaceholder,
  error,
  swappable = false,
  onSwap,
  actions,
  outputFilename = 'output.txt',
}: DualEditorProps) {
  const { t, language } = useI18n()

  const defaultInputLabel = inputLabel || t.input
  const defaultOutputLabel = outputLabel || t.output
  const defaultInputPlaceholder = inputPlaceholder || (language === 'zh-CN' ? '在此输入或拖拽文件...' : language === 'ja-JP' ? 'ここに入力するかファイルをドロップ...' : 'Type or drop files here...')
  const defaultOutputPlaceholder = outputPlaceholder || (language === 'zh-CN' ? '转换结果将显示在这里' : language === 'ja-JP' ? '変換結果がここに表示されます' : 'Conversion result will appear here')

  const charsLabel = language === 'zh-CN' ? '字符' : language === 'ja-JP' ? '文字' : 'chars'
  const linesLabel = language === 'zh-CN' ? '行' : language === 'ja-JP' ? '行' : 'lines'
  const swapLabel = language === 'zh-CN' ? '交换' : language === 'ja-JP' ? '入替' : 'Swap'

  const handleClear = () => onInputChange('')

  const handleLoadFile = () => {
    const input_el = document.createElement('input')
    input_el.type = 'file'
    input_el.accept = '.json,.xml,.yaml,.yml,.csv,.toml,.sql,.md,.txt,.html,.css,.js,.ts,.properties'
    input_el.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => onInputChange(reader.result as string)
        reader.readAsText(file)
      }
    }
    input_el.click()
  }

  const handleDownload = () => {
    if (output) downloadFile(output, outputFilename)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Input Panel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="label mb-0">{defaultInputLabel}</label>
          <div className="flex items-center gap-1">
            <button onClick={handleLoadFile} className="btn-icon p-1.5" title={t.import}>
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleClear} className="btn-icon p-1.5" title={t.clear} disabled={!input}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <CodeEditor
          value={input}
          onChange={onInputChange}
          placeholder={defaultInputPlaceholder}
          minHeight="320px"
        />
        {input && (
          <div className="text-xs text-gray-400 text-right">
            {input.length} {charsLabel} · {input.split('\n').length} {linesLabel}
          </div>
        )}
      </div>

      {/* Swap + Actions Bar (shown between panels on mobile) */}
      {(swappable || actions) && (
        <div className="flex lg:hidden items-center justify-center gap-2">
          {swappable && onSwap && (
            <button onClick={onSwap} className="btn-secondary btn-sm" title={swapLabel}>
              <ArrowRightLeft className="w-4 h-4" />
              <span>{swapLabel}</span>
            </button>
          )}
          {actions}
        </div>
      )}

      {/* Output Panel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="label mb-0">{defaultOutputLabel}</label>
          <div className="flex items-center gap-1">
            {swappable && onSwap && (
              <button onClick={onSwap} className="btn-icon p-1.5 hidden lg:block" title={swapLabel}>
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={handleDownload} className="btn-icon p-1.5" title={t.download} disabled={!output}>
              <Download className="w-3.5 h-3.5" />
            </button>
            <CopyButton text={output} />
          </div>
        </div>
        <CodeEditor
          value={output}
          readOnly
          placeholder={defaultOutputPlaceholder}
          minHeight="320px"
        />
        {error && (
          <div className="error-text">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {output && !error && (
          <div className="text-xs text-gray-400 text-right">
            {output.length} {charsLabel} · {output.split('\n').length} {linesLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default DualEditor


