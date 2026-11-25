import React, { useState, useRef, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import { Upload, Download, Crop, RefreshCw, ZoomIn, ZoomOut, Check } from 'lucide-react';

export default function ImageCrop() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgData, setImgData] = useState<{ width: number; height: number; el: HTMLImageElement } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('free'); // 'free', '1:1', '4:3', '16:9', '3:4', '9:16'
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 100, h: 100 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImgSrc(url);
        setImgData({ width: img.naturalWidth, height: img.naturalHeight, el: img });
        // 初始化默认居中 80%
        const w = Math.round(img.naturalWidth * 0.8);
        const h = Math.round(img.naturalHeight * 0.8);
        const x = Math.round((img.naturalWidth - w) / 2);
        const y = Math.round((img.naturalHeight - h) / 2);
        setCropBox({ x, y, w, h });
      };
      img.src = url;
    }
  };

  // 根据当前 cropBox 生成实时预览
  useEffect(() => {
    if (!imgData) return;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, cropBox.w);
    canvas.height = Math.max(1, cropBox.h);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imgData.el,
      cropBox.x, cropBox.y, cropBox.w, cropBox.h,
      0, 0, cropBox.w, cropBox.h
    );
    setPreviewUrl(canvas.toDataURL('image/png'));
  }, [cropBox, imgData]);

  const applyRatio = (ratio: string) => {
    setAspectRatio(ratio);
    if (!imgData) return;
    const { width: W, height: H } = imgData;

    let targetW = W;
    let targetH = H;

    if (ratio === '1:1') {
      const s = Math.min(W, H);
      targetW = s;
      targetH = s;
    } else if (ratio === '4:3') {
      if (W / H > 4 / 3) {
        targetH = H;
        targetW = Math.round(H * 4 / 3);
      } else {
        targetW = W;
        targetH = Math.round(W * 3 / 4);
      }
    } else if (ratio === '16:9') {
      if (W / H > 16 / 9) {
        targetH = H;
        targetW = Math.round(H * 16 / 9);
      } else {
        targetW = W;
        targetH = Math.round(W * 9 / 16);
      }
    } else if (ratio === '3:4') {
      if (W / H > 3 / 4) {
        targetH = H;
        targetW = Math.round(H * 3 / 4);
      } else {
        targetW = W;
        targetH = Math.round(W * 4 / 3);
      }
    } else if (ratio === '9:16') {
      if (W / H > 9 / 16) {
        targetH = H;
        targetW = Math.round(H * 9 / 16);
      } else {
        targetW = W;
        targetH = Math.round(W * 16 / 9);
      }
    }

    setCropBox({
      x: Math.max(0, Math.round((W - targetW) / 2)),
      y: Math.max(0, Math.round((H - targetH) / 2)),
      w: targetW,
      h: targetH
    });
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `cropped_${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolPage
      title="图片裁剪工具"
      description="纯前端离线图片选区裁剪，支持自由比例、1:1、4:3、16:9等常用比例快速截取"
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
            <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              点击或拖拽上传要裁剪的图片
            </p>
            <p className="text-xs text-slate-500 mt-1">支持 PNG, JPG, WEBP, GIF 等格式</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧控制面板 */}
            <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  常用比例预设
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'free', label: '自由' },
                    { key: '1:1', label: '1:1 正方' },
                    { key: '4:3', label: '4:3 经典' },
                    { key: '16:9', label: '16:9 宽屏' },
                    { key: '3:4', label: '3:4 竖屏' },
                    { key: '9:16', label: '9:16 封面' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => applyRatio(item.key)}
                      className={`px-2 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                        aspectRatio === item.key
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {imgData && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>原图尺寸</span>
                    <span className="font-mono">{imgData.width} × {imgData.height} px</span>
                  </div>
                  <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                    <span>裁剪后尺寸</span>
                    <span className="font-mono">{cropBox.w} × {cropBox.h} px</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-slate-600 dark:text-slate-400">裁剪选区 X 偏移 (px)</label>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, imgData.width - cropBox.w)}
                      value={cropBox.x}
                      onChange={(e) => setCropBox({ ...cropBox, x: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <label>裁剪选区 Y 偏移 (px)</label>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, imgData.height - cropBox.h)}
                      value={cropBox.y}
                      onChange={(e) => setCropBox({ ...cropBox, y: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />

                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 pt-2">
                      <label>选区宽度 (px)</label>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={imgData.width - cropBox.x}
                      value={cropBox.w}
                      onChange={(e) => setCropBox({ ...cropBox, w: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />

                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 pt-2">
                      <label>选区高度 (px)</label>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={imgData.height - cropBox.y}
                      value={cropBox.h}
                      onChange={(e) => setCropBox({ ...cropBox, h: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!previewUrl}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  下载裁剪图片
                </button>
                <button
                  onClick={() => {
                    setImgSrc(null);
                    setImgData(null);
                    setPreviewUrl(null);
                  }}
                  className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重新上传图片
                </button>
              </div>
            </div>

            {/* 右侧预览区 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 absolute top-3 left-4">
                  裁剪实时预览
                </span>
                {previewUrl ? (
                  <div className="max-h-[420px] max-w-full p-2 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Cropped Preview"
                      className="max-h-[380px] object-contain rounded shadow-lg border border-slate-200 dark:border-slate-700 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]"
                    />
                  </div>
                ) : (
                  <Crop className="w-12 h-12 text-slate-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

