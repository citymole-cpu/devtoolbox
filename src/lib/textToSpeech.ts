export type VoiceLangFilter = 'all' | 'zh' | 'en' | 'ja' | 'other'
export type SampleLang = 'zh' | 'en' | 'ja'

export interface VoiceLike {
  voiceURI: string
  name: string
  lang: string
  localService: boolean
  default: boolean
}

export interface HighlightRange {
  start: number
  end: number
}

export interface TtsSample {
  id: SampleLang
  langTag: string
  text: string
  label: {
    'zh-CN': string
    'en-US': string
    'ja-JP': string
  }
}

export const TTS_LIMITS = {
  rateMin: 0.5,
  rateMax: 2.0,
  rateDefault: 1.0,
  pitchMin: 0,
  pitchMax: 2.0,
  pitchDefault: 1.0,
  volumeMin: 0,
  volumeMax: 1.0,
  volumeDefault: 1.0,
} as const

export const TTS_SAMPLES: TtsSample[] = [
  {
    id: 'zh',
    langTag: 'zh-CN',
    text: '你好，欢迎使用 DevToolBox 文本转语音工具。所有语音合成均由浏览器内置 SpeechSynthesis 完成，无需联网，文本不会上传到任何服务器。你可以自由调节语速、音调、音量并切换不同发音人。',
    label: {
      'zh-CN': '中文示例',
      'en-US': 'Chinese Sample',
      'ja-JP': '中国語サンプル',
    },
  },
  {
    id: 'en',
    langTag: 'en-US',
    text: 'Hello! Welcome to the DevToolBox Text-to-Speech tool. Everything runs locally using your browser built-in SpeechSynthesis API with zero server uploads. Adjust the speed, pitch, volume, and voice to test natural playback.',
    label: {
      'zh-CN': '英文示例',
      'en-US': 'English Sample',
      'ja-JP': '英語サンプル',
    },
  },
  {
    id: 'ja',
    langTag: 'ja-JP',
    text: 'こんにちは、DevToolBox のテキスト読み上げツールへようこそ。ブラウザ内蔵の SpeechSynthesis を使用してローカルで読み上げるため、入力した文章はサーバーに送信されません。速度・音程・音量・音声を自由に調整できます。',
    label: {
      'zh-CN': '日文示例',
      'en-US': 'Japanese Sample',
      'ja-JP': '日本語サンプル',
    },
  },
]

export function isSpeechSynthesisSupported(win: unknown = typeof window !== 'undefined' ? window : undefined): boolean {
  if (!win || typeof win !== 'object') return false
  const w = win as Record<string, unknown>
  const synth = w.speechSynthesis
  const utteranceCtor = w.SpeechSynthesisUtterance
  return (
    typeof synth === 'object' &&
    synth !== null &&
    typeof (synth as SpeechSynthesis).speak === 'function' &&
    typeof (synth as SpeechSynthesis).cancel === 'function' &&
    typeof utteranceCtor === 'function'
  )
}

export function clampRate(value: number): number {
  if (!Number.isFinite(value)) return TTS_LIMITS.rateDefault
  return Math.min(TTS_LIMITS.rateMax, Math.max(TTS_LIMITS.rateMin, Math.round(value * 100) / 100))
}

export function clampPitch(value: number): number {
  if (!Number.isFinite(value)) return TTS_LIMITS.pitchDefault
  return Math.min(TTS_LIMITS.pitchMax, Math.max(TTS_LIMITS.pitchMin, Math.round(value * 100) / 100))
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return TTS_LIMITS.volumeDefault
  return Math.min(TTS_LIMITS.volumeMax, Math.max(TTS_LIMITS.volumeMin, Math.round(value * 100) / 100))
}

export function getVoiceLangGroup(lang: string): Exclude<VoiceLangFilter, 'all'> {
  const normalized = (lang || '').trim().toLowerCase()
  if (normalized.startsWith('zh') || normalized.startsWith('cmn') || normalized.startsWith('yue')) {
    return 'zh'
  }
  if (normalized.startsWith('en')) {
    return 'en'
  }
  if (normalized.startsWith('ja') || normalized.startsWith('jp')) {
    return 'ja'
  }
  return 'other'
}

const LANG_PRIORITY: Record<Exclude<VoiceLangFilter, 'all'>, number> = {
  zh: 0,
  en: 1,
  ja: 2,
  other: 3,
}

export function sortAndFilterVoices<T extends VoiceLike>(
  voices: readonly T[],
  filter: VoiceLangFilter = 'all'
): T[] {
  const filtered =
    filter === 'all'
      ? [...voices]
      : voices.filter(v => getVoiceLangGroup(v.lang) === filter)

  return filtered.sort((a, b) => {
    const pa = LANG_PRIORITY[getVoiceLangGroup(a.lang)]
    const pb = LANG_PRIORITY[getVoiceLangGroup(b.lang)]
    if (pa !== pb) return pa - pb

    if (a.default !== b.default) return a.default ? -1 : 1
    if (a.localService !== b.localService) return a.localService ? -1 : 1

    const langCmp = a.lang.localeCompare(b.lang)
    if (langCmp !== 0) return langCmp
    return a.name.localeCompare(b.name)
  })
}

export function countVoicesByGroup(voices: readonly VoiceLike[]): Record<VoiceLangFilter, number> {
  const counts: Record<VoiceLangFilter, number> = {
    all: voices.length,
    zh: 0,
    en: 0,
    ja: 0,
    other: 0,
  }
  for (const voice of voices) {
    const group = getVoiceLangGroup(voice.lang)
    counts[group] += 1
  }
  return counts
}

export function pickPreferredVoice<T extends VoiceLike>(
  voices: readonly T[],
  target: SampleLang
): T | undefined {
  const matched = sortAndFilterVoices(voices, target)
  return matched[0]
}

const CJK_CHAR_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/
const SEPARATOR_RE = /[\s,.!?;:，。！？；：、\n\r\t()[\]{}"'「」『』（）【】]/

export function computeHighlightRange(
  text: string,
  charIndex: number,
  charLength?: number
): HighlightRange | null {
  if (!text || charIndex < 0 || charIndex >= text.length) {
    return null
  }

  if (typeof charLength === 'number' && Number.isFinite(charLength) && charLength > 0) {
    return {
      start: charIndex,
      end: Math.min(text.length, charIndex + charLength),
    }
  }

  // Fallback when browser boundary event omits charLength
  let end = charIndex + 1
  const firstChar = text[charIndex]
  if (CJK_CHAR_RE.test(firstChar)) {
    // Highlight up to punctuation/whitespace or at most 8 characters for readability
    const maxEnd = Math.min(text.length, charIndex + 8)
    while (end < maxEnd && !SEPARATOR_RE.test(text[end])) {
      end += 1
    }
  } else if (!SEPARATOR_RE.test(firstChar)) {
    while (end < text.length && !SEPARATOR_RE.test(text[end])) {
      end += 1
    }
  }

  return { start: charIndex, end }
}

export function getTextStats(text: string): { chars: number; nonWhitespaceChars: number; lines: number } {
  if (!text) {
    return { chars: 0, nonWhitespaceChars: 0, lines: 0 }
  }
  const nonWhitespaceChars = text.replace(/\s/g, '').length
  const lines = text.split(/\r\n|\r|\n/).length
  return {
    chars: text.length,
    nonWhitespaceChars,
    lines,
  }
}
