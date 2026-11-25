import { useState, useCallback, useMemo } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { CopyButton } from '../../components/CopyButton';
import { Search, Tag, Hash } from 'lucide-react';

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

const COMMON_PATTERNS: { label: string; pattern: string; flags: string }[] = [
  { label: '手机号', pattern: '^1[3-9]\\d{9}$', flags: 'gm' },
  { label: '邮箱', pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$', flags: 'gm' },
  { label: 'IP地址', pattern: '^(\\d{1,3}\\.){3}\\d{1,3}$', flags: 'gm' },
  { label: '身份证', pattern: '^\\d{17}[\\dXx]$', flags: 'gm' },
  { label: 'URL', pattern: '^https?://[\\w.-]+', flags: 'gm' },
  { label: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState<Record<string, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
  });
  const [error, setError] = useState('');

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join('');
  }, [flags]);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const selectPreset = useCallback(
    (preset: { pattern: string; flags: string }) => {
      setPattern(preset.pattern);
      const newFlags: Record<string, boolean> = { g: false, i: false, m: false, s: false, u: false };
      for (const f of preset.flags) {
        if (f in newFlags) newFlags[f] = true;
      }
      setFlags(newFlags);
    },
    []
  );

  const { matches, highlightedHtml } = useMemo(() => {
    if (!pattern || !testString) {
      return { matches: [] as MatchResult[], highlightedHtml: '' };
    }

    try {
      const regex = new RegExp(pattern, flagString);
      setError('');

      const results: MatchResult[] = [];
      let match: RegExpExecArray | null;

      if (flagString.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      // Build highlighted HTML
      let html = '';
      let lastIndex = 0;
      const sortedMatches = [...results].sort((a, b) => a.index - b.index);
      for (const m of sortedMatches) {
        const before = testString.slice(lastIndex, m.index);
        html += escapeHtml(before);
        html += `<mark class="bg-yellow-400/40 text-yellow-200 rounded px-0.5">${escapeHtml(m.match)}</mark>`;
        lastIndex = m.index + m.match.length;
      }
      html += escapeHtml(testString.slice(lastIndex));

      return { matches: results, highlightedHtml: html };
    } catch (e) {
      setError((e as Error).message);
      return { matches: [] as MatchResult[], highlightedHtml: '' };
    }
  }, [pattern, testString, flagString]);

  return (
    <ToolPage title="正则测试器" description="实时测试正则表达式，高亮匹配结果，查看捕获组">
      <div className="space-y-4">
        {/* Common patterns */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">常用正则</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_PATTERNS.map((p) => (
              <button
                key={p.label}
                onClick={() => selectPreset(p)}
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Search className="w-4 h-4" />
            正则表达式
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-lg font-mono">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500"
              placeholder="输入正则表达式..."
            />
            <span className="text-gray-500 text-lg font-mono">/</span>
            <span className="text-gray-400 font-mono text-sm min-w-[40px]">{flagString}</span>
          </div>
          {/* Flag toggles */}
          <div className="flex items-center gap-3">
            {['g', 'i', 'm', 's', 'u'].map((f) => (
              <label
                key={f}
                className="flex items-center gap-1.5 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={flags[f]}
                  onChange={() => toggleFlag(f)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300 font-mono">{f}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Test string */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">测试字符串</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500 min-h-[120px] resize-y"
            placeholder="输入要匹配的文本..."
          />
        </div>

        {/* Highlighted result */}
        {testString && pattern && !error && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              匹配高亮
            </label>
            <div
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-gray-200 whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </div>
        )}

        {/* Match results */}
        {testString && pattern && !error && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              匹配结果
              <span className="text-blue-400">({matches.length} 个匹配)</span>
            </label>
            {matches.length > 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">匹配内容</th>
                      <th className="px-3 py-2 text-left">位置</th>
                      <th className="px-3 py-2 text-left">捕获组</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m, i) => (
                      <tr key={i} className="border-b border-gray-700/50 text-gray-300">
                        <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                        <td className="px-3 py-2 font-mono text-yellow-300">
                          <div className="flex items-center gap-2">
                            {m.match}
                            <CopyButton text={m.match} />
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-400">{m.index}</td>
                        <td className="px-3 py-2 font-mono text-green-400">
                          {m.groups.length > 0
                            ? m.groups.map((g, gi) => (
                                <span key={gi} className="mr-2">
                                  ${gi + 1}: {g ?? 'undefined'}
                                </span>
                              ))
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-sm bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                无匹配结果
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
