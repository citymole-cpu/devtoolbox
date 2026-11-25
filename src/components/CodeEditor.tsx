import { useCallback, useRef, type ChangeEvent, type DragEvent } from 'react'
import { cn } from '../lib/utils'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  language?: string
  minHeight?: string
  maxHeight?: string
  className?: string
  wrap?: boolean
}

export function CodeEditor({
  value,
  onChange,
  placeholder = '',
  readOnly = false,
  minHeight = '200px',
  maxHeight,
  className = '',
  wrap = true,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value)
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('text/') || file?.name.match(/\.(json|xml|yaml|yml|csv|toml|sql|md|txt|html|css|js|ts|properties)$/i)) {
        const reader = new FileReader()
        reader.onload = () => {
          onChange?.(reader.result as string)
        }
        reader.readAsText(file)
      }
    },
    [onChange]
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Tab key inserts 2 spaces
      if (e.key === 'Tab') {
        e.preventDefault()
        const textarea = textareaRef.current
        if (textarea && onChange) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newValue = value.substring(0, start) + '  ' + value.substring(end)
          onChange(newValue)
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2
          })
        }
      }
    },
    [value, onChange]
  )

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onKeyDown={readOnly ? undefined : handleKeyDown}
      placeholder={placeholder}
      readOnly={readOnly}
      spellCheck={false}
      className={cn(
        'editor-area',
        readOnly && 'bg-gray-50 dark:bg-gray-900/50 cursor-default',
        !wrap && 'whitespace-pre overflow-x-auto',
        className
      )}
      style={{ minHeight, maxHeight }}
    />
  )
}

export default CodeEditor


