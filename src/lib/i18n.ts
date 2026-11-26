export type Language = 'zh-CN' | 'en-US' | 'ja-JP';

export interface TranslationDictionary {
  // App brand & common
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  searchShortcut: string;
  clientOnlyNotice: string;
  toggleTheme: string;
  lightMode: string;
  darkMode: string;
  languageSelect: string;
  home: string;
  tools: string;
  categories: string;
  allTools: string;
  noResults: string;
  copy: string;
  copied: string;
  clear: string;
  paste: string;
  reset: string;
  export: string;
  import: string;
  download: string;
  upload: string;
  format: string;
  minify: string;
  input: string;
  output: string;

  // Home Features
  featureRealtime: string;
  featureClientOnly: string;
  featureDarkMode: string;
  featureSearch: string;
  heroTitle: string;
  heroSubtitle: string;
  homeIntroTitle: string;
  homeIntroP1: string;
  homeIntroP2: string;

  // Categories
  catJson: string;
  catConvert: string;
  catNet: string;
  catEncode: string;
  catCrypto: string;
  catFormat: string;
  catCss: string;
  catText: string;
  catImage: string;
  catRef: string;
  catMisc: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  'zh-CN': {
    appName: 'DevToolBox',
    tagline: '现代化极速开发者全能离线工具箱',
    searchPlaceholder: '搜索工具、代码或关键字...',
    searchShortcut: 'Ctrl+K',
    clientOnlyNotice: '纯前端运行 · 数据零上传',
    toggleTheme: '切换明暗主题',
    lightMode: '浅色模式',
    darkMode: '深色模式',
    languageSelect: '切换语言 (Language)',
    home: '首页',
    tools: '工具',
    categories: '分类',
    allTools: '全部工具',
    noResults: '未找到相关工具',
    copy: '复制',
    copied: '已复制',
    clear: '清空',
    paste: '粘贴',
    reset: '重置',
    export: '导出',
    import: '导入',
    download: '下载',
    upload: '上传',
    format: '美化格式化',
    minify: '压缩紧凑',
    input: '输入内容',
    output: '输出结果',

    featureRealtime: '即时响应 · 毫秒转换',
    featureClientOnly: '纯前端处理 · 数据不上传',
    featureDarkMode: '深色模式 · 护眼沉浸',
    featureSearch: 'Ctrl+K 全局快速搜索',
    heroTitle: '开发者工具箱',
    heroSubtitle: '全套 138 个常用开发工具，覆盖 JSON、编解码、加解密、格式转换、图片媒体、文本处理与速查对照，100% 离线运行。',
    homeIntroTitle: '关于 DevToolBox',
    homeIntroP1: 'DevToolBox 是一个免费在线开发者工具箱，提供 138 个常用工具，涵盖 JSON 处理、格式转换、编解码、加密哈希、代码格式化、文本处理、图片处理和开发速查。所有工具都在浏览器本地运行，数据不会上传到任何服务器，打开即用，无需注册登录。',
    homeIntroP2: '无论是格式化一段 JSON、生成二维码、计算文件哈希，还是查询 HTTP 状态码、转换时间戳，都可以在这里一键完成。支持深色模式、快捷键搜索（Ctrl+K）和中英日三语界面，手机和电脑都能用。',

    catJson: 'JSON 工具',
    catConvert: '格式转换',
    catNet: '网络与接口',
    catEncode: '编码解码',
    catCrypto: '加密解密',
    catFormat: '代码格式化',
    catCss: 'CSS 布局',
    catText: '文本与代码处理',
    catImage: '图片与多媒体',
    catRef: '开发参考速查',
    catMisc: '实用辅助工具'
  },
  'en-US': {
    appName: 'DevToolBox',
    tagline: 'Modern High-Performance Developer Toolbox',
    searchPlaceholder: 'Search tools, code, or keywords...',
    searchShortcut: 'Ctrl+K',
    clientOnlyNotice: '100% Client-Side · Zero Data Upload',
    toggleTheme: 'Toggle Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    languageSelect: 'Switch Language',
    home: 'Home',
    tools: 'Tools',
    categories: 'Categories',
    allTools: 'All Tools',
    noResults: 'No tools found',
    copy: 'Copy',
    copied: 'Copied',
    clear: 'Clear',
    paste: 'Paste',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
    format: 'Format & Prettify',
    minify: 'Minify',
    input: 'Input',
    output: 'Output',

    featureRealtime: 'Realtime Response',
    featureClientOnly: 'Client-side Only, Zero Upload',
    featureDarkMode: 'Dark Mode Support',
    featureSearch: 'Ctrl+K Quick Search',
    heroTitle: 'Developer Toolbox',
    heroSubtitle: '138 offline developer utilities: JSON, encoders, cryptography, converters, image media, and technical references.',
    homeIntroTitle: 'About DevToolBox',
    homeIntroP1: 'DevToolBox is a free online developer toolbox with 138 handy tools for JSON, format conversion, encoding, encryption & hashing, code formatting, text processing, image tools and quick references. Every tool runs locally in your browser — no uploads, no sign-up, just open and use.',
    homeIntroP2: 'Format a JSON snippet, generate a QR code, hash a file, look up HTTP status codes or convert a timestamp — it is all one click away. Dark mode, Ctrl+K quick search and Chinese, English and Japanese interfaces work on desktop and mobile.',

    catJson: 'JSON Utilities',
    catConvert: 'Format Converters',
    catNet: 'Network & API',
    catEncode: 'Encoders & Decoders',
    catCrypto: 'Cryptography & Hashes',
    catFormat: 'Code Formatters',
    catCss: 'CSS Layout',
    catText: 'Text & Regex Tools',
    catImage: 'Image & Media',
    catRef: 'Quick References',
    catMisc: 'Misc & Utilities'
  },
  'ja-JP': {
    appName: 'DevToolBox',
    tagline: 'モダンで高速なオフライン開発者ツールボックス',
    searchPlaceholder: 'ツール名、コード、キーワードを検索...',
    searchShortcut: 'Ctrl+K',
    clientOnlyNotice: '完全クライアント側処理 · データ送信なし',
    toggleTheme: 'テーマ切り替え',
    lightMode: 'ライトモード',
    darkMode: 'ダークモード',
    languageSelect: '言語切り替え (Language)',
    home: 'ホーム',
    tools: 'ツール',
    categories: 'カテゴリ',
    allTools: 'すべてのツール',
    noResults: '一致するツールが見つかりません',
    copy: 'コピー',
    copied: 'コピー完了',
    clear: 'クリア',
    paste: '貼り付け',
    reset: 'リセット',
    export: 'エクスポート',
    import: 'インポート',
    download: 'ダウンロード',
    upload: 'アップロード',
    format: '整形・フォーマット',
    minify: '圧縮 (Minify)',
    input: '入力',
    output: '出力',

    featureRealtime: 'ミリ秒単位のリアルタイム変換',
    featureClientOnly: 'クライアント限定 · データ通信なし',
    featureDarkMode: '目に優しいダークモード',
    featureSearch: 'Ctrl+K 高速インクリメンタル検索',
    heroTitle: '開発者ツールボックス',
    heroSubtitle: 'JSON整形、暗号化、エンコード/デコード、画像処理、コマンド早見表など138の必須ツールをオフラインで一括提供。',
    homeIntroTitle: 'DevToolBox について',
    homeIntroP1: 'DevToolBox は 138 の便利なツールを備えた無料のオンラインデベロッパーツールボックスです。JSON 処理、フォーマット変換、エンコード、暗号化・ハッシュ、コード整形、テキスト処理、画像処理、リファレンスをカバーします。すべてのツールはブラウザ内でローカルに動作し、データがサーバーにアップロードされることはありません。登録不要で、開くだけで使えます。',
    homeIntroP2: 'JSON の整形、QR コードの生成、ファイルハッシュの計算、HTTP ステータスコードの確認、タイムスタンプの変換など、すべてワンクリックで完了します。ダークモード、Ctrl+K クイック検索、中国語・英語・日本語インターフェースに対応し、PC でもスマホでも使えます。',

    catJson: 'JSON ツール',
    catConvert: 'フォーマット変換',
    catNet: 'ネットワーク＆API',
    catEncode: 'エンコード / デコード',
    catCrypto: '暗号化・ハッシュ',
    catFormat: 'コード整形',
    catCss: 'CSS レイアウト',
    catText: 'テキスト・文字列処理',
    catImage: '画像＆メディア処理',
    catRef: '開発リファレンス・早見表',
    catMisc: '実用ユーティリティ'
  }
};

