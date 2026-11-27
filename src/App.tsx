import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'

// Lazy load all tool pages
const Home = lazy(() => import('./pages/Home'))

// JSON Tools
const JsonFormatter = lazy(() => import('./pages/json/JsonFormatter'))
const JsonTreeView = lazy(() => import('./pages/json/JsonTreeView'))
const JsonMinifyEscape = lazy(() => import('./pages/json/JsonMinifyEscape'))
const JsonMock = lazy(() => import('./pages/json/MockGenerator'))
const JsonEscape = lazy(() => import('./pages/json/JsonEscape'))
const JsonPath = lazy(() => import('./pages/json/JsonPath'))
const JsonDiff = lazy(() => import('./pages/json/JsonDiff'))
const JsonToTypescript = lazy(() => import('./pages/json/JsonToTypescript'))
const JsonToGo = lazy(() => import('./pages/json/JsonToGo'))
const JsonToJava = lazy(() => import('./pages/json/JsonToJava'))
const JsonToCSharp = lazy(() => import('./pages/json/JsonToCSharp'))
const JsonSchema = lazy(() => import('./pages/json/JsonSchema'))

// Convert Tools
const CurlToCode = lazy(() => import('./pages/convert/CurlToCode'))
const JsonToSql = lazy(() => import('./pages/convert/JsonToSql'))
const HtmlMarkdown = lazy(() => import('./pages/convert/HtmlMarkdown'))
const HtmlToJsx = lazy(() => import('./pages/convert/HtmlToJsx'))
const ConvertJsonToTypescript = lazy(() => import('./pages/convert/JsonToTypescript'))
const JsonYaml = lazy(() => import('./pages/convert/JsonYaml'))
const JsonXml = lazy(() => import('./pages/convert/JsonXml'))
const JsonCsv = lazy(() => import('./pages/convert/JsonCsv'))
const JsonToExcel = lazy(() => import('./pages/convert/JsonToExcel'))
const JsonToml = lazy(() => import('./pages/convert/JsonToml'))
const PropertiesJson = lazy(() => import('./pages/convert/PropertiesJson'))
const Radix = lazy(() => import('./pages/convert/Radix'))
const TimestampConverter = lazy(() => import('./pages/convert/TimestampConverter'))
const TimezoneConverter = lazy(() => import('./pages/convert/TimezoneConverter'))
const RmbCapital = lazy(() => import('./pages/convert/RmbCapital'))
const CurrencyCapital = lazy(() => import('./pages/convert/CurrencyCapital'))
const QueryString = lazy(() => import('./pages/convert/QueryString'))

// Network Tools
const HttpClient = lazy(() => import('./pages/net/HttpClient'))
const CidrCalc = lazy(() => import('./pages/net/CidrCalc'))
const WebSocketTester = lazy(() => import('./pages/net/WebSocketTester'))
const RobotsGenerator = lazy(() => import('./pages/net/RobotsGenerator'))
const SitemapGenerator = lazy(() => import('./pages/net/SitemapGenerator'))
const MetaTagsGenerator = lazy(() => import('./pages/net/MetaTagsGenerator'))
const Htpasswd = lazy(() => import('./pages/net/Htpasswd'))
const DnsLookup = lazy(() => import('./pages/net/DnsLookup'))
const IpLookup = lazy(() => import('./pages/net/IpLookup'))

// Encode Tools
const Base64 = lazy(() => import('./pages/encode/Base64'))
const Base32Base58 = lazy(() => import('./pages/encode/Base32Base58'))
const UrlEncode = lazy(() => import('./pages/encode/UrlEncode'))
const Unicode = lazy(() => import('./pages/encode/Unicode'))
const HtmlEntities = lazy(() => import('./pages/encode/HtmlEntities'))
const Jwt = lazy(() => import('./pages/encode/Jwt'))
const JwtGenerator = lazy(() => import('./pages/encode/JwtGenerator'))
const Morse = lazy(() => import('./pages/encode/Morse'))

