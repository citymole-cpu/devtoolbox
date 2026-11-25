import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'
import { marked } from 'marked'

// Simple robust HTML to Markdown converter
function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    const childrenText = Array.from(el.childNodes).map(processNode).join('')

    switch (tag) {
      case 'h1': return `# ${childrenText.trim()}\n\n`
      case 'h2': return `## ${childrenText.trim()}\n\n`
      case 'h3': return `### ${childrenText.trim()}\n\n`
      case 'h4': return `#### ${childrenText.trim()}\n\n`
      case 'h5': return `##### ${childrenText.trim()}\n\n`
      case 'h6': return `###### ${childrenText.trim()}\n\n`
      case 'p': return `${childrenText.trim()}\n\n`
      case 'strong':
      case 'b': return `**${childrenText}**`
      case 'em':
      case 'i': return `*${childrenText}*`
      case 'code':
        return el.parentElement?.tagName.toLowerCase() === 'pre'
          ? childrenText
          : `\`${childrenText}\``
      case 'pre': return `\`\`\`\n${childrenText.trim()}\n\`\`\`\n\n`
      case 'a': return `[${childrenText}](${el.getAttribute('href') || ''})`
      case 'img': return `![${el.getAttribute('alt') || ''}](${el.getAttribute('src') || ''})`
      case 'ul': return `${childrenText}\n`
      case 'ol': return `${childrenText}\n`
      case 'li': return `- ${childrenText.trim()}\n`
      case 'blockquote': return `> ${childrenText.trim()}\n\n`
      case 'hr': return `---\n\n`
      case 'br': return `\n`
      default: return childrenText
    }
  }

  return processNode(doc.body).trim()
}

export default function HtmlMarkdown() {
  const [direction, setDirection] = useState<'html2md' | 'md2html'>('html2md')
  const [input, setInput] = useState('<h1>Hello World</h1>\n<p>这是一个 <strong>HTML</strong> 转 <em>Markdown</em> 的示例。</p>\n<ul>\n  <li>列表项 1</li>\n  <li>列表项 2</li>\n</ul>')
  const [output, setOutput] = useState('')

  const handleConvert = (text: string, dir: 'html2md' | 'md2html') => {
    setInput(text)
    if (!text.trim()) {
      setOutput('')
      return
    }

    if (dir === 'html2md') {
      setOutput(htmlToMarkdown(text))
    } else {
      // Markdown to HTML using marked
      setOutput(marked.parse(text) as string)
    }
  }

  const handleSwap = () => {
    const nextDir = direction === 'html2md' ? 'md2html' : 'html2md'
    setDirection(nextDir)
    const oldOut = output
    handleConvert(oldOut, nextDir)
  }

  return (
    <ToolPage title="HTML ↔ Markdown" description="HTML 网页源码与 Markdown 语法双向实时转换">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDirection('html2md'); handleConvert(input, 'html2md') }}
            className={`btn btn-sm ${direction === 'html2md' ? 'btn-primary' : 'btn-secondary'}`}
          >
            HTML ➔ Markdown
          </button>
          <button
            onClick={() => { setDirection('md2html'); handleConvert(input, 'md2html') }}
            className={`btn btn-sm ${direction === 'md2html' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Markdown ➔ HTML
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => handleConvert(val, direction)}
          inputLabel={direction === 'html2md' ? 'HTML 源代码' : 'Markdown 文本'}
          outputLabel={direction === 'html2md' ? 'Markdown 输出' : 'HTML 输出'}
          swappable={true}
          onSwap={handleSwap}
        />
      </div>
    </ToolPage>
  )
}

