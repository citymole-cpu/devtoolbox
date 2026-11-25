import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import CodeEditor from '../../components/CodeEditor';
import { Sparkles, Square, Play, Layers } from 'lucide-react';

export default function CssVisualGenerator() {
  const [activeTab, setActiveTab] = useState<'radius' | 'triangle' | 'glass' | 'button'>('radius');

  // 圆角状态 (8-value border-radius)
  const [tl, setTl] = useState<number>(30);
  const [tr, setTr] = useState<number>(70);
  const [br, setBr] = useState<number>(70);
  const [bl, setBl] = useState<number>(30);

  // 三角形状态
  const [triDir, setTriDir] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [triSize, setTriSize] = useState<number>(40);
  const [triColor, setTriColor] = useState<string>('#3b82f6');

  // 毛玻璃状态
  const [glassBlur, setGlassBlur] = useState<number>(16);
  const [glassOpacity, setGlassOpacity] = useState<number>(25);

  // 按钮状态
  const [btnFrom, setBtnFrom] = useState<string>('#3b82f6');
  const [btnTo, setBtnTo] = useState<string>('#8b5cf6');
  const [btnShadow, setBtnShadow] = useState<number>(15);

  // 生成的 CSS 代码
  const getCssCode = () => {
    if (activeTab === 'radius') {
      const radiusValue = `${tl}% ${100 - tl}% ${br}% ${100 - br}% / ${100 - bl}% ${tr}% ${100 - tr}% ${bl}%`;
      return `/* 创意不规则圆角 */\nborder-radius: ${radiusValue};\nbackground: linear-gradient(135deg, #6366f1, #a855f7);`;
    } else if (activeTab === 'triangle') {
      let bTop = '0', bBottom = '0', bLeft = '0', bRight = '0';
      if (triDir === 'top') {
        bBottom = `${triSize}px solid ${triColor}`;
        bLeft = `${triSize}px solid transparent`;
        bRight = `${triSize}px solid transparent`;
      } else if (triDir === 'bottom') {
        bTop = `${triSize}px solid ${triColor}`;
        bLeft = `${triSize}px solid transparent`;
        bRight = `${triSize}px solid transparent`;
      } else if (triDir === 'left') {
        bRight = `${triSize}px solid ${triColor}`;
        bTop = `${triSize}px solid transparent`;
        bBottom = `${triSize}px solid transparent`;
      } else if (triDir === 'right') {
        bLeft = `${triSize}px solid ${triColor}`;
        bTop = `${triSize}px solid transparent`;
        bBottom = `${triSize}px solid transparent`;
      }
      return `/* 纯 CSS 几何三角形 */\nwidth: 0;\nheight: 0;\nborder-top: ${bTop};\nborder-bottom: ${bBottom};\nborder-left: ${bLeft};\nborder-right: ${bRight};`;
    } else if (activeTab === 'glass') {
      return `/* 现代毛玻璃效果 (Glassmorphism) */\nbackground: rgba(255, 255, 255, ${glassOpacity / 100});\nbackdrop-filter: blur(${glassBlur}px);\n-webkit-backdrop-filter: blur(${glassBlur}px);\nborder: 1px solid rgba(255, 255, 255, 0.2);\nborder-radius: 16px;\nbox-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);`;
    } else {
      return `/* 渐变流光立体按钮 */\nbackground: linear-gradient(135deg, ${btnFrom}, ${btnTo});\nbox-shadow: 0 ${Math.round(btnShadow / 3)}px ${btnShadow}px rgba(99, 102, 241, 0.4);\nborder: none;\nborder-radius: 9999px;\ncolor: #ffffff;\npadding: 12px 32px;\nfont-weight: 600;\ncursor: pointer;\ntransition: transform 0.2s, box-shadow 0.2s;`;
    }
  };

  const cssCode = getCssCode();

  return (
    <ToolPage
      title="CSS 现代视觉特效生成器"
      description="整合生成创意不规则圆角 (Organic Radius)、纯 CSS 几何三角形箭头、现代毛玻璃 (Glassmorphism) 与渐变发光按钮"
    >
      <div className="space-y-6">
        {/* 顶部 Tab 切换 */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
          {[
            { key: 'radius', label: '不规则圆角 (Organic)' },
            { key: 'triangle', label: 'CSS 几何三角形' },
            { key: 'glass', label: '毛玻璃效果 (Glassmorphism)' },
            { key: 'button', label: '流光渐变立体按钮' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧控制栏 */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              属性参数调节
            </span>

            {activeTab === 'radius' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>左上 / 右下曲线 (TL/BR)</span>
                    <span className="font-mono">{tl}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={tl}
                    onChange={(e) => setTl(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>右上 / 左下曲线 (TR/BL)</span>
                    <span className="font-mono">{tr}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={tr}
                    onChange={(e) => setTr(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}

            {activeTab === 'triangle' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-2">箭头朝向</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'top', label: '向上 ▲' },
                      { key: 'bottom', label: '向下 ▼' },
                      { key: 'left', label: '向左 ◀' },
                      { key: 'right', label: '向右 ▶' },
                    ].map((d) => (
                      <button
                        key={d.key}
                        onClick={() => setTriDir(d.key as any)}
                        className={`py-1.5 text-xs rounded border ${
                          triDir === d.key
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>尺寸大小 (px)</span>
                    <span className="font-mono">{triSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    value={triSize}
                    onChange={(e) => setTriSize(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">三角形颜色</label>
                  <input
                    type="color"
                    value={triColor}
                    onChange={(e) => setTriColor(e.target.value)}
                    className="w-12 h-8 p-0 border-0 bg-transparent rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'glass' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>背景虚化模糊度 (Backdrop Blur)</span>
                    <span className="font-mono">{glassBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={glassBlur}
                    onChange={(e) => setGlassBlur(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>白底透明度 (Opacity)</span>
                    <span className="font-mono">{glassOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={90}
                    value={glassOpacity}
                    onChange={(e) => setGlassOpacity(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}

            {activeTab === 'button' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">渐变起始色</label>
                    <input
                      type="color"
                      value={btnFrom}
                      onChange={(e) => setBtnFrom(e.target.value)}
                      className="w-12 h-8 p-0 border-0 bg-transparent rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">渐变终止色</label>
                    <input
                      type="color"
                      value={btnTo}
                      onChange={(e) => setBtnTo(e.target.value)}
                      className="w-12 h-8 p-0 border-0 bg-transparent rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>立体发光阴影强度</span>
                    <span className="font-mono">{btnShadow}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={btnShadow}
                    onChange={(e) => setBtnShadow(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}

            {/* CSS 代码输出 */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  生成的 CSS 属性
                </span>
                <CopyButton text={cssCode} label="复制 CSS 代码" />
              </div>
              <CodeEditor value={cssCode} readOnly minHeight="140px" />
            </div>
          </div>

          {/* 右侧实时视觉效果预览 */}
          <div className="bg-slate-100 dark:bg-slate-900/60 p-8 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 absolute top-4 left-4">
              实时视觉渲染效果
            </span>

            {activeTab === 'radius' && (
              <div
                className="w-56 h-56 transition-all duration-300 shadow-2xl flex items-center justify-center text-white font-bold text-sm"
                style={{
                  borderRadius: `${tl}% ${100 - tl}% ${br}% ${100 - br}% / ${100 - bl}% ${tr}% ${100 - tr}% ${bl}%`,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                }}
              >
                Organic Shape
              </div>
            )}

            {activeTab === 'triangle' && (
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop:
                    triDir === 'bottom'
                      ? `${triSize}px solid ${triColor}`
                      : triDir === 'left' || triDir === 'right'
                      ? `${triSize}px solid transparent`
                      : '0',
                  borderBottom:
                    triDir === 'top'
                      ? `${triSize}px solid ${triColor}`
                      : triDir === 'left' || triDir === 'right'
                      ? `${triSize}px solid transparent`
                      : '0',
                  borderLeft:
                    triDir === 'right'
                      ? `${triSize}px solid ${triColor}`
                      : triDir === 'top' || triDir === 'bottom'
                      ? `${triSize}px solid transparent`
                      : '0',
                  borderRight:
                    triDir === 'left'
                      ? `${triSize}px solid ${triColor}`
                      : triDir === 'top' || triDir === 'bottom'
                      ? `${triSize}px solid transparent`
                      : '0',
                }}
              />
            )}

            {activeTab === 'glass' && (
              <div className="relative w-80 h-48 rounded-2xl flex items-center justify-center overflow-hidden">
                {/* 彩色背景装饰球 */}
                <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-pink-500 opacity-70 blur-xl animate-pulse" />
                <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full bg-blue-500 opacity-70 blur-xl animate-pulse" />

                <div
                  className="w-64 h-36 flex flex-col items-center justify-center text-slate-800 dark:text-white p-4 shadow-xl z-10"
                  style={{
                    backgroundColor: `rgba(255, 255, 255, ${glassOpacity / 100})`,
                    backdropFilter: `blur(${glassBlur}px)`,
                    WebkitBackdropFilter: `blur(${glassBlur}px)`,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px',
                  }}
                >
                  <span className="font-bold text-sm">Glassmorphism Card</span>
                  <span className="text-[11px] opacity-80 mt-1">半透明毛玻璃卡片</span>
                </div>
              </div>
            )}

            {activeTab === 'button' && (
              <button
                className="transition-all hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${btnFrom}, ${btnTo})`,
                  boxShadow: `0 ${Math.round(btnShadow / 3)}px ${btnShadow}px rgba(99, 102, 241, 0.5)`,
                  borderRadius: '9999px',
                  color: '#ffffff',
                  padding: '12px 36px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                立即探索 Explore Now ✨
              </button>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

