import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Key, Wand2 } from 'lucide-react'

// ArrayBuffer to Base64
function ab2b64(buf: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function b642ab(b64: string): ArrayBuffer {
  const binary = window.atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export default function Rsa() {
  const [keySize, setKeySize] = useState<number>(2048)
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [cryptoKeyPair, setCryptoKeyPair] = useState<CryptoKeyPair | null>(null)

  const [plainInput, setPlainInput] = useState('Secret RSA message!')
  const [encryptedOutput, setEncryptedOutput] = useState('')
  const [decryptedOutput, setDecryptedOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateKeyPair = async () => {
    setLoading(true)
    setError('')
    try {
      const pair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      )

      setCryptoKeyPair(pair)

      // Export Public Key
      const spki = await window.crypto.subtle.exportKey('spki', pair.publicKey)
      const pubB64 = ab2b64(spki)
      setPublicKey(`-----BEGIN PUBLIC KEY-----\n${pubB64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`)

      // Export Private Key
      const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', pair.privateKey)
      const privB64 = ab2b64(pkcs8)
      setPrivateKey(`-----BEGIN PRIVATE KEY-----\n${privB64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '密钥生成失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEncrypt = async () => {
    if (!cryptoKeyPair || !plainInput.trim()) return
    setError('')
    try {
      const data = new TextEncoder().encode(plainInput)
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        cryptoKeyPair.publicKey,
        data
      )
      setEncryptedOutput(ab2b64(encrypted))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加密失败')
    }
  }

  const handleDecrypt = async () => {
    if (!cryptoKeyPair || !encryptedOutput.trim()) return
    setError('')
    try {
      const data = b642ab(encryptedOutput)
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        cryptoKeyPair.privateKey,
        data
      )
      setDecryptedOutput(new TextDecoder().decode(decrypted))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '解密失败')
    }
  }

  return (
    <ToolPage title="RSA 密钥与非对称加解密" description="基于 Web Crypto API 纯本地生成 RSA 公私钥对，支持公钥加密与私钥解密测试">
      <div className="flex flex-col gap-6">
        {/* Key Generation Bar */}
        <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">密钥长度:</span>
            <select
              value={keySize}
              onChange={e => setKeySize(Number(e.target.value))}
              className="select-field text-xs font-mono font-bold"
            >
              <option value={1024}>1024 位 (快速测试)</option>
              <option value={2048}>2048 位 (生产标准推荐)</option>
            </select>
          </div>

          <button
            onClick={generateKeyPair}
            disabled={loading}
            className="btn-primary flex items-center gap-1.5"
          >
            <Wand2 className="w-4 h-4" />
            <span>{loading ? '正在生成密钥对...' : '一键生成 RSA 密钥对'}</span>
          </button>
        </div>

        {error && <div className="error-text text-xs">{error}</div>}

        {/* Keys display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">公钥 (Public Key - PKCS#8)</span>
              <CopyButton text={publicKey} />
            </div>
            <textarea
              value={publicKey}
              readOnly
              rows={6}
              placeholder="生成后在此展示公钥..."
              className="editor-area text-[11px] font-mono resize-none"
            />
          </div>

          <div className="card p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">私钥 (Private Key)</span>
              <CopyButton text={privateKey} />
            </div>
            <textarea
              value={privateKey}
              readOnly
              rows={6}
              placeholder="生成后在此展示私钥..."
              className="editor-area text-[11px] font-mono resize-none"
            />
          </div>
        </div>

        {/* Encryption & Decryption test */}
        <div className="card p-5 flex flex-col gap-4">
          <span className="text-sm font-semibold">公钥加密与私钥解密链路测试</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <label className="label text-xs">1. 输入待加密明文</label>
              <textarea
                value={plainInput}
                onChange={e => setPlainInput(e.target.value)}
                rows={4}
                className="editor-area text-xs font-mono resize-none"
              />
              <button
                onClick={handleEncrypt}
                disabled={!cryptoKeyPair}
                className="btn-primary btn-sm"
              >
                公钥加密 ➔
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="label text-xs mb-0">2. 加密后 Base64 密文</label>
                <CopyButton text={encryptedOutput} />
              </div>
              <textarea
                value={encryptedOutput}
                readOnly
                rows={4}
                className="editor-area text-[10px] font-mono resize-none"
              />
              <button
                onClick={handleDecrypt}
                disabled={!encryptedOutput}
                className="btn-secondary btn-sm"
              >
                私钥解密 ➔
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="label text-xs mb-0">3. 私钥解密后还原明文</label>
                <CopyButton text={decryptedOutput} />
              </div>
              <textarea
                value={decryptedOutput}
                readOnly
                rows={4}
                className="editor-area text-xs font-mono resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

