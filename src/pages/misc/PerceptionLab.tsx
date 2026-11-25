import React, { useState, useRef } from 'react';
import ToolPage from '../../components/ToolPage';
import { Zap, Eye, RotateCcw, Award, CheckCircle2, AlertCircle } from 'lucide-react';

type ReactionState = 'idle' | 'waiting' | 'ready' | 'finished' | 'too-early';

interface ColorPlate {
  id: number;
  expected: string;
  desc: string;
  type: string;
  svg: React.ReactNode;
}

export default function PerceptionLab() {
  const [tab, setTab] = useState<'reaction' | 'colorblind'>('reaction');

  // 反应测试状态
  const [rxState, setRxState] = useState<ReactionState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const timerRef = useRef<any>(null);

  const startReactionTest = () => {
    setRxState('waiting');
    setLastScore(null);
    const delay = Math.floor(Math.random() * 3000) + 1500; // 1.5s - 4.5s
    timerRef.current = setTimeout(() => {
      setRxState('ready');
      setStartTime(performance.now());
    }, delay);
  };

  const handleBoxClick = () => {
    if (rxState === 'idle') {
      startReactionTest();
    } else if (rxState === 'waiting') {
      // 过早点击
      clearTimeout(timerRef.current);
      setRxState('too-early');
    } else if (rxState === 'ready') {
      // 成功反应
      const elapsed = Math.round(performance.now() - startTime);
      setLastScore(elapsed);
      setHistory((prev) => [elapsed, ...prev.slice(0, 4)]);
      setRxState('finished');
    } else if (rxState === 'too-early' || rxState === 'finished') {
      startReactionTest();
    }
  };

  // 色盲自测试题
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState<boolean>(false);

  const PLATES: ColorPlate[] = [
    {
      id: 1,
      expected: '74',
      desc: '正常人看应为“74”，红绿色盲者可能误看成“21”或看不到。',
      type: '红绿视敏度',
      svg: (
        <svg viewBox="0 0 160 160" className="w-40 h-40 rounded-full shadow-inner bg-amber-50">
          <circle cx="80" cy="80" r="75" fill="#fde68a" />
          <circle cx="50" cy="60" r="14" fill="#a7f3d0" />
          <circle cx="65" cy="50" r="12" fill="#6ee7b7" />
          <circle cx="80" cy="70" r="16" fill="#f87171" />
          <circle cx="110" cy="80" r="14" fill="#ef4444" />
          <text x="80" y="95" textAnchor="middle" fill="#dc2626" fontSize="48" fontWeight="bold" fontFamily="sans-serif">
            74
          </text>
        </svg>
      ),
    },
    {
      id: 2,
      expected: '6',
      desc: '正常人可清晰辨识“6”，多数色盲色弱者极难看清。',
      type: '色弱甄别',
      svg: (
        <svg viewBox="0 0 160 160" className="w-40 h-40 rounded-full shadow-inner bg-emerald-50">
          <circle cx="80" cy="80" r="75" fill="#d1fae5" />
          <circle cx="45" cy="85" r="15" fill="#fcd34d" />
          <circle cx="115" cy="60" r="16" fill="#fbbf24" />
          <text x="80" y="100" textAnchor="middle" fill="#059669" fontSize="60" fontWeight="bold" fontFamily="sans-serif">
            6
          </text>
        </svg>
      ),
    },
    {
      id: 3,
      expected: '29',
      desc: '正常人辨识为“29”，红绿色盲常误看成“70”。',
      type: '红绿色盲',
      svg: (
        <svg viewBox="0 0 160 160" className="w-40 h-40 rounded-full shadow-inner bg-rose-50">
          <circle cx="80" cy="80" r="75" fill="#ffe4e6" />
          <circle cx="50" cy="65" r="16" fill="#67e8f9" />
          <circle cx="120" cy="100" r="15" fill="#22d3ee" />
          <text x="80" y="95" textAnchor="middle" fill="#e11d48" fontSize="48" fontWeight="bold" fontFamily="sans-serif">
            29
          </text>
        </svg>
      ),
    },
  ];

  const checkColorblindResult = () => {
    setShowResult(true);
  };

  const correctCount = PLATES.filter(
    (p) => (answers[p.id] || '').trim().toLowerCase() === p.expected.toLowerCase()
  ).length;

  return (
    <ToolPage
      title="感知测试实验室：反应速度与色觉自测"
      description="毫秒级电竞与驾驶反应速度测试，经典假同色图卡色盲、色弱视敏度在线自测"
    >
      <div className="space-y-6">
        {/* 顶部 Tab 切换 */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <button
            onClick={() => setTab('reaction')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium border flex items-center gap-1.5 transition-colors ${
              tab === 'reaction'
                ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            反应速度极限测速 (Reaction Time)
          </button>
          <button
            onClick={() => setTab('colorblind')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium border flex items-center gap-1.5 transition-colors ${
              tab === 'colorblind'
                ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            色盲与色弱图卡自测 (Color Blindness)
          </button>
        </div>

        {tab === 'reaction' && (
          <div className="space-y-4">
            {/* 反应变色测试点击大面板 */}
            <div
              onClick={handleBoxClick}
              className={`w-full min-h-[300px] rounded-2xl flex flex-col items-center justify-center p-8 text-white select-none cursor-pointer transition-colors shadow-lg ${
                rxState === 'idle'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : rxState === 'waiting'
                  ? 'bg-rose-600'
                  : rxState === 'ready'
                  ? 'bg-emerald-500'
                  : rxState === 'too-early'
                  ? 'bg-amber-600'
                  : 'bg-indigo-600'
              }`}
            >
              {rxState === 'idle' && (
                <div className="text-center space-y-2">
                  <Zap className="w-16 h-16 mx-auto animate-bounce opacity-90" />
                  <h2 className="text-2xl font-bold">点击此处开始反应测试</h2>
                  <p className="text-xs opacity-80">当屏幕从红色变绿时，以最快速度点击屏幕！</p>
                </div>
              )}

              {rxState === 'waiting' && (
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-wider animate-pulse">保持等待... 等待变绿</h2>
                  <p className="text-xs opacity-80">千万别提前点击！</p>
                </div>
              )}

              {rxState === 'ready' && (
                <div className="text-center space-y-2 animate-ping-once">
                  <h2 className="text-4xl font-black uppercase tracking-widest">就是现在！快点击！！</h2>
                </div>
              )}

              {rxState === 'too-early' && (
                <div className="text-center space-y-2">
                  <AlertCircle className="w-12 h-12 mx-auto" />
                  <h2 className="text-2xl font-bold">点早了！还没变绿呢</h2>
                  <p className="text-xs opacity-90">点击此区域重新尝试</p>
                </div>
              )}

              {rxState === 'finished' && (
                <div className="text-center space-y-3">
                  <span className="text-xs uppercase tracking-widest opacity-80">本次反应耗时</span>
                  <div className="text-6xl font-black font-mono">{lastScore} ms</div>
                  <div className="text-sm font-medium">
                    {lastScore! < 200
                      ? '⚡ 战神级！职业电竞选手的反应极限！'
                      : lastScore! < 250
                      ? '🎯 非常优秀！反应敏捷度极高'
                      : lastScore! < 320
                      ? '👍 正常健康成年人标准水平'
                      : '😴 略显迟钝，是否感到有些疲劳？'}
                  </div>
                  <p className="text-xs opacity-80 pt-2">点击任意区域开始下一轮测试</p>
                </div>
              )}
            </div>

            {/* 最近历史成绩 */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">最近测试记录:</span>
                <div className="flex gap-2">
                  {history.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded font-mono text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      {s} ms
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'colorblind' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLATES.map((plate) => (
                <div
                  key={plate.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center space-y-4"
                >
                  <span className="text-xs font-semibold text-slate-500">
                    图卡 #{plate.id} ({plate.type})
                  </span>

                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                    {plate.svg}
                  </div>

                  <div className="w-full space-y-1.5">
                    <label className="text-xs text-slate-600 dark:text-slate-400 block">
                      你看到的数字或字母是？
                    </label>
                    <input
                      type="text"
                      value={answers[plate.id] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [plate.id]: e.target.value })
                      }
                      placeholder="看不出请留空..."
                      className="w-full px-3 py-1.5 text-xs text-center font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {showResult && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-center w-full">
                      标准答案: <span className="font-bold text-blue-600">{plate.expected}</span>
                      <p className="mt-0.5">{plate.desc}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center space-y-3 pt-2">
              <button
                onClick={checkColorblindResult}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
              >
                提交答案并查看色觉评估报告
              </button>

              {showResult && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center max-w-md">
                  <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                    正确率: {correctCount} / {PLATES.length}
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    {correctCount === PLATES.length
                      ? '🎉 恭喜！您的色觉辨识敏锐度完全正常，未发现红绿色觉异常倾向。'
                      : '⚠️ 部分题目未能准确辨识，建议在自然光线下复测，或至专业眼科进行全面色觉健康检查。'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

