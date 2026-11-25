import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

// Parse cURL command
function parseCurl(curl: string) {
  let url = ''
  let method = 'GET'
  const headers: Record<string, string> = {}
  let data: string | null = null

  // Clean lines and multiline backslashes
  const clean = curl.replace(/\\\r?\n/g, ' ').trim()

  // Match method
  const methodMatch = clean.match(/-X\s+([A-Z]+)/i) || clean.match(/--request\s+([A-Z]+)/i)
  if (methodMatch) {
    method = methodMatch[1].toUpperCase()
  }

  // Match URL (quoted or unquoted)
  const urlMatch = clean.match(/curl\s+(?:-[^\s]+\s+)*['"]([^'"]+)['"]/i) || clean.match(/curl\s+([^\s]+)/i)
  if (urlMatch) {
    url = urlMatch[1]
  }

  // Match headers
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi
  let match: RegExpExecArray | null
  while ((match = headerRegex.exec(clean)) !== null) {
    const parts = match[1].split(':')
    if (parts.length >= 2) {
      const k = parts[0].trim()
      const v = parts.slice(1).join(':').trim()
      headers[k] = v
    }
  }

  // Match body data
  const dataMatch =
    clean.match(/(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/i) ||
    clean.match(/(?:-d|--data|--data-raw)\s+([^\s]+)/i)
  if (dataMatch) {
    data = dataMatch[1]
    if (method === 'GET') method = 'POST'
  }

  return { url, method, headers, data }
}

export default function CurlToCode() {
  const [curlInput, setCurlInput] = useState(
    `curl -X POST "https://api.example.com/v1/users" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer my_secret_token" \\\n  -d '{"name": "Alice", "role": "admin"}'`
  )
  const [lang, setLang] = useState<'fetch' | 'axios' | 'python' | 'go'>('fetch')

  const { url, method, headers, data } = parseCurl(curlInput)

  // Generate JavaScript Fetch
  const genFetch = () => {
    const options: any = { method }
    if (Object.keys(headers).length > 0) options.headers = headers
    if (data) {
      try {
        options.body = JSON.parse(data)
      } catch {
        options.body = data
      }
    }
    return `// JavaScript (Fetch API)\nconst response = await fetch("${url || 'https://api.example.com'}", {\n  method: "${method}",\n  headers: ${JSON.stringify(headers, null, 4)},\n  ${data ? `body: JSON.stringify(${data})` : ''}\n});\nconst result = await response.json();\nconsole.log(result);`
  }

  // Generate Python requests
  const genPython = () => {
    let code = `import requests\n\nurl = "${url || 'https://api.example.com'}"\n`
    code += `headers = ${JSON.stringify(headers, null, 4)}\n`
    if (data) {
      code += `payload = ${data}\n\n`
      code += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`
    } else {
      code += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers)\n`
    }
    code += `print(response.status_code)\nprint(response.json())`
    return code
  }

  // Generate Go net/http
  const genGo = () => {
    return `package main\n\nimport (\n\t"bytes"\n\t"fmt"\n\t"io"\n\t"net/http"\n)\n\nfunc main() {\n\tclient := &http.Client{}\n\t${
      data ? `var jsonBody = []byte(\`${data}\`)\n\treq, err := http.NewRequest("${method}", "${url}", bytes.NewBuffer(jsonBody))\n` : `req, err := http.NewRequest("${method}", "${url}", nil)\n`
    }\tif err != nil {\n\t\tpanic(err)\n\t}\n\t${Object.entries(headers).map(([k, v]) => `req.Header.Set("${k}", "${v}")`).join('\n\t')}\n\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`
  }

  // Generate Axios
  const genAxios = () => {
    return `import axios from 'axios';\n\nconst response = await axios({\n  method: '${method.toLowerCase()}',\n  url: '${url || 'https://api.example.com'}',\n  headers: ${JSON.stringify(headers, null, 2)},\n  ${data ? `data: ${data}` : ''}\n});\nconsole.log(response.data);`
  }

  const getCode = () => {
    switch (lang) {
      case 'fetch': return genFetch()
      case 'python': return genPython()
      case 'go': return genGo()
      case 'axios': return genAxios()
    }
  }

  const generatedCode = getCode()

  return (
    <ToolPage title="cURL 转代码" description="将 cURL 命令行请求一键转换为 JavaScript Fetch、Axios、Python requests 与 Go 代码">
      <div className="flex flex-col gap-6">
        {/* Input */}
        <div className="card p-5">
          <label className="label">粘贴 cURL 命令 (从浏览器网络面板或终端中复制)</label>
          <textarea
            value={curlInput}
            onChange={e => setCurlInput(e.target.value)}
            rows={6}
            placeholder="curl -X POST https://api.example.com -H '...' -d '...'"
            className="editor-area text-xs font-mono"
          />
        </div>

        {/* Output */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLang('fetch')}
                className={`btn btn-sm ${lang === 'fetch' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Fetch API
              </button>
              <button
                onClick={() => setLang('axios')}
                className={`btn btn-sm ${lang === 'axios' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Axios
              </button>
              <button
                onClick={() => setLang('python')}
                className={`btn btn-sm ${lang === 'python' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Python (requests)
              </button>
              <button
                onClick={() => setLang('go')}
                className={`btn btn-sm ${lang === 'go' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Go (net/http)
              </button>
            </div>
            <CopyButton text={generatedCode} label="复制代码" />
          </div>

          <textarea
            value={generatedCode}
            readOnly
            rows={14}
            className="editor-area text-xs font-mono whitespace-pre resize-none"
          />
        </div>
      </div>
    </ToolPage>
  )
}

