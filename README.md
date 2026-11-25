# DevToolBox - 现代全功能开发者工具箱

> 深度复刻并全面超越 bejson.com 的一站式本地化开发者在线工具箱。采用现代化前端技术栈，100% 纯前端离线安全计算，支持暗色主题、快捷搜索、移动端自适应与 Docker 极速容器化部署。

---

## 🌟 核心特性与亮点 (相比原版 bejson.com)

1. **绝对安全无泄漏**：所有 JSON 格式化、文本对比、对称加解密、编解码、图片处理（裁剪/水印/滤镜/取色等）100% 在浏览器本地客户端执行，没有任何后端服务器上传或日志留存。
2. **现代交互与设计**：基于 React 18 + Tailwind CSS，原生支持深色/浅色模式无缝切换，精细打磨移动端自适应体验。
3. **全局极速唤出**：支持键盘快捷键 `Ctrl + K`（或 `Cmd + K`）秒级模糊搜索定位 **107 款** 实用工具。
4. **实时双向联动**：支持输入实时解析、即时校验定位行号、一键复制、一键文件导入与导出。
5. **高度整合与升级**：拒绝原版将相似工具拆成几十个页面的冗余设计，将图片转换、多语言格式化、全币种大写、多维文本清洗高度收拢为现代化多合一工具。
6. **零配置极速部署**：纯静态资源输出，支持一键部署到 GitHub Pages、Vercel、Cloudflare Pages、Docker Nginx 等任意静态 Web 服务。

---

## 🛠️ 工具全景列表 (10 大分类 · 107 个核心工具)

### 1. JSON 核心工具
- **JSON 格式化/校验**：缩进控制、键名排序、错误精确定位、一键压缩/美化
- **JSON 树形视图 (Tree View)**：交互式节点折叠展开、类型徽标与结构审阅
- **JSON 单行压缩与转义**：一键去除换行并转义双引号 (适合配置与命令行注入)
- **JSON 字符转义**：双向转义与反转义特殊字符
- **JSONPath 查询**：高效查询筛选嵌套 JSON 数据
- **JSON 结构对比**：可视化高亮差异对比
- **JSON → TypeScript**：自动推导 Interface 类型定义
- **JSON → Go Struct**：生成带 json tag 的 Go 语言结构体
- **JSON → Java Class**：生成 POJO/Bean 实体类及 Get/Set
- **JSON → C# Class**：生成 Newtonsoft.Json 规范 C# 实体类
- **JSON Schema 生成**：快速生成 draft-07 标准模式契约
- **JSON 随机 Mock 生成**：根据规则批量生成姓名、手机号、日期等 Mock 数据

### 2. 跨格式互转与代码生成
- **全币种数字金额与支票大写**：人民币、美元、欧元、英镑、日元等金额大写与银行支票出票日期标准规范
- **cURL 命令转主流代码**：一键转换 cURL 为 Fetch API、Axios、Python requests 与 Go net/http
- **HTML ↔ Markdown 互转**：网页 HTML 标签与 Markdown 富文本双向转换
- **JSON ↔ YAML / XML / CSV / TOML**
- **Java Properties ↔ JSON**
- **进制转换器 (Radix)**：2/8/10/16 进制及 2-36 任意进制双向即时换算
- **URL 参数 ↔ JSON**：URL QueryString 与格式化 JSON 对象双向解析

### 3. 网络与接口调试
- **HTTP 接口在线调试 (HttpClient)**：浏览器离线模拟 GET/POST/PUT/DELETE 请求与 Header 注入
- **Robots.txt 协议生成器**：百度/谷歌/必应爬虫规范在线配置与 Sitemap 声明
- **.htpasswd 认证文件生成器**：Nginx 与 Apache HTTP 基础认证密码列表生成
- **CIDR 子网掩码计算**：IP 地址与掩码位换算网络地址、广播地址、可用 IP 范围与主机数
- **WebSocket 在线测试**：模拟客户端在线连接 ws:// 与 wss://，消息实时收发与记录流

### 4. 编码 / 解码
- **Base64 编解码**：支持 UTF-8 中文及安全字符集
- **URL 编解码**：`encodeURIComponent` 与 `decodeURIComponent`
- **Unicode 编解码**：`\uXXXX` 格式双向互转
- **HTML 实体编解码**：防止 XSS 或还原 HTML 特殊符号
- **JWT 令牌解析**：分色可视化解析 Header、Payload，过期时间校验
- **摩斯电码 (Morse Code)**：文本与摩斯密码双向互转，支持 Web Audio 模拟发声

### 5. 加密 / 哈希 / 校验
- **大文件本地哈希校验 (FileHash)**：离线秒级计算大文件 MD5/SHA-1/SHA-256 校验码与防篡改比对
- **MD5 / SHA-1 / SHA-256 / SHA-512 计算**
- **HMAC 消息认证**：支持带密钥的消息摘要签名
- **AES 对称加解密**：AES-CBC 等多模式加解密测试
- **DES / 3DES 对称加解密**
- **RSA 密钥对生成与加解密**：非对称公私钥对生成与解密测试
- **CRC32 校验码**：循环冗余校验值计算 (Hex / Dec)
- **UUID / GUID 生成**：v4 唯一标识批量快速生成

