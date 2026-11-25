import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import DualEditor from '../../components/DualEditor';
import { ArrowLeftRight, Cookie, ListOrdered, FileJson } from 'lucide-react';

export default function HeaderCookieFormat() {
  const [mode, setMode] = useState<'headers' | 'cookie' | 'query'>('headers');
  const [input, setInput] = useState<string>(
    `Host: api.example.com\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\nContent-Type: application/json; charset=utf-8`
  );

  const formatToJson = () => {
    if (!input.trim()) return '';

    try {
      if (mode === 'headers') {
        const lines = input.split('\n');
        const obj: Record<string, string> = {};
        for (const line of lines) {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            const key = line.substring(0, colonIdx).trim();
            const val = line.substring(colonIdx + 1).trim();
            obj[key] = val;
          }
        }
        return JSON.stringify(obj, null, 2);
      } else if (mode === 'cookie') {
        const parts = input.split(';');
        const obj: Record<string, string> = {};
        for (const part of parts) {
          const eqIdx = part.indexOf('=');
          if (eqIdx > 0) {
            const k = part.substring(0, eqIdx).trim();
            const v = part.substring(eqIdx + 1).trim();
            obj[k] = decodeURIComponent(v);
          }
        }
        return JSON.stringify(obj, null, 2);
      } else if (mode === 'query') {
        let qs = input.trim();
        if (qs.includes('?')) {
          qs = qs.substring(qs.indexOf('?') + 1);
        }
        const params = new URLSearchParams(qs);
        const obj: Record<string, string> = {};
        params.forEach((v, k) => {
          obj[k] = v;
        });
        return JSON.stringify(obj, null, 2);
      }
    } catch (err: any) {
      return `解析失败: ${err.message}`;
    }
    return '';
  };

  const output = formatToJson();

  return (
    <ToolPage
      title="HTTP Headers / Cookie / URL 参数格式化"
      description="HTTP 请求头 (Headers)、Cookie 串与 URL Get 请求参数双向解析、格式化与转标准 JSON"
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">解析类型:</span>
          {[
            { key: 'headers', label: 'HTTP 请求头 (Headers)' },
            { key: 'cookie', label: 'Cookie 字符串' },
            { key: 'query', label: 'URL Get Query 参数' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setMode(m.key as any);
                if (m.key === 'cookie') {
                  setInput('session_id=s%3A987654; user=alice; token=xyz123; theme=dark');
                } else if (m.key === 'query') {
                  setInput('https://example.com/search?q=developer&page=1&limit=20&sort=desc');
                } else {
                  setInput(
                    `Host: api.example.com\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\nAccept: application/json\nContent-Type: application/json`
                  );
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                mode === m.key
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <DualEditor
          inputLabel="原始文本"
          outputLabel="结构化 JSON 对象"
          input={input}
          output={output}
          onInputChange={setInput}
          inputPlaceholder="粘贴 Headers、Cookie 串或带参数的 URL..."
          outputPlaceholder="解析出的 JSON 结构..."
        />
      </div>
    </ToolPage>
  );
}

