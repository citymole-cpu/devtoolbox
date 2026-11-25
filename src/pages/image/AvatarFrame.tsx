import React, { useState, useRef, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import { Upload, Download, Sparkles, RefreshCw, Move, ZoomIn } from 'lucide-react';

interface FrameTemplate {
  id: string;
  name: string;
  category: string;
  draw: (ctx: CanvasRenderingContext2D, size: number) => void;
}

export default function AvatarFrame() {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [selectedFrame, setSelectedFrame] = useState<string>('flag-corner');
  const [isCircle, setIsCircle] = useState<boolean>(true);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const frames: FrameTemplate[] = [
    {
      id: 'flag-corner',
      name: '国旗红心挂角',
      category: '爱国/节日',
      draw: (ctx, s) => {
        // 右下角红旗饰品
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = '#dc2626';
        ctx.moveTo(s, s - s * 0.35);
        ctx.lineTo(s, s);
        ctx.lineTo(s - s * 0.35, s);
        ctx.closePath();
        ctx.fill();

        // 五角星
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(s - s * 0.12, s - s * 0.12, s * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // 文字
        ctx.font = `bold ${Math.round(s * 0.045)}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText('中国心', s - 8, s - 8);
        ctx.restore();
      },
    },
    {
      id: 'dragon-gold',
      name: '祥云金龙金环',
      category: '生肖年味',
      draw: (ctx, s) => {
        ctx.save();
        const grad = ctx.createLinearGradient(0, 0, s, s);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.5, '#fde047');
        grad.addColorStop(1, '#b45309');
        ctx.strokeStyle = grad;
        ctx.lineWidth = s * 0.04;
        ctx.strokeRect(s * 0.02, s * 0.02, s * 0.96, s * 0.96);

        // 底部祥云印章
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(s * 0.25, s * 0.88, s * 0.5, s * 0.09, 8);
        ctx.fill();

        ctx.font = `bold ${Math.round(s * 0.045)}px sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('🐲 龙年吉祥 🐲', s * 0.5, s * 0.94);
        ctx.restore();
      },
    },
    {
      id: 'glow-cyber',
      name: '赛博霓虹光环',
      category: '潮流科技',
      draw: (ctx, s) => {
        ctx.save();
        ctx.lineWidth = s * 0.035;
        const grad = ctx.createLinearGradient(0, 0, s, s);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.5, '#a855f7');
        grad.addColorStop(1, '#ec4899');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s * 0.47, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      },
    },
    {
      id: 'pure-minimal',
      name: '极简圆润边框',
      category: '极简',
      draw: (ctx, s) => {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = s * 0.025;
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s * 0.48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      },
    },
    {
      id: 'none',
      name: '无边框 (仅裁剪)',
      category: '原版',
      draw: () => {},
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setAvatarImg(img);
        setAvatarSrc(url);
        setScale(1);
        setOffsetX(0);
        setOffsetY(0);
      };
      img.src = url;
    }
  };

  useEffect(() => {
    if (!avatarImg) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    const S = 500;
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, S, S);

    // 绘制头像裁剪区域
    ctx.save();
    if (isCircle) {
      ctx.beginPath();
      ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // 计算头像居中并应用缩放偏移
    const imgRatio = avatarImg.naturalWidth / avatarImg.naturalHeight;
    let baseW = S;
    let baseH = S;
    if (imgRatio > 1) {
      baseW = S * imgRatio;
    } else {
      baseH = S / imgRatio;
    }

    const drawW = baseW * scale;
    const drawH = baseH * scale;
    const drawX = (S - drawW) / 2 + offsetX;
    const drawY = (S - drawH) / 2 + offsetY;

    ctx.drawImage(avatarImg, drawX, drawY, drawW, drawH);
    ctx.restore();

    // 绘制边框模板
    const tpl = frames.find((f) => f.id === selectedFrame);
    if (tpl) {
      tpl.draw(ctx, S);
    }

    setResultUrl(canvas.toDataURL('image/png'));
  }, [avatarImg, scale, offsetX, offsetY, selectedFrame, isCircle]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `avatar_${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolPage
      title="节日专属头像与头像框制作"
      description="微信/QQ 个人头像一键定制，支持国庆红旗、龙年祥云、赛博霓虹等精美边框与缩放居中"
    >
      <div className="space-y-6">
        {!avatarSrc ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-12 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Sparkles className="w-12 h-12 mx-auto text-amber-500 mb-3" />
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              上传你的个人头像图片
            </p>
            <p className="text-xs text-slate-500 mt-1">支持 PNG, JPG, WEBP，纯浏览器本地合成</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧控制 */}
            <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  选择边框挂件
                </label>
                <div className="space-y-2">
                  {frames.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFrame(f.id)}
                      className={`w-full p-2.5 text-xs rounded-lg border text-left font-medium flex items-center justify-between transition-colors ${
                        selectedFrame === f.id
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{f.name}</span>
                      <span className="text-[10px] text-slate-400">{f.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">裁切形状</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setIsCircle(true)}
                      className={`px-2.5 py-1 text-xs rounded border ${
                        isCircle
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      圆形
                    </button>
                    <button
                      onClick={() => setIsCircle(false)}
                      className={`px-2.5 py-1 text-xs rounded border ${
                        !isCircle
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      正方形
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>头像缩放</span>
                    <span className="font-mono">{scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.05}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 mb-1 block">左右平移</span>
                    <input
                      type="range"
                      min={-150}
                      max={150}
                      value={offsetX}
                      onChange={(e) => setOffsetX(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 mb-1 block">上下平移</span>
                    <input
                      type="range"
                      min={-150}
                      max={150}
                      value={offsetY}
                      onChange={(e) => setOffsetY(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!resultUrl}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  下载专属头像 (500×500)
                </button>
                <button
                  onClick={() => {
                    setAvatarSrc(null);
                    setAvatarImg(null);
                    setResultUrl(null);
                  }}
                  className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  更换其他图片
                </button>
              </div>
            </div>

            {/* 右侧预览 */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/60 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                合成预览
              </span>
              {resultUrl && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                  <img
                    src={resultUrl}
                    alt="Preview"
                    className="w-72 h-72 object-contain rounded-xl bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

