import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Download, RefreshCw, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface RegistryItem {
  id: string;
  name: string;
  category: string;
  official: string;
  mirrors: {
    source: string;
    url: string;
    cmdTemp?: string;
    cmdPermanent?: string;
  }[];
  configSnippet?: {
    file: string;
    content: string;
  };
}

const REGISTRIES: RegistryItem[] = [
  {
    id: 'npm',
    name: 'npm / Yarn / pnpm',
    category: 'Node.js',
    official: 'https://registry.npmjs.org/',
    mirrors: [
      {
        source: '阿里云淘宝镜像 (Taobao/Aliyun)',
        url: 'https://registry.npmmirror.com/',
        cmdPermanent: 'npm config set registry https://registry.npmmirror.com/',
        cmdTemp: 'npm install --registry=https://registry.npmmirror.com',
      },
      {
        source: '腾讯云 (Tencent)',
        url: 'https://mirrors.cloud.tencent.com/npm/',
        cmdPermanent: 'npm config set registry https://mirrors.cloud.tencent.com/npm/',
      },
      {
        source: '华为云 (HuaweiCloud)',
        url: 'https://repo.huaweicloud.com/repository/npm/',
        cmdPermanent: 'npm config set registry https://repo.huaweicloud.com/repository/npm/',
      },
    ],
    configSnippet: {
      file: '~/.npmrc',
      content: 'registry=https://registry.npmmirror.com/',
    },
  },
  {
    id: 'pip',
    name: 'Python (pip)',
    category: 'Python',
    official: 'https://pypi.org/simple',
    mirrors: [
      {
        source: '清华大学 TUNA 镜像',
        url: 'https://pypi.tuna.tsinghua.edu.cn/simple',
        cmdPermanent: 'pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple',
        cmdTemp: 'pip install -i https://pypi.tuna.tsinghua.edu.cn/simple <package>',
      },
      {
        source: '阿里云 (Aliyun)',
        url: 'https://mirrors.aliyun.com/pypi/simple/',
        cmdPermanent: 'pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/',
      },
      {
        source: '中国科学技术大学 (USTC)',
        url: 'https://pypi.mirrors.ustc.edu.cn/simple/',
        cmdPermanent: 'pip config set global.index-url https://pypi.mirrors.ustc.edu.cn/simple/',
      },
      {
        source: '豆瓣 (Douban)',
        url: 'https://pypi.douban.com/simple/',
        cmdPermanent: 'pip config set global.index-url https://pypi.douban.com/simple/',
      },
    ],
    configSnippet: {
      file: '~/.pip/pip.conf (Linux/Mac) 或 %APPDATA%\\pip\\pip.ini',
      content: '[global]\nindex-url = https://pypi.tuna.tsinghua.edu.cn/simple\n[install]\ntrusted-host = pypi.tuna.tsinghua.edu.cn',
    },
  },
  {
    id: 'composer',
    name: 'PHP (Composer)',
    category: 'PHP',
    official: 'https://repo.packagist.org',
    mirrors: [
      {
        source: '阿里云 (Aliyun Packagist)',
        url: 'https://mirrors.aliyun.com/composer/',
        cmdPermanent: 'composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/',
      },
      {
        source: '腾讯云 (Tencent Cloud)',
        url: 'https://mirrors.cloud.tencent.com/composer/',
        cmdPermanent: 'composer config -g repos.packagist composer https://mirrors.cloud.tencent.com/composer/',
      },
    ],
  },
  {
    id: 'goproxy',
    name: 'Go 语言 (GOPROXY)',
    category: 'Golang',
    official: 'https://proxy.golang.org,direct',
    mirrors: [
      {
        source: 'Goproxy.cn (七牛云支持)',
        url: 'https://goproxy.cn,direct',
        cmdPermanent: 'go env -w GOPROXY=https://goproxy.cn,direct',
      },
      {
        source: '阿里云 Go Proxy',
        url: 'https://mirrors.aliyun.com/goproxy/,direct',
        cmdPermanent: 'go env -w GOPROXY=https://mirrors.aliyun.com/goproxy/,direct',
      },
    ],
  },
  {
    id: 'maven',
    name: 'Java (Maven)',
    category: 'Java',
    official: 'https://repo.maven.apache.org/maven2',
    mirrors: [
      {
        source: '阿里云公共仓库 (Aliyun Maven)',
        url: 'https://maven.aliyun.com/repository/public',
      },
      {
        source: '华为云 (Huawei Maven)',
        url: 'https://repo.huaweicloud.com/repository/maven/',
      },
    ],
    configSnippet: {
      file: 'settings.xml (<mirrors> 标签内)',
      content: `<mirror>
  <id>aliyunmaven</id>
  <mirrorOf>*</mirrorOf>
  <name>阿里云公共仓库</name>
  <url>https://maven.aliyun.com/repository/public</url>
</mirror>`,
    },
  },
  {
    id: 'docker',
    name: 'Docker 镜像加速源',
    category: 'DevOps',
    official: 'https://registry-1.docker.io',
    mirrors: [
      {
        source: '网易云 (163)',
        url: 'https://hub-mirror.c.163.com',
      },
      {
        source: '百度云 (Baidu Cloud)',
        url: 'https://mirror.baidubce.com',
      },
    ],
    configSnippet: {
      file: '/etc/docker/daemon.json',
      content: '{\n  "registry-mirrors": [\n    "https://mirror.baidubce.com",\n    "https://hub-mirror.c.163.com"\n  ]\n}',
    },
  },
];

export default function MirrorRegistry() {
  const [selectedId, setSelectedId] = useState<string>('npm');

  const currentItem = REGISTRIES.find((r) => r.id === selectedId) || REGISTRIES[0];

  return (
    <ToolPage
      title="国内常用开源软件镜像源换源速查与一键配置"
      description="涵盖 npm、pip、Maven、Composer、Go (GOPROXY)、Docker 等国内清华/阿里/腾讯高速镜像源，提供一行命令快速切换"
    >
      <div className="space-y-6">
        {/* 分类切换 */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
          {REGISTRIES.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                selectedId === r.id
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{r.name}</span>
            </button>
          ))}
        </div>

        {/* 详情与指令 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {currentItem.name} 镜像加速配置
                </h3>
                <span className="text-xs text-slate-400">
                  官方原始源: <code className="text-slate-500 font-mono">{currentItem.official}</code>
                </span>
              </div>
            </div>

            {/* 各大镜像源卡片 */}
            <div className="space-y-3">
              {currentItem.mirrors.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {m.source}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">{m.url}</span>
                  </div>

                  {m.cmdPermanent && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        永久换源命令行：
                      </span>
                      <div className="p-2.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg flex items-center justify-between gap-2 overflow-x-auto">
                        <span className="select-all">{m.cmdPermanent}</span>
                        <CopyButton text={m.cmdPermanent} label="复制命令" />
                      </div>
                    </div>
                  )}

                  {m.cmdTemp && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        临时单次使用：
                      </span>
                      <div className="p-2.5 bg-slate-950 text-slate-300 font-mono text-xs rounded-lg flex items-center justify-between gap-2 overflow-x-auto">
                        <span className="select-all">{m.cmdTemp}</span>
                        <CopyButton text={m.cmdTemp} label="复制命令" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 配置文件范例 */}
            {currentItem.configSnippet && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    配置文件直改方式 ({currentItem.configSnippet.file}):
                  </span>
                  <CopyButton text={currentItem.configSnippet.content} label="复制配置" />
                </div>
                <pre className="p-3 bg-slate-950 text-slate-300 rounded-xl font-mono text-xs overflow-x-auto">
                  {currentItem.configSnippet.content}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

