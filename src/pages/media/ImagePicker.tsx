import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Upload, Pipette } from 'lucide-react'

export default function ImagePicker() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [hoverColor, setHoverColor] = useState('#3B82F6')
  const [hoverRgb, setHoverRgb] = useState('rgb(59, 130, 246)')
  const [savedColors, setSavedColors] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setSourceUrl(src)

      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return

    const pixel = ctx.getImageData(x, y, 1, 1).data
    const r = pixel[0]
    const g = pixel[1]
    const b = pixel[2]

    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
    setHoverColor(hex)
    setHoverRgb(`rgb(${r}, ${g}, ${b})`)
  }

  const handleCanvasClick = () => {
    if (!savedColors.includes(hoverColor)) {
      setSavedColors(prev => [hoverColor, ...prev.slice(0, 15)])
    }
  }

  return (
    <ToolPage title="图片取色器" description="上传图片鼠标任意吸取像素色彩 (HEX / RGB)，点击保存生成调色板">
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
              <Pipette className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">选择本地图片吸取颜色</span>
            <span className="text-xs text-gray-400">鼠标悬停实时吸色，点击可将色彩保存到调色板</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Canvas Viewer */}
            <div className="card p-5 lg:col-span-2 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50">
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onClick={handleCanvasClick}
                className="max-h-[500px] max-w-full rounded-lg shadow-sm border cursor-crosshair object-contain"
              />
              <span className="text-xs text-gray-400 mt-2">在图片上移动鼠标即可吸色，点击添加至调色板</span>
            </div>

            {/* Right: Color Info & Saved Palette */}
            <div className="card p-5 flex flex-col gap-5">
              {/* Current Hover */}
              <div>
                <span className="text-xs font-semibold text-gray-500 mb-2 block">当前指针吸取色彩</span>
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                  <div
                    className="w-16 h-16 rounded-xl border shadow-inner flex-shrink-0"
                    style={{ backgroundColor: hoverColor }}
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base">{hoverColor}</span>
                      <CopyButton text={hoverColor} />
                    </div>
                    <span className="font-mono text-xs text-gray-500 truncate">{hoverRgb}</span>
                  </div>
                </div>
              </div>

              {/* Saved Colors */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-500">已吸取调色板 ({savedColors.length})</span>
                  {savedColors.length > 0 && (
                    <button onClick={() => setSavedColors([])} className="text-xs text-gray-400 hover:text-red-500">
                      清空
                    </button>
                  )}
                </div>
                {savedColors.length === 0 ? (
                  <div className="text-xs text-gray-400 py-6 text-center border rounded-lg border-dashed">
                    点击左侧图片任意像素将颜色保存到此处
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {savedColors.map(color => (
                      <div
                        key={color}
                        onClick={() => { setHoverColor(color) }}
                        className="p-1 rounded-lg border flex flex-col items-center gap-1 cursor-pointer hover:border-brand-500 transition-all group"
                      >
                        <div className="w-full h-8 rounded" style={{ backgroundColor: color }} />
                        <span className="text-[10px] font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <button onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm w-full">
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
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

