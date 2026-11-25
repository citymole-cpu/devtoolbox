import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import DualEditor from '../../components/DualEditor';

const MARS_DICT: Record<string, string> = {
  我: '莪', 你: '伱', 他: '彵', 她: '婹', 们: '們', 的: 'の', 是: '寔', 不: '丆',
  爱: '嗳', 喜: '囍', 欢: '歡', 什: '甚', 怎: '怎様', 个: '個', 没: '沒',
  有: '冇', 好: '女子', 么: '麽', 会: '會', 走: 'zou', 想: '想淰', 死: '死灬',
  人: '亾', 天: '兲', 真: '眞', 一: '①', 二: '②', 三: '③', 生: '鐢', 世: '迣',
  忧: '憂', 伤: '傷', 疼: '庝', 痛: '痌', 泪: '淚', 哭: '焅', 笑: '咲', 忘: '亾',
  寂: '漃', 寞: '瘼', 孤: '菰', 单: '單', 经: '經', 历: '歷', 懂: '慬', 说: '説'
};

export default function MarsText() {
  const [input, setInput] = useState<string>('Antigravity 开发者工具箱，这是一个经典的火星文转换器。我们不再忧伤，相逢是首歌。');
  const [mode, setMode] = useState<'mars' | 'chrysanthemum' | 'space' | 'delete'>('mars');

  const processText = () => {
    if (!input) return '';

    if (mode === 'mars') {
      return Array.from(input)
        .map((c) => MARS_DICT[c] || c)
        .join('');
    } else if (mode === 'chrysanthemum') {
      // 菊花文 (在字符后增加组合标记 ҈)
      return Array.from(input)
        .map((c) => (c === '\n' || c === ' ' ? c : `${c}҉`))
        .join('');
    } else if (mode === 'space') {
      // 间隔文（防折叠/防过滤）
      return Array.from(input).join(' ');
    } else if (mode === 'delete') {
      // 删除线文字
      return Array.from(input)
        .map((c) => (c === '\n' ? c : `${c}\u0336`))
        .join('');
    }
    return input;
  };

  const output = processText();

  return (
    <ToolPage
      title="火星文 / 菊花文 / 趣味字体转换器"
      description="非主流怀旧火星文、字符菊花挂件文字、删除线文字与防折叠文字转换器"
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-2">特效风格:</span>
          {[
            { key: 'mars', label: '非主流火星文 (莪の嗳)' },
            { key: 'chrysanthemum', label: '菊花文挂件 (字҉)' },
            { key: 'delete', label: '划线删除字 (字̶)' },
            { key: 'space', label: '防折叠间隔字' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key as any)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                mode === m.key
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <DualEditor
          inputLabel="普通中文 / 文本"
          outputLabel="转换特效结果"
          input={input}
          output={output}
          onInputChange={setInput}
          inputPlaceholder="输入需要转换的文字..."
          outputPlaceholder="转换后的特效文本..."
        />
      </div>
    </ToolPage>
  );
}
