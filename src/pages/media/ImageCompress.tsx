import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Upload, Download, RefreshCw, Minimize } from 'lucide-react'

export default function ImageCompress() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [compressedUrl, setCompressedUrl] = useState('')
  const [origSize, setOrigSize] = useState(0)
  const [compSize, setCompSize] = useState(0)
  const [quality, setQuality] = useState(0.8)
  const [scale, setScale] = useState(1)
  const [originalImg, setOriginalImg] = useState<HTMLImageElement | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    setOrigSize(file.size)

    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setOriginalUrl(src)

      const img = new window.Image()
      img.onload = () => {
        setOriginalImg(img)
        compress(img, quality, scale)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const compress = (img: HTMLImageElement, q: number, s: number) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const targetWidth = Math.round(img.width * s)
    const targetHeight = Math.round(img.height * s)

    canvas.width = targetWidth
    canvas.height = targetHeight

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

    canvas.toBlob(
      blob => {
        if (!blob) return
        setCompSize(blob.size)
        setCompressedUrl(URL.createObjectURL(blob))
      },
      'image/jpeg',
      q
    )
  }

  const handleQualityChange = (q: number) => {
    setQuality(q)
    if (originalImg) compress(originalImg, q, scale)
  }

  const handleScaleChange = (s: number) => {
    setScale(s)
    if (originalImg) compress(originalImg, quality, s)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 KB'
    return (bytes / 1024).toFixed(1) + ' KB'
  }

  const savedPercent = origSize > 0 && compSize > 0 ? Math.round(((origSize - compSize) / origSize) * 100) : 0

  return (
    <ToolPage title="纯前端图片压缩" description="基于浏览器 Canvas 纯本地调整图片分辨率与压缩率，图片绝不上传，保护隐私">
      <div className="flex flex-col gap-6">
        {/* Upload Card */}
        {!originalUrl && (
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
            <span className="font-semibold text-base">选择需要压缩的本地图片</span>
            <span className="text-xs text-gray-400">支持 JPG, PNG, WEBP 等格式 · 纯前端离线压缩</span>
          </div>
        )}

        {originalUrl && (
          <>
            {/* Control Bar */}
            <div className="card p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>画质质量 (Quality): {Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={e => handleQualityChange(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>分辨率缩放 (Scale): {Math.round(scale * 100)}%</span>
                  {originalImg && (
                    <span className="text-gray-400">
                      {Math.round(originalImg.width * scale)} x {Math.round(originalImg.height * scale)} px
                    </span>
                  )}
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={scale}
                  onChange={e => handleScaleChange(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl border">
                <div>
                  <div className="text-xs text-gray-400">压缩节省体积</div>
                  <div className={`text-lg font-bold ${savedPercent > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {savedPercent > 0 ? `-${savedPercent}%` : '未节省'}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary btn-sm"
                >
                  更换图片
                </button>
              </div>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="card p-5 flex flex-col items-center gap-3">
                <div className="w-full flex justify-between items-center text-sm font-semibold">
                  <span>原图</span>
                  <span className="text-gray-500 font-mono text-xs">{formatSize(origSize)}</span>
                </div>
                <div className="w-full h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border flex items-center justify-center p-2 overflow-hidden">
                  <img src={originalUrl} alt="Original" className="max-h-full max-w-full object-contain" />
                </div>
              </div>

              {/* Compressed */}
              <div className="card p-5 flex flex-col items-center gap-3">
                <div className="w-full flex justify-between items-center text-sm font-semibold">
                  <span>压缩后预览</span>
                  <span className="text-green-600 font-mono font-bold text-xs">{formatSize(compSize)}</span>
                </div>
                <div className="w-full h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border flex items-center justify-center p-2 overflow-hidden">
                  <img src={compressedUrl} alt="Compressed" className="max-h-full max-w-full object-contain" />
                </div>
                <a
                  href={compressedUrl}
                  download="compressed_image.jpg"
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
                >
                  <Download className="w-4 h-4" />
                  <span>下载压缩图片 (JPEG)</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}

