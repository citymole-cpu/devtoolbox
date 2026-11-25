import { useState, useCallback } from 'react';
import { html_beautify } from 'js-beautify';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

export default function HtmlFormat() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [useTabs, setUseTabs] = useState(false);

  const sampleData = '<div class="container"><h1>Hello</h1><p>World</p><ul><li>Item 1</li><li>Item 2</li></ul></div>';

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      const formatted = html_beautify(input, {
        indent_size: useTabs ? 1 : indentSize,
        indent_char: useTabs ? '\t' : ' ',
        wrap_line_length: 0,
        preserve_newlines: true,
        max_preserve_newlines: 2,
        indent_inner_html: true,
      });
      setOutput(formatted);
    } catch (e) {
      setError(`格式化失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }, [input, indentSize, useTabs]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      const minified = input
        .replace(/\n/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/\s+>/g, '>')
        .replace(/<\s+/g, '<')
        .trim();
      setOutput(minified);
    } catch (e) {
      setError(`压缩失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }, [input]);

  return (
    <ToolPage title="HTML 格式化" description="HTML 代码格式化与压缩">
      <div className="space-y-4">
        {/* Options */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleFormat}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            格式化
          </button>
          <button
            onClick={handleMinify}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            压缩
          </button>
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">缩进:</label>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              disabled={useTabs}
              className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
            </select>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useTabs}
              onChange={(e) => setUseTabs(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-400">Tab 缩进</span>
          </label>
          <div className="flex-1" />
          <button
            onClick={() => {
              setInput(sampleData);
              setOutput('');
            }}
            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            示例数据
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={(val) => {
            setInput(val);
            setOutput('');
            setError('');
          }}
          inputLabel="HTML 输入"
          outputLabel="处理结果"
          inputPlaceholder="请输入 HTML 代码..."
          error={error}
        />
      </div>
    </ToolPage>
  );
}
