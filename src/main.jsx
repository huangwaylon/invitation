import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* Import order IS the cascade, and it matters: tokens define the custom properties
   everything else reads, base resets and sets the element defaults, trail lays out the
   structure, app styles what sits inside it. Vite concatenates them in this order into one
   stylesheet, so there is no request cost to the split. */
import './styles/tokens.css'
import './styles/base.css'
import './styles/trail.css'
import './styles/app.css'

import App from './App.jsx'
import { syncDocumentLocale } from './i18n/index.js'

/**
 * Set `lang` on <html> BEFORE the first paint, not in App's effect.
 *
 * The effect also does it, and has to, for a later language switch — but an effect runs
 * after the first commit, and `lang` is what selects the per-locale CJK font stack in
 * tokens.css. Leaving it to the effect means a Chinese reader gets one frame of Japanese
 * letterforms and a font swap on load.
 */
syncDocumentLocale()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
