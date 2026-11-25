import React, { useState, useRef } from 'react';
import ToolPage from '../../components/ToolPage';
import { FileQuestion, AlertTriangle, CheckCircle2, Shield, FileCode, Upload, RefreshCw } from 'lucide-react';

interface MagicSignature {
  name: string;
  mime: string;
  ext: string;
  pattern: number[];
  offset?: number;
}

const SIGNATURES: MagicSignature[] = [
  { name: 'PNG 图像文件', mime: 'image/png', ext: 'png', pattern: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { name: 'JPEG / JPG 照片', mime: 'image/jpeg', ext: 'jpg', pattern: [0xFF, 0xD8, 0xFF] },
  { name: 'GIF 动画图像', mime: 'image/gif', ext: 'gif', pattern: [0x47, 0x49, 0x46, 0x38] },
  { name: 'PDF 文档', mime: 'application/pdf', ext: 'pdf', pattern: [0x25, 0x50, 0x44, 0x46] },
  { name: 'ZIP 压缩包 / Office 新格式 (docx/xlsx)', mime: 'application/zip', ext: 'zip', pattern: [0x50, 0x4B, 0x03, 0x04] },
  { name: '7-Zip 压缩文件', mime: 'application/x-7z-compressed', ext: '7z', pattern: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C] },
  { name: 'RAR 压缩归档', mime: 'application/vnd.rar', ext: 'rar', pattern: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07] },
  { name: 'Windows 可执行文件 (PE / EXE / DLL)', mime: 'application/vnd.microsoft.portable-executable', ext: 'exe', pattern: [0x4D, 0x5A] },
  { name: 'Linux ELF 可执行文件', mime: 'application/x-elf', ext: 'elf', pattern: [0x7F, 0x45, 0x4C, 0x46] },
  { name: 'macOS Mach-O 64位二进制', mime: 'application/x-mach-binary', ext: 'dylib', pattern: [0xCF, 0xFA, 0xED, 0xFE] },
  { name: 'WebP 矢量图像', mime: 'image/webp', ext: 'webp', pattern: [0x52, 0x49, 0x46, 0x46] },
  { name: 'SQLite 3 数据库', mime: 'application/x-sqlite3', ext: 'sqlite', pattern: [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33] },
  { name: 'MP3 音频文件', mime: 'audio/mpeg', ext: 'mp3', pattern: [0x49, 0x44, 0x33] },
  { name: 'Java Class 字节码', mime: 'application/java-vm', ext: 'class', pattern: [0xCA, 0xFE, 0xBA, 0xBE] },
  { name: 'WebAssembly (WASM) 模块', mime: 'application/wasm', ext: 'wasm', pattern: [0x00, 0x61, 0x73, 0x6D] },
];

export default function FileInspector() {
  const [file, setFile] = useState<File | null>(null);
  const [hexHeader, setHexHeader] = useState<string>('');
  const [asciiHeader, setAsciiHeader] = useState<string>('');
  const [detectedType, setDetectedType] = useState<MagicSignature | null>(null);
  const [isTampered, setIsTampered] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      inspectFile(f);
    }
  };

  const inspectFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);

      // 生成前 32 字节 Hex 与 ASCII
      const hexArr: string[] = [];
      let asciiStr = '';

      for (let i = 0; i < Math.min(32, bytes.length); i++) {
        const b = bytes[i];
        hexArr.push(b.toString(16).padStart(2, '0').toUpperCase());
        asciiStr += b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
      }

      setHexHeader(hexArr.join(' '));
      setAsciiHeader(asciiStr);

      // 匹配 Magic Bytes
      let match: MagicSignature | null = null;
      for (const sig of SIGNATURES) {
        let isMatch = true;
        for (let j = 0; j < sig.pattern.length; j++) {
          if (bytes[j] !== sig.pattern[j]) {
            isMatch = false;
            break;
          }
        }
        if (isMatch) {
          match = sig;
          break;
        }
      }

      setDetectedType(match);

      // 检查文件名后缀与真实文件类型是否冲突
      const declaredExt = f.name.split('.').pop()?.toLowerCase() || '';
      if (match && declaredExt && declaredExt !== match.ext) {
        // 部分兼容如 jpg/jpeg
        if (
          (match.ext === 'jpg' && (declaredExt === 'jpg' || declaredExt === 'jpeg')) ||
          (match.ext === 'zip' && ['docx', 'xlsx', 'pptx', 'jar', 'apk'].includes(declaredExt))
        ) {
          setIsTampered(false);
        } else {
          setIsTampered(true);
        }
      } else {
        setIsTampered(false);
      }
    };

    reader.readAsArrayBuffer(f.slice(0, 64));
  };

  return (
    <ToolPage
      title="文件格式真伪识别与文件头 (Magic Bytes) 检测"
      description="通过读取文件底层 16 进制文件头魔数 (Magic Numbers)，瞬间识破伪装扩展名的可执行程序、脚本与真实文件格式"
    >
      <div className="space-y-6">
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-12 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <FileQuestion className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              拖入或上传任意文件检测真实格式
            </p>
            <p className="text-xs text-slate-500 mt-1">只读取文件头前数十个字节，秒级检测，零网络上传</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 核心识别结论大卡片 */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                isTampered
                  ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                  : detectedType
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isTampered ? (
                      <AlertTriangle className="w-6 h-6 text-rose-600 animate-bounce" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    )}
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {detectedType ? `真实格式: ${detectedType.name}` : '未识别到已知二进制魔数 (可能为纯文本/代码)'}
                    </h2>
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    文件显示名: <span className="font-semibold text-slate-700 dark:text-slate-300">{file.name}</span> · 大小: {file.size.toLocaleString()} bytes
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setDetectedType(null);
                  }}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  检测其他文件
                </button>
              </div>

              {isTampered && (
                <div className="mt-4 p-3 bg-rose-100/70 dark:bg-rose-900/40 rounded-xl text-rose-800 dark:text-rose-200 text-xs space-y-1 border border-rose-200 dark:border-rose-800">
                  <span className="font-bold block">⚠️ 警告：检测到文件扩展名伪装！</span>
                  <p>
                    该文件表面扩展名为 <span className="font-mono font-bold">.{file.name.split('.').pop()}</span>，但底层真实二进制数据为{' '}
                    <span className="font-mono font-bold">.{detectedType?.ext} ({detectedType?.name})</span>。
                    若这是来自不受信任来源的文件，切勿直接运行，谨防恶意木马伪装！
                  </p>
                </div>
              )}
            </div>

            {/* 文件头十六进制 Hex Dump */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                文件头前 32 字节 (Hex / ASCII 原始转储)
              </div>
              <div className="p-4 bg-slate-950 font-mono text-xs space-y-2">
                <div className="text-emerald-400 break-all select-all leading-relaxed">
                  <span className="text-slate-500 mr-2">HEX:</span>
                  {hexHeader}
                </div>
                <div className="text-blue-400 break-all select-all">
                  <span className="text-slate-500 mr-2">ASC:</span>
                  {asciiHeader}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

