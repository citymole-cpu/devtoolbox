import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Clock, RefreshCw, Play, Pause } from 'lucide-react'

export default function Timestamp() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLive, setIsLive] = useState(true)

  // Section 1: Timestamp to Date
  const [inputTs, setInputTs] = useState('')
  const [tsResult, setTsResult] = useState<{
    local: string
    utc: string
    iso: string
  } | null>(null)
  const [tsError, setTsError] = useState('')

  // Section 2: Date to Timestamp
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [day, setDay] = useState(now.getDate())
  const [hour, setHour] = useState(now.getHours())
  const [minute, setMinute] = useState(now.getMinutes())
  const [second, setSecond] = useState(now.getSeconds())

  const [dateResultSec, setDateResultSec] = useState<number>(0)
  const [dateResultMs, setDateResultMs] = useState<number>(0)

  // Live timer
  useEffect(() => {
    if (!isLive) return
    const timer = setInterval(() => setCurrentDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [isLive])

  // Initial ts input set to now
  useEffect(() => {
    setInputTs(Math.floor(Date.now() / 1000).toString())
  }, [])

  // Auto convert timestamp to date
  useEffect(() => {
    if (!inputTs.trim()) {
      setTsResult(null)
      setTsError('')
      return
    }

    try {
      let num = Number(inputTs.trim())
      if (isNaN(num)) {
        setTsError('请输入有效的数字时间戳')
        setTsResult(null)
        return
      }

      // If length is 10 digits -> seconds, if 13 -> ms
      if (inputTs.trim().length <= 11) {
        num *= 1000
      }

      const d = new Date(num)
      if (isNaN(d.getTime())) {
        setTsError('无效的时间戳范围')
        setTsResult(null)
        return
      }

      const pad = (n: number) => n.toString().padStart(2, '0')
      const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

      setTsResult({
        local: localStr,
        utc: d.toUTCString(),
        iso: d.toISOString(),
      })
      setTsError('')
    } catch {
      setTsError('转换失败')
      setTsResult(null)
    }
  }, [inputTs])

  // Auto convert date to timestamp
  useEffect(() => {
    try {
      const d = new Date(year, month - 1, day, hour, minute, second)
      if (!isNaN(d.getTime())) {
        setDateResultSec(Math.floor(d.getTime() / 1000))
        setDateResultMs(d.getTime())
      }
    } catch {
      // Ignore
    }
  }, [year, month, day, hour, minute, second])

  const setDateToNow = () => {
    const n = new Date()
    setYear(n.getFullYear())
    setMonth(n.getMonth() + 1)
    setDay(n.getDate())
    setHour(n.getHours())
    setMinute(n.getMinutes())
    setSecond(n.getSeconds())
  }

  const currentTsSec = Math.floor(currentDate.getTime() / 1000)
  const currentTsMs = currentDate.getTime()

  return (
    <ToolPage title="时间戳转换" description="Unix 时间戳与标准日期时间互相转换，支持秒与毫秒">
      <div className="flex flex-col gap-6">
        {/* Real-time Display */}
        <div className="card p-5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-200 dark:border-blue-900/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-600 rounded-lg text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">当前本地时间与时间戳</div>
                <div className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100">
                  {currentDate.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border text-sm font-mono">
                <span className="text-gray-500 text-xs">秒(10位):</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{currentTsSec}</span>
                <CopyButton text={currentTsSec.toString()} />
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border text-sm font-mono">
                <span className="text-gray-500 text-xs">毫秒(13位):</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{currentTsMs}</span>
                <CopyButton text={currentTsMs.toString()} />
              </div>
              <button
                onClick={() => setIsLive(l => !l)}
                className="btn-icon p-2 border bg-white dark:bg-gray-900"
                title={isLive ? '暂停时钟' : '继续时钟'}
              >
                {isLive ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-green-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Timestamp to Date */}
        <div className="card p-5">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <span>时间戳 ➔ 北京/本地时间</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={inputTs}
                onChange={e => setInputTs(e.target.value)}
                placeholder="输入 10 位(秒) 或 13 位(毫秒) 时间戳..."
                className="input-field font-mono"
              />
            </div>
            <button
              onClick={() => setInputTs(Math.floor(Date.now() / 1000).toString())}
              className="btn-secondary btn-sm whitespace-nowrap"
            >
              当前秒
            </button>
            <button
              onClick={() => setInputTs(Date.now().toString())}
              className="btn-secondary btn-sm whitespace-nowrap"
            >
              当前毫秒
            </button>
          </div>

          {tsError && <div className="error-text text-sm mb-3">{tsError}</div>}

          {tsResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-lg border">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">本地时间 (YYYY-MM-DD HH:mm:ss)</div>
                <div className="flex items-center justify-between font-mono font-medium text-sm">
                  <span>{tsResult.local}</span>
                  <CopyButton text={tsResult.local} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">UTC 标准时间</div>
                <div className="flex items-center justify-between font-mono font-medium text-sm truncate">
                  <span className="truncate mr-2">{tsResult.utc}</span>
                  <CopyButton text={tsResult.utc} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ISO 8601 标准</div>
                <div className="flex items-center justify-between font-mono font-medium text-sm truncate">
                  <span className="truncate mr-2">{tsResult.iso}</span>
                  <CopyButton text={tsResult.iso} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date to Timestamp */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">日期时间 ➔ 时间戳</h2>
            <button onClick={setDateToNow} className="btn-secondary btn-sm flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>填入当前时间</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-4">
            <div>
              <label className="label text-xs">年</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label text-xs">月</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label text-xs">日</label>
              <input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={e => setDay(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label text-xs">时</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={e => setHour(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label text-xs">分</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={e => setMinute(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label text-xs">秒</label>
              <input
                type="number"
                min="0"
                max="59"
                value={second}
                onChange={e => setSecond(Number(e.target.value))}
                className="input-field font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-lg border">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">时间戳 (秒 - 10位)</div>
              <div className="flex items-center justify-between font-mono font-bold text-base text-brand-600 dark:text-brand-400">
                <span>{dateResultSec}</span>
                <CopyButton text={dateResultSec.toString()} />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">时间戳 (毫秒 - 13位)</div>
              <div className="flex items-center justify-between font-mono font-bold text-base text-brand-600 dark:text-brand-400">
                <span>{dateResultMs}</span>
                <CopyButton text={dateResultMs.toString()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

