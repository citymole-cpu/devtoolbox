import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Keyboard, Search, Sparkles } from 'lucide-react';

interface KeySymbol {
  char: string;
  enName: string;
  cnName: string;
  pronounce: string;
  jsEscape?: string;
  htmlEntity?: string;
  usage: string;
}

const SYMBOLS: KeySymbol[] = [
  { char: '`', enName: 'Backtick / Grave accent', cnName: '反引号 / 重音符', pronounce: 'bæk-tɪk', jsEscape: '\\`', htmlEntity: '&#96;', usage: 'JS 模板字符串、Markdown 行内代码' },
  { char: '~', enName: 'Tilde', cnName: '波浪号', pronounce: 'ˈtɪldə', jsEscape: '~', htmlEntity: '&tilde;', usage: '位非运算、CSS 兄弟选择器、用户家目录 ~' },
  { char: '!', enName: 'Exclamation mark', cnName: '感叹号', pronounce: 'ˌekskləˈmeɪʃn', jsEscape: '!', htmlEntity: '&excl;', usage: '逻辑非、TS 非空断言 (!)' },
  { char: '@', enName: 'At sign', cnName: 'At 符号 / 艾特', pronounce: 'æt saɪn', jsEscape: '@', htmlEntity: '&commat;', usage: 'TS/Java 注解、邮箱地址、CSS @media' },
  { char: '#', enName: 'Hash / Pound / Octothorpe', cnName: '井号', pronounce: 'hæʃ', jsEscape: '#', htmlEntity: '&num;', usage: 'CSS ID 选择器、URL 锚点、预处理 #include' },
  { char: '$', enName: 'Dollar sign', cnName: '美元符', pronounce: 'ˈdɑːlər saɪn', jsEscape: '\\$', htmlEntity: '&dollar;', usage: '正则行尾匹配、jQuery 标识符、Shell 变量' },
  { char: '%', enName: 'Percent sign', cnName: '百分号', pronounce: 'pərˈsent saɪn', jsEscape: '%', htmlEntity: '&percnt;', usage: '求模取余运算、CSS 百分比' },
  { char: '^', enName: 'Caret / Circumflex', cnName: '脱字符 / 插入符', pronounce: 'ˈkærət', jsEscape: '^', htmlEntity: '&circ;', usage: '位异或运算、正则行首匹配、语义化版本 ^' },
  { char: '&', enName: 'Ampersand', cnName: '与号 (And)', pronounce: 'ˈæmpərsænd', jsEscape: '&', htmlEntity: '&amp;', usage: '逻辑与 (&&)、位与 (&)、URL 参数连接符' },
  { char: '*', enName: 'Asterisk', cnName: '星号', pronounce: 'ˈæstərɪsk', jsEscape: '*', htmlEntity: '&ast;', usage: '乘法、指针运算符 (*ptr)、通配符' },
  { char: '(', enName: 'Left parenthesis', cnName: '左圆括号 / 左小括号', pronounce: 'pəˈrenθəsɪs', jsEscape: '\\(', htmlEntity: '&lpar;', usage: '函数调用参数、数学运算优先级' },
  { char: ')', enName: 'Right parenthesis', cnName: '右圆括号 / 右小括号', pronounce: 'pəˈrenθəsɪs', jsEscape: '\\)', htmlEntity: '&rpar;', usage: '函数调用、元组闭合' },
  { char: '-', enName: 'Hyphen / Minus / Dash', cnName: '连字符 / 减号', pronounce: 'ˈhaɪfn', jsEscape: '\\-', htmlEntity: '&minus;', usage: '减法、kebab-case 命名、CLI 命令行选项' },
  { char: '_', enName: 'Underscore / Low line', cnName: '下划线', pronounce: 'ˈʌndərskɔːr', jsEscape: '_', htmlEntity: '&lowbar;', usage: 'snake_case 命名、私有变量前缀' },
  { char: '=', enName: 'Equal sign', cnName: '等号', pronounce: 'ˈiːkwəl saɪn', jsEscape: '=', htmlEntity: '&equals;', usage: '赋值运算符、箭头函数 (=>)' },
  { char: '+', enName: 'Plus sign', cnName: '加号', pronounce: 'plʌs saɪn', jsEscape: '\\+', htmlEntity: '&plus;', usage: '加法、字符串拼接、自增 (++)' },
  { char: '[', enName: 'Left square bracket', cnName: '左方括号 / 左中括号', pronounce: 'brækɪt', jsEscape: '\\[', htmlEntity: '&lbrack;', usage: '数组字面量、索引访问器 arr[0]' },
  { char: ']', enName: 'Right square bracket', cnName: '右方括号 / 右中括号', pronounce: 'brækɪt', jsEscape: '\\]', htmlEntity: '&rbrack;', usage: '数组边界闭合' },
  { char: '{', enName: 'Left brace / Curly bracket', cnName: '左花括号 / 左大括号', pronounce: 'breɪs', jsEscape: '\\{', htmlEntity: '&lbrace;', usage: '代码块、对象字面量、解构赋值' },
  { char: '}', enName: 'Right brace / Curly bracket', cnName: '右花括号 / 右大括号', pronounce: 'breɪs', jsEscape: '\\}', htmlEntity: '&rbrace;', usage: '作用域块闭合' },
  { char: '\\', enName: 'Backslash', cnName: '反斜杠', pronounce: 'ˈbækslæʃ', jsEscape: '\\\\', htmlEntity: '&bsol;', usage: '字符串转义前缀 (\\n, \\t)、Windows 路径' },
  { char: '/', enName: 'Slash / Forward slash', cnName: '正斜杠 / 斜杠', pronounce: 'slæʃ', jsEscape: '\\/', htmlEntity: '&sol;', usage: '除法、URL 路径分割、正则表达式字面量' },
  { char: '|', enName: 'Pipe / Vertical bar', cnName: '竖线 / 管道符', pronounce: 'paɪp', jsEscape: '\\|', htmlEntity: '&vert;', usage: '位或 (|)、逻辑或 (||)、TS 联合类型、Linux 管道' },
  { char: ':', enName: 'Colon', cnName: '冒号', pronounce: 'ˈkoʊlən', jsEscape: ':', htmlEntity: '&colon;', usage: '对象键值分隔、TS 类型注解、三元运算' },
  { char: ';', enName: 'Semicolon', cnName: '分号', pronounce: 'ˈsemikoʊlən', jsEscape: ';', htmlEntity: '&semi;', usage: '语句结束符' },
  { char: '<', enName: 'Less-than / Left angle', cnName: '小于号 / 左尖括号', pronounce: 'les ðæn', jsEscape: '<', htmlEntity: '&lt;', usage: '小于比较、泛型定义 <T>、HTML 标签开启' },
  { char: '>', enName: 'Greater-than / Right angle', cnName: '大于号 / 右尖括号', pronounce: 'ˈɡreɪtər ðæn', jsEscape: '>', htmlEntity: '&gt;', usage: '大于比较、HTML 标签闭合、重定向 >' },
  { char: '?', enName: 'Question mark', cnName: '问号', pronounce: 'ˈkwestʃən mɑːrk', jsEscape: '\\?', htmlEntity: '&quest;', usage: '三元运算符、TS 可选链 (?.) 与可选属性' },
];

