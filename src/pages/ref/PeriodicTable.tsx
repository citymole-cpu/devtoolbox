import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Sparkles, Info, Search } from 'lucide-react';

interface ElementData {
  number: number;
  symbol: string;
  name: string;
  pinyin: string;
  mass: string;
  category: string;
  color: string;
  period: number;
  group: number;
  desc: string;
}

const ELEMENTS: ElementData[] = [
  { number: 1, symbol: 'H', name: '氢', pinyin: 'qīng', mass: '1.008', category: '非金属', color: 'bg-emerald-500', period: 1, group: 1, desc: '宇宙中最丰富的化学元素，构成恒星的主要成分。' },
  { number: 2, symbol: 'He', name: '氦', pinyin: 'hài', mass: '4.0026', category: '稀有气体', color: 'bg-purple-500', period: 1, group: 18, desc: '无色无味惰性气体，极难液化，用于气球充气与低温超导冷却。' },
  { number: 3, symbol: 'Li', name: '锂', pinyin: 'lǐ', mass: '6.94', category: '碱金属', color: 'bg-rose-500', period: 2, group: 1, desc: '最轻的金属，现代锂离子电池的核心原料。' },
  { number: 4, symbol: 'Be', name: '铍', pinyin: 'pí', mass: '9.0122', category: '碱土金属', color: 'bg-orange-500', period: 2, group: 2, desc: '具有极高弹性模量，常用于航天航空结构与X射线窗口。' },
  { number: 5, symbol: 'B', name: '硼', pinyin: 'péng', mass: '10.81', category: '类金属', color: 'bg-amber-500', period: 2, group: 13, desc: '硬度接近金刚石，用于制造耐热硼硅玻璃和半导体掺杂。' },
  { number: 6, symbol: 'C', name: '碳', pinyin: 'tàn', mass: '12.011', category: '非金属', color: 'bg-emerald-500', period: 2, group: 14, desc: '有机生命的基础元素，同素异形体包括石墨、金刚石和石墨烯。' },
  { number: 7, symbol: 'N', name: '氮', pinyin: 'dàn', mass: '14.007', category: '非金属', color: 'bg-emerald-500', period: 2, group: 15, desc: '占地球大气约 78%，是构成蛋白质与核酸的必需元素。' },
  { number: 8, symbol: 'O', name: '氧', pinyin: 'yǎng', mass: '15.999', category: '非金属', color: 'bg-emerald-500', period: 2, group: 16, desc: '地壳中含量最丰富的元素，维持绝大部分动植物呼吸所需。' },
  { number: 9, symbol: 'F', name: '氟', pinyin: 'fú', mass: '18.998', category: '卤素', color: 'bg-teal-500', period: 2, group: 17, desc: '电负性最强的化学元素，化学性质极其活泼。' },
  { number: 10, symbol: 'Ne', name: '氖', pinyin: 'nǎi', mass: '20.180', category: '稀有气体', color: 'bg-purple-500', period: 2, group: 18, desc: '放电时发出鲜艳橙红色光芒，用于霓虹灯与高压放电指示灯。' },
  { number: 11, symbol: 'Na', name: '钠', pinyin: 'nà', mass: '22.990', category: '碱金属', color: 'bg-rose-500', period: 3, group: 1, desc: '质软有光泽，遇水剧烈反应，其化合物食盐(NaCl)是人体必需电解质。' },
  { number: 12, symbol: 'Mg', name: '镁', pinyin: 'měi', mass: '24.305', category: '碱土金属', color: 'bg-orange-500', period: 3, group: 2, desc: '质轻金属，燃烧产生刺眼白光，用于铝镁轻质合金与烟火。' },
  { number: 13, symbol: 'Al', name: '铝', pinyin: 'lǚ', mass: '26.982', category: '后过渡金属', color: 'bg-blue-500', period: 3, group: 13, desc: '现代工业产量仅次于铁的常用金属，广泛用于包装与交通运输。' },
  { number: 14, symbol: 'Si', name: '硅', pinyin: 'guī', mass: '28.085', category: '类金属', color: 'bg-amber-500', period: 3, group: 14, desc: '现代半导体芯片与集成电路的灵魂基石。' },
  { number: 15, symbol: 'P', name: '磷', pinyin: 'lín', mass: '30.974', category: '非金属', color: 'bg-emerald-500', period: 3, group: 15, desc: 'DNA 和 RNA 的骨架组分，也是化肥的三大要素之一。' },
  { number: 16, symbol: 'S', name: '硫', pinyin: 'liú', mass: '32.06', category: '非金属', color: 'bg-emerald-500', period: 3, group: 16, desc: '天然黄色晶体，用于生产工业血液硫酸与橡胶硫化。' },
  { number: 17, symbol: 'Cl', name: '氯', pinyin: 'lǜ', mass: '35.45', category: '卤素', color: 'bg-teal-500', period: 3, group: 17, desc: '黄绿色有刺激性气味气体，用于自来水杀菌消毒与塑料 PVC 制造。' },
  { number: 18, symbol: 'Ar', name: '氩', pinyin: 'yà', mass: '39.948', category: '稀有气体', color: 'bg-purple-500', period: 3, group: 18, desc: '大气中含量最多的稀有气体，常用作金属焊接惰性保护气体。' },
  { number: 26, symbol: 'Fe', name: '铁', pinyin: 'tiě', mass: '55.845', category: '过渡金属', color: 'bg-sky-500', period: 4, group: 8, desc: '人类现代工业文明最重要的骨架金属，地核主要成分。' },
  { number: 29, symbol: 'Cu', name: '铜', pinyin: 'tóng', mass: '63.546', category: '过渡金属', color: 'bg-sky-500', period: 4, group: 11, desc: '高导电导热性金属，现代电力电网与集成电路引线关键材料。' },
  { number: 47, symbol: 'Ag', name: '银', pinyin: 'yín', mass: '107.87', category: '过渡金属', color: 'bg-sky-500', period: 5, group: 11, desc: '导电率与导热率最高的单质金属，贵金属首饰与光伏银浆原料。' },
  { number: 79, symbol: 'Au', name: '金', pinyin: 'jīn', mass: '196.97', category: '过渡金属', color: 'bg-sky-500', period: 6, group: 11, desc: '化学性质极度稳定、延展性极佳的硬通货贵金属。' },
];

