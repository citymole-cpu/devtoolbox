import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { HardDrive, Wifi, Download, Calculator, CheckCircle2 } from 'lucide-react';

export default function DiskBandwidthCalc() {
  const [targetGb, setTargetGb] = useState<number>(100);

  // 带宽换算
  const [bandwidthMbps, setBandwidthMbps] = useState<number>(500);
  const [fileSizeGb, setFileSizeGb] = useState<number>(45);

  // Windows 整数分区公式: (GB - 1) * 4 + 1024 * GB
  const calcNtfsPartitionMb = (gb: number) => {
    if (gb <= 0) return 0;
    return (gb - 1) * 4 + 1024 * gb;
  };

  const partitionMb = calcNtfsPartitionMb(targetGb);

  // 理论下载速度: Mbps / 8 * 0.95 (扣除5%协议头开销)
  const theoreticalSpeedMBps = (bandwidthMbps / 8) * 0.95;
  // 下载耗时秒
  const downloadSeconds = theoreticalSpeedMBps > 0 ? (fileSizeGb * 1024) / theoreticalSpeedMBps : 0;

  const formatDuration = (sec: number) => {
    if (sec <= 0 || !isFinite(sec)) return '0 秒';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.round(sec % 60);
    if (h > 0) return `${h} 小时 ${m} 分 ${s} 秒`;
    if (m > 0) return `${m} 分 ${s} 秒`;
    return `${s} 秒`;
  };

  return (
    <ToolPage
      title="硬盘整数分区与网络带宽耗时计算器"
      description="消除强迫症的 Windows 硬盘无损整数分区 (NTFS/FAT32) MB 换算，及 100M/千兆宽带极速下载耗时换算"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 硬盘整数分区计算器 */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-500" />
              Windows 硬盘无损整数分区计算器
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  目标分区大小 (目标在“我的电脑”显示的完整整数 GB)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={targetGb}
                    onChange={(e) => setTargetGb(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-1.5 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <span className="self-center font-bold text-xs text-slate-500">GB</span>
                </div>
              </div>

              {/* 常用预设快捷按钮 */}
              <div className="flex flex-wrap gap-1.5">
                {[20, 50, 100, 200, 500, 1000].map((gb) => (
                  <button
                    key={gb}
                    onClick={() => setTargetGb(gb)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 font-mono"
                  >
                    {gb} GB
                  </button>
                ))}
              </div>

              {/* 计算结果大卡片 */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                  <span className="font-semibold">应在分区工具中输入的数值 (MB):</span>
                  <CopyButton text={String(partitionMb)} />
                </div>
                <div className="text-2xl font-black font-mono text-blue-800 dark:text-blue-200">
                  {partitionMb.toLocaleString()} MB
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  按此数值分区后，在 Windows 系统资源管理器中将完美显示为整数{' '}
                  <span className="font-bold underline">{targetGb}.00 GB</span>，绝无小数尾数！
                </p>
              </div>
            </div>
          </div>

          {/* 网络带宽与下载耗时计算器 */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-500" />
              宽带网速与文件下载耗时计算
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">签约宽带速率 (Mbps)</label>
                  <select
                    value={bandwidthMbps}
                    onChange={(e) => setBandwidthMbps(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value={100}>100 M 宽带</option>
                    <option value={200}>200 M 宽带</option>
                    <option value={300}>300 M 宽带</option>
                    <option value={500}>500 M 宽带</option>
                    <option value={1000}>1000 M (千兆宽带)</option>
                    <option value={2000}>2000 M (双千兆)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">待下载文件大小 (GB)</label>
                  <input
                    type="number"
                    min={1}
                    value={fileSizeGb}
                    onChange={(e) => setFileSizeGb(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* 结果显示 */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400">
                  <span>理论峰值下载速率:</span>
                  <span className="font-mono font-bold text-sm">
                    {theoreticalSpeedMBps.toFixed(1)} MB/s
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400">
                  <span>完整下载耗时预估:</span>
                  <span className="font-mono font-bold text-sm">
                    {formatDuration(downloadSeconds)}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                  已扣除约 5% 的 TCP/IP 协议头控制包开销，符合国内主流运营商真实网络环境。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

