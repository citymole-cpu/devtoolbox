import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Upload, Download, ArrowRightLeft } from 'lucide-react'

export default function ImageConvert() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [quality, setQuality] = useState(0.92)
  const [convertedUrl, setConvertedUrl] = useState('')
  const [convertedSize, setConvertedSize] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    setSourceName(file.name.replace(/\.[^/.]+$/, ''))
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setSourceUrl(src)
      convert(src, targetFormat, quality)
    }
    reader.readAsDataURL(file)
  }

  const convert = (src: string, fmt: 'png' | 'jpeg' | 'webp', q: number) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // If converting to JPEG, draw white background first
      if (fmt === 'jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      const mime = `image/${fmt}`
      canvas.toBlob(
        blob => {
          if (!blob) return
          setConvertedSize(blob.size)
          setConvertedUrl(URL.createObjectURL(blob))
        },
        mime,
        q
      )
    }
    img.src = src
  }

  const handleFormatChange = (fmt: 'png' | 'jpeg' | 'webp') => {
    setTargetFormat(fmt)
    if (sourceUrl) convert(sourceUrl, fmt, quality)
  }

  const handleQualityChange = (q: number) => {
    setQuality(q)
    if (sourceUrl) convert(sourceUrl, targetFormat, q)
  }

  return (
    <ToolPage title="图片格式转换" description="支持 JPG、PNG、WEBP 等图片格式相互无损/高质量纯本地转换并下载">
      <div className="flex flex-col gap-6">
        {!sourceUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="card p-12 border-dashed border-2 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-500 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
              className="hidden"
            />
            <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-full text-brand-600 dark:text-brand-400">
              <Upload className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">选择需要转换格式的本地图片</span>
            <span className="text-xs text-gray-400">支持 JPG, PNG, WEBP, GIF, SVG, BMP 等格式</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">目标转换格式:</span>
                <div className="flex gap-1.5">
                  {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleFormatChange(fmt)}
                      className={`btn btn-sm uppercase font-mono ${
                        targetFormat === fmt ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {fmt === 'jpeg' ? 'JPG' : fmt}
                    </button>
                  ))}
                </div>
              </div>

              {targetFormat !== 'png' && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold">压缩画质: {Math.round(quality * 100)}%</span>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={e => handleQualityChange(Number(e.target.value))}
                    className="w-32 accent-brand-600 cursor-pointer"
                  />
                </div>
              )}

              <button onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm">
                更换图片
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-5 flex flex-col items-center gap-3">
                <div className="w-full text-sm font-semibold">原图预览</div>
                <div className="w-full h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border flex items-center justify-center p-2 overflow-hidden">
                  <img src={sourceUrl} alt="Source" className="max-h-full max-w-full object-contain" />
                </div>
              </div>

              <div className="card p-5 flex flex-col items-center gap-3">
                <div className="w-full flex justify-between items-center text-sm font-semibold">
                  <span>转换后 ({targetFormat.toUpperCase()})</span>
                  <span className="text-xs font-mono text-gray-500">{(convertedSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="w-full h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border flex items-center justify-center p-2 overflow-hidden">
                  <img src={convertedUrl} alt="Converted" className="max-h-full max-w-full object-contain" />
                </div>
                <a
                  href={convertedUrl}
                  download={`${sourceName || 'image'}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
                >
                  <Download className="w-4 h-4" />
                  <span>下载新格式图片</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

