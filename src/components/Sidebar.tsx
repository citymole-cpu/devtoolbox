import { useState, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { categories } from '../lib/toolRegistry'
import { useI18n } from './I18nProvider'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation()
  const { getCategoryName, getToolName } = useI18n()
  const [expandedCats, setExpandedCats] = useState<Set<string>>(() => {
    // Auto-expand the current category
    const cat = categories.find(c => c.tools.some(t => t.path === location.pathname))
    return new Set(cat ? [cat.id] : ['json'])
  })

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }, [])

  if (collapsed) return null

  return (
    <nav className="flex flex-col gap-1 py-2">
      {categories.map(cat => {
        const isExpanded = expandedCats.has(cat.id)
        const CatIcon = cat.icon
        const isActive = cat.tools.some(t => t.path === location.pathname)

        return (
          <div key={cat.id}>
            <button
              onClick={() => toggleCategory(cat.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'text-brand-700 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              <CatIcon className={`w-4 h-4 ${cat.color}`} />
              <span className="flex-1 text-left">{getCategoryName(cat)}</span>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              )}
              <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                {cat.tools.length}
              </span>
            </button>

            {isExpanded && (
              <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-gray-200 dark:border-gray-800 pl-3">
                {cat.tools.map(tool => {
                  const ToolIcon = tool.icon
                  return (
                    <NavLink
                      key={tool.id}
                      to={tool.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium'
                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`
                      }
                    >
                      <ToolIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{getToolName(tool)}</span>
                    </NavLink>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

