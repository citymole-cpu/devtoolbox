import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { Coins, DollarSign, Calendar, FileText } from 'lucide-react';

const DIGITS_CN = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const UNITS_CN = ['', '拾', '佰', '仟'];
const BIG_UNITS_CN = ['', '万', '亿', '兆'];

const ONES_EN = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TEENS_EN = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS_EN = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const THOUSANDS_EN = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

export default function CurrencyCapital() {
  const [numInput, setNumInput] = useState<string>('1234567.89');
  const [currency, setCurrency] = useState<'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'HKD'>('CNY');
  const [dateInput, setDateInput] = useState<string>('2026-10-28');

  // 数字转中文人民币大写
  const toChineseRmb = (n: number) => {
    if (isNaN(n) || n === 0) return '零元整';
    const isNegative = n < 0;
    n = Math.abs(n);

    let [integerPart, decimalPart = ''] = n.toFixed(2).split('.');
    let output = '';

    // 处理整数部分
    let zeroCount = 0;
    const len = integerPart.length;

    for (let i = 0; i < len; i++) {
      const p = len - i - 1;
      const d = parseInt(integerPart[i], 10);
      const quotient = Math.floor(p / 4);
      const remainder = p % 4;

      if (d === 0) {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          output += '零';
        }
        zeroCount = 0;
        output += DIGITS_CN[d] + UNITS_CN[remainder];
      }

      if (remainder === 0 && zeroCount < 4) {
        output += BIG_UNITS_CN[quotient];
      }
    }

    if (output) output += '元';

    // 处理角分
    const jiao = parseInt(decimalPart[0] || '0', 10);
    const fen = parseInt(decimalPart[1] || '0', 10);

    if (jiao === 0 && fen === 0) {
      output += '整';
    } else {
      if (jiao !== 0) output += DIGITS_CN[jiao] + '角';
      else if (output) output += '零';
      if (fen !== 0) output += DIGITS_CN[fen] + '分';
    }

    return (isNegative ? '负' : '') + (output || '零元整');
  };

  // 数字转英文金额大写
  const toEnglishWords = (n: number) => {
    if (isNaN(n) || n === 0) return 'Zero';
    const isNegative = n < 0;
    n = Math.abs(n);

    const [integerStr, decimalStr = '00'] = n.toFixed(2).split('.');
    let intNum = parseInt(integerStr, 10);

    const convertThreeDigits = (num: number): string => {
      let str = '';
      if (num >= 100) {
        str += ONES_EN[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      if (num >= 20) {
        str += TENS_EN[Math.floor(num / 10)] + ' ';
        num %= 10;
      } else if (num >= 10) {
        str += TEENS_EN[num - 10] + ' ';
        num = 0;
      }
      if (num > 0) {
        str += ONES_EN[num] + ' ';
      }
      return str.trim();
    };

    let words = '';
    let thousandIdx = 0;

    while (intNum > 0) {
      const part = intNum % 1000;
      if (part > 0) {
        const partStr = convertThreeDigits(part);
        words = partStr + (THOUSANDS_EN[thousandIdx] ? ' ' + THOUSANDS_EN[thousandIdx] + ' ' : ' ') + words;
      }
      intNum = Math.floor(intNum / 1000);
      thousandIdx++;
    }

    words = words.trim();
    const currencyName =
      currency === 'USD' ? 'US Dollars' : currency === 'EUR' ? 'Euros' : currency === 'GBP' ? 'Pounds' : currency === 'JPY' ? 'Yen' : currency === 'HKD' ? 'Hong Kong Dollars' : 'Yuan';
    const cents = parseInt(decimalStr, 10);
    const centsStr = cents > 0 ? ` and ${cents}/100 Cents` : ' Only';

    return (isNegative ? 'Minus ' : '') + words + ' ' + currencyName + centsStr;
  };

  // 支票出票日期大写
  const toCheckDateCn = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return '-';

    // 年份逐位转
    const yearCn = Array.from(y).map((c) => DIGITS_CN[parseInt(c, 10)]).join('') + '年';

    // 月份 (1~2月需加零，10月为零壹拾月)
    const mNum = parseInt(m, 10);
    let monthCn = '';
    if (mNum <= 2) {
      monthCn = '零' + DIGITS_CN[mNum] + '月';
    } else if (mNum === 10) {
      monthCn = '零壹拾月';
    } else if (mNum > 10) {
      monthCn = '壹拾' + DIGITS_CN[mNum - 10] + '月';
    } else {
      monthCn = DIGITS_CN[mNum] + '月';
    }

    // 日 (1~9日、10日、20日、30日需加零)
    const dNum = parseInt(d, 10);
    let dayCn = '';
    if (dNum <= 9) {
      dayCn = '零' + DIGITS_CN[dNum] + '日';
    } else if (dNum === 10 || dNum === 20 || dNum === 30) {
      dayCn = '零' + (dNum === 10 ? '壹拾' : dNum === 20 ? '贰拾' : '叁拾') + '日';
    } else if (dNum < 20) {
      dayCn = '壹拾' + DIGITS_CN[dNum - 10] + '日';
    } else if (dNum < 30) {
      dayCn = '贰拾' + DIGITS_CN[dNum - 20] + '日';
    } else {
      dayCn = '叁拾' + DIGITS_CN[dNum - 30] + '日';
    }

    return `${yearCn} ${monthCn} ${dayCn}`;
  };

  const numVal = parseFloat(numInput) || 0;
  const cnRmb = toChineseRmb(numVal);
  const enWords = toEnglishWords(numVal);
  const checkDate = toCheckDateCn(dateInput);

  return (
    <ToolPage
      title="全币种数字金额大写与支票格式转换"
      description="整合人民币 (CNY)、美元 (USD)、欧元 (EUR)、英镑 (GBP)、日元 (JPY)、港币 (HKD) 数字转大写，及财务发票支票日期标准大写规范"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 金额转大写 */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              数字金额大写转换
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">输入阿拉伯数字金额</label>
                <input
                  type="text"
                  value={numInput}
                  onChange={(e) => setNumInput(e.target.value)}
                  placeholder="如: 123456.78"
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">币种选择</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'CNY', label: '人民币 (CNY)' },
                    { key: 'USD', label: '美元 (USD)' },
                    { key: 'EUR', label: '欧元 (EUR)' },
                    { key: 'GBP', label: '英镑 (GBP)' },
                    { key: 'HKD', label: '港币 (HKD)' },
                    { key: 'JPY', label: '日元 (JPY)' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCurrency(c.key as any)}
                      className={`py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                        currency === c.key
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 中文大写结果 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>中文财务标准大写:</span>
                  <CopyButton text={cnRmb} />
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm break-all">
                  {cnRmb}
                </div>
              </div>

              {/* 英文大写结果 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>国际英文金额大写:</span>
                  <CopyButton text={enWords} />
                </div>
                <div className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                  {enWords}
                </div>
              </div>
            </div>
          </div>

          {/* 支票出票日期标准大写 */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              银行支票出票日期标准大写
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">选择出票公历日期</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>支票填写标准写法:</span>
                  <CopyButton text={checkDate} />
                </div>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {checkDate}
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-semibold block">填票防伪规范说明：</span>
                <p>• 为防止篡改，月为壹、贰和壹拾的，应当加写“零”（如：零壹拾月）。</p>
                <p>• 日为壹至玖和壹拾、贰拾和叁拾的，应当加写“零”（如：零壹拾日）。</p>
                <p>• 日为拾壹至拾玖的，应当加写“壹”（如：壹拾伍日）。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  );
}

