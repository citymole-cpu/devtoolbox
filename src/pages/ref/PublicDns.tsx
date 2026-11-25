import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Globe, Search, ShieldCheck, Zap } from 'lucide-react';

interface DnsItem {
  name: string;
  provider: string;
  region: '国内主流' | '海外推荐';
  ipv4: string[];
  ipv6: string[];
  doh?: string;
  features: string;
}

const DNS_LIST: DnsItem[] = [
  {
    name: '阿里公共 DNS (AliDNS)',
    provider: '阿里巴巴',
    region: '国内主流',
    ipv4: ['223.5.5.5', '223.6.6.6'],
    ipv6: ['2400:3200::1', '2400:3200:baba::1'],
    doh: 'https://dns.alidns.com/dns-query',
    features: '国内BGP多线接入，智能就近调度，抗DNS劫持能力强',
  },
  {
    name: '腾讯公共 DNS (DNSPod)',
    provider: '腾讯云',
    region: '国内主流',
    ipv4: ['119.29.29.29', '182.254.116.116'],
    ipv6: ['2402:4e00::'],
    doh: 'https://doh.pub/dns-query',
    features: '依托腾讯多地域防护节点，低延迟防劫持，解析迅速',
  },
  {
    name: '114 DNS',
    provider: '南京信风',
    region: '国内主流',
    ipv4: ['114.114.114.114', '114.114.115.115'],
    ipv6: [],
    features: '国内老牌经典纯净 DNS，电信联通移动全网通用解析',
  },
  {
    name: '百度公共 DNS (BaiduDNS)',
    provider: '百度',
    region: '国内主流',
    ipv4: ['180.76.76.76'],
    ipv6: ['2400:da00::6666'],
    features: '百度自研高速云解析，全国骨干网节点响应快',
  },
  {
    name: 'CNNIC SDNS 国家公共 DNS',
    provider: '中国互联网络信息中心',
    region: '国内主流',
    ipv4: ['1.2.4.8', '210.2.4.8'],
    ipv6: [],
    features: '国家级互联网基础节点，纯净无广告污染',
  },
  {
    name: 'Cloudflare DNS',
    provider: 'Cloudflare',
    region: '海外推荐',
    ipv4: ['1.1.1.1', '1.0.0.1'],
    ipv6: ['2606:4700:4700::1111', '2606:4700:4700::1001'],
    doh: 'https://cloudflare-dns.com/dns-query',
    features: '全球极速 Anycast 节点，严格零日志隐私保护',
  },
  {
    name: 'Google Public DNS',
    provider: 'Google',
    region: '海外推荐',
    ipv4: ['8.8.8.8', '8.8.4.4'],
    ipv6: ['2001:4860:4860::8888', '2001:4860:4860::8844'],
    doh: 'https://dns.google/dns-query',
    features: '全球知名基础设施，支持完整的 EDNS 客户端子网扩展',
  },
  {
    name: 'Quad9',
    provider: 'Quad9 基金会',
    region: '海外推荐',
    ipv4: ['9.9.9.9', '149.112.112.112'],
    ipv6: ['2620:fe::fe', '2620:fe::9'],
    doh: 'https://dns.quad9.net/dns-query',
    features: '内置网络威胁与恶意域名拦截，国际非营利安全解析',
  },
];

export default function PublicDns() {
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>('');

  const filtered = DNS_LIST.filter((item) => {
    const matchRegion = filterRegion === 'all' || item.region === filterRegion;
    const matchKey =
      !keyword ||
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      item.provider.toLowerCase().includes(keyword.toLowerCase()) ||
      item.ipv4.some((ip) => ip.includes(keyword)) ||
      item.ipv6.some((ip) => ip.includes(keyword));
    return matchRegion && matchKey;
  });

  return (
    <ToolPage
      title="国内与全球知名公共 DNS / IPv6 资源大全"
      description="收录阿里 AliDNS、腾讯 DNSPod、114DNS、百度、谷歌 8.8.8.8、Cloudflare 1.1.1.1 等纯净无劫持 DNS 与 IPv6 地址"
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: '全部 DNS' },
              { key: '国内主流', label: '国内主流推荐' },
              { key: '海外推荐', label: '海外优质节点' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterRegion(t.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  filterRegion === t.key
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索 DNS 名称、IP 或提供商..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* DNS 卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.name}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    {item.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">{item.provider} · {item.region}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                {/* IPv4 */}
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-sans font-bold">
                      IPv4
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 select-all font-semibold">
                      {item.ipv4.join('   /   ')}
                    </span>
                  </div>
                  <CopyButton text={item.ipv4.join(' ')} label="复制" />
                </div>

                {/* IPv6 */}
                {item.ipv6.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-sans font-bold">
                        IPv6
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 select-all text-[11px]">
                        {item.ipv6.join('   /   ')}
                      </span>
                    </div>
                    <CopyButton text={item.ipv6.join(' ')} label="复制" />
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                {item.features}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}

