import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'props2json' | 'json2props';

const sampleProperties = `app.name=DevToolBox
app.version=1.0.0
server.host=localhost
server.port=8080
database.url=jdbc:mysql://localhost:3306/db
database.username=root
database.pool.maxSize=20
database.pool.minIdle=5`;

const sampleJson = `{
  "app": {
    "name": "DevToolBox",
    "version": "1.0.0"
  },
  "server": {
    "host": "localhost",
    "port": "8080"
  },
  "database": {
    "url": "jdbc:mysql://localhost:3306/db",
    "username": "root",
    "pool": {
      "maxSize": "20",
      "minIdle": "5"
    }
  }
}`;

function propertiesToJson(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) {
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.substring(0, eqIndex).trim();
    const value = line.substring(eqIndex + 1).trim();

    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }

  return result;
}

function jsonToProperties(obj: any, prefix = ''): string {
  const lines: string[] = [];

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      lines.push(jsonToProperties(value, fullKey));
    } else {
      lines.push(`${fullKey}=${String(value)}`);
    }
  }

  return lines.filter(Boolean).join('\n');
}

export default function PropertiesJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('props2json');

  const convert = useCallback((text: string, dir: Direction) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      if (dir === 'props2json') {
        const obj = propertiesToJson(text);
        setOutput(JSON.stringify(obj, null, 2));
      } else {
        const obj = JSON.parse(text);
        setOutput(jsonToProperties(obj));
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
    const newDir = direction === 'props2json' ? 'json2props' : 'props2json';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'props2json') {
      setInput(sampleProperties);
    } else {
      setInput(sampleJson);
    }
  }, [direction]);

  return (
    <ToolPage title="Properties ↔ JSON 转换" description="在 Java Properties 和 JSON 格式之间相互转换，支持点号分隔的嵌套属性">
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setDirection('props2json')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'props2json'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Properties → JSON
          </button>
          <button
            onClick={() => setDirection('json2props')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'json2props'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            JSON → Properties
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
        inputLabel={direction === 'props2json' ? 'Properties' : 'JSON'}
        outputLabel={direction === 'props2json' ? 'JSON' : 'Properties'}
        inputPlaceholder={
          direction === 'props2json'
            ? '请输入 Properties，例如 key=value...'
            : '请输入 JSON...'
        }
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
