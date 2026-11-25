import { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { ToolPage } from '../../components/ToolPage';
import { CopyButton } from '../../components/CopyButton';

type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
type OutputFormat = 'hex' | 'base64';

const algorithms: Algorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export default function Sha() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('hex');
  const [hashLower, setHashLower] = useState('');
  const [hashUpper, setHashUpper] = useState('');

  const calculate = useCallback(
    (text: string, algo: Algorithm, fmt: OutputFormat) => {
      if (!text) {
        setHashLower('');
        setHashUpper('');
        return;
      }
      try {
        let wordArray: CryptoJS.lib.WordArray;
        switch (algo) {
          case 'SHA-1':
            wordArray = CryptoJS.SHA1(text);
            break;
          case 'SHA-256':
            wordArray = CryptoJS.SHA256(text);
            break;
          case 'SHA-384':
            wordArray = CryptoJS.SHA384(text);
            break;
          case 'SHA-512':
            wordArray = CryptoJS.SHA512(text);
            break;
        }
        if (fmt === 'base64') {
          const b64 = CryptoJS.enc.Base64.stringify(wordArray);
          setHashLower(b64);
          setHashUpper(b64);
        } else {
          const hex = wordArray.toString(CryptoJS.enc.Hex);
          setHashLower(hex);
          setHashUpper(hex.toUpperCase());
        }
      } catch {
        setHashLower('计算错误');
        setHashUpper('');
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => calculate(input, algorithm, outputFormat), 100);
    return () => clearTimeout(timer);
  }, [input, algorithm, outputFormat, calculate]);

  const sampleData = 'Hello, DevToolBox!';

  return (
    <ToolPage title="SHA 哈希" description="计算文本的 SHA 系列哈希值，支持 SHA-1/256/384/512">
      <div className="space-y-6">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">输入文本</label>
            <button
              onClick={() => setInput(sampleData)}
              className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              示例数据
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入要计算哈希的文本..."
            className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
          />
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">算法</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {algorithms.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">输出格式</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {input && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">计算结果</h3>
            <div className="grid gap-3">
              {outputFormat === 'hex' ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                    <span className="text-xs text-gray-400 w-16 shrink-0">小写</span>
                    <code className="flex-1 text-sm text-green-400 font-mono break-all select-all">
                      {hashLower}
                    </code>
                    <CopyButton text={hashLower} />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                    <span className="text-xs text-gray-400 w-16 shrink-0">大写</span>
                    <code className="flex-1 text-sm text-green-400 font-mono break-all select-all">
                      {hashUpper}
                    </code>
                    <CopyButton text={hashUpper} />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                  <span className="text-xs text-gray-400 w-16 shrink-0">Base64</span>
                  <code className="flex-1 text-sm text-green-400 font-mono break-all select-all">
                    {hashLower}
                  </code>
                  <CopyButton text={hashLower} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
