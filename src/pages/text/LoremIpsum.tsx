import { useState, useCallback } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
  'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis',
  'unde', 'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium',
  'doloremque', 'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae',
  'ab', 'illo', 'inventore', 'veritatis', 'quasi', 'architecto', 'beatae',
  'vitae', 'dicta', 'explicabo', 'aspernatur', 'aut', 'odit', 'fugit', 'sed',
  'quia', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
  'nesciunt', 'neque', 'porro', 'quisquam', 'numquam', 'eius', 'modi', 'tempora',
  'incidunt', 'magnam', 'quaerat', 'adipisci', 'numquam', 'eius', 'modi',
  'tempora', 'incidunt', 'labore', 'dolore', 'magnam', 'aliquam', 'quaerat',
  'voluptatem', 'enim', 'minima', 'veniam', 'nostrum', 'exercitationem',
  'ullam', 'corporis', 'suscipit', 'laboriosam', 'aliquid', 'ex', 'commodi',
  'consequatur', 'autem', 'vel', 'eum', 'iure', 'voluptates', 'esse', 'quam',
  'nihil', 'molestiae', 'illum', 'fuga', 'harum', 'quidem', 'rerum', 'facilis',
  'expedita', 'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis',
  'eligendi', 'optio', 'cumque', 'impedit', 'quo', 'minus', 'quod', 'maxime',
  'placeat', 'facere', 'possimus', 'assumenda', 'repellendus', 'temporibus',
  'autem', 'quibusdam', 'officiis', 'debitis', 'rerum', 'necessitatibus',
  'saepe', 'eveniet', 'voluptates', 'repudiandae', 'sint', 'molestiae',
  'recusandae', 'itaque', 'earum', 'rerum', 'hic', 'tenetur', 'sapiente',
  'delectus', 'reiciendis', 'voluptatibus', 'maiores', 'alias', 'consequatur',
  'perferendis', 'doloribus', 'asperiores', 'repellat', 'odio', 'dignissimos',
  'ducimus', 'blanditiis', 'praesentium', 'voluptatum', 'deleniti', 'atque',
  'corrupti', 'quos', 'quas', 'molestias', 'excepturi', 'obcaecati', 'cupiditate',
  'provident', 'similique', 'culpa', 'officia', 'mollitia', 'animi', 'laborum',
  'dolorum', 'fuga', 'et', 'harum', 'quidem', 'rerum', 'facilis', 'est',
]

const CLASSIC_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

function makeSentence(minWords = 5, maxWords = 14): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1))
  const words = Array.from({ length: count }, randomWord)
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(' ') + '.'
}

function makeParagraph(minSentences = 3, maxSentences = 6): string {
  const count = minSentences + Math.floor(Math.random() * (maxSentences - minSentences + 1))
  return Array.from({ length: count }, () => makeSentence()).join(' ')
}

type GenType = 'paragraphs' | 'sentences' | 'words'

export default function LoremIpsum() {
  const [type, setType] = useState<GenType>('paragraphs')
  const [count, setCount] = useState(3)
  const [classicStart, setClassicStart] = useState(true)
  const [output, setOutput] = useState('')

  const generate = useCallback(() => {
    const n = Math.max(1, Math.min(100, count || 1))
    let text = ''
    if (type === 'paragraphs') {
      const paras = Array.from({ length: n }, () => makeParagraph())
      if (classicStart && paras.length > 0) {
        paras[0] = `${CLASSIC_START} ${paras[0]}`
      }
      text = paras.join('\n\n')
    } else if (type === 'sentences') {
      const sentences = Array.from({ length: n }, () => makeSentence())
      if (classicStart && sentences.length > 0) sentences[0] = CLASSIC_START
      text = sentences.join(' ')
    } else {
      const words = Array.from({ length: n }, randomWord)
      if (classicStart) {
        text = `lorem ipsum dolor sit amet ${words.join(' ')}`
      } else {
        text = words.join(' ')
      }
      text = text.charAt(0).toUpperCase() + text.slice(1)
    }
    setOutput(text)
  }, [type, count, classicStart])

  const maxCount = type === 'words' ? 100 : type === 'sentences' ? 50 : 20

  return (
    <ToolPage title="Lorem Ipsum 生成器" description="一键生成英文占位文本（段落 / 句子 / 单词），用于排版、原型与设计稿填充">
      <div className="flex flex-col gap-6">
        {/* 选项 */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                生成类型
              </label>
              <div className="flex gap-2">
                {(
                  [
                    ['paragraphs', '段落'],
                    ['sentences', '句子'],
                    ['words', '单词'],
                  ] as [GenType, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setType(value)
                      setCount(value === 'paragraphs' ? 3 : value === 'sentences' ? 5 : 50)
                    }}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      type === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-sm font-medium mb-2">
                <span className="text-gray-700 dark:text-gray-300">
                  数量：{count} {type === 'paragraphs' ? '段' : type === 'sentences' ? '句' : '词'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={maxCount}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1</span>
                <span>{maxCount}</span>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none mt-5">
            <input
              type="checkbox"
              checked={classicStart}
              onChange={e => setClassicStart(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span>以经典开头 “Lorem ipsum dolor sit amet...” 开始</span>
          </label>
          <div className="mt-5">
            <button
              onClick={generate}
              className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              生成占位文本
            </button>
          </div>
        </div>

        {/* 输出 */}
        {output && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">生成结果</span>
              <CopyButton text={output} label="复制全部" />
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output}
            </div>
          </div>
        )}

        {!output && (
          <div className="card p-6 text-sm text-gray-500 dark:text-gray-400">
            选择生成类型和数量，点击「生成占位文本」。Lorem Ipsum 是出版与设计行业沿用数百年的标准占位文本，常用于在内容未定稿时预览版式效果。
          </div>
        )}
      </div>
    </ToolPage>
  )
}
