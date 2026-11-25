import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Monitor, RefreshCw } from 'lucide-react'

// Simple UA parser logic
function parseUA(ua: string) {
  let browser = '未知浏览器'
  let os = '未知操作系统'
  let engine = '未知内核'
  let device = '桌面电脑 (PC)'

  // Device
  if (/mobile/i.test(ua)) device = '移动设备 (Mobile Phone)'
  else if (/tablet|ipad/i.test(ua)) device = '平板电脑 (Tablet)'

  // OS
  if (/windows nt 10.0/i.test(ua)) os = 'Windows 10 / Windows 11'
  else if (/windows nt 6.3/i.test(ua)) os = 'Windows 8.1'
  else if (/windows nt 6.1/i.test(ua)) os = 'Windows 7'
  else if (/mac os x/i.test(ua)) {
    const match = ua.match(/mac os x ([0-9_]+)/i)
    os = match ? `macOS (${match[1].replace(/_/g, '.')})` : 'macOS'
  } else if (/android/i.test(ua)) {
    const match = ua.match(/android\s+([0-9.]+)/i)
    os = match ? `Android ${match[1]}` : 'Android'
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    const match = ua.match(/os\s+([0-9_]+)/i)
    os = match ? `iOS (${match[1].replace(/_/g, '.')})` : 'iOS'
  } else if (/linux/i.test(ua)) os = 'Linux'

  // Browser & Engine
  if (/edg\/([0-9.]+)/i.test(ua)) {
    const m = ua.match(/edg\/([0-9.]+)/i)
    browser = `Microsoft Edge ${m ? m[1] : ''}`
    engine = 'Blink (Chromium)'
  } else if (/chrome\/([0-9.]+)/i.test(ua)) {
    const m = ua.match(/chrome\/([0-9.]+)/i)
    browser = `Google Chrome ${m ? m[1] : ''}`
    engine = 'Blink (Chromium)'
  } else if (/firefox\/([0-9.]+)/i.test(ua)) {
    const m = ua.match(/firefox\/([0-9.]+)/i)
    browser = `Mozilla Firefox ${m ? m[1] : ''}`
    engine = 'Gecko'
  } else if (/safari\/([0-9.]+)/i.test(ua) && !/chrome/i.test(ua)) {
    const m = ua.match(/version\/([0-9.]+)/i)
    browser = `Apple Safari ${m ? m[1] : ''}`
    engine = 'WebKit'
  } else if (/micromessenger/i.test(ua)) {
    browser = '微信内置浏览器 (WeChat)'
  }

  return { browser, os, engine, device }
}

export default function UserAgent() {
  const [uaInput, setUaInput] = useState('')
  const [parsed, setParsed] = useState({ browser: '', os: '', engine: '', device: '' })

  useEffect(() => {
    const current = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    setUaInput(current)
  }, [])

  useEffect(() => {
    setParsed(parseUA(uaInput))
  }, [uaInput])

  const sampleUAs = [
    { label: 'Chrome (Win11)', val: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' },
    { label: 'Safari (macOS)', val: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15' },
    { label: 'iPhone (iOS)', val: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' },
    { label: 'Android (WeChat)', val: 'Mozilla/5.0 (Linux; Android 14; SM-S9280) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.122 Mobile Safari/537.36 MicroMessenger/8.0.49' },
  ]

  return (
    <ToolPage title="User-Agent 分析器" description="精准解析浏览器 User-Agent 字符串，识别操作系统、内核、浏览器版本与设备类型">
      <div className="flex flex-col gap-6">
        <div className="card p-5">
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">User-Agent 字符串</label>
            <button
              onClick={() => setUaInput(navigator.userAgent)}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>填入当前浏览器 UA</span>
            </button>
          </div>
          <textarea
            value={uaInput}
            onChange={e => setUaInput(e.target.value)}
            rows={4}
            className="editor-area text-xs font-mono resize-none"
            placeholder="输入或粘贴任意 User-Agent 字符串..."
          />

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-gray-500">测试常见设备:</span>
            {sampleUAs.map(item => (
              <button
                key={item.label}
                onClick={() => setUaInput(item.val)}
                className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <div className="text-xs text-gray-500 mb-1">浏览器名称及版本</div>
            <div className="text-base font-bold text-blue-700 dark:text-blue-300 break-words">{parsed.browser}</div>
          </div>
          <div className="card p-4 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="text-xs text-gray-500 mb-1">操作系统平台</div>
            <div className="text-base font-bold text-green-700 dark:text-green-300 break-words">{parsed.os}</div>
          </div>
          <div className="card p-4 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
            <div className="text-xs text-gray-500 mb-1">渲染排版内核</div>
            <div className="text-base font-bold text-purple-700 dark:text-purple-300 break-words">{parsed.engine}</div>
          </div>
          <div className="card p-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <div className="text-xs text-gray-500 mb-1">设备类别</div>
            <div className="text-base font-bold text-amber-700 dark:text-amber-300 break-words">{parsed.device}</div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

