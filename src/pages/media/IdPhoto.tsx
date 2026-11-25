import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Upload, Download, Crop } from 'lucide-react'

const ID_SIZES = [
  { name: '一寸 (标准)', mm: '25 × 35 mm', pxW: 295, pxH: 413, desc: '常用证件、毕业证、考试报名、资格证' },
  { name: '二寸 (标准)', mm: '35 × 49 mm', pxW: 413, pxH: 579, desc: '求职简历、通行证、职称考试' },
  { name: '小二寸 (护照/签证)', mm: '35 × 45 mm', pxW: 413, pxH: 531, desc: '多国签证、中国普通护照标准照片' },
  { name: '大一寸', mm: '33 × 48 mm', pxW: 390, pxH: 567, desc: '中国驾驶证、部分国家考试准考证' },
  { name: '小一寸', mm: '22 × 32 mm', pxW: 260, pxH: 378, desc: '驾驶证暂住证用' },
  { name: '五寸照 (冲印标准)', mm: '89 × 127 mm', pxW: 1050, pxH: 1500, desc: '常规照片冲印、证件存档' },
]

export default function IdPhoto() {
  const [selectedSize, setSelectedSize] = useState(ID_SIZES[0])
  const [sourceUrl, setSourceUrl] = useState('')
  const [croppedUrl, setCroppedUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setSourceUrl(src)
      cropToSpec(src, selectedSize)
    }
    reader.readAsDataURL(file)
  }

  const cropToSpec = (src: string, spec: typeof ID_SIZES[0]) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = spec.pxW
      canvas.height = spec.pxH
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Center crop to aspect ratio
      const targetRatio = spec.pxW / spec.pxH
      const imgRatio = img.width / img.height

      let srcW = img.width
      let srcH = img.height
      let srcX = 0
      let srcY = 0

      if (imgRatio > targetRatio) {
        // Image is wider
        srcW = img.height * targetRatio
        srcX = (img.width - srcW) / 2
      } else {
        // Image is taller
        srcH = img.width / targetRatio
        srcY = (img.height - srcH) / 2
      }

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, spec.pxW, spec.pxH)
      setCroppedUrl(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.src = src
  }

  const handleSelectSize = (spec: typeof ID_SIZES[0]) => {
    setSelectedSize(spec)
    if (sourceUrl) cropToSpec(sourceUrl, spec)
  }

  return (
    <ToolPage title="证件照标准尺寸与裁剪" description="常用 1寸、2寸、护照签证标准证件照像素尺寸规范速查与一键裁剪导出">
      <div className="flex flex-col gap-6">
        {/* Specification Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ID_SIZES.map(item => (
            <div
              key={item.name}
              onClick={() => handleSelectSize(item)}
              className={`card p-4 cursor-pointer transition-all ${
                selectedSize.name === item.name
                  ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-brand-950/20'
                  : 'hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.name}</span>
                <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
                  {item.pxW} × {item.pxH} px
                </span>
              </div>
              <div className="text-xs font-mono text-gray-500">{item.mm} (300DPI)</div>
              <div className="text-xs text-gray-400 mt-2">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Upload or Preview */}
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
              <Upload className="w-8 h-8" />
            </div>
            <span className="font-semibold text-base">上传照片进行证件照规格居中裁剪</span>
            <span className="text-xs text-gray-400">自动根据所选规格比例 ({selectedSize.name}) 居中裁剪</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 flex flex-col items-center gap-3">
              <div className="w-full text-sm font-semibold">原图</div>
              <img src={sourceUrl} alt="Source" className="max-h-80 max-w-full rounded-lg border object-contain" />
              <button onClick={() => fileInputRef.current?.click()} className="btn-secondary btn-sm mt-2">
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

            <div className="card p-5 flex flex-col items-center gap-3">
              <div className="w-full flex justify-between items-center text-sm font-semibold">
                <span>裁剪后预览: {selectedSize.name}</span>
                <span className="font-mono text-xs text-brand-600">{selectedSize.pxW} × {selectedSize.pxH} px</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border flex items-center justify-center">
                <img
                  src={croppedUrl}
                  alt="Cropped"
                  className="rounded shadow-sm border object-contain"
                  style={{ width: `${selectedSize.pxW / 2}px`, height: `${selectedSize.pxH / 2}px` }}
                />
              </div>
              <a
                href={croppedUrl}
                download={`id_photo_${selectedSize.pxW}x${selectedSize.pxH}.jpg`}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                <Download className="w-4 h-4" />
                <span>下载标准规格证件照 (JPG)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

