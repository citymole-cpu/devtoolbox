import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'

// Convert JSON array of objects to SQL INSERT statements
function jsonToSql(jsonStr: string, tableName = 'users'): string {
  const parsed = JSON.parse(jsonStr)
  const items = Array.isArray(parsed) ? parsed : [parsed]
  if (items.length === 0) return ''

  // Collect all unique keys
  const keys = Array.from(new Set(items.flatMap(item => Object.keys(item))))
  const columns = keys.map(k => `\`${k}\``).join(', ')

  const valueRows = items.map(item => {
    const vals = keys.map(k => {
      const val = item[k]
      if (val === null || val === undefined) return 'NULL'
      if (typeof val === 'number') return val
      if (typeof val === 'boolean') return val ? 1 : 0
      // Escape single quotes for SQL
      const escaped = String(val).replace(/'/g, "''")
      return `'${escaped}'`
    })
    return `(${vals.join(', ')})`
  })

  return `INSERT INTO \`${tableName}\` (${columns})\nVALUES\n  ${valueRows.join(',\n  ')};`
}

export default function JsonToSql() {
  const [input, setInput] = useState(`[
  { "id": 1, "username": "alice", "email": "alice@example.com", "age": 25, "is_active": true },
  { "id": 2, "username": "bob", "email": "bob@example.com", "age": 30, "is_active": false },
  { "id": 3, "username": "charlie", "email": "charlie@example.com", "age": 28, "is_active": true }
]`)
  const [tableName, setTableName] = useState('users')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleConvert = (text: string, tbl = tableName) => {
    setInput(text)
    if (!text.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      setOutput(jsonToSql(text, tbl))
      setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'JSON 格式错误，请确保为对象或对象数组')
      setOutput('')
    }
  }

  return (
    <ToolPage title="JSON 转 SQL INSERT" description="将 JSON 数据对象或数组一键解析生成数据库批量 SQL 插入语句">
      <div className="flex flex-col gap-4">
        <div className="card p-4 flex items-center gap-3">
          <label className="text-xs font-semibold whitespace-nowrap">目标数据库表名:</label>
          <input
            type="text"
            value={tableName}
            onChange={e => {
              setTableName(e.target.value)
              handleConvert(input, e.target.value)
            }}
            placeholder="users"
            className="input-field max-w-xs font-mono text-xs"
          />
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => handleConvert(val, tableName)}
          inputLabel="JSON 数据 (单个对象或数组)"
          outputLabel="生成的 SQL INSERT 语句"
          error={error}
        />
      </div>
    </ToolPage>
  )
}

