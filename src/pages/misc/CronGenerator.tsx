import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import cronstrue from 'cronstrue'
import { Calendar, HelpCircle, CheckCircle } from 'lucide-react'

export default function CronGenerator() {
  const [cronExp, setCronExp] = useState('0 0 * * *')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  // 5 fields
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('0')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [weekday, setWeekday] = useState('*')

  // Parse expression
  useEffect(() => {
    try {
      const parts = cronExp.trim().split(/\s+/)
      if (parts.length !== 5) {
        setError('Cron 表达式必须包含 5 个字段 (分 时 日 月 周)')
        setDescription('')
        return
      }

      let desc = ''
      try {
        desc = cronstrue.toString(cronExp.trim(), { locale: 'zh_CN' })
      } catch {
        desc = cronstrue.toString(cronExp.trim())
      }

      setDescription(desc)
      setError('')

      setMinute(parts[0])
      setHour(parts[1])
      setDay(parts[2])
      setMonth(parts[3])
      setWeekday(parts[4])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '无效的 Cron 表达式')
      setDescription('')
    }
  }, [cronExp])

  const handleFieldChange = (m: string, h: string, d: string, mo: string, w: string) => {
    setMinute(m)
    setHour(h)
    setDay(d)
    setMonth(mo)
    setWeekday(w)
    setCronExp(`${m} ${h} ${d} ${mo} ${w}`)
  }

  const presets = [
    { label: '每分钟', exp: '* * * * *', desc: '每分钟执行一次' },
    { label: '每小时整点', exp: '0 * * * *', desc: '每小时的第0分执行' },
    { label: '每天零点', exp: '0 0 * * *', desc: '每天 00:00 执行' },
    { label: '每周日零点', exp: '0 0 * * 0', desc: '每周日 00:00 执行' },
    { label: '每月1号零点', exp: '0 0 1 * *', desc: '每月1号 00:00 执行' },
    { label: '工作日早9点', exp: '0 9 * * 1-5', desc: '周一至周五 09:00 执行' },
    { label: '每半小时', exp: '*/30 * * * *', desc: '每30分钟执行一次' },
    { label: '每隔2小时', exp: '0 */2 * * *', desc: '每2小时整点执行' },
  ]

  return (
    <ToolPage title="Cron 表达式" description="Cron 定时任务表达式生成、中文语义解析与常用预设">
      <div className="flex flex-col gap-6">
        {/* Main Expression Input & Meaning */}
        <div className="card p-5">
          <label className="label">Cron 表达式 (标准 5 位格式)</label>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="text"
              value={cronExp}
              onChange={e => setCronExp(e.target.value)}
              placeholder="* * * * *"
              className="input-field font-mono text-lg font-semibold tracking-wider"
            />
            <CopyButton text={cronExp} />
          </div>

          {error && <div className="error-text mb-2">{error}</div>}

          {description && (
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
              <div>
                <span className="font-semibold">执行计划语义：</span>
                <span className="font-medium">{description}</span>
              </div>
            </div>
          )}
        </div>

        {/* Visual Fields Builder */}
        <div className="card p-5">
          <h2 className="text-base font-semibold mb-4">按字段快捷设置</h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="label text-xs">分 (0-59)</label>
              <input
                type="text"
                value={minute}
                onChange={e => handleFieldChange(e.target.value, hour, day, month, weekday)}
                className="input-field font-mono"
              />
              <span className="text-[11px] text-gray-400">如: * , */5 , 0,30</span>
            </div>
            <div>
              <label className="label text-xs">时 (0-23)</label>
              <input
                type="text"
                value={hour}
                onChange={e => handleFieldChange(minute, e.target.value, day, month, weekday)}
                className="input-field font-mono"
              />
              <span className="text-[11px] text-gray-400">如: * , */2 , 0,12</span>
            </div>
            <div>
              <label className="label text-xs">日 (1-31)</label>
              <input
                type="text"
                value={day}
                onChange={e => handleFieldChange(minute, hour, e.target.value, month, weekday)}
                className="input-field font-mono"
              />
              <span className="text-[11px] text-gray-400">如: * , 1 , 1,15</span>
            </div>
            <div>
              <label className="label text-xs">月 (1-12)</label>
              <input
                type="text"
                value={month}
                onChange={e => handleFieldChange(minute, hour, day, e.target.value, weekday)}
                className="input-field font-mono"
              />
              <span className="text-[11px] text-gray-400">如: * , 1-6 , */3</span>
            </div>
            <div>
              <label className="label text-xs">周 (0-6, 0为周日)</label>
              <input
                type="text"
                value={weekday}
                onChange={e => handleFieldChange(minute, hour, day, month, e.target.value)}
                className="input-field font-mono"
              />
              <span className="text-[11px] text-gray-400">如: * , 1-5 , 0,6</span>
            </div>
          </div>
        </div>

        {/* Common Presets */}
        <div className="card p-5">
          <h2 className="text-base font-semibold mb-3">常用 Cron 模板</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map(item => (
              <button
                key={item.exp}
                onClick={() => setCronExp(item.exp)}
                className="p-3 text-left border rounded-lg hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors"
              >
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.label}</div>
                <div className="font-mono text-xs text-brand-600 dark:text-brand-400 mt-1">{item.exp}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Format Explanation */}
        <div className="card p-5">
          <h2 className="text-base font-semibold mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span>通配符与格式说明</span>
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
            <p><code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">*</code>：表示匹配该域的任意值。</p>
            <p><code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">/</code>：表示步长，例如在分钟域中 <code className="font-mono text-xs">*/5</code> 表示每 5 分钟执行一次。</p>
            <p><code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">,</code>：表示列举枚举，例如 <code className="font-mono text-xs">1,2,5</code> 表示在第 1、2、5 点执行。</p>
            <p><code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">-</code>：表示范围区间，例如在周域中 <code className="font-mono text-xs">1-5</code> 表示周一到周五。</p>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

