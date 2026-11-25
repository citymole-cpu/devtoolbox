import { useState, useRef, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Download, Trash2, PenTool } from 'lucide-react'

export default function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [hasContent, setHasContent] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasContent(true)
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasContent(false)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'signature_transparent.png'
    a.click()
  }

  return (
    <ToolPage title="在线手写签名与涂鸦板" description="手写电子签名、自由涂鸦绘图，一键导出透明背景 PNG 免抠图签名">
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold">笔触粗细: {lineWidth}px</span>
            <input
              type="range"
              min="1"
              max="12"
              value={lineWidth}
              onChange={e => setLineWidth(Number(e.target.value))}
              className="w-28 accent-brand-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">签名笔颜色:</span>
            {['#000000', '#1D4ED8', '#DC2626'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${
                  color === c ? 'border-brand-500 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={clearCanvas} className="btn-secondary btn-sm flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              <span>清空重签</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={!hasContent}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>导出透明签名 (PNG)</span>
            </button>
          </div>
        </div>

        {/* Signature Area */}
        <div className="card p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/40 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={360}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full max-w-3xl h-[360px] bg-white dark:bg-gray-950 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 shadow-sm cursor-crosshair touch-none"
          />
          {!hasContent && (
            <div className="absolute pointer-events-none text-gray-400 dark:text-gray-600 font-sans text-lg flex items-center gap-2">
              <PenTool className="w-5 h-5 opacity-40" />
              <span>请在此区域使用鼠标或手指书写签名</span>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}

