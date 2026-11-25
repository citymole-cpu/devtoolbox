import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Database, Download, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

type OutputFormat = 'json' | 'yaml' | 'csv' | 'tsv' | 'toml';

interface FieldConfig {
  id: string;
  name: string;
  type: 'id' | 'name' | 'email' | 'phone' | 'city' | 'date' | 'price' | 'boolean' | 'ip';
}

const SAMPLE_NAMES = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十', '陈明', '林华', '黄勇', '刘洋'];
const SAMPLE_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '重庆', '西安', '苏州', '长沙'];
const SAMPLE_DOMAINS = ['gmail.com', 'qq.com', '163.com', 'outlook.com', 'company.cn', 'foxmail.com'];

export default function MockDataGenerator() {
  const [format, setFormat] = useState<OutputFormat>('json');
  const [rowCount, setRowCount] = useState<number>(5);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const [fields, setFields] = useState<FieldConfig[]>([
    { id: '1', name: 'id', type: 'id' },
    { id: '2', name: 'name', type: 'name' },
    { id: '3', name: 'email', type: 'email' },
    { id: '4', name: 'phone', type: 'phone' },
    { id: '5', name: 'city', type: 'city' },
    { id: '6', name: 'amount', type: 'price' },
    { id: '7', name: 'isActive', type: 'boolean' },
    { id: '8', name: 'createdAt', type: 'date' }
  ]);

  const generateValue = (type: FieldConfig['type'], index: number) => {
    switch (type) {
      case 'id':
        return 1000 + index + 1;
      case 'name':
        return SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
      case 'email': {
        const nameEn = `user_${Math.floor(Math.random() * 8999 + 1000)}`;
        const domain = SAMPLE_DOMAINS[Math.floor(Math.random() * SAMPLE_DOMAINS.length)];
        return `${nameEn}@${domain}`;
      }
      case 'phone': {
        const prefixes = ['138', '139', '150', '186', '188', '199', '177'];
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = Math.floor(Math.random() * 89999999 + 10000000);
        return `${p}${suffix}`;
      }
      case 'city':
        return SAMPLE_CITIES[Math.floor(Math.random() * SAMPLE_CITIES.length)];
      case 'price':
        return Number((Math.random() * 900 + 10).toFixed(2));
      case 'boolean':
        return Math.random() > 0.3;
      case 'ip':
        return `192.168.${Math.floor(Math.random() * 254 + 1)}.${Math.floor(Math.random() * 254 + 1)}`;
      case 'date': {
        const d = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
        return d.toISOString().split('T')[0];
      }
      default:
        return 'test';
    }
  };

  const generateData = () => {
    const rows: Record<string, any>[] = [];
    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, any> = {};
      fields.forEach(f => {
        row[f.name] = generateValue(f.type, i);
      });
      rows.push(row);
    }

    if (format === 'json') {
      setOutput(JSON.stringify(rows, null, 2));
    } else if (format === 'yaml') {
      let yamlStr = '# Mock Data in YAML\n';
      rows.forEach(r => {
        yamlStr += '-\n';
        Object.entries(r).forEach(([k, v]) => {
          if (typeof v === 'string') {
            yamlStr += `  ${k}: "${v}"\n`;
          } else {
            yamlStr += `  ${k}: ${v}\n`;
          }
        });
      });
      setOutput(yamlStr);
    } else if (format === 'csv') {
      const header = fields.map(f => f.name).join(',');
      const body = rows
        .map(r =>
          fields
            .map(f => {
              const val = r[f.name];
              return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val);
            })
            .join(',')
        )
        .join('\n');
      setOutput(`${header}\n${body}`);
    } else if (format === 'tsv') {
      const header = fields.map(f => f.name).join('\t');
      const body = rows.map(r => fields.map(f => String(r[f.name])).join('\t')).join('\n');
      setOutput(`${header}\n${body}`);
    } else if (format === 'toml') {
      let tomlStr = '# Mock Data in TOML\n\n';
      rows.forEach(r => {
        tomlStr += '[[records]]\n';
        Object.entries(r).forEach(([k, v]) => {
          if (typeof v === 'string') {
            tomlStr += `${k} = "${v}"\n`;
          } else {
            tomlStr += `${k} = ${v}\n`;
          }
        });
        tomlStr += '\n';
      });
      setOutput(tomlStr.trim());
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const extensions: Record<OutputFormat, string> = {
      json: 'json',
      yaml: 'yaml',
      csv: 'csv',
      tsv: 'tsv',
      toml: 'toml'
    };
    const mimeTypes: Record<OutputFormat, string> = {
      json: 'application/json',
      yaml: 'text/yaml',
      csv: 'text/csv',
      tsv: 'text/tab-separated-values',
      toml: 'application/toml'
    };
    const blob = new Blob([output], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_data_${rowCount}_rows.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPage
      title="随机数据生成器 (YAML / CSV / TSV / TOML / JSON)"
      description="快速生成用于测试、原型开发的高仿真随机数据集，支持一键切换并导出为多种流行数据格式"
    >
      <div className="space-y-6">
        {/* 控制配置栏 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 格式切换 */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">输出格式:</span>
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1">
                {(['json', 'yaml', 'csv', 'tsv', 'toml'] as OutputFormat[]).map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      setFormat(f);
                    }}
                    className={`px-3 py-1 text-xs font-mono font-medium rounded-md uppercase transition-all ${
                      format === f
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* 条数设置与生成按钮 */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">生成行数:</label>
              <select
                value={rowCount}
                onChange={e => setRowCount(Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              >
                <option value={3}>3 条</option>
                <option value={5}>5 条</option>
                <option value={10}>10 条</option>
                <option value={20}>20 条</option>
                <option value={50}>50 条</option>
                <option value={100}>100 条</option>
              </select>

              <button
                onClick={generateData}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                生成随机数据
              </button>
            </div>
          </div>

          {/* 字段包含预览 */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700 dark:text-gray-300">包含字段:</span>
            {fields.map(f => (
              <span
                key={f.id}
                className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-mono text-[11px]"
              >
                {f.name} ({f.type})
              </span>
            ))}
          </div>
        </div>

        {/* 结果展示与操作 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/70 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>数据预览 ({format.toUpperCase()})</span>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={output} />
              <button
                onClick={handleDownload}
                disabled={!output}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 disabled:opacity-40 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                下载文件
              </button>
            </div>
          </div>

          <div className="p-4">
            {output ? (
              <textarea
                readOnly
                value={output}
                rows={16}
                className="w-full font-mono text-xs p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none text-gray-800 dark:text-gray-200 leading-relaxed resize-y"
              />
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">点击上方“生成随机数据”按钮即可即时模拟数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
