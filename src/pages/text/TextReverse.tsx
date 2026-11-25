import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import DualEditor from '../../components/DualEditor';
import { ArrowLeftRight, RotateCcw, FlipHorizontal } from 'lucide-react';

const UPSIDE_DOWN_MAP: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ',
  j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ',
  s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'ᗺ', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I',
  J: 'ſ', K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ',
  S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': '\'', '\'': ',', '"': '„', '!': '¡', '?': '¿', '<': '>', '>': '<', '_': '‾'
};

export default function TextReverse() {
  const [input, setInput] = useState<string>('Antigravity Toolbox\nHello World!\n这是一段需要倒序反转的文本测试。');
  const [mode, setMode] = useState<'char' | 'line' | 'word' | 'upside'>('char');

  const processText = () => {
    if (!input) return '';

    if (mode === 'char') {
      // 逐字符倒序（保持换行）
      return input
        .split('\n')
        .map((line) => Array.from(line).reverse().join(''))
        .join('\n');
    } else if (mode === 'line') {
      // 逐行倒序
      return input.split('\n').reverse().join('\n');
    } else if (mode === 'word') {
      // 单词倒序
      return input
        .split('\n')
        .map((line) => line.split(/\s+/).reverse().join(' '))
        .join('\n');
    } else if (mode === 'upside') {
      // 倒置文字
      return Array.from(input)
        .reverse()
        .map((ch) => UPSIDE_DOWN_MAP[ch] || ch)
        .join('');
    }
    return input;
  };

  const output = processText();

  return (
    <ToolPage
      title="文本倒序 / 翻转 / 颠倒工具"
      description="支持逐字符倒序、行倒序、词倒序与 Unicode 颠倒倒立文字转换"
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-2">翻转模式:</span>
          {[
            { key: 'char', label: '字符逐字倒序' },
            { key: 'line', label: '按行首尾倒序' },
            { key: 'word', label: '单词按词倒序' },
            { key: 'upside', label: '颠倒倒立字 (uʍop ǝpısd∩)' },
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
          inputLabel="原始输入文本"
          outputLabel="翻转输出文本"
          input={input}
          output={output}
          onInputChange={setInput}
          inputPlaceholder="输入要倒序或颠倒的文本..."
          outputPlaceholder="翻转结果将在此处实时显示..."
        />
      </div>
    </ToolPage>
  );
}
