import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { DualEditor } from '../../components/DualEditor'

// Common Simplified <-> Traditional Chinese Mapping dictionary
const S_CHARS = '万与丑专业丛东丝丢两严丧个丬丰临为丽举么义乌乐乔习乡书买乱争于亏云亘亚产亩亲亵亸亿仅从仑仓仪们价仿众优伙会伛伞伟传伤伥伦伧伪伫体余佣佥侠侣侥侦侧侨侩侪侬俫仓偬佥债倾偾偿傀偻傴傥傺僖儿兄兰关兴兹养兽冁冈冲决况冻净凄凉凌减凑凛几凤凫凭凯凶出函刍划刘则刚创初删判利别劫刮制刻券刹刺刻刭剃刿剀剁剂剐剑剥剧劝办务劢动励劲劳势勋勐剿劳劝励匦匮区协单卖卤县压厌厍厕厢厦厨厩厮县参双发变叙叠台叶号叹叽吁吃各合吉吊同名后吐向君吝吞吟吠吡吣吻吹呜吻吼吾呀告呐听吮呈呐呢周呻咆咳唾哑咪咬咤咧咨哀品哈哉响哒哗哝哟唤唧倡啼喃善喇喉喊喘唧喧唤喝喱喃啼嗒嘴喜喧喷'
const T_CHARS = '萬與醜專業叢東絲丟兩嚴喪個爿豐臨為麗舉麼義烏樂喬習鄉書買亂爭於虧雲亙亞產畝親褻嚲億僅從侖倉儀們價仿眾優夥會傴傘偉傳傷倀倫傖偽佇體餘傭僉俠侶僥偵側僑儈儕儂倈倉傯僉債傾僨償傀僂傴儻傺僖兒兄蘭關興茲養獸囅岡沖決況凍淨淒涼凌減湊凜幾鳳鳧憑凱兇出函芻劃劉則剛創初刪判利別劫刮制刻券剎刺刻剄剃劌剴剁劑剮劍剝劇勸辦務勱動勵勁勞勢勳猛剿勞勸勵匭匱區協單賣鹵縣壓厭厙廁廂廈廚廄廝縣參雙發變敘疊臺葉號嘆嘰吁吃各合吉吊同名後吐向君吝吞吟吠吡吣吻吹嗚吻吼吾呀告呐聽吮呈吶呢周呻咆咳唾啞咪咬咤咧咨哀品哈哉響噠嘩噥喲喚唧倡啼喃善喇喉喊喘唧喧喚喝喱喃啼嗒嘴喜喧噴'

const s2tDict: Record<string, string> = {}
const t2sDict: Record<string, string> = {}

for (let i = 0; i < S_CHARS.length; i++) {
  s2tDict[S_CHARS[i]] = T_CHARS[i]
  t2sDict[T_CHARS[i]] = S_CHARS[i]
}

export default function ChineseConvert() {
  const [mode, setMode] = useState<'s2t' | 't2s'>('s2t')
  const [input, setInput] = useState('开发者的在线工具箱，让编程更简单、更高效。')
  const [output, setOutput] = useState('')

  const handleConvert = (text: string, m: 's2t' | 't2s') => {
    setInput(text)
    if (!text) {
      setOutput('')
      return
    }

    const dict = m === 's2t' ? s2tDict : t2sDict
    const res = text
      .split('')
      .map(char => dict[char] || char)
      .join('')
    setOutput(res)
  }

  const handleSwap = () => {
    const nextMode = mode === 's2t' ? 't2s' : 's2t'
    setMode(nextMode)
    const oldOut = output
    handleConvert(oldOut, nextMode)
  }

  return (
    <ToolPage title="简繁体中文转换" description="简体中文与繁体中文在线一键快速互转">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('s2t'); handleConvert(input, 's2t') }}
            className={`btn btn-sm ${mode === 's2t' ? 'btn-primary' : 'btn-secondary'}`}
          >
            简体 ➔ 繁体
          </button>
          <button
            onClick={() => { setMode('t2s'); handleConvert(input, 't2s') }}
            className={`btn btn-sm ${mode === 't2s' ? 'btn-primary' : 'btn-secondary'}`}
          >
            繁体 ➔ 简体
          </button>
        </div>

        <DualEditor
          input={input}
          output={output}
          onInputChange={val => handleConvert(val, mode)}
          inputLabel={mode === 's2t' ? '简体中文' : '繁体中文'}
          outputLabel={mode === 's2t' ? '繁体中文' : '简体中文'}
          swappable={true}
          onSwap={handleSwap}
        />
      </div>
    </ToolPage>
  )
}

