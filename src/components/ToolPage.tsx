import { useLocation } from 'react-router-dom'
import { getToolByPath, getCategoryByToolPath } from '../lib/toolRegistry'
import { useI18n } from './I18nProvider'
import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ToolPageProps {
  title?: string
  description?: string
  children: React.ReactNode
}

export function ToolPage({ title, description, children }: ToolPageProps) {
  const location = useLocation()
  const { getCategoryName, getToolName, getToolDesc, t } = useI18n()
  const tool = getToolByPath(location.pathname)
  const category = getCategoryByToolPath(location.pathname)

  const displayTitle = tool ? getToolName(tool) : (title || t.tools)
  const displayDesc = tool ? getToolDesc(tool) : (description || '')

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{displayTitle}</h1>
        {displayDesc && (
          <p className="mt-1 text-gray-500 dark:text-gray-400">{displayDesc}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default ToolPage


