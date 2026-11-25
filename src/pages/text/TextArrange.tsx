import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import DualEditor from '../../components/DualEditor';
import { AlignVerticalSpaceAround, Shuffle, Filter, ListOrdered, Scissors, Eraser } from 'lucide-react';

export default function TextArrange() {
  const [input, setInput] = useState<string>(
    '1. Antigravity 开发者工具箱\n2. 纯前端离线安全运行\n3. 极速响应零数据泄露\n4. 支持深色浅色模式切换\n5. 全局 Ctrl + K 秒级检索'
  );
  const [action, setAction] = useState<string>('vertical');
  const [delimiter, setDelimiter] = useState<string>(',');
  const [columnNum, setColumnNum] = useState<number>(1);
  const [lineLengthMin, setLineLengthMin] = useState<number>(5);

  const processText = () => {
    if (!input) return '';
    const lines = input.split('\n');

    switch (action) {
      case 'vertical': {
        // 中文古籍式从右至左或普通从左至右竖向排版
        const maxLen = Math.max(...lines.map((l) => Array.from(l).length), 0);
        const resultCols: string[] = [];
        for (let col = 0; col < maxLen; col++) {
          let rowStr = '';
          // 从最后一行到第一行（古典从右至左）
          for (let r = lines.length - 1; r >= 0; r--) {
            const ch = Array.from(lines[r])[col] || '　';
            rowStr += ch + ' ';
          }
          resultCols.push(rowStr);
        }
        return resultCols.join('\n');
      }
      case 'shuffle': {
        // 随机打乱行顺序
        const arr = [...lines];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('\n');
      }
      case 'clean-empty': {
        // 清理空行
        return lines.filter((l) => l.trim().length > 0).join('\n');
      }
      case 'one-line': {
        // 多行合为一行
        return lines
          .map((l) => l.trim())
          .filter(Boolean)
          .join(delimiter);
      }
      case 'extract-column': {
        // 按空格或分隔符截取某一列
        return lines
          .map((l) => {
            const parts = l.trim().split(/[\s,，|\t]+/);
            return parts[columnNum - 1] || '';
          })
          .filter(Boolean)
          .join('\n');
      }
      case 'remove-numbers': {
        // 清除数字
        return input.replace(/\d+/g, '');
      }
      case 'remove-english': {
        // 清除英文字母
        return input.replace(/[a-zA-Z]+/g, '');
      }
      case 'remove-chinese': {
        // 清除中文字符
        return input.replace(/[\u4e00-\u9fa5]+/g, '');
      }
      case 'remove-symbols': {
        // 清除特殊标点符号
        return input.replace(/[^\w\s\u4e00-\u9fa5]/g, '');
      }
      case 'filter-length': {
        // 过滤保留长度大于等于 N 的行
        return lines.filter((l) => l.trim().length >= lineLengthMin).join('\n');
      }
      default:
        return input;
    }
  };

  const output = processText();

  return (
    <ToolPage
      title="文本排版与多维批量清洗"
      description="整合文本古风竖排、多行合一、随机乱序、按列提取分词，以及中英文/数字/特殊符号的精准过滤与清洗"
    >
      <div className="space-y-4">
        {/* 控制选项栏 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-2">操作动作:</span>
            {[
              { key: 'vertical', label: '古典文字竖排' },
              { key: 'shuffle', label: '随机打乱行' },
              { key: 'clean-empty', label: '去除所有空行' },
              { key: 'one-line', label: '多行合并为单行' },
              { key: 'extract-column', label: '按列提取' },
              { key: 'remove-numbers', label: '清除所有数字' },
              { key: 'remove-english', label: '清除所有英文' },
              { key: 'remove-chinese', label: '清除所有中文' },
              { key: 'remove-symbols', label: '清除标点符号' },
              { key: 'filter-length', label: '按行字数过滤' },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setAction(btn.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  action === btn.key
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {action === 'one-line' && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500">连接分隔符:</span>
              <input
                type="text"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center font-mono"
              />
              <span className="text-slate-400">（如逗号、空格、分号、竖线等）</span>
            </div>
          )}

          {action === 'extract-column' && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500">提取第几列:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={columnNum}
                onChange={(e) => setColumnNum(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center font-mono"
              />
              <span className="text-slate-400">（按照空格、制表符或逗号分列）</span>
            </div>
          )}

          {action === 'filter-length' && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500">最小保留字数:</span>
              <input
                type="number"
                min={1}
                max={500}
                value={lineLengthMin}
                onChange={(e) => setLineLengthMin(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center font-mono"
              />
              <span className="text-slate-400">（过滤少于该字符长度的短文本行）</span>
            </div>
          )}
        </div>

        <DualEditor
          inputLabel="原始输入文本"
          outputLabel="处理排版结果"
          input={input}
          output={output}
          onInputChange={setInput}
          inputPlaceholder="粘贴需要排版或清洗的文本内容..."
          outputPlaceholder="处理后的结果将显示在这里..."
        />
      </div>
    </ToolPage>
  );
}

