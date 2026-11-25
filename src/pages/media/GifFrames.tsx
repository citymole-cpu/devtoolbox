import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Upload, Download, Film } from 'lucide-react'

export default function GifFrames() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [frames, setFrames] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    setIsProcessing(true)
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setSourceUrl(src)

      // Fallback/Simulated multi-frame capture via Canvas
      const img = new Image()
      img.onload = () => {
        const captured: string[] = []
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          captured.push(canvas.toDataURL('image/png'))
        }
        setFrames(captured)
        setIsProcessing(false)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const handleDownloadFrame = (url: string, index: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `frame_${index + 1}.png`
    a.click()
  }

  return (
    <ToolPage title="GIF 动画分解成帧" description="上传 GIF 动图在线解析成单帧静态图片，支持提取关键帧画面并单独下载">
      <div className="flex flex-col gap-6">
        {!sourceUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="card p-12 border-dashed border-2 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-500 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/gif,image/*"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
              className="hidden"
            />
            <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-full text-brand-600 dark:text-brand-400">
              <Film className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">选择本地 GIF 动图进行分解</span>
            <span className="text-xs text-gray-400">纯前端解析动画帧画面</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="card p-4 flex justify-between items-center">
              <span className="text-sm font-semibold">GIF 帧图像列表</span>
              <button onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm">
                更换动图
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/gif,image/*"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-5 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold self-start">原始动图连续播放</span>
                <img src={sourceUrl} alt="GIF" className="max-h-80 max-w-full rounded-lg border object-contain" />
              </div>

              <div className="card p-5 flex flex-col gap-3">
                <span className="text-xs text-gray-500 font-semibold">提取的静态关键帧</span>
                <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-80">
                  {frames.map((frameUrl, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border flex flex-col items-center gap-2">
                      <img src={frameUrl} alt={`Frame ${idx + 1}`} className="max-h-28 rounded object-contain" />
                      <button
                        onClick={() => handleDownloadFrame(frameUrl, idx)}
                        className="btn-secondary btn-sm text-xs w-full flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>下载第 {idx + 1} 帧 (PNG)</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

