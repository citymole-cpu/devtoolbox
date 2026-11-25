import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Download } from 'lucide-react'

export default function Placeholder() {
  const [width, setWidth] = useState(600)
  const [height, setHeight] = useState(400)
  const [bgColor, setBgColor] = useState('#3B82F6')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [customText, setCustomText] = useState('')
  const [dataUrl, setDataUrl] = useState('')

  const displayText = customText.trim() || `${width} × ${height}`

  const generatePlaceholder = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // Text
    const fontSize = Math.max(16, Math.min(width, height) / 8)
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText, width / 2, height / 2)

    setDataUrl(canvas.toDataURL('image/png'))
  }

  useEffect(() => {
    generatePlaceholder()
  }, [width, height, bgColor, textColor, customText])

  const presets = [
    { label: '正方形缩略图', w: 300, h: 300 },
    { label: 'Banner 横幅', w: 1200, h: 400 },
    { label: '4:3 标清', w: 800, h: 600 },
    { label: '16:9 高清', w: 1280, h: 720 },
    { label: '全高清 1080P', w: 1920, h: 1080 },
  ]

  return (
    <ToolPage title="占位图片生成" description="自定义尺寸、颜色与文字快速生成前端开发与 UI 原型占位图">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">宽度 (px)</label>
              <input
                type="number"
                min="50"
                max="3000"
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label text-xs">高度 (px)</label>
              <input
                type="number"
                min="50"
                max="3000"
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs">自定义文本 (留空则显示宽高尺寸)</label>
            <input
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="例如: LOGO / 商品图..."
              className="input-field text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">背景色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <span className="font-mono text-xs">{bgColor}</span>
              </div>
            </div>
            <div>
              <label className="label text-xs">文字颜色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <span className="font-mono text-xs">{textColor}</span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 mb-1.5 block">常用尺寸预设:</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setWidth(p.w); setHeight(p.h) }}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t flex flex-col gap-2">
            <a
              href={dataUrl}
              download={`placeholder_${width}x${height}.png`}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>下载 PNG 占位图</span>
            </a>
            <CopyButton
              text={`<img src="${dataUrl}" alt="placeholder" width="${width}" height="${height}" />`}
              label="复制 <img> 标签代码"
              className="w-full justify-center"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="card p-6 lg:col-span-2 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 min-h-[360px]">
          {dataUrl && (
            <img
              src={dataUrl}
              alt="Placeholder Preview"
              className="max-h-[460px] max-w-full rounded-lg shadow-sm border object-contain"
            />
          )}
        </div>
      </div>
    </ToolPage>
  )
}

