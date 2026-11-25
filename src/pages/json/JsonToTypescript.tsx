import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

const SAMPLE = `{
  "id": 1,
  "name": "DevToolBox",
  "active": true,
  "tags": ["tool", "dev"],
  "config": {
    "theme": "dark",
    "fontSize": 14,
    "plugins": [{ "name": "json", "enabled": true }]
  },
  "metadata": null
}`;

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, s => s.toUpperCase());
}

function generateInterfaces(
  obj: unknown,
  name: string,
  useExport: boolean,
  interfaces: Map<string, string>
): string {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return getType(obj, name, useExport, interfaces);
  }

  const lines: string[] = [];
  const prefix = useExport ? 'export ' : '';
  lines.push(`${prefix}interface ${name} {`);

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const isNullable = value === null;
    const typeName = toPascalCase(key);
    const tsType = getType(value, typeName, useExport, interfaces);
    const optional = isNullable ? '?' : '';
    lines.push(`  ${key}${optional}: ${tsType};`);
  }

  lines.push('}');
  interfaces.set(name, lines.join('\n'));
  return name;
}

function getType(
  value: unknown,
  nameHint: string,
  useExport: boolean,
  interfaces: Map<string, string>
): string {
  if (value === null || value === undefined) return 'unknown';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'number';
  if (typeof value === 'boolean') return 'boolean';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const types = new Set<string>();
    for (const item of value) {
      const itemName = nameHint.endsWith('s')
        ? nameHint.slice(0, -1)
        : nameHint + 'Item';
      types.add(getType(item, toPascalCase(itemName), useExport, interfaces));
    }
    const unionType = Array.from(types).join(' | ');
    if (types.size > 1) return `(${unionType})[]`;
    return `${unionType}[]`;
  }

  if (typeof value === 'object') {
    generateInterfaces(value, nameHint, useExport, interfaces);
    return nameHint;
  }

  return 'unknown';
}

function jsonToTypeScript(jsonStr: string, rootName: string, useExport: boolean): string {
  const parsed = JSON.parse(jsonStr);
  const interfaces = new Map<string, string>();
  generateInterfaces(parsed, rootName, useExport, interfaces);
  return Array.from(interfaces.values()).join('\n\n');
}

export default function JsonToTypescript() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [rootName, setRootName] = useState('Root');
  const [useExport, setUseExport] = useState(true);

  const convert = useCallback((text: string) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(jsonToTypeScript(text, rootName || 'Root', useExport));
      setError('');
    } catch (e: unknown) {
      setError(`转换错误: ${(e as Error).message}`);
      setOutput('');
    }
  }, [rootName, useExport]);

  useEffect(() => {
    const timer = setTimeout(() => convert(input), 300);
    return () => clearTimeout(timer);
  }, [input, convert]);

  return (
    <ToolPage title="JSON → TypeScript" description="将 JSON 转换为 TypeScript 接口定义">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">接口名:</label>
          <input
            type="text"
            value={rootName}
            onChange={e => setRootName(e.target.value)}
            className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500 w-32"
          />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={useExport}
            onChange={e => setUseExport(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          添加 export
        </label>
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors ml-auto"
        >
          示例
        </button>
      </div>

      <DualEditor
        input={input}
        output={output}
        onInputChange={setInput}
        inputLabel="JSON"
        outputLabel="TypeScript"
        inputPlaceholder="请输入 JSON..."
        error={error}
      />
    </ToolPage>
  );
}
