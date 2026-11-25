import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Smile, Search, Check, Sparkles } from 'lucide-react';

interface SymbolGroup {
  category: string;
  items: { char: string; name: string }[];
}

const SYMBOL_GROUPS: SymbolGroup[] = [
  {
    category: '常用 Emoji 表情',
    items: [
      { char: '😀', name: '大笑' }, { char: '😃', name: '微笑' }, { char: '😄', name: '开心' },
      { char: '😁', name: '咧嘴笑' }, { char: '😆', name: '狂笑' }, { char: '😅', name: '汗颜' },
      { char: '🤣', name: '笑翻' }, { char: '😂', name: '笑哭' }, { char: '🙂', name: '淡笑' },
      { char: '🙃', name: '倒脸' }, { char: '😉', name: '眨眼' }, { char: '😊', name: '羞涩' },
      { char: '😇', name: '天使' }, { char: '🥰', name: '爱心脸' }, { char: '😍', name: '花痴' },
      { char: '🤩', name: '星星眼' }, { char: '😘', name: '亲亲' }, { char: '😋', name: '美味' },
      { char: '😛', name: '吐舌' }, { char: '😜', name: '搞怪' }, { char: '🤪', name: '疯狂' },
      { char: '🤔', name: '思考' }, { char: '🤫', name: '嘘' }, { char: '🤭', name: '捂嘴' },
      { char: '🤐', name: '闭嘴' }, { char: '🤨', name: '挑眉' }, { char: '😐', name: '冷漠' },
      { char: '😏', name: '坏笑' }, { char: '😒', name: '不悦' }, { char: '🙄', name: '翻白眼' },
      { char: '😬', name: '尴尬' }, { char: '🤥', name: '说谎' }, { char: '😌', name: '释怀' },
      { char: '😔', name: '沉思' }, { char: '😪', name: '困倦' }, { char: '🤤', name: '流口水' },
      { char: '😴', name: '睡觉' }, { char: '😷', name: '口罩' }, { char: '🤒', name: '发烧' },
      { char: '🤕', name: '受伤' }, { char: '🤢', name: '恶心' }, { char: '🤮', name: '呕吐' },
    ],
  },
  {
    category: '手势与人体',
    items: [
      { char: '👍', name: '点赞' }, { char: '👎', name: '踩' }, { char: '👏', name: '鼓掌' },
      { char: '🙌', name: '举双手' }, { char: '👐', name: '张开双掌' }, { char: '🤲', name: '祈愿' },
      { char: '🤝', name: '握手' }, { char: '🙏', name: '双手合十' }, { char: '✌️', name: '胜利' },
      { char: '🤞', name: '祝好运' }, { char: '🤟', name: '爱你' }, { char: '🤘', name: '摇滚' },
      { char: '🤙', name: '打电话' }, { char: '👈', name: '左指' }, { char: '👉', name: '右指' },
      { char: '👆', name: '上指' }, { char: '👇', name: '下指' }, { char: '☝️', name: '第一' },
      { char: '✋', name: '击掌' }, { char: '🤚', name: '立掌' }, { char: '🖐️', name: '五指' },
      { char: '💪', name: '肌肉' }, { char: '👀', name: '眼睛' }, { char: '🧠', name: '大脑' },
    ],
  },
  {
    category: '科技与办公物品',
    items: [
      { char: '💻', name: '笔记本电脑' }, { char: '🖥️', name: '台式机' }, { char: '📱', name: '手机' },
      { char: '💡', name: '灯泡/灵感' }, { char: '🚀', name: '火箭/极速' }, { char: '🔥', name: '火热' },
      { char: '⚡', name: '闪电/快速' }, { char: '🎉', name: '礼花/庆祝' }, { char: '✨', name: '闪耀' },
      { char: '🌟', name: '发光星' }, { char: '⭐', name: '五角星' }, { char: '🛠️', name: '工具箱' },
      { char: '⚙️', name: '齿轮/配置' }, { char: '🔒', name: '锁/安全' }, { char: '🔑', name: '钥匙' },
      { char: '📦', name: '包裹/包' }, { char: '📊', name: '图表' }, { char: '📈', name: '上升' },
    ],
  },
  {
    category: '方向与箭头符号',
    items: [
      { char: '←', name: '左箭头' }, { char: '→', name: '右箭头' }, { char: '↑', name: '上箭头' },
      { char: '↓', name: '下箭头' }, { char: '↔', name: '左右双向' }, { char: '↕', name: '上下双向' },
      { char: '↖', name: '左上' }, { char: '↗', name: '右上' }, { char: '↘', name: '右下' },
      { char: '↙', name: '左下' }, { char: '➔', name: '粗右箭头' }, { char: '➜', name: '箭头' },
      { char: '➤', name: '三角箭' }, { char: '►', name: '播放实心' }, { char: '◄', name: '倒退实心' },
      { char: '▲', name: '上三角' }, { char: '▼', name: '下三角' }, { char: '◀', name: '左三角' },
      { char: '▶', name: '右三角' }, { char: '↺', name: '逆时针' }, { char: '↻', name: '顺时针' },
    ],
  },
  {
    category: '数学与逻辑符号',
    items: [
      { char: '±', name: '加减号' }, { char: '×', name: '乘号' }, { char: '÷', name: '除号' },
      { char: '≠', name: '不等于' }, { char: '≈', name: '约等于' }, { char: '≤', name: '小于等于' },
      { char: '≥', name: '大于等于' }, { char: '≡', name: '恒等于' }, { char: '∑', name: '求和 Sigma' },
      { char: '∏', name: '连乘 Pi' }, { char: '√', name: '根号' }, { char: '∫', name: '积分' },
      { char: '∂', name: '偏微分' }, { char: '∞', name: '无穷大' }, { char: '∝', name: '正比于' },
      { char: '∈', name: '属于' }, { char: '∉', name: '不属于' }, { char: '⊂', name: '子集' },
      { char: '∪', name: '并集' }, { char: '∩', name: '交集' }, { char: '∅', name: '空集' },
      { char: '∀', name: '对任意' }, { char: '∃', name: '存在' }, { char: '∠', name: '角' },
    ],
  },
  {
    category: '希腊字母 (Greek)',
    items: [
      { char: 'α', name: 'Alpha' }, { char: 'β', name: 'Beta' }, { char: 'γ', name: 'Gamma' },
      { char: 'δ', name: 'Delta' }, { char: 'ε', name: 'Epsilon' }, { char: 'ζ', name: 'Zeta' },
      { char: 'η', name: 'Eta' }, { char: 'θ', name: 'Theta' }, { char: 'λ', name: 'Lambda' },
      { char: 'μ', name: 'Mu' }, { char: 'π', name: 'Pi' }, { char: 'ρ', name: 'Rho' },
      { char: 'σ', name: 'Sigma' }, { char: 'τ', name: 'Tau' }, { char: 'φ', name: 'Phi' },
      { char: 'ω', name: 'Omega' }, { char: 'Δ', name: '大写 Delta' }, { char: 'Ω', name: '大写 Omega' },
    ],
  },
  {
    category: '商业与货币符号',
    items: [
      { char: '¥', name: '人民币/日元' }, { char: '$', name: '美元' }, { char: '€', name: '欧元' },
      { char: '£', name: '英镑' }, { char: '₩', name: '韩元' }, { char: '₽', name: '卢布' },
      { char: '₿', name: '比特币' }, { char: '©', name: '版权 Copyright' }, { char: '®', name: '注册商标' },
      { char: '™', name: '商标 Trademark' }, { char: '§', name: '章节号' }, { char: '¶', name: '段落号' },
      { char: '‰', name: '千分号' }, { char: '℃', name: '摄氏度' }, { char: '℉', name: '华氏度' },
    ],
  },
];

