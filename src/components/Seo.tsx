import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from './I18nProvider'
import { getToolByPath } from '../lib/toolRegistry'

// SEO：按路由动态设置 title / meta / canonical / JSON-LD。
// 工具页用 toolRegistry 里的名称与描述（中英日三语与站内 i18n 一致）；
// 首页用静态文案（index.html 里另有 WebApplication 结构化数据）。
const SITE_URL = 'https://zapbits.xyz/tools'
const SITE_NAME = 'DevToolBox'

const HOME_TITLE: Record<string, string> = {
  'zh-CN': 'DevToolBox - 免费在线开发者工具箱 | 148个工具',
  'en-US': 'DevToolBox - Free Online Developer Toolbox | 148 Tools',
  'ja-JP': 'DevToolBox - 無料オンライン開発者ツールボックス | 148ツール',
}

const HOME_DESC: Record<string, string> = {
  'zh-CN':
    'DevToolBox - 免费在线开发者工具箱：JSON格式化、编解码、加密哈希、格式转换、文本处理、图片处理等148个实用工具，全部在浏览器本地运行，无需上传，安全免费。',
  'en-US':
    'DevToolBox - free online developer toolbox: 148 handy tools for JSON formatting, encoding, encryption & hashing, format conversion, text and image processing. Everything runs locally in your browser, no uploads.',
  'ja-JP':
    'DevToolBox - 無料オンライン開発者ツールボックス：JSON 整形、エンコード、暗号化・ハッシュ、フォーマット変換、テキスト・画像処理など 148 の便利なツール。すべてブラウザでローカルに動作します。',
}

const HOME_KEYWORDS: Record<string, string> = {
  'zh-CN': '在线开发者工具,DevToolBox,JSON格式化,Base64,时间戳,正则表达式,chmod计算器,.gitignore生成器,HTML转JSX',
  'en-US': 'developer tools,DevToolBox,JSON formatter,Base64,timestamp,regex tester,chmod calculator,gitignore generator,HTML to JSX',
  'ja-JP': '開発者ツール,DevToolBox,JSON整形,Base64,タイムスタンプ,正規表現,chmod計算機,.gitignore生成,HTML JSX変換',
}

const TOOL_SUFFIX: Record<string, string> = {
  'zh-CN': ' | DevToolBox 免费在线工具',
  'en-US': ' | DevToolBox Free Online Tool',
  'ja-JP': ' | DevToolBox 無料オンラインツール',
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOg(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setToolJsonLd(title: string, description: string, url: string) {
  let el = document.getElementById('seo-jsonld') as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = 'seo-jsonld'
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    isPartOf: {
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
  })
}

function removeToolJsonLd() {
  document.getElementById('seo-jsonld')?.remove()
}

export function Seo() {
  const location = useLocation()
  const { language, getToolName, getToolDesc } = useI18n()

  useEffect(() => {
    const tool = getToolByPath(location.pathname)
    const canonical =
      location.pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${location.pathname}`

    let title: string
    let description: string
    let keywords: string
    if (tool) {
      title = `${getToolName(tool)} - ${SITE_NAME}`
      description = `${getToolDesc(tool)}${TOOL_SUFFIX[language] ?? TOOL_SUFFIX['zh-CN']}`
      keywords = [getToolName(tool), ...tool.keywords].join(', ')
      setToolJsonLd(title, description, canonical)
    } else {
      title = HOME_TITLE[language] ?? HOME_TITLE['zh-CN']
      description = HOME_DESC[language] ?? HOME_DESC['zh-CN']
      keywords = HOME_KEYWORDS[language] ?? HOME_KEYWORDS['zh-CN']
      removeToolJsonLd()
    }

    document.title = title
    setMeta('description', description)
    setMeta('keywords', keywords)
    setOg('og:title', title)
    setOg('og:description', description)
    setOg('og:url', canonical)
    setOg('og:type', 'website')
    setCanonical(canonical)

    // 路由切换回到顶部（内容区是独立滚动容器）
    document.querySelector('main')?.scrollTo(0, 0)
  }, [location.pathname, language, getToolName, getToolDesc])

  return null
}