export default function KeyboardSymbols() {
  const [keyword, setKeyword] = useState<string>('');

  const filtered = SYMBOLS.filter(
    (s) =>
      !keyword ||
      s.char.includes(keyword) ||
      s.enName.toLowerCase().includes(keyword.toLowerCase()) ||
      s.cnName.includes(keyword) ||
      s.usage.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <ToolPage
      title="键盘符号中英文名称发音与转义对照表"
      description="解决程序员英文口语交流与命名疑惑：全面收录键盘所有特殊符号的标准英文名称、国际音标、中文叫法与编程常见用途"
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            共收录 <span className="font-bold text-blue-600 font-mono">{SYMBOLS.length}</span> 个键盘常用编码符号
          </div>

          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索符号 (如: ^, 管道符, Caret, Tilde)..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 符号表格 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">符号</th>
                  <th className="p-3">标准英文名称</th>
                  <th className="p-3">美式发音 (IPA)</th>
                  <th className="p-3">中文标准叫法</th>
                  <th className="p-3">HTML 实体</th>
                  <th className="p-3">编程高频应用场景</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-mono font-bold text-base flex items-center justify-center border border-blue-200 dark:border-blue-800">
                        {s.char}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {s.enName}
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      /{s.pronounce}/
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                      {s.cnName}
                    </td>
                    <td className="p-3 font-mono text-blue-600 dark:text-blue-400">
                      {s.htmlEntity}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      {s.usage}
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

