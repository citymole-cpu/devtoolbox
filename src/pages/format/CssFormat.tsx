import { useState, useCallback } from 'react';
import { css_beautify } from 'js-beautify';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

export default function CssFormat() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const sampleData =
    '.container{display:flex;align-items:center;gap:1rem}.title{font-size:1.5rem;font-weight:bold;color:#333}.btn{padding:.5rem 1rem;background:#3b82f6;color:white;border-radius:.5rem}';

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      const formatted = css_beautify(input, {
        indent_size: indentSize,
        indent_char: ' ',
        selector_separator_newline: true,
        newline_between_rules: true,
      });
      setOutput(formatted);
    } catch (e) {
      setError(`格式化失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }, [input, indentSize]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      const minified = input
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s*\n\s*/g, '')          // remove newlines
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/;}/g, '}')
        .replace(/\s*,\s*/g, ',')
        .trim();
      setOutput(minified);
    } catch (e) {
      setError(`压缩失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }, [input]);

  return (
    <ToolPage title="CSS 格式化" description="CSS 代码格式化与压缩">
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
              className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
            </select>
          </div>
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
          inputLabel="CSS 输入"
          outputLabel="处理结果"
          inputPlaceholder="请输入 CSS 代码..."
          error={error}
        />
      </div>
    </ToolPage>
  );
}
