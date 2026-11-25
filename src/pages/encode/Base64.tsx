import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'encode' | 'decode';

const sampleText = '你好，世界！Hello DevToolBox 🚀';

function utf8ToBase64(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return base64;
}

function base64ToUtf8(base64: string, urlSafe: boolean): string {
  let input = base64;
  if (urlSafe) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = input.length % 4;
    if (pad) {
      input += '='.repeat(4 - pad);
    }
  }
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export default function Base64() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');
  const [urlSafe, setUrlSafe] = useState(false);

  const convert = useCallback(
    (text: string, dir: Direction, safe: boolean) => {
      if (!text.trim()) {
        setOutput('');
        setError('');
        return;
      }
      try {
        if (dir === 'encode') {
          setOutput(utf8ToBase64(text, safe));
        } else {
          setOutput(base64ToUtf8(text.trim(), safe));
        }
        setError('');
      } catch (e: any) {
        setError(e.message || '转换失败');
        setOutput('');
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => convert(input, direction, urlSafe), 300);
    return () => clearTimeout(timer);
  }, [input, direction, urlSafe, convert]);

  const handleSwap = useCallback(() => {
    const newDir = direction === 'encode' ? 'decode' : 'encode';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'encode') {
      setInput(sampleText);
    } else {
      setInput(utf8ToBase64(sampleText, urlSafe));
    }
  }, [direction, urlSafe]);

  return (
    <ToolPage title="Base64 编码 / 解码" description="Base64 编码与解码，支持 UTF-8 和 URL 安全模式">
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setDirection('encode')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'encode'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            编码
          </button>
          <button
            onClick={() => setDirection('decode')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'decode'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            解码
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          URL 安全模式
        </label>

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
        inputLabel={direction === 'encode' ? '原始文本' : 'Base64'}
        outputLabel={direction === 'encode' ? 'Base64' : '原始文本'}
        inputPlaceholder={
          direction === 'encode' ? '请输入要编码的文本...' : '请输入 Base64 字符串...'
        }
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
