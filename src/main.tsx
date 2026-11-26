import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './components/ThemeProvider'
import { I18nProvider } from './components/I18nProvider'
import { ToolPreferencesProvider } from './components/ToolPreferencesProvider'
import './index.css'

// 兼容旧版 HashRouter 链接（如 /tools/#/json/formatter）：
// 把 # 后面的路径提升为正式路径，避免旧书签/外链落到首页。
if (window.location.hash.startsWith('#/')) {
  const target = window.location.hash.slice(1)
  window.history.replaceState(null, '', `/tools${target}`)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/tools/">
      <ThemeProvider>
        <I18nProvider>
          <ToolPreferencesProvider>
            <App />
          </ToolPreferencesProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

