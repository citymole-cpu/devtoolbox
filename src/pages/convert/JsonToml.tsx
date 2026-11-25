import { useState, useCallback, useEffect } from 'react';
import * as TOML from 'smol-toml';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'json2toml' | 'toml2json';

const sampleJson = `{
  "title": "DevToolBox 配置",
  "owner": {
    "name": "张三",
    "organization": "开发团队"
  },
  "database": {
    "server": "192.168.1.1",
    "ports": [8001, 8001, 8002],
    "enabled": true
  },
  "servers": {
    "alpha": {
      "ip": "10.0.0.1",
      "dc": "华东"
    },
    "beta": {
      "ip": "10.0.0.2",
      "dc": "华北"
    }
  }
}`;

const sampleToml = `title = "DevToolBox 配置"

[owner]
name = "张三"
organization = "开发团队"

[database]
server = "192.168.1.1"
ports = [8001, 8001, 8002]
enabled = true

[servers.alpha]
ip = "10.0.0.1"
dc = "华东"

[servers.beta]
ip = "10.0.0.2"
dc = "华北"
`;

export default function JsonToml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('json2toml');

  const convert = useCallback((text: string, dir: Direction) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      if (dir === 'json2toml') {
        const obj = JSON.parse(text);
        setOutput(TOML.stringify(obj));
      } else {
        const obj = TOML.parse(text);
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
    const newDir = direction === 'json2toml' ? 'toml2json' : 'json2toml';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'json2toml') {
      setInput(sampleJson);
    } else {
      setInput(sampleToml);
    }
  }, [direction]);

  return (
    <ToolPage title="JSON ↔ TOML 转换" description="在 JSON 和 TOML 格式之间相互转换">
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setDirection('json2toml')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'json2toml'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            JSON → TOML
          </button>
          <button
            onClick={() => setDirection('toml2json')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'toml2json'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            TOML → JSON
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
        inputLabel={direction === 'json2toml' ? 'JSON' : 'TOML'}
        outputLabel={direction === 'json2toml' ? 'TOML' : 'JSON'}
        inputPlaceholder={direction === 'json2toml' ? '请输入 JSON...' : '请输入 TOML...'}
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
