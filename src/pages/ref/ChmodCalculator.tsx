import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { useI18n } from '../../components/I18nProvider'
import type { Language } from '../../lib/i18n'
import { Terminal, ShieldCheck } from 'lucide-react'

interface ChmodStrings {
  octalLabel: string
  octalPlaceholder: string
  octalError: string
  symbolicLabel: string
  symbolicPlaceholder: string
  symbolicError: string
  commandLabel: string
  targetLabel: string
  targetPlaceholder: string
  recursiveLabel: string
  copyOctal: string
  copySymbolic: string
  copyCommand: string
  presetsLabel: string
  owner: string
  group: string
  others: string
  read: string
  write: string
  execute: string
  subtotal: string
  preset755: string
  preset644: string
  preset777: string
  preset700: string
  preset600: string
  preset400: string
  preset444: string
  tipTitle: string
  tipBody: string
}

const STRINGS: Record<Language, ChmodStrings> = {
  'zh-CN': {
    octalLabel: '八进制权限 (Octal)',
    octalPlaceholder: '如: 755',
    octalError: '请输入 3 位八进制数字（每位 0-7），如 755 或 644',
    symbolicLabel: '符号表示 (Symbolic)',
    symbolicPlaceholder: '如: rwxr-xr-x',
    symbolicError: '请输入 9 位权限符号（如 rwxr-xr-x 或 rw-r--r--）',
    commandLabel: 'chmod 命令',
    targetLabel: '目标文件 / 目录',
    targetPlaceholder: 'file',
    recursiveLabel: '递归 (-R)',
    copyOctal: '复制八进制',
    copySymbolic: '复制符号',
    copyCommand: '复制命令',
    presetsLabel: '常用权限预设',
    owner: '所有者 (Owner / u)',
    group: '群组 (Group / g)',
    others: '其他用户 (Others / o)',
    read: '读取 (Read / r)',
    write: '写入 (Write / w)',
    execute: '执行 (Execute / x)',
    subtotal: '权限值',
    preset755: '可执行文件/目录常用',
    preset644: '普通文件默认权限',
    preset777: '全部开放（慎用）',
    preset700: '仅所有者完全权限',
    preset600: '私钥/敏感配置专用',
    preset400: '仅所有者只读',
    preset444: '所有用户只读',
    tipTitle: '权限位说明',
    tipBody: '每位八进制数字由 读(4) + 写(2) + 执行(1) 相加得出。例如 7 = 4+2+1 (rwx)，5 = 4+1 (r-x)，4 = 4 (r--)。支持在上方直接输入 755 或 rwxr-xr-x 反向回填复选框。',
  },
  'en-US': {
    octalLabel: 'Octal Mode',
    octalPlaceholder: 'e.g. 755',
    octalError: 'Enter 3 octal digits (0-7 each), e.g. 755 or 644',
    symbolicLabel: 'Symbolic Mode',
    symbolicPlaceholder: 'e.g. rwxr-xr-x',
    symbolicError: 'Enter 9 symbolic chars (e.g. rwxr-xr-x or rw-r--r--)',
    commandLabel: 'chmod Command',
    targetLabel: 'Target file / directory',
    targetPlaceholder: 'file',
    recursiveLabel: 'Recursive (-R)',
    copyOctal: 'Copy Octal',
    copySymbolic: 'Copy Symbolic',
    copyCommand: 'Copy Command',
    presetsLabel: 'Common Presets',
    owner: 'Owner (u)',
    group: 'Group (g)',
    others: 'Others (o)',
    read: 'Read (r)',
    write: 'Write (w)',
    execute: 'Execute (x)',
    subtotal: 'Value',
    preset755: 'Executables & directories',
    preset644: 'Standard files',
    preset777: 'Full access (caution)',
    preset700: 'Owner full access only',
    preset600: 'Private keys & secrets',
    preset400: 'Owner read-only',
    preset444: 'Read-only for everyone',
    tipTitle: 'How chmod bits work',
    tipBody: 'Each octal digit is the sum of Read (4) + Write (2) + Execute (1). For example, 7 = 4+2+1 (rwx), 5 = 4+1 (r-x), 4 = 4 (r--). You can type 755 or rwxr-xr-x above to sync checkboxes automatically.',
  },
  'ja-JP': {
    octalLabel: '8進数表記 (Octal)',
    octalPlaceholder: '例: 755',
    octalError: '3桁の8進数（各桁 0〜7）を入力してください（例: 755, 644）',
    symbolicLabel: '記号表記 (Symbolic)',
    symbolicPlaceholder: '例: rwxr-xr-x',
    symbolicError: '9文字の権限記号を入力してください（例: rwxr-xr-x）',
    commandLabel: 'chmod コマンド',
    targetLabel: '対象ファイル / ディレクトリ',
    targetPlaceholder: 'file',
    recursiveLabel: '再帰 (-R)',
    copyOctal: '8進数をコピー',
    copySymbolic: '記号をコピー',
    copyCommand: 'コマンドをコピー',
    presetsLabel: 'よく使うプリセット',
    owner: '所有者 (Owner / u)',
    group: 'グループ (Group / g)',
    others: 'その他 (Others / o)',
    read: '読み取り (Read / r)',
    write: '書き込み (Write / w)',
    execute: '実行 (Execute / x)',
    subtotal: '数値',
    preset755: '実行ファイル・ディレクトリ',
    preset644: '一般ファイルの標準',
    preset777: '全ユーザー全権限（注意）',
    preset700: '所有者のみ全権限',
    preset600: '秘密鍵・機密ファイル',
    preset400: '所有者のみ読み取り',
    preset444: '全ユーザー読み取り専用',
    tipTitle: 'パーミッションの計算方法',
    tipBody: '各桁は 読み取り(4) + 書き込み(2) + 実行(1) の合計です（例: 7 = rwx, 5 = r-x, 4 = r--）。上の欄に 755 や rwxr-xr-x を入力するとチェックボックスに自動反映されます。',
  },
}

