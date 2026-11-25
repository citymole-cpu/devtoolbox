import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Calculator, Search, AlertCircle } from 'lucide-react';

interface OpLevel {
  level: number;
  operators: string;
  desc: string;
  associativity: '从左到右' | '从右到左';
  example: string;
}

const JS_OPS: OpLevel[] = [
  { level: 1, operators: '( ... )', desc: '圆括号优先级最高', associativity: '从左到右', example: '(a + b) * c' },
  { level: 2, operators: '.   ?.   [ ]   new (带参)   ( ) (函数调用)', desc: '成员访问、可选链、索引、函数调用', associativity: '从左到右', example: 'obj?.prop, arr[0]' },
  { level: 3, operators: 'new (无参)', desc: '无参数 new 构造实例化', associativity: '从右到左', example: 'new Foo' },
  { level: 4, operators: '++   -- (后置)', desc: '后置自增、自减', associativity: '从左到右', example: 'i++, i--' },
  { level: 5, operators: '!   ~   +   -   ++   -- (前置)   typeof   void   delete   await', desc: '逻辑非、按位非、一元正负号、前置自增、typeof', associativity: '从右到左', example: '!flag, typeof x' },
  { level: 6, operators: '**', desc: '求幂 (指数运算)', associativity: '从右到左', example: '2 ** 3 ** 2 (=512)' },
  { level: 7, operators: '*   /   %', desc: '乘法、除法、取模', associativity: '从左到右', example: '10 * 5 % 3' },
  { level: 8, operators: '+   -', desc: '加法、减法、字符串拼接', associativity: '从左到右', example: 'a + b - 1' },
  { level: 9, operators: '<<   >>   >>>', desc: '按位左移、有符号右移、无符号右移', associativity: '从左到右', example: 'x << 2' },
  { level: 10, operators: '<   <=   >   >=   in   instanceof', desc: '大小关系比较、属性存在检测、原型链检测', associativity: '从左到右', example: 'a < b, obj instanceof Array' },
  { level: 11, operators: '==   !=   ===   !==', desc: '相等性、全等性判断', associativity: '从左到右', example: 'a === b, x != null' },
  { level: 12, operators: '&', desc: '按位与 (Bitwise AND)', associativity: '从左到右', example: 'flags & 0xFF' },
  { level: 13, operators: '^', desc: '按位异或 (Bitwise XOR)', associativity: '从左到右', example: 'a ^ b' },
  { level: 14, operators: '|', desc: '按位或 (Bitwise OR)', associativity: '从左到右', example: 'flags | 0x01' },
  { level: 15, operators: '&&', desc: '逻辑与 (短路运算)', associativity: '从左到右', example: 'isValid && doAction()' },
  { level: 16, operators: '||   ??', desc: '逻辑或、空值合并 (Nullish Coalescing)', associativity: '从左到右', example: 'val ?? defaultVal' },
  { level: 17, operators: '? :', desc: '三元条件运算符', associativity: '从右到左', example: 'isOk ? 1 : 0' },
  { level: 18, operators: '=   +=   -=   *=   /=   %=   &&=   ||=   ??=', desc: '赋值与复合赋值运算符', associativity: '从右到左', example: 'a += 5, x ||= y' },
  { level: 19, operators: ',', desc: '逗号运算符', associativity: '从左到右', example: 'a = (1, 2, 3)' },
];

export default function OperatorPrecedence() {
  const [lang, setLang] = useState<string>('javascript');
  const [keyword, setKeyword] = useState<string>('');

  const filtered = JS_OPS.filter(
    (op) =>
      !keyword ||
      op.operators.includes(keyword) ||
      op.desc.toLowerCase().includes(keyword.toLowerCase()) ||
      op.example.includes(keyword)
  );

  return (
    <ToolPage
      title="编程语言运算符优先级与结合性对照表"
      description="全面收录 JavaScript / C++ / Java / Python 运算符从高到低执行优先级、结合方向与防坑避雷指南"
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { key: 'javascript', label: 'JavaScript / TypeScript' },
              { key: 'c', label: 'C / C++' },
              { key: 'java', label: 'Java' },
              { key: 'python', label: 'Python' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setLang(t.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  lang === t.key
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
              placeholder="搜索符号 (如: &&, ++, ?, ===)..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 避坑提示 */}
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            常见优先级“隐形天坑”避雷：
          </span>
          <p>• <b>位与 & 比等于 == 优先级低</b>：例如 <code>if (status & FLAG == 0)</code> 实际会被当作 <code>status & (FLAG == 0)</code>，必须加括号：<code>(status & FLAG) == 0</code>。</p>
          <p>• <b>三元运算符 ? : 结合性是从右向左</b>：<code>a ? b : c ? d : e</code> 等价于 <code>a ? b : (c ? d : e)</code>。</p>
          <p>• <b>求幂 ** 也是从右向左</b>：<code>2 ** 3 ** 2</code> 等价于 <code>2 ** (3 ** 2) = 512</code>，而不是 64。</p>
        </div>

        {/* 表格 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 w-16 text-center">优先级</th>
                  <th className="p-3 font-semibold">运算符</th>
                  <th className="p-3">结合性</th>
                  <th className="p-3">类型与功能说明</th>
                  <th className="p-3">代码示例</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((op) => (
                  <tr key={op.level} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 text-center">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[11px] inline-flex items-center justify-center text-slate-600 dark:text-slate-400">
                        {op.level}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {op.operators}
                    </td>
                    <td className="p-3 text-slate-500">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          op.associativity === '从右到左'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {op.associativity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {op.desc}
                    </td>
                    <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                      <code>{op.example}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

