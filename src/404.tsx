import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import './index.css'
import { NotFoundPage } from './components/NotFoundPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { capturePublicPageView } from './lib/analytics'

if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    autocapture: false,
  })
  capturePublicPageView(posthog, window.location.pathname)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PostHogProvider client={posthog}>
        <NotFoundPage />
      </PostHogProvider>
    </ErrorBoundary>
  </StrictMode>,
)
