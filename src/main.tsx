import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.less'
import App from './App.tsx'

// Initialize Sentry
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions in dev, lower in production
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Environment
    environment: import.meta.env.MODE,
    // Release tracking (optional, set during build)
    // release: 'your-app@version',
  })
}

createRoot(document.getElementById('root')!).render(
  <App />
)
