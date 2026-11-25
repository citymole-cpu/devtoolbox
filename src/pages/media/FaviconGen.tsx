import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Upload, Download, Crop } from 'lucide-react'

const SIZES = [16, 32, 48, 64, 128]

export default function FaviconGen() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [icons, setIcons] = useState<Record<number, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setSourceUrl(src)
      generateIcons(src)
    }
    reader.readAsDataURL(file)
  }

  const generateIcons = (src: string) => {
    const img = new Image()
    img.onload = () => {
      const newIcons: Record<number, string> = {}
      SIZES.forEach(sz => {
        const canvas = document.createElement('canvas')
        canvas.width = sz
        canvas.height = sz
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0, sz, sz)
        newIcons[sz] = canvas.toDataURL('image/png')
      })
      setIcons(newIcons)
    }
    img.src = src
  }

  const downloadIcon = (sz: number) => {
    const url = icons[sz]
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `favicon-${sz}x${sz}.png`
    a.click()
  }

  const htmlCode = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`

  return (
    <ToolPage title="Favicon 网站图标生成器" description="上传图片自动裁切生成 16/32/48/64/128 等全套尺寸的浏览器 Favicon 图标">
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
              <Crop className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">选择本地 Logo 图片生成 Favicon 图标</span>
            <span className="text-xs text-gray-400">支持 PNG, JPG, SVG 等，推荐使用正方形透明底图</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="card p-4 flex justify-between items-center">
              <span className="text-sm font-semibold">全套尺寸图标预览</span>
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {SIZES.map(sz => (
                <div key={sz} className="card p-4 flex flex-col items-center justify-between gap-3 bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">{sz} × {sz} px</span>
                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-xl border flex items-center justify-center p-2 shadow-inner">
                    {icons[sz] && <img src={icons[sz]} alt={`${sz}x${sz}`} style={{ width: sz, height: sz }} />}
                  </div>
                  <button onClick={() => downloadIcon(sz)} className="btn-primary btn-sm text-xs w-full flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>下载图标</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="card p-5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500">HTML 引入代码</span>
                <CopyButton text={htmlCode} />
              </div>
              <textarea
                value={htmlCode}
                readOnly
                rows={3}
                className="editor-area text-xs font-mono resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

