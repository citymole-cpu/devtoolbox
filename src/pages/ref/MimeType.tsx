import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Search } from 'lucide-react'

const MIME_LIST = [
  { ext: '.json', mime: 'application/json', desc: 'JSON 数据对象' },
  { ext: '.js / .mjs', mime: 'application/javascript', desc: 'JavaScript 脚本' },
  { ext: '.html / .htm', mime: 'text/html', desc: 'HTML 网页文档' },
  { ext: '.css', mime: 'text/css', desc: 'CSS 样式表' },
  { ext: '.xml', mime: 'application/xml', desc: 'XML 文档' },
  { ext: '.txt', mime: 'text/plain', desc: '纯文本文档' },
  { ext: '.png', mime: 'image/png', desc: 'PNG 无损图像' },
  { ext: '.jpg / .jpeg', mime: 'image/jpeg', desc: 'JPEG 有损图像' },
  { ext: '.gif', mime: 'image/gif', desc: 'GIF 动图' },
  { ext: '.svg', mime: 'image/svg+xml', desc: 'SVG 矢量图形' },
  { ext: '.webp', mime: 'image/webp', desc: 'WebP 现代图像格式' },
  { ext: '.ico', mime: 'image/x-icon', desc: 'Windows 图标' },
  { ext: '.pdf', mime: 'application/pdf', desc: 'PDF 文档' },
  { ext: '.zip', mime: 'application/zip', desc: 'ZIP 压缩包' },
  { ext: '.tar', mime: 'application/x-tar', desc: 'TAR 归档' },
  { ext: '.gz', mime: 'application/gzip', desc: 'GZIP 压缩文件' },
  { ext: '.mp3', mime: 'audio/mpeg', desc: 'MP3 音频' },
  { ext: '.wav', mime: 'audio/wav', desc: 'WAV 无损音频' },
  { ext: '.mp4', mime: 'video/mp4', desc: 'MP4 视频' },
  { ext: '.webm', mime: 'video/webm', desc: 'WebM 视频' },
  { ext: '.woff', mime: 'font/woff', desc: 'Web 开放字体' },
  { ext: '.woff2', mime: 'font/woff2', desc: 'Web 开放字体格式 2' },
  { ext: '.ttf', mime: 'font/ttf', desc: 'TrueType 字体' },
  { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', desc: 'Word 文档' },
  { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', desc: 'Excel 表格' },
  { ext: '.form-data', mime: 'multipart/form-data', desc: '文件上传表单' },
  { ext: '.urlencoded', mime: 'application/x-www-form-urlencoded', desc: '普通键值表单 POST' },
]

export default function MimeType() {
  const [query, setQuery] = useState('')

  const filtered = MIME_LIST.filter(item => {
    const q = query.toLowerCase()
    return (
      !query ||
      item.ext.toLowerCase().includes(q) ||
      item.mime.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    )
  })

  return (
    <ToolPage title="MIME 类型速查" description="常见文件扩展名与 HTTP 请求/响应 Content-Type 对照检索">
      <div className="flex flex-col gap-5">
        <div className="card p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索扩展名、MIME 类型或描述 (例如: json, png, font, video)..."
              className="input-field pl-9"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-3">文件后缀</th>
                  <th className="px-4 py-3">MIME / Content-Type</th>
                  <th className="px-4 py-3">描述说明</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
                {filtered.map(item => (
                  <tr key={item.ext} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-brand-600 dark:text-brand-400">{item.ext}</td>
                    <td className="px-4 py-3 font-semibold">{item.mime}</td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-500">{item.desc}</td>
                    <td className="px-4 py-3 text-right">
                      <CopyButton text={item.mime} label="复制" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

