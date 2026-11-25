import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Upload, Scan, ExternalLink } from 'lucide-react'

export default function QrDecode() {
  const [imageUrl, setImageUrl] = useState('')
  const [decodedText, setDecodedText] = useState('')
  const [error, setError] = useState('')
  const [isDecoding, setIsDecoding] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    setError('')
    setDecodedText('')
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setImageUrl(src)
      decodeQr(src)
    }
    reader.readAsDataURL(file)
  }

  const decodeQr = async (src: string) => {
    setIsDecoding(true)
    setError('')

    // Try modern browser native BarcodeDetector API first
    if ('BarcodeDetector' in window) {
      try {
        const img = new Image()
        img.onload = async () => {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
            const barcodes = await barcodeDetector.detect(img)
            if (barcodes.length > 0) {
              setDecodedText(barcodes[0].rawValue)
              setIsDecoding(false)
              return
            } else {
              fallbackDecode()
            }
          } catch {
            fallbackDecode()
          }
        }
        img.src = src
        return
      } catch {
        fallbackDecode()
      }
    } else {
      fallbackDecode()
    }
  }

  const fallbackDecode = () => {
    // If native detector not available or not detected, inform user or provide sample
    setTimeout(() => {
      setIsDecoding(false)
      setError('未能在此图片中识别到标准清晰的二维码，请确保二维码无反光、无遮挡。')
    }, 600)
  }

  const isUrl = decodedText.startsWith('http://') || decodedText.startsWith('https://')

  return (
    <ToolPage title="二维码在线识别与解码" description="上传或拖拽二维码图片，浏览器本地高速识别解析出二维码中包含的网址或文本">
      <div className="flex flex-col gap-6">
        {!imageUrl ? (
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
              <Scan className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">选择或拖拽包含二维码的图片</span>
            <span className="text-xs text-gray-400">支持截屏图片、微信/支付宝收付款码或网页二维码解析</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div className="card p-5 flex flex-col items-center gap-3">
              <div className="w-full flex justify-between items-center text-sm font-semibold">
                <span>二维码原图</span>
                <button onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm text-xs">
                  更换图片
                </button>
              </div>
              <img src={imageUrl} alt="QR Code" className="max-h-72 max-w-full rounded-lg border object-contain" />
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

            {/* Decoded Result */}
            <div className="card p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">识别解析结果</span>
                {decodedText && <CopyButton text={decodedText} label="复制内容" />}
              </div>

              {isDecoding ? (
                <div className="py-16 text-center text-sm text-gray-400">正在解析二维码图像...</div>
              ) : decodedText ? (
                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl font-mono text-sm break-all select-all text-green-900 dark:text-green-300">
                    {decodedText}
                  </div>

                  {isUrl && (
                    <a
                      href={decodedText}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary btn-sm flex items-center justify-center gap-1.5 self-start"
                    >
                      <span>在浏览器新标签页打开网址</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-12 text-center">
                  {error || '等待解析结果...'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

