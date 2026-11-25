import { useState, useRef, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Upload, Download, Stamp } from 'lucide-react'

export default function Watermark() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [watermarkText, setWatermarkText] = useState('仅供个人实名认证使用 · 他用无效')
  const [color, setColor] = useState('#FF0000')
  const [fontSize, setFontSize] = useState(24)
  const [opacity, setOpacity] = useState(0.35)
  const [rotate, setRotate] = useState(-25)
  const [mode, setMode] = useState<'tile' | 'single'>('tile')
  const [previewUrl, setPreviewUrl] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      setSourceUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const renderWatermark = () => {
    if (!sourceUrl) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)

      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillStyle = color
      ctx.globalAlpha = opacity

      if (mode === 'single') {
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotate * Math.PI) / 180)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(watermarkText, 0, 0)
        ctx.restore()
      } else {
        // Tile multi-line watermark
        const stepX = 280
        const stepY = 160
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate((rotate * Math.PI) / 180)
            ctx.textAlign = 'center'
            ctx.fillText(watermarkText, 0, 0)
            ctx.restore()
          }
        }
      }

      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.src = sourceUrl
  }

  useEffect(() => {
    renderWatermark()
  }, [sourceUrl, watermarkText, color, fontSize, opacity, rotate, mode])

  return (
    <ToolPage title="在线图片加水印" description="为证件照、版权图片添加防盗用文字水印或全屏平铺水印，纯前端安全处理">
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
              <Stamp className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">选择需要加水印的图片</span>
            <span className="text-xs text-gray-400">支持证件照、扫描件、发票、设计图防盗图</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="card p-5 flex flex-col gap-4">
              <div>
                <label className="label text-xs">水印文字内容</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={e => setWatermarkText(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="label text-xs">水印样式排版</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('tile')}
                    className={`btn btn-sm flex-1 ${mode === 'tile' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    多行密集平铺 (防盗用)
                  </button>
                  <button
                    onClick={() => setMode('single')}
                    className={`btn btn-sm flex-1 ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    单个居中水印
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">文字颜色</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs font-mono">{color}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>字号: {fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="64"
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>透明度: {Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={e => setOpacity(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>旋转倾斜: {rotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rotate}
                    onChange={e => setRotate(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary btn-sm"
                >
                  更换其他图片
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
                  download="watermarked_image.jpg"
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>下载已加水印图片</span>
                </a>
              </div>
            </div>

            {/* Preview View */}
            <div className="card p-5 lg:col-span-2 flex flex-col items-center justify-center min-h-[360px] bg-gray-50 dark:bg-gray-900/50">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Watermark Preview"
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

