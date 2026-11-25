import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { MousePointer, Search, Sparkles, Zap } from 'lucide-react';

interface EventItem {
  name: string;
  category: 'mouse' | 'keyboard' | 'form' | 'window' | 'touch' | 'clipboard' | 'media';
  description: string;
  bubbles: boolean;
  cancelable: boolean;
  sample: string;
}

const EVENTS: EventItem[] = [
  // 鼠标
  { name: 'click', category: 'mouse', description: '鼠标指针单击目标元素时触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("click", (e) => { ... })' },
  { name: 'dblclick', category: 'mouse', description: '鼠标指针双击目标元素时触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("dblclick", (e) => { ... })' },
  { name: 'mousedown', category: 'mouse', description: '在元素上按下任意鼠标按键时触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("mousedown", (e) => { ... })' },
  { name: 'mouseup', category: 'mouse', description: '在元素上释放鼠标按键时触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("mouseup", (e) => { ... })' },
  { name: 'mousemove', category: 'mouse', description: '鼠标指针在元素内部移动时连续触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("mousemove", (e) => { ... })' },
  { name: 'mouseenter', category: 'mouse', description: '鼠标光标刚移入元素边界时触发（不冒泡）。', bubbles: false, cancelable: false, sample: 'element.addEventListener("mouseenter", (e) => { ... })' },
  { name: 'mouseleave', category: 'mouse', description: '鼠标光标离开元素边界时触发（不冒泡）。', bubbles: false, cancelable: false, sample: 'element.addEventListener("mouseleave", (e) => { ... })' },
  { name: 'contextmenu', category: 'mouse', description: '用户点击右键打开上下文菜单时触发（可 preventDefault 拦截自定义右键）。', bubbles: true, cancelable: true, sample: 'e.preventDefault(); // 阻止默认右键菜单' },
  { name: 'wheel', category: 'mouse', description: '用户滚动鼠标滚轮或触控板滚动手势时触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("wheel", (e) => { ... })' },

  // 键盘
  { name: 'keydown', category: 'keyboard', description: '键盘按键被按下瞬间触发。支持按住重复触发。', bubbles: true, cancelable: true, sample: 'window.addEventListener("keydown", (e) => console.log(e.key))' },
  { name: 'keyup', category: 'keyboard', description: '键盘按键被松开时触发。', bubbles: true, cancelable: true, sample: 'window.addEventListener("keyup", (e) => { ... })' },

  // 表单与输入
  { name: 'input', category: 'form', description: 'input/textarea/contenteditable 的值发生改变时实时触发。', bubbles: true, cancelable: false, sample: 'input.addEventListener("input", (e) => { ... })' },
  { name: 'change', category: 'form', description: '元素失去焦点且值发生改变时，或者 select/checkbox 勾选状态改变时触发。', bubbles: true, cancelable: false, sample: 'select.addEventListener("change", (e) => { ... })' },
  { name: 'focus', category: 'form', description: '元素获得焦点时触发（不冒泡，冒泡版为 focusin）。', bubbles: false, cancelable: false, sample: 'input.addEventListener("focus", (e) => { ... })' },
  { name: 'blur', category: 'form', description: '元素失去焦点时触发（不冒泡，冒泡版为 focusout）。', bubbles: false, cancelable: false, sample: 'input.addEventListener("blur", (e) => { ... })' },
  { name: 'submit', category: 'form', description: '表单被提交时触发（常用 e.preventDefault() 阻止整页刷新）。', bubbles: true, cancelable: true, sample: 'form.addEventListener("submit", (e) => e.preventDefault())' },
  { name: 'reset', category: 'form', description: '表单中的重置按钮被点击时触发。', bubbles: true, cancelable: true, sample: 'form.addEventListener("reset", (e) => { ... })' },

  // 视口与生命周期
  { name: 'DOMContentLoaded', category: 'window', description: 'HTML 文档已完全解析并构建 DOM 树，无需等待样式表、图像和子框架完成加载。', bubbles: true, cancelable: false, sample: 'document.addEventListener("DOMContentLoaded", () => { ... })' },
  { name: 'load', category: 'window', description: '整个页面包含所有依赖资源（样式表、图片、脚本等）全部加载完毕时触发。', bubbles: false, cancelable: false, sample: 'window.addEventListener("load", () => { ... })' },
  { name: 'resize', category: 'window', description: '浏览器窗口或 iframe 视口尺寸发生变化时触发。', bubbles: false, cancelable: false, sample: 'window.addEventListener("resize", () => { ... })' },
  { name: 'scroll', category: 'window', description: '文档视图或元素被滚动时连续触发。', bubbles: false, cancelable: false, sample: 'window.addEventListener("scroll", () => { ... })' },
  { name: 'beforeunload', category: 'window', description: '窗口、文档及其资源即将被卸载（用户刷新或关闭标签页）前触发。', bubbles: false, cancelable: true, sample: 'window.addEventListener("beforeunload", (e) => e.returnValue = "")' },

  // 剪贴板
  { name: 'copy', category: 'clipboard', description: '用户发起复制操作时触发（Ctrl+C 或右键复制）。', bubbles: true, cancelable: true, sample: 'document.addEventListener("copy", (e) => { ... })' },
  { name: 'cut', category: 'clipboard', description: '用户发起剪切操作时触发。', bubbles: true, cancelable: true, sample: 'document.addEventListener("cut", (e) => { ... })' },
  { name: 'paste', category: 'clipboard', description: '用户在目标元素发起粘贴操作时触发。', bubbles: true, cancelable: true, sample: 'document.addEventListener("paste", (e) => { ... })' },

  // 触控 Touch
  { name: 'touchstart', category: 'touch', description: '当手指触碰在触控屏幕表面时触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("touchstart", (e) => { ... })' },
  { name: 'touchmove', category: 'touch', description: '当手指在屏幕表面滑动时连续触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("touchmove", (e) => { ... })' },
  { name: 'touchend', category: 'touch', description: '当手指离开触控屏幕表面时触发。', bubbles: true, cancelable: true, sample: 'element.addEventListener("touchend", (e) => { ... })' },
  { name: 'touchcancel', category: 'touch', description: '触摸点由于某些原因被系统中断（如突然来电或弹窗）。', bubbles: true, cancelable: false, sample: 'element.addEventListener("touchcancel", (e) => { ... })' },

  // 媒体
  { name: 'play', category: 'media', description: '音频/视频在暂停或停止后开始播放时触发。', bubbles: false, cancelable: false, sample: 'video.addEventListener("play", () => { ... })' },
  { name: 'pause', category: 'media', description: '音频/视频暂停播放时触发。', bubbles: false, cancelable: false, sample: 'video.addEventListener("pause", () => { ... })' },
  { name: 'ended', category: 'media', description: '音频/视频播放到达末尾时触发。', bubbles: false, cancelable: false, sample: 'video.addEventListener("ended", () => { ... })' },
  { name: 'timeupdate', category: 'media', description: '音频/视频播放当前位置发生改变时持续触发。', bubbles: false, cancelable: false, sample: 'video.addEventListener("timeupdate", () => { ... })' }
];

