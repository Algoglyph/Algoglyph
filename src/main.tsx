import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { scrubMcpConnectionUrl } from './lib/mcp/bootstrap'
import { ErrorBoundary } from './components/ErrorBoundary'

scrubMcpConnectionUrl()

if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
  })
}

createRoot(document.getElementById('root')!).render(
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