interface RoleConfig {
  key: 'owner' | 'group' | 'others'
  shift: number
  cardClass: string
  titleClass: string
  badgeClass: string
}

const ROLES: RoleConfig[] = [
  {
    key: 'owner',
    shift: 6,
    cardClass: 'bg-brand-50/50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900',
    titleClass: 'text-brand-700 dark:text-brand-300',
    badgeClass: 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300',
  },
  {
    key: 'group',
    shift: 3,
    cardClass: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900',
    titleClass: 'text-purple-700 dark:text-purple-300',
    badgeClass: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
  },
  {
    key: 'others',
    shift: 0,
    cardClass: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900',
    titleClass: 'text-emerald-700 dark:text-emerald-300',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
  },
]

const PERM_BITS: { key: 'read' | 'write' | 'execute'; value: number; char: string }[] = [
  { key: 'read', value: 4, char: 'r' },
  { key: 'write', value: 2, char: 'w' },
  { key: 'execute', value: 1, char: 'x' },
]

const PRESETS: { octal: string; descKey: keyof ChmodStrings }[] = [
  { octal: '755', descKey: 'preset755' },
  { octal: '644', descKey: 'preset644' },
  { octal: '700', descKey: 'preset700' },
  { octal: '600', descKey: 'preset600' },
  { octal: '400', descKey: 'preset400' },
  { octal: '444', descKey: 'preset444' },
  { octal: '777', descKey: 'preset777' },
]

function modeToOctal(mode: number): string {
  return (mode & 0o777).toString(8).padStart(3, '0')
}

function modeToSymbolic(mode: number): string {
  return ROLES.map(role => {
    const digit = (mode >> role.shift) & 7
    return PERM_BITS.map(b => ((digit & b.value) !== 0 ? b.char : '-')).join('')
  }).join('')
}

function parseOctalInput(raw: string): number | null {
  const clean = raw.trim()
  if (!/^0?[0-7]{3}$/.test(clean)) return null
  const normalized = clean.length === 4 ? clean.slice(1) : clean
  return parseInt(normalized, 8)
}

function parseSymbolicInput(raw: string): number | null {
  let clean = raw.trim().toLowerCase()
  if (clean.length === 10 && /^[-dlcbps]/.test(clean)) {
    clean = clean.slice(1)
  }
  if (!/^([r-][w-][x-]){3}$/.test(clean)) return null
  let mode = 0
  ROLES.forEach((role, roleIdx) => {
    const slice = clean.slice(roleIdx * 3, roleIdx * 3 + 3)
    let digit = 0
    if (slice[0] === 'r') digit |= 4
    if (slice[1] === 'w') digit |= 2
    if (slice[2] === 'x') digit |= 1
    mode |= digit << role.shift
  })
  return mode
}

