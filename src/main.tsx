import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { HelmetProvider } from 'react-helmet-async'
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import '@fontsource-variable/inter/index.css'
import './index.css'
import App from './App.tsx'
import { scrubMcpConnectionUrl } from './lib/mcp/bootstrap'
import { ErrorBoundary } from './components/ErrorBoundary'

scrubMcpConnectionUrl()

const rootElement = document.getElementById('root')!
const staticHeadSelectors = [
  'link[rel="canonical"]',
  'link[rel="alternate"][hreflang]',
  'meta[name="description"]',
  'meta[name="robots"]',
  'meta[name="author"]',
  'meta[name="application-name"]',
  'meta[name="theme-color"]',
  'meta[name^="twitter:"]',
  'meta[property^="og:"]',
  'meta[property^="article:"]',
  'script[type="application/ld+json"]',
]
document.querySelectorAll(staticHeadSelectors.join(',')).forEach((element) => {
  if (!element.hasAttribute('data-rh')) element.remove()
})
// Static route HTML contains crawlable fallback content. React owns this node
// after hydration, so remove the fallback before mounting the interactive app.
rootElement.replaceChildren()

if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
  })
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <PostHogProvider client={posthog}>
          <App />
        </PostHogProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
