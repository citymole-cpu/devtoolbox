import { useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { ToolPage } from '../../components/ToolPage';
import { CopyButton } from '../../components/CopyButton';

type Mode = 'encrypt' | 'decrypt';
type CipherMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR';
type PaddingType = 'Pkcs7' | 'ZeroPadding' | 'NoPadding';
type OutputFormatType = 'Base64' | 'Hex';

const cipherModes: CipherMode[] = ['CBC', 'ECB', 'CFB', 'OFB', 'CTR'];
const paddingTypes: PaddingType[] = ['Pkcs7', 'ZeroPadding', 'NoPadding'];

const getCipherMode = (mode: CipherMode) => {
  const map: Record<CipherMode, typeof CryptoJS.mode.CBC> = {
    CBC: CryptoJS.mode.CBC,
    ECB: CryptoJS.mode.ECB,
    CFB: CryptoJS.mode.CFB,
    OFB: CryptoJS.mode.OFB,
    CTR: CryptoJS.mode.CTR,
  };
  return map[mode];
};

const getPadding = (padding: PaddingType) => {
  const map: Record<PaddingType, typeof CryptoJS.pad.Pkcs7> = {
    Pkcs7: CryptoJS.pad.Pkcs7,
    ZeroPadding: CryptoJS.pad.ZeroPadding,
    NoPadding: CryptoJS.pad.NoPadding,
  };
  return map[padding];
};

export default function Aes() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [input, setInput] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [cipherMode, setCipherMode] = useState<CipherMode>('CBC');
  const [padding, setPadding] = useState<PaddingType>('Pkcs7');
  const [iv, setIv] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormatType>('Base64');
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const process = useCallback(() => {
    if (!input || !secretKey) {
      setResult('');
      setError('');
      return;
    }
    try {
      setError('');
      if (!useAdvanced) {
        // Simple mode
        if (mode === 'encrypt') {
          const encrypted = CryptoJS.AES.encrypt(input, secretKey);
          if (outputFormat === 'Hex') {
            setResult(encrypted.ciphertext.toString(CryptoJS.enc.Hex));
          } else {
            setResult(encrypted.toString());
          }
        } else {
          const bytes = CryptoJS.AES.decrypt(input, secretKey);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          if (!decrypted) {
            setError('解密失败：密钥错误或密文格式不正确');
            setResult('');
            return;
          }
          setResult(decrypted);
        }
      } else {
        // Advanced mode with explicit key/iv
        const keyBytes = CryptoJS.enc.Utf8.parse(secretKey.padEnd(16, '\0').substring(0, 16));
        const ivBytes = iv
          ? CryptoJS.enc.Utf8.parse(iv.padEnd(16, '\0').substring(0, 16))
          : CryptoJS.enc.Utf8.parse('0000000000000000');

        const options: any = {
          mode: getCipherMode(cipherMode),
          padding: getPadding(padding),
          ...(cipherMode !== 'ECB' ? { iv: ivBytes } : {}),
        };

        if (mode === 'encrypt') {
          const encrypted = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(input),
            keyBytes,
            options
          );
          if (outputFormat === 'Hex') {
            setResult(encrypted.ciphertext.toString(CryptoJS.enc.Hex));
          } else {
            setResult(encrypted.toString());
          }
        } else {
          let cipherParams: CryptoJS.lib.CipherParams;
          if (outputFormat === 'Hex') {
            cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Hex.parse(input),
            });
          } else {
            cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Base64.parse(input),
            });
          }
          const decrypted = CryptoJS.AES.decrypt(cipherParams, keyBytes, options);
          const text = decrypted.toString(CryptoJS.enc.Utf8);
          if (!text) {
            setError('解密失败：请检查密钥、IV 和模式设置');
            setResult('');
            return;
          }
          setResult(text);
        }
      }
    } catch (e) {
      setError(`处理失败: ${e instanceof Error ? e.message : '未知错误'}`);
      setResult('');
    }
  }, [input, secretKey, mode, cipherMode, padding, iv, outputFormat, useAdvanced]);

  const loadSample = () => {
    setMode('encrypt');
    setInput('Hello, DevToolBox! 这是一段测试文本。');
    setSecretKey('my-secret-key-16');
  };

  return (
    <ToolPage title="AES 加密/解密" description="AES 对称加密与解密，支持多种模式和填充方式">
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('encrypt'); setResult(''); setError(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'encrypt'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            加密
          </button>
          <button
            onClick={() => { setMode('decrypt'); setResult(''); setError(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'decrypt'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            解密
          </button>
          <div className="flex-1" />
          <button
            onClick={loadSample}
            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            示例数据
          </button>
        </div>

        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {mode === 'encrypt' ? '明文' : '密文'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encrypt' ? '请输入要加密的文本...' : '请输入要解密的密文...'}
            className="w-full h-28 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
          />
        </div>

        {/* Key */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">密钥 (Key)</label>
          <input
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="请输入密钥..."
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        {/* Advanced toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useAdvanced}
            onChange={(e) => setUseAdvanced(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">高级选项（指定模式、填充、IV）</span>
        </label>

        {/* Advanced Options */}
        {useAdvanced && (
          <div className="flex flex-wrap gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div>
              <label className="block text-xs text-gray-400 mb-1">加密模式</label>
              <select
                value={cipherMode}
                onChange={(e) => setCipherMode(e.target.value as CipherMode)}
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cipherModes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">填充方式</label>
              <select
                value={padding}
                onChange={(e) => setPadding(e.target.value as PaddingType)}
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {paddingTypes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">输出格式</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormatType)}
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Base64">Base64</option>
                <option value="Hex">Hex</option>
              </select>
            </div>
            {cipherMode !== 'ECB' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-gray-400 mb-1">IV（初始化向量）</label>
                <input
                  type="text"
                  value={iv}
                  onChange={(e) => setIv(e.target.value)}
                  placeholder="请输入 IV（16 字符）..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* Execute Button */}
        <button
          onClick={process}
          disabled={!input || !secretKey}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          {mode === 'encrypt' ? '加密' : '解密'}
        </button>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">
              {mode === 'encrypt' ? '加密结果' : '解密结果'}
            </h3>
            <div className="flex items-start gap-3 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <code className="flex-1 text-sm text-green-400 font-mono break-all select-all whitespace-pre-wrap">
                {result}
              </code>
              <CopyButton text={result} />
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