export default function EmojiSymbols() {
  const [selectedCat, setSelectedCat] = useState<string>('全部');
  const [keyword, setKeyword] = useState<string>('');
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const handleCopy = (char: string) => {
    navigator.clipboard.writeText(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(null), 1500);
  };

  const categories = ['全部', ...SYMBOL_GROUPS.map((g) => g.category)];

  const filteredGroups = SYMBOL_GROUPS.filter((g) =>
    selectedCat === '全部' ? true : g.category === selectedCat
  )
    .map((g) => ({
      category: g.category,
      items: g.items.filter(
        (i) =>
          !keyword ||
          i.char.includes(keyword) ||
          i.name.toLowerCase().includes(keyword.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <ToolPage
      title="常用 Emoji 表情与特殊符号大全"
      description="分类收录常用 Emoji 表情、手势、科技物品、箭头、希腊字母、数学与货币符号，点击即可一键复制"
    >
      <div className="space-y-6">
        {/* 顶部搜索与分类选择 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  selectedCat === c
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索符号或含义 (如: 火箭, 微笑, 箭头)..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 符号展示网格 */}
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div
              key={group.category}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {group.category} ({group.items.length})
              </h3>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                {group.items.map((item, idx) => {
                  const isJustCopied = copiedChar === item.char;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleCopy(item.char)}
                      title={`点击复制: ${item.char} (${item.name})`}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all group relative ${
                        isJustCopied
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 scale-105'
                          : 'border-slate-100 dark:border-slate-700/60 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <span className="text-2xl mb-1 select-none transition-transform group-hover:scale-125">
                        {item.char}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-full">
                        {isJustCopied ? '已复制！' : item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}

