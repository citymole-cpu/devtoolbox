import { useState, useEffect, useCallback, Suspense } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Menu, X, Search, Sun, Moon, Wrench } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useI18n } from './I18nProvider'
import { Seo } from './Seo'
import { LanguageSelector } from './LanguageSelector'
import { Sidebar } from './Sidebar'
import { SearchDialog } from './SearchDialog'

export function Layout() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="flex h-screen overflow-hidden">
      <Seo />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b">
          <div className="p-1.5 bg-brand-600 rounded-lg">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <Link to="/" className="font-bold text-lg tracking-tight">
            DevToolBox
          </Link>
        </div>

        {/* Search trigger */}
        <div className="px-3 py-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-400 text-sm hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">{t.searchPlaceholder}</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500">
              {t.searchShortcut}
            </kbd>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <Sidebar />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t text-xs text-gray-400 dark:text-gray-600">
          <span>{t.clientOnlyNotice}</span>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={closeSidebar}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <aside
            className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-950 border-r overflow-y-auto z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-brand-600 rounded-lg">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">DevToolBox</span>
              </div>
              <button onClick={closeSidebar} className="btn-icon p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-2 py-2">
              <Sidebar />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-icon p-1.5 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="p-1 bg-brand-600 rounded-md">
              <Wrench className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">DevToolBox</span>
          </Link>

          <div className="flex-1" />

          {/* Search trigger (mobile) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="btn-icon p-1.5 lg:hidden"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="btn-icon p-1.5" title={t.toggleTheme}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

