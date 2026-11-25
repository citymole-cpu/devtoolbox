import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Type, Check, Eye } from 'lucide-react';

interface FontStack {
  category: 'chinese' | 'sans' | 'serif' | 'mono';
  name: string;
  enName: string;
  cssStack: string;
  desc: string;
  platforms: string[];
}

const FONT_STACKS: FontStack[] = [
  {
    category: 'chinese',
    name: '现代中文黑体栈 (推荐)',
    enName: 'Modern Chinese Sans-Serif Stack',
    cssStack: `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;`,
    desc: '当前 Web/移动端最推荐的中文无衬线回退栈，依次适配 iOS/macOS 苹方、Windows 微软雅黑及 Android 默认字体。',
    platforms: ['macOS / iOS', 'Windows', 'Android']
  },
  {
    category: 'chinese',
    name: '传统中文字体栈 (宋体/衬线)',
    enName: 'Chinese Serif Stack (SongTi)',
    cssStack: `font-family: "Songti SC", "SimSun", "STSong", "Songti TC", Georgia, "Times New Roman", serif;`,
    desc: '传统排版常用宋体回退栈，适合新闻、学术、人文社科或典雅设计。',
    platforms: ['macOS (Songti)', 'Windows (SimSun)']
  },
  {
    category: 'chinese',
    name: '楷体手写风格栈',
    enName: 'Chinese Calligraphy Stack (KaiTi)',
    cssStack: `font-family: "Kaiti SC", "STKaiti", "KaiTi", "BiauKai", serif;`,
    desc: '书法毛笔楷体风格回退栈，适合古典、诗词引言及文学展示。',
    platforms: ['macOS (Kaiti SC)', 'Windows (KaiTi)']
  },
  {
    category: 'mono',
    name: '现代代码与等宽字体栈 (推荐)',
    enName: 'Modern Code Monospace Stack',
    cssStack: `font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", "Fira Code", "Courier New", monospace;`,
    desc: '现代终端与 IDE 推荐等宽字体栈，完美对齐字符宽度，适合代码编辑器与日志。',
    platforms: ['Apple (SF Mono/Menlo)', 'Windows (Consolas)', 'Linux']
  },
  {
    category: 'sans',
    name: '西文无衬线现代栈 (Helvetica / Arial)',
    enName: 'Classic Clean Sans-Serif',
    cssStack: `font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`,
    desc: '纯西文界面最经典的极简现代排版栈，易读性极高。',
    platforms: ['全平台通用']
  },
  {
    category: 'serif',
    name: '西文优雅衬线栈 (Georgia / Times)',
    enName: 'Elegant Serif Stack',
    cssStack: `font-family: Georgia, Cambria, "Times New Roman", Times, serif;`,
    desc: '适合杂志长文、书本排版或高奢质感设计的衬线字体栈。',
    platforms: ['全平台通用']
  }
];

export default function WebFonts() {
  const [previewText, setPreviewText] = useState('Antigravity 极速开发 0123456789 The quick brown fox jumps over the lazy dog.');
  const [fontSize, setFontSize] = useState(16);

  return (
    <ToolPage
      title="网页常用安全字体与 CSS Font-Family 栈参考"
      description="收录 Web 前端主流中英文、代码等宽、衬线字体回退栈方案，提供实时排版预览与 CSS 一键复制"
    >
      <div className="space-y-6">
        {/* 实时预览控制器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Type className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">自定义测试文本:</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">字号:</span>
              <input
                type="range"
                min={12}
                max={28}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-24 accent-blue-600"
              />
              <span className="font-mono text-gray-600 dark:text-gray-400 w-8">{fontSize}px</span>
            </div>
          </div>
          <input
            type="text"
            value={previewText}
            onChange={e => setPreviewText(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 字体列表 */}
        <div className="space-y-4">
          {FONT_STACKS.map((f, i) => {
            const fontRule = f.cssStack.replace('font-family: ', '').replace(';', '');
            return (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                      {f.name}
                      <span className="text-xs font-normal text-gray-400">({f.enName})</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {f.platforms.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 字体预览区域 */}
                <div
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 break-words"
                  style={{ fontFamily: fontRule, fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                >
                  {previewText || '请输入测试文字...'}
                </div>

                {/* CSS 复制区域 */}
                <div className="flex items-center justify-between font-mono bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
                  <span className="text-blue-600 dark:text-blue-400 truncate pr-3">{f.cssStack}</span>
                  <CopyButton text={f.cssStack} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolPage>
  );
}
