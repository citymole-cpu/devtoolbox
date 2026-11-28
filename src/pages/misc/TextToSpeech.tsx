import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { useI18n } from '../../components/I18nProvider'
import {
  TTS_LIMITS,
  TTS_SAMPLES,
  clampPitch,
  clampRate,
  clampVolume,
  computeHighlightRange,
  countVoicesByGroup,
  getTextStats,
  isSpeechSynthesisSupported,
  pickPreferredVoice,
  sortAndFilterVoices,
  type HighlightRange,
  type SampleLang,
  type VoiceLangFilter,
} from '../../lib/textToSpeech'
import {
  AlertCircle,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'

type PlaybackStatus = 'idle' | 'speaking' | 'paused' | 'ended' | 'error'

const LANG_FILTERS: VoiceLangFilter[] = ['all', 'zh', 'en', 'ja', 'other']

export default function TextToSpeech() {
  const { language } = useI18n()

  const supported = useMemo(() => isSpeechSynthesisSupported(), [])

  const [text, setText] = useState<string>(() => {
    if (language === 'en-US') return TTS_SAMPLES[1].text
    if (language === 'ja-JP') return TTS_SAMPLES[2].text
    return TTS_SAMPLES[0].text
  })
  const [rate, setRate] = useState<number>(TTS_LIMITS.rateDefault)
  const [pitch, setPitch] = useState<number>(TTS_LIMITS.pitchDefault)
  const [volume, setVolume] = useState<number>(TTS_LIMITS.volumeDefault)

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [langFilter, setLangFilter] = useState<VoiceLangFilter>('all')
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('')

  const [status, setStatus] = useState<PlaybackStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [highlight, setHighlight] = useState<HighlightRange | null>(null)
  const [boundarySeen, setBoundarySeen] = useState<boolean>(false)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const cancelledByUserRef = useRef<boolean>(false)
  const spokenTextRef = useRef<string>('')

  const ui = useMemo(() => {
    if (language === 'en-US') {
      return {
        unsupportedTitle: 'SpeechSynthesis is not supported in this browser',
        unsupportedDesc:
          'Your current browser or environment does not support the built-in Web Speech Synthesis API. Please try a modern desktop or mobile browser such as Chrome, Edge, Safari, or Firefox.',
        inputTitle: 'Text to Speak',
        placeholder: 'Enter or paste text here to read aloud...',
        samplesLabel: 'Sample Texts',
        clear: 'Clear',
        charsCount: (n: number) => `${n} chars`,
        linesCount: (n: number) => `${n} ${n === 1 ? 'line' : 'lines'}`,
        emptyHint: 'Please enter some text before starting playback.',
        speak: 'Speak',
        pause: 'Pause',
        resume: 'Resume',
        stop: 'Stop',
        controlsTitle: 'Voice & Speech Settings',
        resetSettings: 'Reset',
        voiceLabel: 'Voice',
        voiceDefault: 'System Default Voice',
        voiceLoading: 'Loading browser voices (or using system default)...',
        voiceLocal: 'Local',
        voiceOnline: 'Network',
        filterLabels: {
          all: 'All',
          zh: 'Chinese',
          en: 'English',
          ja: 'Japanese',
          other: 'Other',
        } as Record<VoiceLangFilter, string>,
        rateLabel: 'Rate (Speed)',
        pitchLabel: 'Pitch',
        volumeLabel: 'Volume',
        statusLabels: {
          idle: 'Ready',
          speaking: 'Speaking...',
          paused: 'Paused',
          ended: 'Playback finished',
          error: 'Playback error',
        } as Record<PlaybackStatus, string>,
        errorPrefix: 'Speech synthesis failed: ',
        highlightTitle: 'Live Reading Highlight',
        highlightBoundaryHint:
          'Current spoken word/segment will be highlighted here if supported by the selected voice and browser.',
        highlightWaiting: 'Listening for speech boundary events...',
        privacyNote:
          '100% browser-native window.speechSynthesis — no third-party SDK, no network API, and your text is never uploaded.',
        restartHint: 'Parameter changes take effect on the next playback.',
      }
    }

    if (language === 'ja-JP') {
      return {
        unsupportedTitle: 'お使いのブラウザは SpeechSynthesis に対応していません',
        unsupportedDesc:
          '現在のブラウザ環境では Web Speech API（SpeechSynthesis）が利用できません。Chrome、Edge、Safari、Firefox などの最新ブラウザでお試しください。',
        inputTitle: '読み上げテキスト',
        placeholder: '読み上げたいテキストを入力または貼り付けてください...',
        samplesLabel: 'サンプルテキスト',
        clear: 'クリア',
        charsCount: (n: number) => `${n} 文字`,
        linesCount: (n: number) => `${n} 行`,
        emptyHint: '読み上げを開始するにはテキストを入力してください。',
        speak: '読み上げ',
        pause: '一時停止',
        resume: '再開',
        stop: '停止',
        controlsTitle: '音声・パラメータ設定',
        resetSettings: 'リセット',
        voiceLabel: '音声（話者）',
        voiceDefault: 'システム既定の音声',
        voiceLoading: 'ブラウザの音声リストを読み込み中（または既定音声を使用）...',
        voiceLocal: 'ローカル',
        voiceOnline: 'オンライン',
        filterLabels: {
          all: 'すべて',
          zh: '中国語',
          en: '英語',
          ja: '日本語',
          other: 'その他',
        } as Record<VoiceLangFilter, string>,
        rateLabel: '速度',
        pitchLabel: '音程（ピッチ）',
        volumeLabel: '音量',
        statusLabels: {
          idle: '待機中',
          speaking: '読み上げ中...',
          paused: '一時停止中',
          ended: '読み上げ完了',
          error: '読み上げエラー',
        } as Record<PlaybackStatus, string>,
        errorPrefix: '音声合成エラー: ',
        highlightTitle: 'リアルタイム読み上げハイライト',
        highlightBoundaryHint:
          'ブラウザおよび選択した音声が boundary イベントに対応している場合、現在の読み上げ箇所をハイライト表示します。',
        highlightWaiting: '読み上げ位置の通知を待機中...',
        privacyNote:
          'ブラウザ内蔵の window.speechSynthesis のみを使用します。外部 API への送信やテキストのアップロードは一切行われません。',
        restartHint: 'パラメータの変更は次回の読み上げ開始時に反映されます。',
      }
    }

    return {
      unsupportedTitle: '当前浏览器不支持 SpeechSynthesis 语音合成',
      unsupportedDesc:
        '你当前的浏览器或运行环境不支持原生 Web Speech API（SpeechSynthesis）。建议使用最新版 Chrome、Edge、Safari 或 Firefox 打开本页面。',
      inputTitle: '待朗读文本',
      placeholder: '请输入或粘贴需要朗读的文本内容...',
      samplesLabel: '常用示例',
      clear: '清空',
      charsCount: (n: number) => `${n} 字符`,
      linesCount: (n: number) => `${n} 行`,
      emptyHint: '请先输入文本内容再点击朗读。',
      speak: '朗读',
      pause: '暂停',
      resume: '继续',
      stop: '停止',
      controlsTitle: '朗读参数与发音人',
      resetSettings: '重置参数',
      voiceLabel: '发音人',
      voiceDefault: '系统默认发音人',
      voiceLoading: '正在加载浏览器可用语音列表（或使用系统默认语音）...',
      voiceLocal: '本地',
      voiceOnline: '在线',
      filterLabels: {
        all: '全部',
        zh: '中文',
        en: '英文',
        ja: '日文',
        other: '其他',
      } as Record<VoiceLangFilter, string>,
      rateLabel: '语速',
      pitchLabel: '音调',
      volumeLabel: '音量',
      statusLabels: {
        idle: '就绪',
        speaking: '正在朗读...',
        paused: '已暂停',
        ended: '朗读完成',
        error: '朗读出错',
      } as Record<PlaybackStatus, string>,
      errorPrefix: '语音朗读失败：',
      highlightTitle: '实时朗读高亮',
      highlightBoundaryHint:
        '当浏览器与当前发音人支持 boundary 事件时，此处会实时高亮当前正在朗读的词或片段。',
      highlightWaiting: '等待浏览器返回朗读位置事件...',
      privacyNote:
        '纯浏览器原生 window.speechSynthesis 实现，不引入任何第三方语音 SDK，不联网、不上传文本。',
      restartHint: '调整参数后将在下次点击朗读时生效。',
    }
  }, [language])

  // Load available voices from window.speechSynthesis
  useEffect(() => {
    if (!supported) return

    const synth = window.speechSynthesis
    const loadVoices = () => {
      const list = synth.getVoices()
      if (list.length > 0) {
        setVoices(list)
      }
    }

    loadVoices()
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', loadVoices)
      return () => {
        synth.removeEventListener('voiceschanged', loadVoices)
      }
    } else {
      synth.onvoiceschanged = loadVoices
      return () => {
        synth.onvoiceschanged = null
      }
    }
  }, [supported])

  // Stop speech when unmounting
  useEffect(() => {
    if (!supported) return
    return () => {
      cancelledByUserRef.current = true
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const voiceCounts = useMemo(() => countVoicesByGroup(voices), [voices])
  const filteredVoices = useMemo(
    () => sortAndFilterVoices(voices, langFilter),
    [voices, langFilter]
  )

  // Ensure selectedVoiceURI stays valid when voices load or filter changes
  useEffect(() => {
    if (filteredVoices.length === 0) return
    const exists = filteredVoices.some(v => v.voiceURI === selectedVoiceURI)
    if (!exists && selectedVoiceURI !== '') {
      setSelectedVoiceURI(filteredVoices[0].voiceURI)
    } else if (selectedVoiceURI === '' && voices.length > 0) {
      const target: SampleLang =
        language === 'en-US' ? 'en' : language === 'ja-JP' ? 'ja' : 'zh'
      const preferred = pickPreferredVoice(voices, target) ?? filteredVoices[0]
      if (preferred) {
        setSelectedVoiceURI(preferred.voiceURI)
      }
    }
  }, [filteredVoices, selectedVoiceURI, voices, language])

  const stats = useMemo(() => getTextStats(text), [text])
  const isEmpty = text.trim().length === 0

  const handleStop = useCallback(() => {
    if (!supported) return
    cancelledByUserRef.current = true
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setStatus('idle')
    setErrorMessage('')
    setHighlight(null)
    setBoundarySeen(false)
  }, [supported])

  const handleSpeak = useCallback(() => {
    if (!supported || isEmpty) return

    const synth = window.speechSynthesis
    cancelledByUserRef.current = true
    synth.cancel()

    const targetText = text
    spokenTextRef.current = targetText
    setErrorMessage('')
    setHighlight(null)
    setBoundarySeen(false)

    const utterance = new SpeechSynthesisUtterance(targetText)
    utterance.rate = clampRate(rate)
    utterance.pitch = clampPitch(pitch)
    utterance.volume = clampVolume(volume)

    const chosenVoice = voices.find(v => v.voiceURI === selectedVoiceURI)
    if (chosenVoice) {
      utterance.voice = chosenVoice
      utterance.lang = chosenVoice.lang
    }

    utterance.onstart = () => {
      cancelledByUserRef.current = false
      setStatus('speaking')
    }

    utterance.onpause = () => {
      setStatus('paused')
    }

    utterance.onresume = () => {
      setStatus('speaking')
    }

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      setBoundarySeen(true)
      const range = computeHighlightRange(
        spokenTextRef.current,
        event.charIndex,
        event.charLength
      )
      setHighlight(range)
    }

    utterance.onend = () => {
      utteranceRef.current = null
      if (!cancelledByUserRef.current) {
        setStatus('ended')
        setHighlight(null)
      }
    }

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      utteranceRef.current = null
      if (
        cancelledByUserRef.current ||
        event.error === 'canceled' ||
        event.error === 'interrupted'
      ) {
        setStatus('idle')
        setHighlight(null)
        return
      }
      setStatus('error')
      setErrorMessage(event.error || 'unknown')
      setHighlight(null)
    }

    utteranceRef.current = utterance
    cancelledByUserRef.current = false
    setStatus('speaking')
    synth.speak(utterance)
  }, [supported, isEmpty, text, rate, pitch, volume, voices, selectedVoiceURI])

  const handlePause = useCallback(() => {
    if (!supported || status !== 'speaking') return
    window.speechSynthesis.pause()
    setStatus('paused')
  }, [supported, status])

  const handleResume = useCallback(() => {
    if (!supported || status !== 'paused') return
    window.speechSynthesis.resume()
    setStatus('speaking')
  }, [supported, status])

  const handleLoadSample = useCallback(
    (sampleId: SampleLang) => {
      const sample = TTS_SAMPLES.find(s => s.id === sampleId)
      if (!sample) return
      if (supported && (status === 'speaking' || status === 'paused')) {
        handleStop()
      }
      setText(sample.text)
      setStatus('idle')
      setErrorMessage('')
      setHighlight(null)

      if (voices.length > 0) {
        const preferred = pickPreferredVoice(voices, sampleId)
        if (preferred) {
          setLangFilter('all')
          setSelectedVoiceURI(preferred.voiceURI)
        }
      }
    },
    [supported, status, handleStop, voices]
  )

  const handleClear = useCallback(() => {
    if (supported && (status === 'speaking' || status === 'paused')) {
      handleStop()
    }
    setText('')
    setStatus('idle')
    setErrorMessage('')
    setHighlight(null)
  }, [supported, status, handleStop])

  const handleResetParams = useCallback(() => {
    setRate(TTS_LIMITS.rateDefault)
    setPitch(TTS_LIMITS.pitchDefault)
    setVolume(TTS_LIMITS.volumeDefault)
  }, [])

  const isPlayingOrPaused = status === 'speaking' || status === 'paused'
  const activeTextForHighlight = isPlayingOrPaused ? spokenTextRef.current : text

  return (
    <ToolPage>
      <div className="space-y-6">
        {/* Unsupported browser warning */}
        {!supported && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{ui.unsupportedTitle}</p>
              <p className="text-amber-700 dark:text-amber-300">{ui.unsupportedDesc}</p>
            </div>
          </div>
        )}

        {/* Main 2-column responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Text input + playback controls + highlight */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
              {/* Top bar: title + samples + clear */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-brand-500" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {ui.inputTitle}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {ui.samplesLabel}:
                  </span>
                  {TTS_SAMPLES.map(sample => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleLoadSample(sample.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {sample.label[language] ?? sample.label['zh-CN']}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={text.length === 0}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{ui.clear}</span>
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={text}
                onChange={e => {
                  setText(e.target.value)
                  if (status === 'ended' || status === 'error') {
                    setStatus('idle')
                    setErrorMessage('')
                  }
                }}
                rows={7}
                placeholder={ui.placeholder}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/60 px-4 py-3 text-sm leading-relaxed text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-y"
              />

              {/* Stats & empty hint */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <span>{ui.charsCount(stats.chars)}</span>
                  <span>·</span>
                  <span>{ui.linesCount(stats.lines)}</span>
                </div>
                {isEmpty && (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {ui.emptyHint}
                  </span>
                )}
              </div>

              {/* Playback action buttons & status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpeak}
                    disabled={!supported || isEmpty}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>{ui.speak}</span>
                  </button>

                  {status === 'speaking' ? (
                    <button
                      type="button"
                      onClick={handlePause}
                      disabled={!supported}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                      <span>{ui.pause}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResume}
                      disabled={!supported || status !== 'paused'}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>{ui.resume}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={!supported || !isPlayingOrPaused}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>{ui.stop}</span>
                  </button>
                </div>

                {/* Status pill */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'speaking'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : status === 'paused'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : status === 'ended'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : status === 'error'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {status === 'ended' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                  {status === 'speaking' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <span>
                    {status === 'error' && errorMessage
                      ? `${ui.errorPrefix}${errorMessage}`
                      : ui.statusLabels[status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Highlight Card */}
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {ui.highlightTitle}
                </h2>
                {isPlayingOrPaused && !boundarySeen && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {ui.highlightWaiting}
                  </span>
                )}
              </div>
              <div className="min-h-[84px] max-h-48 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 p-3.5 text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
                {activeTextForHighlight ? (
                  highlight ? (
                    <>
                      <span>{activeTextForHighlight.slice(0, highlight.start)}</span>
                      <mark className="px-0.5 rounded bg-brand-500/25 dark:bg-brand-400/30 text-brand-900 dark:text-brand-100 font-medium">
                        {activeTextForHighlight.slice(highlight.start, highlight.end)}
                      </mark>
                      <span>{activeTextForHighlight.slice(highlight.end)}</span>
                    </>
                  ) : (
                    activeTextForHighlight
                  )
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    {ui.highlightBoundaryHint}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {ui.highlightBoundaryHint}
              </p>
            </div>
          </div>

          {/* Right: Voice selector & sliders */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {ui.controlsTitle}
                </h2>
                <button
                  type="button"
                  onClick={handleResetParams}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{ui.resetSettings}</span>
                </button>
              </div>

              {/* Language filter pills */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                  {ui.voiceLabel}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANG_FILTERS.map(f => {
                    const active = langFilter === f
                    const count = voiceCounts[f]
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setLangFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          active
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {ui.filterLabels[f]} ({count})
                      </button>
                    )
                  })}
                </div>

                {/* Voice select */}
                <select
                  value={selectedVoiceURI}
                  onChange={e => setSelectedVoiceURI(e.target.value)}
                  disabled={!supported || filteredVoices.length === 0}
                  aria-label={ui.voiceLabel}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/60 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 disabled:opacity-50"
                >
                  {filteredVoices.length === 0 ? (
                    <option value="">
                      {voices.length === 0 ? ui.voiceDefault : ui.voiceDefault}
                    </option>
                  ) : (
                    filteredVoices.map(voice => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang}) ·{' '}
                        {voice.localService ? ui.voiceLocal : ui.voiceOnline}
                      </option>
                    ))
                  )}
                </select>
                {supported && voices.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {ui.voiceLoading}
                  </p>
                )}
              </div>

              {/* Rate slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="tts-rate"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    {ui.rateLabel}
                  </label>
                  <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                    {rate.toFixed(1)}x
                  </span>
                </div>
                <input
                  id="tts-rate"
                  type="range"
                  min={TTS_LIMITS.rateMin}
                  max={TTS_LIMITS.rateMax}
                  step={0.1}
                  value={rate}
                  onChange={e => setRate(clampRate(parseFloat(e.target.value)))}
                  disabled={!supported}
                  className="w-full accent-brand-600 cursor-pointer disabled:opacity-40"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>1.5x</span>
                  <span>2.0x</span>
                </div>
              </div>

              {/* Pitch slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="tts-pitch"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    {ui.pitchLabel}
                  </label>
                  <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                    {pitch.toFixed(1)}
                  </span>
                </div>
                <input
                  id="tts-pitch"
                  type="range"
                  min={TTS_LIMITS.pitchMin}
                  max={TTS_LIMITS.pitchMax}
                  step={0.1}
                  value={pitch}
                  onChange={e => setPitch(clampPitch(parseFloat(e.target.value)))}
                  disabled={!supported}
                  className="w-full accent-brand-600 cursor-pointer disabled:opacity-40"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                  <span>0.0</span>
                  <span>1.0</span>
                  <span>2.0</span>
                </div>
              </div>

              {/* Volume slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="tts-volume"
                    className="font-medium text-gray-700 dark:text-gray-300 inline-flex items-center gap-1"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-brand-500" />
                    )}
                    {ui.volumeLabel}
                  </label>
                  <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  id="tts-volume"
                  type="range"
                  min={TTS_LIMITS.volumeMin}
                  max={TTS_LIMITS.volumeMax}
                  step={0.05}
                  value={volume}
                  onChange={e => setVolume(clampVolume(parseFloat(e.target.value)))}
                  disabled={!supported}
                  className="w-full accent-brand-600 cursor-pointer disabled:opacity-40"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                {ui.restartHint}
              </p>
            </div>

            {/* Privacy / offline notice */}
            <div className="flex items-start gap-2.5 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 text-xs text-gray-600 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{ui.privacyNote}</span>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
