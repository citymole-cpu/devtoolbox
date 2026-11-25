import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { DualEditor } from '../../components/DualEditor';

type Direction = 'encode' | 'decode';
type EncodeMode = 'component' | 'full';

const sampleUrl = 'https://example.com/search?q=你好世界&lang=中文';

export default function UrlEncode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('component');

  const convert = useCallback(
    (text: string, dir: Direction, mode: EncodeMode) => {
      if (!text.trim()) {
        setOutput('');
        setError('');
        return;
      }
      try {
        if (dir === 'encode') {
          if (mode === 'component') {
            setOutput(encodeURIComponent(text));
          } else {
            setOutput(encodeURI(text));
          }
        } else {
          if (mode === 'component') {
            setOutput(decodeURIComponent(text.trim()));
          } else {
            setOutput(decodeURI(text.trim()));
          }
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
    const timer = setTimeout(() => convert(input, direction, encodeMode), 300);
    return () => clearTimeout(timer);
  }, [input, direction, encodeMode, convert]);

  const handleSwap = useCallback(() => {
    const newDir = direction === 'encode' ? 'decode' : 'encode';
    setDirection(newDir);
    setInput(output);
  }, [direction, output]);

  const loadSample = useCallback(() => {
    if (direction === 'encode') {
      setInput(sampleUrl);
    } else {
      setInput(encodeMode === 'component' ? encodeURIComponent(sampleUrl) : encodeURI(sampleUrl));
    }
  }, [direction, encodeMode]);

  return (
    <ToolPage title="URL 编码 / 解码" description="URL 编码与解码，支持完整 URL 和组件编码模式">
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

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">编码模式:</label>
          <select
            value={encodeMode}
            onChange={(e) => setEncodeMode(e.target.value as EncodeMode)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="component">组件编码 (encodeURIComponent)</option>
            <option value="full">完整 URL (encodeURI)</option>
          </select>
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
        inputLabel={direction === 'encode' ? '原始文本' : '已编码 URL'}
        outputLabel={direction === 'encode' ? '已编码 URL' : '原始文本'}
        inputPlaceholder={
          direction === 'encode'
            ? '请输入要编码的 URL 或文本...'
            : '请输入已编码的 URL...'
        }
        error={error}
        swappable={true}
        onSwap={handleSwap}
      />
    </ToolPage>
  );
}
