import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CodeEditor from '../../components/CodeEditor';
import CopyButton from '../../components/CopyButton';
import { Type, Sparkles, Download, RefreshCw } from 'lucide-react';

const FONTS: Record<string, Record<string, string[]>> = {
  standard: {
    A: ['  /\\  ', ' /  \\ ', '/ /\\ \\', '| |__| |', '|  __  |', '| |  | |'],
    B: ['|  _ \\ ', '| |_) |', '|  _ < ', '| |_) |', '|____/ '],
    C: ['  ____ ', ' / ___|', '| |    ', '| |___ ', ' \\____|'],
    D: [' ____  ', '|  _ \\ ', '| | | |', '| |_| |', '|____/ '],
    E: [' _____ ', '| ____|', '|  _|  ', '| |___ ', '|_____|'],
    F: [' _____ ', '|  ___|', '| |_   ', '|  _|  ', '|_|    '],
    G: ['  ____ ', ' / ___|', '| |  _ ', '| |_| |', ' \\____|'],
    H: [' _   _ ', '| | | |', '| |_| |', '|  _  |', '|_| |_|'],
    I: [' ___ ', '|_ _|', ' | | ', ' | | ', '|___|'],
    J: ['     _ ', '    | |', ' _  | |', '| |_| |', ' \\___/ '],
    K: [' _  __', '| |/ /', '| ' + "' / ", '| . \\ ', '|_|\\_\\'],
    L: [' _     ', '| |    ', '| |    ', '| |___ ', '|_____|'],
    M: [' __  __ ', '|  \\/  |', '| |\\/| |', '| |  | |', '|_|  |_|'],
    N: [' _   _ ', '| \\ | |', '|  \\| |', '| |\\  |', '|_| \\_|'],
    O: ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ '],
    P: [' ____  ', '|  _ \\ ', '| |_) |', '|  __/ ', '|_|    '],
    Q: ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\__\\_\\'],
    R: [' ____  ', '|  _ \\ ', '| |_) |', '|  _ < ', '|_| \\_\\'],
    S: [' ____  ', '/ ___| ', '\\___ \\ ', ' ___) |', '|____/ '],
    T: [' _____ ', '|_   _|', '  | |  ', '  | |  ', '  |_|  '],
    U: [' _   _ ', '| | | |', '| | | |', '| |_| |', ' \\___/ '],
    V: ['__     __', '\\ \\   / /', ' \\ \\ / / ', '  \\ V /  ', '   \\_/   '],
    W: ['__        __', '\\ \\      / /', ' \\ \\ /\\ / / ', '  \\ V  V /  ', '   \\_/\\_/   '],
    X: ['__  __', '\\ \\/ /', ' \\  / ', ' /  \\ ', '/_/\\_\\'],
    Y: ['__   __', '\\ \\ / /', ' \\ V / ', '  | |  ', '  |_|  '],
    Z: [' _____', '|__  /', '  / / ', ' / /_ ', '/____|'],
    ' ': ['   ', '   ', '   ', '   ', '   '],
    '0': ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ '],
    '1': [' _ ', '/ |', ' | |', ' | |', ' |_|'],
    '2': [' ____  ', '|___ \\ ', '  __) |', ' / __/ ', '|_____|'],
    '3': [' _____ ', '|___ / ', '  |_ \\ ', ' ___) |', '|____/ '],
    '4': [' _  _   ', '| || |  ', '| || |_ ', '|__   _|', '   |_|  '],
    '5': [' ____  ', '| ___| ', '|___ \\ ', ' ___) |', '|____/ '],
    '!': [' _ ', '| |', '| |', '|_|', '(_)'],
    '-': ['      ', '      ', '------', '      ', '      '],
  },
  blocks: {
    A: ['█████', '█   █', '█████', '█   █', '█   █'],
    B: ['████ ', '█   █', '████ ', '█   █', '████ '],
    C: ['█████', '█    ', '█    ', '█    ', '█████'],
    D: ['████ ', '█   █', '█   █', '█   █', '████ '],
    E: ['█████', '█    ', '████ ', '█    ', '█████'],
    F: ['█████', '█    ', '████ ', '█    ', '█    '],
    G: ['█████', '█    ', '█ ███', '█   █', '█████'],
    H: ['█   █', '█   █', '█████', '█   █', '█   █'],
    I: ['███', ' █ ', ' █ ', ' █ ', '███'],
    J: ['  ███', '   █ ', '   █ ', '█  █ ', '████ '],
    K: ['█  ██', '█ ██ ', '███  ', '█ ██ ', '█  ██'],
    L: ['█    ', '█    ', '█    ', '█    ', '█████'],
    M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    O: ['█████', '█   █', '█   █', '█   █', '█████'],
    P: ['█████', '█   █', '█████', '█    ', '█    '],
    R: ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
    S: ['█████', '█    ', '█████', '    █', '█████'],
    T: ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    U: ['█   █', '█   █', '█   █', '█   █', '█████'],
    V: ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    X: ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    Z: ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    ' ': ['  ', '  ', '  ', '  ', '  '],
    '-': ['     ', '     ', '█████', '     ', '     '],
    '0': ['█████', '█ █ █', '█ █ █', '█ █ █', '█████'],
    '1': [' ██ ', '  █ ', '  █ ', '  █ ', '████'],
  },
};

export default function AsciiArt() {
  const [text, setText] = useState<string>('ANTIGRAVITY');
  const [fontType, setFontType] = useState<string>('standard');

  const generateAscii = () => {
    const font = FONTS[fontType] || FONTS.standard;
    const height = fontType === 'standard' ? 5 : 5;
    const rows: string[] = Array.from({ length: height }, () => '');

    const upper = text.toUpperCase();
    for (const char of upper) {
      const glyph = font[char] || font[' '] || Array.from({ length: height }, () => '   ');
      for (let r = 0; r < height; r++) {
        rows[r] += (glyph[r] || '   ') + ' ';
      }
    }
    return rows.join('\n');
  };

  const output = generateAscii();

  return (
    <ToolPage
      title="ASCII 艺术字 / 字符画生成器"
      description="输入文字生成 CLI 启动 Banner、终端大字与字符画徽标，支持空心线条字与实心方块字"
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">输入英文/数字:</span>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入文本生成 ASCII 艺术字..."
              className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">艺术字体:</span>
            <select
              value={fontType}
              onChange={(e) => setFontType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
            >
              <option value="standard">经典斜体线条字 (Standard)</option>
              <option value="blocks">实心方块字 (Solid Blocks)</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              生成的 ASCII 字符画效果
            </span>
            <CopyButton text={output} label="复制字符艺术字" />
          </div>
          <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre leading-snug rounded-b-xl selection:bg-emerald-900 selection:text-white">
            {output}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

