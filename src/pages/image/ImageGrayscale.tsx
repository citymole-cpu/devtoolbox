import React, { useState, useRef, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import { Upload, Download, RefreshCw, Sliders, Layers } from 'lucide-react';

type GrayMode = 'standard' | 'binary' | 'invert' | 'sepia' | 'contrast';

export default function ImageGrayscale() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [origImg, setOrigImg] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<GrayMode>('standard');
  const [threshold, setThreshold] = useState<number>(128);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setOrigImg(img);
        setImgSrc(url);
      };
      img.src = url;
    }
  };

  useEffect(() => {
    if (!origImg) return;
    const canvas = document.createElement('canvas');
    const W = origImg.naturalWidth;
    const H = origImg.naturalHeight;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(origImg, 0, 0);
    const imgData = ctx.getImageData(0, 0, W, H);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      if (mode === 'standard') {
        d[i] = gray;
        d[i + 1] = gray;
        d[i + 2] = gray;
      } else if (mode === 'binary') {
        const val = gray >= threshold ? 255 : 0;
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      } else if (mode === 'invert') {
        d[i] = 255 - r;
        d[i + 1] = 255 - g;
        d[i + 2] = 255 - b;
      } else if (mode === 'sepia') {
        d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      } else if (mode === 'contrast') {
        const factor = (259 * (threshold + 255)) / (255 * (259 - threshold));
        d[i] = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
        d[i + 1] = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
        d[i + 2] = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setResultUrl(canvas.toDataURL('image/png'));
  }, [origImg, mode, threshold]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `grayscale_${mode}_${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolPage
      title="在线灰度图 / 黑白图制作工具"
      description="纯本地离线照片快速转黑白、高对比二值化图、负片反色与怀旧褐色照片"
    >
      <div className="space-y-6">
        {!imgSrc ? (
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
            <Layers className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              点击或拖拽上传需要制作黑白灰度的图片
            </p>
            <p className="text-xs text-slate-500 mt-1">支持 PNG, JPG, WEBP 等格式</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧控制 */}
            <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  效果预设
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'standard', name: '标准生理心理学灰度图', desc: '0.299R + 0.587G + 0.114B 自然影调' },
                    { key: 'binary', name: '纯黑白二值化图 (印章/文稿)', desc: '非黑即白，适合扫描件与拓印' },
                    { key: 'contrast', name: '高对比黑白硬照', desc: '黑白分明，质感胶片风格' },
                    { key: 'sepia', name: '复古暖棕老照片 (Sepia)', desc: '19世纪复古暖调' },
                    { key: 'invert', name: '负片胶片反相 (Invert)', desc: '颜色颠倒光影反转' },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMode(m.key as GrayMode)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-colors ${
                        mode === m.key
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">{m.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {(mode === 'binary' || mode === 'contrast') && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>{mode === 'binary' ? '二值化黑白阈值' : '对比度强度'}</span>
                    <span className="font-mono">{threshold}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={254}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!resultUrl}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  下载处理后图片
                </button>
                <button
                  onClick={() => {
                    setImgSrc(null);
                    setOrigImg(null);
                    setResultUrl(null);
                  }}
                  className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  更换其他图片
                </button>
              </div>
            </div>

            {/* 右侧预览对比 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500 block mb-2">原色彩照</span>
                  <div className="h-72 flex items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <img src={imgSrc} alt="Original" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-2">黑白处理效果</span>
                  <div className="h-72 flex items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {resultUrl && (
                      <img src={resultUrl} alt="Result" className="max-h-full max-w-full object-contain" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