export const toolTranslations: Record<Language, Record<string, { name: string; description: string }>> = {
  'zh-CN': {},
  'en-US': {
  "json-formatter": {
    "name": "JSON Formatter",
    "description": "Format, validate, beautify and minify JSON data"
  },
  "json-tree": {
    "name": "JSON Tree View",
    "description": "Interactive expandable nodes tree visualization"
  },
  "json-minify-escape": {
    "name": "JSON Minify & Escape",
    "description": "Compress JSON to single line with quote escaping"
  },
  "json-mock": {
    "name": "JSON Mock Generator",
    "description": "Generate mock dataset for testing and prototyping"
  },
  "json-escape": {
    "name": "JSON Escaper",
    "description": "Escape and unescape JSON string values"
  },
  "json-path": {
    "name": "JSONPath Evaluator",
    "description": "Filter and query JSON datasets with JSONPath"
  },
  "json-diff": {
    "name": "JSON Diff",
    "description": "Compare difference between two JSON payloads"
  },
  "json-to-typescript": {
    "name": "JSON → TypeScript",
    "description": "Generate TS interfaces and types from JSON"
  },
  "json-to-go": {
    "name": "JSON → Go Struct",
    "description": "Generate Golang struct definitions from JSON"
  },
  "json-to-java": {
    "name": "JSON → Java Class",
    "description": "Generate POJO class definitions from JSON"
  },
  "json-to-csharp": {
    "name": "JSON → C# Class",
    "description": "Generate C# models with annotations from JSON"
  },
  "json-schema": {
    "name": "JSON Schema Generator",
    "description": "Infer standard JSON Schema definitions"
  },
  "curl-to-code": {
    "name": "cURL to Code",
    "description": "Convert cURL requests to Fetch, Python, and Go code"
  },
  "json-to-sql": {
    "name": "JSON to SQL",
    "description": "Convert JSON object arrays to SQL INSERT queries"
  },
  "html-markdown": {
    "name": "HTML ↔ Markdown",
    "description": "Bidirectional converter between HTML and Markdown"
  },
  "json-yaml": {
    "name": "JSON ↔ YAML",
    "description": "Seamless conversion between JSON and YAML"
  },
  "json-xml": {
    "name": "JSON ↔ XML",
    "description": "Convert between JSON and XML structures"
  },
  "json-csv": {
    "name": "JSON ↔ CSV",
    "description": "Convert JSON to CSV spreadsheet formats"
  },
  "json-toml": {
    "name": "JSON ↔ TOML",
    "description": "Bidirectional JSON and TOML converter"
  },
  "json-properties": {
    "name": "Properties ↔ JSON",
    "description": "Java Properties to JSON config parser"
  },
  "radix": {
    "name": "Radix Base Converter",
    "description": "Convert between Binary, Octal, Decimal, Hex, and Base 2-36"
  },
  "rmb-capital": {
    "name": "RMB Capitalizer",
    "description": "Convert numbers to Chinese official uppercase amount"
  },
  "currency-capital": {
    "name": "Global Currency Capitalizer",
    "description": "Spell out numbers in USD, EUR, GBP, JPY, and check dates"
  },
  "query-string": {
    "name": "URL QueryString ↔ JSON",
    "description": "Parse URL query string to JSON object bidirectionally"
  },
  "http-client": {
    "name": "HTTP Client Tester",
    "description": "Lightweight in-browser API testing tool (GET/POST/PUT/DELETE)"
  },
  "cidr": {
    "name": "CIDR Subnet Calculator",
    "description": "Calculate IP ranges, network address and netmask bits"
  },
  "websocket": {
    "name": "WebSocket Online Tester",
    "description": "Connect to ws/wss endpoints and test realtime messaging"
  },
  "robots-gen": {
    "name": "Robots.txt Generator",
    "description": "Generate robots.txt crawl rules and sitemap directives"
  },
  "htpasswd-gen": {
    "name": ".htpasswd Auth Generator",
    "description": "Generate HTTP Basic Auth passwords for Nginx and Apache"
  },
  "url-encode": {
    "name": "URL Encode / Decode",
    "description": "Encode or decode standard URL components"
  },
  "base64": {
    "name": "Base64 Encode / Decode",
    "description": "Text and UTF-8 Base64 conversion"
  },
  "unicode": {
    "name": "Unicode Converter",
    "description": "Native Unicode character escape & conversion"
  },
  "html-entities": {
    "name": "HTML Entities",
    "description": "Escape HTML entities (&, <, >, quotes)"
  },
  "jwt": {
    "name": "JWT Token Inspector",
    "description": "Decode and inspect JWT headers, claims, and expiry"
  },
  "morse": {
    "name": "Morse Code Converter",
    "description": "Translate text to Morse code signals with audio playback"
  },
  "md5": {
    "name": "MD5 Hash",
    "description": "Calculate 128-bit MD5 checksums (hex & uppercase)"
  },
  "sha": {
    "name": "SHA-1 / SHA-256 / SHA-512",
    "description": "Standard secure cryptographic hash algorithms"
  },
  "hmac": {
    "name": "HMAC Generator",
    "description": "Keyed-hash message authentication code generator"
  },
  "aes": {
    "name": "AES Encrypt / Decrypt",
    "description": "AES-128/192/256 CBC & ECB mode cipher"
  },
  "des": {
    "name": "DES / 3DES Cipher",
    "description": "Standard Data Encryption Standard cipher"
  },
  "rsa": {
    "name": "RSA Key Pair & Cipher",
    "description": "Generate RSA key pairs and encrypt/decrypt text"
  },
  "crc32": {
    "name": "CRC32 Checksum",
    "description": "Calculate 32-bit cyclic redundancy check values"
  },
  "file-hash": {
    "name": "Browser File Hash Checker",
    "description": "Calculate SHA-256 / MD5 hash of local files securely"
  },
  "uuid": {
    "name": "UUID / NanoID Generator",
    "description": "Bulk generate RFC4122 UUID v4 and NanoIDs"
  },
  "html-format": {
    "name": "HTML Formatter & Minifier",
    "description": "Beautify messy HTML DOM or compress into single line"
  },
  "css-format": {
    "name": "CSS Formatter & Minifier",
    "description": "Clean CSS stylesheet layout and compress bundle size"
  },
  "css-generator": {
    "name": "CSS Triangle & Ribbon Generator",
    "description": "Generate pure CSS triangles and corner ribbon badges"
  },
  "css-visual": {
    "name": "CSS Visual Effects Studio",
    "description": "Visual designer for Box Shadow, Gradient, and Glassmorphism"
  },
  "js-format": {
    "name": "JavaScript Formatter",
    "description": "Prettify and clean up JavaScript source code"
  },
  "code-universal": {
    "name": "Universal Code Formatter",
    "description": "Format multi-language code: Python, Java, PHP, C++, Ruby"
  },
  "header-cookie": {
    "name": "HTTP Header & Cookie Parser",
    "description": "Parse raw HTTP headers and Cookie strings to JSON"
  },
  "sql-format": {
    "name": "SQL Formatter",
    "description": "Format and uppercase SQL queries (MySQL, PostgreSQL, Oracle)"
  },
  "xml-format": {
    "name": "XML Formatter & Minifier",
    "description": "Indent or minify XML documents with syntax validation"
  },
  "case-converter": {
    "name": "Letter Case Converter",
    "description": "Convert camelCase, snake_case, PascalCase, and kebab-case"
  },
  "text-diff": {
    "name": "Text Diff Checker",
    "description": "Side-by-side line & char diff comparison"
  },
  "regex-tester": {
    "name": "Regex Tester",
    "description": "Realtime regex testing, match highlighting, capture groups & replace"
  },
  "text-stats": {
    "name": "Text Word Counter",
    "description": "Count characters, words, lines, and reading time"
  },
  "text-replace": {
    "name": "Batch Text Replacer",
    "description": "Batch find, replace, and filter strings with regex"
  },
  "text-sort": {
    "name": "Text Line Sorter & Deduplicator",
    "description": "Sort lines alphabetically/numerically and deduplicate"
  },
  "text-reverse": {
    "name": "Text Inverter & Reverser",
    "description": "Reverse string characters or flip lines upside down"
  },
  "chinese-convert": {
    "name": "Simplified ↔ Traditional Chinese",
    "description": "Convert between Simplified and Traditional Chinese"
  },
  "pinyin": {
    "name": "Chinese Pinyin Annotator",
    "description": "Convert Chinese characters to Pinyin with tone marks"
  },
  "dbc-sbc": {
    "name": "Half-width ↔ Full-width Converter",
    "description": "Convert between half-width and full-width alphanumeric chars"
  },
  "mars-text": {
    "name": "Martian & Stylized Text",
    "description": "Convert text to retro Martian cipher, bubble, and aesthetic font"
  },
  "batch-process": {
    "name": "Batch String Formatter",
    "description": "Batch add prefix, suffix, line numbers, or join lines"
  },
  "idcard-validator": {
    "name": "ID Card Checksum Validator",
    "description": "Validate national ID card format and calculate 18th check digit"
  },
  "ascii-art": {
    "name": "ASCII Banner Font Generator",
    "description": "Generate Figlet ASCII art text banners for terminals"
  },
  "image-crop": {
    "name": "Image Cropper",
    "description": "Free and preset aspect ratio image cropping"
  },
  "image-resize": {
    "name": "Image Resizer",
    "description": "High quality image scaling by percentage or dimensions"
  },
  "exif-viewer": {
    "name": "Photo Exif Inspector & Cleaner",
    "description": "Inspect camera aperture, ISO, GPS coordinates and strip metadata"
  },
  "signature-extract": {
    "name": "Signature Stamp Extractor",
    "description": "Extract transparent signature seal from paper photos"
  },
  "image-to-pdf": {
    "name": "Images to PDF Converter",
    "description": "Package multiple images into standard A4 PDF documents"
  },
  "doodle-board": {
    "name": "Online Doodle & Whiteboard",
    "description": "Freehand sketching board with shapes, undo/redo, and export"
  },
  "avatar-frame": {
    "name": "Avatar Frame Decorator",
    "description": "Decorate social avatars with holiday ribbons and cyber rings"
  },
  "id-photo-std": {
    "name": "ID Photo Background & Layout",
    "description": "Standard passport photo resizing, background swap and 6-inch print grid"
  },
  "image-grayscale": {
    "name": "Grayscale & B/W Converter",
    "description": "Convert images to weighted grayscale, high-contrast B/W, or vintage sepia"
  },
  "favicon-gen": {
    "name": "Favicon Generator",
    "description": "Generate multi-resolution 16/32/48/64/128 ICO website icons"
  },
  "gif-frames": {
    "name": "GIF Frame Decompiler",
    "description": "Decompose animated GIF into individual frames for preview and download"
  },
  "image-convert": {
    "name": "Image Format Converter",
    "description": "Convert PNG, JPG, WebP, GIF, and AVIF formats"
  },
  "nine-grid": {
    "name": "Nine-Grid Image Slicer",
    "description": "Slice photo into 9 equal tiles for Instagram and social media"
  },
  "watermark": {
    "name": "Image Watermark Tool",
    "description": "Add custom text and tiled security watermarks to photos"
  },
  "image-transform": {
    "name": "Image Rotation & Flip",
    "description": "Rotate clockwise/counter-clockwise and flip horizontally/vertically"
  },
  "image-filters": {
    "name": "Photo Color Filters",
    "description": "Apply vintage, invert, high-contrast, and monochrome filters"
  },
  "image-picker": {
    "name": "Image Color Eyedropper",
    "description": "Pick pixel colors from uploaded image and extract theme palette"
  },
  "placeholder": {
    "name": "Placeholder Image Generator",
    "description": "Generate custom dimension placeholder graphics with text"
  },
  "text-to-image": {
    "name": "Text to Card Image",
    "description": "Render long text, notes, and code snippets into polished card images"
  },
  "signature-pad": {
    "name": "Signature Canvas & Paint",
    "description": "Draw calligraphy signatures on canvas and export transparent PNG"
  },
  "id-photo": {
    "name": "Passport Photo Specs",
    "description": "Quick reference for passport and visa photo dimensions with cropping"
  },
  "image-base64": {
    "name": "Image ↔ Base64",
    "description": "Convert local images to DataURL Base64 strings bidirectionally"
  },
  "image-compress": {
    "name": "Image Compressor",
    "description": "Client-side photo compression with quality slider"
  },
  "git-commands": {
    "name": "Git Command Cheat Sheet",
    "description": "Comprehensive guide for branching, commits, rebase, and recovery"
  },
  "http-status": {
    "name": "HTTP Status Codes",
    "description": "Complete 1xx to 5xx HTTP response status codes and explanations"
  },
  "mime-type": {
    "name": "MIME Types Lookup",
    "description": "File extensions and Content-Type headers dictionary"
  },
  "ports": {
    "name": "Common Network Ports",
    "description": "Standard network protocols and well-known server port numbers"
  },
  "ascii": {
    "name": "ASCII Character Table",
    "description": "Standard 0-127 ASCII lookup table with hex, dec, and bin"
  },
  "linux-commands": {
    "name": "Linux Commands Cheat Sheet",
    "description": "Categorized Linux sysadmin and shell command cheat sheet"
  },
  "mirror-registry": {
    "name": "Open Source Mirror Registry",
    "description": "Fast mirrors configuration for npm, pip, composer, maven, and docker"
  },
  "public-dns": {
    "name": "Public DNS Directory",
    "description": "Global and regional secure IPv4 / IPv6 DNS server addresses"
  },
  "emoji-symbols": {
    "name": "Emoji & Symbols Directory",
    "description": "Thousands of curated emojis, math symbols, arrows, and currencies"
  },
  "keyboard-symbols": {
    "name": "Keyboard Symbols Nomenclature",
    "description": "Standard English and phonetics for all keyboard keys and symbols"
  },
  "operator-precedence": {
    "name": "Operator Precedence Table",
    "description": "Operator precedence and associativity in JS, Python, C++, Java, PHP"
  },
  "periodic-table": {
    "name": "Periodic Table of Elements",
    "description": "Interactive 118 chemical elements with electronegativity and atomic weight"
  },
  "android-permissions": {
    "name": "Android Permissions Guide",
    "description": "Dangerous runtime permissions list, API level, and manifest snippets"
  },
  "js-events": {
    "name": "JavaScript DOM Events Guide",
    "description": "Mouse, keyboard, form, window, and touch DOM events with bubbling traits"
  },
  "web-fonts": {
    "name": "Web Safe Font Stacks",
    "description": "Modern cross-platform CSS font-family fallback stacks with live preview"
  },
  "mock-data": {
    "name": "Multi-Format Mock Data Generator",
    "description": "Generate realistic mock data in JSON, YAML, CSV, TSV, or TOML"
  },
  "renovation-calc": {
    "name": "Renovation Materials Calculator",
    "description": "Calculate floor tiles, wall tiles, flooring, wallpaper, and paint"
  },
  "qr-decode": {
    "name": "QR Code Scanner",
    "description": "Instant client-side QR image decoder"
  },
  "unit-converter": {
    "name": "Unit Converter",
    "description": "Storage data units (B/KB/MB/GB) and CSS length (px/rem/vw) converter"
  },
  "timestamp": {
    "name": "Unix Timestamp Converter",
    "description": "Convert Unix epoch timestamps to human-readable dates"
  },
  "color": {
    "name": "Color Converter & Picker",
    "description": "Convert between HEX, RGB, HSL, and HSV color models"
  },
  "cron": {
    "name": "Cron Expression Generator",
    "description": "Build and validate scheduled Cron tasks"
  },
  "password": {
    "name": "Secure Password Generator",
    "description": "Generate strong cryptographically secure passwords"
  },
  "qrcode": {
    "name": "QR Code Generator",
    "description": "Generate high-res QR codes from text & URLs"
  },
  "user-agent": {
    "name": "User-Agent Inspector",
    "description": "Analyze browser, OS, engine and device from User-Agent string"
  },
  "barcode-gen": {
    "name": "Barcode Generator",
    "description": "Client-side Code 128 barcode generator with SVG export"
  },
  "lunar-calendar": {
    "name": "Lunar & Solar Calendar",
    "description": "Solar and Lunar calendar converter with Chinese Zodiac and solar terms"
  },
  "keycode-tester": {
    "name": "Keyboard KeyCode Tester",
    "description": "Capture keyboard event.key, code, and keyCode with cheat sheet"
  },
  "chart-generator": {
    "name": "Lightweight Chart Builder",
    "description": "Build pie charts, bar charts, line graphs and export vector SVG"
  },
  "perception-lab": {
    "name": "Reaction Speed & Colorblind Test",
    "description": "Millisecond reaction time tester and Ishihara color perception test"
  },
  "disk-bandwidth": {
    "name": "Disk Partition & Bandwidth Calc",
    "description": "Windows exact integer partition calculator and Gigabit download estimator"
  },
  "health-calc": {
    "name": "Health Index & Blood Type Heredity",
    "description": "BMI, BMR metabolic rate, TDEE, and ABO parental blood type predictor"
  },
  "timer-lucky": {
    "name": "Stopwatch, Countdown & Lucky Draw",
    "description": "High-precision lap stopwatch, meeting timer, and random name picker"
  },
  "grid-paper": {
    "name": "Grid & Practice Paper Generator",
    "description": "Generate printable calligraphy grids, coordinate grids, and dot matrix A4"
  },
  "file-inspector": {
    "name": "Magic Bytes File Type Inspector",
    "description": "Inspect binary magic bytes to detect real file types behind extensions"
  },
  "text-arrange": {
    "name": "Text Typesetting & Cleaner",
    "description": "Auto format spacing between Chinese and English, clean line breaks"
  },
  "markdown": {
    "name": "Markdown Live Editor",
    "description": "Split-screen Markdown editor with realtime HTML preview and export"
  },
  "random-generator": {
    "name": "Random Data Batch Generator",
    "description": "Generate fake names, phones, credit cards, emails, and addresses"
  },
  "jwt-generator": {
    "name": "JWT Generator",
    "description": "Sign HS256 / HS384 / HS512 JWTs online and verify signatures"
  },
  "password-strength": {
    "name": "Password Strength Checker",
    "description": "Check password strength locally: rule scoring, entropy and crack-time estimate"
  },
  "lorem-ipsum": {
    "name": "Lorem Ipsum Generator",
    "description": "Generate placeholder text by paragraphs, sentences or words"
  },
  "slug": {
    "name": "Slug Generator",
    "description": "Convert titles to URL-friendly slugs, Chinese to pinyin automatically"
  },
  "markdown-table": {
    "name": "Markdown Table Generator",
    "description": "Visually edit tables and generate standard Markdown tables, with CSV paste import"
  },
  "flexbox-generator": {
    "name": "Flexbox Layout Generator",
    "description": "Visually tweak Flexbox container properties with live preview and CSS output"
  },
  "grid-generator": {
    "name": "Grid Layout Generator",
    "description": "Visually configure CSS Grid rows, columns, gaps and alignment with live preview"
  },
  "dns-lookup": {
    "name": "DNS Lookup",
    "description": "Look up A / AAAA / CNAME / MX / TXT and other DNS records via DoH"
  },
  "ip-lookup": {
    "name": "IP Lookup",
    "description": "Look up a public IP's location, ISP, ASN and timezone"
  },
  "bcrypt": {
    "name": "bcrypt Generator",
    "description": "Generate and verify bcrypt password hashes entirely in your browser"
  }
},
  'ja-JP': {
  "json-formatter": {
    "name": "JSON 整形・検証",
    "description": "JSON データのインデント整形・圧縮・構文チェック"
  },
  "json-tree": {
    "name": "JSON ツリービュー",
    "description": "折りたたみ可能なインタラクティブ JSON ツリー表示"
  },
  "json-minify-escape": {
    "name": "JSON 圧縮・エスケープ",
    "description": "JSON を 1 行に圧縮しクォートを双方向エスケープ"
  },
  "json-mock": {
    "name": "JSON モックデータ生成",
    "description": "テスト用のランダムなデータセットを瞬時に生成"
  },
  "json-escape": {
    "name": "JSON 文字エスケープ",
    "description": "JSON 文字列のエスケープとアンエスケープ"
  },
  "json-path": {
    "name": "JSONPath 評価クエリ",
    "description": "JSONPath 式を用いた JSON データの抽出・検索"
  },
  "json-diff": {
    "name": "JSON 差分比較",
    "description": "2つの JSON データの構造・値の差分をハイライト"
  },
  "json-to-typescript": {
    "name": "JSON → TypeScript",
    "description": "JSON から TypeScript 型定義とインターフェースを生成"
  },
  "json-to-go": {
    "name": "JSON → Go 構造体",
    "description": "JSON から Golang 構造体を自動生成"
  },
  "json-to-java": {
    "name": "JSON → Java クラス",
    "description": "JSON から Java 实体クラス・POJO を自動生成"
  },
  "json-to-csharp": {
    "name": "JSON → C# クラス",
    "description": "JSON から C# モデルクラスを自動生成"
  },
  "json-schema": {
    "name": "JSON スキーマ生成",
    "description": "JSON データから標準 JSON Schema 定義を推定生成"
  },
  "curl-to-code": {
    "name": "cURL コード変換",
    "description": "cURL リクエストを Fetch、Python、Go コードへ変換"
  },
  "json-to-sql": {
    "name": "JSON → SQL",
    "description": "JSON 配列を一括 SQL INSERT 文に変換"
  },
  "html-markdown": {
    "name": "HTML ↔ Markdown 変換",
    "description": "HTML と Markdown の双方向相互変換"
  },
  "json-yaml": {
    "name": "JSON ↔ YAML 変換",
    "description": "JSON と YAML フォーマットのシームレス相互変換"
  },
  "json-xml": {
    "name": "JSON ↔ XML 変換",
    "description": "JSON と XML 構造の双方向相互変換"
  },
  "json-csv": {
    "name": "JSON ↔ CSV 変換",
    "description": "JSON とスプレッドシート用 CSV の相互変換"
  },
  "json-toml": {
    "name": "JSON ↔ TOML 変換",
    "description": "JSON と TOML 設定ファイルの相互変換"
  },
  "json-properties": {
    "name": "Properties ↔ JSON 変換",
    "description": "Java Properties と JSON の相互変換"
  },
  "radix": {
    "name": "基数・進数変換器",
    "description": "2進数、8進数、10進数、16進数および任意の基数変換"
  },
  "rmb-capital": {
    "name": "人民元大文字金額変換",
    "description": "数値を中国公式請求書・領収書用大文字表記に変換"
  },
  "currency-capital": {
    "name": "多通貨大文字＆小切手変換",
    "description": "USD、EUR、GBP、JPY等の金額大文字表記と小切手日付規則"
  },
  "query-string": {
    "name": "URL クエリ ↔ JSON",
    "description": "URL クエリ文字列と JSON オブジェクトの双方向パース"
  },
  "http-client": {
    "name": "HTTP クライアントテスター",
    "description": "軽量ブラウザ内 API デバッグツール (GET/POST/PUT/DELETE)"
  },
  "cidr": {
    "name": "CIDR サブネット計算機",
    "description": "IP アドレスとサブネットマスクから範囲・ブロードキャストを算出"
  },
  "websocket": {
    "name": "WebSocket オンラインテスター",
    "description": "ws/wss エンドポイントに接続しリアルタイム通信をデバッグ"
  },
  "robots-gen": {
    "name": "Robots.txt 生成ツール",
    "description": "検索エンジンクローラー向けの robots.txt 規約を生成"
  },
  "htpasswd-gen": {
    "name": ".htpasswd 認証生成",
    "description": "Nginx 及び Apache 用の HTTP 基本認証パスワードを生成"
  },
  "url-encode": {
    "name": "URL エンコード / デコード",
    "description": "URL クエリ文字列のエンコードとデコード"
  },
  "base64": {
    "name": "Base64 変換",
    "description": "テキストと UTF-8 Base64 の相互変換"
  },
  "unicode": {
    "name": "Unicode 変換",
    "description": "Unicode 文字エスケープ (\\uXXXX) と文字の相互変換"
  },
  "html-entities": {
    "name": "HTML エンティティ変換",
    "description": "HTML 特殊文字 (&, <, >, クォート) のエスケープ"
  },
  "jwt": {
    "name": "JWT デコーダ",
    "description": "JWT トークンのペイロードと有効期限を即座に解析"
  },
  "morse": {
    "name": "モールス信号変換器",
    "description": "テキストとモールス信号の相互変換および音声再生"
  },
  "md5": {
    "name": "MD5 ハッシュ生成",
    "description": "128 ビット MD5 チェックサムの算出"
  },
  "sha": {
    "name": "SHA ハッシュ生成",
    "description": "SHA-1、SHA-256、SHA-512 等の暗号学的ハッシュ計算"
  },
  "hmac": {
    "name": "HMAC 認証コード生成",
    "description": "秘密鍵付きハッシュメッセージ認証コードの算出"
  },
  "aes": {
    "name": "AES 暗号化 / 復号化",
    "description": "AES-128/192/256 CBC & ECB モードの暗号化"
  },
  "des": {
    "name": "DES / 3DES 暗号化",
    "description": "標準データ暗号化規格 (DES/3DES) の暗号化・復号"
  },
  "rsa": {
    "name": "RSA 鍵ペア生成＆暗号化",
    "description": "RSA 公開鍵・秘密鍵の生成および非対称暗号化"
  },
  "crc32": {
    "name": "CRC32 チェックサム計算",
    "description": "32ビット巡回冗長検査 (CRC32) 値の高速算出"
  },
  "file-hash": {
    "name": "ファイルハッシュ計算器",
    "description": "大容量ローカルファイルの MD5/SHA256 をセキュアに計算"
  },
  "uuid": {
    "name": "UUID / NanoID 生成器",
    "description": "RFC4122 v4 準拠の UUID と NanoID を一括生成"
  },
  "html-format": {
    "name": "HTML 整形・圧縮",
    "description": "乱雑な HTML コードを整形インデントまたは 1 行圧縮"
  },
  "css-format": {
    "name": "CSS 整形・圧縮",
    "description": "CSS スタイルシートのインデント整形とファイル圧縮"
  },
  "css-generator": {
    "name": "CSS 三角形・リボン生成",
    "description": "純粋な CSS による三角形矢印や角リボンのコード生成"
  },
  "css-visual": {
    "name": "CSS ビジュアルスタジオ",
    "description": "ボックスシャドウ、グラデーション、すりガラスの視覚生成"
  },
  "js-format": {
    "name": "JavaScript 整形",
    "description": "JavaScript ソースコードの構文整形とインデント美化"
  },
  "code-universal": {
    "name": "多言語コード整形ツール",
    "description": "Python、Java、PHP、C++、Ruby 等のコードを一括整形"
  },
  "header-cookie": {
    "name": "HTTP ヘッダー＆クッキー解析",
    "description": "生の HTTP ヘッダーや Cookie 文字列を JSON に構造化"
  },
  "sql-format": {
    "name": "SQL 整形ツール",
    "description": "SQL クエリ文のキーワード大文字化とインデント整形"
  },
  "xml-format": {
    "name": "XML 整形・圧縮",
    "description": "XML ドキュメントのツリー整形および構文チェック"
  },
  "case-converter": {
    "name": "キャメル・スネークケース変換",
    "description": "camelCase、snake_case、PascalCase、大文字小文字の変換"
  },
  "text-diff": {
    "name": "テキスト差分比較 (Diff)",
    "description": "2 つのテキストを行単位・文字単位で比較"
  },
  "regex-tester": {
    "name": "正規表現テスター",
    "description": "リアルタイム正規表現マッチング・置換テスター"
  },
  "text-stats": {
    "name": "文字数・単語数カウント",
    "description": "総文字数、単語数、行数、バイト数および読了時間の計測"
  },
  "text-replace": {
    "name": "一括文字列置換",
    "description": "正規表現に対応したテキストの一括検索・置換ツール"
  },
  "text-sort": {
    "name": "行ソート＆重複削除",
    "description": "五十音・アルファベット順の並べ替えと重複行の除去"
  },
  "text-reverse": {
    "name": "文字列反転・行順逆転",
    "description": "文字列の左右反転、行単位の上下逆順配置"
  },
  "chinese-convert": {
    "name": "簡体字 ↔ 繁体字変換",
    "description": "中国語の簡体字と繁体字（台湾・香港仕様）の相互変換"
  },
  "pinyin": {
    "name": "中国語ピンイン変換",
    "description": "漢字から声調記号付きピンインへの自動変換"
  },
  "dbc-sbc": {
    "name": "全角 ↔ 半角変換",
    "description": "英数字・記号・カナの全角・半角相互変換"
  },
  "mars-text": {
    "name": "ギャル文字・装飾テキスト変換",
    "description": "特殊文字・装飾フォント・記号化テキストへの変換"
  },
  "batch-process": {
    "name": "一括行加工・プレフィックス付加",
    "description": "各行への接頭辞・接尾辞付加、行番号挿入、区切り結合"
  },
  "idcard-validator": {
    "name": "身分証チェックサム検証",
    "description": "身分証番号の規則性検証と最終検査数字の算出"
  },
  "ascii-art": {
    "name": "ASCII アートバナー生成",
    "description": "ターミナル用の巨大な ASCII アートフォントバナー生成"
  },
  "image-crop": {
    "name": "画像切り抜き・クロップ",
    "description": "自由なアスペクト比での画像トリミングと高画質書き出し"
  },
  "image-resize": {
    "name": "画像リサイズ・拡大縮小",
    "description": "パーセンテージやピクセル指定による高画質リサイズ"
  },
  "exif-viewer": {
    "name": "Exif 情報閲覧・メタデータ削除",
    "description": "撮影日時、カメラ機種、GPS 位置情報の確認と一括消去"
  },
  "signature-extract": {
    "name": "手書き署名・印鑑抽出",
    "description": "白い紙に書いた署名や印鑑を透明背景 PNG として抽出"
  },
  "image-to-pdf": {
    "name": "画像 → PDF 一括変換",
    "description": "複数枚の画像を高品質な A4 判 PDF ドキュメントに結合"
  },
  "doodle-board": {
    "name": "オンラインお絵かき・ホワイトボード",
    "description": "ブラシ、幾何学図形、消しゴムを備えた手描きボード"
  },
  "avatar-frame": {
    "name": "アバターフレーム装飾",
    "description": "プロフィールアイコンにお祝いフレームやサイバーリングを追加"
  },
  "id-photo-std": {
    "name": "証明写真背景変更＆印刷レイアウト",
    "description": "パスポート規格サイズ調整、背景色変更、6インチ印刷配置"
  },
  "image-grayscale": {
    "name": "グレースケール・白黒写真化",
    "description": "階調グレースケール、2値化白黒、ネガ反転、セピア調加工"
  },
  "favicon-gen": {
    "name": "Favicon アイコン生成",
    "description": "複数サイズ対応の ICO 形式ウェブサイトアイコンを自動生成"
  },
  "gif-frames": {
    "name": "GIF アニメーションコマ分解",
    "description": "GIF 動き画像を 1 フレームごとに分解してプレビュー・保存"
  },
  "image-convert": {
    "name": "画像フォーマット変換",
    "description": "PNG、JPG、WebP、GIF 等の各種画像形式相互変換"
  },
  "nine-grid": {
    "name": "9分割グリッド画像切り出し",
    "description": "SNS 投稿用に 1 枚の写真を綺麗な 9 コマに均等分割"
  },
  "watermark": {
    "name": "画像透かし・ウォーターマーク追加",
    "description": "盗用防止用のカスタムテキスト透かしや格子状透かしの付加"
  },
  "image-transform": {
    "name": "画像回転・反転ツール",
    "description": "画像の 90° 刻み回転、水平・垂直ミラー反転"
  },
  "image-filters": {
    "name": "画像カラーフィルター",
    "description": "ヴィンテージ、ネガポジ反転、レトロ調等の各種フィルター"
  },
  "image-picker": {
    "name": "画像スポイト・カラーパレット抽出",
    "description": "画像上の任意ピクセルから色を抽出しカラーパレットを作成"
  },
  "placeholder": {
    "name": "ダミー画像生成 (Placeholder)",
    "description": "Web 開発用のサイズ・背景色・文字入りプレースホルダー画像"
  },
  "text-to-image": {
    "name": "テキスト → 画像カード生成",
    "description": "長文やメモ、コードスニペットを美しい画像カードとして出力"
  },
  "signature-pad": {
    "name": "電子サイン・署名パッド",
    "description": "手書き筆跡による電子署名の作成と透明背景 PNG 出力"
  },
  "id-photo": {
    "name": "証明写真・規格サイズ早見表",
    "description": "履歴書・パスポート用規格サイズの確認と簡易クロップ"
  },
  "image-base64": {
    "name": "画像 ↔ Base64 相互変換",
    "description": "画像ファイルと DataURL Base64 文字列の相互変換"
  },
  "image-compress": {
    "name": "クライアント側画像圧縮",
    "description": "ブラウザローカルで解像度と画質を圧縮調整"
  },
  "git-commands": {
    "name": "Git コマンド早見表",
    "description": "ブランチ操作、コミット、リベース、ロールバック等の Git 高頻度操作"
  },
  "http-status": {
    "name": "HTTP ステータスコード早見表",
    "description": "1xx から 5xx までの HTTP レスポンスステータスコードと詳細解説"
  },
  "mime-type": {
    "name": "MIME タイプ・Content-Type 早見表",
    "description": "ファイル拡張子と HTTP Content-Type の対照検索"
  },
  "ports": {
    "name": "常用ポート番号一覧",
    "description": "主要なネットワークプロトコルと有名サーバーのポート番号一覧"
  },
  "ascii": {
    "name": "ASCII 文字コード表",
    "description": "標準 0-127 の ASCII コード表と進数対照"
  },
  "linux-commands": {
    "name": "Linux コマンド逆引き早見表",
    "description": "Linux サーバー運用・開発で頻出するシェルコマンド集"
  },
  "mirror-registry": {
    "name": "オープンソースミラーリポジトリ設定",
    "description": "npm、pip、composer、maven、docker 等の国内高速ミラー設定集"
  },
  "public-dns": {
    "name": "パブリック DNS サーバー一覧",
    "description": "Google、Cloudflare、AliDNS、114 等の IPv4 / IPv6 DNS アドレス"
  },
  "emoji-symbols": {
    "name": "絵文字＆特殊記号大全",
    "description": "豊富な Emoji、数学記号、矢印、通貨、ギリシャ文字のワンタップコピー"
  },
  "keyboard-symbols": {
    "name": "キーボード記号の名称・読み方",
    "description": "全キーボード記号の標準英名、発音記号、エスケープ仕様"
  },
  "operator-precedence": {
    "name": "演算子の優先順位表",
    "description": "JS、Python、C++、Java、PHP の演算子優先順位と結合性一覧"
  },
  "periodic-table": {
    "name": "元素周期表 (インタラクティブ)",
    "description": "118 種類の化学元素の原子量、電気陰性度、電子配置等の早見表"
  },
  "android-permissions": {
    "name": "Android 権限・パーミッション一覧",
    "description": "重要・危険パーミッションの分類、追加バージョン、Manifest コード"
  },
  "js-events": {
    "name": "JavaScript DOM イベント早見表",
    "description": "マウス、キーボード、フォーム、タッチ等のイベント仕様とバブリング特性"
  },
  "web-fonts": {
    "name": "Web 安全フォントスタック",
    "description": "マルチプラットフォーム対応の CSS font-family 代替スタック集"
  },
  "mock-data": {
    "name": "多形式モックデータ生成",
    "description": "JSON、YAML、CSV、TSV、TOML 形式のテスト用データ生成"
  },
  "renovation-calc": {
    "name": "内装建材・資材計算機",
    "description": "床タイル、壁タイル、フローリング、壁紙、塗料の必要量と予算試算"
  },
  "qr-decode": {
    "name": "QR コード解析・リーダー",
    "description": "アップロードした画像からブラウザ上で即座に QR コードを認識"
  },
  "unit-converter": {
    "name": "単位変換器 (データ・CSS)",
    "description": "データ容量単位 (B/KB/MB/GB) と CSS 単位 (px/rem/em/vw) の変換"
  },
  "timestamp": {
    "name": "Unix タイムスタンプ変換",
    "description": "Unix 時間と日時文字列の双方向変換"
  },
  "color": {
    "name": "カラーコード変換＆ピッカー",
    "description": "HEX、RGB、HSL、HSV カラーコードの相互変換"
  },
  "cron": {
    "name": "Cron 式ジェネレータ",
    "description": "定期実行タスク用の Cron 式生成と次回実行予定時刻の検証"
  },
  "password": {
    "name": "強力パスワード生成器",
    "description": "暗号学的に安全なランダムパスワードとトークンの生成"
  },
  "qrcode": {
    "name": "QR コード作成器",
    "description": "テキストや URL から高解像度 QR コードを生成"
  },
  "user-agent": {
    "name": "User-Agent 解析ツール",
    "description": "UA 文字列からブラウザ、OS、レンダリングエンジンを解析"
  },
  "barcode-gen": {
    "name": "バーコード生成器 (Code 128)",
    "description": "ブラウザ内で Code 128 規格バーコードを即時生成し SVG 保存"
  },
  "lunar-calendar": {
    "name": "旧暦・新暦＆干支計算",
    "description": "新暦と旧暦の相互変換、干支、二十四節気、伝統時刻の算出"
  },
  "keycode-tester": {
    "name": "キーボード KeyCode テスター",
    "description": "キー押下時の event.key、code、keyCode のリアルタイム検知"
  },
  "chart-generator": {
    "name": "軽量グラフ作成ツール",
    "description": "円グラフ、棒グラフ、折れ線グラフを直感的に作成し SVG 出力"
  },
  "perception-lab": {
    "name": "反応速度＆色覚・色盲テスト",
    "description": "ミリ秒単位の変色反応時間測定と石原式色覚検査チャート"
  },
  "disk-bandwidth": {
    "name": "HDD整数パーティション＆回線速度計算",
    "description": "Windows ぴったりパーティション MB 換算とダウンロード所要時間計算"
  },
  "health-calc": {
    "name": "健康指数 (BMI/BMR)＆血液型遺伝",
    "description": "BMI 体格指数、基礎代謝量 BMR、ABO 式親子の血液型遺伝判定"
  },
  "timer-lucky": {
    "name": "ストップウォッチ・タイマー＆抽選器",
    "description": "ラップタイム計測、会議カウントダウン、ランダム抽選ルーレット"
  },
  "grid-paper": {
    "name": "方眼紙・文字練習用紙ジェネレータ",
    "description": "印刷可能なマス目用紙、米字格、田字格、ドット方眼 A4 判"
  },
  "file-inspector": {
    "name": "ファイルマジックナンバー識別",
    "description": "ファイルの先頭ヘッダーを読み取り真の拡張子・形式を特定"
  },
  "text-arrange": {
    "name": "テキスト組版・クレンジング",
    "description": "和欧文間の半角スペース自動挿入、空行整理、段落インデント整形"
  },
  "markdown": {
    "name": "Markdown リアルタイムエディタ",
    "description": "リアルタイム HTML プレビュー・目次生成付き Markdown 編集"
  },
  "random-generator": {
    "name": "ランダムデータ一括生成",
    "description": "氏名、電話番号、郵便番号、メール等のダミーテストデータ生成"
  },
  "jwt-generator": {
    "name": "JWT 生成器",
    "description": "HS256 / HS384 / HS512 の JWT をオンラインで発行・署名検証"
  },
  "password-strength": {
    "name": "パスワード強度チェッカー",
    "description": "パスワード強度をローカルで判定：ルール採点・エントロピー・解読時間の推定"
  },
  "lorem-ipsum": {
    "name": "Lorem Ipsum 生成器",
    "description": "段落・文・単語単位で英語のダミーテキストを生成"
  },
  "slug": {
    "name": "スラッグ生成器",
    "description": "タイトルを URL 向けスラッグに変換、中国語はピンインに自動変換"
  },
  "markdown-table": {
    "name": "Markdown テーブル生成器",
    "description": "表を視覚的に編集して標準 Markdown テーブルを生成、CSV 貼り付けインポート対応"
  },
  "flexbox-generator": {
    "name": "Flexbox レイアウト生成器",
    "description": "Flexbox コンテナの属性を視覚的に調整、リアルタイムプレビューと CSS 出力"
  },
  "grid-generator": {
    "name": "Grid レイアウト生成器",
    "description": "CSS Grid の行・列・間隔・配置を視覚的に設定、リアルタイムプレビュー"
  },
  "dns-lookup": {
    "name": "DNS ルックアップ",
    "description": "DoH で A / AAAA / CNAME / MX / TXT などの DNS レコードを照会"
  },
  "ip-lookup": {
    "name": "IP アドレス照会",
    "description": "公開 IP の所在地・ISP・ASN・タイムゾーンを照会"
  },
  "bcrypt": {
    "name": "bcrypt 生成器",
    "description": "bcrypt パスワードハッシュをブラウザ内で生成・検証"
  }
}
};
