import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Calendar, Clock, Sparkles } from 'lucide-react';

const SHI_CHEN = [
  { name: '子时', range: '23:00 - 01:00', desc: '夜半，又名子夜、中夜：十二时辰的第一个时辰。' },
  { name: '丑时', range: '01:00 - 03:00', desc: '鸡鸣，又名荒鸡：十二时辰的第二个时辰。' },
  { name: '寅时', range: '03:00 - 05:00', desc: '平旦，又称黎明、早晨：时是夜与日的交替之际。' },
  { name: '卯时', range: '05:00 - 07:00', desc: '日出，又名日始、破晓、旭日：指太阳刚刚露脸。' },
  { name: '辰时', range: '07:00 - 09:00', desc: '食时，又名早食：古人“朝食”之时。' },
  { name: '巳时', range: '09:00 - 11:00', desc: '隅中，又名日禺：临近中午的时候。' },
  { name: '午时', range: '11:00 - 13:00', desc: '日中，又名日正、中午：太阳正当顶。' },
  { name: '未时', range: '13:00 - 15:00', desc: '日昳，又名日跌、日央：太阳偏西了。' },
  { name: '申时', range: '15:00 - 17:00', desc: '哺时，又名日铺、夕食：古人第二顿饭时。' },
  { name: '酉时', range: '17:00 - 19:00', desc: '日入，又名日落、日沉：太阳落山的时候。' },
  { name: '戌时', range: '19:00 - 21:00', desc: '黄昏，又名日夕、日暮：太阳落去，天色欲黑。' },
  { name: '亥时', range: '21:00 - 23:00', desc: '人定，又名定昏：夜色已深，人们已经停止活动安歇。' },
];

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

export default function LunarCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-28');
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());

  // 计算干支与生肖
  const getGanZhiZodiac = (year: number) => {
    // 4年为甲子年周期基准
    const stemIdx = (year - 4) % 10;
    const branchIdx = (year - 4) % 12;

    const stem = HEAVENLY_STEMS[(stemIdx + 10) % 10];
    const branch = EARTHLY_BRANCHES[(branchIdx + 12) % 12];
    const zodiac = ZODIAC_ANIMALS[(branchIdx + 12) % 12];

    return {
      yearStr: `${stem}${branch}年`,
      zodiac: `${zodiac}年`,
    };
  };

  const getShiChen = (hour: number) => {
    if (hour >= 23 || hour < 1) return SHI_CHEN[0]; // 子时
    const idx = Math.floor((hour + 1) / 2);
    return SHI_CHEN[idx] || SHI_CHEN[0];
  };

  const dateObj = new Date(selectedDate);
  const curYear = isNaN(dateObj.getFullYear()) ? 2026 : dateObj.getFullYear();
  const gz = getGanZhiZodiac(curYear);
  const currentShiChen = getShiChen(selectedHour);

  return (
    <ToolPage
      title="阴阳历对照、生肖查询与十二时辰推算"
      description="阳历公历转换、天干地支纪年与十二生肖属性推算，古代十二时辰（子丑寅卯）对照换算"
    >
      <div className="space-y-6">
        {/* 输入与年柱生肖概览 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">选择公历日期</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-1">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">天干地支纪年</span>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-200 font-serif">
              {curYear} 年【{gz.yearStr}】
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl space-y-1">
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">十二生肖属性</span>
            <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
              生肖属相：【{gz.zodiac}】
            </div>
          </div>
        </div>

        {/* 十二时辰换算器 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              中国古代十二时辰推算器
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">当前测试小时:</span>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(Number(e.target.value))}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 当前匹配时辰高亮展示 */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">当前对应时辰</span>
              <div className="text-xl font-bold text-blue-800 dark:text-blue-200 mt-0.5">
                {currentShiChen.name} ({currentShiChen.range})
              </div>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 max-w-md text-right hidden sm:block">
              {currentShiChen.desc}
            </div>
          </div>

          {/* 十二时辰全景卡片表格 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
            {SHI_CHEN.map((item) => {
              const isCurrent = item.name === currentShiChen.name;
              return (
                <div
                  key={item.name}
                  onClick={() => {
                    const startH = parseInt(item.range.split(':')[0], 10);
                    setSelectedHour(startH);
                  }}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{item.name}</div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    {item.range}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2" title={item.desc}>
                    {item.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

