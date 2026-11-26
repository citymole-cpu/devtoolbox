import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'
import { useI18n } from '../../components/I18nProvider'
import { htmlToJsx } from '../../lib/htmlToJsx'

const SAMPLE_HTML = `<!-- User Profile Card -->
<div class="card" style="padding: 16px; background-color: #ffffff; border-radius: 8px; z-index: 10;">
  <img src="https://example.com/avatar.png" alt="Avatar" class="avatar">
  <form>
    <label for="username" class="form-label">Username</label>
    <input id="username" type="text" placeholder="Enter name" maxlength="32" readonly>
    <br>
    <button type="submit" onclick="handleSubmit()" tabindex="0">Submit</button>
  </form>
</div>`

export default function HtmlToJsx() {
  const { language } = useI18n()
  const [input, setInput] = useState(SAMPLE_HTML)
  const [wrapComponent, setWrapComponent] = useState(false)

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        inputLabel: 'HTML Input',
        outputLabel: 'JSX Output',
        inputPlaceholder: 'Paste or type HTML code here...',
        outputPlaceholder: 'Converted JSX code will appear here',
        loadSample: 'Load Sample',
        wrapComponent: 'Wrap in React Component',
        rulesTitle: 'Supported rules:',
        rules: [
          'class → className',
          'for → htmlFor',
          'style="..." → style={{ ... }}',
          '<!-- --> → {/* */}',
          'Void tags → <br /> / <img />',
        ],
      }
    }
    if (language === 'ja-JP') {
      return {
        inputLabel: 'HTML 入力',
        outputLabel: 'JSX 出力',
        inputPlaceholder: 'ここに HTML コードを入力または貼り付け...',
        outputPlaceholder: '変換後の JSX コードがここに表示されます',
        loadSample: 'サンプルを読み込む',
        wrapComponent: 'React コンポーネントでラップ',
        rulesTitle: '対応ルール：',
        rules: [
          'class → className',
          'for → htmlFor',
          'style="..." → style={{ ... }}',
          '<!-- --> → {/* */}',
          '空要素の自己閉じ → <br /> / <img />',
        ],
      }
    }
    return {
      inputLabel: 'HTML 源代码',
      outputLabel: 'JSX 输出',
      inputPlaceholder: '在此粘贴或输入 HTML 代码...',
      outputPlaceholder: '转换后的 JSX 代码将显示在这里',
      loadSample: '加载示例',
      wrapComponent: '包裹为 React 组件',
      rulesTitle: '自动转换规则：',
      rules: [
        'class → className',
        'for → htmlFor',
        'style="..." → style={{ ... }}',
        '<!-- --> → {/* */}',
        '空标签自闭合 → <br /> / <img />',
      ],
    }
  }, [language])

  const output = useMemo(
    () => htmlToJsx(input, { wrapComponent }),
    [input, wrapComponent]
  )

  return (
    <ToolPage title="HTML 转 JSX" description="将 HTML 代码实时转换为 React JSX 语法">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wrapComponent}
                onChange={e => setWrapComponent(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
              />
              <span>{ui.wrapComponent}</span>
            </label>
          </div>
          <button
            type="button"
            onClick={() => setInput(SAMPLE_HTML)}
            className="btn btn-sm btn-secondary"
          >
            {ui.loadSample}
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={setInput}
          inputLabel={ui.inputLabel}
          outputLabel={ui.outputLabel}
          inputPlaceholder={ui.inputPlaceholder}
          outputPlaceholder={ui.outputPlaceholder}
          outputFilename={wrapComponent ? 'Component.jsx' : 'output.jsx'}
        />

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">{ui.rulesTitle}</span>
          {ui.rules.map(rule => (
            <span
              key={rule}
              className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-gray-700 dark:text-gray-300"
            >
              {rule}
            </span>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}
