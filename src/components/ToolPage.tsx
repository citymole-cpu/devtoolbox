import { useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getToolByPath, getCategoryByToolPath } from '../lib/toolRegistry'
import { useI18n } from './I18nProvider'
import { useToolPreferences } from './ToolPreferencesProvider'
import { AdSlot } from './AdSlot'
import { ChevronRight, Home, Star } from 'lucide-react'

interface ToolPageProps {
  title?: string
  description?: string
  children: React.ReactNode
}

export function ToolPage({ title, description, children }: ToolPageProps) {
  const location = useLocation()
  const { getCategoryName, getToolName, getToolDesc, t } = useI18n()
  const { isFavorite, toggleFavorite, recordRecent } = useToolPreferences()
  const tool = getToolByPath(location.pathname)
  const category = getCategoryByToolPath(location.pathname)

  useEffect(() => {
    if (tool) {
      recordRecent(tool.id)
    }
  }, [tool, recordRecent])

  const displayTitle = tool ? getToolName(tool) : (title || t.tools)
  const displayDesc = tool ? getToolDesc(tool) : (description || '')
  const favorited = tool ? isFavorite(tool.id) : false

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors" title={t.home}>
          <Home className="w-4 h-4" />
        </Link>
        {category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{getCategoryName(category)}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 dark:text-gray-100 font-medium">{displayTitle}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{displayTitle}</h1>
          {displayDesc && (
            <p className="mt-1 text-gray-500 dark:text-gray-400">{displayDesc}</p>
          )}
        </div>
        {tool && (
          <button
            type="button"
            onClick={() => toggleFavorite(tool.id)}
            aria-pressed={favorited}
            aria-label={favorited ? t.removeFavorite : t.addFavorite}
            title={favorited ? t.removeFavorite : t.addFavorite}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium flex-shrink-0 transition-colors ${
              favorited
                ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/70'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-700'
            }`}
          >
            <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{favorited ? t.favorited : t.favorite}</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>

      {/* 广告位：工具页底部，工具内容下方（A-ADS） */}
      <AdSlot slot="tool-bottom" />
    </div>
  )
}

export default ToolPage


