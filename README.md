# DevToolBox — Free Online Developer Toolbox (132 Tools)

> All-in-one free online developer toolbox: 132 tools for JSON, encoding, encryption, code formatting, text, images and everyday dev work. 100% client-side — your data never leaves your browser. No sign-up, no upload, no tracking.

**Live demo: https://zapbits.xyz/tools/**

---

## Why DevToolBox

- **Private by design** — every tool runs entirely in your browser. JSON formatting, encryption, image processing and file hashing never touch a server.
- **132 tools, one place** — no more hunting across ten different sites for a formatter, an encoder and a generator.
- **Fast** — `Ctrl + K` (or `Cmd + K`) fuzzy-searches all 132 tools in under a second.
- **Free forever** — no account, no paywall for core tools, no ads interrupting your work.
- **Works everywhere** — dark mode, mobile-friendly, and deployable anywhere as a static site or Docker container.

## Popular tools

| What you need | Try |
|---|---|
| Format, validate or minify JSON | JSON Formatter / Validator, JSON Tree View, JSONPath Query |
| Convert JSON to code | JSON → TypeScript, JSON → Go Struct, JSON → Java / C# Class, JSON Schema |
| Encode & decode | Base64, URL, Unicode, HTML Entities, JWT Decoder, Morse Code |
| Hash & encrypt | MD5 / SHA-256 / SHA-512, HMAC, AES, DES / 3DES, RSA Key Generator, CRC32, UUID |
| Format code | HTML / CSS / JS Formatter, SQL Formatter, XML Formatter, Multi-language Beautifier |
| Work with text | Regex Tester, Text Diff, Markdown Preview, Pinyin Converter, Word Counter |
| Images & media | Image Crop / Resize / Compress / Convert, EXIF Viewer, QR Code Generator & Decoder, Favicon Generator, Watermark |
| Network & APIs | HTTP Client, WebSocket Tester, CIDR Calculator, Robots.txt Generator |
| Daily helpers | Timestamp Converter, Cron Expression Builder, Password Generator, Color Converter, Unit Converter |

Full list: 10 categories, 132 tools — see the live site or browse `src/lib/toolRegistry.ts`.

## Categories

1. **JSON** — format, validate, compare, query, convert, mock
2. **Format Conversion** — JSON ↔ YAML / XML / CSV / TOML, cURL → code, radix, URL params
3. **Network & APIs** — HTTP client, WebSocket test, CIDR, robots.txt, .htpasswd
4. **Encoding / Decoding** — Base64, URL, Unicode, HTML entities, JWT, Morse
5. **Crypto & Hashing** — MD5, SHA, HMAC, AES, DES, RSA, CRC32, UUID
6. **Code Formatting** — multi-language beautifier, SQL, XML, CSS generators
7. **Text** — diff, regex, pinyin, arrange, clean, Markdown preview, random data
8. **Images** — crop, resize, EXIF, signature extract, PDF, doodle, avatar frames, ID photos
9. **Reference** — Git cheatsheet, HTTP status codes, MIME types, ports, ASCII, Linux commands
10. **Utilities** — QR codes, unit conversion, timestamps, colors, cron, passwords, user-agent

## Self-host it

```bash
# Node.js >= 18
npm install
npm run dev      # local dev at http://localhost:5173

npm run build    # static output in dist/
```

Or with Docker (Dockerfile + nginx.conf included):

```bash
docker build -t devtoolbox:latest .
docker run -d -p 8080:80 --name devtoolbox-app devtoolbox:latest
```

Open `http://localhost:8080/`.

## Privacy

DevToolBox has no backend and no database. All computation happens locally in your browser; nothing you paste or upload is sent anywhere. The site sets no tracking cookies.

## Contributing

Found a bug or want a new tool? Open an issue or a pull request — new tools only need an entry in the tool registry plus a page component.

---

## DevToolBox — 免费在线开发者工具箱（132 个工具）

一站式免费在线开发者工具箱：132 个工具，覆盖 JSON、编解码、加解密、代码格式化、文本处理、图片媒体与日常开发辅助。**100% 纯前端运行，数据不上传服务器**，不用注册，不用登录。

**在线使用：https://zapbits.xyz/tools/**

- **隐私优先**：所有计算都在浏览器本地完成，粘贴的内容不会发送到任何服务器。
- **132 个工具**：JSON 格式化校验、Base64 编解码、JWT 解析、MD5/SHA 哈希、AES 加解密、正则测试、二维码生成、时间戳转换、Cron 表达式、SQL 格式化、图片压缩裁剪等，一个站全搞定。
- **快**：`Ctrl + K` 全局搜索，秒级定位工具。
- **免费**：核心工具全部免费，无需账号。
- **随处部署**：纯静态输出，支持 Docker / Nginx 一键部署。

本地运行：`npm install && npm run dev`；生产构建：`npm run build`，产物在 `dist/`。
