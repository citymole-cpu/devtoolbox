import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Download, Type as TypeIcon } from 'lucide-react'

export default function TextToImage() {
  const [text, setText] = useState('人生苦短，我用 Python。\n\n优秀的开发者，善于运用现代化的工具，\n将繁琐留给机器，把思考留给自己。')
  const [author, setAuthor] = useState('DevToolBox 便签')
  const [bgStyle, setBgStyle] = useState('from-blue-600 to-indigo-700')
  const [fontSize, setFontSize] = useState(20)

  const cardRef = useRef<HTMLDivElement>(null)

  const backgrounds = [
    { label: '蓝紫极光', val: 'from-blue-600 to-indigo-700', hexFrom: '#2563EB', hexTo: '#4338CA' },
    { label: '落日晚霞', val: 'from-orange-500 to-pink-600', hexFrom: '#F97316', hexTo: '#DB2777' },
    { label: '暗黑极客', val: 'from-gray-900 to-gray-800', hexFrom: '#111827', hexTo: '#1F2937' },
    { label: '清新薄荷', val: 'from-emerald-500 to-teal-700', hexFrom: '#10B981', hexTo: '#0F766E' },
  ]

  const handleDownload = () => {
    const currentBg = backgrounds.find(b => b.val === bgStyle) || backgrounds[0]
    const canvas = document.createElement('canvas')
    const width = 800
    const padding = 50

    // Measure height
    const lines = text.split('\n')
    const lineHeight = fontSize * 1.6
    const textHeight = lines.length * lineHeight
    const height = Math.max(480, textHeight + padding * 2 + 100)

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, currentBg.hexFrom)
    grad.addColorStop(1, currentBg.hexTo)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Card inside
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 10
    ctx.roundRect(padding, padding, width - padding * 2, height - padding * 2, 20)
    ctx.fill()

    // Text inside
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = '#1F2937'
    ctx.font = `500 ${fontSize}px sans-serif`

    let y = padding + 60
    lines.forEach(line => {
      ctx.fillText(line, padding + 40, y)
      y += lineHeight
    })

    // Footer Author
    ctx.font = `600 14px sans-serif`
    ctx.fillStyle = '#6B7280'
    ctx.fillText(`—— ${author}`, padding + 40, height - padding - 40)

    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'text_card.png'
    a.click()
  }

  return (
    <ToolPage title="在线文字生成图片" description="将文字、便签、格言渲染排版为精美渐变卡片图片，适合发微博与朋友圈">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input & Controls */}
        <div className="card p-5 flex flex-col gap-4">
          <div>
            <label className="label">文字内容 (支持换行多行)</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={8}
              className="editor-area text-sm resize-none"
              placeholder="输入需要生成的文字内容..."
            />
          </div>

          <div>
            <label className="label text-xs">签名 / 来源落款</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="label text-xs">渐变背景主题</label>
            <div className="grid grid-cols-2 gap-2">
              {backgrounds.map(b => (
                <button
                  key={b.val}
                  onClick={() => setBgStyle(b.val)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                    bgStyle === b.val ? 'border-brand-500 ring-2 ring-brand-500/20' : ''
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${b.val}`} />
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2 mt-2">
            <Download className="w-4 h-4" />
            <span>导出并下载高清图片 (PNG)</span>
          </button>
        </div>

        {/* Live Card Preview */}
        <div className="card p-6 flex items-center justify-center bg-gray-100 dark:bg-gray-900/60">
          <div
            ref={cardRef}
            className={`w-full max-w-md p-8 rounded-2xl shadow-xl bg-gradient-to-br ${bgStyle} transition-all`}
          >
            <div className="bg-white/95 dark:bg-gray-900/95 p-6 rounded-xl shadow-lg flex flex-col justify-between min-h-[220px]">
              <div
                className="font-medium text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                {text || '输入文字即可实时预览'}
              </div>
              <div className="text-right text-xs text-gray-400 font-semibold mt-6">
                —— {author}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

