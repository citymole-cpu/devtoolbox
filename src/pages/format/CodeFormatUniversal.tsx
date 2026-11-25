import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import DualEditor from '../../components/DualEditor';
import { Code2, Minimize2, Indent, AlignLeft } from 'lucide-react';

export default function CodeFormatUniversal() {
  const [lang, setLang] = useState<string>('python');
  const [indentSize, setIndentSize] = useState<number>(4);
  const [input, setInput] = useState<string>(
    `def calculate_fibonacci(n):\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    fib = [0, 1]\n    while len(fib) < n:\n        fib.append(fib[-1] + fib[-2])\n    return fib\n\nprint(calculate_fibonacci(10))`
  );

  const formatCode = (code: string) => {
    if (!code.trim()) return '';

    const lines = code.split('\n');
    let currentIndent = 0;
    const indentStr = ' '.repeat(indentSize);
    const result: string[] = [];

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        result.push('');
        continue;
      }

      // 如果当前行是闭合括号或缩进结束标志，先减少缩进
      if (/^[}\])]|^(elif|else|except|finally|catch|case|default):?/.test(line)) {
        currentIndent = Math.max(0, currentIndent - 1);
      }

      result.push(indentStr.repeat(currentIndent) + line);

      // 如果当前行是以 { 或 : 结尾，或者类似开始块，增加下一行缩进
      if (/[{[(:]$/.test(line) || /^(def|class|if|for|while|try|catch|else|elif|switch)\b/.test(line)) {
        currentIndent++;
      }
    }

    return result.join('\n');
  };

  const minifyCode = (code: string) => {
    return code
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s*([;{}(),=+\-*/<>])\s*/g, '$1');
  };

  const [output, setOutput] = useState<string>(formatCode(input));

  const handleFormat = () => {
    setOutput(formatCode(input));
  };

  const handleMinify = () => {
    setOutput(minifyCode(input));
  };

  return (
    <ToolPage
      title="多语言代码通用格式化与美化"
      description="整合 Python、Java、C/C++、C#、PHP、Go、Rust 等多语言代码缩进排版美化与代码紧凑压缩"
    >
      <div className="space-y-4">
        {/* 工具栏 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-2">编程语言:</span>
            {[
              { key: 'python', label: 'Python' },
              { key: 'java', label: 'Java / C#' },
              { key: 'c', label: 'C / C++' },
              { key: 'php', label: 'PHP' },
              { key: 'go', label: 'Go / Rust' },
              { key: 'ruby', label: 'Ruby / Perl' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setLang(item.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  lang === item.key
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">缩进空格:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              >
                <option value={2}>2 空格</option>
                <option value={4}>4 空格</option>
              </select>
            </div>

            <button
              onClick={handleFormat}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Indent className="w-3.5 h-3.5" />
              美化格式化
            </button>
            <button
              onClick={handleMinify}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              单行压缩
            </button>
          </div>
        </div>

        <DualEditor
          inputLabel="源码输入"
          outputLabel="格式化输出"
          input={input}
          output={output}
          onInputChange={(v) => {
            setInput(v);
            setOutput(formatCode(v));
          }}
          inputPlaceholder="粘贴任意语言的源代码..."
          outputPlaceholder="美化后的代码将显示在此处..."
        />
      </div>
    </ToolPage>
  );
}

