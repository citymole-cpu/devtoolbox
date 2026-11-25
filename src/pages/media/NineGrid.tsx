import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Upload, Download, Grid } from 'lucide-react'

export default function NineGrid() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [tiles, setTiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setSourceUrl(src)
      generateNineGrid(src)
    }
    reader.readAsDataURL(file)
  }

  const generateNineGrid = (src: string) => {
    const img = new Image()
    img.onload = () => {
      // Crop square
      const size = Math.min(img.width, img.height)
      const startX = (img.width - size) / 2
      const startY = (img.height - size) / 2
      const tileSize = size / 3

      const generatedTiles: string[] = []

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const canvas = document.createElement('canvas')
          canvas.width = tileSize
          canvas.height = tileSize
          const ctx = canvas.getContext('2d')
          if (!ctx) continue

          ctx.drawImage(
            img,
            startX + col * tileSize,
            startY + row * tileSize,
            tileSize,
            tileSize,
            0,
            0,
            tileSize,
            tileSize
          )

          generatedTiles.push(canvas.toDataURL('image/jpeg', 0.95))
        }
      }

      setTiles(generatedTiles)
    }
    img.src = src
  }

  const handleDownloadSingle = (url: string, index: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `nine_grid_${index + 1}.jpg`
    a.click()
  }

  const handleDownloadAll = () => {
    tiles.forEach((url, i) => {
      setTimeout(() => {
        handleDownloadSingle(url, i)
      }, i * 200)
    })
  }

  return (
    <ToolPage title="九宫格切图在线工具" description="一键将正方形/矩形图片均等分割为9张小图，微信朋友圈与微博发图必备">
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
              <Grid className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">上传图片生成九宫格</span>
            <span className="text-xs text-gray-400">自动智能正方形居中裁剪并等分为 9 宫格</span>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="card p-4 flex justify-between items-center">
              <div className="text-sm font-semibold">九宫格预览 (点击单张可单独下载)</div>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm">
                  更换图片
                </button>
                <button onClick={handleDownloadAll} className="btn-primary btn-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span>全部一键下载 (9张)</span>
                </button>
              </div>
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

            <div className="card p-6 flex justify-center bg-gray-50 dark:bg-gray-900/50">
              <div className="grid grid-cols-3 gap-2 w-full max-w-md aspect-square bg-gray-200 dark:bg-gray-800 p-2 rounded-xl">
                {tiles.map((tileUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleDownloadSingle(tileUrl, idx)}
                    className="relative group rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer border hover:border-brand-500 transition-all"
                  >
                    <img src={tileUrl} alt={`Tile ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      第 {idx + 1} 张 (点击下载)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

