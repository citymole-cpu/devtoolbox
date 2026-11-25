import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'encode' | 'decode';

const sampleText = '<div class="hello">&copy; 2024 你好世界</div>';

const namedEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function htmlEncode(text: string, encodeNonAscii: boolean): string {
  return Array.from(text)
    .map((char) => {
      if (namedEntities[char]) {
        return namedEntities[char];
      }
      const code = char.codePointAt(0)!;
      if (encodeNonAscii && code > 127) {
        return `&#${code};`;
      }
      return char;
    })
    .join('');
}

function htmlDecode(text: string): string {
  // Use a textarea trick for robust decoding
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export default function HtmlEntities() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');
  const [encodeNonAscii, setEncodeNonAscii] = useState(false);

  const convert = useCallback(
    (text: string, dir: Direction, nonAscii: boolean) => {
      if (!text) {
        setOutput('');
        setError('');
        return;
      }
      try {
        if (dir === 'encode') {
          setOutput(htmlEncode(text, nonAscii));
        } else {
          setOutput(htmlDecode(text));
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
    const timer = setTimeout(() => convert(input, direction, encodeNonAscii), 300);
    return () => clearTimeout(timer);
  }, [input, direction, encodeNonAscii, convert]);

  const handleSwap = useCallback(() => {
    const newDir = direction === 'encode' ? 'decode' : 'encode';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'encode') {
      setInput(sampleText);
    } else {
      setInput(htmlEncode(sampleText, encodeNonAscii));
    }
  }, [direction, encodeNonAscii]);

  return (
    <ToolPage title="HTML 实体编码 / 解码" description="HTML 特殊字符与实体编码之间的相互转换">
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

        {direction === 'encode' && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={encodeNonAscii}
              onChange={(e) => setEncodeNonAscii(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            编码所有非 ASCII 字符
          </label>
        )}

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
        inputLabel={direction === 'encode' ? '原始 HTML' : 'HTML 实体'}
        outputLabel={direction === 'encode' ? 'HTML 实体' : '原始 HTML'}
        inputPlaceholder={
          direction === 'encode'
            ? '请输入包含特殊字符的 HTML...'
            : '请输入 HTML 实体编码文本...'
        }
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
