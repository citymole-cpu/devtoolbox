import { useState, useCallback } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

export default function XmlFormat() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const sampleData =
    '<?xml version="1.0"?><catalog><book id="1"><title>XML Guide</title><author>John</author><price>29.99</price></book><book id="2"><title>JSON vs XML</title><author>Jane</author><price>39.99</price></book></catalog>';

  const formatXml = useCallback(
    (xml: string, indent: number): string => {
      let formatted = '';
      let pad = 0;
      const indentStr = ' '.repeat(indent);

      // Normalize: split on tags
      const lines = xml
        .replace(/(>)\s*(<)/g, '$1\n$2')
        .split('\n');

      for (const line of lines) {
        const node = line.trim();
        if (!node) continue;

        // Decrease indent for closing tags
        if (node.match(/^<\/\w/)) {
          pad = Math.max(0, pad - 1);
        }

        formatted += indentStr.repeat(pad) + node + '\n';

        // Increase indent for opening tags (not self-closing, not closing, not processing instructions, not comments)
        if (
          node.match(/^<\w[^>]*[^/]>$/) &&
          !node.match(/^<\?/) &&
          !node.match(/^<!--/) &&
          !node.match(/<\/\w[^>]*>$/)
        ) {
          // Check if this line contains both opening and closing tags (e.g., <title>text</title>)
          const tagName = node.match(/^<(\w+)/)?.[1];
          if (tagName && node.includes(`</${tagName}>`)) {
            // Self-contained, don't increase indent
          } else {
            pad += 1;
          }
        }
      }

      return formatted.trimEnd();
    },
    []
  );

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      // Basic XML validation
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'application/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        setError('XML 格式不正确: ' + parseError.textContent?.substring(0, 100));
        return;
      }
      setOutput(formatXml(input, indentSize));
    } catch (e) {
      setError(`格式化失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }, [input, indentSize, formatXml]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      const minified = input
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .replace(/\n/g, '')
        .trim();
      setOutput(minified);
    } catch (e) {
      setError(`压缩失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }, [input]);

  return (
    <ToolPage title="XML 格式化" description="XML 代码格式化与压缩">
      <div className="space-y-4">
        {/* Options */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleFormat}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            格式化
          </button>
          <button
            onClick={handleMinify}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            压缩
          </button>
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">缩进:</label>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
            </select>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => {
              setInput(sampleData);
              setOutput('');
            }}
            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            示例数据
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={(val) => {
            setInput(val);
            setOutput('');
            setError('');
          }}
          inputLabel="XML 输入"
          outputLabel="处理结果"
          inputPlaceholder="请输入 XML 代码..."
          error={error}
        />
      </div>
    </ToolPage>
  );
}