// Crypto Tools
const Md5 = lazy(() => import('./pages/crypto/Md5'))
const Sha = lazy(() => import('./pages/crypto/Sha'))
const Hmac = lazy(() => import('./pages/crypto/Hmac'))
const Aes = lazy(() => import('./pages/crypto/Aes'))
const Des = lazy(() => import('./pages/crypto/Des'))
const Rsa = lazy(() => import('./pages/crypto/Rsa'))
const Crc32 = lazy(() => import('./pages/crypto/Crc32'))
const Uuid = lazy(() => import('./pages/crypto/Uuid'))
const FileHash = lazy(() => import('./pages/crypto/FileHash'))
const SriHash = lazy(() => import('./pages/crypto/SriHash'))
const PasswordStrength = lazy(() => import('./pages/crypto/PasswordStrength'))
const Bcrypt = lazy(() => import('./pages/crypto/Bcrypt'))

// Format Tools
const HtmlFormat = lazy(() => import('./pages/format/HtmlFormat'))
const CssFormat = lazy(() => import('./pages/format/CssFormat'))
const CssGenerator = lazy(() => import('./pages/format/CssGenerator'))
const CssVisualGenerator = lazy(() => import('./pages/format/CssVisualGenerator'))
const JsFormat = lazy(() => import('./pages/format/JsFormat'))
const CodeMinifier = lazy(() => import('./pages/format/Minifier'))
const CodeFormatUniversal = lazy(() => import('./pages/format/CodeFormatUniversal'))
const HeaderCookieFormat = lazy(() => import('./pages/format/HeaderCookieFormat'))
const SqlFormat = lazy(() => import('./pages/format/SqlFormat'))
const XmlFormat = lazy(() => import('./pages/format/XmlFormat'))

// CSS Layout Tools
const FlexboxGenerator = lazy(() => import('./pages/css/FlexboxGenerator'))
const GridGenerator = lazy(() => import('./pages/css/GridGenerator'))

// Text Tools
const TextDiff = lazy(() => import('./pages/text/TextDiff'))
const TextReplace = lazy(() => import('./pages/text/TextReplace'))
const IdCardValidator = lazy(() => import('./pages/text/IdCardValidator'))
const TextArrange = lazy(() => import('./pages/text/TextArrange'))
const AsciiArt = lazy(() => import('./pages/text/AsciiArt'))
const Pinyin = lazy(() => import('./pages/text/Pinyin'))
const RegexTester = lazy(() => import('./pages/text/RegexTester'))
const TextStats = lazy(() => import('./pages/text/TextStats'))
const BatchProcess = lazy(() => import('./pages/text/BatchProcess'))
const TextSort = lazy(() => import('./pages/text/TextSort'))
const Markdown = lazy(() => import('./pages/text/Markdown'))
const CaseConverter = lazy(() => import('./pages/text/CaseConverter'))
const ChineseConvert = lazy(() => import('./pages/text/ChineseConvert'))
const DbcSbc = lazy(() => import('./pages/text/DbcSbc'))
const TextReverse = lazy(() => import('./pages/text/TextReverse'))
const MarsText = lazy(() => import('./pages/text/MarsText'))
const RandomGenerator = lazy(() => import('./pages/text/RandomGenerator'))
const LoremIpsum = lazy(() => import('./pages/text/LoremIpsum'))
const SlugGenerator = lazy(() => import('./pages/text/SlugGenerator'))
const MarkdownTable = lazy(() => import('./pages/text/MarkdownTable'))

