import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'text2unicode' | 'unicode2text';

const sampleText = '你好，世界！Hello World';

function textToUnicode(text: string, onlyNonAscii: boolean): string {
  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0)!;
      if (onlyNonAscii && code < 128) {
        return char;
      }
      if (code > 0xffff) {
        return `\\u{${code.toString(16).toUpperCase()}}`;
      }
      return `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
    })
    .join('');
}

function unicodeToText(text: string): string {
  // Handle \u{XXXXX} (extended) and \uXXXX formats
  return text.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, ext, basic) => {
    const code = parseInt(ext || basic, 16);
    return String.fromCodePoint(code);
  });
}

export default function Unicode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('text2unicode');
  const [onlyNonAscii, setOnlyNonAscii] = useState(true);

  const convert = useCallback(
    (text: string, dir: Direction, nonAsciiOnly: boolean) => {
      if (!text) {
        setOutput('');
        setError('');
        return;
      }
      try {
        if (dir === 'text2unicode') {
          setOutput(textToUnicode(text, nonAsciiOnly));
        } else {
          setOutput(unicodeToText(text));
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
    const timer = setTimeout(() => convert(input, direction, onlyNonAscii), 300);
    return () => clearTimeout(timer);
  }, [input, direction, onlyNonAscii, convert]);

  const handleSwap = useCallback(() => {
    const newDir = direction === 'text2unicode' ? 'unicode2text' : 'text2unicode';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'text2unicode') {
      setInput(sampleText);
    } else {
      setInput(textToUnicode(sampleText, onlyNonAscii));
    }
  }, [direction, onlyNonAscii]);

  return (
    <ToolPage title="Unicode 编码 / 解码" description="文本与 Unicode 转义序列（\\uXXXX）之间的相互转换">
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setDirection('text2unicode')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'text2unicode'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            文本 → Unicode
          </button>
          <button
            onClick={() => setDirection('unicode2text')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              direction === 'unicode2text'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Unicode → 文本
          </button>
        </div>

        {direction === 'text2unicode' && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyNonAscii}
              onChange={(e) => setOnlyNonAscii(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            仅转换非 ASCII 字符
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
        inputLabel={direction === 'text2unicode' ? '原始文本' : 'Unicode'}
        outputLabel={direction === 'text2unicode' ? 'Unicode' : '原始文本'}
        inputPlaceholder={
          direction === 'text2unicode'
            ? '请输入要转换的文本...'
            : '请输入 Unicode 转义序列，例如 \\u4F60\\u597D...'
        }
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
