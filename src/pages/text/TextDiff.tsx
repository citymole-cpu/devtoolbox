import { useState, useCallback } from 'react';
import { diffLines } from 'diff';
import { ToolPage } from '../../components/ToolPage';
import { CodeEditor } from '../../components/CodeEditor';
import { GitCompare, Plus, Minus, Equal } from 'lucide-react';

interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function TextDiff() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [diffResult, setDiffResult] = useState<DiffPart[]>([]);
  const [stats, setStats] = useState<DiffStats>({ added: 0, removed: 0, unchanged: 0 });
  const [compared, setCompared] = useState(false);

  const handleCompare = useCallback(() => {
    try {
      const result = diffLines(original, modified);
      setDiffResult(result);

      let added = 0;
      let removed = 0;
      let unchanged = 0;
      result.forEach((part) => {
        const lines = part.value.split('\n').filter((l) => l !== '' || part.value === '\n');
        const lineCount = part.value.endsWith('\n')
          ? part.value.split('\n').length - 1
          : part.value.split('\n').length;
        if (part.added) {
          added += lineCount;
        } else if (part.removed) {
          removed += lineCount;
        } else {
          unchanged += lineCount;
        }
      });

      setStats({ added, removed, unchanged });
      setCompared(true);
    } catch {
      setDiffResult([]);
      setStats({ added: 0, removed: 0, unchanged: 0 });
    }
  }, [original, modified]);

  const loadSample = useCallback(() => {
    setOriginal('第一行\n第二行\n第三行\n第四行\n第五行');
    setModified('第一行\n修改的第二行\n第三行\n新增一行\n第五行');
    setCompared(false);
  }, []);

  return (
    <ToolPage title="文本对比" description="比较两段文本的差异，高亮显示新增和删除的行">
      <div className="space-y-4">
        {/* Action bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleCompare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <GitCompare className="w-4 h-4" />
            对比
          </button>
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
          >
            加载示例
          </button>
        </div>

        {/* Two side-by-side editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">原始文本</label>
            <CodeEditor
              value={original}
              onChange={setOriginal}
              placeholder="输入原始文本..."
              minHeight="200px"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">修改后文本</label>
            <CodeEditor
              value={modified}
              onChange={setModified}
              placeholder="输入修改后的文本..."
              minHeight="200px"
            />
          </div>
        </div>

        {/* Stats */}
        {compared && (
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-400">
              <Plus className="w-4 h-4" />
              {stats.added} 行新增
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <Minus className="w-4 h-4" />
              {stats.removed} 行删除
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Equal className="w-4 h-4" />
              {stats.unchanged} 行未变
            </span>
          </div>
        )}

        {/* Diff result */}
        {compared && (
          <div className="rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 border-b border-gray-700">
              对比结果
            </div>
            <div className="bg-gray-900 p-0 font-mono text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
              {diffResult.length === 0 && (
                <div className="p-4 text-gray-500">两段文本完全相同</div>
              )}
              {diffResult.map((part, idx) => {
                const lines = part.value.replace(/\n$/, '').split('\n');
                return lines.map((line, lineIdx) => {
                  let bgClass = '';
                  let textClass = 'text-gray-300';
                  let prefix = ' ';
                  if (part.added) {
                    bgClass = 'bg-green-900/40 border-l-4 border-green-500';
                    textClass = 'text-green-300';
                    prefix = '+';
                  } else if (part.removed) {
                    bgClass = 'bg-red-900/40 border-l-4 border-red-500';
                    textClass = 'text-red-300';
                    prefix = '-';
                  } else {
                    bgClass = 'border-l-4 border-transparent';
                  }
                  return (
                    <div
                      key={`${idx}-${lineIdx}`}
                      className={`px-4 py-0.5 ${bgClass} ${textClass} whitespace-pre`}
                    >
                      <span className="inline-block w-4 mr-2 text-gray-500 select-none">
                        {prefix}
                      </span>
                      {line || ' '}
                    </div>
                  );
                });
              })}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
