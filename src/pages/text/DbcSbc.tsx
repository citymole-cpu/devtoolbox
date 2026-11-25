import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'

export default function DbcSbc() {
  const [mode, setMode] = useState<'toHalf' | 'toFull'>('toHalf')
  const [input, setInput] = useState('Ｈｅｌｌｏ　Ｗｏｒｌｄ！这是一段全角数字１２３４５与符号（）。')
  const [output, setOutput] = useState('')

  // Full-width to Half-width
  const toHalfWidth = (str: string): string => {
    let result = ''
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i)
      if (code === 12288) {
        // Space
        result += String.fromCharCode(32)
      } else if (code >= 65281 && code <= 65374) {
        result += String.fromCharCode(code - 65248)
      } else {
        result += str.charAt(i)
      }
    }
    return result
  }

  // Half-width to Full-width
  const toFullWidth = (str: string): string => {
    let result = ''
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i)
      if (code === 32) {
        result += String.fromCharCode(12288)
      } else if (code >= 33 && code <= 126) {
        result += String.fromCharCode(code + 65248)
      } else {
        result += str.charAt(i)
      }
    }
    return result
  }

  const handleConvert = (text: string, m: 'toHalf' | 'toFull') => {
    setInput(text)
    if (!text) {
      setOutput('')
      return
    }
    setOutput(m === 'toHalf' ? toHalfWidth(text) : toFullWidth(text))
  }

  const handleSwap = () => {
    const next = mode === 'toHalf' ? 'toFull' : 'toHalf'
    setMode(next)
    const old = output
    handleConvert(old, next)
  }

  return (
    <ToolPage title="全角半角转换" description="全角字符（SBC）与半角字符（DBC）双向批量互转">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('toHalf'); handleConvert(input, 'toHalf') }}
            className={`btn btn-sm ${mode === 'toHalf' ? 'btn-primary' : 'btn-secondary'}`}
          >
            全角 ➔ 半角
          </button>
          <button
            onClick={() => { setMode('toFull'); handleConvert(input, 'toFull') }}
            className={`btn btn-sm ${mode === 'toFull' ? 'btn-primary' : 'btn-secondary'}`}
          >
            半角 ➔ 全角
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => handleConvert(val, mode)}
          inputLabel={mode === 'toHalf' ? '全角字符输入' : '半角字符输入'}
          outputLabel={mode === 'toHalf' ? '半角转换结果' : '全角转换结果'}
          swappable={true}
          onSwap={handleSwap}
        />
      </div>
    </ToolPage>
  )
}

