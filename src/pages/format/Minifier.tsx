import { useCallback, useMemo, useState } from 'react'
import { Download, Minimize2, Sparkles, Trash2, Wand2 } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import { downloadFile } from '../../lib/utils'
import {
  detectCodeLanguage,
  minifyCode,
  type MinifyLanguage,
  type MinifyResult,
} from '../../lib/codeMinifier'

const SAMPLES: Record<MinifyLanguage, string> = {
  css: `/* Primary Card Styles */
.card-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  background-image: url("https://example.com/assets/bg pattern.png");
  color: #1f2937;
}

/* Hover state & pseudo-element */
.card-container :hover {
  border-color: #3b82f6;
}

.card-container::after {
  content: "Hello   CSS  World";
  width: calc(100% - 24px);
}`,
  javascript: `// Calculate greeting message with preserved spaces
function formatGreeting(userName) {
  /* Multi-line comment:
     keep string contents and URLs untouched */
  const prefix = "Hello,   ";
  const endpoint = "https://api.example.com/v1/users";
  const suffix = "  — welcome!";
  return {
    message: prefix + userName + suffix,
    url: endpoint,
    timestamp: Date.now(),
  };
}

console.log(formatGreeting("DevToolBox"));`,
  html: `<!-- Hero Section -->
<section class="hero">
  <div class="hero-inner">
    <h1 title="DevToolBox   Code Minifier">Code Minifier</h1>
    <p>Compress HTML safely without touching preformatted blocks.</p>
    <pre>
  function hello() {
    return "  keep   indentation  ";
  }
    </pre>
    <textarea rows="3">  Preserve   user   spacing  </textarea>
    <script>
      const note = "Keep   inline   script   intact";
      console.log(note);
    </script>
  </div>
</section>`,
}

