import { useState } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import CryptoJS from 'crypto-js'

export default function Des() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [algo, setAlgo] = useState<'DES' | 'TripleDES'>('DES')
  const [input, setInput] = useState('Secret Message 123456')
  const [key, setKey] = useState('my-secret-key-8b')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleProcess = (txt: string, k: string, m: 'encrypt' | 'decrypt', al: 'DES' | 'TripleDES') => {
    setInput(txt)
    setKey(k)
    if (!txt.trim() || !k.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      const cryptoFn = al === 'DES' ? CryptoJS.DES : CryptoJS.TripleDES

      if (m === 'encrypt') {
        const encrypted = cryptoFn.encrypt(txt, k)
        setOutput(encrypted.toString())
        setError('')
      } else {
        const decrypted = cryptoFn.decrypt(txt, k)
        const plain = decrypted.toString(CryptoJS.enc.Utf8)
        if (!plain && txt) {
          setError('解密失败，密钥不匹配或密文损坏')
          setOutput('')
        } else {
          setOutput(plain)
          setError('')
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加解密计算失败')
      setOutput('')
    }
  }

  return (
    <ToolPage title="DES / 3DES 加解密" description="标准数据加密算法 DES 与 TripleDES (3DES) 对称加密与解密在线计算">
      <div className="flex flex-col gap-6">
        <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMode('encrypt'); handleProcess(input, key, 'encrypt', algo) }}
              className={`btn btn-sm ${mode === 'encrypt' ? 'btn-primary' : 'btn-secondary'}`}
            >
              加密 (Encrypt)
            </button>
            <button
              onClick={() => { setMode('decrypt'); handleProcess(input, key, 'decrypt', algo) }}
              className={`btn btn-sm ${mode === 'decrypt' ? 'btn-primary' : 'btn-secondary'}`}
            >
              解密 (Decrypt)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">算法选择:</span>
            <select
              value={algo}
              onChange={e => {
                const a = e.target.value as any
                setAlgo(a)
                handleProcess(input, key, mode, a)
              }}
              className="select-field text-xs font-mono font-bold"
            >
              <option value="DES">标准 DES (56-bit)</option>
              <option value="TripleDES">TripleDES (3DES / 168-bit)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-5 flex flex-col gap-3">
            <label className="label text-xs">
              {mode === 'encrypt' ? '待加密的明文文本' : '待解密的 Base64 密文'}
            </label>
            <textarea
              value={input}
              onChange={e => handleProcess(e.target.value, key, mode, algo)}
              rows={6}
              className="editor-area text-xs font-mono resize-none"
            />

            <div>
              <label className="label text-xs">加解密密钥 (Secret Key)</label>
              <input
                type="text"
                value={key}
                onChange={e => handleProcess(input, e.target.value, mode, algo)}
                className="input-field text-xs font-mono"
              />
            </div>
          </div>

          <div className="card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">
                {mode === 'encrypt' ? '加密结果 (Base64)' : '解密后的明文'}
              </span>
              <CopyButton text={output} />
            </div>

            <textarea
              value={output}
              readOnly
              rows={9}
              className="editor-area text-xs font-mono resize-none"
            />
            {error && <div className="error-text text-xs">{error}</div>}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

