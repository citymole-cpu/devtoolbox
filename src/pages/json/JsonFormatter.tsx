import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { ShareLinkButton } from '../../components/ShareLinkButton';
import { useShareableState } from '../../lib/shareableState';

type IndentType = '2' | '4' | 'tab';

const SAMPLE = '{"name":"DevToolBox","version":"1.0","features":["JSON格式化","编解码","加密哈希"],"config":{"theme":"dark","language":"zh-CN"}}';

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeysDeep((obj as Record<string, unknown>)[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }
  return obj;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState<IndentType>('2');
  const [sortKeys, setSortKeys] = useState(false);

  const { createShareUrl } = useShareableState<{
    input: string;
    indent: IndentType;
    sortKeys: boolean;
  }>(
    () => ({ input, indent, sortKeys }),
    (restored) => {
      if (typeof restored.input === 'string') setInput(restored.input);
      if (restored.indent === '2' || restored.indent === '4' || restored.indent === 'tab') {
        setIndent(restored.indent);
      }
      if (typeof restored.sortKeys === 'boolean') setSortKeys(restored.sortKeys);
    }
  );

  const getIndent = useCallback((t: IndentType): string | number => {
    if (t === 'tab') return '\t';
    return Number(t);
  }, []);

  const format = useCallback((text: string) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    try {
      let parsed = JSON.parse(text);
      if (sortKeys) parsed = sortKeysDeep(parsed);
      setOutput(JSON.stringify(parsed, null, getIndent(indent)));
      setError('');
    } catch (e: unknown) {
      const msg = (e as Error).message || '无效的 JSON';
      setError(`JSON 解析错误: ${msg}`);
      setOutput('');
    }
  }, [indent, sortKeys, getIndent]);

  useEffect(() => {
    const timer = setTimeout(() => format(input), 300);
    return () => clearTimeout(timer);
  }, [input, format]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e: unknown) {
      setError(`JSON 解析错误: ${(e as Error).message}`);
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    if (!input.trim()) { setError(''); return; }
    try {
      JSON.parse(input);
      setError('');
      setOutput('✅ JSON 格式正确');
    } catch (e: unknown) {
      setError(`JSON 解析错误: ${(e as Error).message}`);
    }
  }, [input]);

  return (
    <ToolPage title="JSON 格式化" description="JSON 格式化、压缩与校验工具">
      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">缩进:</label>
          <select
            value={indent}
            onChange={e => setIndent(e.target.value as IndentType)}
            className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="2">2 空格</option>
            <option value="4">4 空格</option>
            <option value="tab">Tab</option>
          </select>
        </div>

        <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={e => setSortKeys(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          排序键名
        </label>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => format(input)}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            格式化
          </button>
          <button
            onClick={handleMinify}
            className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            压缩
          </button>
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
          >
            校验
          </button>
          <button
            onClick={() => setInput(SAMPLE)}
            className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            示例
          </button>
          <ShareLinkButton getShareUrl={createShareUrl} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">输入</label>
          </div>
          <CodeEditor
            value={input}
            onChange={setInput}
            placeholder="请输入 JSON..."
            language="json"
            minHeight="400px"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">输出</label>
            <CopyButton text={output} />
          </div>
          <CodeEditor
            value={output}
            onChange={() => {}}
            readOnly
            language="json"
            minHeight="400px"
          />
        </div>
      </div>
    </ToolPage>
  );
}
