import { useState, useMemo, useCallback } from 'react';
import { marked } from 'marked';
import { ToolPage } from '../../components/ToolPage';
import { CodeEditor } from '../../components/CodeEditor';

const SAMPLE_MARKDOWN = `# Markdown 预览示例

## 文本格式

这是一段 **粗体** 和 *斜体* 和 ~~删除线~~ 文本。

这是一段 \`行内代码\` 示例。

## 列表

### 无序列表
- 项目一
- 项目二
  - 子项目 A
  - 子项目 B
- 项目三

### 有序列表
1. 第一步
2. 第二步
3. 第三步

## 代码块

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('DevToolBox');
\`\`\`

## 表格

| 工具 | 分类 | 描述 |
|------|------|------|
| JSON 格式化 | 格式化 | 美化 JSON 数据 |
| Base64 编解码 | 编码 | Base64 编码与解码 |
| 文本对比 | 文本 | 比较文本差异 |

## 引用

> 这是一段引用文字。
>
> — DevToolBox

## 链接与图片

[GitHub](https://github.com)

![示例图片](https://via.placeholder.com/150 "占位图")

---

*由 DevToolBox Markdown 编辑器生成*
`;

export default function Markdown() {
  const [input, setInput] = useState('');

  const htmlOutput = useMemo(() => {
    if (!input) return '';
    try {
      return marked(input, { async: false }) as string;
    } catch {
      return '<p class="text-red-400">Markdown 解析错误</p>';
    }
  }, [input]);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_MARKDOWN);
  }, []);

  return (
    <ToolPage title="Markdown 编辑器" description="实时编辑和预览 Markdown 文档">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={loadSample}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
          >
            加载示例
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
          {/* Editor */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium text-gray-300">Markdown 源码</label>
            <div className="flex-1">
              <CodeEditor
                value={input}
                onChange={setInput}
                placeholder="在此输入 Markdown..."
                language="markdown"
                minHeight="460px"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium text-gray-300">预览</label>
            <div
              className="markdown-preview flex-1 bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 overflow-auto prose prose-invert prose-sm max-w-none"
              style={{ minHeight: '460px' }}
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .markdown-preview h1 { font-size: 1.75em; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; border-bottom: 1px solid #374151; padding-bottom: 0.3em; }
        .markdown-preview h2 { font-size: 1.4em; font-weight: 600; margin-top: 0.8em; margin-bottom: 0.4em; border-bottom: 1px solid #1f2937; padding-bottom: 0.2em; }
        .markdown-preview h3 { font-size: 1.15em; font-weight: 600; margin-top: 0.6em; margin-bottom: 0.3em; }
        .markdown-preview p { margin: 0.5em 0; line-height: 1.7; }
        .markdown-preview ul, .markdown-preview ol { padding-left: 1.5em; margin: 0.5em 0; }
        .markdown-preview li { margin: 0.2em 0; }
        .markdown-preview code { background: #1f2937; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; color: #e5e7eb; }
        .markdown-preview pre { background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 1em; overflow-x: auto; margin: 0.75em 0; }
        .markdown-preview pre code { background: none; padding: 0; }
        .markdown-preview blockquote { border-left: 3px solid #3b82f6; padding-left: 1em; margin: 0.75em 0; color: #9ca3af; }
        .markdown-preview table { width: 100%; border-collapse: collapse; margin: 0.75em 0; }
        .markdown-preview th, .markdown-preview td { border: 1px solid #374151; padding: 0.5em 0.75em; text-align: left; }
        .markdown-preview th { background: #1f2937; font-weight: 600; }
        .markdown-preview hr { border: none; border-top: 1px solid #374151; margin: 1em 0; }
        .markdown-preview a { color: #60a5fa; text-decoration: underline; }
        .markdown-preview img { max-width: 100%; border-radius: 8px; }
        .markdown-preview strong { color: #f3f4f6; }
        .markdown-preview del { color: #6b7280; }
      `}</style>
    </ToolPage>
  );
}
