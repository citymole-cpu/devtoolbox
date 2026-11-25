import { useState, useCallback, useEffect } from 'react';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'json2xml' | 'xml2json';

const sampleJson = `{
  "root": {
    "user": {
      "name": "张三",
      "age": 28,
      "email": "zhangsan@example.com"
    },
    "settings": {
      "theme": "dark",
      "language": "zh-CN"
    }
  }
}`;

const sampleXml = `<root>
  <user>
    <name>张三</name>
    <age>28</age>
    <email>zhangsan@example.com</email>
  </user>
  <settings>
    <theme>dark</theme>
    <language>zh-CN</language>
  </settings>
</root>`;

export default function JsonXml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('json2xml');

  const convert = useCallback((text: string, dir: Direction) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      if (dir === 'json2xml') {
        const obj = JSON.parse(text);
        const builder = new XMLBuilder({
          ignoreAttributes: false,
          format: true,
          indentBy: '  ',
        });
        const xml = builder.build(obj);
        setOutput(xml);
      } else {
        const parser = new XMLParser({
          ignoreAttributes: false,
        });
        const obj = parser.parse(text);
        setOutput(JSON.stringify(obj, null, 2));
      }
      setError('');
    } catch (e: any) {
      setError(e.message || '转换失败');
      setOutput('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => convert(input, direction), 300);
    return () => clearTimeout(timer);
  }, [input, direction, convert]);

  const handleSwap = useCallback(() => {
    const newDir = direction === 'json2xml' ? 'xml2json' : 'json2xml';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'json2xml') {
      setInput(sampleJson);
    } else {
      setInput(sampleXml);
    }
  }, [direction]);

  return (
    <ToolPage title="JSON ↔ XML 转换" description="在 JSON 和 XML 格式之间相互转换">
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setDirection('json2xml')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'json2xml'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            JSON → XML
          </button>
          <button
            onClick={() => setDirection('xml2json')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'xml2json'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            XML → JSON
          </button>
        </div>
        <button
          onClick={loadSample}
          className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          加载示例
        </button>
      </div>
      <DualEditor
        input={input}
        output={output}
        onInputChange={setInput}
        inputLabel={direction === 'json2xml' ? 'JSON' : 'XML'}
        outputLabel={direction === 'json2xml' ? 'XML' : 'JSON'}
        inputPlaceholder={direction === 'json2xml' ? '请输入 JSON...' : '请输入 XML...'}
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
