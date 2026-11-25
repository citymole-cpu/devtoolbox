import { useState, useRef, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Upload, Download, Wand2 } from 'lucide-react'

export default function ImageFilters() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [filterType, setFilterType] = useState<'gray' | 'bw' | 'invert' | 'sepia'>('gray')
  const [bwThreshold, setBwThreshold] = useState(128)
  const [previewUrl, setPreviewUrl] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      setSourceUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const applyFilter = () => {
    if (!sourceUrl) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (filterType === 'gray') {
          // Standard luminosity
          const gray = 0.299 * r + 0.587 * g + 0.114 * b
          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        } else if (filterType === 'bw') {
          // Black and white binary threshold
          const gray = 0.299 * r + 0.587 * g + 0.114 * b
          const val = gray >= bwThreshold ? 255 : 0
          data[i] = val
          data[i + 1] = val
          data[i + 2] = val
        } else if (filterType === 'invert') {
          data[i] = 255 - r
          data[i + 1] = 255 - g
          data[i + 2] = 255 - b
        } else if (filterType === 'sepia') {
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        }
      }

      ctx.putImageData(imgData, 0, 0)
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.src = sourceUrl
  }

  useEffect(() => {
    applyFilter()
  }, [sourceUrl, filterType, bwThreshold])

  return (
    <ToolPage title="黑白与灰度滤镜制作" description="一键将彩色图片转换为纯黑白图(二值化)、标准灰度图、反相负片或复古色调">
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
              <Wand2 className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">选择本地图片进行黑白/灰度滤镜处理</span>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Filter buttons */}
            <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('gray')}
                  className={`btn btn-sm ${filterType === 'gray' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  标准灰度图
                </button>
                <button
                  onClick={() => setFilterType('bw')}
                  className={`btn btn-sm ${filterType === 'bw' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  纯黑白图 (二值化)
                </button>
                <button
                  onClick={() => setFilterType('invert')}
                  className={`btn btn-sm ${filterType === 'invert' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  反相 (负片)
                </button>
                <button
                  onClick={() => setFilterType('sepia')}
                  className={`btn btn-sm ${filterType === 'sepia' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  复古暖黄 (Sepia)
                </button>
              </div>

              {filterType === 'bw' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">二值黑白阈值: {bwThreshold}</span>
                  <input
                    type="range"
                    min="30"
                    max="220"
                    value={bwThreshold}
                    onChange={e => setBwThreshold(Number(e.target.value))}
                    className="w-28 accent-brand-600 cursor-pointer"
                  />
                </div>
              )}

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
                  download={`filtered_${filterType}.jpg`}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>下载处理后图片</span>
                </a>
              </div>
            </div>

            {/* Preview Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-5 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold self-start">原图</span>
                <img src={sourceUrl} alt="Source" className="max-h-80 max-w-full rounded-lg border object-contain" />
              </div>
              <div className="card p-5 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold self-start">滤镜效果图</span>
                <img src={previewUrl} alt="Filtered" className="max-h-80 max-w-full rounded-lg border object-contain" />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

