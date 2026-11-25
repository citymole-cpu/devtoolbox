import React, { useState, useRef } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import CryptoJS from 'crypto-js';
import { ShieldCheck, FileCheck, Upload, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface HashResult {
  algo: string;
  hash: string;
}

export default function FileHash() {
  const [file, setFile] = useState<File | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<HashResult[]>([]);
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [calcTime, setCalcTime] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      computeHash(f);
    }
  };

  const computeHash = (f: File) => {
    setIsCalculating(true);
    setProgress(0);
    setResults([]);
    const startTime = performance.now();

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const wordArray = CryptoJS.lib.WordArray.create(buffer as any);

      const md5 = CryptoJS.MD5(wordArray).toString();
      const sha1 = CryptoJS.SHA1(wordArray).toString();
      const sha256 = CryptoJS.SHA256(wordArray).toString();
      const sha512 = CryptoJS.SHA512(wordArray).toString();

      setResults([
        { algo: 'MD5', hash: md5 },
        { algo: 'SHA-1', hash: sha1 },
        { algo: 'SHA-256', hash: sha256 },
        { algo: 'SHA-512', hash: sha512 },
      ]);
      setCalcTime(Math.round(performance.now() - startTime));
      setIsCalculating(false);
    };

    reader.readAsArrayBuffer(f);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolPage
      title="文件安全哈希与完整性校验"
      description="纯本地离线计算大文件的 MD5、SHA-1、SHA-256 与 SHA-512 校验码，支持官方校验码对比防篡改验证，零数据上传"
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
            <FileCheck className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              点击或拖拽上传需要计算校验码的文件
            </p>
            <p className="text-xs text-slate-500 mt-1">支持任意类型文件（安装包、ISO镜像、压缩包、图片等），本地计算不上传</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 文件基本信息卡片 */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-500" />
                  <span>{file.name}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  大小: {formatFileSize(file.size)} ({file.size.toLocaleString()} bytes) · 计算耗时: {calcTime} ms
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setResults([]);
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                更换其他文件
              </button>
            </div>

            {/* 校验码比对输入框 */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                官方/预期的 Hash 校验码比对（可选）:
              </label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value.trim().toLowerCase())}
                placeholder="在此粘贴开发者提供的 MD5 或 SHA 校验码，系统将自动高亮比对..."
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 哈希计算结果清单 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                各算法校验值清单
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((res) => {
                  const isMatch =
                    expectedHash && res.hash.toLowerCase() === expectedHash;
                  return (
                    <div
                      key={res.algo}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                        isMatch
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="w-24 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span>{res.algo}</span>
                        {isMatch && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1 font-mono text-xs text-slate-600 dark:text-slate-400 break-all select-all">
                        {res.hash}
                      </div>
                      <div className="flex items-center gap-2">
                        {isMatch && (
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                            完全匹配！
                          </span>
                        )}
                        <CopyButton text={res.hash} label="复制" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

