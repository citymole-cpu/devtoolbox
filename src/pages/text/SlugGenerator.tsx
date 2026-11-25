import { useState, useMemo} from 'react'
import { ToolPage} from '../../components/ToolPage'
import { CopyButton} from '../../components/CopyButton'
import { charToPinyin} from '../../lib/pinyin'

function slugify(
text: string,
separator: '-' | '_',
lowercase: boolean,
maxLength: number
): string {
const parts: string[] = []
for (const ch of text) {
if (/[a-zA-Z0-9]/.test(ch)) {
parts.push(ch)
} else if (charToPinyin(ch)) {
parts.push(separator, charToPinyin(ch) as string)
} else if (/\s/.test(ch) || /[-_.,;:!?()（）《》、，。！？·/\\|'"“”‘’]/.test(ch)) {
parts.push(separator)
}
// 其他未收录字符直接丢弃
}
let slug = parts.join('')
if (lowercase) slug = slug.toLowerCase()
const sepRe = new RegExp(`\\${separator}+`, 'g')
slug = slug.replace(sepRe, separator).replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), '')
if (maxLength > 0 && slug.length > maxLength) {
slug = slug.slice(0, maxLength)
const lastSep = slug.lastIndexOf(separator)
if (lastSep > maxLength * 0.5) slug = slug.slice(0, lastSep)
slug = slug.replace(new RegExp(`\\${separator}$`), '')
}
return slug
}

export default function SlugGenerator() {
const [input, setInput] = useState('开发者在线工具箱：免费实用的 128 个工具！')
const [separator, setSeparator] = useState<'-' | '_'>('-')
const [lowercase, setLowercase] = useState(true)
const [maxLength, setMaxLength] = useState(60)

const slugs = useMemo(() => {
return input
.split('\n')
.map(line => line.trim())
.filter(line => line.length > 0)
.map(line => slugify(line, separator, lowercase, maxLength))
}, [input, separator, lowercase, maxLength])

const output = slugs.join('\n')
const firstSlug = slugs[0] || ''

return (
<ToolPage title="Slug 生成器" description="标题转 URL 友好短链接（slug）：中文自动转拼音，去除特殊字符">
<div className="flex flex-col gap-6">
{/* 输入 */}
<div>
<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
输入标题（每行一个，支持中英文混合）
</label>
<textarea
value={input}
onChange={e => setInput(e.target.value)}
spellCheck={false}
placeholder="例如：开发者在线工具箱：免费实用的 128 个工具！"
className="w-full h-28 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
/>
</div>

{/* 选项 */}
<div className="card p-6">
<h2 className="text-base font-semibold mb-4">生成选项</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
<div>
<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
分隔符
</label>
<div className="flex gap-2">
<button
onClick={() => setSeparator('-')}
className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
separator === '-'
? 'bg-blue-600 text-white'
: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}`}
>
连字符 -
</button>
<button
onClick={() => setSeparator('_')}
className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
separator === '_'
? 'bg-blue-600 text-white'
: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}`}
>
下划线 _
</button>
</div>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
最大长度
</label>
<div className="flex items-center gap-2">
<input
type="range"
min="0"
max="100"
value={maxLength}
onChange={e => setMaxLength(Number(e.target.value))}
className="flex-1 accent-brand-600 cursor-pointer"
/>
<span className="text-sm text-gray-600 dark:text-gray-300 w-14 text-right">
{maxLength === 0? '不限': `${maxLength} 字符`}
</span>
</div>
</div>
<div className="flex items-end">
<label className="flex items-center gap-2.5 text-sm cursor-pointer select-none pb-2">
<input
type="checkbox"
checked={lowercase}
onChange={e => setLowercase(e.target.checked)}
className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
/>
<span>全部小写（推荐）</span>
</label>
</div>
</div>
<p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
中文按拼音转换（使用站内汉字转拼音的常用字映射）；未收录的生僻字会被略过。空格与标点转为分隔符，多余分隔符合并为一个。
</p>
</div>

{/* 输出 */}
{output && (
<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
<div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
<span className="text-sm font-medium text-gray-700 dark:text-gray-300">生成的 Slug</span>
<CopyButton text={output} label="复制全部" />
</div>
<div className="bg-white dark:bg-gray-800">
{slugs.map((s, i) => (
<div
key={i}
className="flex items-center justify-between gap-3 px-4 py-3 border-b last:border-b-0 border-gray-100 dark:border-gray-700/50"
>
<code className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
{s || '（无法生成：不含可转换字符）'}
</code>
<CopyButton text={s} />
</div>
))}
</div>
</div>
)}

{/* 预览 */}
{firstSlug && (
<div className="card p-6">
<h2 className="text-base font-semibold mb-2">URL 预览</h2>
<p className="text-sm font-mono text-gray-600 dark:text-gray-300 break-all">
https://example.com/blog/{firstSlug}
</p>
<p className="text-xs text-gray-400 mt-2">
提示：slug 建议使用连字符 - 分隔、全部小写，搜索引擎对连字符分隔的词识别更好。
</p>
</div>
)}
</div>
</ToolPage>
)
}
