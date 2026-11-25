import React, { useState, useRef } from 'react';
import ToolPage from '../../components/ToolPage';
import { Upload, Download, ArrowUp, ArrowDown, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import jsPDF from 'jspdf';

interface ImageItem {
  id: string;
  name: string;
  url: string;
  file: File;
  width: number;
  height: number;
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'a3' | 'letter' | 'auto'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(10); // mm
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2),
            name: file.name,
            url,
            file,
            width: img.naturalWidth,
            height: img.naturalHeight,
          },
        ]);
      };
      img.src = url;
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setImages(next);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setImages(next);
  };

  const removeImg = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    try {
      let doc: jsPDF | null = null;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];

        if (pageSize === 'auto') {
          // 自适应原图像素换算为 mm (72 dpi 换算)
          const pxToMm = 0.264583;
          const pageW = item.width * pxToMm;
          const pageH = item.height * pxToMm;
          const ori = pageW > pageH ? 'l' : 'p';

          if (i === 0) {
            doc = new jsPDF({
              orientation: ori,
              unit: 'mm',
              format: [pageW, pageH],
            });
          } else {
            doc?.addPage([pageW, pageH], ori);
          }
          doc?.addImage(item.url, 'JPEG', 0, 0, pageW, pageH);
        } else {
          // 固定纸张
          if (i === 0) {
            doc = new jsPDF({
              orientation: orientation === 'portrait' ? 'p' : 'l',
              unit: 'mm',
              format: pageSize,
            });
          } else {
            doc?.addPage(pageSize, orientation === 'portrait' ? 'p' : 'l');
          }

          const pageWidth = doc!.internal.pageSize.getWidth();
          const pageHeight = doc!.internal.pageSize.getHeight();

          const availW = pageWidth - margin * 2;
          const availH = pageHeight - margin * 2;

          // 计算保持比例缩放
          const imgRatio = item.width / item.height;
          let drawW = availW;
          let drawH = drawW / imgRatio;

          if (drawH > availH) {
            drawH = availH;
            drawW = drawH * imgRatio;
          }

          const posX = margin + (availW - drawW) / 2;
          const posY = margin + (availH - drawH) / 2;

          doc?.addImage(item.url, 'JPEG', posX, posY, drawW, drawH);
        }
      }

      if (doc) {
        doc.save(`images_${Date.now()}.pdf`);
      }
    } catch (err) {
      console.error(err);
      alert('生成 PDF 失败，请检查图片格式');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ToolPage
      title="图片批量转 PDF 文档"
      description="纯浏览器前端将多张图片（JPG/PNG/WEBP）一键打包生成高清 PDF 文档，支持自定义纸张、边距与排版"
    >
      <div className="space-y-6">
        {/* 上方设置栏 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              纸张规格
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="a4">A4 (210 × 297 mm)</option>
              <option value="a3">A3 (297 × 420 mm)</option>
              <option value="letter">Letter (信纸规格)</option>
              <option value="auto">自适应图片原有大小</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              页面方向
            </label>
            <select
              disabled={pageSize === 'auto'}
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="portrait">纵向 (Portrait)</option>
              <option value="landscape">横向 (Landscape)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              页边距
            </label>
            <select
              disabled={pageSize === 'auto'}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value={0}>无边距 (0 mm)</option>
              <option value={5}>紧凑 (5 mm)</option>
              <option value={10}>标准 (10 mm)</option>
              <option value={20}>宽松 (20 mm)</option>
            </select>
          </div>

          <button
            onClick={generatePdf}
            disabled={images.length === 0 || isGenerating}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? '生成中...' : `导出 PDF (${images.length} 页)`}
          </button>
        </div>

        {/* 图片列表与上传区 */}
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFiles}
            />
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              点击或拖拽添加更多图片（可多选批量添加）
            </p>
            <p className="text-xs text-slate-400 mt-0.5">支持按上下箭头自由调整每一页的排列顺序</p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col group"
                >
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={item.url} alt={item.name} className="max-h-full max-w-full object-contain" />
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-mono">
                      第 {idx + 1} 页
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[120px]" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        title="前移"
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-20"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === images.length - 1}
                        title="后移"
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-20"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeImg(item.id)}
                        title="删除此页"
                        className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  );
}

