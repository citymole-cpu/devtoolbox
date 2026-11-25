import React, { useState, useRef, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import { Upload, Download, Feather, RefreshCw, Sliders, Palette } from 'lucide-react';

export default function SignatureExtract() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [threshold, setThreshold] = useState<number>(180);
  const [contrast, setContrast] = useState<number>(1.5);
  const [penColor, setPenColor] = useState<string>('#000000'); // '#000000', '#1e3a8a', '#dc2626', 'original'
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImgSrc(url);
      };
      img.src = url;
    }
  };

  useEffect(() => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const W = originalImage.naturalWidth;
    const H = originalImage.naturalHeight;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(originalImage, 0, 0);
    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;

    let targetR = 0, targetG = 0, targetB = 0;
    if (penColor !== 'original') {
      const hex = penColor.replace('#', '');
      targetR = parseInt(hex.substring(0, 2), 16);
      targetG = parseInt(hex.substring(2, 4), 16);
      targetB = parseInt(hex.substring(4, 6), 16);
    }

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 亮度 (0~255)
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      // 对比度调整
      gray = ((gray - 128) * contrast) + 128;

      if (gray > threshold) {
        // 白底或亮色区域，完全剔除变为透明
        data[i + 3] = 0;
      } else {
        // 笔迹区域：根据灰度值平滑映射透明度，越深越实
        const alpha = Math.min(255, Math.max(0, Math.round(((threshold - gray) / threshold) * 255 * 1.5)));
        data[i + 3] = alpha;

        if (penColor !== 'original') {
          data[i] = targetR;
          data[i + 1] = targetG;
          data[i + 2] = targetB;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setResultUrl(canvas.toDataURL('image/png'));
  }, [originalImage, threshold, contrast, penColor]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `signature_${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolPage
      title="手写签名提取工具"
      description="拍照上传白纸上的手写签名，智能抹除白纸背景与杂光阴影，一键提取透明 PNG 电子签名印章"
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
            <Feather className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              上传手写签名照片（支持手机拍纸质签名）
            </p>
            <p className="text-xs text-slate-500 mt-1">支持 PNG, JPG, JPEG 格式，纯本地浏览器离线抠图不上传</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧参数调节面板 */}
            <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>去底阈值 (Threshold)</span>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{threshold}</span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={240}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">越往右背景清除越彻底，若笔迹变淡可向左微调</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>笔迹对比度</span>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{contrast}x</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  签名笔迹颜色
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: '#000000', label: '商务纯黑' },
                    { key: '#1e3a8a', label: '签字深蓝' },
                    { key: '#dc2626', label: '公章朱红' },
                    { key: 'original', label: '保留原色' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setPenColor(c.key)}
                      className={`px-3 py-2 text-xs rounded-lg border font-medium flex items-center gap-2 transition-colors ${
                        penColor === c.key
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {c.key !== 'original' && (
                        <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: c.key }} />
                      )}
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!resultUrl}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  下载透明背景签名 (PNG)
                </button>
                <button
                  onClick={() => {
                    setImgSrc(null);
                    setOriginalImage(null);
                    setResultUrl(null);
                  }}
                  className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  更换其他图片
                </button>
              </div>
            </div>

            {/* 右侧实时对比 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500 block mb-2">原拍摄照片</span>
                  <div className="h-64 flex items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <img src={imgSrc} alt="Original" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-2">提取透明签名 (棋盘底透明)</span>
                  <div className="h-64 flex items-center justify-center overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]">
                    {resultUrl && (
                      <img src={resultUrl} alt="Extracted Signature" className="max-h-full max-w-full object-contain" />
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

