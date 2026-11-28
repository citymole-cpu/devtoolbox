import { useMemo, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import {
  calculateContrast,
  parseColorInput,
  type ColorParseError,
} from '../../lib/contrastChecker'
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Eye,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'

interface ColorPreset {
  id: string
  fg: string
  bg: string
  label: {
    'zh-CN': string
    'en-US': string
    'ja-JP': string
  }
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'white-on-black',
    fg: '#FFFFFF',
    bg: '#000000',
    label: { 'zh-CN': '黑底白字', 'en-US': 'White on Black', 'ja-JP': '黒地に白' },
  },
  {
    id: 'black-on-white',
    fg: '#000000',
    bg: '#FFFFFF',
    label: { 'zh-CN': '白底黑字', 'en-US': 'Black on White', 'ja-JP': '白地に黒' },
  },
  {
    id: 'white-on-blue',
    fg: '#FFFFFF',
    bg: '#1D4ED8',
    label: { 'zh-CN': '蓝底白字', 'en-US': 'White on Blue', 'ja-JP': '青地に白' },
  },
  {
    id: 'slate-on-white',
    fg: '#1F2937',
    bg: '#FFFFFF',
    label: { 'zh-CN': '白底深灰', 'en-US': 'Charcoal on White', 'ja-JP': '白地に濃灰' },
  },
  {
    id: 'aa-boundary',
    fg: '#767676',
    bg: '#FFFFFF',
    label: { 'zh-CN': 'AA 边界灰', 'en-US': 'AA Threshold Gray', 'ja-JP': 'AA 境界グレー' },
  },
  {
    id: 'dark-on-yellow',
    fg: '#111827',
    bg: '#FACC15',
    label: { 'zh-CN': '黄底深字', 'en-US': 'Dark on Yellow', 'ja-JP': '黄地に濃字' },
  },
]

