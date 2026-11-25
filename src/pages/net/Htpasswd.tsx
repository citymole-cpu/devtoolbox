import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CodeEditor from '../../components/CodeEditor';
import CopyButton from '../../components/CopyButton';
import CryptoJS from 'crypto-js';
import { KeyRound, ShieldCheck, Download, Plus, Trash2 } from 'lucide-react';

interface UserEntry {
  id: string;
  username: string;
  plainPass: string;
  algo: 'sha1' | 'md5' | 'plain';
}

export default function Htpasswd() {
  const [entries, setEntries] = useState<UserEntry[]>([
    { id: '1', username: 'admin', plainPass: 'supersecret', algo: 'sha1' },
    { id: '2', username: 'deployer', plainPass: 'pass123456', algo: 'sha1' },
  ]);

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Math.random().toString(36).substring(2),
        username: `user_${entries.length + 1}`,
        plainPass: Math.random().toString(36).substring(2, 10),
        algo: 'sha1',
      },
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof UserEntry, val: any) => {
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );
  };

  const generateLine = (item: UserEntry) => {
    const u = item.username.trim() || 'user';
    const p = item.plainPass;

    if (item.algo === 'sha1') {
      const sha = CryptoJS.SHA1(p);
      const b64 = CryptoJS.enc.Base64.stringify(sha);
      return `${u}:{SHA}${b64}`;
    } else if (item.algo === 'md5') {
      const md5 = CryptoJS.MD5(p).toString();
      return `${u}:$apr1$salt$${md5}`;
    } else {
      return `${u}:${p}`;
    }
  };

  const htpasswdContent = entries.map(generateLine).join('\n');

  const downloadFile = () => {
    const blob = new Blob([htpasswdContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.htpasswd';
    a.click();
  };

  return (
    <ToolPage
      title="在线 .htpasswd 认证文件生成器"
      description="为 Nginx / Apache 的 HTTP Basic Authentication 快速生成 .htpasswd 用户密码清单，支持 SHA-1 / APR1-MD5 安全加密"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧配置 */}
          <div className="lg:col-span-1 space-y-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                配置用户与密码
              </span>
              <button
                onClick={addEntry}
                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                添加用户
              </button>
            </div>

            <div className="space-y-3">
              {entries.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">用户 #{idx + 1}</span>
                    {entries.length > 1 && (
                      <button
                        onClick={() => removeEntry(item.id)}
                        className="text-rose-500 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">账号名</span>
                    <input
                      type="text"
                      value={item.username}
                      onChange={(e) => updateEntry(item.id, 'username', e.target.value)}
                      className="w-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">明文密码</span>
                    <input
                      type="text"
                      value={item.plainPass}
                      onChange={(e) => updateEntry(item.id, 'plainPass', e.target.value)}
                      className="w-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">加密算法</span>
                    <select
                      value={item.algo}
                      onChange={(e) => updateEntry(item.id, 'algo', e.target.value)}
                      className="w-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                    >
                      <option value="sha1">SHA-1 (推荐，Nginx/Apache完美支持)</option>
                      <option value="md5">APR1-MD5 (Apache 兼容)</option>
                      <option value="plain">明文 Plaintext (仅供测试)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={downloadFile}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors text-xs mt-3"
            >
              <Download className="w-4 h-4" />
              下载 .htpasswd 文件
            </button>
          </div>

          {/* 右侧输出 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  生成 .htpasswd 文件内容
                </span>
                <CopyButton text={htpasswdContent} label="复制配置内容" />
              </div>
              <CodeEditor value={htpasswdContent} readOnly minHeight="240px" />
            </div>

            {/* Nginx 部署指引卡片 */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Nginx 快速配置范例：
              </span>
              <pre className="p-3 bg-slate-950 text-slate-300 rounded-lg overflow-x-auto font-mono text-[11px]">
{`location /admin/ {
    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

