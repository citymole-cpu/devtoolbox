import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { ToolPage } from '../../components/ToolPage';
import { CopyButton } from '../../components/CopyButton';

type UuidFormat = 'standard' | 'no-hyphens';
type UuidCase = 'lowercase' | 'uppercase';

export default function Uuid() {
  const [uuid, setUuid] = useState('');
  const [format, setFormat] = useState<UuidFormat>('standard');
  const [caseType, setCaseType] = useState<UuidCase>('lowercase');
  const [batchCount, setBatchCount] = useState(10);
  const [batchResult, setBatchResult] = useState('');
  const [generatedCount, setGeneratedCount] = useState(0);

  const formatUuid = useCallback(
    (raw: string) => {
      let result = format === 'no-hyphens' ? raw.replace(/-/g, '') : raw;
      result = caseType === 'uppercase' ? result.toUpperCase() : result.toLowerCase();
      return result;
    },
    [format, caseType]
  );

  const generateOne = useCallback(() => {
    const raw = crypto.randomUUID();
    const formatted = formatUuid(raw);
    setUuid(formatted);
    setGeneratedCount((c) => c + 1);
  }, [formatUuid]);

  const generateBatch = useCallback(() => {
    const count = Math.min(Math.max(1, batchCount), 100);
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      uuids.push(formatUuid(crypto.randomUUID()));
    }
    setBatchResult(uuids.join('\n'));
    setGeneratedCount((c) => c + count);
  }, [batchCount, formatUuid]);

  return (
    <ToolPage title="UUID 生成器" description="生成随机 UUID (v4)，支持批量生成和多种格式">
      <div className="space-y-8">
        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">格式</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as UuidFormat)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">标准（含连字符）</option>
              <option value="no-hyphens">无连字符</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">大小写</label>
            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value as UuidCase)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lowercase">小写</option>
              <option value="uppercase">大写</option>
            </select>
          </div>
          {generatedCount > 0 && (
            <div className="flex items-end">
              <span className="text-xs text-gray-500 pb-2">
                已生成: {generatedCount} 个
              </span>
            </div>
          )}
        </div>

        {/* Single Generate */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-300">单个生成</h3>
          <div className="flex gap-3">
            <button
              onClick={generateOne}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              生成 UUID
            </button>
          </div>
          {uuid && (
            <div className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <code className="flex-1 text-lg text-green-400 font-mono select-all">{uuid}</code>
              <CopyButton text={uuid} />
            </div>
          )}
        </div>

        {/* Batch Generate */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-300">批量生成</h3>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">数量 (1-100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={generateBatch}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              批量生成
            </button>
          </div>
          {batchResult && (
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <CopyButton text={batchResult} />
              </div>
              <textarea
                value={batchResult}
                readOnly
                className="w-full h-64 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-green-400 font-mono text-sm resize-y focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  );
}
