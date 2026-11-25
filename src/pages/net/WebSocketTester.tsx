import { useState, useRef, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { RadioTower, Send, Trash2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

interface MessageItem {
  id: string
  type: 'send' | 'recv' | 'system'
  content: string
  time: string
}

export default function WebSocketTester() {
  const [url, setUrl] = useState('wss://echo.websocket.org')
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [message, setMessage] = useState('{"type":"ping","message":"Hello WebSocket!"}')
  const [messages, setMessages] = useState<MessageItem[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)

  const addLog = (type: 'send' | 'recv' | 'system', content: string) => {
    const time = new Date().toLocaleTimeString()
    setMessages(prev => [...prev, { id: Math.random().toString(), type, content, time }])
  }

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleConnect = () => {
    if (status === 'connected') {
      wsRef.current?.close()
      return
    }

    try {
      setStatus('connecting')
      addLog('system', `正在尝试连接到 ${url}...`)
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('connected')
        addLog('system', `✅ 成功建立 WebSocket 连接 (${url})`)
      }

      ws.onmessage = e => {
        addLog('recv', e.data)
      }

      ws.onerror = () => {
        addLog('system', `❌ WebSocket 发生错误或网络异常`)
      }

      ws.onclose = e => {
        setStatus('disconnected')
        addLog('system', `⚠️ 连接已断开 (代码: ${e.code}, 原因: ${e.reason || '无'})`)
      }
    } catch (err: unknown) {
      setStatus('disconnected')
      addLog('system', `连接失败: ${err instanceof Error ? err.message : '未知异常'}`)
    }
  }

  const handleSend = () => {
    if (!message.trim() || status !== 'connected') return
    try {
      wsRef.current?.send(message)
      addLog('send', message)
    } catch (err: unknown) {
      addLog('system', `发送失败: ${err instanceof Error ? err.message : '未知'}`)
    }
  }

  return (
    <ToolPage title="WebSocket 在线测试" description="在线模拟客户端连接 ws:// 或 wss:// 长连接，支持消息实时收发与调试">
      <div className="flex flex-col gap-5">
        {/* Connection Bar */}
        <div className="card p-5 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={status === 'connected'}
              placeholder="ws:// 或 wss:// 服务器地址..."
              className="input-field font-mono font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleConnect}
              className={`btn flex-1 md:flex-none ${
                status === 'connected' ? 'bg-red-600 hover:bg-red-700 text-white' : 'btn-primary'
              }`}
            >
              {status === 'connected' ? '断开连接' : status === 'connecting' ? '正在连接...' : '连接服务'}
            </button>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border bg-gray-50 dark:bg-gray-900">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'connected'
                    ? 'bg-green-500 animate-pulse'
                    : status === 'connecting'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-gray-400'
                }`}
              />
              <span>{status === 'connected' ? '已连接' : status === 'connecting' ? '连接中' : '未连接'}</span>
            </div>
          </div>
        </div>

        {/* Message Input & Send */}
        <div className="card p-5 flex flex-col gap-3">
          <label className="label mb-0">发送数据内容 (支持 JSON / 纯文本)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="输入需要发送的数据..."
              className="editor-area text-xs font-mono resize-none flex-1"
            />
            <button
              onClick={handleSend}
              disabled={status !== 'connected' || !message.trim()}
              className="btn-primary flex items-center justify-center gap-1.5 self-end sm:self-auto sm:px-6"
            >
              <Send className="w-4 h-4" />
              <span>发送消息</span>
            </button>
          </div>
        </div>

        {/* Live Message Log Stream */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">通信消息流 (Message History)</span>
              <span className="text-xs text-gray-400">({messages.length} 条)</span>
            </div>
            <button
              onClick={() => setMessages([])}
              className="btn-icon p-1.5 text-xs text-gray-500 hover:text-red-500"
              title="清空记录"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={logContainerRef}
            className="w-full h-80 bg-gray-50 dark:bg-gray-900/60 rounded-xl border p-4 overflow-y-auto font-mono text-xs space-y-2.5"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-24 font-sans">暂无消息，连接后将在此实时显示收发记录</div>
            ) : (
              messages.map(item => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border leading-relaxed break-all ${
                    item.type === 'send'
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300'
                      : item.type === 'recv'
                      ? 'bg-green-50/60 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-900 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-sans opacity-70 mb-1">
                    <span className="font-bold uppercase tracking-wider">
                      {item.type === 'send' ? '⬆ 发送 (OUT)' : item.type === 'recv' ? '⬇ 接收 (IN)' : 'ℹ 系统提示'}
                    </span>
                    <span>{item.time}</span>
                  </div>
                  <div>{item.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

