export interface QueryParamEntry {
  id: number
  key: string
  value: string
}

export interface MergedQueryParam {
  key: string
  values: string[]
}

export interface ParsedUrlResult {
  href: string
  origin: string
  protocol: string
  scheme: string
  username: string
  password: string
  hostname: string
  host: string
  explicitPort: string
  defaultPort: string
  effectivePort: string
  isDefaultPort: boolean
  pathname: string
  pathSegments: { raw: string; decoded: string }[]
  search: string
  queryEntries: QueryParamEntry[]
  mergedQueryParams: MergedQueryParam[]
  hash: string
  hashDecoded: string
}

export type UrlErrorCode =
  | 'whitespace'
  | 'missing_protocol'
  | 'invalid_protocol'
  | 'invalid_port'
  | 'invalid_ipv6'
  | 'missing_host'
  | 'invalid_host'
  | 'invalid_syntax'

export interface UrlParseError {
  code: UrlErrorCode
  detail?: string
}

export type UrlParseOutcome =
  | { ok: true; data: ParsedUrlResult }
  | { ok: false; error: UrlParseError }

const DEFAULT_PORTS: Record<string, string> = {
  'http:': '80',
  'https:': '443',
  'ws:': '80',
  'wss:': '443',
  'ftp:': '21',
  'sftp:': '22',
  'ssh:': '22',
  'telnet:': '23',
  'smtp:': '25',
  'dns:': '53',
  'gopher:': '70',
  'pop3:': '110',
  'imap:': '143',
  'ldap:': '389',
  'ldaps:': '636',
  'rtsp:': '554',
  'mysql:': '3306',
  'postgres:': '5432',
  'postgresql:': '5432',
  'redis:': '6379',
  'rediss:': '6379',
  'mongodb:': '27017',
  'amqp:': '5672',
  'amqps:': '5671',
  'mqtt:': '1883',
  'mqtts:': '8883',
}

export function getDefaultPort(protocol: string): string {
  return DEFAULT_PORTS[protocol.toLowerCase()] ?? ''
}

export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function mergeQueryParams(entries: Pick<QueryParamEntry, 'key' | 'value'>[]): MergedQueryParam[] {
  const map = new Map<string, string[]>()
  for (const entry of entries) {
    const existing = map.get(entry.key)
    if (existing) {
      existing.push(entry.value)
    } else {
      map.set(entry.key, [entry.value])
    }
  }
  return Array.from(map.entries()).map(([key, values]) => ({ key, values }))
}

