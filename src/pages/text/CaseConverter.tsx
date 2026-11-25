import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

export default function CaseConverter() {
  const [input, setInput] = useState('hello_world_variable')

  // Split text into words based on spaces, underscores, hyphens, and camelCase boundaries
  const words = input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const lower = input.toLowerCase()
  const upper = input.toUpperCase()

  const camelCase = words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('')

  const pascalCase = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')

  const snakeCase = words.map(w => w.toLowerCase()).join('_')
  const screamingSnakeCase = words.map(w => w.toUpperCase()).join('_')
  const kebabCase = words.map(w => w.toLowerCase()).join('-')
  const titleCase = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  const cases = [
    { label: '小驼峰 (camelCase)', val: camelCase, desc: 'JavaScript / Java 变量与方法' },
    { label: '大驼峰 (PascalCase)', val: pascalCase, desc: '类名 / TypeScript 类型 / 组件' },
    { label: '下划线 (snake_case)', val: snakeCase, desc: 'Python 变量 / 数据库字段' },
    { label: '常量大写 (UPPER_CASE)', val: screamingSnakeCase, desc: '全局常量 / 枚举值' },
    { label: '中划线 (kebab-case)', val: kebabCase, desc: 'URL 路径 / CSS 类名' },
    { label: '全小写 (lowercase)', val: lower, desc: '普通纯小写文本' },
    { label: '全大写 (UPPERCASE)', val: upper, desc: '普通纯大写文本' },
    { label: '词首大写 (Title Case)', val: titleCase, desc: '英文标题与文档' },
  ]

  return (
    <ToolPage title="命名风格转换" description="驼峰式 (camelCase)、下划线 (snake_case)、中划线、帕斯卡等命名规范一键互转">
      <div className="card p-6 flex flex-col gap-6">
        <div>
          <label className="label">输入原始文本或变量名</label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="例如: user_account_balance 或 getUserInfo"
            className="input-field text-lg font-mono font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map(item => (
            <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-500">{item.label}</span>
                  <CopyButton text={item.val} />
                </div>
                <div className="font-mono font-bold text-base text-brand-600 dark:text-brand-400 break-all select-all">
                  {item.val || '-'}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}

