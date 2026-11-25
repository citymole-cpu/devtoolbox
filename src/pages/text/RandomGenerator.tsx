import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CodeEditor from '../../components/CodeEditor';
import CopyButton from '../../components/CopyButton';
import { Shuffle, Download, Copy, RefreshCw } from 'lucide-react';

const SURNAMES = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐';
const GIVEN_NAMES = '伟刚勇毅俊峰强军平保东文辉力明永健世广志义兴良海山仁波宁贵福生龙元全国胜学祥才发武新利清飞彬富顺信子杰涛昌成康星光天达安岩中茂进林有坚和彪博诚先敬震振壮会思群豪心邦承乐绍功松善厚庆磊民友裕河哲江超浩亮政谦亨奇荣';
const DOMAINS = ['gmail.com', 'qq.com', '163.com', 'outlook.com', 'foxmail.com', 'example.com'];

export default function RandomGenerator() {
  const [dataType, setDataType] = useState<string>('name');
  const [count, setCount] = useState<number>(20);
  const [output, setOutput] = useState<string>('');

  const generateData = () => {
    const list: string[] = [];

    for (let i = 0; i < count; i++) {
      if (dataType === 'name') {
        const sur = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
        const len = Math.random() > 0.5 ? 2 : 1;
        let given = '';
        for (let j = 0; j < len; j++) {
          given += GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
        }
        list.push(`${sur}${given}`);
      } else if (dataType === 'phone') {
        const prefixes = ['138', '139', '150', '158', '188', '186', '133', '189', '199', '177'];
        const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
        const post = Math.floor(10000000 + Math.random() * 90000000);
        list.push(`${pre}${post}`);
      } else if (dataType === 'email') {
        const user = Math.random().toString(36).substring(2, 9);
        const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
        list.push(`${user}@${domain}`);
      } else if (dataType === 'ipv4') {
        const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
        list.push(ip);
      } else if (dataType === 'mac') {
        const mac = Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, '0')
            .toUpperCase()
        ).join(':');
        list.push(mac);
      } else if (dataType === 'number') {
        list.push(String(Math.floor(Math.random() * 1000000)));
      } else if (dataType === 'chinese') {
        const len = Math.floor(Math.random() * 15) + 5;
        let str = '';
        for (let k = 0; k < len; k++) {
          str += String.fromCharCode(0x4e00 + Math.floor(Math.random() * (0x9fa5 - 0x4e00)));
        }
        list.push(str);
      }
    }

    setOutput(list.join('\n'));
  };

  React.useEffect(() => {
    generateData();
  }, [dataType, count]);

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `random_${dataType}_${Date.now()}.txt`;
    a.click();
  };

  return (
    <ToolPage
      title="随机数据批量生成器"
      description="批量生成中文姓名、手机号、邮箱、IP、MAC 地址、随机汉字及测试样本数据"
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'name', label: '随机中文名' },
              { key: 'phone', label: '随机手机号' },
              { key: 'email', label: '随机邮箱' },
              { key: 'ipv4', label: '随机 IPv4' },
              { key: 'mac', label: '随机 MAC 地址' },
              { key: 'number', label: '随机纯整数' },
              { key: 'chinese', label: '随机常用汉字' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setDataType(t.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  dataType === t.key
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">数量:</span>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              >
                <option value={10}>10 条</option>
                <option value={20}>20 条</option>
                <option value={50}>50 条</option>
                <option value={100}>100 条</option>
                <option value={500}>500 条</option>
              </select>
            </div>

            <button
              onClick={generateData}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重新生成
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              导出 TXT
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              生成结果数据清单 (共 {output.split('\n').filter(Boolean).length} 项)
            </span>
            <CopyButton text={output} label="一键复制全部" />
          </div>
          <CodeEditor value={output} onChange={setOutput} minHeight="400px" />
        </div>
      </div>
    </ToolPage>
  );
}
