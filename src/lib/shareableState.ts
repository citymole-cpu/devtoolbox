import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const SHARE_PARAM_KEY = 's';
export const MAX_SHARE_URL_LENGTH = 8000;

const FORMAT_RAW = 0x00;
const FORMAT_DEFLATE = 0x01;
const COMPRESSION_THRESHOLD_BYTES = 64;

export type ShareUrlResult =
  | { ok: true; url: string; length: number }
  | { ok: false; reason: 'too_long'; length: number; maxLength: number }
  | { ok: false; reason: 'encode_error'; error: string };

function bytesToBase64Url(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad === 1) {
    throw new Error('Invalid Base64URL length');
  }
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function compressDeflateRaw(data: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === 'undefined') {
    return null;
  }
  try {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    const bufferCopy = new Uint8Array(data.byteLength);
    bufferCopy.set(data);
    writer.write(bufferCopy);
    writer.close();
    const compressedBuffer = await new Response(cs.readable).arrayBuffer();
    return new Uint8Array(compressedBuffer);
  } catch {
    return null;
  }
}

async function decompressDeflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DecompressionStream is not supported in this browser');
  }
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  const bufferCopy = new Uint8Array(data.byteLength);
  bufferCopy.set(data);
  writer.write(bufferCopy);
  writer.close();
  const decompressedBuffer = await new Response(ds.readable).arrayBuffer();
  return new Uint8Array(decompressedBuffer);
}

function withHeader(header: number, payload: Uint8Array): Uint8Array {
  const result = new Uint8Array(payload.length + 1);
  result[0] = header;
  result.set(payload, 1);
  return result;
}

function parseStateObject(json: string): Record<string, unknown> | null {
  const parsed: unknown = JSON.parse(json);
  if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  return null;
}

/**
 * Synchronous Base64URL encoding (uncompressed UTF-8 JSON with format header).
 */
export function encodeShareState(state: Record<string, unknown>): string {
  const rawBytes = new TextEncoder().encode(JSON.stringify(state));
  return bytesToBase64Url(withHeader(FORMAT_RAW, rawBytes));
}

/**
 * Async encoding that uses native deflate-raw compression when it reduces size,
 * falling back to uncompressed UTF-8 Base64URL.
 */
export async function encodeShareStateAsync(state: Record<string, unknown>): Promise<string> {
  const rawBytes = new TextEncoder().encode(JSON.stringify(state));
  if (rawBytes.length >= COMPRESSION_THRESHOLD_BYTES) {
    const compressed = await compressDeflateRaw(rawBytes);
    if (compressed && compressed.length < rawBytes.length) {
      return bytesToBase64Url(withHeader(FORMAT_DEFLATE, compressed));
    }
  }
  return bytesToBase64Url(withHeader(FORMAT_RAW, rawBytes));
}

/**
 * Synchronous decoding for uncompressed `?s=` payloads.
 * Returns null if the payload is compressed or invalid.
 */
export function decodeShareState<T extends Record<string, unknown> = Record<string, unknown>>(
  encoded: string
): Partial<T> | null {
  if (!encoded) return null;
  try {
    const bytes = base64UrlToBytes(encoded);
    if (bytes.length === 0) return null;
    if (bytes[0] === FORMAT_DEFLATE) {
      return null;
    }
    const payload = bytes[0] === FORMAT_RAW ? bytes.subarray(1) : bytes;
    const json = new TextDecoder().decode(payload);
    return parseStateObject(json) as Partial<T> | null;
  } catch {
    return null;
  }
}

/**
 * Async decoding supporting both compressed (deflate-raw) and uncompressed `?s=` payloads.
 */
export async function decodeShareStateAsync<
  T extends Record<string, unknown> = Record<string, unknown>
>(encoded: string): Promise<Partial<T> | null> {
  if (!encoded) return null;
  try {
    const bytes = base64UrlToBytes(encoded);
    if (bytes.length === 0) return null;
    let payload: Uint8Array;
    if (bytes[0] === FORMAT_DEFLATE) {
      payload = await decompressDeflateRaw(bytes.subarray(1));
    } else if (bytes[0] === FORMAT_RAW) {
      payload = bytes.subarray(1);
    } else {
      payload = bytes;
    }
    const json = new TextDecoder().decode(payload);
    return parseStateObject(json) as Partial<T> | null;
  } catch {
    return null;
  }
}

/**
 * Build a shareable URL containing `?s=<encoded>` while enforcing MAX_SHARE_URL_LENGTH.
 */
export async function buildShareUrl(
  state: Record<string, unknown>,
  baseUrl?: string
): Promise<ShareUrlResult> {
  try {
    const encoded = await encodeShareStateAsync(state);
    const url = new URL(baseUrl ?? window.location.href);
    url.searchParams.set(SHARE_PARAM_KEY, encoded);
    const urlStr = url.toString();
    if (urlStr.length > MAX_SHARE_URL_LENGTH) {
      return {
        ok: false,
        reason: 'too_long',
        length: urlStr.length,
        maxLength: MAX_SHARE_URL_LENGTH,
      };
    }
    return {
      ok: true,
      url: urlStr,
      length: urlStr.length,
    };
  } catch (e: unknown) {
    return {
      ok: false,
      reason: 'encode_error',
      error: e instanceof Error ? e.message : 'Encode failed',
    };
  }
}

/**
 * React hook for restoring tool state from the `?s=` URL query parameter on load
 * and generating shareable URLs on demand without mutating browser history.
 */
export function useShareableState<T extends Record<string, unknown>>(
  getState: () => T,
  onRestore: (state: Partial<T>) => void
) {
  const location = useLocation();
  const getStateRef = useRef(getState);
  const onRestoreRef = useRef(onRestore);
  getStateRef.current = getState;
  onRestoreRef.current = onRestore;

  const [restoredFromUrl, setRestoredFromUrl] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encoded = params.get(SHARE_PARAM_KEY);
    if (!encoded) return;

    let cancelled = false;
    decodeShareStateAsync<T>(encoded).then((decoded) => {
      if (!cancelled && decoded) {
        onRestoreRef.current(decoded);
        setRestoredFromUrl(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location.search]);

  const createShareUrl = useCallback(async (): Promise<ShareUrlResult> => {
    return buildShareUrl(getStateRef.current());
  }, []);

  return {
    createShareUrl,
    restoredFromUrl,
  };
}
