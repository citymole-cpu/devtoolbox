import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Search } from 'lucide-react'

const GIT_COMMANDS = [
  // 基础操作
  { cat: '基础提交流程', cmd: 'git status', desc: '查看当前工作区与暂存区的修改状态' },
  { cat: '基础提交流程', cmd: 'git add .', desc: '将当前目录下所有变动添加至暂存区' },
  { cat: '基础提交流程', cmd: 'git commit -m "feat: 完善所有开发工具"', desc: '提交暂存区变更并记录 Commit Message' },
  { cat: '基础提交流程', cmd: 'git log --oneline -n 10', desc: '以单行简洁模式查看最近 10 条提交历史' },
  // 分支操作
  { cat: '分支管理', cmd: 'git checkout -b feature/dev', desc: '创建并立即切换到新的特性分支' },
  { cat: '分支管理', cmd: 'git branch -a', desc: '查看本地与远程的所有分支列表' },
  { cat: '分支管理', cmd: 'git merge feature/dev', desc: '将指定分支合并到当前所在分支' },
  { cat: '分支管理', cmd: 'git branch -d feature/dev', desc: '安全删除已合并的本地分支' },
  // 撤销与回退
  { cat: '撤销与回滚', cmd: 'git restore <file>', desc: '丢弃工作区某文件的未暂存修改' },
  { cat: '撤销与回滚', cmd: 'git reset HEAD <file>', desc: '将文件从暂存区撤出，保留工作区变动' },
  { cat: '撤销与回滚', cmd: 'git reset --soft HEAD~1', desc: '撤销最近一次 Commit，保留代码在暂存区' },
  { cat: '撤销与回滚', cmd: 'git reset --hard HEAD~1', desc: '彻底销毁最近一次 Commit 与所有未保存变更 (慎用)' },
  { cat: '撤销与回滚', cmd: 'git revert <commit_id>', desc: '安全通过新建一个反向 Commit 来撤销历史提交' },
  // 远程同步
  { cat: '远程同步', cmd: 'git pull origin main --rebase', desc: '拉取远程更新并以变基方式应用本地提交' },
  { cat: '远程同步', cmd: 'git push -u origin main', desc: '首次推送并关联远程同名分支' },
  { cat: '远程同步', cmd: 'git remote -v', desc: '查看当前关联的远程仓库地址' },
  // 暂存缓存
  { cat: '临时暂存 (Stash)', cmd: 'git stash', desc: '将当前未完成的工作临时推入暂存栈' },
  { cat: '临时暂存 (Stash)', cmd: 'git stash pop', desc: '恢复最近一次暂存的工作内容并从栈中移除' },
  { cat: '临时暂存 (Stash)', cmd: 'git stash list', desc: '查看暂存栈中所有记录' },
]

export default function GitCommands() {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('全部')

  const categories = ['全部', '基础提交流程', '分支管理', '撤销与回滚', '远程同步', '临时暂存 (Stash)']

  const filtered = GIT_COMMANDS.filter(item => {
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
    <ToolPage title="Git 常用命令速查" description="日常版本控制、分支合并、变基提交与回滚操作命令快速检索">
      <div className="flex flex-col gap-5">
        <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索 Git 命令或操作 (例如: commit, branch, 回滚, stash)..."
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