// Media Tools
const ImageCrop = lazy(() => import('./pages/image/ImageCrop'))
const ImageResize = lazy(() => import('./pages/image/ImageResize'))
const ExifViewer = lazy(() => import('./pages/image/ExifViewer'))
const SignatureExtract = lazy(() => import('./pages/image/SignatureExtract'))
const ImageToPdf = lazy(() => import('./pages/image/ImageToPdf'))
const DoodleBoard = lazy(() => import('./pages/image/DoodleBoard'))
const AvatarFrame = lazy(() => import('./pages/image/AvatarFrame'))
const IdPhotoStandard = lazy(() => import('./pages/image/IdPhotoStandard'))
const ImageGrayscale = lazy(() => import('./pages/image/ImageGrayscale'))
const FaviconGen = lazy(() => import('./pages/media/FaviconGen'))
const GifFrames = lazy(() => import('./pages/media/GifFrames'))
const ImageConvert = lazy(() => import('./pages/media/ImageConvert'))
const NineGrid = lazy(() => import('./pages/media/NineGrid'))
const Watermark = lazy(() => import('./pages/media/Watermark'))
const ImageTransform = lazy(() => import('./pages/media/ImageTransform'))
const ImageFilters = lazy(() => import('./pages/media/ImageFilters'))
const ImagePicker = lazy(() => import('./pages/media/ImagePicker'))
const Placeholder = lazy(() => import('./pages/media/Placeholder'))
const TextToImage = lazy(() => import('./pages/media/TextToImage'))
const SignaturePad = lazy(() => import('./pages/media/SignaturePad'))
const IdPhoto = lazy(() => import('./pages/media/IdPhoto'))
const ImageBase64 = lazy(() => import('./pages/media/ImageBase64'))
const ImageCompress = lazy(() => import('./pages/media/ImageCompress'))

// Reference Tools
const GitCommands = lazy(() => import('./pages/ref/GitCommands'))
const GitignoreGenerator = lazy(() => import('./pages/ref/GitignoreGenerator'))
const HttpStatus = lazy(() => import('./pages/ref/HttpStatus'))
const MimeType = lazy(() => import('./pages/ref/MimeType'))
const Ports = lazy(() => import('./pages/ref/Ports'))
const AsciiTable = lazy(() => import('./pages/ref/AsciiTable'))
const LinuxCommands = lazy(() => import('./pages/ref/LinuxCommands'))
const ChmodCalculator = lazy(() => import('./pages/ref/ChmodCalculator'))
const MirrorRegistry = lazy(() => import('./pages/ref/MirrorRegistry'))
const PublicDns = lazy(() => import('./pages/ref/PublicDns'))
const EmojiSymbols = lazy(() => import('./pages/ref/EmojiSymbols'))
const KeyboardSymbols = lazy(() => import('./pages/ref/KeyboardSymbols'))
const OperatorPrecedence = lazy(() => import('./pages/ref/OperatorPrecedence'))
const PeriodicTable = lazy(() => import('./pages/ref/PeriodicTable'))
const AndroidPermissions = lazy(() => import('./pages/ref/AndroidPermissions'))
const JsEvents = lazy(() => import('./pages/ref/JsEvents'))
const WebFonts = lazy(() => import('./pages/ref/WebFonts'))

