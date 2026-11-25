import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { CodeEditor } from '../../components/CodeEditor';
import { diffLines } from 'diff';

const SAMPLE_LEFT = '{"name":"Alice","age":30,"city":"Beijing"}';
const SAMPLE_RIGHT = '{"name":"Alice","age":31,"city":"Shanghai","email":"alice@example.com"}';

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function JsonDiff() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diffResult, setDiffResult] = useState<DiffPart[]>([]);
  const [error, setError] = useState('');

  const compare = useCallback((l: string, r: string) => {
    if (!l.trim() && !r.trim()) {
      setDiffResult([]);
      setError('');
      return;
    }
    try {
      const leftFormatted = l.trim() ? JSON.stringify(JSON.parse(l), null, 2) : '';
      const rightFormatted = r.trim() ? JSON.stringify(JSON.parse(r), null, 2) : '';
      const result = diffLines(leftFormatted, rightFormatted);
      setDiffResult(result);
      setError('');
    } catch (e: unknown) {
      setError(`JSON 解析错误: ${(e as Error).message}`);
      setDiffResult([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => compare(left, right), 400);
    return () => clearTimeout(timer);
  }, [left, right, compare]);

  const loadSample = useCallback(() => {
    setLeft(SAMPLE_LEFT);
    setRight(SAMPLE_RIGHT);
  }, []);

  const hasChanges = diffResult.some(p => p.added || p.removed);

  return (
    <ToolPage title="JSON 对比" description="比较两段 JSON 的差异">
      <div className="flex justify-end mb-4">
        <button
          onClick={loadSample}
          className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
        >
          示例
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Two input editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">左侧 JSON</label>
          <CodeEditor
            value={left}
            onChange={setLeft}
            placeholder="请输入左侧 JSON..."
            language="json"
            minHeight="200px"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">右侧 JSON</label>
          <CodeEditor
            value={right}
            onChange={setRight}
            placeholder="请输入右侧 JSON..."
            language="json"
            minHeight="200px"
          />
        </div>
      </div>

      {/* Diff output */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          对比结果
          {diffResult.length > 0 && !hasChanges && (
            <span className="ml-2 text-green-400 font-normal">✅ 完全一致</span>
          )}
        </label>
        <div className="bg-gray-900 border border-gray-700 rounded p-4 font-mono text-sm overflow-auto max-h-[500px] min-h-[150px]">
          {diffResult.length === 0 && !error && (
            <span className="text-gray-500">请输入两段 JSON 进行对比...</span>
          )}
          {diffResult.map((part, i) => {
            const lines = part.value.replace(/\n$/, '').split('\n');
            return lines.map((line, j) => (
              <div
                key={`${i}-${j}`}
                className={`whitespace-pre ${
                  part.added
                    ? 'bg-green-900/40 text-green-300'
                    : part.removed
                    ? 'bg-red-900/40 text-red-300'
                    : 'text-gray-400'
                }`}
              >
                <span className="inline-block w-6 text-right mr-3 text-gray-600 select-none">
                  {part.added ? '+' : part.removed ? '-' : ' '}
                </span>
                {line}
              </div>
            ));
          })}
        </div>
      </div>
    </ToolPage>
  );
}
