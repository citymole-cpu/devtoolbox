import React, { useState, useRef, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import { Upload, Download, Maximize2, Lock, Unlock, RefreshCw, FileText } from 'lucide-react';

export default function ImageResize() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [origInfo, setOrigInfo] = useState<{ width: number; height: number; size: number; name: string } | null>(null);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<string>('image/png');
  const [quality, setQuality] = useState<number>(90);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        imgElementRef.current = img;
        setImgSrc(url);
        setOrigInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
          name: file.name
        });
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);
      };
      img.src = url;
    }
  };

  const applyPercent = (pct: number) => {
    if (!origInfo) return;
    const w = Math.round((origInfo.width * pct) / 100);
    const h = Math.round((origInfo.height * pct) / 100);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockRatio && origInfo && origInfo.width > 0) {
      const ratio = origInfo.height / origInfo.width;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockRatio && origInfo && origInfo.height > 0) {
      const ratio = origInfo.width / origInfo.height;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  useEffect(() => {
    if (!imgElementRef.current || targetWidth <= 0 || targetHeight <= 0) return;

    setIsProcessing(true);
    const timer = setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(imgElementRef.current!, 0, 0, targetWidth, targetHeight);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setResizedUrl(url);
                setResizedSize(blob.size);
              }
              setIsProcessing(false);
            },
            format,
            quality / 100
          );
        }
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [targetWidth, targetHeight, format, quality]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (!resizedUrl || !origInfo) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const baseName = origInfo.name.substring(0, origInfo.name.lastIndexOf('.')) || origInfo.name;
    const a = document.createElement('a');
    a.href = resizedUrl;
    a.download = `${baseName}_${targetWidth}x${targetHeight}.${ext}`;
    a.click();
  };

  return (
    <ToolPage
      title="在线缩放照片 / 图片"
      description="高质量纯前端图片尺寸缩放，支持按百分比或精确像素缩放、长宽比锁定及多格式转换输出"
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
            <Maximize2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              点击或拖拽上传需要缩放的照片 / 图片
            </p>
            <p className="text-xs text-slate-500 mt-1">支持 PNG, JPG, WEBP, BMP 等格式</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 控制面板 */}
            <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  快速百分比缩放
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[25, 50, 75, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => applyPercent(pct)}
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">尺寸设定 (px)</label>
                  <button
                    onClick={() => setLockRatio(!lockRatio)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                      lockRatio
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lockRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{lockRatio ? '比例已锁定' : '自由比例'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">宽度 (W)</span>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">高度 (H)</span>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                  输出格式与质量
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'image/png', label: 'PNG 无损' },
                    { key: 'image/jpeg', label: 'JPEG' },
                    { key: 'image/webp', label: 'WEBP' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFormat(f.key)}
                      className={`px-2 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                        format === f.key
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {format !== 'image/png' && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>压缩质量</span>
                      <span className="font-mono">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}
              </div>

              {origInfo && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs space-y-1.5 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex justify-between">
                    <span>原尺寸:</span>
                    <span className="font-mono">{origInfo.width} × {origInfo.height} px ({formatFileSize(origInfo.size)})</span>
                  </div>
                  <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium">
                    <span>新尺寸:</span>
                    <span className="font-mono">{targetWidth} × {targetHeight} px ({formatFileSize(resizedSize)})</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!resizedUrl || isProcessing}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  下载缩放后图片
                </button>
                <button
                  onClick={() => {
                    setImgSrc(null);
                    setOrigInfo(null);
                    setResizedUrl(null);
                  }}
                  className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  更换其他图片
                </button>
              </div>
            </div>

            {/* 预览区 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 absolute top-3 left-4">
                  缩放后渲染效果预览
                </span>
                {resizedUrl ? (
                  <div className="max-h-[440px] max-w-full p-2 flex items-center justify-center">
                    <img
                      src={resizedUrl}
                      alt="Resized Preview"
                      className="max-h-[400px] object-contain rounded shadow-lg border border-slate-200 dark:border-slate-700 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]"
                    />
                  </div>
                ) : (
                  <Maximize2 className="w-12 h-12 text-slate-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

