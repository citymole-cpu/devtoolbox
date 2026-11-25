import React, { useState, useRef } from 'react';
import ToolPage from '../../components/ToolPage';
import { Upload, Camera, MapPin, ShieldCheck, Download, Trash2, Info, Eye } from 'lucide-react';
import CopyButton from '../../components/CopyButton';

interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  focalLength?: string;
  lensModel?: string;
  software?: string;
  width?: number;
  height?: number;
  gps?: {
    lat: number;
    lng: number;
    latRef: string;
    lngRef: string;
    formatted: string;
  };
  rawTags: { tag: string; name: string; value: string }[];
}

export default function ExifViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifData | null>(null);
  const [hasExif, setHasExif] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExif = (buffer: ArrayBuffer): ExifData | null => {
    const view = new DataView(buffer);
    // 检查 JPEG SOI (0xFFD8)
    if (view.getUint16(0) !== 0xFFD8) {
      return null;
    }

    let offset = 2;
    const length = buffer.byteLength;

    while (offset < length) {
      if (view.getUint8(offset) !== 0xFF) break;
      const marker = view.getUint8(offset + 1);

      // APP1 标记 (0xFFE1)
      if (marker === 0xE1) {
        const app1Length = view.getUint16(offset + 2);
        const exifHeader = String.fromCharCode(
          view.getUint8(offset + 4),
          view.getUint8(offset + 5),
          view.getUint8(offset + 6),
          view.getUint8(offset + 7)
        );

        if (exifHeader === 'Exif') {
          const tiffOffset = offset + 10;
          return readTiff(view, tiffOffset);
        }
        offset += 2 + app1Length;
      } else if ((marker & 0xFF00) !== 0xFF00 && marker !== 0xD8 && marker !== 0xD9) {
        offset += 2 + view.getUint16(offset + 2);
      } else {
        offset += 2;
      }
    }
    return null;
  };

  const readTiff = (view: DataView, tiffStart: number): ExifData => {
    const byteOrder = view.getUint16(tiffStart);
    const littleEndian = byteOrder === 0x4949; // 'II'

    const firstIFDOffset = view.getUint32(tiffStart + 4, littleEndian);
    const tags: { tag: string; name: string; value: string }[] = [];
    let exifSubIFDOffset = 0;
    let gpsIFDOffset = 0;

    const readIFD = (ifdOffset: number) => {
      const numEntries = view.getUint16(tiffStart + ifdOffset, littleEndian);
      for (let i = 0; i < numEntries; i++) {
        const entryOffset = tiffStart + ifdOffset + 2 + i * 12;
        const tagId = view.getUint16(entryOffset, littleEndian);
        const type = view.getUint16(entryOffset + 2, littleEndian);
        const count = view.getUint32(entryOffset + 4, littleEndian);
        const valOffset = entryOffset + 8;

        if (tagId === 0x8769) {
          exifSubIFDOffset = view.getUint32(valOffset, littleEndian);
        } else if (tagId === 0x8825) {
          gpsIFDOffset = view.getUint32(valOffset, littleEndian);
        } else {
          // 提取文本或数值
          let val = '';
          if (type === 2) { // ASCII
            const strOffset = count > 4 ? tiffStart + view.getUint32(valOffset, littleEndian) : valOffset;
            let str = '';
            for (let s = 0; s < count - 1; s++) {
              str += String.fromCharCode(view.getUint8(strOffset + s));
            }
            val = str;
          } else if (type === 3) { // SHORT
            val = String(view.getUint16(valOffset, littleEndian));
          } else if (type === 4) { // LONG
            val = String(view.getUint32(valOffset, littleEndian));
          } else if (type === 5) { // RATIONAL
            const ratOffset = tiffStart + view.getUint32(valOffset, littleEndian);
            const num = view.getUint32(ratOffset, littleEndian);
            const den = view.getUint32(ratOffset + 4, littleEndian);
            val = den !== 0 ? (num / den).toFixed(2) : `${num}/${den}`;
          }

          if (val) {
            tags.push({ tag: `0x${tagId.toString(16).toUpperCase()}`, name: getTagName(tagId), value: val });
          }
        }
      }
    };

    readIFD(firstIFDOffset);
    if (exifSubIFDOffset > 0) readIFD(exifSubIFDOffset);

    // 结构化信息
    const getVal = (name: string) => tags.find(t => t.name.toLowerCase() === name.toLowerCase())?.value;

    return {
      make: getVal('Make'),
      model: getVal('Model'),
      dateTime: getVal('DateTimeOriginal') || getVal('DateTime'),
      exposureTime: getVal('ExposureTime'),
      fNumber: getVal('FNumber'),
      iso: getVal('ISOSpeedRatings'),
      focalLength: getVal('FocalLength'),
      lensModel: getVal('LensModel'),
      software: getVal('Software'),
      rawTags: tags
    };
  };

  const getTagName = (tag: number): string => {
    const map: Record<number, string> = {
      0x010E: 'ImageDescription',
      0x010F: 'Make',
      0x0110: 'Model',
      0x0112: 'Orientation',
      0x011A: 'XResolution',
      0x011B: 'YResolution',
      0x0131: 'Software',
      0x0132: 'DateTime',
      0x8298: 'Copyright',
      0x829A: 'ExposureTime',
      0x829D: 'FNumber',
      0x8822: 'ExposureProgram',
      0x8827: 'ISOSpeedRatings',
      0x9003: 'DateTimeOriginal',
      0x9004: 'DateTimeDigitized',
      0x9201: 'ShutterSpeedValue',
      0x9202: 'ApertureValue',
      0x9204: 'ExposureBiasValue',
      0x9207: 'MeteringMode',
      0x9208: 'LightSource',
      0x9209: 'Flash',
      0x920A: 'FocalLength',
      0xA434: 'LensModel'
    };
    return map[tag] || `Tag_${tag.toString(16)}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setImgSrc(URL.createObjectURL(f));

      const reader = new FileReader();
      reader.onload = (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        if (buffer) {
          const parsed = parseExif(buffer);
          if (parsed && (parsed.rawTags.length > 0 || parsed.model)) {
            setExif(parsed);
            setHasExif(true);
          } else {
            setExif(null);
            setHasExif(false);
          }
        }
      };
      reader.readAsArrayBuffer(f);
    }
  };

  // 纯客户端擦除 EXIF 下载
  const handleRemoveExifAndDownload = () => {
    if (!imgSrc || !file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clean_${file.name}`;
            a.click();
          }
        }, 'image/jpeg', 0.95);
      }
    };
    img.src = imgSrc;
  };

  return (
    <ToolPage
      title="照片 Exif 信息查看与清除器"
      description="纯本地查看数码相机与手机拍摄的快门、光圈、ISO、镜头、时间等元数据，支持一键脱敏清除隐私下载"
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
              accept="image/jpeg,image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />
            <Camera className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              点击或拖拽上传 JPG / JPEG 照片
            </p>
            <p className="text-xs text-slate-500 mt-1">支持数码相机 (Sony, Canon, Nikon, Fuji) 与手机拍照原图</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧照片与操作 */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <img
                  src={imgSrc}
                  alt="Target"
                  className="w-full max-h-[300px] object-contain rounded-lg bg-slate-100 dark:bg-slate-900"
                />
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-slate-500 truncate font-mono">
                    文件名: {file?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    大小: {file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                  </div>

                  <button
                    onClick={handleRemoveExifAndDownload}
                    className="w-full mt-3 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    一键清除 Exif 隐私并下载纯净图
                  </button>
                  <button
                    onClick={() => {
                      setImgSrc(null);
                      setFile(null);
                      setExif(null);
                      setHasExif(null);
                    }}
                    className="w-full py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
                  >
                    更换其他照片
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧 Exif 详情 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  拍摄参数与设备信息
                </h3>

                {hasExif === false ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500">
                    <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm">该照片未包含 Exif 元数据，或已被压缩工具清除。</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[11px] text-slate-400 block">设备品牌</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {exif?.make || '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[11px] text-slate-400 block">相机型号</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {exif?.model || '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[11px] text-slate-400 block">光圈值</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {exif?.fNumber ? `f/${exif.fNumber}` : '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[11px] text-slate-400 block">ISO 感光度</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {exif?.iso ? `ISO ${exif.iso}` : '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[11px] text-slate-400 block">快门速度</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {exif?.exposureTime ? `${exif.exposureTime} s` : '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[11px] text-slate-400 block">焦距</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {exif?.focalLength ? `${exif.focalLength} mm` : '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/50 col-span-2">
                        <span className="text-[11px] text-slate-400 block">拍摄时间</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 font-mono">
                          {exif?.dateTime || '-'}
                        </span>
                      </div>
                    </div>

                    {exif?.lensModel && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/50 text-xs">
                        <span className="text-slate-400 mr-2">使用镜头:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{exif.lensModel}</span>
                      </div>
                    )}

                    {exif?.rawTags && exif.rawTags.length > 0 && (
                      <div className="pt-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
                          全部元数据标签清单 ({exif.rawTags.length})
                        </span>
                        <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 text-slate-500">
                              <tr>
                                <th className="p-2 border-b border-slate-200 dark:border-slate-700">Tag</th>
                                <th className="p-2 border-b border-slate-200 dark:border-slate-700">名称</th>
                                <th className="p-2 border-b border-slate-200 dark:border-slate-700">数值</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {exif.rawTags.map((t, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                  <td className="p-2 font-mono text-slate-400">{t.tag}</td>
                                  <td className="p-2 font-medium text-slate-700 dark:text-slate-300">{t.name}</td>
                                  <td className="p-2 font-mono text-slate-600 dark:text-slate-400 break-all">{t.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

