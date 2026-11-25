import { useState, useRef, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Upload, Download, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react'

export default function ImageTransform() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [scale, setScale] = useState(1)
  const [previewUrl, setPreviewUrl] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      setSourceUrl(e.target?.result as string)
      setRotation(0)
      setFlipH(false)
      setFlipV(false)
      setScale(1)
    }
    reader.readAsDataURL(file)
  }

  const renderTransform = () => {
    if (!sourceUrl) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const isRotated90or270 = rotation % 180 !== 0
      const baseWidth = isRotated90or270 ? img.height : img.width
      const baseHeight = isRotated90or270 ? img.width : img.height

      canvas.width = Math.round(baseWidth * scale)
      canvas.height = Math.round(baseHeight * scale)

      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.scale(flipH ? -scale : scale, flipV ? -scale : scale)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      ctx.restore()

      setPreviewUrl(canvas.toDataURL('image/png'))
    }
    img.src = sourceUrl
  }

  useEffect(() => {
    renderTransform()
  }, [sourceUrl, rotation, flipH, flipV, scale])

  return (
    <ToolPage title="图片旋转与缩放" description="顺逆时针任意旋转、水平与垂直镜像翻转、按比例自由缩放图片">
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
              <RotateCw className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">选择本地图片进行翻转与缩放</span>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Toolbar */}
            <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                  className="btn-secondary btn-sm flex items-center gap-1.5"
                  title="逆时针旋转 90 度"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>左转 90°</span>
                </button>
                <button
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="btn-secondary btn-sm flex items-center gap-1.5"
                  title="顺时针旋转 90 度"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>右转 90°</span>
                </button>
                <button
                  onClick={() => setFlipH(h => !h)}
                  className={`btn-sm ${flipH ? 'btn-primary' : 'btn-secondary'} flex items-center gap-1.5`}
                  title="水平镜像翻转"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span>水平镜像</span>
                </button>
                <button
                  onClick={() => setFlipV(v => !v)}
                  className={`btn-sm ${flipV ? 'btn-primary' : 'btn-secondary'} flex items-center gap-1.5`}
                  title="垂直镜像翻转"
                >
                  <FlipVertical className="w-4 h-4" />
                  <span>垂直镜像</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">缩放比: {Math.round(scale * 100)}%</span>
                <input
                  type="range"
                  min="0.2"
                  max="2"
                  step="0.05"
                  value={scale}
                  onChange={e => setScale(Number(e.target.value))}
                  className="w-28 accent-brand-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
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
                <a
                  href={previewUrl}
                  download="transformed_image.png"
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>下载处理后图片</span>
                </a>
              </div>
            </div>

            {/* Preview Area */}
            <div className="card p-6 flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900/50">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Transformed Preview"
                  className="max-h-[500px] max-w-full rounded-lg shadow-sm border"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

