import { useState, useCallback } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyToClipboard } from '../lib/utils'
import { useI18n } from './I18nProvider'

interface CopyButtonProps {
  text: string
  className?: string
  label?: string
}

export function CopyButton({ text, className = '', label }: CopyButtonProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!text) return
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`btn-ghost btn-sm inline-flex items-center gap-1.5 ${className}`}
      title={t.copy}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-500">{t.copied}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  )
}

export default CopyButton


