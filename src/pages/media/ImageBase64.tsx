import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Upload, Download, Image as ImageIcon } from 'lucide-react'

export default function ImageBase64() {
  const [tab, setTab] = useState<'img2base' | 'base2img'>('img2base')
  const [base64Output, setBase64Output] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [base64Input, setBase64Input] = useState('')
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    if (!file) return
    const sizeKB = (file.size / 1024).toFixed(2)
    setFileInfo({
      name: file.name,
      size: `${sizeKB} KB`,
      type: file.type || 'image/png',
    })

    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setBase64Output(result)
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDownloadImage = () => {
    if (!base64Input) return
    const a = document.createElement('a')
    a.href = base64Input.startsWith('data:') ? base64Input : `data:image/png;base64,${base64Input}`
    a.download = 'downloaded_image.png'
    a.click()
  }

  return (
    <ToolPage title="图片 ↔ Base64" description="将本地图片转换为 Base64 字符串 (Data URL)，或将 Base64 还原为图片下载">
      <div className="flex flex-col gap-6">
        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('img2base')}
            className={`btn btn-sm ${tab === 'img2base' ? 'btn-primary' : 'btn-secondary'}`}
          >
            图片 ➔ Base64
          </button>
          <button
            onClick={() => setTab('base2img')}
            className={`btn btn-sm ${tab === 'base2img' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Base64 ➔ 图片预览下载
          </button>
        </div>

        {tab === 'img2base' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div className="card p-6 flex flex-col items-center justify-center border-dashed border-2 hover:border-brand-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleFileUpload(f)
                }}
                className="hidden"
              />

              {imagePreview ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-60 max-w-full rounded-lg shadow-sm border"
                  />
                  {fileInfo && (
                    <div className="text-xs text-gray-500 text-center">
                      {fileInfo.name} · {fileInfo.size} · {fileInfo.type}
                    </div>
                  )}
                  <button onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm">
                    更换图片
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 cursor-pointer py-10"
                >
                  <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-full text-brand-600 dark:text-brand-400">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-semibold">点击或拖拽上传图片</div>
                  <div className="text-xs text-gray-400">支持 PNG, JPG, GIF, SVG, WEBP 等格式</div>
                </div>
              )}
            </div>

            {/* Output Base64 */}
            <div className="card p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Base64 Data URL</span>
                <CopyButton text={base64Output} label="复制 Base64" />
              </div>
              <textarea
                value={base64Output}
                readOnly
                placeholder="上传图片后在此生成 Base64..."
                rows={10}
                className="editor-area resize-none text-xs"
              />
              {base64Output && (
                <div className="flex gap-2">
                  <CopyButton
                    text={`<img src="${base64Output}" alt="image" />`}
                    label="复制 <img> 标签"
                  />
                  <CopyButton
                    text={`background-image: url("${base64Output}");`}
                    label="复制 CSS 代码"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Base64 */}
            <div className="card p-5 flex flex-col gap-3">
              <label className="label">输入 Base64 编码 (可带 data:image/... 前缀)</label>
              <textarea
                value={base64Input}
                onChange={e => setBase64Input(e.target.value.trim())}
                placeholder="粘贴 Base64 字符串，例如 data:image/png;base64,iVBORw0KGgo..."
                rows={12}
                className="editor-area text-xs resize-none"
              />
            </div>

            {/* Preview Image */}
            <div className="card p-6 flex flex-col items-center justify-center gap-4">
              <span className="text-sm font-semibold">图片实时渲染预览</span>
              <div className="w-full flex items-center justify-center min-h-[220px] bg-gray-50 dark:bg-gray-900 rounded-xl border p-4">
                {base64Input ? (
                  <img
                    src={base64Input.startsWith('data:') ? base64Input : `data:image/png;base64,${base64Input}`}
                    alt="Preview"
                    className="max-h-60 max-w-full rounded shadow-sm border"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 gap-2">
                    <ImageIcon className="w-10 h-10 opacity-40" />
                    <span className="text-xs">等待输入有效 Base64 字符串</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadImage}
                disabled={!base64Input}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>下载原图至本地</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

