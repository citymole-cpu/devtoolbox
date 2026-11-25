// 站内共用的常用汉字 → 拼音映射（源自汉字转拼音工具）。
// 覆盖高频汉字；未收录的汉字按原样返回，调用方自行决定如何处理。
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

export const PINYIN_DICT: Record<string, string> = {}
RAW_PAIRS.trim()
  .split(/\s+/)
  .forEach(pair => {
    const [ch, py] = pair.split(':')
    if (ch && py) PINYIN_DICT[ch] = py
  })

/** 单个汉字转拼音；字典未收录的返回 null。 */
export function charToPinyin(ch: string): string | null {
  return PINYIN_DICT[ch] ?? null
}

/** 整段文本转拼音（全拼，词间以空格分隔）；非汉字与未收录汉字保持原样。 */
export function toPinyin(text: string): string {
  return text
    .split('')
    .map(ch => PINYIN_DICT[ch] ?? ch)
    .join(' ')
    .replace(/\s+([，。！？,.!?])/g, '$1')
}
