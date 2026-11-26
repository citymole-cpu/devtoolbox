import { useState, useCallback, useMemo } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { CopyButton } from '../../components/CopyButton';
import { useI18n } from '../../components/I18nProvider';
import type { Language } from '../../lib/i18n';
import { Search, Tag, Hash, Replace } from 'lucide-react';

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

interface RegexStrings {
  presets: string;
  presetEmail: string;
  presetUrl: string;
  presetMobile: string;
  presetDate: string;
  presetIpv4: string;
  pattern: string;
  patternPh: string;
  testText: string;
  testTextPh: string;
  replacement: string;
  replacementPh: string;
  replaceResult: string;
  highlight: string;
  matches: string;
  matchUnit: string;
  noMatch: string;
  colNo: string;
  colMatch: string;
  colIndex: string;
  colGroups: string;
  errorTitle: string;
}

const STRINGS: Record<Language, RegexStrings> = {
  'zh-CN': {
    presets: '常用正则',
    presetEmail: '邮箱',
    presetUrl: 'URL',
    presetMobile: '中国手机号',
    presetDate: '日期',
    presetIpv4: 'IPv4 地址',
    pattern: '正则表达式',
    patternPh: '输入正则表达式...',
    testText: '测试文本',
    testTextPh: '输入要匹配的文本...',
    replacement: '替换文本',
    replacementPh: '输入替换内容，支持 $1、$& 等占位符...',
    replaceResult: '替换结果',
    highlight: '匹配高亮',
    matches: '匹配结果',
    matchUnit: '个匹配',
    noMatch: '无匹配结果',
    colNo: '#',
    colMatch: '匹配内容',
    colIndex: '位置',
    colGroups: '捕获组',
    errorTitle: '正则表达式无效',
  },
  'en-US': {
    presets: 'Common patterns',
    presetEmail: 'Email',
    presetUrl: 'URL',
    presetMobile: 'Chinese mobile',
    presetDate: 'Date',
    presetIpv4: 'IPv4 address',
    pattern: 'Regular expression',
    patternPh: 'Enter a regular expression...',
    testText: 'Test text',
    testTextPh: 'Enter text to match against...',
    replacement: 'Replacement',
    replacementPh: 'Replacement text, supports $1, $& placeholders...',
    replaceResult: 'Replace result',
    highlight: 'Highlighted matches',
    matches: 'Matches',
    matchUnit: 'matches',
    noMatch: 'No matches found',
    colNo: '#',
    colMatch: 'Match',
    colIndex: 'Index',
    colGroups: 'Capture groups',
    errorTitle: 'Invalid regular expression',
  },
  'ja-JP': {
    presets: 'よく使う正規表現',
    presetEmail: 'メールアドレス',
    presetUrl: 'URL',
    presetMobile: '中国の携帯番号',
    presetDate: '日付',
    presetIpv4: 'IPv4 アドレス',
    pattern: '正規表現',
    patternPh: '正規表現を入力...',
    testText: 'テストテキスト',
    testTextPh: 'マッチさせたいテキストを入力...',
    replacement: '置換文字列',
    replacementPh: '置換後の文字列（$1、$& が使用可能）...',
    replaceResult: '置換結果',
    highlight: 'マッチのハイライト',
    matches: 'マッチ結果',
    matchUnit: '件の一致',
    noMatch: '一致するものがありません',
    colNo: '#',
    colMatch: 'マッチ内容',
    colIndex: '位置',
    colGroups: 'キャプチャグループ',
    errorTitle: '正規表現が無効です',
  },
};

const COMMON_PATTERNS: { key: 'presetEmail' | 'presetUrl' | 'presetMobile' | 'presetDate' | 'presetIpv4'; pattern: string; flags: string }[] = [
  { key: 'presetEmail', pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$', flags: 'gm' },
  { key: 'presetUrl', pattern: 'https?://[^\\s]+', flags: 'g' },
  { key: 'presetMobile', pattern: '^1[3-9]\\d{9}$', flags: 'gm' },
  { key: 'presetDate', pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}', flags: 'g' },
  { key: 'presetIpv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
];

const FLAG_LIST = ['g', 'i', 'm', 's', 'u', 'y'] as const;

export default function RegexTester() {
  const { language } = useI18n();
  const s = STRINGS[language];
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('$1');
  const [flags, setFlags] = useState<Record<string, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });

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
      const newFlags: Record<string, boolean> = { g: false, i: false, m: false, s: false, u: false, y: false };
      for (const f of preset.flags) {
        if (f in newFlags) newFlags[f] = true;
      }
      setFlags(newFlags);
    },
    []
  );

  const { matches, highlightedHtml, error, replaceResult } = useMemo(() => {
    const empty = { matches: [] as MatchResult[], highlightedHtml: '', error: '', replaceResult: '' };
    if (!pattern || !testString) {
      return empty;
    }

    try {
      const regex = new RegExp(pattern, flagString);

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

      // Replace mode: same regex + replacement text
      const replaceResult = testString.replace(new RegExp(pattern, flagString), replacement);

      return { matches: results, highlightedHtml: html, error: '', replaceResult };
    } catch (e) {
      return { matches: [] as MatchResult[], highlightedHtml: '', error: (e as Error).message, replaceResult: '' };
    }
  }, [pattern, testString, flagString, replacement]);

  return (
    <ToolPage title="正则表达式测试器" description="实时测试正则表达式，高亮匹配结果，查看捕获组与替换结果">
      <div className="space-y-4">
        {/* Common patterns */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">{s.presets}</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_PATTERNS.map((p) => (
              <button
                key={p.key}
                onClick={() => selectPreset(p)}
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors"
              >
                {s[p.key]}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Search className="w-4 h-4" />
            {s.pattern}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-lg font-mono">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500"
              placeholder={s.patternPh}
            />
            <span className="text-gray-500 text-lg font-mono">/</span>
            <span className="text-gray-400 font-mono text-sm min-w-[40px]">{flagString}</span>
          </div>
          {/* Flag toggles */}
          <div className="flex items-center gap-3">
            {FLAG_LIST.map((f) => (
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
            {s.errorTitle}: {error}
          </div>
        )}

        {/* Test string */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">{s.testText}</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500 min-h-[120px] resize-y"
            placeholder={s.testTextPh}
          />
        </div>

        {/* Highlighted result */}
        {testString && pattern && !error && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {s.highlight}
              <CopyButton text={testString} />
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
              {s.matches}
              <span className="text-blue-400">({matches.length} {s.matchUnit})</span>
            </label>
            {matches.length > 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                      <th className="px-3 py-2 text-left">{s.colNo}</th>
                      <th className="px-3 py-2 text-left">{s.colMatch}</th>
                      <th className="px-3 py-2 text-left">{s.colIndex}</th>
                      <th className="px-3 py-2 text-left">{s.colGroups}</th>
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
                {s.noMatch}
              </div>
            )}
          </div>
        )}

        {/* Replace mode */}
        {testString && pattern && !error && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Replace className="w-4 h-4" />
              {s.replacement}
            </label>
            <input
              type="text"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500"
              placeholder={s.replacementPh}
            />
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              {s.replaceResult}
              <CopyButton text={replaceResult} />
            </label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-gray-200 whitespace-pre-wrap break-all">
              {replaceResult}
            </div>
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