export default function ChmodCalculator() {
  const { language } = useI18n()
  const s = STRINGS[language]

  const [mode, setMode] = useState<number>(0o755)
  const [octalInput, setOctalInput] = useState<string>('755')
  const [symbolicInput, setSymbolicInput] = useState<string>('rwxr-xr-x')
  const [octalInvalid, setOctalInvalid] = useState<boolean>(false)
  const [symbolicInvalid, setSymbolicInvalid] = useState<boolean>(false)
  const [target, setTarget] = useState<string>('file')
  const [recursive, setRecursive] = useState<boolean>(false)

  const syncFromMode = (nextMode: number) => {
    const clamped = nextMode & 0o777
    setMode(clamped)
    setOctalInput(modeToOctal(clamped))
    setSymbolicInput(modeToSymbolic(clamped))
    setOctalInvalid(false)
    setSymbolicInvalid(false)
  }

  const toggleBit = (bitMask: number) => {
    syncFromMode(mode ^ bitMask)
  }

  const handleOctalChange = (value: string) => {
    setOctalInput(value)
    if (!value.trim()) {
      setOctalInvalid(false)
      return
    }
    const parsed = parseOctalInput(value)
    if (parsed === null) {
      setOctalInvalid(true)
      return
    }
    setOctalInvalid(false)
    setSymbolicInvalid(false)
    setMode(parsed)
    setSymbolicInput(modeToSymbolic(parsed))
  }

  const handleSymbolicChange = (value: string) => {
    setSymbolicInput(value)
    if (!value.trim()) {
      setSymbolicInvalid(false)
      return
    }
    const parsed = parseSymbolicInput(value)
    if (parsed === null) {
      setSymbolicInvalid(true)
      return
    }
    setSymbolicInvalid(false)
    setOctalInvalid(false)
    setMode(parsed)
    setOctalInput(modeToOctal(parsed))
  }

  const currentOctal = modeToOctal(mode)
  const currentSymbolic = modeToSymbolic(mode)
  const targetName = target.trim() || 'file'
  const command = `chmod ${recursive ? '-R ' : ''}${currentOctal} ${targetName}`

  return (
    <ToolPage
      title="文件权限计算器 (chmod)"
      description="Linux 文件权限八进制（755）与符号表示（rwxr-xr-x）双向换算与 chmod 命令生成"
    >
      <div className="card p-6 flex flex-col gap-6">
        {/* 权限矩阵复选框：所有者 / 群组 / 其他 × 读 / 写 / 执行 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map(role => {
            const digit = (mode >> role.shift) & 7
            const roleSymbolic = PERM_BITS.map(b => ((digit & b.value) !== 0 ? b.char : '-')).join('')
            return (
              <div key={role.key} className={`p-4 rounded-xl border ${role.cardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-semibold text-sm ${role.titleClass}`}>{s[role.key]}</span>
                  <span className={`badge font-mono ${role.badgeClass}`}>
                    {digit} ({roleSymbolic})
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {PERM_BITS.map(perm => {
                    const bitMask = perm.value << role.shift
                    const checked = (mode & bitMask) !== 0
                    return (
                      <label
                        key={perm.key}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/70 border border-gray-200/80 dark:border-gray-800 cursor-pointer hover:border-brand-400 dark:hover:border-brand-600 transition-colors select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleBit(bitMask)}
                            className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
                          />
                          <span className="text-sm font-medium">{s[perm.key]}</span>
                        </div>
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                          {perm.value}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* 八进制 & 符号表示双向输入 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-900">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-brand-700 dark:text-brand-300 text-sm">
                {s.octalLabel}
              </label>
              <CopyButton text={currentOctal} label={s.copyOctal} />
            </div>
            <input
              type="text"
              value={octalInput}
              onChange={e => handleOctalChange(e.target.value)}
              placeholder={s.octalPlaceholder}
              maxLength={4}
              className="input-field font-mono font-bold text-lg"
            />
            {octalInvalid && <p className="error-text text-xs">{s.octalError}</p>}
          </div>

          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-amber-700 dark:text-amber-300 text-sm">
                {s.symbolicLabel}
              </label>
              <CopyButton text={currentSymbolic} label={s.copySymbolic} />
            </div>
            <input
              type="text"
              value={symbolicInput}
              onChange={e => handleSymbolicChange(e.target.value)}
              placeholder={s.symbolicPlaceholder}
              maxLength={10}
              className="input-field font-mono font-bold text-lg"
            />
            {symbolicInvalid && <p className="error-text text-xs">{s.symbolicError}</p>}
          </div>
        </div>

        {/* chmod 命令生成 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="font-semibold text-sm">{s.commandLabel}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recursive}
                  onChange={e => setRecursive(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-brand-600 cursor-pointer"
                />
                <span>{s.recursiveLabel}</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">{s.targetLabel}:</span>
                <input
                  type="text"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder={s.targetPlaceholder}
                  className="input-field py-1 px-2.5 text-xs font-mono w-36"
                />
              </div>
              <CopyButton text={command} label={s.copyCommand} />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-gray-950 border font-mono font-bold text-base text-brand-600 dark:text-brand-400 select-all break-all">
            {command}
          </div>
        </div>

        {/* 常用权限预设 */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>{s.presetsLabel}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {PRESETS.map(p => {
              const active = currentOctal === p.octal
              return (
                <button
                  key={p.octal}
                  type="button"
                  onClick={() => syncFromMode(parseInt(p.octal, 8))}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    active
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                      : 'bg-white dark:bg-gray-900 hover:border-brand-300 dark:hover:border-brand-700'
                  }`}
                >
                  <div className="font-mono font-bold text-sm">{p.octal}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {s[p.descKey]}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 权限位说明 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 rounded-lg p-3.5 border leading-relaxed">
          <span className="font-semibold text-gray-700 dark:text-gray-300">{s.tipTitle}：</span>
          {s.tipBody}
        </div>
      </div>
    </ToolPage>
  )
}
