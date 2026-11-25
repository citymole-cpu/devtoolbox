import React, { useState, useRef, useEffect } from 'react';
import ToolPage from '../../components/ToolPage';
import { Upload, Download, UserCheck, RefreshCw, Palette, Grid, Printer } from 'lucide-react';

interface PhotoStandard {
  id: string;
  name: string;
  mm: string;
  px: [number, number];
  dpi: number;
  desc: string;
}

const STANDARDS: PhotoStandard[] = [
  { id: '1inch', name: '一寸', mm: '25 × 35 mm', px: [295, 413], dpi: 300, desc: '简历、证件、驾照、资格考' },
  { id: '2inch', name: '二寸', mm: '35 × 49 mm', px: [413, 579], dpi: 300, desc: '结婚登记、出国签证、证书' },
  { id: 's1inch', name: '小一寸', mm: '22 × 32 mm', px: [260, 378], dpi: 300, desc: '驾照、学生证' },
  { id: 'b1inch', name: '大一寸', mm: '33 × 48 mm', px: [390, 567], dpi: 300, desc: '护照、港澳通行证、中国签证' },
  { id: 's2inch', name: '小二寸', mm: '35 × 45 mm', px: [413, 531], dpi: 300, desc: '多数欧洲签证、申根' },
  { id: 'idcard', name: '二代身份证', mm: '26 × 32 mm', px: [358, 441], dpi: 350, desc: '二代身份证、社保卡' },
  { id: 'cet', name: '英语四六级/高考', mm: '电子版', px: [240, 320], dpi: 300, desc: '全国等级考试报名统一规范' },
  { id: 'teacher', name: '教师资格证', mm: '25 × 35 mm', px: [295, 413], dpi: 300, desc: '中小学及幼儿教师资格考试' },
];

