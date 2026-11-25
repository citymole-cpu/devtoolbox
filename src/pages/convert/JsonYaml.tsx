import { useState, useCallback, useEffect } from 'react';
import yaml from 'js-yaml';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'json2yaml' | 'yaml2json';

const sampleJson = `{
  "name": "DevToolBox",
  "version": "1.0.0",
  "features": [
    "JSON转换",
    "编码解码",
    "格式化"
  ],
  "config": {
    "theme": "dark",
    "language": "zh-CN"
  }
}`;

const sampleYaml = `name: DevToolBox
version: 1.0.0
features:
  - JSON转换
  - 编码解码
  - 格式化
config:
  theme: dark
  language: zh-CN
`;

export default function JsonYaml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('json2yaml');

  const convert = useCallback((text: string, dir: Direction) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      if (dir === 'json2yaml') {
        const obj = JSON.parse(text);
        setOutput(yaml.dump(obj, { indent: 2 }));
      } else {
        const obj = yaml.load(text);
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
    const newDir = direction === 'json2yaml' ? 'yaml2json' : 'json2yaml';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'json2yaml') {
      setInput(sampleJson);
    } else {
      setInput(sampleYaml);
    }
  }, [direction]);

  return (
    <ToolPage title="JSON ↔ YAML 转换" description="在 JSON 和 YAML 格式之间相互转换">
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setDirection('json2yaml')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'json2yaml'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            JSON → YAML
          </button>
          <button
            onClick={() => setDirection('yaml2json')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'yaml2json'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            YAML → JSON
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
        inputLabel={direction === 'json2yaml' ? 'JSON' : 'YAML'}
        outputLabel={direction === 'json2yaml' ? 'YAML' : 'JSON'}
        inputPlaceholder={direction === 'json2yaml' ? '请输入 JSON...' : '请输入 YAML...'}
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
