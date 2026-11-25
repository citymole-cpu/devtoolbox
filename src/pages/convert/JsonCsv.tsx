import { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'json2csv' | 'csv2json';

const sampleJson = `[
  {"name": "张三", "age": 28, "city": "北京"},
  {"name": "李四", "age": 32, "city": "上海"},
  {"name": "王五", "age": 25, "city": "广州"}
]`;

const sampleCsv = `name,age,city
张三,28,北京
李四,32,上海
王五,25,广州`;

export default function JsonCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('json2csv');
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const convert = useCallback(
    (text: string, dir: Direction, delim: string, headers: boolean) => {
      if (!text.trim()) {
        setOutput('');
        setError('');
        return;
      }
      try {
        if (dir === 'json2csv') {
          const obj = JSON.parse(text);
          if (!Array.isArray(obj)) {
            throw new Error('JSON 输入必须是数组格式，例如 [{...}, {...}]');
          }
          const csv = Papa.unparse(obj, {
            delimiter: delim,
            header: headers,
          });
          setOutput(csv);
        } else {
          const result = Papa.parse(text.trim(), {
            header: true,
            delimiter: delim === '\t' ? '\t' : delim,
            skipEmptyLines: true,
          });
          if (result.errors.length > 0) {
            throw new Error(result.errors.map((e) => e.message).join('; '));
          }
          setOutput(JSON.stringify(result.data, null, 2));
        }
        setError('');
      } catch (e: any) {
        setError(e.message || '转换失败');
        setOutput('');
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(
      () => convert(input, direction, delimiter, includeHeaders),
      300
    );
    return () => clearTimeout(timer);
  }, [input, direction, delimiter, includeHeaders, convert]);

  const handleSwap = useCallback(() => {
    const newDir = direction === 'json2csv' ? 'csv2json' : 'json2csv';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'json2csv') {
      setInput(sampleJson);
    } else {
      setInput(sampleCsv);
    }
  }, [direction]);

  return (
    <ToolPage title="JSON ↔ CSV 转换" description="在 JSON 数组和 CSV 格式之间相互转换">
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setDirection('json2csv')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'json2csv'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            JSON → CSV
          </button>
          <button
            onClick={() => setDirection('csv2json')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'csv2json'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            CSV → JSON
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">分隔符:</label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value=",">逗号 (,)</option>
            <option value={'\t'}>制表符 (Tab)</option>
            <option value=";">分号 (;)</option>
          </select>
        </div>

        {direction === 'json2csv' && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            包含表头
          </label>
        )}

        <button
          onClick={loadSample}
          className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          加载示例
        </button>
      </div>
      <DualEditor
        input={input}
        output={output}
        onInputChange={setInput}
        inputLabel={direction === 'json2csv' ? 'JSON' : 'CSV'}
        outputLabel={direction === 'json2csv' ? 'CSV' : 'JSON'}
        inputPlaceholder={
          direction === 'json2csv'
            ? '请输入 JSON 数组，例如 [{"key": "value"}, ...]'
            : '请输入 CSV 数据...'
        }
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