### 6. 代码美化 / 生成
- **多语言通用代码美化 (CodeFormatUniversal)**：Python/Java/C/C++/C#/PHP/Go 语法缩进与紧凑压缩
- **Headers / Cookie / 参数格式化**：HTTP 请求头、Cookie 与 URL Get 参数解析与转 JSON
- **CSS 现代视觉生成器**：不规则圆角 (Organic Radius)、CSS几何三角形、毛玻璃 (Glassmorphism) 与立体按钮
- **HTML / CSS / JavaScript 格式化与压缩**
- **SQL 格式化**：支持 MySQL, PostgreSQL, Oracle 等方言
- **XML 格式化与排版**

### 7. 文字与排版处理
- **身份证合规校验与生日提取 (IdCardValidator)**：18位身份证合规校验、提取生日、性别、年龄与省市行政区划
- **文本排版与多维批量清洗 (TextArrange)**：古典文字竖排、多行合并单行、随机打乱、分列提取与过滤
- **ASCII 艺术字与字符画 (AsciiArt)**：输入文字生成终端 CLI Banner、线条艺术字与空心大字
- **在线文本 Diff 对比**：精准比对行变动增删
- **文本查找与正则替换**：普通/全局/正则表达式批量匹配替换文本
- **汉字转拼音**：中文汉字快速转换为全拼、带声调或首字母缩写
- **正则表达式测试**：实时匹配、捕获组分析、内建常用国内正则大全
- **文本统计与词频**：字符数、单词数、中英文字数、UTF-8 字节统计
- **文本批量行处理**：每行批量添加统一前后缀、行关键字包含/剔除过滤
- **文本去重与排序**：字典升序/降序、过滤空行、反转打乱
- **Markdown 实时预览**：双栏实时渲染富文本与表格代码
- **火星文 / 趣味字体转换器**：怀旧火星文、菊花文挂件、删除线文字与防折叠间隔字
- **随机数据批量生成器**：批量生成中文姓名、手机号、邮箱、IP、MAC 地址等测试样本

### 8. 图片多媒体处理 (对齐并超越原站)
- **图片裁剪在线工具 (ImageCrop)**：自由选区与 1:1、4:3、16:9 等多种比例裁剪与导出
- **在线缩放照片 (ImageResize)**：高画质按百分比或像素缩放照片尺寸，支持长宽比锁定
- **照片 Exif 信息查看与清除 (ExifViewer)**：解析相机光圈、快门、ISO、焦距、拍摄时间与一键隐私脱敏
- **手写签名提取工具 (SignatureExtract)**：手机拍摄白纸黑字签名，智能去除背景阴影提取透明 PNG 印章
- **图片批量转 PDF 文档 (ImageToPdf)**：多张图片纯前端打包合成高清 PDF 文档，支持纸张规格与边距
- **在线涂鸦绘画板 (DoodleBoard)**：白板手绘涂鸦，支持画笔、几何图形、橡皮擦、撤销重做与导出
- **专属节日头像制作 (AvatarFrame)**：微信头像一键加国旗红心、祥云金龙、赛博光环边框挂件
- **证件照换底色与排版一体机 (IdPhotoStandard)**：对齐国家标准尺寸（一寸/二寸/护照等），智能抠图换底与 6寸相纸自动排版冲印版
- **灰度图与黑白图制作 (ImageGrayscale)**：心理学加权灰度、高对比二值化、负片反相与复古老照片
- **Favicon 图标生成器**：裁剪生成 16/32/48/64/128 多尺寸 ICO 网站图标
- **GIF 动画分解成帧 (GifFrames)**：逐帧分解动图并提供单帧下载
- **万能图片格式转换 (ImageConvert)**：PNG/JPG/WEBP 等图片格式相互转换
- **九宫格切图 (NineGrid)**：朋友圈/微博切图
- **图片水印处理 (Watermark)**：平铺防盗文字水印
- **图片旋转与缩放 (ImageTransform)**
- **图片取色器 (ImagePicker)**：吸管取色并自动提取调色盘
- **占位图生成器 (Placeholder)**
- **纯前端图片压缩 (ImageCompress)**：无损/有损分辨率压缩
- **图片 ↔ Base64 双向转换**

### 9. 开发参考速查
- **Git 常用命令速查**
- **HTTP 响应状态码大全**
- **常见 MIME 类型速查**
- **常用网络端口对照表**
- **ASCII 码表与控制字符对照**
- **Linux 运维常用命令检索**

### 10. 日常辅助工具
- **二维码在线识别 (QrDecode)**：纯前端识别本地图片中的二维码内容
- **纯前端二维码生成 (QrCode)**
- **多维度单位换算器 (UnitConverter)**：存储大小 (B/KB/MB/GB) 与 CSS (px/rem/vw)
- **Unix 时间戳转换 (Timestamp)**
- **HEX / RGB / HSL 颜色转换器**
- **Cron 表达式生成与自然语言解析**
- **高安全随机密码生成器**
- **User-Agent 浏览器与系统分析器**

---

## 🚀 本地开发与生产构建

### 1. 环境依赖
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. 安装依赖并启动
```bash
cd devtoolbox
npm install
npm run dev -- --host
```
访问本地开发服务：`http://localhost:5173/`

### 3. 生产打包构建
```bash
npm run build
```
静态产物将编译输出至 `dist/` 目录。

### 4. Docker 容器化一键部署
项目根目录下内建了高生产级别的 `Dockerfile` 与 `nginx.conf`：
```bash
# 构建镜像
docker build -t devtoolbox:latest .

# 启动容器
docker run -d -p 8080:80 --name devtoolbox-app devtoolbox:latest
```
浏览器访问 `http://localhost:8080/` 即可秒级开启全功能开发者工具箱！
