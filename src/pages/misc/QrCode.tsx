import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import QRCode from 'qrcode'
import { Download, QrCode as QrIcon } from 'lucide-react'

export default function QrCode() {
  const [text, setText] = useState('https://github.com')
  const [dataUrl, setDataUrl] = useState('')
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [darkColor, setDarkColor] = useState('#000000')
  const [lightColor, setLightColor] = useState('#ffffff')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl('')
      setError('')
      return
    }

    QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then(url => {
        setDataUrl(url)
        setError('')
      })
      .catch((err: Error) => {
        setError(err.message || '生成二维码失败')
        setDataUrl('')
      })
  }, [text, size, errorLevel, darkColor, lightColor])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <ToolPage title="二维码生成器" description="在线将网址、文本生成高清二维码，支持自定义色彩、尺寸与容错率">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs */}
        <div className="card p-6 lg:col-span-2 flex flex-col gap-5">
          <div>
            <label className="label">内容文本或网址链接</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="请输入想要生成二维码的内容（网址、文本、微信号等）..."
              rows={5}
              className="editor-area resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">尺寸大小 (像素)</label>
              <select
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="select-field w-full"
              >
                <option value={180}>小 (180 x 180)</option>
                <option value={256}>中 (256 x 256)</option>
                <option value={384}>大 (384 x 384)</option>
                <option value={512}>超大 (512 x 512)</option>
              </select>
            </div>

            <div>
              <label className="label text-xs">容错等级</label>
              <select
                value={errorLevel}
                onChange={e => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                className="select-field w-full"
              >
                <option value="L">L - 约 7% 容错</option>
                <option value="M">M - 约 15% 容错 (推荐)</option>
                <option value="Q">Q - 约 25% 容错</option>
                <option value="H">H - 约 30% 容错</option>
              </select>
            </div>

            <div>
              <label className="label text-xs">二维码颜色 (前景)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={e => setDarkColor(e.target.value)}
                  className="w-10 h-9 rounded cursor-pointer border p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={darkColor}
                  onChange={e => setDarkColor(e.target.value)}
                  className="input-field font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs">背景颜色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={lightColor}
                  onChange={e => setLightColor(e.target.value)}
                  className="w-10 h-9 rounded cursor-pointer border p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={lightColor}
                  onChange={e => setLightColor(e.target.value)}
                  className="input-field font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview */}
        <div className="card p-6 flex flex-col items-center justify-between gap-4">
          <div className="w-full text-center">
            <h2 className="text-base font-semibold mb-1">二维码预览</h2>
            <p className="text-xs text-gray-400">实时渲染，可直接扫码识别</p>
          </div>

          <div className="w-full flex items-center justify-center min-h-[260px] p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="QR Code"
                className="max-w-full h-auto rounded shadow-sm border"
                style={{ width: `${Math.min(size, 260)}px` }}
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400 gap-2">
                <QrIcon className="w-12 h-12 stroke-[1.2]" />
                <span className="text-sm">请输入内容生成二维码</span>
              </div>
            )}
          </div>

          {error && <div className="error-text text-xs text-center">{error}</div>}

          <button
            onClick={handleDownload}
            disabled={!dataUrl}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>下载高清图片 (PNG)</span>
          </button>
        </div>
      </div>
    </ToolPage>
  )
}

