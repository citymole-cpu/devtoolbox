import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Search } from 'lucide-react'

const COMMANDS = [
  // 文件目录
  { cat: '文件目录', cmd: 'ls -lah', desc: '以易读格式详细列出当前目录下的所有文件（含隐藏文件）' },
  { cat: '文件目录', cmd: 'find / -name "*.log" -size +100M', desc: '查找系统中大于 100MB 的 log 日志文件' },
  { cat: '文件目录', cmd: 'tar -zcvf archive.tar.gz /path', desc: '打包并以 gzip 格式压缩指定目录' },
  { cat: '文件目录', cmd: 'tar -zxvf archive.tar.gz -C /dest', desc: '解压 gzip 归档文件到目标目录' },
  { cat: '文件目录', cmd: 'tail -f -n 200 app.log', desc: '实时跟踪并查看日志文件末尾 200 行输出' },
  // 文本搜索
  { cat: '文本搜索', cmd: 'grep -rn "ERROR" /var/log/', desc: '递归检索日志目录下包含 ERROR 的行并显示行号' },
  { cat: '文本搜索', cmd: 'sed -i "s/old_text/new_text/g" config.env', desc: '就地快速查找并全局替换文件中的字符串' },
  { cat: '文本搜索', cmd: "awk '{print $1}' access.log | sort | uniq -c | sort -nr", desc: '统计访问日志中 IP 出现频率并倒序排列' },
  // 进程监控
  { cat: '进程监控', cmd: 'ps aux | grep node', desc: '检索指定进程名称的运行状态与 PID' },
  { cat: '进程监控', cmd: 'kill -9 <PID>', desc: '强制终止指定 PID 的进程' },
  { cat: '进程监控', cmd: 'top / htop', desc: '实时动态查看 CPU、内存占用最高的进程列表' },
  { cat: '进程监控', cmd: 'df -h', desc: '以易读的 GB/MB 查看磁盘分区挂载与剩余空间' },
  { cat: '进程监控', cmd: 'free -h', desc: '查看系统物理内存与 Swap 交换区使用情况' },
  // 网络排查
  { cat: '网络排查', cmd: 'netstat -tulnp | grep :8080', desc: '查看监听 8080 端口的具体进程 PID 与状态' },
  { cat: '网络排查', cmd: 'ss -tulpn', desc: '比 netstat 更快的高性能套接字端口监听查看' },
  { cat: '网络排查', cmd: 'curl -Iv https://example.com', desc: '测试网络连通性并输出完整的 HTTP 响应头与握手信息' },
  { cat: '网络排查', cmd: 'ping -c 4 8.8.8.8', desc: '发送 4 个 ICMP 数据包检测网络延迟与丢包率' },
  // 系统与权限
  { cat: '系统权限', cmd: 'chmod -R 755 /data/www', desc: '递归修改目录权限为所有者可写，其他人可读执行' },
  { cat: '系统权限', cmd: 'chown -R www-data:www-data /data/www', desc: '递归更改文件或目录的用户与属组' },
  { cat: '系统权限', cmd: 'systemctl restart nginx', desc: '重启指定系统服务 (如 nginx, docker, mysql)' },
  { cat: '系统权限', cmd: 'journalctl -u nginx -n 100 -f', desc: '实时查看 systemd 托管服务的标准输出日志' },
]

export default function LinuxCommands() {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('全部')

  const categories = ['全部', '文件目录', '文本搜索', '进程监控', '网络排查', '系统权限']

  const filtered = COMMANDS.filter(item => {
    const matchCat = activeCat === '全部' || item.cat === activeCat
    const q = query.toLowerCase()
    const matchQ =
      !query ||
      item.cmd.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.cat.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  return (
    <ToolPage title="Linux 常用命令大全" description="分类检索与速查常用 Linux 运维排障、日志分析、进程与网络调试高频命令">
      <div className="flex flex-col gap-5">
        <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索命令或功能 (例如: tar, grep, 端口, 磁盘)..."
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`btn btn-sm ${activeCat === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => (
            <div key={item.cmd} className="card p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300">
                    {item.cat}
                  </span>
                  <CopyButton text={item.cmd} label="复制命令" />
                </div>
                <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono font-bold text-xs text-brand-600 dark:text-brand-400 break-all select-all border">
                  $ {item.cmd}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}

