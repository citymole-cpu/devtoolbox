import { useState, useMemo } from 'react';
import { ToolPage } from '../../components/ToolPage';
import {
  Type,
  Hash,
  AlignLeft,
  FileText,
  LetterText,
  Binary,
  Rows3,
  Pilcrow,
  MessageSquareText,
  Space,
} from 'lucide-react';

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export default function TextStats() {
  const [input, setInput] = useState('');

  const stats = useMemo((): StatItem[] => {
    const text = input;
    const totalChars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishLetters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/\d/g) || []).length;
    const lines = text ? text.split('\n').length : 0;
    const paragraphs = text.trim()
      ? text
          .trim()
          .split(/\n\s*\n/)
          .filter((p) => p.trim().length > 0).length
      : 0;
    const sentences = (text.match(/[.!?。！？]+/g) || []).length || (text.trim() ? (text.match(/[^.!?。！？]+/g) || []).length : 0);
    const byteSize = new TextEncoder().encode(text).length;

    return [
      { label: '字符数', value: totalChars, icon: <Type className="w-5 h-5" />, color: 'text-blue-400' },
      { label: '字符数(不含空格)', value: charsNoSpace, icon: <Space className="w-5 h-5" />, color: 'text-cyan-400' },
      { label: '单词数', value: words, icon: <LetterText className="w-5 h-5" />, color: 'text-green-400' },
      { label: '中文字符数', value: chineseChars, icon: <MessageSquareText className="w-5 h-5" />, color: 'text-yellow-400' },
      { label: '英文字母数', value: englishLetters, icon: <AlignLeft className="w-5 h-5" />, color: 'text-purple-400' },
      { label: '数字数', value: digits, icon: <Hash className="w-5 h-5" />, color: 'text-orange-400' },
      { label: '行数', value: lines, icon: <Rows3 className="w-5 h-5" />, color: 'text-pink-400' },
      { label: '段落数', value: paragraphs, icon: <Pilcrow className="w-5 h-5" />, color: 'text-indigo-400' },
      { label: '句子数', value: sentences, icon: <FileText className="w-5 h-5" />, color: 'text-teal-400' },
      { label: '字节数 (UTF-8)', value: formatBytes(byteSize), icon: <Binary className="w-5 h-5" />, color: 'text-red-400' },
    ];
  }, [input]);

  return (
    <ToolPage title="文本统计" description="实时统计文本的字符数、单词数、行数等详细信息">
      <div className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">输入文本</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500 min-h-[200px] resize-y"
            placeholder="在此输入或粘贴文本，统计结果将实时更新..."
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 hover:border-gray-600 transition-colors"
            >
              <div className={`${stat.color}`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
              <div className="text-xs text-gray-400 text-center">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
