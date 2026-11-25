import { Link } from 'react-router-dom'
import { categories } from '../lib/toolRegistry'
import { useI18n } from '../components/I18nProvider'
import { Wrench, Search, Zap, Shield, Moon } from 'lucide-react'

export default function Home() {
  const { t, getCategoryName, getToolName, getToolDesc } = useI18n()

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand-600 rounded-2xl">
            <Wrench className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          {t.heroTitle}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {t.heroSubtitle}
        </p>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{t.featureRealtime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-green-500" />
            <span>{t.featureClientOnly}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-purple-500" />
            <span>{t.featureDarkMode}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-500" />
            <span>{t.featureSearch}</span>
          </div>
        </div>
      </div>

      {/* Tool Categories Grid */}
      <div className="grid gap-8">
        {categories.map(cat => {
          const CatIcon = cat.icon
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-2.5 mb-4">
                <CatIcon className={`w-5 h-5 ${cat.color}`} />
                <h2 className="text-lg font-semibold">{getCategoryName(cat)}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {cat.tools.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {cat.tools.map(tool => {
                  const ToolIcon = tool.icon
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="card p-4 flex items-start gap-3 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-950 transition-colors">
                        <ToolIcon className="w-5 h-5 text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                          {getToolName(tool)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {getToolDesc(tool)}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 border-t text-sm text-gray-400 dark:text-gray-600">
        <p>DevToolBox - {t.tagline} · {t.clientOnlyNotice}</p>
      </footer>
    </div>
  )
}
