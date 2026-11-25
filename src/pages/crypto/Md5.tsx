import { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { ToolPage } from '../../components/ToolPage';
import { CopyButton } from '../../components/CopyButton';

export default function Md5() {
  const [input, setInput] = useState('');
  const [hash32Lower, setHash32Lower] = useState('');
  const [hash32Upper, setHash32Upper] = useState('');
  const [hash16Lower, setHash16Lower] = useState('');
  const [hash16Upper, setHash16Upper] = useState('');

  const calculate = useCallback((text: string) => {
    if (!text) {
      setHash32Lower('');
      setHash32Upper('');
      setHash16Lower('');
      setHash16Upper('');
      return;
    }
    try {
      const md5 = CryptoJS.MD5(text).toString();
      const lower32 = md5;
      const upper32 = md5.toUpperCase();
      const lower16 = md5.substring(8, 24);
      const upper16 = lower16.toUpperCase();
      setHash32Lower(lower32);
      setHash32Upper(upper32);
      setHash16Lower(lower16);
      setHash16Upper(upper16);
    } catch {
      setHash32Lower('计算错误');
      setHash32Upper('');
      setHash16Lower('');
      setHash16Upper('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => calculate(input), 100);
    return () => clearTimeout(timer);
  }, [input, calculate]);

  const sampleData = 'Hello, DevToolBox!';

  return (
    <ToolPage title="MD5 哈希" description="计算文本的 MD5 哈希值，支持 32 位和 16 位输出">
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
            placeholder="请输入要计算 MD5 的文本..."
            className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
          />
        </div>

        {/* Results */}
        {input && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">计算结果</h3>
            <div className="grid gap-3">
              {[
                { label: '32 位小写', value: hash32Lower },
                { label: '32 位大写', value: hash32Upper },
                { label: '16 位小写', value: hash16Lower },
                { label: '16 位大写', value: hash16Upper },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg"
                >
                  <span className="text-xs text-gray-400 w-20 shrink-0">{item.label}</span>
                  <code className="flex-1 text-sm text-green-400 font-mono break-all select-all">
                    {item.value}
                  </code>
                  <CopyButton text={item.value} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
