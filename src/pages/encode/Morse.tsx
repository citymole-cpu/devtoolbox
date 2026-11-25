import { useState, useRef } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'
import { Volume2 } from 'lucide-react'

const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', ' ': '/',
}

const REVERSE_MORSE: Record<string, string> = Object.entries(MORSE_MAP).reduce((acc, [char, code]) => {
  acc[code] = char
  return acc
}, {} as Record<string, string>)

export default function Morse() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('SOS MAYDAY')
  const [output, setOutput] = useState('... --- ... / -- .- -.-- -.. .- -.--')
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const handleConvert = (text: string, currentMode: 'encode' | 'decode') => {
    setInput(text)
    if (!text.trim()) {
      setOutput('')
      return
    }

    if (currentMode === 'encode') {
      const upper = text.toUpperCase()
      const res = upper
        .split('')
        .map(c => MORSE_MAP[c] || c)
        .join(' ')
      setOutput(res)
    } else {
      // Decode
      const tokens = text.trim().split(/\s+/)
      const res = tokens
        .map(t => REVERSE_MORSE[t] || (t === '/' ? ' ' : t))
        .join('')
      setOutput(res)
    }
  }

  const playMorseSound = async () => {
    if (isPlaying) return
    setIsPlaying(true)

    const morseCode = mode === 'encode' ? output : input
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      audioCtxRef.current = ctx

      const dotDuration = 0.08
      let time = ctx.currentTime + 0.1

      for (const symbol of morseCode) {
        if (symbol === '.') {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.frequency.value = 650
          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(time)
          osc.stop(time + dotDuration)
          time += dotDuration + 0.05
        } else if (symbol === '-') {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.frequency.value = 650
          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(time)
          osc.stop(time + dotDuration * 3)
          time += dotDuration * 3 + 0.05
        } else if (symbol === ' ' || symbol === '/') {
          time += dotDuration * 4
        }
      }

      setTimeout(() => {
        setIsPlaying(false)
        ctx.close()
      }, (time - ctx.currentTime) * 1000 + 300)
    } catch {
      setIsPlaying(false)
    }
  }

  const handleSwap = () => {
    const nextMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(nextMode)
    const oldOut = output
    handleConvert(oldOut, nextMode)
  }

  return (
    <ToolPage title="摩斯密码编解码" description="文本与莫尔斯电码(Morse Code)双向互转，支持音频模拟电报发声">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMode('encode'); handleConvert(input, 'encode') }}
              className={`btn btn-sm ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}
            >
              文本 ➔ 摩斯电码
            </button>
            <button
              onClick={() => { setMode('decode'); handleConvert(input, 'decode') }}
              className={`btn btn-sm ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
            >
              摩斯电码 ➔ 文本
            </button>
          </div>

          <button
            onClick={playMorseSound}
            disabled={isPlaying}
            className="btn-secondary btn-sm flex items-center gap-1.5 text-brand-600 dark:text-brand-400"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlaying ? '正在电报发声...' : '试听电报发声'}</span>
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => handleConvert(val, mode)}
          inputLabel={mode === 'encode' ? '输入明文 (英文/数字)' : '输入摩斯电码 (点 . 和 划 -)'}
          outputLabel={mode === 'encode' ? '摩斯电码输出' : '解码后的明文'}
          swappable={true}
          onSwap={handleSwap}
        />
      </div>
    </ToolPage>
  )
}

