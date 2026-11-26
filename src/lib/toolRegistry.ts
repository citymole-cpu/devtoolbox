import {
  Braces, GitCompareArrows, FileType2, FileCode2, Coffee,
  FileJson2, Search, Quote, ArrowLeftRight, Binary, Link,
  Languages, Code2, Key, Hash, Shield, ShieldCheck, Lock,
  Fingerprint, FileCode, Paintbrush, Database, Type as TypeIcon,
  Clock, Palette, Timer, KeyRound, QrCode, ScanSearch,
  ArrowUpDown, BarChart3, FileText, Regex, Calculator, Coins,
  Radio, BookOpen, Network, HardDrive, Terminal, Table, Image,
  Sparkles, Monitor, CaseSensitive, Minimize, Globe, RadioTower,
  CodeXml, Sliders, ListFilter, CheckCircle2, Crop, Grid,
  Stamp, RotateCw, Wand2, Pipette, PenTool, Replace,
  Send, GitBranch, Scale, Film, Scan,
  type LucideIcon,
  Shuffle,
  Maximize2,
  Camera,
  Layers,
  Feather,
  Printer,
  Undo2,
  Barcode,
  Calendar,
  Keyboard,
  Zap,
  HeartPulse,
  Flag,
  FileQuestion,
  Smile,
  Atom,
  Server,
  DownloadCloud,
  Home,
  LayoutTemplate,
  Columns3,
  LayoutGrid,
  MapPin,
} from 'lucide-react'

export interface ToolInfo {
  id: string
  name: string
  description: string
  path: string
  icon: LucideIcon
  keywords: string[]
}

export interface CategoryInfo {
  id: string
  name: string
  icon: LucideIcon
  color: string
  tools: ToolInfo[]
}

