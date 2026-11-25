import React, { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { HeartPulse, Activity, User, Users, Flame } from 'lucide-react';

// ABO 血型遗传规律对照表
const BLOOD_TYPE_RULES: Record<string, { possible: string[]; impossible: string[] }> = {
  'A+A': { possible: ['A型', 'O型'], impossible: ['B型', 'AB型'] },
  'A+B': { possible: ['A型', 'B型', 'AB型', 'O型'], impossible: ['无 (全皆有可能)'] },
  'A+AB': { possible: ['A型', 'B型', 'AB型'], impossible: ['O型'] },
  'A+O': { possible: ['A型', 'O型'], impossible: ['B型', 'AB型'] },
  'B+B': { possible: ['B型', 'O型'], impossible: ['A型', 'AB型'] },
  'B+AB': { possible: ['A型', 'B型', 'AB型'], impossible: ['O型'] },
  'B+O': { possible: ['B型', 'O型'], impossible: ['A型', 'AB型'] },
  'AB+AB': { possible: ['A型', 'B型', 'AB型'], impossible: ['O型'] },
  'AB+O': { possible: ['A型', 'B型'], impossible: ['AB型', 'O型'] },
  'O+O': { possible: ['O型'], impossible: ['A型', 'B型', 'AB型'] },
};

export default function HealthCalculator() {
  const [activeTab, setActiveTab] = useState<'bmi' | 'bmr' | 'blood'>('bmi');

  // BMI & BMR 状态
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // 轻度活动

  // 血型推算
  const [fatherBlood, setFatherBlood] = useState<string>('A');
  const [motherBlood, setMotherBlood] = useState<string>('B');

  // BMI 计算
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;

  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { label: '偏瘦 (体重过低)', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' };
    if (val < 24.0) return { label: '正常健康体重', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' };
    if (val < 28.0) return { label: '超重 (注意运动饮食)', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' };
    return { label: '肥胖 (建议咨询健康医生)', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' };
  };

  const bmiStatus = getBmiStatus(bmi);

  // BMR (Mifflin-St Jeor 公式)
  // 男: 10 * weight + 6.25 * height - 5 * age + 5
  // 女: 10 * weight + 6.25 * height - 5 * age - 161
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = Math.round(bmr * activityLevel);

  // 血型规律计算
  const bloodKey = [fatherBlood, motherBlood].sort().join('+');
  const bloodResult = BLOOD_TYPE_RULES[bloodKey] || { possible: ['未知'], impossible: ['未知'] };

  return (
    <ToolPage
      title="身体健康指数 (BMI / BMR) 与血型遗传推算"
      description="中国卫健委标准 BMI 体质指数评估、Mifflin-St Jeor 基础代谢率与每日总消耗 TDEE 计算、父母子女 ABO 血型遗传规律推算"
    >
      <div className="space-y-6">
        {/* 顶部 Tab */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
          {[
            { key: 'bmi', label: 'BMI 身体质量指数' },
            { key: 'bmr', label: 'BMR 基础代谢与 TDEE 每日消耗' },
            { key: 'blood', label: 'ABO 父母子女血型遗传推算' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as any)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                activeTab === item.key
                  ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* BMI & BMR 面板 */}
        {(activeTab === 'bmi' || activeTab === 'bmr') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">身体基本指标设定</span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">身高 (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">体重 (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {activeTab === 'bmr' && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">年龄 (岁)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">生理性别</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGender('male')}
                        className={`flex-1 py-1.5 text-xs rounded-lg border ${
                          gender === 'male' ? 'bg-blue-500 text-white border-blue-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        男
                      </button>
                      <button
                        onClick={() => setGender('female')}
                        className={`flex-1 py-1.5 text-xs rounded-lg border ${
                          gender === 'female' ? 'bg-pink-500 text-white border-pink-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        女
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bmr' && (
                <div>
                  <label className="text-xs text-slate-500 block mb-1">日常活动量 (用于计算 TDEE)</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value={1.2}>久坐不动 (办公室办公、很少运动)</option>
                    <option value={1.375}>轻度活动 (每周运动 1-3 天)</option>
                    <option value={1.55}>中度活动 (每周中等运动 3-5 天)</option>
                    <option value={1.725}>积极运动 (每周高强度运动 6-7 天)</option>
                  </select>
                </div>
              )}
            </div>

            {/* 结果显示 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center space-y-4">
              {activeTab === 'bmi' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">BMI 指数结果</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${bmiStatus.bg} ${bmiStatus.color}`}>
                      {bmiStatus.label}
                    </span>
                  </div>
                  <div className="text-5xl font-black text-slate-800 dark:text-slate-100 font-mono">
                    {bmi.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <p>• 偏瘦: &lt; 18.5</p>
                    <p>• 正常健康: 18.5 ~ 23.9</p>
                    <p>• 超重: 24.0 ~ 27.9</p>
                    <p>• 肥胖: &ge; 28.0</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block mb-1">基础代谢率 (BMR)</span>
                    <div className="text-4xl font-black text-blue-600 dark:text-blue-400 font-mono">
                      {Math.round(bmr)} <span className="text-sm font-normal text-slate-500">kcal/天</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">躺着不动人体维持呼吸心跳所需最低热量</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">每日总能量消耗 (TDEE)</span>
                    <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {tdee} <span className="text-sm font-normal text-slate-500">kcal/天</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">保持当前体重不变每日所需摄入卡路里推荐值</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 血型遗传推算面板 */}
        {activeTab === 'blood' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">选择父母 ABO 血型</span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">父亲血型</label>
                  <select
                    value={fatherBlood}
                    onChange={(e) => setFatherBlood(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="A">A 型</option>
                    <option value="B">B 型</option>
                    <option value="AB">AB 型</option>
                    <option value="O">O 型</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">母亲血型</label>
                  <select
                    value={motherBlood}
                    onChange={(e) => setMotherBlood(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="A">A 型</option>
                    <option value="B">B 型</option>
                    <option value="AB">AB 型</option>
                    <option value="O">O 型</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">子女血型推算结果</span>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  子女可能出现的血型:
                </span>
                <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  {bloodResult.possible.join('、 ')}
                </div>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                  子女不可能出现的血型:
                </span>
                <div className="text-xl font-bold text-rose-800 dark:text-rose-200">
                  {bloodResult.impossible.join('、 ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}

