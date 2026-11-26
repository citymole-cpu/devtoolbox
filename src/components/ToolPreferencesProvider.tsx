import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

const FAVORITES_STORAGE_KEY = 'devtoolbox-favorites'
const RECENT_STORAGE_KEY = 'devtoolbox-recent'
const MAX_RECENT_TOOLS = 8

interface ToolPreferencesContextType {
  favorites: string[]
  recentTools: string[]
  isFavorite: (toolId: string) => boolean
  toggleFavorite: (toolId: string) => void
  recordRecent: (toolId: string) => void
  clearRecent: () => void
}

const ToolPreferencesContext = createContext<ToolPreferencesContextType | undefined>(undefined)

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

function writeStringArray(key: string, value: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota exceeded or storage disabled */
  }
}

export function ToolPreferencesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => readStringArray(FAVORITES_STORAGE_KEY))
  const [recentTools, setRecentTools] = useState<string[]>(() =>
    readStringArray(RECENT_STORAGE_KEY).slice(0, MAX_RECENT_TOOLS)
  )

  // Sync across browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY) {
        setFavorites(readStringArray(FAVORITES_STORAGE_KEY))
      } else if (e.key === RECENT_STORAGE_KEY) {
        setRecentTools(readStringArray(RECENT_STORAGE_KEY).slice(0, MAX_RECENT_TOOLS))
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  )

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(toolId)
      const next = exists ? prev.filter(id => id !== toolId) : [...prev, toolId]
      writeStringArray(FAVORITES_STORAGE_KEY, next)
      return next
    })
  }, [])

  const recordRecent = useCallback((toolId: string) => {
    setRecentTools(prev => {
      if (prev[0] === toolId) return prev
      const next = [toolId, ...prev.filter(id => id !== toolId)].slice(0, MAX_RECENT_TOOLS)
      writeStringArray(RECENT_STORAGE_KEY, next)
      return next
    })
  }, [])

  const clearRecent = useCallback(() => {
    setRecentTools([])
    writeStringArray(RECENT_STORAGE_KEY, [])
  }, [])

  return (
    <ToolPreferencesContext.Provider
      value={{
        favorites,
        recentTools,
        isFavorite,
        toggleFavorite,
        recordRecent,
        clearRecent,
      }}
    >
      {children}
    </ToolPreferencesContext.Provider>
  )
}

export function useToolPreferences() {
  const context = useContext(ToolPreferencesContext)
  if (!context) {
    throw new Error('useToolPreferences must be used within a ToolPreferencesProvider')
  }
  return context
}
