import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Wand2, Download } from 'lucide-react'
import { downloadFile } from '../../lib/utils'

const SURNAMES = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜'
const NAMES = '伟刚勇毅俊峰强军平保东文辉力明永健世广志义兴良海山仁波宁贵福生龙元'
const CITIES = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市', '南京市']

function getRandomChineseName() {
  const s = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
  const n1 = NAMES[Math.floor(Math.random() * NAMES.length)]
  const n2 = Math.random() > 0.4 ? NAMES[Math.floor(Math.random() * NAMES.length)] : ''
  return s + n1 + n2
}

function getRandomPhone() {
  const prefixes = ['138', '139', '150', '158', '186', '188', '199', '177']
  const p = prefixes[Math.floor(Math.random() * prefixes.length)]
  const rest = Math.floor(10000000 + Math.random() * 90000000).toString()
  return p + rest
}

function getRandomDate() {
  const d = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 3600 * 1000))
  return d.toISOString().split('T')[0]
}

export default function MockGenerator() {
  const [count, setCount] = useState(5)
  const [mockOutput, setMockOutput] = useState('')

  const handleGenerate = () => {
    const list = []
    for (let i = 1; i <= count; i++) {
      const name = getRandomChineseName()
      list.push({
        id: 10000 + i,
        name,
        phone: getRandomPhone(),
        email: `${name.toLowerCase()}@example.com`,
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        createTime: getRandomDate(),
        balance: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
        status: Math.random() > 0.3 ? 'active' : 'pending',
      })
    }
    setMockOutput(JSON.stringify(list, null, 2))
  }

  return (
    <ToolPage title="JSON 随机 Mock 数据生成" description="根据结构规则快速随机生成姓名、手机号、城市、日期、金额等测试 JSON 数据">
      <div className="flex flex-col gap-5">
        <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">生成记录数量:</span>
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="select-field text-sm font-mono"
            >
              <option value={3}>3 条记录</option>
              <option value={5}>5 条记录</option>
              <option value={10}>10 条记录</option>
              <option value={20}>20 条记录</option>
              <option value={50}>50 条记录</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleGenerate} className="btn-primary flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />
              <span>立即随机生成</span>
            </button>
            {mockOutput && (
              <button
                onClick={() => downloadFile(mockOutput, 'mock_data.json', 'application/json')}
                className="btn-secondary flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>下载 JSON 文件</span>
              </button>
            )}
            {mockOutput && <CopyButton text={mockOutput} label="复制全部" />}
          </div>
        </div>

        <div className="card p-5">
          <textarea
            value={mockOutput}
            readOnly
            rows={16}
            placeholder="点击上方「立即随机生成」按钮，生成高质量随机测试 JSON 数组..."
            className="editor-area text-xs font-mono resize-none"
          />
        </div>
      </div>
    </ToolPage>
  )
}