export default function IdPhotoStandard() {
  const [selectedStd, setSelectedStd] = useState<PhotoStandard>(STANDARDS[0]);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [origImg, setOrigImg] = useState<HTMLImageElement | null>(null);
  const [bgColor, setBgColor] = useState<string>('#ffffff'); // 白底、蓝底、红底
  const [tolerance, setTolerance] = useState<number>(30); // 容差
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [printUrl, setPrintUrl] = useState<string | null>(null);

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

    const [targetW, targetH] = selectedStd.px;
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 先铺设目标底色
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetW, targetH);

    // 将人像按比例剧中裁剪绘制到目标尺寸
    const imgRatio = origImg.naturalWidth / origImg.naturalHeight;
    const targetRatio = targetW / targetH;
    let sW = origImg.naturalWidth;
    let sH = origImg.naturalHeight;
    let sX = 0;
    let sY = 0;

    if (imgRatio > targetRatio) {
      sW = origImg.naturalHeight * targetRatio;
      sX = (origImg.naturalWidth - sW) / 2;
    } else {
      sH = origImg.naturalWidth / targetRatio;
      sY = (origImg.naturalHeight - sH) / 2;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetW;
    tempCanvas.height = targetH;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(origImg, sX, sY, sW, sH, 0, 0, targetW, targetH);
    const imgData = tempCtx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;

    // 智能背景替换：检测左上角、右上角的代表背景色彩
    const bgR = (data[0] + data[(targetW - 1) * 4]) / 2;
    const bgG = (data[1] + data[(targetW - 1) * 4 + 1]) / 2;
    const bgB = (data[2] + data[(targetW - 1) * 4 + 2]) / 2;

    const hex = bgColor.replace('#', '');
    const toR = parseInt(hex.substring(0, 2), 16);
    const toG = parseInt(hex.substring(2, 4), 16);
    const toB = parseInt(hex.substring(4, 6), 16);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const diff = Math.sqrt(
        Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
      );

      if (diff < tolerance) {
        data[i] = toR;
        data[i + 1] = toG;
        data[i + 2] = toB;
      }
    }

    tempCtx.putImageData(imgData, 0, 0);
    const singleDataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
    setResultUrl(singleDataUrl);

    // 生成 6寸相纸排版图 (1800 x 1200 px @ 300dpi, 4x2 排版)
    const printCanvas = document.createElement('canvas');
    printCanvas.width = 1800;
    printCanvas.height = 1200;
    const printCtx = printCanvas.getContext('2d');
    if (printCtx) {
      printCtx.fillStyle = '#ffffff';
      printCtx.fillRect(0, 0, 1800, 1200);

      // 计算可排版行数与列数
      const cols = 4;
      const rows = 2;
      const gapX = (1800 - targetW * cols) / (cols + 1);
      const gapY = (1200 - targetH * rows) / (rows + 1);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const posX = gapX + c * (targetW + gapX);
          const posY = gapY + r * (targetH + gapY);
          printCtx.drawImage(tempCanvas, posX, posY, targetW, targetH);
          // 裁剪辅助虚线
          printCtx.strokeStyle = '#e2e8f0';
          printCtx.lineWidth = 1;
          printCtx.strokeRect(posX - 1, posY - 1, targetW + 2, targetH + 2);
        }
      }
      setPrintUrl(printCanvas.toDataURL('image/jpeg', 0.95));
    }
  }, [origImg, selectedStd, bgColor, tolerance]);

  const downloadSingle = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `photo_${selectedStd.id}_${Date.now()}.jpg`;
    a.click();
  };

  const downloadPrint = () => {
    if (!printUrl) return;
    const a = document.createElement('a');
    a.href = printUrl;
    a.download = `print_6inch_${Date.now()}.jpg`;
    a.click();
  };

  return (
    <ToolPage
      title="证件照标准规格速查与裁切换底一体机"
      description="全面对齐国内标准证件照（一寸、二寸、身份证、护照、四六级等），纯前端离线换底色与6寸相纸自动排版"
    >
      <div className="space-y-6">
        {/* 证件照标准列表 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-500" />
            选择国家标准规格
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {STANDARDS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStd(s)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedStd.id === s.id
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs">{s.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{s.mm}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {s.px[0]} × {s.px[1]} px
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate" title={s.desc}>
                  {s.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 制作区 */}
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
              上传你的半身正面免冠照片
            </p>
            <p className="text-xs text-slate-500 mt-1">支持纯色或微杂背景，建议头部端正光线均匀</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧配置 */}
            <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  证件底色选择
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: '#ffffff', label: '白底 (通用)', border: '#cbd5e1' },
                    { key: '#0077c8', label: '蓝底 (毕业/社保)', border: '#0077c8' },
                    { key: '#c40000', label: '红底 (结婚/考研)', border: '#c40000' },
                    { key: '#e2e8f0', label: '浅灰底 (高端)', border: '#94a3b8' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setBgColor(c.key)}
                      className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-colors ${
                        bgColor === c.key
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: c.key, borderColor: c.border }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>抠图色彩容差</span>
                  <span className="font-mono">{tolerance}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">原背景边缘有杂边时可微调容差</span>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
                <button
                  onClick={downloadSingle}
                  disabled={!resultUrl}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  下载单张 {selectedStd.name} ({selectedStd.px[0]}×{selectedStd.px[1]})
                </button>
                <button
                  onClick={downloadPrint}
                  disabled={!printUrl}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  下载 6寸相纸排版版 (冲印版)
                </button>
                <button
                  onClick={() => {
                    setImgSrc(null);
                    setOrigImg(null);
                    setResultUrl(null);
                    setPrintUrl(null);
                  }}
                  className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  更换其他照片
                </button>
              </div>
            </div>

            {/* 右侧预览 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-100 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[320px]">
                  <span className="text-xs font-semibold text-slate-500 mb-3 block">单张证件照 ({selectedStd.name})</span>
                  {resultUrl && (
                    <img
                      src={resultUrl}
                      alt="Single"
                      className="max-h-64 object-contain rounded shadow-lg border border-slate-200 dark:border-slate-700"
                    />
                  )}
                </div>

                <div className="bg-slate-100 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[320px]">
                  <span className="text-xs font-semibold text-slate-500 mb-3 block">6寸相纸冲印排版预览</span>
                  {printUrl && (
                    <img
                      src={printUrl}
                      alt="Print"
                      className="max-h-64 object-contain rounded shadow-lg border border-slate-200 dark:border-slate-700"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

