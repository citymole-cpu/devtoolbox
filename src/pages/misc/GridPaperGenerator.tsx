import React, { useState, useRef, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import { Grid, Printer, Download, Sliders } from 'lucide-react';

type PaperType = 'mizi' | 'tianzi' | 'grid' | 'dots' | 'lines';

export default function GridPaperGenerator() {
  const [paperType, setPaperType] = useState<PaperType>('mizi');
  const [gridSize, setGridSize] = useState<number>(40);
  const [lineColor, setLineColor] = useState<string>('#94a3b8');
  const [dashColor, setDashColor] = useState<string>('#cbd5e1');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 标准 A4 比例画布 (宽 800 x 高 1130)
  const drawPaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 1130;
    canvas.width = W;
    canvas.height = H;

    // 白底
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const marginX = 40;
    const marginY = 50;
    const availW = W - marginX * 2;
    const availH = H - marginY * 2;

    if (paperType === 'grid') {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.8;
      for (let x = marginX; x <= W - marginX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, marginY);
        ctx.lineTo(x, H - marginY);
        ctx.stroke();
      }
      for (let y = marginY; y <= H - marginY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(marginX, y);
        ctx.lineTo(W - marginX, y);
        ctx.stroke();
      }
    } else if (paperType === 'dots') {
      ctx.fillStyle = lineColor;
      for (let x = marginX; x <= W - marginX; x += gridSize) {
        for (let y = marginY; y <= H - marginY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (paperType === 'lines') {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      for (let y = marginY; y <= H - marginY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(marginX, y);
        ctx.lineTo(W - marginX, y);
        ctx.stroke();
      }
    } else if (paperType === 'mizi' || paperType === 'tianzi') {
      const cols = Math.floor(availW / gridSize);
      const rows = Math.floor(availH / gridSize);
      const startX = marginX + (availW - cols * gridSize) / 2;
      const startY = marginY + (availH - rows * gridSize) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * gridSize;
          const y = startY + r * gridSize;

          // 外边框实线
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x, y, gridSize, gridSize);

          // 内部十字虚线
          ctx.save();
          ctx.strokeStyle = dashColor;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([3, 3]);

          // 横中线
          ctx.beginPath();
          ctx.moveTo(x, y + gridSize / 2);
          ctx.lineTo(x + gridSize, y + gridSize / 2);
          ctx.stroke();

          // 竖中线
          ctx.beginPath();
          ctx.moveTo(x + gridSize / 2, y);
          ctx.lineTo(x + gridSize / 2, y + gridSize);
          ctx.stroke();

          // 米字格的对角线
          if (paperType === 'mizi') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + gridSize, y + gridSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + gridSize, y);
            ctx.lineTo(x, y + gridSize);
            ctx.stroke();
          }

          ctx.restore();
        }
      }
    }
  };

  useEffect(() => {
    drawPaper();
  }, [paperType, gridSize, lineColor, dashColor]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `paper_${paperType}_A4_${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolPage
      title="格子纸、米字格与练字帖生成器"
      description="在线生成可直接 A4 打印的练字米字格、田字格、坐标方格纸、点阵手账纸与横线信纸"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧参数调节 */}
          <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                纸张格子类型
              </label>
              <div className="space-y-2">
                {[
                  { key: 'mizi', name: '书法米字格 (汉字练字帖)' },
                  { key: 'tianzi', name: '经典田字格 (硬笔书法)' },
                  { key: 'grid', name: '坐标方格纸 (数学/工程图)' },
                  { key: 'dots', name: '点阵手账纸 (Dot Grid)' },
                  { key: 'lines', name: '康奈尔横线信纸 (Notebook)' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setPaperType(item.key as any)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-colors ${
                      paperType === item.key
                        ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>格子间距大小 (px)</span>
                  <span className="font-mono">{gridSize}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">主线条色彩</span>
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-10 h-7 p-0 border-0 bg-transparent rounded cursor-pointer"
                  />
                </div>
                {(paperType === 'mizi' || paperType === 'tianzi') && (
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">内部虚线色彩</span>
                    <input
                      type="color"
                      value={dashColor}
                      onChange={(e) => setDashColor(e.target.value)}
                      className="w-10 h-7 p-0 border-0 bg-transparent rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors text-xs"
              >
                <Printer className="w-4 h-4" />
                直接调用浏览器打印 A4 纸
              </button>
              <button
                onClick={handleDownload}
                className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                导出高清图片 (PNG)
              </button>
            </div>
          </div>

          {/* 右侧 A4 纸张实时预览 */}
          <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              A4 规格实时预览
            </span>
            <div className="shadow-2xl rounded border border-slate-300 dark:border-slate-700 bg-white max-h-[500px] overflow-hidden">
              <canvas ref={canvasRef} className="max-h-[480px] w-auto object-contain" />
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

