#!/usr/bin/env node
// 生成 public/sitemap.xml：首页 + toolRegistry 里的全部工具页。
// 用法：npm run sitemap
// 路径从 src/lib/toolRegistry.ts 用正则提取，与 App.tsx 的路由表 1:1 对应。
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = readFileSync(join(root, 'src/lib/toolRegistry.ts'), 'utf8')

const paths = [...registry.matchAll(/path:\s*'([^']+)'/g)].map(m => m[1])
const unique = [...new Set(paths)].sort()

if (unique.length !== 149) {
  console.warn(`警告：提取到 ${unique.length} 个工具路径（预期 149），请检查 toolRegistry.ts`)
}

const BASE = 'https://zapbits.xyz/tools'
const urls = [
  { loc: `${BASE}/`, changefreq: 'weekly', priority: '1.0' },
  ...unique.map(p => ({ loc: `${BASE}${p}`, changefreq: 'monthly', priority: '0.8' })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`已生成 public/sitemap.xml：${urls.length} 条 URL（首页 1 + 工具页 ${unique.length}）`)