// Misc Tools
const QrDecode = lazy(() => import('./pages/misc/QrDecode'))
const UnitConverter = lazy(() => import('./pages/misc/UnitConverter'))
const ColorConverter = lazy(() => import('./pages/misc/ColorConverter'))
const CronGenerator = lazy(() => import('./pages/misc/CronGenerator'))
const PasswordGenerator = lazy(() => import('./pages/misc/PasswordGenerator'))
const QrCode = lazy(() => import('./pages/misc/QrCode'))
const UserAgent = lazy(() => import('./pages/misc/UserAgent'))
const BarcodeGenerator = lazy(() => import('./pages/misc/BarcodeGenerator'))
const LunarCalendar = lazy(() => import('./pages/misc/LunarCalendar'))
const KeyCodeTester = lazy(() => import('./pages/misc/KeyCodeTester'))
const ChartGenerator = lazy(() => import('./pages/misc/ChartGenerator'))
const PerceptionLab = lazy(() => import('./pages/misc/PerceptionLab'))
const DiskBandwidthCalc = lazy(() => import('./pages/misc/DiskBandwidthCalc'))
const HealthCalculator = lazy(() => import('./pages/misc/HealthCalculator'))
const TimerLuckyDraw = lazy(() => import('./pages/misc/TimerLuckyDraw'))
const GridPaperGenerator = lazy(() => import('./pages/misc/GridPaperGenerator'))
const FileInspector = lazy(() => import('./pages/misc/FileInspector'))
const MockDataGenerator = lazy(() => import('./pages/misc/MockDataGenerator'))
const RenovationCalc = lazy(() => import('./pages/misc/RenovationCalc'))
const DateCalculator = lazy(() => import('./pages/misc/DateCalculator'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        {/* JSON */}
        <Route path="/json/formatter" element={<JsonFormatter />} />
        <Route path="/json/tree-view" element={<JsonTreeView />} />
        <Route path="/json/minify-escape" element={<JsonMinifyEscape />} />
        <Route path="/json/mock-generator" element={<JsonMock />} />
        <Route path="/json/escape" element={<JsonEscape />} />
        <Route path="/json/path" element={<JsonPath />} />
        <Route path="/json/diff" element={<JsonDiff />} />
        <Route path="/json/to-typescript" element={<JsonToTypescript />} />
        <Route path="/json/to-go" element={<JsonToGo />} />
        <Route path="/json/to-java" element={<JsonToJava />} />
        <Route path="/json/to-csharp" element={<JsonToCSharp />} />
        <Route path="/json/schema" element={<JsonSchema />} />

        {/* Convert */}
        <Route path="/convert/curl-to-code" element={<CurlToCode />} />
        <Route path="/convert/json-to-sql" element={<JsonToSql />} />
        <Route path="/convert/html-markdown" element={<HtmlMarkdown />} />
        <Route path="/convert/html-jsx" element={<HtmlToJsx />} />
        <Route path="/convert/json-typescript" element={<ConvertJsonToTypescript />} />
        <Route path="/convert/json-yaml" element={<JsonYaml />} />
        <Route path="/convert/json-xml" element={<JsonXml />} />
        <Route path="/convert/json-csv" element={<JsonCsv />} />
        <Route path="/convert/json-to-excel" element={<JsonToExcel />} />
        <Route path="/convert/json-toml" element={<JsonToml />} />
        <Route path="/convert/properties-json" element={<PropertiesJson />} />
        <Route path="/convert/radix" element={<Radix />} />
        <Route path="/convert/timestamp" element={<TimestampConverter />} />
        <Route path="/convert/timezone" element={<TimezoneConverter />} />
        <Route path="/convert/rmb-capital" element={<RmbCapital />} />
        <Route path="/convert/currency-capital" element={<CurrencyCapital />} />
        <Route path="/convert/query-string" element={<QueryString />} />

        {/* Network */}
        <Route path="/net/http-client" element={<HttpClient />} />
        <Route path="/net/cidr" element={<CidrCalc />} />
        <Route path="/net/websocket" element={<WebSocketTester />} />
        <Route path="/net/robots" element={<RobotsGenerator />} />
        <Route path="/net/sitemap-generator" element={<SitemapGenerator />} />
        <Route path="/net/meta-tags" element={<MetaTagsGenerator />} />
        <Route path="/net/htpasswd" element={<Htpasswd />} />
        <Route path="/net/dns" element={<DnsLookup />} />
        <Route path="/net/ip" element={<IpLookup />} />

        {/* Encode */}
        <Route path="/encode/base64" element={<Base64 />} />
        <Route path="/encode/base32-base58" element={<Base32Base58 />} />
        <Route path="/encode/url" element={<UrlEncode />} />
        <Route path="/encode/unicode" element={<Unicode />} />
        <Route path="/encode/html-entities" element={<HtmlEntities />} />
        <Route path="/encode/jwt" element={<Jwt />} />
        <Route path="/jwt/generator" element={<JwtGenerator />} />
        <Route path="/encode/morse" element={<Morse />} />

        {/* Crypto */}
        <Route path="/crypto/md5" element={<Md5 />} />
        <Route path="/crypto/sha" element={<Sha />} />
        <Route path="/crypto/hmac" element={<Hmac />} />
        <Route path="/crypto/aes" element={<Aes />} />
        <Route path="/crypto/des" element={<Des />} />
        <Route path="/crypto/rsa" element={<Rsa />} />
        <Route path="/crypto/crc32" element={<Crc32 />} />
        <Route path="/crypto/uuid" element={<Uuid />} />
        <Route path="/crypto/file-hash" element={<FileHash />} />
        <Route path="/crypto/sri-hash" element={<SriHash />} />
        <Route path="/crypto/password-strength" element={<PasswordStrength />} />
        <Route path="/crypto/bcrypt" element={<Bcrypt />} />

        {/* Format */}
        <Route path="/format/html" element={<HtmlFormat />} />
        <Route path="/format/css" element={<CssFormat />} />
        <Route path="/format/css-generator" element={<CssGenerator />} />
        <Route path="/format/css-visual" element={<CssVisualGenerator />} />
        <Route path="/format/javascript" element={<JsFormat />} />
        <Route path="/format/minify" element={<CodeMinifier />} />
        <Route path="/format/universal" element={<CodeFormatUniversal />} />
        <Route path="/format/header-cookie" element={<HeaderCookieFormat />} />
        <Route path="/format/sql" element={<SqlFormat />} />
        <Route path="/format/xml" element={<XmlFormat />} />

        {/* CSS Layout */}
        <Route path="/css/flexbox" element={<FlexboxGenerator />} />
        <Route path="/css/grid" element={<GridGenerator />} />

        {/* Text */}
        <Route path="/text/diff" element={<TextDiff />} />
        <Route path="/text/replace" element={<TextReplace />} />
        <Route path="/text/idcard" element={<IdCardValidator />} />
        <Route path="/text/arrange" element={<TextArrange />} />
        <Route path="/text/ascii-art" element={<AsciiArt />} />
        <Route path="/text/pinyin" element={<Pinyin />} />
        <Route path="/text/regex-tester" element={<RegexTester />} />
        <Route path="/text/regex" element={<Navigate to="/text/regex-tester" replace />} />
        <Route path="/text/stats" element={<TextStats />} />
        <Route path="/text/batch-process" element={<BatchProcess />} />
        <Route path="/text/sort" element={<TextSort />} />
        <Route path="/text/markdown" element={<Markdown />} />
        <Route path="/text/case-converter" element={<CaseConverter />} />
        <Route path="/text/chinese-convert" element={<ChineseConvert />} />
        <Route path="/text/dbc-sbc" element={<DbcSbc />} />
        <Route path="/text/reverse" element={<TextReverse />} />
        <Route path="/text/mars" element={<MarsText />} />
        <Route path="/text/random-generator" element={<RandomGenerator />} />
        <Route path="/text/lorem-ipsum" element={<LoremIpsum />} />
        <Route path="/text/slug" element={<SlugGenerator />} />
        <Route path="/text/markdown-table" element={<MarkdownTable />} />

        {/* Media */}
        <Route path="/media/image-crop" element={<ImageCrop />} />
        <Route path="/media/image-resize" element={<ImageResize />} />
        <Route path="/media/exif" element={<ExifViewer />} />
        <Route path="/media/signature-extract" element={<SignatureExtract />} />
        <Route path="/media/image-to-pdf" element={<ImageToPdf />} />
        <Route path="/media/doodle-board" element={<DoodleBoard />} />
        <Route path="/media/avatar-frame" element={<AvatarFrame />} />
        <Route path="/media/id-photo-std" element={<IdPhotoStandard />} />
        <Route path="/media/grayscale" element={<ImageGrayscale />} />
        <Route path="/media/favicon-gen" element={<FaviconGen />} />
        <Route path="/media/gif-frames" element={<GifFrames />} />
        <Route path="/media/image-convert" element={<ImageConvert />} />
        <Route path="/media/nine-grid" element={<NineGrid />} />
        <Route path="/media/watermark" element={<Watermark />} />
        <Route path="/media/image-transform" element={<ImageTransform />} />
        <Route path="/media/image-filters" element={<ImageFilters />} />
        <Route path="/media/image-picker" element={<ImagePicker />} />
        <Route path="/media/placeholder" element={<Placeholder />} />
        <Route path="/media/text-to-image" element={<TextToImage />} />
        <Route path="/media/signature-pad" element={<SignaturePad />} />
        <Route path="/media/id-photo" element={<IdPhoto />} />
        <Route path="/media/image-base64" element={<ImageBase64 />} />
        <Route path="/media/image-compress" element={<ImageCompress />} />

        {/* Reference */}
        <Route path="/ref/git-commands" element={<GitCommands />} />
        <Route path="/ref/gitignore" element={<GitignoreGenerator />} />
        <Route path="/ref/http-status" element={<HttpStatus />} />
        <Route path="/ref/mime-type" element={<MimeType />} />
        <Route path="/ref/ports" element={<Ports />} />
        <Route path="/ref/ascii" element={<AsciiTable />} />
        <Route path="/ref/linux-commands" element={<LinuxCommands />} />
        <Route path="/ref/chmod" element={<ChmodCalculator />} />
        <Route path="/ref/mirrors" element={<MirrorRegistry />} />
        <Route path="/ref/dns" element={<PublicDns />} />
        <Route path="/ref/emojis" element={<EmojiSymbols />} />
        <Route path="/ref/keyboard-symbols" element={<KeyboardSymbols />} />
        <Route path="/ref/precedence" element={<OperatorPrecedence />} />
        <Route path="/ref/periodic-table" element={<PeriodicTable />} />
        <Route path="/ref/android-permissions" element={<AndroidPermissions />} />
        <Route path="/ref/js-events" element={<JsEvents />} />
        <Route path="/ref/web-fonts" element={<WebFonts />} />

        {/* Misc */}
        <Route path="/misc/qr-decode" element={<QrDecode />} />
        <Route path="/misc/unit-converter" element={<UnitConverter />} />
        <Route path="/misc/timestamp" element={<Navigate to="/convert/timestamp" replace />} />
        <Route path="/misc/color" element={<ColorConverter />} />
        <Route path="/misc/cron" element={<CronGenerator />} />
        <Route path="/misc/password" element={<PasswordGenerator />} />
        <Route path="/misc/qrcode" element={<QrCode />} />
        <Route path="/misc/user-agent" element={<UserAgent />} />
        <Route path="/misc/barcode" element={<BarcodeGenerator />} />
        <Route path="/misc/lunar" element={<LunarCalendar />} />
        <Route path="/misc/keycode" element={<KeyCodeTester />} />
        <Route path="/misc/charts" element={<ChartGenerator />} />
        <Route path="/misc/perception" element={<PerceptionLab />} />
        <Route path="/misc/disk-calc" element={<DiskBandwidthCalc />} />
        <Route path="/misc/health" element={<HealthCalculator />} />
        <Route path="/misc/timer-lucky" element={<TimerLuckyDraw />} />
        <Route path="/misc/grid-paper" element={<GridPaperGenerator />} />
        <Route path="/misc/file-inspector" element={<FileInspector />} />
        <Route path="/misc/mock-data" element={<MockDataGenerator />} />
        <Route path="/misc/renovation-calc" element={<RenovationCalc />} />
        <Route path="/misc/date-calculator" element={<DateCalculator />} />

        {/* 未知路径兜底回首页 */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
