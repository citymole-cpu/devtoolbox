import React, { useState, useEffect, useRef } from 'react';
import ToolPage from '../../components/ToolPage';
import { Timer, Play, Pause, RotateCcw, Shuffle, Flag, Award, Sparkles } from 'lucide-react';

export default function TimerLuckyDraw() {
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'countdown' | 'lucky'>('stopwatch');

  // 秒表状态
  const [swTime, setSwTime] = useState<number>(0);
  const [swRunning, setSwRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<any>(null);

  useEffect(() => {
    if (swRunning) {
      const start = performance.now() - swTime;
      swRef.current = setInterval(() => {
        setSwTime(Math.round(performance.now() - start));
      }, 10);
    } else {
      clearInterval(swRef.current);
    }
    return () => clearInterval(swRef.current);
  }, [swRunning]);

  const addLap = () => {
    setLaps([swTime, ...laps]);
  };

  const resetSw = () => {
    setSwRunning(false);
    setSwTime(0);
    setLaps([]);
  };

  const formatMs = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(
      milliseconds
    ).padStart(2, '0')}`;
  };

  // 倒计时状态
  const [cdMinutes, setCdMinutes] = useState<number>(3);
  const [cdRemain, setCdRemain] = useState<number>(180);
  const [cdRunning, setCdRunning] = useState<boolean>(false);
  const cdRef = useRef<any>(null);

  useEffect(() => {
    if (cdRunning && cdRemain > 0) {
      cdRef.current = setInterval(() => {
        setCdRemain((prev) => {
          if (prev <= 1) {
            clearInterval(cdRef.current);
            setCdRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(cdRef.current);
    }
    return () => clearInterval(cdRef.current);
  }, [cdRunning, cdRemain]);

  const startCountdown = (mins: number) => {
    setCdMinutes(mins);
    setCdRemain(mins * 60);
    setCdRunning(true);
  };

  // 随机点名抽签状态
  const [namesText, setNamesText] = useState<string>(
    '张三\n李四\n王五\n赵六\n钱七\n孙八\n周九\n吴十'
  );
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [pickedHistory, setPickedHistory] = useState<string[]>([]);

  const rollLucky = () => {
    const list = namesText.split('\n').map((n) => n.trim()).filter(Boolean);
    if (list.length === 0) return;

    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = list[Math.floor(Math.random() * list.length)];
      setPickedName(rand);
      count++;
      if (count > 25) {
        clearInterval(interval);
        setIsRolling(false);
        const finalPicked = list[Math.floor(Math.random() * list.length)];
        setPickedName(finalPicked);
        setPickedHistory((prev) => [finalPicked, ...prev]);
      }
    }, 60);
  };

  return (
    <ToolPage
      title="高精秒表、倒计时器与随机点名抽签器"
      description="毫秒级多圈计次秒表、会议演讲倒计时器、随机抽签互动点名与幸运转盘"
    >
      <div className="space-y-6">
        {/* 顶部 Tab */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
          {[
            { key: 'stopwatch', label: '高精计次秒表 (Stopwatch)' },
            { key: 'countdown', label: '会议发言倒计时 (Timer)' },
            { key: 'lucky', label: '随机点名与抽签互动器 (Lucky Draw)' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                activeTab === t.key
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 秒表 */}
        {activeTab === 'stopwatch' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                毫秒级高精度计时
              </span>
              <div className="text-6xl font-black font-mono text-slate-800 dark:text-slate-100">
                {formatMs(swTime)}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSwRunning(!swRunning)}
                  className={`px-6 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 shadow-sm transition-colors ${
                    swRunning
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {swRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {swRunning ? '暂停计时' : '开始计时'}
                </button>
                <button
                  onClick={addLap}
                  disabled={!swRunning}
                  className="px-4 py-2.5 rounded-xl font-medium text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-30"
                >
                  <Flag className="w-3.5 h-3.5" />
                  计次 (Lap)
                </button>
                <button
                  onClick={resetSw}
                  className="px-4 py-2.5 rounded-xl font-medium text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  复位
                </button>
              </div>
            </div>

            {/* 计次记录表 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                计次圈数列表 ({laps.length})
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {laps.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">暂无计次，点击“计次”记录圈速</div>
                ) : (
                  laps.map((lap, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center font-mono">
                      <span className="text-slate-400">第 {laps.length - idx} 圈</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{formatMs(lap)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 倒计时 */}
        {activeTab === 'countdown' && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              会议发言与活动倒计时
            </span>

            <div className={`text-7xl font-black font-mono transition-colors ${
              cdRemain <= 10 && cdRemain > 0
                ? 'text-rose-600 animate-pulse'
                : 'text-slate-800 dark:text-slate-100'
            }`}>
              {Math.floor(cdRemain / 60)}:
              {String(cdRemain % 60).padStart(2, '0')}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 3, 5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  onClick={() => startCountdown(mins)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {mins} 分钟
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCdRunning(!cdRunning)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                {cdRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {cdRunning ? '暂停' : '继续'}
              </button>
              <button
                onClick={() => {
                  setCdRunning(false);
                  setCdRemain(cdMinutes * 60);
                }}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置
              </button>
            </div>
          </div>
        )}

        {/* 随机点名抽签 */}
        {activeTab === 'lucky' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="text-xs font-semibold text-slate-500 block">
                参与点名/抽奖名单 (每行一个姓名或序号)
              </label>
              <textarea
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                rows={8}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
              <button
                onClick={rollLucky}
                disabled={isRolling}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4" />
                {isRolling ? '正在极速随机抽取...' : '开始随机点名 / 抽签'}
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                抽选结果揭晓
              </span>
              <div
                className={`text-5xl font-black text-center min-h-[64px] flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform ${
                  isRolling ? 'scale-110 opacity-70' : 'scale-100'
                }`}
              >
                {pickedName || '等待抽取'}
              </div>

              {pickedHistory.length > 0 && (
                <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                  <span className="text-[11px] text-slate-400 block mb-1">历史抽选记录:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {pickedHistory.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

