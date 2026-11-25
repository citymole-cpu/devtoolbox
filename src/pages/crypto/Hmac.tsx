import { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { ToolPage } from '../../components/ToolPage';
import { CopyButton } from '../../components/CopyButton';

type Algorithm = 'HMAC-MD5' | 'HMAC-SHA1' | 'HMAC-SHA256' | 'HMAC-SHA512';

const algorithms: Algorithm[] = ['HMAC-MD5', 'HMAC-SHA1', 'HMAC-SHA256', 'HMAC-SHA512'];

export default function Hmac() {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('HMAC-SHA256');
  const [resultLower, setResultLower] = useState('');
  const [resultUpper, setResultUpper] = useState('');

  const calculate = useCallback((msg: string, k: string, algo: Algorithm) => {
    if (!msg || !k) {
      setResultLower('');
      setResultUpper('');
      return;
    }
    try {
      let hash: CryptoJS.lib.WordArray;
      switch (algo) {
        case 'HMAC-MD5':
          hash = CryptoJS.HmacMD5(msg, k);
          break;
        case 'HMAC-SHA1':
          hash = CryptoJS.HmacSHA1(msg, k);
          break;
        case 'HMAC-SHA256':
          hash = CryptoJS.HmacSHA256(msg, k);
          break;
        case 'HMAC-SHA512':
          hash = CryptoJS.HmacSHA512(msg, k);
          break;
      }
      const hex = hash.toString(CryptoJS.enc.Hex);
      setResultLower(hex);
      setResultUpper(hex.toUpperCase());
    } catch {
      setResultLower('计算错误');
      setResultUpper('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => calculate(message, key, algorithm), 100);
    return () => clearTimeout(timer);
  }, [message, key, algorithm, calculate]);

  const loadSample = () => {
    setMessage('Hello, DevToolBox!');
    setKey('my-secret-key');
  };

  return (
    <ToolPage title="HMAC 计算" description="使用密钥计算消息的 HMAC 值，支持多种哈希算法">
      <div className="space-y-6">
        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">消息内容</label>
            <button
              onClick={loadSample}
              className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              示例数据
            </button>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="请输入消息内容..."
            className="w-full h-28 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
          />
        </div>

        {/* Key & Options */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-400 mb-1">密钥 (Key)</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="请输入密钥..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
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
        </div>

        {/* Results */}
        {message && key && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">计算结果</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                <span className="text-xs text-gray-400 w-16 shrink-0">小写</span>
                <code className="flex-1 text-sm text-green-400 font-mono break-all select-all">
                  {resultLower}
                </code>
                <CopyButton text={resultLower} />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                <span className="text-xs text-gray-400 w-16 shrink-0">大写</span>
                <code className="flex-1 text-sm text-green-400 font-mono break-all select-all">
                  {resultUpper}
                </code>
                <CopyButton text={resultUpper} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
