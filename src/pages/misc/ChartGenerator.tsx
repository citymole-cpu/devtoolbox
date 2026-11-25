import React, { useState, useRef } from 'react';
import ToolPage from '../../components/ToolPage';
import { BarChart3, PieChart, LineChart, Download, Plus, Trash2, Palette } from 'lucide-react';

interface DataItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ChartGenerator() {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'donut'>('pie');
  const [title, setTitle] = useState<string>('2026 年季度业务统计');
  const [data, setData] = useState<DataItem[]>([
    { id: '1', label: 'Q1 第一季度', value: 350, color: '#3b82f6' },
    { id: '2', label: 'Q2 第二季度', value: 480, color: '#10b981' },
    { id: '3', label: 'Q3 第三季度', value: 620, color: '#f59e0b' },
    { id: '4', label: 'Q4 第四季度', value: 410, color: '#8b5cf6' },
  ]);

  const svgRef = useRef<SVGSVGElement>(null);

  const addRow = () => {
    const nextColor = DEFAULT_COLORS[data.length % DEFAULT_COLORS.length];
    setData([
      ...data,
      {
        id: Math.random().toString(36).substring(2),
        label: `项目 ${data.length + 1}`,
        value: 100,
        color: nextColor,
      },
    ]);
  };

  const removeRow = (id: string) => {
    setData(data.filter((d) => d.id !== id));
  };

  const updateRow = (id: string, field: keyof DataItem, val: any) => {
    setData(
      data.map((d) => (d.id === id ? { ...d, [field]: val } : d))
    );
  };

  const totalValue = data.reduce((acc, cur) => acc + (cur.value > 0 ? cur.value : 0), 0);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const downloadSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart_${Date.now()}.svg`;
    a.click();
  };

  return (
    <ToolPage
      title="在线轻量数据图表生成器"
      description="整合饼图、环形图、柱状图与折线图在线可视化配置，支持增减数据项与纯矢量 SVG/PNG 高清图表导出"
    >
      <div className="space-y-6">
        {/* 类型与标题选择 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { key: 'pie', label: '饼图 (Pie)' },
              { key: 'donut', label: '环形图 (Donut)' },
              { key: 'bar', label: '柱状图 (Bar)' },
              { key: 'line', label: '折线图 (Line)' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setChartType(t.key as any)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  chartType === t.key
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <span className="text-xs text-slate-500 whitespace-nowrap">图表标题:</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
            />
          </div>

          <button
            onClick={downloadSvg}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            导出矢量图 (SVG)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧数据表格编辑 */}
          <div className="lg:col-span-1 space-y-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                数据列表 ({data.length} 项)
              </span>
              <button
                onClick={addRow}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                新增项
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700/60"
                >
                  <input
                    type="color"
                    value={item.color}
                    onChange={(e) => updateRow(item.id, 'color', e.target.value)}
                    className="w-6 h-6 p-0 border-0 bg-transparent rounded cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateRow(item.id, 'label', e.target.value)}
                    placeholder="标签"
                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded min-w-[70px]"
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateRow(item.id, 'value', Number(e.target.value))}
                    className="w-16 px-1.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right font-mono"
                  />
                  {data.length > 1 && (
                    <button
                      onClick={() => removeRow(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 flex justify-between">
              <span>数值总和:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{totalValue}</span>
            </div>
          </div>

          {/* 右侧渲染画布 */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[380px]">
            <svg
              ref={svgRef}
              viewBox="0 0 500 350"
              className="w-full max-w-[500px] h-[350px] overflow-visible"
            >
              {/* 标题 */}
              <text
                x="250"
                y="30"
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-100 font-bold text-base"
              >
                {title}
              </text>

              {/* 饼图与环形图 */}
              {(chartType === 'pie' || chartType === 'donut') && (
                <g transform="translate(190, 190)">
                  {(() => {
                    let accAngle = 0;
                    return data.map((item, idx) => {
                      if (totalValue <= 0 || item.value <= 0) return null;
                      const angle = (item.value / totalValue) * Math.PI * 2;
                      const x1 = Math.cos(accAngle) * 110;
                      const y1 = Math.sin(accAngle) * 110;
                      const x2 = Math.cos(accAngle + angle) * 110;
                      const y2 = Math.sin(accAngle + angle) * 110;
                      const largeArc = angle > Math.PI ? 1 : 0;
                      const path = `M 0 0 L ${x1} ${y1} A 110 110 0 ${largeArc} 1 ${x2} ${y2} Z`;
                      accAngle += angle;
                      return <path key={idx} d={path} fill={item.color} stroke="#ffffff" strokeWidth="2" />;
                    });
                  })()}
                  {chartType === 'donut' && (
                    <circle r="60" className="fill-white dark:fill-slate-800" />
                  )}
                </g>
              )}

              {/* 柱状图 */}
              {chartType === 'bar' && (
                <g transform="translate(60, 60)">
                  {data.map((item, idx) => {
                    const barH = (item.value / maxValue) * 200;
                    const barW = Math.min(40, 360 / data.length - 10);
                    const posX = idx * (360 / data.length) + 10;
                    const posY = 220 - barH;
                    return (
                      <g key={idx}>
                        <rect x={posX} y={posY} width={barW} height={barH} rx="4" fill={item.color} />
                        <text
                          x={posX + barW / 2}
                          y={posY - 6}
                          textAnchor="middle"
                          className="fill-slate-500 font-mono text-[10px]"
                        >
                          {item.value}
                        </text>
                        <text
                          x={posX + barW / 2}
                          y="240"
                          textAnchor="middle"
                          className="fill-slate-600 dark:fill-slate-400 text-[10px]"
                        >
                          {item.label}
                        </text>
                      </g>
                    );
                  })}
                  {/* X 轴 */}
                  <line x1="0" y1="220" x2="380" y2="220" stroke="#cbd5e1" strokeWidth="1" />
                </g>
              )}

              {/* 折线图 */}
              {chartType === 'line' && (
                <g transform="translate(60, 60)">
                  {(() => {
                    const step = data.length > 1 ? 340 / (data.length - 1) : 170;
                    const points = data
                      .map((d, i) => `${i * step},${220 - (d.value / maxValue) * 190}`)
                      .join(' ');
                    return (
                      <>
                        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} />
                        {data.map((d, i) => {
                          const px = i * step;
                          const py = 220 - (d.value / maxValue) * 190;
                          return (
                            <g key={i}>
                              <circle cx={px} cy={py} r="5" fill={d.color} stroke="#ffffff" strokeWidth="2" />
                              <text x={px} y={py - 10} textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 font-mono text-[10px]">
                                {d.value}
                              </text>
                              <text x={px} y="240" textAnchor="middle" className="fill-slate-500 text-[10px]">
                                {d.label}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                  <line x1="0" y1="220" x2="360" y2="220" stroke="#cbd5e1" strokeWidth="1" />
                </g>
              )}

              {/* 图例 */}
              {(chartType === 'pie' || chartType === 'donut') && (
                <g transform="translate(340, 100)">
                  {data.map((item, idx) => (
                    <g key={idx} transform={`translate(0, ${idx * 24})`}>
                      <rect width="12" height="12" rx="3" fill={item.color} />
                      <text x="18" y="10" className="fill-slate-700 dark:fill-slate-300 text-[11px]">
                        {item.label} (
                        {totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0}%)
                      </text>
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