export default function ContrastChecker() {
  const { language } = useI18n()

  const [fgInput, setFgInput] = useState('#111827')
  const [bgInput, setBgInput] = useState('#FFFFFF')

  const fgParsed = useMemo(() => parseColorInput(fgInput), [fgInput])
  const bgParsed = useMemo(() => parseColorInput(bgInput), [bgInput])

  const contrast = useMemo(() => {
    if (!fgParsed.ok || !bgParsed.ok) return null
    return calculateContrast(fgParsed.color.rgb, bgParsed.color.rgb)
  }, [fgParsed, bgParsed])

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        fgLabel: 'Foreground (Text Color)',
        bgLabel: 'Background Color',
        colorPlaceholder: 'e.g. #1D4ED8 or rgb(29, 78, 216)',
        swap: 'Swap Colors',
        clear: 'Clear',
        copySummary: 'Copy Result',
        presetsTitle: 'Common Color Presets',
        contrastRatio: 'WCAG Contrast Ratio',
        luminance: 'Relative Luminance',
        fgShort: 'FG',
        bgShort: 'BG',
        pass: 'Pass',
        fail: 'Fail',
        aaNormalTitle: 'WCAG AA · Normal Text',
        aaNormalDesc: 'Requires ≥ 4.5:1 (body text < 18pt / 24px)',
        aaLargeTitle: 'WCAG AA · Large Text',
        aaLargeDesc: 'Requires ≥ 3.0:1 (≥ 18pt / 24px or ≥ 14pt / 18.7px bold)',
        aaaNormalTitle: 'WCAG AAA · Normal Text',
        aaaNormalDesc: 'Requires ≥ 7.0:1 (enhanced readability)',
        aaaLargeTitle: 'WCAG AAA · Large Text',
        aaaLargeDesc: 'Requires ≥ 4.5:1 (enhanced large text)',
        levelLabels: {
          AAA: 'Excellent (AAA)',
          AA: 'Good (AA)',
          'AA-Large': 'Large Text Only (AA)',
          Fail: 'Insufficient Contrast',
        },
        previewTitle: 'Live Readability Preview',
        largeSampleTag: 'Large Text · 24px Bold',
        largeSampleHeading: 'Accessible colors make interfaces effortless to read.',
        normalSampleTag: 'Normal Text · 16px Regular',
        normalSampleBody:
          'Good contrast helps everyone read comfortably across bright screens, dark rooms, and visual impairments. Check both normal body copy and larger headings against WCAG 2.1 AA/AAA thresholds.',
        buttonSample: 'Primary Action',
        emptyHint: 'Enter or pick valid foreground and background colors to calculate WCAG contrast.',
        errors: {
          empty: 'Please enter a color value (HEX or RGB).',
          invalid: 'Invalid color format. Use HEX (e.g. #1D4ED8, #FFF) or RGB (e.g. rgb(29, 78, 216)).',
        } as Record<ColorParseError, string>,
      }
    }

    if (language === 'ja-JP') {
      return {
        fgLabel: '前景色（文字色）',
        bgLabel: '背景色',
        colorPlaceholder: '例: #1D4ED8 または rgb(29, 78, 216)',
        swap: '前景・背景を入替',
        clear: 'クリア',
        copySummary: '結果をコピー',
        presetsTitle: 'よく使う配色プリセット',
        contrastRatio: 'WCAG コントラスト比',
        luminance: '相対輝度',
        fgShort: '前景',
        bgShort: '背景',
        pass: '合格',
        fail: '不合格',
        aaNormalTitle: 'WCAG AA · 通常テキスト',
        aaNormalDesc: '基準 4.5:1 以上（本文 < 18pt / 24px）',
        aaLargeTitle: 'WCAG AA · 大きいテキスト',
        aaLargeDesc: '基準 3.0:1 以上（18pt / 24px 以上、または太字 14pt / 18.7px 以上）',
        aaaNormalTitle: 'WCAG AAA · 通常テキスト',
        aaaNormalDesc: '基準 7.0:1 以上（より高い視認性）',
        aaaLargeTitle: 'WCAG AAA · 大きいテキスト',
        aaaLargeDesc: '基準 4.5:1 以上（大きいテキストの強化基準）',
        levelLabels: {
          AAA: '非常に良好（AAA）',
          AA: '良好（AA）',
          'AA-Large': '大きい文字のみ適合（AA）',
          Fail: 'コントラスト不足',
        },
        previewTitle: 'リアルタイム視認性プレビュー',
        largeSampleTag: '大きいテキスト · 24px 太字',
        largeSampleHeading: '十分なコントラスト比で、誰にとっても読みやすい配色に。',
        normalSampleTag: '通常テキスト · 16px 標準',
        normalSampleBody:
          '適切な文字色と背景色のコントラストは、明るい屋外や暗い環境、色覚特性のあるユーザーにとっても画面を読みやすくします。通常本文と見出しの両方で WCAG 2.1 AA / AAA 基準を確認しましょう。',
        buttonSample: 'サンプルボタン',
        emptyHint: '有効な前景色と背景色を入力または選択すると、WCAG コントラスト比を計算します。',
        errors: {
          empty: 'カラーコードを入力してください（HEX または RGB）。',
          invalid: '色形式が不正です。HEX（例: #1D4ED8、#FFF）または RGB（例: rgb(29, 78, 216)）で入力してください。',
        } as Record<ColorParseError, string>,
      }
    }

    return {
      fgLabel: '前景色（文字色）',
      bgLabel: '背景色',
      colorPlaceholder: '例如 #1D4ED8 或 rgb(29, 78, 216)',
      swap: '交换前景/背景',
      clear: '清空',
      copySummary: '复制结果',
      presetsTitle: '常用配色预设',
      contrastRatio: 'WCAG 对比度',
      luminance: '相对亮度',
      fgShort: '前景',
      bgShort: '背景',
      pass: '通过',
      fail: '未通过',
      aaNormalTitle: 'WCAG AA · 正常文本',
      aaNormalDesc: '要求 ≥ 4.5:1（常规正文 < 18pt / 24px）',
      aaLargeTitle: 'WCAG AA · 大文本',
      aaLargeDesc: '要求 ≥ 3.0:1（≥ 18pt / 24px 或 ≥ 14pt / 18.7px 粗体）',
      aaaNormalTitle: 'WCAG AAA · 正常文本',
      aaaNormalDesc: '要求 ≥ 7.0:1（增强级无障碍标准）',
      aaaLargeTitle: 'WCAG AAA · 大文本',
      aaaLargeDesc: '要求 ≥ 4.5:1（大字号增强级标准）',
      levelLabels: {
        AAA: '极佳（AAA）',
        AA: '良好（AA）',
        'AA-Large': '仅大文本通过（AA）',
        Fail: '对比度不足',
      },
      previewTitle: '实时可读性预览',
      largeSampleTag: '大字号示例 · 24px 粗体',
      largeSampleHeading: '清晰合理的配色对比度，让界面阅读更轻松。',
      normalSampleTag: '正常字号示例 · 16px 常规',
      normalSampleBody:
        '良好的前景色与背景色对比度能够显著提升正文与界面元素的可读性，无论在强光环境、暗光屏幕下还是针对视觉障碍用户都至关重要。可同时对照 WCAG 2.1 的 AA 与 AAA 标准调整配色方案。',
      buttonSample: '示例按钮',
      emptyHint: '请输入或选择有效的前景色与背景色，即可实时计算 WCAG 对比度与评级。',
      errors: {
        empty: '请输入颜色值（支持 HEX 或 RGB 格式）。',
        invalid: '颜色格式无效，请输入 HEX（如 #1D4ED8、#FFF）或 RGB（如 rgb(29, 78, 216)）。',
      } as Record<ColorParseError, string>,
    }
  }, [language])

  const handleSwap = () => {
    setFgInput(bgInput)
    setBgInput(fgInput)
  }

  const handleClear = () => {
    setFgInput('')
    setBgInput('')
  }

  const applyPreset = (preset: ColorPreset) => {
    setFgInput(preset.fg)
    setBgInput(preset.bg)
  }

  const summaryText = useMemo(() => {
    if (!contrast || !fgParsed.ok || !bgParsed.ok) return ''
    const mark = (ok: boolean) => (ok ? ui.pass : ui.fail)
    return [
      `${ui.fgShort}: ${fgParsed.color.hex} (${fgParsed.color.rgbString})`,
      `${ui.bgShort}: ${bgParsed.color.hex} (${bgParsed.color.rgbString})`,
      `${ui.contrastRatio}: ${contrast.ratioText}`,
      `AA Normal: ${mark(contrast.ratings.aaNormal)} | AA Large: ${mark(contrast.ratings.aaLarge)}`,
      `AAA Normal: ${mark(contrast.ratings.aaaNormal)} | AAA Large: ${mark(contrast.ratings.aaaLarge)}`,
    ].join('\n')
  }, [contrast, fgParsed, bgParsed, ui])

  const levelBadgeClass = useMemo(() => {
    if (!contrast) return ''
    switch (contrast.level) {
      case 'AAA':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'AA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'AA-Large':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
    }
  }, [contrast])

  const ratingItems = useMemo(() => {
    if (!contrast) return []
    return [
      {
        key: 'aa-normal',
        title: ui.aaNormalTitle,
        desc: ui.aaNormalDesc,
        passed: contrast.ratings.aaNormal,
      },
      {
        key: 'aa-large',
        title: ui.aaLargeTitle,
        desc: ui.aaLargeDesc,
        passed: contrast.ratings.aaLarge,
      },
      {
        key: 'aaa-normal',
        title: ui.aaaNormalTitle,
        desc: ui.aaaNormalDesc,
        passed: contrast.ratings.aaaNormal,
      },
      {
        key: 'aaa-large',
        title: ui.aaaLargeTitle,
        desc: ui.aaaLargeDesc,
        passed: contrast.ratings.aaaLarge,
      },
    ]
  }, [contrast, ui])

  return (
    <ToolPage>
      <div className="flex flex-col gap-6">
        {/* Color Inputs & Actions */}
        <div className="card p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Foreground */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="fg-color-input" className="label mb-0">
                  {ui.fgLabel}
                </label>
                {fgParsed.ok && (
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {fgParsed.color.hex} · {fgParsed.color.rgbString}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  aria-label={ui.fgLabel}
                  value={fgParsed.ok ? fgParsed.color.hex : '#111827'}
                  onChange={e => setFgInput(e.target.value.toUpperCase())}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700 p-0.5 bg-transparent flex-shrink-0"
                />
                <input
                  id="fg-color-input"
                  type="text"
                  value={fgInput}
                  onChange={e => setFgInput(e.target.value)}
                  placeholder={ui.colorPlaceholder}
                  spellCheck={false}
                  className={`input-field font-mono flex-1 ${
                    !fgParsed.ok && fgInput.trim() !== ''
                      ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
                      : ''
                  }`}
                />
              </div>
              {!fgParsed.ok && 'error' in fgParsed && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{ui.errors[fgParsed.error]}</span>
                </div>
              )}
            </div>

            {/* Background */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="bg-color-input" className="label mb-0">
                  {ui.bgLabel}
                </label>
                {bgParsed.ok && (
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {bgParsed.color.hex} · {bgParsed.color.rgbString}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  aria-label={ui.bgLabel}
                  value={bgParsed.ok ? bgParsed.color.hex : '#FFFFFF'}
                  onChange={e => setBgInput(e.target.value.toUpperCase())}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700 p-0.5 bg-transparent flex-shrink-0"
                />
                <input
                  id="bg-color-input"
                  type="text"
                  value={bgInput}
                  onChange={e => setBgInput(e.target.value)}
                  placeholder={ui.colorPlaceholder}
                  spellCheck={false}
                  className={`input-field font-mono flex-1 ${
                    !bgParsed.ok && bgInput.trim() !== ''
                      ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
                      : ''
                  }`}
                />
              </div>
              {!bgParsed.ok && 'error' in bgParsed && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{ui.errors[bgParsed.error]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSwap}
                className="btn-secondary inline-flex items-center gap-1.5 text-sm"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{ui.swap}</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300"
              >
                <Trash2 className="w-4 h-4" />
                <span>{ui.clear}</span>
              </button>
            </div>

            {contrast && <CopyButton text={summaryText} label={ui.copySummary} />}
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{ui.presetsTitle}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-brand-400 dark:hover:border-brand-500 transition-colors text-xs font-medium"
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-5 rounded text-[11px] font-bold border border-black/15"
                    style={{ backgroundColor: preset.bg, color: preset.fg }}
                  >
                    Aa
                  </span>
                  <span>{preset.label[language]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contrast Score & WCAG Ratings */}
        {contrast && fgParsed.ok && bgParsed.ok ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ratio Summary Card */}
              <div className="card p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {ui.contrastRatio}
                </div>
                <div className="text-5xl font-bold font-mono tracking-tight text-gray-900 dark:text-gray-100">
                  {contrast.ratio.toFixed(2)}
                  <span className="text-2xl font-normal text-gray-400">:1</span>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${levelBadgeClass}`}
                >
                  {ui.levelLabels[contrast.level]}
                </span>
                <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800 w-full flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  <span>
                    {ui.luminance} {ui.fgShort}: {contrast.fgLuminance.toFixed(4)}
                  </span>
                  <span>
                    {ui.bgShort}: {contrast.bgLuminance.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* 4 WCAG Rating Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ratingItems.map(item => (
                  <div
                    key={item.key}
                    className={`card p-4 flex items-start justify-between gap-3 border-l-4 ${
                      item.passed
                        ? 'border-l-emerald-500'
                        : 'border-l-red-500'
                    }`}
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        item.passed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {item.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{item.passed ? ui.pass : ui.fail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <Eye className="w-4 h-4 text-brand-500" />
                  <span>{ui.previewTitle}</span>
                </div>
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {fgParsed.color.hex} / {bgParsed.color.hex}
                </div>
              </div>

              <div
                className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transition-colors flex flex-col gap-6"
                style={{
                  backgroundColor: bgParsed.color.hex,
                  color: fgParsed.color.hex,
                }}
              >
                {/* Large Text Preview */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider opacity-75 font-mono">
                    {ui.largeSampleTag}
                  </span>
                  <h2 className="text-2xl font-bold leading-snug">
                    {ui.largeSampleHeading}
                  </h2>
                </div>

                {/* Normal Text Preview */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider opacity-75 font-mono">
                    {ui.normalSampleTag}
                  </span>
                  <p className="text-base leading-relaxed">
                    {ui.normalSampleBody}
                  </p>
                </div>

                {/* Sample UI Badge/Button */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border"
                    style={{
                      borderColor: fgParsed.color.hex,
                      color: fgParsed.color.hex,
                    }}
                  >
                    {ui.buttonSample}
                  </span>
                  <span className="text-sm font-mono opacity-85">
                    0123456789 · AaBbCc · WCAG 2.1
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="card p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {ui.emptyHint}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
