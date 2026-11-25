import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { searchTools, type ToolInfo } from '../lib/toolRegistry'
import { useI18n } from './I18nProvider'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const { t, getToolName, getToolDesc } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ToolInfo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setResults(searchTools(''))
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setResults(searchTools(query))
    setSelectedIndex(0)
  }, [query])

  const handleSelect = useCallback(
    (tool: ToolInfo) => {
      navigate(tool.path)
      onClose()
    },
    [navigate, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) handleSelect(results[selectedIndex])
          break
        case 'Escape':
          onClose()
          break
      }
    },
    [results, selectedIndex, handleSelect, onClose]
  )

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
        else {
          // Trigger open via parent – we rely on the open prop being updated
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 py-3 bg-transparent text-base outline-none placeholder:text-gray-400"
          />
          <button onClick={onClose} className="btn-icon p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              {t.noResults}
            </div>
          ) : (
            results.map((tool, i) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    i === selectedIndex
                      ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{getToolName(tool)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{getToolDesc(tool)}</div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t text-xs text-gray-400 flex items-center gap-4">
          <span><kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">↑↓</kbd> 导航</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">Enter</kbd> 打开</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">Esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  )
}

