import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { Search } from 'lucide-react'

const PORT_LIST = [
  { port: 21, proto: 'TCP', name: 'FTP', desc: '文件传输协议 (File Transfer Protocol)' },
  { port: 22, proto: 'TCP', name: 'SSH / SFTP', desc: '安全外壳协议远程登录与传输' },
  { port: 23, proto: 'TCP', name: 'Telnet', desc: '未加密的远程终端协议' },
  { port: 25, proto: 'TCP', name: 'SMTP', desc: '简单邮件传输协议 (发信)' },
  { port: 53, proto: 'TCP/UDP', name: 'DNS', desc: '域名系统解析服务' },
  { port: 80, proto: 'TCP', name: 'HTTP', desc: '万维网超文本传输协议' },
  { port: 110, proto: 'TCP', name: 'POP3', desc: '邮局协议版本3 (收信)' },
  { port: 143, proto: 'TCP', name: 'IMAP', desc: '互联网消息访问协议' },
  { port: 443, proto: 'TCP', name: 'HTTPS', desc: '经 TLS/SSL 加密的 HTTP 服务' },
  { port: 873, proto: 'TCP', name: 'Rsync', desc: 'Linux 文件同步守护进程' },
  { port: 1433, proto: 'TCP', name: 'Microsoft SQL Server', desc: 'MSSQL 数据库默认端口' },
  { port: 1521, proto: 'TCP', name: 'Oracle Database', desc: 'Oracle 数据库默认监听端口' },
  { port: 3306, proto: 'TCP', name: 'MySQL / MariaDB', desc: 'MySQL 关系型数据库' },
  { port: 5432, proto: 'TCP', name: 'PostgreSQL', desc: 'PostgreSQL 对象关系数据库' },
  { port: 6379, proto: 'TCP', name: 'Redis', desc: 'Redis 内存键值缓存数据库' },
  { port: 8080, proto: 'TCP', name: 'HTTP-Alt / Tomcat', desc: 'Tomcat / Spring Boot 常见应用端口' },
  { port: 8888, proto: 'TCP', name: '宝塔面板 / Jupyter', desc: '常用云主机管理与科学计算端口' },
  { port: 9000, proto: 'TCP', name: 'PHP-FPM / MinIO', desc: 'PHP FastCGI 与 MinIO 对象存储' },
  { port: 9092, proto: 'TCP', name: 'Kafka', desc: 'Apache Kafka 消息队列代理端口' },
  { port: 9200, proto: 'TCP', name: 'Elasticsearch', desc: 'ES 搜索引擎 HTTP 接口' },
  { port: 11211, proto: 'TCP/UDP', name: 'Memcached', desc: 'Memcached 内存缓存服务' },
  { port: 27017, proto: 'TCP', name: 'MongoDB', desc: 'MongoDB 文档型数据库默认端口' },
  { port: 5672, proto: 'TCP', name: 'RabbitMQ', desc: 'RabbitMQ AMQP 消息协议端口' },
  { port: 15672, proto: 'TCP', name: 'RabbitMQ Admin', desc: 'RabbitMQ Web 控制台管理界面' },
]

export default function Ports() {
  const [query, setQuery] = useState('')

  const filtered = PORT_LIST.filter(item => {
    const q = query.toLowerCase()
    return (
      !query ||
      item.port.toString().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.proto.toLowerCase().includes(q)
    )
  })

  return (
    <ToolPage title="常用网络端口对照表" description="Web、数据库、消息队列与系统核心网络服务端口号检索">
      <div className="flex flex-col gap-5">
        <div className="card p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索端口号、服务名称或协议 (例如: 3306, redis, ssh, 443)..."
              className="input-field pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.port} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold font-mono text-brand-600 dark:text-brand-400">
                  :{item.port}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {item.proto}
                </span>
              </div>
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.name}</div>
              <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}