export default function PeriodicTable() {
  const [selectedEl, setSelectedEl] = useState<ElementData>(ELEMENTS[0]);
  const [keyword, setKeyword] = useState<string>('');

  const filtered = ELEMENTS.filter(
    (e) =>
      !keyword ||
      e.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
      e.name.includes(keyword) ||
      e.pinyin.includes(keyword) ||
      String(e.number) === keyword
  );

  return (
    <ToolPage
      title="化学元素周期表交互速查"
      description="涵盖化学元素周期表常用元素原子序数、相对原子质量、分类属性与科学用途详解"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧元素选择列表与搜索 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-semibold">
                已收录高频代表化学元素 ({ELEMENTS.length})
              </span>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索元素名称、符号 (如: Fe, 碳, 26)..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* 元素卡片网格 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filtered.map((el) => {
                const isSelected = selectedEl.number === el.number;
                return (
                  <button
                    key={el.number}
                    onClick={() => setSelectedEl(el)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/40 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="w-full flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{el.number}</span>
                      <span className="truncate max-w-[40px]">{el.mass}</span>
                    </div>
                    <div className="text-2xl font-black font-serif my-1 text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform">
                      {el.symbol}
                    </div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {el.name} ({el.pinyin})
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{el.category}</div>
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${el.color}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右侧选定元素大卡片详情 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5 sticky top-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  元素详细档案
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${selectedEl.color}`}>
                  {selectedEl.category}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                  <span className="text-[11px] font-mono text-slate-400">{selectedEl.number}</span>
                  <span className="text-3xl font-black font-serif text-slate-800 dark:text-slate-100">
                    {selectedEl.symbol}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {selectedEl.name} <span className="text-sm font-normal text-slate-400">({selectedEl.pinyin})</span>
                  </h2>
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    相对原子质量: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedEl.mass}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-0.5">所在周期 (Period)</span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    第 {selectedEl.period} 周期
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-0.5">所在族 (Group)</span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    第 {selectedEl.group} 族
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  特性与现实应用：
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  {selectedEl.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

