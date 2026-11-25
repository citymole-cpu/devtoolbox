import React, { useState, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Keyboard, Search, RefreshCw, Key } from 'lucide-react';

interface KeyInfo {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  location: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

const COMMON_KEYS = [
  { name: 'Backspace 退格', code: 'Backspace', keyCode: 8 },
  { name: 'Tab 制表键', code: 'Tab', keyCode: 9 },
  { name: 'Enter 回车', code: 'Enter', keyCode: 13 },
  { name: 'Shift 上档', code: 'ShiftLeft', keyCode: 16 },
  { name: 'Ctrl 控制', code: 'ControlLeft', keyCode: 17 },
  { name: 'Alt 换档', code: 'AltLeft', keyCode: 18 },
  { name: 'Pause 暂停', code: 'Pause', keyCode: 19 },
  { name: 'Caps Lock 大写锁定', code: 'CapsLock', keyCode: 20 },
  { name: 'Escape 退出', code: 'Escape', keyCode: 27 },
  { name: 'Space 空格', code: 'Space', keyCode: 32 },
  { name: 'Page Up 上翻页', code: 'PageUp', keyCode: 33 },
  { name: 'Page Down 下翻页', code: 'PageDown', keyCode: 34 },
  { name: 'End 结束', code: 'End', keyCode: 35 },
  { name: 'Home 首页', code: 'Home', keyCode: 36 },
  { name: 'ArrowLeft 左光标', code: 'ArrowLeft', keyCode: 37 },
  { name: 'ArrowUp 上光标', code: 'ArrowUp', keyCode: 38 },
  { name: 'ArrowRight 右光标', code: 'ArrowRight', keyCode: 39 },
  { name: 'ArrowDown 下光标', code: 'ArrowDown', keyCode: 40 },
  { name: 'Delete 删除', code: 'Delete', keyCode: 46 },
  { name: '0', code: 'Digit0', keyCode: 48 },
  { name: 'A', code: 'KeyA', keyCode: 65 },
  { name: 'B', code: 'KeyB', keyCode: 66 },
  { name: 'C', code: 'KeyC', keyCode: 67 },
  { name: 'D', code: 'KeyD', keyCode: 68 },
  { name: 'F1', code: 'F1', keyCode: 112 },
  { name: 'F5', code: 'F5', keyCode: 116 },
  { name: 'F12', code: 'F12', keyCode: 123 },
];

export default function KeyCodeTester() {
  const [currentKey, setCurrentKey] = useState<KeyInfo | null>(null);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setCurrentKey({
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        location: e.location,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredKeys = COMMON_KEYS.filter(
    (k) =>
      k.name.toLowerCase().includes(filter.toLowerCase()) ||
      k.code.toLowerCase().includes(filter.toLowerCase()) ||
      String(k.keyCode).includes(filter)
  );

  return (
    <ToolPage
      title="键盘按键值 KeyCode 与事件在线检测"
      description="按下键盘任意键，实时捕捉 event.key、event.code、event.keyCode 数值与修饰键状态，附标准全键盘按键编码速查"
    >
      <div className="space-y-6">
        {/* 按键监听大卡片 */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-dashed border-blue-500/50 flex flex-col items-center justify-center min-h-[220px] text-center shadow-sm">
          {!currentKey ? (
            <div className="space-y-3">
              <Keyboard className="w-16 h-16 mx-auto text-blue-500 animate-pulse" />
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                请在键盘上按下任意按键
              </p>
              <p className="text-xs text-slate-400">
                支持字母、数字、功能键 (F1-F12)、方向键、修饰键 (Ctrl/Shift/Alt/Win) 等
              </p>
            </div>
          ) : (
            <div className="w-full max-w-2xl space-y-6">
              {/* 大号 KeyCode */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                  JavaScript event.keyCode
                </span>
                <span className="text-6xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {currentKey.keyCode}
                </span>
              </div>

              {/* 核心参数卡片 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-0.5">event.key</span>
                  <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100 break-all">
                    {currentKey.key === ' ' ? '(Space)' : currentKey.key}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-0.5">event.code</span>
                  <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100 break-all">
                    {currentKey.code}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-0.5">event.which</span>
                  <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">
                    {currentKey.which}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-0.5">十六进制 (Hex)</span>
                  <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">
                    0x{currentKey.keyCode.toString(16).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 修饰键状态徽章 */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: 'Ctrl', active: currentKey.ctrlKey },
                  { label: 'Shift', active: currentKey.shiftKey },
                  { label: 'Alt', active: currentKey.altKey },
                  { label: 'Meta (Win/Cmd)', active: currentKey.metaKey },
                ].map((mod) => (
                  <span
                    key={mod.label}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      mod.active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {mod.label}: {mod.active ? 'YES' : 'NO'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 常用 KeyCode 对照表 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-500" />
              常见按键 KeyCode 编码速查表
            </h3>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="搜索按键名称、code 或数值..."
                className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 sticky top-0 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">按键说明</th>
                  <th className="p-3">event.code</th>
                  <th className="p-3">event.keyCode (十进制)</th>
                  <th className="p-3">十六进制 (Hex)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredKeys.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{item.name}</td>
                    <td className="p-3 font-mono text-slate-500">{item.code}</td>
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{item.keyCode}</td>
                    <td className="p-3 font-mono text-slate-400">0x{item.keyCode.toString(16).toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

