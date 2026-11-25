import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Mode = 'escape' | 'unescape';

const SAMPLE = 'He said "Hello World"\\nNew Line\\t Tab';

function escapeJsonString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/\b/g, '\\b')
    .replace(/[\x00-\x1f]/g, (ch) => {
      return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
    });
}

function unescapeJsonString(str: string): string {
  // Wrap in quotes and parse as JSON string
  try {
    return JSON.parse(`"${str}"`);
  } catch {
    // Fallback manual unescape
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\f/g, '\f')
      .replace(/\\b/g, '\b')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
  }
}

export default function JsonEscape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('escape');

  const transform = useCallback((text: string, m: Mode) => {
    if (!text) { setOutput(''); setError(''); return; }
    try {
      if (m === 'escape') {
        setOutput(escapeJsonString(text));
      } else {
        setOutput(unescapeJsonString(text));
      }
      setError('');
    } catch (e: unknown) {
      setError(`处理错误: ${(e as Error).message}`);
      setOutput('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => transform(input, mode), 300);
    return () => clearTimeout(timer);
  }, [input, mode, transform]);

  const handleSwap = useCallback(() => {
    setInput(output);
    setMode(prev => prev === 'escape' ? 'unescape' : 'escape');
  }, [output]);

  return (
    <ToolPage title="JSON 转义" description="JSON 字符串转义与反转义工具">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">模式:</label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value as Mode)}
            className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="escape">转义</option>
            <option value="unescape">反转义</option>
          </select>
        </div>
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors ml-auto"
        >
          示例
        </button>
      </div>

      <DualEditor
        input={input}
        output={output}
        onInputChange={setInput}
        inputLabel={mode === 'escape' ? '原始字符串' : '转义字符串'}
        outputLabel={mode === 'escape' ? '转义结果' : '反转义结果'}
        inputPlaceholder={mode === 'escape' ? '请输入要转义的字符串...' : '请输入要反转义的字符串...'}
        error={error}
        swappable
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