export default function JsEvents() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const categories = [
    { id: 'ALL', label: '全部事件' },
    { id: 'mouse', label: '鼠标 Mouse' },
    { id: 'keyboard', label: '键盘 Keyboard' },
    { id: 'form', label: '表单 Form' },
    { id: 'window', label: '视口 Window' },
    { id: 'clipboard', label: '剪贴板' },
    { id: 'touch', label: '触控 Touch' },
    { id: 'media', label: '多媒体' }
  ];

  const filtered = EVENTS.filter(ev => {
    const matchText = !search || ev.name.toLowerCase().includes(search.toLowerCase()) || ev.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'ALL' || ev.category === selectedCat;
    return matchText && matchCat;
  });

  return (
    <ToolPage
      title="JavaScript 核心事件速查大全"
      description="收录常见 DOM / Window / 鼠标 / 键盘 / 表单 / 触摸 / 剪贴板事件、冒泡属性与标准监听器代码"
    >
      <div className="space-y-6">
        {/* 筛选与搜索 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索事件名称或描述（如 click, submit, DOMContentLoaded, touch）..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedCat === c.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(ev => (
            <div
              key={ev.name}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-blue-400 transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                      {ev.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        ev.bubbles
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {ev.bubbles ? '冒泡' : '不冒泡'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        ev.cancelable
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {ev.cancelable ? '可取消' : '不可取消'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  {ev.description}
                </p>
              </div>

              <div className="flex items-center justify-between font-mono bg-gray-50 dark:bg-gray-900/80 px-2.5 py-1.5 rounded border border-gray-100 dark:border-gray-700 text-xs">
                <span className="truncate pr-2 text-gray-700 dark:text-gray-300 text-[11px]">
                  {ev.sample}
                </span>
                <CopyButton text={ev.sample} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