const EXTENSIONS: Record<MinifyLanguage, string> = {
  css: 'minified.min.css',
  javascript: 'minified.min.js',
  html: 'minified.min.html',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function Minifier() {
  const { language: locale } = useI18n()
  const [codeLang, setCodeLang] = useState<MinifyLanguage>('css')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<MinifyResult | null>(null)
  const [error, setError] = useState('')
  const [detectedHint, setDetectedHint] = useState<MinifyLanguage | null>(null)

  const ui = useMemo(() => {
    if (locale === 'en-US') {
      return {
        langLabel: 'Language',
        minifyBtn: 'Minify',
        autoDetectBtn: 'Auto Detect',
        loadSample: 'Load Sample',
        clear: 'Clear',
        download: 'Download Minified',
        inputLabel: (l: MinifyLanguage) =>
          l === 'css' ? 'CSS Input' : l === 'javascript' ? 'JavaScript Input' : 'HTML Input',
        outputLabel: 'Minified Output',
        inputPlaceholder: (l: MinifyLanguage) =>
          l === 'css'
            ? 'Paste or type CSS code here...'
            : l === 'javascript'
              ? 'Paste or type JavaScript code here...'
              : 'Paste or type HTML code here...',
        outputPlaceholder: 'Minified code will appear here',
        originalSize: 'Original',
        minifiedSize: 'Minified',
        saved: 'Saved',
        ratio: 'Compression Ratio',
        detectedMsg: (l: MinifyLanguage) => `Auto-detected: ${l.toUpperCase()}`,
        detectFailed: 'Could not detect language automatically. Please select manually.',
        emptyInputError: 'Please enter some code to minify.',
        minifyFailed: (msg: string) => `Minification failed: ${msg}`,
        tipsTitle: 'Safe Minification Rules:',
        tips: {
          css: 'Removes comments & redundant whitespace while keeping strings, url(), and calc() intact.',
          javascript:
            'Removes comments & extra whitespace safely without renaming variables or breaking strings/regex/ASI.',
          html: 'Removes HTML comments & inter-tag whitespace while keeping <pre>, <textarea>, <script>, and <style> untouched.',
        },
      }
    }
    if (locale === 'ja-JP') {
      return {
        langLabel: '言語',
        minifyBtn: '圧縮する',
        autoDetectBtn: '自動判別',
        loadSample: 'サンプルを入力',
        clear: 'クリア',
        download: '圧縮ファイルをダウンロード',
        inputLabel: (l: MinifyLanguage) =>
          l === 'css' ? 'CSS 入力' : l === 'javascript' ? 'JavaScript 入力' : 'HTML 入力',
        outputLabel: '圧縮結果',
        inputPlaceholder: (l: MinifyLanguage) =>
          l === 'css'
            ? 'ここに CSS コードを入力または貼り付け...'
            : l === 'javascript'
              ? 'ここに JavaScript コードを入力または貼り付け...'
              : 'ここに HTML コードを入力または貼り付け...',
        outputPlaceholder: '圧縮後のコードがここに表示されます',
        originalSize: '圧縮前',
        minifiedSize: '圧縮後',
        saved: '削減サイズ',
        ratio: '圧縮率',
        detectedMsg: (l: MinifyLanguage) => `自動判別: ${l.toUpperCase()}`,
        detectFailed: '言語を自動判別できませんでした。手動で選択してください。',
        emptyInputError: '圧縮するコードを入力してください。',
        minifyFailed: (msg: string) => `圧縮に失敗しました: ${msg}`,
        tipsTitle: '安全な圧縮ルール：',
        tips: {
          css: '文字列・url()・calc() を保持したままコメントと余分な空白を除去します。',
          javascript:
            '変数名変更などの危険な変換は行わず、文字列・正規表現・ASI を保ちながらコメントと空白を圧縮します。',
          html: '<pre>・<textarea>・<script>・<style> の内容を保持したままコメントとタグ間の空白を除去します。',
        },
      }
    }
    return {
      langLabel: '语言',
      minifyBtn: '立即压缩',
      autoDetectBtn: '自动识别',
      loadSample: '填入示例',
      clear: '清空',
      download: '下载压缩后文件',
      inputLabel: (l: MinifyLanguage) =>
        l === 'css' ? 'CSS 源代码' : l === 'javascript' ? 'JavaScript 源代码' : 'HTML 源代码',
      outputLabel: '压缩结果',
      inputPlaceholder: (l: MinifyLanguage) =>
        l === 'css'
          ? '在此粘贴或输入 CSS 代码...'
          : l === 'javascript'
            ? '在此粘贴或输入 JavaScript 代码...'
            : '在此粘贴或输入 HTML 代码...',
      outputPlaceholder: '压缩后的代码将显示在这里',
      originalSize: '压缩前',
      minifiedSize: '压缩后',
      saved: '减少体积',
      ratio: '压缩率',
      detectedMsg: (l: MinifyLanguage) => `已自动识别为 ${l.toUpperCase()}`,
      detectFailed: '未能自动识别语言，请手动选择 CSS / JavaScript / HTML。',
      emptyInputError: '请先输入需要压缩的代码。',
      minifyFailed: (msg: string) => `压缩失败：${msg}`,
      tipsTitle: '安全压缩说明：',
      tips: {
        css: '移除注释与多余空白，完整保留字符串、url() 及 calc() 表达式内容。',
        javascript: '安全移除注释与多余空白，不做变量重命名，完整保留字符串、模板字符串、正则与换行语义。',
        html: '移除 HTML 注释与标签间空白，原样保留 <pre>、<textarea>、<script> 与 <style> 内容。',
      },
    }
  }, [locale])

  const runMinify = useCallback(
    (source: string, targetLang: MinifyLanguage) => {
      if (!source.trim()) {
        setResult(null)
        setError('')
        return
      }
      try {
        const res = minifyCode(source, targetLang)
        setResult(res)
        setError('')
      } catch (e) {
        setResult(null)
        const msg = e instanceof Error ? e.message : String(e)
        setError(ui.minifyFailed(msg))
      }
    },
    [ui]
  )

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setResult(null)
      setError(ui.emptyInputError)
      return
    }
    runMinify(input, codeLang)
  }, [input, codeLang, runMinify, ui.emptyInputError])

  const handleLanguageChange = useCallback(
    (nextLang: MinifyLanguage) => {
      setCodeLang(nextLang)
      setDetectedHint(null)
      setError('')
      if (input.trim()) {
        runMinify(input, nextLang)
      } else {
        setResult(null)
      }
    },
    [input, runMinify]
  )

  const handleAutoDetect = useCallback(() => {
    const detected = detectCodeLanguage(input)
    if (!detected) {
      setError(ui.detectFailed)
      return
    }
    setCodeLang(detected)
    setDetectedHint(detected)
    setError('')
    runMinify(input, detected)
  }, [input, runMinify, ui.detectFailed])

  const handleLoadSample = useCallback(() => {
    const sample = SAMPLES[codeLang]
    setInput(sample)
    setDetectedHint(null)
    runMinify(sample, codeLang)
  }, [codeLang, runMinify])

  const handleClear = useCallback(() => {
    setInput('')
    setResult(null)
    setError('')
    setDetectedHint(null)
  }, [])

  const handleDownload = useCallback(() => {
    if (!result?.output) return
    downloadFile(result.output, EXTENSIONS[codeLang])
  }, [result, codeLang])

  const langTabs: { id: MinifyLanguage; label: string }[] = [
    { id: 'css', label: 'CSS' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'html', label: 'HTML' },
  ]

  return (
    <ToolPage
      title="代码压缩（CSS / JS / HTML）"
      description="纯前端安全压缩 CSS、JavaScript、HTML 代码，实时统计字节数与压缩率"
    >
      <div className="flex flex-col gap-4">
        {/* Toolbar Card */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">
              {ui.langLabel}:
            </span>
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-0.5">
              {langTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleLanguageChange(tab.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    codeLang === tab.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleMinify}
              className="btn btn-sm btn-primary inline-flex items-center gap-1.5"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>{ui.minifyBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={!input.trim()}
              className="btn btn-sm btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{ui.autoDetectBtn}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="btn btn-sm btn-secondary inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{ui.loadSample}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={!input && !result}
              className="btn btn-sm btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{ui.clear}</span>
            </button>

            <CopyButton text={result?.output ?? ''} />

            <button
              type="button"
              onClick={handleDownload}
              disabled={!result?.output}
              className="btn btn-sm btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{ui.download}</span>
            </button>
          </div>
        </div>

        {detectedHint && (
          <div className="text-xs text-brand-600 dark:text-brand-400 px-1">
            {ui.detectedMsg(detectedHint)}
          </div>
        )}

        {/* Stats Card */}
        {result && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">{ui.originalSize}</div>
              <div className="mt-1 text-base font-semibold font-mono text-gray-900 dark:text-gray-100">
                {formatBytes(result.originalBytes)}
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  ({result.originalBytes} B)
                </span>
              </div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">{ui.minifiedSize}</div>
              <div className="mt-1 text-base font-semibold font-mono text-gray-900 dark:text-gray-100">
                {formatBytes(result.minifiedBytes)}
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  ({result.minifiedBytes} B)
                </span>
              </div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">{ui.saved}</div>
              <div className="mt-1 text-base font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                -{formatBytes(result.savedBytes)}
              </div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">{ui.ratio}</div>
              <div className="mt-1 text-base font-semibold font-mono text-brand-600 dark:text-brand-400">
                {result.ratio.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Dual Editor */}
        <DualEditor
          input={input}
          output={result?.output ?? ''}
          onInputChange={(val) => {
            setInput(val)
            setDetectedHint(null)
            if (!val.trim()) {
              setResult(null)
              setError('')
            } else {
              runMinify(val, codeLang)
            }
          }}
          inputLabel={ui.inputLabel(codeLang)}
          outputLabel={ui.outputLabel}
          inputPlaceholder={ui.inputPlaceholder(codeLang)}
          outputPlaceholder={ui.outputPlaceholder}
          error={error}
          outputFilename={EXTENSIONS[codeLang]}
        />

        {/* Rule Hint */}
        <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">{ui.tipsTitle} </span>
          {ui.tips[codeLang]}
        </div>
      </div>
    </ToolPage>
  )
}
