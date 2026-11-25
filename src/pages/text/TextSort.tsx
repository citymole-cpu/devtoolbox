import { useState, useCallback } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { CodeEditor } from '../../components/CodeEditor';
import { CopyButton } from '../../components/CopyButton';
import {
  ArrowUpAZ,
  ArrowDownZA,
  Copy,
  Trash2,
  Shuffle,
  ArrowUpDown,
  ListOrdered,
  RemoveFormatting,
  Rows3,
} from 'lucide-react';

export default function TextSort() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [trimWhitespace, setTrimWhitespace] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);

  const getLines = useCallback(() => {
    let lines = input.split('\n');
    if (trimWhitespace) {
      lines = lines.map((l) => l.trim());
    }
    return lines;
  }, [input, trimWhitespace]);

  const compareFunc = useCallback(
    (a: string, b: string) => {
      const aa = caseInsensitive ? a.toLowerCase() : a;
      const bb = caseInsensitive ? b.toLowerCase() : b;
      return aa.localeCompare(bb, 'zh-CN');
    },
    [caseInsensitive]
  );

  const sortAsc = useCallback(() => {
    setOutput(getLines().sort(compareFunc).join('\n'));
  }, [getLines, compareFunc]);

  const sortDesc = useCallback(() => {
    setOutput(
      getLines()
        .sort((a, b) => compareFunc(b, a))
        .join('\n')
    );
  }, [getLines, compareFunc]);

  const deduplicate = useCallback(() => {
    const lines = getLines();
    const seen = new Set<string>();
    const result: string[] = [];
    for (const line of lines) {
      const key = caseInsensitive ? line.toLowerCase() : line;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      }
    }
    setOutput(result.join('\n'));
  }, [getLines, caseInsensitive]);

  const removeEmpty = useCallback(() => {
    setOutput(
      getLines()
        .filter((l) => l.trim() !== '')
        .join('\n')
    );
  }, [getLines]);

  const reverse = useCallback(() => {
    setOutput(getLines().reverse().join('\n'));
  }, [getLines]);

  const shuffle = useCallback(() => {
    const lines = getLines();
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    setOutput(lines.join('\n'));
  }, [getLines]);

  const sortByLength = useCallback(() => {
    setOutput(
      getLines()
        .sort((a, b) => a.length - b.length)
        .join('\n')
    );
  }, [getLines]);

  const addLineNumbers = useCallback(() => {
    setOutput(
      getLines()
        .map((line, i) => `${i + 1}. ${line}`)
        .join('\n')
    );
  }, [getLines]);

  const removeLineNumbers = useCallback(() => {
    setOutput(
      getLines()
        .map((line) => line.replace(/^\d+[\.\)\-\:]\s*/, ''))
        .join('\n')
    );
  }, [getLines]);

  const loadSample = useCallback(() => {
    setInput('苹果\n香蕉\n橘子\n苹果\n葡萄\n\n西瓜\n香蕉\n芒果\n草莓\n橘子');
  }, []);

  const actions = [
    { label: '升序排序', icon: <ArrowUpAZ className="w-4 h-4" />, handler: sortAsc },
    { label: '降序排序', icon: <ArrowDownZA className="w-4 h-4" />, handler: sortDesc },
    { label: '去重', icon: <Copy className="w-4 h-4" />, handler: deduplicate },
    { label: '去除空行', icon: <Trash2 className="w-4 h-4" />, handler: removeEmpty },
    { label: '反转行序', icon: <ArrowUpDown className="w-4 h-4" />, handler: reverse },
    { label: '随机打乱', icon: <Shuffle className="w-4 h-4" />, handler: shuffle },
    { label: '按行长度排序', icon: <Rows3 className="w-4 h-4" />, handler: sortByLength },
    { label: '添加行号', icon: <ListOrdered className="w-4 h-4" />, handler: addLineNumbers },
    { label: '去除行号', icon: <RemoveFormatting className="w-4 h-4" />, handler: removeLineNumbers },
  ];

  return (
    <ToolPage title="文本排序/去重" description="对文本按行进行排序、去重、打乱等操作">
      <div className="space-y-4">
        {/* Options */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={loadSample}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
          >
            加载示例
          </button>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
            去除行首尾空白
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
            <input
              type="checkbox"
              checked={caseInsensitive}
              onChange={(e) => setCaseInsensitive(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
            忽略大小写
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.handler}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-sm"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Dual editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">输入</label>
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="每行一个条目..."
              minHeight="300px"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">输出</label>
              <CopyButton text={output} />
            </div>
            <CodeEditor
              value={output}
              onChange={() => {}}
              readOnly
              placeholder="处理结果..."
              minHeight="300px"
            />
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
