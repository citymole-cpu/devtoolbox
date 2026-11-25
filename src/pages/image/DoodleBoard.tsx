import React, { useState, useRef, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import {
  PenTool,
  Highlighter,
  Minus,
  Square,
  Circle,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Grid,
} from 'lucide-react';

type ToolType = 'pen' | 'highlighter' | 'line' | 'rect' | 'circle' | 'eraser';

export default function DoodleBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<string>('#1e293b');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [bgType, setBgType] = useState<'white' | 'grid' | 'dark'>('white');

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置固定高分辨率画布
    canvas.width = 960;
    canvas.height = 600;

    initCanvasBackground(ctx, canvas.width, canvas.height, bgType);
    saveState();
  }, []);

  const initCanvasBackground = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    type: 'white' | 'grid' | 'dark'
  ) => {
    ctx.fillStyle = type === 'dark' ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, w, h);

    if (type === 'grid') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, imgData];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && history[targetIndex]) {
        ctx.putImageData(history[targetIndex], 0, 0);
        setHistoryIndex(targetIndex);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && history[targetIndex]) {
        ctx.putImageData(history[targetIndex], 0, 0);
        setHistoryIndex(targetIndex);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    initCanvasBackground(ctx, canvas.width, canvas.height, bgType);
    saveState();
  };

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pos = getCanvasPos(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 3;
      ctx.globalAlpha = 0.3;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (tool === 'eraser') {
      ctx.strokeStyle = bgType === 'dark' ? '#0f172a' : '#ffffff';
      ctx.lineWidth = lineWidth * 4;
      ctx.globalAlpha = 1;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (['line', 'rect', 'circle'].includes(tool)) {
      // 临时预览需先恢复当前历史状态再绘制
      if (history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1;

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `doodle_${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolPage
      title="在线涂鸦绘画板"
      description="极简在线草图手绘板，支持铅笔、荧光笔、几何图形、粗细调色、撤销重做与高清画作导出"
    >
      <div className="space-y-4">
        {/* 工具控制条 */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          {/* 工具切换 */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            {[
              { key: 'pen', icon: PenTool, label: '画笔' },
              { key: 'highlighter', icon: Highlighter, label: '荧光笔' },
              { key: 'line', icon: Minus, label: '直线' },
              { key: 'rect', icon: Square, label: '矩形' },
              { key: 'circle', icon: Circle, label: '圆形' },
              { key: 'eraser', icon: Eraser, label: '橡皮擦' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTool(t.key as ToolType)}
                title={t.label}
                className={`p-2 rounded-md transition-colors ${
                  tool === t.key
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <t.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* 粗细控制 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">粗细:</span>
            <input
              type="range"
              min={1}
              max={30}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20 accent-blue-600"
            />
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-4">
              {lineWidth}
            </span>
          </div>

          {/* 颜色选择 */}
          <div className="flex items-center gap-1.5">
            {['#1e293b', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border transition-transform ${
                  color === c ? 'scale-125 border-slate-900 dark:border-white shadow' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 p-0 border-0 bg-transparent rounded cursor-pointer"
            />
          </div>

          {/* 历史操作 */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              title="撤销"
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="重做"
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              title="清屏"
              className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* 导出 */}
          <button
            onClick={downloadImage}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            保存作品
          </button>
        </div>

        {/* 画布区域 */}
        <div className="bg-slate-200 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-center overflow-auto shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="rounded-lg shadow-md cursor-crosshair bg-white max-w-full"
            style={{ width: '960px', height: '600px' }}
          />
        </div>
      </div>
    </ToolPage>
  );
}

