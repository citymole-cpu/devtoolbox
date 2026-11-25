import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import { JSONPath } from 'jsonpath-plus';

const SAMPLE_JSON = `{
  "store": {
    "book": [
      { "category": "reference", "author": "Nigel Rees", "title": "Sayings", "price": 8.95 },
      { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword", "price": 12.99 }
    ],
    "bicycle": { "color": "red", "price": 19.95 }
  }
}`;

const SAMPLE_PATH = '$.store.book[*].author';

const PATH_EXAMPLES = [
  { label: '$.store.book[*].author', desc: '所有作者' },
  { label: '$.store.book[0]', desc: '第一本书' },
  { label: '$.store.book[?(@.price<10)]', desc: '价格<10' },
  { label: '$..price', desc: '所有价格' },
  { label: '$.store.bicycle.color', desc: '自行车颜色' },
  { label: '$.store.book.length', desc: '书的数量' },
];

export default function JsonPathTool() {
  const [jsonInput, setJsonInput] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const query = useCallback((json: string, path: string) => {
    if (!json.trim() || !path.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const parsed = JSON.parse(json);
      const result = JSONPath({ path, json: parsed, wrap: true });
      setOutput(JSON.stringify(result, null, 2));
      setError('');
    } catch (e: unknown) {
      setError(`查询错误: ${(e as Error).message}`);
      setOutput('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => query(jsonInput, pathInput), 300);
    return () => clearTimeout(timer);
  }, [jsonInput, pathInput, query]);

  const loadSample = useCallback(() => {
    setJsonInput(SAMPLE_JSON);
    setPathInput(SAMPLE_PATH);
  }, []);

  return (
    <ToolPage title="JSONPath 查询" description="使用 JSONPath 表达式查询 JSON 数据">
      <div className="flex justify-end mb-4">
        <button
          onClick={loadSample}
          className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
        >
          示例
        </button>
      </div>

      {/* JSON Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">JSON 数据</label>
        <CodeEditor
          value={jsonInput}
          onChange={setJsonInput}
          placeholder="请输入 JSON 数据..."
          language="json"
          minHeight="200px"
        />
      </div>

      {/* JSONPath Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">JSONPath 表达式</label>
        <input
          type="text"
          value={pathInput}
          onChange={e => setPathInput(e.target.value)}
          placeholder="例如: $.store.book[*].author"
          className="w-full bg-gray-800 text-gray-200 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono"
        />
      </div>

      {/* Path example chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {PATH_EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => setPathInput(ex.label)}
            className="px-2.5 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full border border-gray-600 transition-colors"
            title={ex.desc}
          >
            {ex.label}
            <span className="ml-1 text-gray-500">({ex.desc})</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">查询结果</label>
          <CopyButton text={output} />
        </div>
        <CodeEditor
          value={output}
          onChange={() => {}}
          readOnly
          language="json"
          minHeight="200px"
        />
      </div>
    </ToolPage>
  );
}
