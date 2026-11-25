import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'

// Helper to capitalize words
function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Convert JSON to C# Classes
function jsonToCSharp(jsonStr: string, rootName = 'RootObject', ns = 'MyNamespace'): string {
  const obj = JSON.parse(jsonStr)
  const classes: Record<string, string> = {}

  function resolveType(val: any, propName: string): string {
    if (val === null || val === undefined) return 'object'
    if (typeof val === 'string') return 'string'
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double'
    if (typeof val === 'boolean') return 'bool'
    if (Array.isArray(val)) {
      if (val.length === 0) return 'List<object>'
      const elemType = resolveType(val[0], propName.replace(/s$/, ''))
      return `List<${elemType}>`
    }
    if (typeof val === 'object') {
      const className = capitalize(propName)
      generateClass(val, className)
      return className
    }
    return 'object'
  }

  function generateClass(target: Record<string, any>, className: string) {
    if (classes[className]) return
    let res = `    public class ${className}\n    {\n`

    Object.entries(target).forEach(([key, val]) => {
      const typeName = resolveType(val, key)
      const propName = capitalize(key)
      res += `        [JsonProperty("${key}")]\n`
      res += `        public ${typeName} ${propName} { get; set; }\n\n`
    })

    res += '    }\n'
    classes[className] = res
  }

  generateClass(obj, rootName)

  let fullCode = `using System;\nusing System.Collections.Generic;\nusing Newtonsoft.Json;\n\nnamespace ${ns}\n{\n`
  Object.values(classes).forEach(cls => {
    fullCode += cls + '\n'
  })
  fullCode += '}\n'

  return fullCode
}

export default function JsonToCSharp() {
  const [input, setInput] = useState('{\n  "id": 1001,\n  "username": "coder_bob",\n  "isActive": true,\n  "profile": {\n    "age": 28,\n    "email": "bob@example.com"\n  },\n  "roles": ["developer", "admin"]\n}')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleConvert = (text: string) => {
    setInput(text)
    if (!text.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      setOutput(jsonToCSharp(text))
      setError('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'JSON 解析失败')
      setOutput('')
    }
  }

  return (
    <ToolPage title="JSON → C# 实体类" description="从 JSON 自动推导并生成 C# (POCO / Newtonsoft.Json) 实体类代码">
      <DualEditor
        input={input}
        output={output}
        onInputChange={handleConvert}
        inputLabel="JSON 输入"
        outputLabel="C# Class 源代码"
        error={error}
      />
    </ToolPage>
  )
}

