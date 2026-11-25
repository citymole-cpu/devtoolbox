import { useState, useEffect, useCallback } from 'react';
import { format as sqlFormat } from 'sql-formatter';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type SqlLanguage = 'sql' | 'mysql' | 'postgresql' | 'tsql' | 'plsql';

const languages: { value: SqlLanguage; label: string }[] = [
  { value: 'sql', label: 'SQL (标准)' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'tsql', label: 'T-SQL' },
  { value: 'plsql', label: 'PL/SQL' },
];

export default function SqlFormat() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<SqlLanguage>('sql');
  const [indentSize, setIndentSize] = useState(2);
  const [uppercase, setUppercase] = useState(true);

  const sampleData =
    "SELECT u.id, u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE o.total > 100 AND u.status = 'active' ORDER BY o.total DESC LIMIT 10";

  const formatSql = useCallback(
    (text: string) => {
      if (!text.trim()) {
        setOutput('');
        setError('');
        return;
      }
      try {
        setError('');
        const formatted = sqlFormat(text, {
          language,
          tabWidth: indentSize,
          useTabs: false,
          keywordCase: uppercase ? 'upper' : 'preserve',
        });
        setOutput(formatted);
      } catch (e) {
        setError(`格式化失败: ${e instanceof Error ? e.message : '未知错误'}`);
      }
    },
    [language, indentSize, uppercase]
  );

  useEffect(() => {
    const timer = setTimeout(() => formatSql(input), 200);
    return () => clearTimeout(timer);
  }, [input, formatSql]);

  return (
    <ToolPage title="SQL 格式化" description="SQL 语句格式化，支持 MySQL、PostgreSQL、T-SQL 等方言">
      <div className="space-y-4">
        {/* Options */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">方言:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SqlLanguage)}
              className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
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
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-400">关键字大写</span>
          </label>
          <div className="flex-1" />
          <button
            onClick={() => {
              setInput(sampleData);
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
            setError('');
          }}
          inputLabel="SQL 输入"
          outputLabel="格式化结果"
          inputPlaceholder="请输入 SQL 语句..."
          error={error}
        />
      </div>
    </ToolPage>
  );
}
