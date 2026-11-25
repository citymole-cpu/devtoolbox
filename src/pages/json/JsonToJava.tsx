import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

const SAMPLE = `{
  "id": 1,
  "name": "DevToolBox",
  "active": true,
  "score": 95.5,
  "tags": ["java", "dev"],
  "address": {
    "city": "Beijing",
    "zipCode": "100000"
  }
}`;

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, s => s.toUpperCase());
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function javaType(
  value: unknown,
  nameHint: string,
  classes: { name: string; code: string }[],
  packageName: string,
  genGetterSetter: boolean,
  genConstructor: boolean
): string {
  if (value === null || value === undefined) return 'Object';
  if (typeof value === 'string') return 'String';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'double';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'List<Object>';
    const itemHint = nameHint.endsWith('s') ? nameHint.slice(0, -1) : nameHint + 'Item';
    const itemType = javaType(value[0], toPascalCase(itemHint), classes, packageName, genGetterSetter, genConstructor);
    // Box primitives for generics
    const boxed = itemType === 'int' ? 'Integer'
      : itemType === 'double' ? 'Double'
      : itemType === 'boolean' ? 'Boolean'
      : itemType;
    return `List<${boxed}>`;
  }

  if (typeof value === 'object') {
    const className = toPascalCase(nameHint);
    generateClass(value as Record<string, unknown>, className, classes, packageName, genGetterSetter, genConstructor);
    return className;
  }

  return 'Object';
}

function generateClass(
  obj: Record<string, unknown>,
  className: string,
  classes: { name: string; code: string }[],
  packageName: string,
  genGetterSetter: boolean,
  genConstructor: boolean
): void {
  const lines: string[] = [];
  const fields: { type: string; name: string }[] = [];

  if (packageName) {
    lines.push(`package ${packageName};`);
    lines.push('');
  }

  // Check if we need List import
  const hasArray = Object.values(obj).some(v => Array.isArray(v));
  if (hasArray) {
    lines.push('import java.util.List;');
    lines.push('');
  }

  lines.push(`public class ${className} {`);
  lines.push('');

  // Fields
  for (const [key, value] of Object.entries(obj)) {
    const fieldName = toCamelCase(key);
    const fieldType = javaType(value, toPascalCase(key), classes, packageName, genGetterSetter, genConstructor);
    fields.push({ type: fieldType, name: fieldName });
    lines.push(`    private ${fieldType} ${fieldName};`);
  }

  // Constructor
  if (genConstructor && fields.length > 0) {
    lines.push('');
    // No-arg constructor
    lines.push(`    public ${className}() {`);
    lines.push('    }');
    lines.push('');
    // All-arg constructor
    const params = fields.map(f => `${f.type} ${f.name}`).join(', ');
    lines.push(`    public ${className}(${params}) {`);
    for (const f of fields) {
      lines.push(`        this.${f.name} = ${f.name};`);
    }
    lines.push('    }');
  }

  // Getters and Setters
  if (genGetterSetter) {
    for (const f of fields) {
      const capName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
      const getterPrefix = f.type === 'boolean' ? 'is' : 'get';
      lines.push('');
      lines.push(`    public ${f.type} ${getterPrefix}${capName}() {`);
      lines.push(`        return ${f.name};`);
      lines.push('    }');
      lines.push('');
      lines.push(`    public void set${capName}(${f.type} ${f.name}) {`);
      lines.push(`        this.${f.name} = ${f.name};`);
      lines.push('    }');
    }
  }

  lines.push('}');
  classes.push({ name: className, code: lines.join('\n') });
}

function jsonToJava(
  jsonStr: string,
  className: string,
  packageName: string,
  genGetterSetter: boolean,
  genConstructor: boolean
): string {
  const parsed = JSON.parse(jsonStr);
  const classes: { name: string; code: string }[] = [];

  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    generateClass(parsed, className, classes, packageName, genGetterSetter, genConstructor);
  } else {
    return '// JSON 顶层必须是对象';
  }

  return classes.reverse().map(c => c.code).join('\n\n// ---\n\n');
}

export default function JsonToJava() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [className, setClassName] = useState('Root');
  const [packageName, setPackageName] = useState('');
  const [genGetterSetter, setGenGetterSetter] = useState(true);
  const [genConstructor, setGenConstructor] = useState(false);

  const convert = useCallback((text: string) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(jsonToJava(text, className || 'Root', packageName, genGetterSetter, genConstructor));
      setError('');
    } catch (e: unknown) {
      setError(`转换错误: ${(e as Error).message}`);
      setOutput('');
    }
  }, [className, packageName, genGetterSetter, genConstructor]);

  useEffect(() => {
    const timer = setTimeout(() => convert(input), 300);
    return () => clearTimeout(timer);
  }, [input, convert]);

  return (
    <ToolPage title="JSON → Java" description="将 JSON 转换为 Java POJO 类">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">类名:</label>
          <input
            type="text"
            value={className}
            onChange={e => setClassName(e.target.value)}
            className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500 w-28"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">包名:</label>
          <input
            type="text"
            value={packageName}
            onChange={e => setPackageName(e.target.value)}
            placeholder="com.example"
            className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500 w-36"
          />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={genGetterSetter}
            onChange={e => setGenGetterSetter(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          Getter/Setter
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={genConstructor}
            onChange={e => setGenConstructor(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          构造函数
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
        outputLabel="Java"
        inputPlaceholder="请输入 JSON..."
        error={error}
      />
    </ToolPage>
  );
}
