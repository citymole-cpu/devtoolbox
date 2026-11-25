import { useState, useCallback, useEffect } from 'react';
import { ToolPage } from '../../components/ToolPage';
import { CopyButton } from '../../components/CopyButton';

const sampleJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8oOS4iSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzM1Njg5NjAwfQ.invalid_signature_here';

interface DecodedJwt {
  header: string;
  payload: string;
  signature: string;
  headerObj?: Record<string, any>;
  payloadObj?: Record<string, any>;
  expiration?: string;
  isExpired?: boolean;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('无效的 JWT 格式：JWT 应包含三个部分（Header.Payload.Signature），以点号分隔');
  }

  const headerJson = base64UrlDecode(parts[0]);
  const payloadJson = base64UrlDecode(parts[1]);

  const headerObj = JSON.parse(headerJson);
  const payloadObj = JSON.parse(payloadJson);

  const result: DecodedJwt = {
    header: JSON.stringify(headerObj, null, 2),
    payload: JSON.stringify(payloadObj, null, 2),
    signature: parts[2],
    headerObj,
    payloadObj,
  };

  if (payloadObj.exp) {
    const expDate = new Date(payloadObj.exp * 1000);
    result.expiration = expDate.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
    result.isExpired = Date.now() > payloadObj.exp * 1000;
  }

  if (payloadObj.iat) {
    payloadObj._iat_readable = new Date(payloadObj.iat * 1000).toLocaleString('zh-CN');
  }

  return result;
}

export default function Jwt() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState('');

  const decode = useCallback((token: string) => {
    if (!token.trim()) {
      setDecoded(null);
      setError('');
      return;
    }
    try {
      const result = decodeJwt(token);
      setDecoded(result);
      setError('');
    } catch (e: any) {
      setError(e.message || '解析失败');
      setDecoded(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => decode(input), 300);
    return () => clearTimeout(timer);
  }, [input, decode]);

  const loadSample = useCallback(() => {
    setInput(sampleJwt);
  }, []);

  return (
    <ToolPage title="JWT 解析器" description="解析 JSON Web Token，查看 Header、Payload 和签名信息">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={loadSample}
          className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          加载示例
        </button>
      </div>

      {/* JWT Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          JWT Token
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请粘贴 JWT Token..."
          className="w-full h-24 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {decoded && (
        <div className="grid grid-cols-1 gap-6">
          {/* Expiration Status */}
          {decoded.expiration && (
            <div
              className={`p-4 rounded-lg border ${
                decoded.isExpired
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    decoded.isExpired
                      ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                      : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                  }`}
                >
                  {decoded.isExpired ? '⛔ 已过期' : '✅ 有效'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  过期时间: {decoded.expiration}
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-300 dark:border-blue-700">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                📋 Header（头部）
              </span>
              <CopyButton text={decoded.header} />
            </div>
            <pre className="p-4 bg-white dark:bg-gray-800 text-sm font-mono text-blue-800 dark:text-blue-300 overflow-x-auto">
              {decoded.header}
            </pre>
          </div>

          {/* Payload */}
          <div className="rounded-lg border-2 border-green-300 dark:border-green-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-900/30 border-b border-green-300 dark:border-green-700">
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                📦 Payload（载荷）
              </span>
              <CopyButton text={decoded.payload} />
            </div>
            <pre className="p-4 bg-white dark:bg-gray-800 text-sm font-mono text-green-800 dark:text-green-300 overflow-x-auto">
              {decoded.payload}
            </pre>
            {/* Payload claim details */}
            {decoded.payloadObj && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-green-200 dark:border-green-800">
                <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                  {decoded.payloadObj.sub && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      主题 (sub): {decoded.payloadObj.sub}
                    </span>
                  )}
                  {decoded.payloadObj.iat && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      签发时间 (iat):{' '}
                      {new Date(decoded.payloadObj.iat * 1000).toLocaleString('zh-CN')}
                    </span>
                  )}
                  {decoded.payloadObj.exp && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      过期时间 (exp):{' '}
                      {new Date(decoded.payloadObj.exp * 1000).toLocaleString('zh-CN')}
                    </span>
                  )}
                  {decoded.payloadObj.iss && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      签发者 (iss): {decoded.payloadObj.iss}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="rounded-lg border-2 border-red-300 dark:border-red-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-red-50 dark:bg-red-900/30 border-b border-red-300 dark:border-red-700">
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                🔐 Signature（签名）
              </span>
              <CopyButton text={decoded.signature} />
            </div>
            <pre className="p-4 bg-white dark:bg-gray-800 text-sm font-mono text-red-800 dark:text-red-300 overflow-x-auto break-all">
              {decoded.signature}
            </pre>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-red-200 dark:border-red-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ⚠️ 签名验证需要密钥，此工具仅做解码展示，不验证签名有效性。
              </p>
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
