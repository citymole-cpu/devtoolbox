import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'
import { PINYIN_DICT } from '../../lib/pinyin'

export default function Pinyin() {
  const [input, setInput] = useState('开发者在线工具箱，你好世界！')
  const [mode, setMode] = useState<'full' | 'firstLetter' | 'capitalized'>('full')
  const [output, setOutput] = useState('')

  const convertPinyin = (text: string, currentMode: 'full' | 'firstLetter' | 'capitalized') => {
    setInput(text)
    if (!text.trim()) {
      setOutput('')
      return
    }

    const chars = text.split('')
    const result: string[] = []

    for (const char of chars) {
      const py = PINYIN_DICT[char]
      if (py) {
        if (currentMode === 'firstLetter') {
          result.push(py.charAt(0).toUpperCase())
        } else if (currentMode === 'capitalized') {
          result.push(py.charAt(0).toUpperCase() + py.slice(1))
        } else {
          result.push(py)
        }
      } else {
        result.push(char)
      }
    }

    const sep = currentMode === 'firstLetter' ? '' : ' '
    setOutput(result.join(sep).replace(/\s+([，。！？,.!?])/g, '$1'))
  }

  return (
    <ToolPage title="汉字转拼音" description="中文汉字在线快速转换为拼音、首字母缩写与大写驼峰拼音">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('full'); convertPinyin(input, 'full') }}
            className={`btn btn-sm ${mode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
          >
            普通全拼 (带空格)
          </button>
          <button
            onClick={() => { setMode('capitalized'); convertPinyin(input, 'capitalized') }}
            className={`btn btn-sm ${mode === 'capitalized' ? 'btn-primary' : 'btn-secondary'}`}
          >
            首字母大写 (驼峰)
          </button>
          <button
            onClick={() => { setMode('firstLetter'); convertPinyin(input, 'firstLetter') }}
            className={`btn btn-sm ${mode === 'firstLetter' ? 'btn-primary' : 'btn-secondary'}`}
          >
            拼音首字母缩写
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => convertPinyin(val, mode)}
          inputLabel="输入汉字文本"
          outputLabel="拼音输出结果"
        />
      </div>
    </ToolPage>
  )
}
