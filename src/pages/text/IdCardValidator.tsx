import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import CopyButton from '../../components/CopyButton';
import { CreditCard, CheckCircle2, AlertCircle, Calendar, MapPin, User, Download } from 'lucide-react';

const PROVINCES: Record<string, string> = {
  '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省', '15': '内蒙古自治区',
  '21': '辽宁省', '22': '吉林省', '23': '黑龙江省',
  '31': '上海市', '32': '江苏省', '33': '浙江省', '34': '安徽省', '35': '福建省', '36': '江西省', '37': '山东省',
  '41': '河南省', '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西壮族自治区', '46': '海南省',
  '50': '重庆市', '51': '四川省', '52': '贵州省', '53': '云南省', '54': '西藏自治区',
  '61': '陕西省', '62': '甘肃省', '63': '青海省', '64': '宁夏回族自治区', '65': '新疆维吾尔自治区',
  '71': '台湾省', '81': '香港特别行政区', '82': '澳门特别行政区'
};

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

interface IdCardInfo {
  cardNo: string;
  isValid: boolean;
  reason?: string;
  province?: string;
  birthday?: string;
  gender?: string;
  age?: number;
}

export default function IdCardValidator() {
  const [inputText, setInputText] = useState<string>(
    '110101199003072379\n31010119850615122X\n440106199512013456\n123456789012345678'
  );

  const validateCard = (id: string): IdCardInfo => {
    const card = id.trim().toUpperCase();
    if (!card) {
      return { cardNo: id, isValid: false, reason: '号码为空' };
    }
    if (card.length !== 18) {
      return { cardNo: card, isValid: false, reason: `位数错误 (${card.length}位，应为18位)` };
    }

    // 格式检查
    if (!/^\d{17}[\dX]$/.test(card)) {
      return { cardNo: card, isValid: false, reason: '含有非法字符' };
    }

    // 省份检查
    const provCode = card.substring(0, 2);
    const province = PROVINCES[provCode];
    if (!province) {
      return { cardNo: card, isValid: false, reason: '前2位行政区划代码不存在' };
    }

    // 出生日期检查
    const year = parseInt(card.substring(6, 10), 10);
    const month = parseInt(card.substring(10, 12), 10);
    const day = parseInt(card.substring(12, 14), 10);
    const birthDate = new Date(year, month - 1, day);
    const now = new Date();

    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() + 1 !== month ||
      birthDate.getDate() !== day ||
      birthDate > now ||
      year < 1900
    ) {
      return { cardNo: card, isValid: false, reason: '出生日期无效或不合常理' };
    }

    // ISO 7064:1983.MOD 11-2 校验码验证
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(card[i], 10) * WEIGHTS[i];
    }
    const checkIndex = sum % 11;
    const expectedCheck = CHECK_CODES[checkIndex];
    if (card[17] !== expectedCheck) {
      return { cardNo: card, isValid: false, reason: `校验位错误 (末位实际为${card[17]}，应为${expectedCheck})` };
    }

    // 计算性别与年龄
    const genderDigit = parseInt(card.substring(16, 17), 10);
    const gender = genderDigit % 2 === 1 ? '男' : '女';

    let age = now.getFullYear() - year;
    const mDiff = now.getMonth() - (month - 1);
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < day)) {
      age--;
    }

    const formattedBirth = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      cardNo: card,
      isValid: true,
      province,
      birthday: formattedBirth,
      gender,
      age,
    };
  };

  const results: IdCardInfo[] = inputText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(validateCard);

  const validCount = results.filter((r) => r.isValid).length;

  const exportCsv = () => {
    const header = '身份证号,校验结果,失败原因,归属省份,出生日期,性别,年龄\n';
    const rows = results
      .map(
        (r) =>
          `"${r.cardNo}","${r.isValid ? '有效' : '无效'}","${r.reason || '-'}","${r.province || '-'}","${r.birthday || '-'}","${r.gender || '-'}","${r.age ?? '-'}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idcard_validation_${Date.now()}.csv`;
    a.click();
  };

  return (
    <ToolPage
      title="身份证号码合规校验与生日归属地提取"
      description="批量校验中华人民共和国18位二代身份证合规性，严格验证 ISO 7064:1983.MOD 11-2 校验码，提取出生日期、性别、年龄与省市行政区划"
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              待校验的身份证号码列表（每行一个，支持批量粘贴）
            </label>
            <div className="text-xs text-slate-500">
              共 <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{results.length}</span> 条，
              有效 <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{validCount}</span> 条
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            placeholder="每行输入一个身份证号码..."
            className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={exportCsv}
              disabled={results.length === 0}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              导出分析结果 (CSV)
            </button>
          </div>
        </div>

        {/* 校验与解析结果清单 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>识别与解析结果明细</span>
            <span>严格本地执行 · 零数据联网上传</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">身份证号码</th>
                  <th className="p-3">校验结论</th>
                  <th className="p-3">归属省份</th>
                  <th className="p-3">出生日期</th>
                  <th className="p-3">性别</th>
                  <th className="p-3">年龄</th>
                  <th className="p-3">异常说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((res, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {res.cardNo}
                    </td>
                    <td className="p-3">
                      {res.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          合规有效
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="w-3 h-3" />
                          不合法
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {res.province ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {res.province}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                      {res.birthday ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          {res.birthday}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3">
                      {res.gender ? (
                        <span
                          className={`font-medium ${
                            res.gender === '男' ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'
                          }`}
                        >
                          {res.gender}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                      {res.age !== undefined ? `${res.age} 岁` : '-'}
                    </td>
                    <td className="p-3 text-rose-500 text-[11px]">
                      {res.reason || '-'}
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

