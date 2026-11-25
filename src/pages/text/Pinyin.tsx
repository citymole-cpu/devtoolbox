import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'

// Common Chinese character to Pinyin dictionary
const RAW_PAIRS = `
我:wo 的:de 一:yi 是:shi 在:zai 不:bu 了:le 有:you 和:he 人:ren 这:zhe 中:zhong 大:da 为:wei
上:shang 个:ge 国:guo 到:dao 说:shuo 们:men 要:yao 自:zi 会:hui 那:na 后:hou 能:neng 对:dui
着:zhe 事:shi 其:qi 里:li 所:suo 去:qu 行:xing 过:guo 家:jia 十:shi 用:yong 发:fa 天:tian
如:ru 然:ran 作:zuo 方:fang 成:cheng 者:zhe 多:duo 日:ri 都:dou 三:san 小:xiao 军:jun 二:er
无:wu 同:tong 么:me 经:jing 法:fa 当:dang 起:qi 与:yu 好:hao 看:kan 学:xue 进:jin 种:zhong
将:jiang 还:hai 分:fen 此:ci 心:xin 前:qian 面:mian 又:you 定:ding 见:jian 只:zhi 主:zhu
没:mei 公:gong 从:cong 开:kai 动:dong 它:ta 想:xiang 实:shi 样:yang 理:li 意:yi 现:xian
工:gong 具:ju 箱:xiang 北:bei 京:jing 海:hai 广:guang 州:zhou 深:shen 圳:zhen 你:ni 世:shi
界:jie 欢:huan 迎:ying 使:shi 线:xian 测:ce 试:shi 转:zhuan 换:huan 编:bian 码:ma 加:jia
密:mi 解:jie 网:wang 络:luo 文:wen 字:zi 符:fu 图:tu 片:pian 处:chu 表:biao 单:dan
`

const PINYIN_DICT: Record<string, string> = {}
RAW_PAIRS.trim().split(/\s+/).forEach(pair => {
  const [ch, py] = pair.split(':')
  if (ch && py) PINYIN_DICT[ch] = py
})

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