function diagnoseInvalidUrl(raw: string): UrlParseError {
  const trimmed = raw.trim()

  if (/[\r\n\t ]/.test(trimmed)) {
    return { code: 'whitespace' }
  }

  const schemeSepIdx = trimmed.indexOf('://')
  if (schemeSepIdx === -1) {
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) {
      return { code: 'missing_protocol' }
    }
    const maybeScheme = trimmed.slice(0, colonIdx)
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*$/.test(maybeScheme)) {
      return { code: 'invalid_protocol', detail: maybeScheme }
    }
    // e.g. "localhost:3000/foo" where "localhost" looks like host, not scheme
    if (/^\d+($|\/|\?|#)/.test(trimmed.slice(colonIdx + 1))) {
      return { code: 'missing_protocol' }
    }
    return { code: 'invalid_syntax' }
  }

  const scheme = trimmed.slice(0, schemeSepIdx)
  if (!scheme || !/^[a-zA-Z][a-zA-Z0-9+.-]*$/.test(scheme)) {
    return { code: 'invalid_protocol', detail: scheme }
  }

  const rest = trimmed.slice(schemeSepIdx + 3)
  const authorityEnd = rest.search(/[/?#]/)
  const authority = authorityEnd === -1 ? rest : rest.slice(0, authorityEnd)

  if (!authority) {
    return { code: 'missing_host' }
  }

  const atIdx = authority.lastIndexOf('@')
  const hostPort = atIdx === -1 ? authority : authority.slice(atIdx + 1)

  if (!hostPort) {
    return { code: 'missing_host' }
  }

  // IPv6 host check
  if (hostPort.startsWith('[')) {
    const closeBracket = hostPort.indexOf(']')
    if (closeBracket === -1) {
      return { code: 'invalid_ipv6', detail: hostPort }
    }
    const afterBracket = hostPort.slice(closeBracket + 1)
    if (afterBracket.startsWith(':')) {
      const portStr = afterBracket.slice(1)
      if (!/^\d+$/.test(portStr) || Number(portStr) > 65535) {
        return { code: 'invalid_port', detail: portStr }
      }
    } else if (afterBracket.length > 0) {
      return { code: 'invalid_ipv6', detail: hostPort }
    }
    return { code: 'invalid_ipv6', detail: hostPort.slice(0, closeBracket + 1) }
  }

  // Check port on non-IPv6 host
  const colonIdx = hostPort.lastIndexOf(':')
  if (colonIdx !== -1) {
    const portStr = hostPort.slice(colonIdx + 1)
    const hostOnly = hostPort.slice(0, colonIdx)
    if (!hostOnly) {
      return { code: 'missing_host' }
    }
    if (portStr.length > 0 && (!/^\d+$/.test(portStr) || Number(portStr) > 65535)) {
      return { code: 'invalid_port', detail: portStr }
    }
  }

  return { code: 'invalid_host', detail: hostPort }
}

export function parseUrl(raw: string): UrlParseOutcome {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, error: { code: 'invalid_syntax' } }
  }

  // Reject embedded spaces/newlines explicitly because WHATWG URL silently strips some ASCII tabs/newlines
  if (/[\r\n\t]/.test(trimmed) || /\s/.test(trimmed)) {
    return { ok: false, error: { code: 'whitespace' } }
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return { ok: false, error: diagnoseInvalidUrl(trimmed) }
  }

  // Additional sanity check for hierarchical schemes that require a host
  const hierarchicalSchemes = new Set(['http:', 'https:', 'ws:', 'wss:', 'ftp:'])
  if (hierarchicalSchemes.has(url.protocol) && !url.hostname) {
    return { ok: false, error: { code: 'missing_host' } }
  }

  const defaultPort = getDefaultPort(url.protocol)
  const explicitPort = url.port
  const effectivePort = explicitPort || defaultPort
  const isDefaultPort = !explicitPort && Boolean(defaultPort)

  const pathSegments = url.pathname
    .split('/')
    .filter(seg => seg.length > 0)
    .map(seg => ({
      raw: seg,
      decoded: safeDecodeURIComponent(seg),
    }))

  const queryEntries: QueryParamEntry[] = []
  let idx = 1
  url.searchParams.forEach((value, key) => {
    queryEntries.push({ id: idx++, key, value })
  })

  const mergedQueryParams = mergeQueryParams(queryEntries)

  return {
    ok: true,
    data: {
      href: url.href,
      origin: url.origin === 'null' ? '' : url.origin,
      protocol: url.protocol,
      scheme: url.protocol.replace(/:$/, ''),
      username: safeDecodeURIComponent(url.username),
      password: safeDecodeURIComponent(url.password),
      hostname: url.hostname,
      host: url.host,
      explicitPort,
      defaultPort,
      effectivePort,
      isDefaultPort,
      pathname: url.pathname,
      pathSegments,
      search: url.search,
      queryEntries,
      mergedQueryParams,
      hash: url.hash,
      hashDecoded: url.hash ? safeDecodeURIComponent(url.hash) : '',
    },
  }
}

export function rebuildUrlWithQueryParams(
  baseHref: string,
  entries: Pick<QueryParamEntry, 'key' | 'value'>[],
): string {
  const url = new URL(baseHref)
  const params = new URLSearchParams()
  for (const entry of entries) {
    if (entry.key === '' && entry.value === '') continue
    params.append(entry.key, entry.value)
  }
  const qs = params.toString()
  url.search = qs ? `?${qs}` : ''
  return url.href
}
