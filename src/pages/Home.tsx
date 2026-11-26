import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { categories, getToolById, type ToolInfo } from '../lib/toolRegistry'
import { useI18n } from '../components/I18nProvider'
import { useToolPreferences } from '../components/ToolPreferencesProvider'
import { AdSlot } from '../components/AdSlot'
import { Wrench, Search, Zap, Shield, Moon, Star, Clock, Trash2 } from 'lucide-react'

function ToolCard({ tool }: { tool: ToolInfo }) {
  const { t, getToolName, getToolDesc } = useI18n()
  const { isFavorite, toggleFavorite } = useToolPreferences()
  const ToolIcon = tool.icon
  const favorited = isFavorite(tool.id)

  return (
    <div className="relative group">
      <Link
        to={tool.path}
        className="card p-4 pr-10 flex items-start gap-3 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200 h-full"
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
      <button
        type="button"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite(tool.id)
        }}
        aria-pressed={favorited}
        aria-label={favorited ? t.removeFavorite : t.addFavorite}
        title={favorited ? t.removeFavorite : t.addFavorite}
        className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-colors ${
          favorited
            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50'
            : 'text-gray-300 dark:text-gray-600 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
      </button>
    </div>
  )
}

export default function Home() {
  const { t, getCategoryName } = useI18n()
  const { favorites, recentTools, clearRecent } = useToolPreferences()

  const favoriteToolList = useMemo(
    () => favorites.map(id => getToolById(id)).filter((item): item is ToolInfo => Boolean(item)),
    [favorites]
  )

  const recentToolList = useMemo(
    () => recentTools.map(id => getToolById(id)).filter((item): item is ToolInfo => Boolean(item)),
    [recentTools]
  )

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

      {/* 广告位：首页 Hero 下方横幅（A-ADS） */}
      <AdSlot slot="home-top" />

      {/* Favorites Section */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <h2 className="text-lg font-semibold">{t.favorites}</h2>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {favoriteToolList.length}
          </span>
        </div>
        {favoriteToolList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {favoriteToolList.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="card p-4 text-sm text-gray-500 dark:text-gray-400">
            {t.favoritesEmpty}
          </div>
        )}
      </section>

      {/* Recently Used Section */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold">{t.recentTools}</h2>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {recentToolList.length}
            </span>
          </div>
          {recentToolList.length > 0 && (
            <button
              type="button"
              onClick={clearRecent}
              className="btn-ghost btn-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearRecent}</span>
            </button>
          )}
        </div>
        {recentToolList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {recentToolList.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="card p-4 text-sm text-gray-500 dark:text-gray-400">
            {t.recentEmpty}
          </div>
        )}
      </section>

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
                {cat.tools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* 广告位：首页底部（A-ADS） */}
      <AdSlot slot="home-bottom" />

      {/* 首页介绍：可索引的文字内容（SEO） */}
      <section className="max-w-3xl mx-auto text-center px-2">
        <h2 className="text-xl font-semibold mb-3">{t.homeIntroTitle}</h2>
        <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t.homeIntroP1}</p>
        <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 mt-2">{t.homeIntroP2}</p>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t text-sm text-gray-400 dark:text-gray-600">
        <p>DevToolBox - {t.tagline} · {t.clientOnlyNotice}</p>
      </footer>
    </div>
  )
}