export const categories: CategoryInfo[] = [
  {
    id: 'json',
    name: 'JSON 工具',
    icon: Braces,
    color: 'text-amber-500',
    tools: [
      { id: 'json-formatter', name: 'JSON 格式化', description: '格式化、压缩、校验 JSON 数据', path: '/json/formatter', icon: Braces, keywords: ['json', '格式化', 'format', 'beautify', '美化', '压缩', '校验'] },
      { id: 'json-tree', name: 'JSON 树形视图', description: '交互式折叠/展开与类型节点可视化树', path: '/json/tree-view', icon: Code2, keywords: ['json', '树形', 'tree', '视图', '折叠'] },
      { id: 'json-minify-escape', name: 'JSON 压缩转义', description: 'JSON 单行压缩并双向转义引号', path: '/json/minify-escape', icon: Quote, keywords: ['json', '转义', '单行', '压缩', 'escape'] },
      { id: 'json-mock', name: 'JSON 随机生成', description: '根据规则批量生成姓名、手机号、日期等 Mock 数据', path: '/json/mock-generator', icon: Wand2, keywords: ['json', 'mock', '随机生成', '假数据', '测试数据'] },
      { id: 'json-escape', name: 'JSON 字符转义', description: 'JSON 字符串转义与反转义', path: '/json/escape', icon: Quote, keywords: ['json', '转义', 'escape', 'unescape', '反转义'] },
      { id: 'json-path', name: 'JSONPath 查询', description: '使用 JSONPath 表达式查询 JSON 数据', path: '/json/path', icon: Search, keywords: ['json', 'path', 'jsonpath', '查询', '筛选'] },
      { id: 'json-diff', name: 'JSON 对比', description: '对比两段 JSON 数据的差异', path: '/json/diff', icon: GitCompareArrows, keywords: ['json', '对比', 'diff', '差异', '比较'] },
      { id: 'json-to-typescript', name: 'JSON → TypeScript', description: '从 JSON 生成 TypeScript 接口定义', path: '/json/to-typescript', icon: FileType2, keywords: ['json', 'typescript', 'ts', '接口', 'interface', '类型'] },
      { id: 'json-to-go', name: 'JSON → Go Struct', description: '从 JSON 生成 Go 语言结构体', path: '/json/to-go', icon: FileCode2, keywords: ['json', 'go', 'golang', 'struct', '结构体'] },
      { id: 'json-to-java', name: 'JSON → Java Class', description: '从 JSON 生成 Java 实体类', path: '/json/to-java', icon: Coffee, keywords: ['json', 'java', 'class', '实体类', 'pojo'] },
      { id: 'json-to-csharp', name: 'JSON → C# Class', description: '从 JSON 生成 C# 实体类', path: '/json/to-csharp', icon: FileCode, keywords: ['json', 'c#', 'csharp', 'class', '实体类', 'dotnet'] },
      { id: 'json-schema', name: 'JSON Schema', description: '从 JSON 数据生成 JSON Schema 定义', path: '/json/schema', icon: FileJson2, keywords: ['json', 'schema', '模式', '定义'] },
    ],
  },
  {
    id: 'convert',
    name: '格式转换',
    icon: ArrowLeftRight,
    color: 'text-blue-500',
    tools: [
      { id: 'curl-to-code', name: 'cURL 转代码', description: 'cURL 请求转换为 Fetch / Python / Go 代码', path: '/convert/curl-to-code', icon: Terminal, keywords: ['curl', 'python', 'fetch', 'requests', '代码生成', '爬虫'] },
      { id: 'json-to-sql', name: 'JSON 转 SQL', description: '将 JSON 对象数组一键生成批量 SQL INSERT 语句', path: '/convert/json-to-sql', icon: Database, keywords: ['sql', 'insert', 'json转sql', '数据库', '批量插入'] },
      { id: 'html-markdown', name: 'HTML ↔ Markdown', description: 'HTML 网页代码与 Markdown 双向互转', path: '/convert/html-markdown', icon: CodeXml, keywords: ['html', 'markdown', 'md', '转换'] },
      { id: 'json-yaml', name: 'JSON ↔ YAML', description: 'JSON 与 YAML 格式互相转换', path: '/convert/json-yaml', icon: ArrowLeftRight, keywords: ['json', 'yaml', '转换', 'convert'] },
      { id: 'json-xml', name: 'JSON ↔ XML', description: 'JSON 与 XML 格式互相转换', path: '/convert/json-xml', icon: ArrowLeftRight, keywords: ['json', 'xml', '转换', 'convert'] },
      { id: 'json-csv', name: 'JSON ↔ CSV', description: 'JSON 与 CSV 格式互相转换', path: '/convert/json-csv', icon: ArrowLeftRight, keywords: ['json', 'csv', '转换', 'convert', '表格'] },
      { id: 'json-toml', name: 'JSON ↔ TOML', description: 'JSON 与 TOML 格式互相转换', path: '/convert/json-toml', icon: ArrowLeftRight, keywords: ['json', 'toml', '转换', 'convert'] },
      { id: 'json-properties', name: 'Properties ↔ JSON', description: 'Java Properties 与 JSON 互相转换', path: '/convert/properties-json', icon: ArrowLeftRight, keywords: ['properties', 'json', '转换', 'convert', 'java'] },
      { id: 'radix', name: '进制转换器', description: '2/8/10/16 进制及任意 2-36 进制即时转换', path: '/convert/radix', icon: Calculator, keywords: ['进制', '二进制', '八进制', '十进制', '十六进制', 'hex', 'bin', 'oct'] },
      { id: 'rmb-capital', name: '人民币大写转换', description: '数字金额转换为中文大写(发票支票规范)', path: '/convert/rmb-capital', icon: Coins, keywords: ['人民币', '大写', '金额', '数字转大写', '发票', 'rmb'] },
      { id: 'currency-capital', name: '全币种金额与支票大写', description: '人民币/美元/欧元/英镑/日元等金额大写与银行支票出票日期规范', path: '/convert/currency-capital', icon: Coins, keywords: ['金额大写', '数字转大写', '美元大写', '支票大写', '汇率', '财务'] },
      { id: 'query-string', name: 'URL 参数 ↔ JSON', description: 'URL QueryString 与 JSON 对象双向解析转换', path: '/convert/query-string', icon: Link, keywords: ['url', 'query', 'querystring', '参数', 'json', '解析'] },
    ],
  },
  {
    id: 'net',
    name: '网络与接口',
    icon: Globe,
    color: 'text-cyan-500',
    tools: [
      { id: 'http-client', name: 'HTTP 接口调试', description: '浏览器轻量 API 测试工具 (GET/POST/PUT/DELETE)', path: '/net/http-client', icon: Send, keywords: ['http', 'api', '接口测试', 'postman', 'curl', '请求调试'] },
      { id: 'cidr', name: 'CIDR 子网掩码计算', description: 'IP 地址与掩码位换算网络地址、广播地址与 IP 范围', path: '/net/cidr', icon: Network, keywords: ['ip', 'cidr', '掩码', '子网掩码', '广播地址', '网络规划'] },
      { id: 'websocket', name: 'WebSocket 在线测试', description: '在线连接 ws/wss 并实时收发消息调试', path: '/net/websocket', icon: RadioTower, keywords: ['ws', 'wss', 'websocket', '长连接', '测试', '调试'] },
      { id: 'robots-gen', name: 'Robots.txt 爬虫协议生成', description: '百度/谷歌/必应爬虫规范在线配置与 sitemap 声明', path: '/net/robots', icon: Globe, keywords: ['robots', '爬虫', '百度蜘蛛', 'googlebot', '搜索引擎', 'sitemap'] },
      { id: 'htpasswd-gen', name: '在线 .htpasswd 认证生成', description: 'Nginx 与 Apache HTTP 基础认证密码列表生成', path: '/net/htpasswd', icon: KeyRound, keywords: ['htpasswd', 'basic auth', 'nginx认证', 'apache认证', '密码生成'] },
      { id: 'dns-lookup', name: 'DNS 查询', description: '通过 DoH 在线查询域名 A / AAAA / CNAME / MX / TXT 等记录', path: '/net/dns', icon: Globe, keywords: ['dns', '域名解析', 'doh', 'a记录', 'mx记录', 'txt记录', 'cname'] },
      { id: 'ip-lookup', name: 'IP 查询', description: '查询公网 IP 的归属地、运营商、ASN 与时区', path: '/net/ip', icon: MapPin, keywords: ['ip', 'ip查询', '归属地', '运营商', 'asn', '本机ip', '公网ip'] },
    ],
  },
  {
    id: 'encode',
    name: '编码/解码',
    icon: Binary,
    color: 'text-green-500',
    tools: [
      { id: 'base64', name: 'Base64 编解码', description: 'Base64 编码与解码，支持文本和文件', path: '/encode/base64', icon: Binary, keywords: ['base64', '编码', '解码', 'encode', 'decode'] },
      { id: 'url-encode', name: 'URL 编解码', description: 'URL 编码 (UrlEncode) 与解码 (UrlDecode)', path: '/encode/url', icon: Link, keywords: ['url', '编码', '解码', 'encode', 'decode', 'urlencode'] },
      { id: 'unicode', name: 'Unicode 编解码', description: 'Unicode 与中文字符互相转换', path: '/encode/unicode', icon: Languages, keywords: ['unicode', '编码', '解码', '中文', 'utf'] },
      { id: 'html-entities', name: 'HTML 实体编解码', description: 'HTML 实体字符编码与解码', path: '/encode/html-entities', icon: Code2, keywords: ['html', '实体', 'entity', '编码', '解码', '&amp;'] },
      { id: 'jwt', name: 'JWT 解析', description: '解析和验证 JSON Web Token', path: '/encode/jwt', icon: Key, keywords: ['jwt', 'token', '解析', 'json web token', '令牌'] },
      { id: 'jwt-generator', name: 'JWT 生成器', description: '在线签发 HS256 / HS384 / HS512 JWT 并验证签名', path: '/jwt/generator', icon: KeyRound, keywords: ['jwt', 'token', '生成', '签发', 'json web token', '令牌', 'hs256'] },
      { id: 'morse', name: '摩斯密码编解码', description: '文本与莫尔斯电码(Morse)双向互转与发声播放', path: '/encode/morse', icon: Radio, keywords: ['摩斯', '莫尔斯', 'morse', '电码', '密码', '嘀嗒'] },
    ],
  },
  {
    id: 'crypto',
    name: '加密/哈希',
    icon: Shield,
    color: 'text-red-500',
    tools: [
      { id: 'md5', name: 'MD5 哈希', description: '计算文本的 MD5 哈希值', path: '/crypto/md5', icon: Hash, keywords: ['md5', '哈希', 'hash', '加密', '摘要'] },
      { id: 'sha', name: 'SHA 哈希', description: 'SHA1 / SHA256 / SHA512 哈希计算', path: '/crypto/sha', icon: Shield, keywords: ['sha', 'sha1', 'sha256', 'sha512', '哈希', 'hash'] },
      { id: 'hmac', name: 'HMAC 签名', description: 'HMAC 消息认证码计算', path: '/crypto/hmac', icon: ShieldCheck, keywords: ['hmac', '签名', '认证', 'mac'] },
      { id: 'aes', name: 'AES 加解密', description: 'AES 对称加密与解密', path: '/crypto/aes', icon: Lock, keywords: ['aes', '加密', '解密', 'encrypt', 'decrypt', '对称'] },
      { id: 'des', name: 'DES / 3DES 加解密', description: 'DES 与 TripleDES 对称加密与解密', path: '/crypto/des', icon: Lock, keywords: ['des', '3des', 'tripledes', '对称加密'] },
      { id: 'rsa', name: 'RSA 密钥与加解密', description: 'RSA 密钥对生成、公钥加密与私钥解密测试', path: '/crypto/rsa', icon: Key, keywords: ['rsa', '非对称加密', '公钥', '私钥', '密钥对'] },
      { id: 'crc32', name: 'CRC32 校验码', description: '计算数据与字符串的 CRC32 循环冗余校验值', path: '/crypto/crc32', icon: CheckCircle2, keywords: ['crc', 'crc32', '循环冗余校验', '校验码'] },
      { id: 'uuid', name: 'UUID 生成器', description: '生成 UUID / GUID 唯一标识符', path: '/crypto/uuid', icon: Fingerprint, keywords: ['uuid', 'guid', '生成', '唯一', '标识'] },
      { id: 'file-hash', name: '文件哈希与校验', description: '离线秒级计算大文件 MD5/SHA-1/SHA-256 校验码与防篡改验证', path: '/crypto/file-hash', icon: ShieldCheck, keywords: ['文件哈希', '文件md5', 'sha256', '防篡改', '文件校验'] },
      { id: 'password-strength', name: '密码强度检测器', description: '本地检测密码强度：规则评分、熵值与破解耗时估算', path: '/crypto/password-strength', icon: ShieldCheck, keywords: ['密码强度', '密码检测', 'password strength', '熵值', '弱密码', '安全'] },
      { id: 'bcrypt', name: 'bcrypt 生成器', description: '纯前端生成与验证 bcrypt 密码哈希，支持 cost 调节', path: '/crypto/bcrypt', icon: Lock, keywords: ['bcrypt', '密码哈希', 'hash', '加密', '密码存储', '加盐'] },
    ],
  },
  {
    id: 'format',
    name: '代码格式化',
    icon: FileCode,
    color: 'text-purple-500',
    tools: [
      { id: 'html-format', name: 'HTML 格式化', description: 'HTML 代码格式化与压缩', path: '/format/html', icon: FileCode, keywords: ['html', '格式化', '压缩', 'format', 'beautify'] },
      { id: 'css-format', name: 'CSS 格式化', description: 'CSS 代码格式化与压缩', path: '/format/css', icon: Paintbrush, keywords: ['css', '格式化', '压缩', 'format', 'beautify'] },
      { id: 'css-generator', name: 'CSS 阴影与渐变', description: '可视配置 Box Shadow 阴影与渐变背景生成', path: '/format/css-generator', icon: Sliders, keywords: ['css', '阴影', '渐变', 'box-shadow', 'gradient'] },
      { id: 'css-visual', name: 'CSS 现代视觉生成器', description: '不规则圆角、CSS几何三角形、毛玻璃卡片与立体按钮生成', path: '/format/css-visual', icon: Sparkles, keywords: ['圆角', '三角形', '毛玻璃', 'glassmorphism', '发光按钮', 'css特效'] },
      { id: 'js-format', name: 'JavaScript 格式化', description: 'JavaScript 代码格式化与压缩', path: '/format/javascript', icon: FileCode2, keywords: ['javascript', 'js', '格式化', '压缩', 'format', 'beautify'] },
      { id: 'code-universal', name: '多语言通用代码美化', description: 'Python/Java/C/C++/C#/PHP/Go 语法缩进与紧凑压缩', path: '/format/universal', icon: Code2, keywords: ['python格式化', 'java格式化', 'c语言格式化', '代码美化', '缩进'] },
      { id: 'header-cookie', name: 'Headers / Cookie 格式化', description: 'HTTP 请求头、Cookie 与 URL Get 参数解析与转 JSON', path: '/format/header-cookie', icon: ArrowLeftRight, keywords: ['headers', 'cookie', 'query参数', '请求头', '参数解析'] },
      { id: 'sql-format', name: 'SQL 格式化', description: 'SQL 语句格式化与美化', path: '/format/sql', icon: Database, keywords: ['sql', '格式化', 'format', 'beautify', '数据库'] },
      { id: 'xml-format', name: 'XML 格式化', description: 'XML 文档格式化与压缩', path: '/format/xml', icon: TypeIcon, keywords: ['xml', '格式化', '压缩', 'format', 'beautify'] },
    ],
  },
  {
    id: 'css',
    name: 'CSS 布局',
    icon: LayoutTemplate,
    color: 'text-violet-500',
    tools: [
      { id: 'flexbox-generator', name: 'Flexbox 布局生成器', description: '可视化调整 Flexbox 容器属性，实时预览并生成 CSS 代码', path: '/css/flexbox', icon: Columns3, keywords: ['flexbox', 'flex', '弹性布局', 'css布局', 'flex-direction', 'justify-content'] },
      { id: 'grid-generator', name: 'Grid 布局生成器', description: '可视化配置 CSS Grid 行列、间距与对齐，实时预览并生成 CSS 代码', path: '/css/grid', icon: LayoutGrid, keywords: ['grid', 'css grid', '网格布局', 'css布局', 'grid-template', '响应式'] },
    ],
  },
  {
    id: 'text',
    name: '文字处理',
    icon: FileText,
    color: 'text-teal-500',
    tools: [
      { id: 'text-diff', name: '文本对比', description: '对比两段文本的差异并高亮显示', path: '/text/diff', icon: GitCompareArrows, keywords: ['文本', '对比', 'diff', '差异', '比较'] },
      { id: 'text-replace', name: '文本查找替换', description: '普通/全局/正则表达式批量匹配替换文本', path: '/text/replace', icon: Replace, keywords: ['替换', '查找', 'replace', '正则替换'] },
      { id: 'idcard-validator', name: '身份证合规校验提取', description: '18位身份证合规校验、提取生日、性别、年龄与省市行政区划', path: '/text/idcard', icon: CheckCircle2, keywords: ['身份证', '身份证校验', '提取生日', '年龄计算', '归属地', '行政区划'] },
      { id: 'text-arrange', name: '文本排版与多维清洗', description: '古典文字竖排、多行合并单行、随机打乱、分列提取与过滤', path: '/text/arrange', icon: ListFilter, keywords: ['文本竖排', '古风排版', '多行合一', '随机打乱', '分列提取', '清除数字'] },
      { id: 'ascii-art', name: 'ASCII 艺术字与字符画', description: '输入文字生成终端 CLI Banner、线条艺术字与空心大字', path: '/text/ascii-art', icon: TypeIcon, keywords: ['ascii艺术字', '字符画', 'banner', '终端字符', '命令行字'] },
      { id: 'pinyin', name: '汉字转拼音', description: '中文汉字快速转换为全拼、带声调或首字母', path: '/text/pinyin', icon: Languages, keywords: ['拼音', '汉字转拼音', 'pinyin', '声调', '注音'] },
      { id: 'regex-tester', name: '正则表达式测试器', description: '正则表达式实时测试、高亮匹配、查看分组与替换', path: '/text/regex-tester', icon: Regex, keywords: ['正则', 'regex', '匹配', '测试', 'regexp', '替换', 'regex tester'] },
      { id: 'text-stats', name: '文本统计', description: '统计字数、字符数、行数、词频', path: '/text/stats', icon: BarChart3, keywords: ['文本', '统计', '字数', '行数', '字符'] },
      { id: 'batch-process', name: '文本批量处理', description: '批量添加前后缀、去除首尾空格、行关键字过滤', path: '/text/batch-process', icon: ListFilter, keywords: ['文本', '前缀', '后缀', '过滤', '批量'] },
      { id: 'text-sort', name: '去重排序', description: '文本去重、排序、过滤空行', path: '/text/sort', icon: ArrowUpDown, keywords: ['文本', '去重', '排序', '过滤', 'sort', 'unique'] },
      { id: 'markdown', name: 'Markdown 预览', description: 'Markdown 实时编辑与预览', path: '/text/markdown', icon: FileText, keywords: ['markdown', 'md', '预览', 'preview'] },
      { id: 'case-converter', name: '命名风格转换', description: '驼峰/下划线/中划线/大写/小写互转', path: '/text/case-converter', icon: CaseSensitive, keywords: ['大小写', '驼峰', 'camelCase', 'snake_case', 'kebab-case', '命名'] },
      { id: 'chinese-convert', name: '简繁体转换', description: '中文简体与繁体字互相转换', path: '/text/chinese-convert', icon: Languages, keywords: ['简体', '繁体', '简繁', '中文', '繁体字'] },
      { id: 'dbc-sbc', name: '全角半角转换', description: '全角符号/数字与半角符号互相转换', path: '/text/dbc-sbc', icon: Sparkles, keywords: ['全角', '半角', '全半角', '符号', '转换'] },
      { id: 'text-reverse', name: '文本倒序与颠倒', description: '支持字符倒序、行倒序、词倒序与 Unicode 颠倒倒立字', path: '/text/reverse', icon: ArrowLeftRight, keywords: ['倒序', '翻转', '颠倒', '字符倒序', '行倒序', 'upside down'] },
      { id: 'mars-text', name: '火星文与趣味字体', description: '非主流火星文、字符菊花挂件、删除线与防折叠文字', path: '/text/mars', icon: Sparkles, keywords: ['火星文', '菊花文', '防折叠', '非主流', '删字线'] },
      { id: 'random-generator', name: '随机数据批量生成', description: '批量生成中文姓名、手机号、邮箱、IP、MAC 地址等测试样本', path: '/text/random-generator', icon: Shuffle, keywords: ['随机生成', '随机姓名', '随机手机号', '随机邮箱', '测试数据', 'mock'] },
      { id: 'lorem-ipsum', name: 'Lorem Ipsum 生成器', description: '一键生成英文占位文本（段落 / 句子 / 单词），用于排版与原型填充', path: '/text/lorem-ipsum', icon: FileText, keywords: ['lorem', 'lorem ipsum', '占位文本', '假文', '排版', '填充文本'] },
      { id: 'slug', name: 'Slug 生成器', description: '标题转 URL 友好短链接：中文自动转拼音，去除特殊字符', path: '/text/slug', icon: Link, keywords: ['slug', '短链接', 'url别名', '拼音转slug', '标题转链接', 'seo'] },
      { id: 'markdown-table', name: 'Markdown 表格生成器', description: '可视化编辑表格，一键生成标准 Markdown 表格，支持 CSV 粘贴导入', path: '/text/markdown-table', icon: Table, keywords: ['markdown', '表格', 'table', 'md表格', 'csv', '表格生成', 'markdown表格'] },
    ],
  },
  {
    id: 'media',
    name: '图片处理',
    icon: Image,
    color: 'text-pink-500',
    tools: [
      { id: 'image-crop', name: '图片裁剪工具', description: '纯前端自由比例与固定比例图片裁剪与精准导出', path: '/media/image-crop', icon: Crop, keywords: ['裁剪', '图片裁剪', '选区', 'crop', '尺寸截取'] },
      { id: 'image-resize', name: '在线缩放照片', description: '高画质按百分比或像素缩放照片尺寸，支持锁定长宽比', path: '/media/image-resize', icon: Maximize2, keywords: ['缩放', '图片缩放', '照片缩放', '长宽比', 'resize', '像素缩放'] },
      { id: 'exif-viewer', name: '照片Exif信息查看与清除', description: '解析相机光圈、快门、ISO、焦距、拍摄时间与一键隐私脱敏', path: '/media/exif', icon: Camera, keywords: ['exif', '照片信息', '相机参数', '光圈', '快门', 'gps', '清除隐私', '摄影'] },
      { id: 'signature-extract', name: '手写签名提取工具', description: '手机拍摄白纸黑字签名，智能去除背景阴影提取透明 PNG 印章', path: '/media/signature-extract', icon: Feather, keywords: ['签名提取', '手写签名', '白底抠图', '透明签名', '公章提取'] },
      { id: 'image-to-pdf', name: '图片批量转 PDF', description: '多张图片纯前端打包合成高清 PDF 文档，支持纸张规格与边距', path: '/media/image-to-pdf', icon: FileText, keywords: ['图片转pdf', 'pdf生成', 'img2pdf', 'a4', '导出pdf'] },
      { id: 'doodle-board', name: '在线涂鸦绘画板', description: '白板手绘涂鸦，支持画笔、几何图形、橡皮擦、撤销重做与导出', path: '/media/doodle-board', icon: PenTool, keywords: ['涂鸦', '画板', '手绘', '白板', '草图', '画画'] },
      { id: 'avatar-frame', name: '专属节日头像制作', description: '微信头像一键加国旗红心、祥云金龙、赛博光环边框挂件', path: '/media/avatar-frame', icon: Sparkles, keywords: ['国旗头像', '龙年头像', '头像框', '节日挂件', '微信头像', '抗战胜利头像'] },
      { id: 'id-photo-std', name: '证件照换底色与排版', description: '对齐国家标准尺寸（一寸/二寸/护照等），智能抠图换底与6寸冲印排版', path: '/media/id-photo-std', icon: Printer, keywords: ['证件照换底色', '红底变蓝底', '白底照', '6寸排版', '冲印', '尺寸规范'] },
      { id: 'image-grayscale', name: '灰度图与黑白图制作', description: '心理学加权灰度、高对比二值化、负片反相与复古老照片', path: '/media/grayscale', icon: Layers, keywords: ['灰度图', '黑白图', '二值化', '反色', '复古', '印章黑白'] },
      { id: 'favicon-gen', name: 'Favicon 图标生成', description: '上传图片自动裁剪生成 16/32/48/64/128 多尺寸 ICO 网站图标', path: '/media/favicon-gen', icon: Crop, keywords: ['favicon', 'ico', '网站图标', '图标生成', 'icon'] },
      { id: 'gif-frames', name: 'GIF 动画分解成帧', description: '在线将 GIF 动图逐帧分解并提供单帧下载与预览', path: '/media/gif-frames', icon: Film, keywords: ['gif', 'gif分解', '逐帧', '动图', '帧图'] },
      { id: 'image-convert', name: '图片格式转换', description: 'PNG/JPG/WEBP 等图片格式相互转换与下载', path: '/media/image-convert', icon: ArrowLeftRight, keywords: ['图片转换', 'jpg转png', 'png转jpg', 'webp', '格式转换'] },
      { id: 'nine-grid', name: '九宫格切图', description: '一键将照片均匀切成9张九宫格图片(朋友圈/微博必备)', path: '/media/nine-grid', icon: Grid, keywords: ['九宫格', '切图', '朋友圈', '微博', '图片分割'] },
      { id: 'watermark', name: '图片加水印', description: '在线为图片添加自定义文字水印、平铺防盗水印', path: '/media/watermark', icon: Stamp, keywords: ['水印', '加水印', '防盗图', '文字水印', 'watermark'] },
      { id: 'image-transform', name: '图片旋转与缩放', description: '图片顺逆时针旋转、水平垂直翻转与自由缩放', path: '/media/image-transform', icon: RotateCw, keywords: ['旋转', '翻转', '缩放', '镜像', 'resize'] },
      { id: 'image-filters', name: '黑白与灰度滤镜', description: '一键将图片转换为黑白、灰度图、反相负片或复古滤镜', path: '/media/image-filters', icon: Wand2, keywords: ['黑白图', '灰度图', '滤镜', '反相', '复古'] },
      { id: 'image-picker', name: '图片取色器', description: '上传图片鼠标吸取像素颜色并自动提取主题调色盘', path: '/media/image-picker', icon: Pipette, keywords: ['取色器', '吸色', '图片颜色', '调色板', 'palette'] },
      { id: 'placeholder', name: '占位图片生成', description: '自定义宽高、背景颜色与文字生成前端占位图', path: '/media/placeholder', icon: Crop, keywords: ['占位图', 'placeholder', '图片生成', '尺寸图'] },
      { id: 'text-to-image', name: '文字生成图片', description: '将长文、便签、代码排版渲染导出为精美图片卡片', path: '/media/text-to-image', icon: TypeIcon, keywords: ['文字转图片', '便签', '长图', '生成图片'] },
      { id: 'signature-pad', name: '手写签名与画板', description: '纯前端手写毛笔签名、涂鸦白板并导出透明背景图', path: '/media/signature-pad', icon: PenTool, keywords: ['手写签名', '签名', '涂鸦', '画板', '透明图'] },
      { id: 'id-photo', name: '证件照尺寸标准', description: '常用一寸/二寸证件照规范尺寸速查与一键裁剪', path: '/media/id-photo', icon: Crop, keywords: ['证件照', '一寸', '二寸', '寸照', '裁剪', '尺寸'] },
      { id: 'image-base64', name: '图片 ↔ Base64', description: '本地图片转换为 Base64 编码，或 Base64 预览还原图片', path: '/media/image-base64', icon: Image, keywords: ['图片', 'base64', 'image', 'dataurl', '转图', '图标'] },
      { id: 'image-compress', name: '纯前端图片压缩', description: '纯前端调整图片分辨率与质量压缩，无须上传', path: '/media/image-compress', icon: Minimize, keywords: ['图片压缩', '压缩', '缩放', '图片大小', 'compress'] },
    ],
  },
  {
    id: 'ref',
    name: '开发参考速查',
    icon: BookOpen,
    color: 'text-indigo-500',
    tools: [
      { id: 'git-commands', name: 'Git 常用命令速查', description: '提交流程、分支合并、版本回滚等 Git 高频操作大全', path: '/ref/git-commands', icon: GitBranch, keywords: ['git', '命令', '版本控制', '分支', 'commit', 'rebase', 'merge'] },
      { id: 'http-status', name: 'HTTP 状态码速查', description: '1xx 到 5xx 完整 HTTP 响应状态码及含义说明', path: '/ref/http-status', icon: Network, keywords: ['http', '状态码', 'status', '200', '404', '500', '302', '网络'] },
      { id: 'mime-type', name: 'MIME 类型速查', description: '常见文件后缀与 Content-Type 对照检索', path: '/ref/mime-type', icon: Table, keywords: ['mime', 'content-type', '文件类型', '后缀', 'header'] },
      { id: 'ports', name: '常用端口对照表', description: '常见网络协议与知名系统/服务端口速查', path: '/ref/ports', icon: HardDrive, keywords: ['端口', 'port', '80', '443', '3306', '6379', '服务', '网络'] },
      { id: 'ascii', name: 'ASCII 码速查表', description: '标准 0-127 ASCII 对照表与字符进制转换', path: '/ref/ascii', icon: Binary, keywords: ['ascii', '字符码', '对照表', '编码', '十进制', '十六进制'] },
      { id: 'linux-commands', name: 'Linux 常用命令', description: '分类检索常见 Linux 运维与开发高频命令速查', path: '/ref/linux-commands', icon: Terminal, keywords: ['linux', '命令', 'shell', 'bash', '运维', 'centos', 'ubuntu'] },
      { id: 'mirror-registry', name: '开源镜像换源速查', description: 'npm、pip、composer、maven、docker 等国内极速镜像源配置与一键命令', path: '/ref/mirrors', icon: DownloadCloud, keywords: ['镜像源', 'npm淘宝源', 'pip清华源', 'docker镜像', 'maven阿里源', '换源'] },
      { id: 'public-dns', name: '公共 DNS 与 IPv6 大全', description: '阿里、腾讯、114、谷歌、Cloudflare 等纯净 IPv4/IPv6 DNS 地址与测速参考', path: '/ref/dns', icon: Server, keywords: ['dns', '公共dns', '阿里dns', '腾讯dns', 'ipv6', '114dns', 'cloudflare'] },
      { id: 'emoji-symbols', name: 'Emoji 与特殊符号大全', description: '收录数千款精选 Emoji 表情、数学、箭头、货币、希腊字母与序号，一键复制', path: '/ref/emojis', icon: Smile, keywords: ['emoji', '表情符号', '特殊字符', '符号大全', '特殊符号', '标点'] },
      { id: 'keyboard-symbols', name: '键盘符号中英文名称', description: '键盘全部符号标准中英文发音、音标与转义规范对照表', path: '/ref/keyboard-symbols', icon: Keyboard, keywords: ['键盘符号', '符号英文', '音标', '发音', '转义符', '波浪号'] },
      { id: 'operator-precedence', name: '运算符优先级对照表', description: 'JS / Python / C / C++ / Java / PHP 语言运算符优先级与结合性对照防坑', path: '/ref/precedence', icon: Code2, keywords: ['运算符', '优先级', '结合性', '三元', '位运算', 'js优先级'] },
      { id: 'periodic-table', name: '化学元素周期表', description: '交互式 118 种元素周期律排布、原子量、电负性、电子排布与中英文速查', path: '/ref/periodic-table', icon: Atom, keywords: ['元素周期表', '化学元素', '原子序数', '原子量', '周期律', '化学'] },
      { id: 'android-permissions', name: 'Android 权限清单大全', description: 'Android 常用与危险运行时权限清单、版本说明与 AndroidManifest.xml 复制', path: '/ref/android-permissions', icon: ShieldCheck, keywords: ['android权限', '安卓权限', '危险权限', 'manifest', 'uses-permission', '权限申请'] },
      { id: 'js-events', name: 'JavaScript 事件速查', description: '鼠标、键盘、表单、触摸、剪贴板、视口生命周期等 DOM 事件冒泡属性速查', path: '/ref/js-events', icon: Zap, keywords: ['js事件', 'javascript事件', 'event', 'click', 'keydown', '冒泡'] },
      { id: 'web-fonts', name: '网页常用安全字体栈', description: '主流平台无衬线、宋体、楷体、等宽代码字体 CSS 回退栈参考与实时预览', path: '/ref/web-fonts', icon: TypeIcon, keywords: ['字体', 'web字体', 'font-family', '安全字体', '苹方', '微软雅黑', '等宽'] },
    ],
  },
  {
    id: 'misc',
    name: '其他实用工具',
    icon: ScanSearch,
    color: 'text-orange-500',
    tools: [
      { id: 'mock-data', name: '多格式随机数据生成器', description: '一键生成高仿真测试数据集，支持 JSON / YAML / CSV / TSV / TOML 并导出文件', path: '/misc/mock-data', icon: Database, keywords: ['yaml生成', 'csv生成', 'tsv生成', 'toml生成', 'mock数据', '测试数据'] },
      { id: 'renovation-calc', name: '装修建材用量计算器', description: '家庭装修地砖、墙砖、木地板、壁纸、乳胶漆涂料精准耗量与预算估算', path: '/misc/renovation-calc', icon: Home, keywords: ['地砖计算', '墙砖计算', '地板用量', '壁纸计算', '涂料计算', '装修计算器'] },
      { id: 'qr-decode', name: '二维码在线识别', description: '上传或拖拽二维码图片，纯前端秒级解码识别内容', path: '/misc/qr-decode', icon: Scan, keywords: ['二维码解码', '识别二维码', '扫码', 'qr decode', '二维码读取'] },
      { id: 'unit-converter', name: '单位换算器', description: '存储数据 (B/KB/MB/GB) 与前端 CSS (px/rem/em/vw) 单位换算', path: '/misc/unit-converter', icon: Scale, keywords: ['单位换算', 'rem转px', 'px转rem', '存储容量', '数据换算'] },
      { id: 'timestamp', name: '时间戳转换', description: 'Unix 时间戳与日期时间互相转换', path: '/misc/timestamp', icon: Clock, keywords: ['时间戳', 'timestamp', 'unix', '日期', '时间'] },
      { id: 'color', name: '颜色转换', description: 'HEX、RGB、HSL 颜色值互相转换', path: '/misc/color', icon: Palette, keywords: ['颜色', 'color', 'hex', 'rgb', 'hsl', '取色'] },
      { id: 'cron', name: 'Cron 表达式', description: 'Cron 定时表达式生成与解析', path: '/misc/cron', icon: Timer, keywords: ['cron', '定时', '表达式', '任务', 'schedule'] },
      { id: 'password', name: '密码生成', description: '随机密码与安全字符串生成', path: '/misc/password', icon: KeyRound, keywords: ['密码', 'password', '随机', '生成', 'random'] },
      { id: 'qrcode', name: '二维码生成', description: '将文本或网址转为二维码图片', path: '/misc/qrcode', icon: QrCode, keywords: ['二维码', 'qrcode', 'qr', '生成'] },
      { id: 'user-agent', name: 'User-Agent 分析器', description: '分析当前或输入的 UA 浏览器、操作系统与设备', path: '/misc/user-agent', icon: Monitor, keywords: ['ua', 'user-agent', '浏览器', '操作系统', '设备', '解析'] },
      { id: 'barcode-gen', name: '条形码在线生成器', description: '纯前端 Code 128 条形码在线生成、尺寸调整与导出', path: '/misc/barcode', icon: Barcode, keywords: ['条形码', '条码', 'barcode', 'code128', '条形码生成'] },
      { id: 'lunar-calendar', name: '阴阳历与十二时辰', description: '农历公历互转、生肖干支纪年与古代十二时辰推算', path: '/misc/lunar', icon: Calendar, keywords: ['农历', '阴历', '阳历', '生肖', '时辰', '干支', '节气'] },
      { id: 'keycode-tester', name: '键盘 KeyCode 测试', description: '按下任意键捕捉 event.key/code/keyCode 与全键盘编码速查', path: '/misc/keycode', icon: Keyboard, keywords: ['keycode', '键盘测试', '按键码', 'key', 'code', 'which'] },
      { id: 'chart-generator', name: '轻量数据图表生成器', description: '在线可视化配置饼图、柱状图、折线图、环形图并导出 SVG/PNG', path: '/misc/charts', icon: BarChart3, keywords: ['图表', '饼图', '柱状图', '折线图', 'chart', '可视化'] },
      { id: 'perception-lab', name: '反应速度与色盲自测', description: '电竞级毫秒反应速度变色测速与经典假同色图卡色盲色弱自测', path: '/misc/perception', icon: Zap, keywords: ['反应速度', '色盲测试', '色弱', '眼力测试', '测速'] },
      { id: 'disk-bandwidth', name: '硬盘整数分区与带宽', description: 'Windows 硬盘无损整数分区 MB 换算与千兆宽带下载耗时计算', path: '/misc/disk-calc', icon: HardDrive, keywords: ['硬盘分区', '整数分区', '带宽计算', '网速', '下载耗时'] },
      { id: 'health-calc', name: '健康指数与血型遗传', description: 'BMI 体质评估、BMR 基础代谢与 TDEE 消耗、ABO 父母子女血型推算', path: '/misc/health', icon: HeartPulse, keywords: ['bmi', 'bmr', '基础代谢', '热量', '血型遗传', '血型计算'] },
      { id: 'timer-lucky', name: '秒表倒计时与随机点名', description: '毫秒计次秒表、会议发言倒计时与随机点名抽签转盘', path: '/misc/timer-lucky', icon: Flag, keywords: ['秒表', '倒计时', '计时器', '随机点名', '抽签', '抽奖'] },
      { id: 'grid-paper', name: '格子纸与书法练字帖', description: '生成可打印的米字格、田字格、坐标方格纸、点阵手账纸 A4 版', path: '/misc/grid-paper', icon: Grid, keywords: ['格子纸', '米字格', '田字格', '练字帖', '方格纸', '点阵纸'] },
      { id: 'file-inspector', name: '文件格式与魔数识别', description: '读取 16 进制文件头 Magic Bytes 魔数，识别真实格式防止扩展名伪装', path: '/misc/file-inspector', icon: FileQuestion, keywords: ['文件格式识别', '魔数', 'magic bytes', '文件头', '伪装检测'] },
    ],
  },
]

export const allTools: ToolInfo[] = categories.flatMap(c => c.tools)

export function searchTools(query: string): ToolInfo[] {
  if (!query.trim()) return allTools
  const q = query.toLowerCase()
  return allTools.filter(
    tool =>
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some(k => k.includes(q))
  )
}

export function getToolByPath(path: string): ToolInfo | undefined {
  return allTools.find(t => t.path === path)
}

export function getCategoryByToolPath(path: string): CategoryInfo | undefined {
  return categories.find(c => c.tools.some(t => t.path === path))
}
