import React, { useState, useEffect, useRef } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Barcode, Download, RefreshCw, Sliders } from 'lucide-react';

// Code128B 常用字符集编码表 (107个模式，每个11位 0/1)
const CODE128_PATTERNS: string[] = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
  '11010011100', '11000111010' // 106: Stop (加上末尾 11)
];

const START_B = 104;
const STOP = 106;

export default function BarcodeGenerator() {
  const [text, setText] = useState<string>('ANTIGRAVITY-2026');
  const [barWidth, setBarWidth] = useState<number>(2);
  const [barHeight, setBarHeight] = useState<number>(80);
  const [showText, setShowText] = useState<boolean>(true);
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const encodeCode128B = (str: string) => {
    const codes: number[] = [START_B];
    let checksum = START_B;

    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i) - 32;
      codes.push(code);
      checksum += code * (i + 1);
    }

    codes.push(checksum % 103);
    codes.push(STOP);

    let binaryStr = '';
    for (const c of codes) {
      binaryStr += CODE128_PATTERNS[c] || '';
    }
    binaryStr += '11'; // Code128 终止线
    return binaryStr;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bin = encodeCode128B(text);
    const quietZone = 20;
    const totalW = bin.length * barWidth + quietZone * 2;
    const totalH = barHeight + (showText ? 30 : 0) + 20;

    canvas.width = totalW;
    canvas.height = totalH;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalW, totalH);

    ctx.fillStyle = lineColor;
    for (let i = 0; i < bin.length; i++) {
      if (bin[i] === '1') {
        ctx.fillRect(quietZone + i * barWidth, 10, barWidth, barHeight);
      }
    }

    if (showText) {
      ctx.fillStyle = lineColor;
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(text, totalW / 2, barHeight + 25);
    }
  }, [text, barWidth, barHeight, showText, lineColor, bgColor]);

  const downloadBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `barcode_${text}_${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolPage
      title="条形码在线生成器 (Barcode Generator)"
      description="纯前端根据文本与数字生成标准 Code 128 条形码，支持调整尺寸、黑白反转、隐藏文本及高清导出"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧控制栏 */}
          <div className="lg:col-span-1 space-y-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                条形码内容 (字母、数字与常用符号)
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="如: 6901234567890"
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>条形码高度</span>
                  <span className="font-mono">{barHeight}px</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={160}
                  value={barHeight}
                  onChange={(e) => setBarHeight(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>单条宽度 (Bar Width)</span>
                  <span className="font-mono">{barWidth}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={barWidth}
                  onChange={(e) => setBarWidth(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">显示底部可读文本</span>
                <input
                  type="checkbox"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">条码线条色</span>
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-10 h-7 p-0 border-0 bg-transparent rounded cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">背景底色</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-7 p-0 border-0 bg-transparent rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={downloadBarcode}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors text-xs mt-3"
            >
              <Download className="w-4 h-4" />
              下载条形码图片 (PNG)
            </button>
          </div>

          {/* 右侧实时条码预览 */}
          <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900/60 p-8 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[300px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              条码生成实时预览
            </span>
            <div className="p-4 bg-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-full overflow-x-auto flex justify-center">
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

