import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

const SAMPLE = '{"name":"DevToolBox","version":"1.0","features":["JSON格式化","编解码","加密哈希"],"config":{"theme":"dark","language":"zh-CN"}}';

interface JsonSchemaNode {
  $schema?: string;
  type: string | string[];
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
  items?: JsonSchemaNode;
  [key: string]: unknown;
}

function inferSchema(value: unknown): JsonSchemaNode {
  if (value === null) {
    return { type: 'null' };
  }

  if (typeof value === 'string') {
    return { type: 'string' };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
  }

  if (Array.isArray(value)) {
    const schema: JsonSchemaNode = { type: 'array' };
    if (value.length > 0) {
      // Use first element to infer items schema
      schema.items = inferSchema(value[0]);
    }
    return schema;
  }

  if (typeof value === 'object') {
    const properties: Record<string, JsonSchemaNode> = {};
    const required: string[] = [];

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      properties[key] = inferSchema(val);
      if (val !== null && val !== undefined) {
        required.push(key);
      }
    }

    const schema: JsonSchemaNode = {
      type: 'object',
      properties,
    };

    if (required.length > 0) {
      schema.required = required;
    }

    return schema;
  }

  return { type: 'string' };
}

function generateJsonSchema(jsonStr: string): string {
  const parsed = JSON.parse(jsonStr);
  const schema = inferSchema(parsed);
  schema.$schema = 'http://json-schema.org/draft-07/schema#';
  return JSON.stringify(schema, null, 2);
}

export default function JsonSchema() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const convert = useCallback((text: string) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(generateJsonSchema(text));
      setError('');
    } catch (e: unknown) {
      setError(`转换错误: ${(e as Error).message}`);
      setOutput('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => convert(input), 300);
    return () => clearTimeout(timer);
  }, [input, convert]);

  return (
    <ToolPage title="JSON → JSON Schema" description="从 JSON 数据生成 JSON Schema (Draft-07)">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setInput(SAMPLE)}
          className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
        >
          示例
        </button>
      </div>

      <DualEditor
        input={input}
        output={output}
        onInputChange={setInput}
        inputLabel="JSON"
        outputLabel="JSON Schema"
        inputPlaceholder="请输入 JSON..."
        error={error}
      />
    </ToolPage>
  );
}
