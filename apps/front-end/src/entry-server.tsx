import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { createServerRouter } from '@/router/routes'

export function render(url: string) {
  console.log('url', url) // Log the URL for debugging purposes

  // Create a memory router for server-side rendering
  const router = createServerRouter(url)

  const html = renderToString(
    <StrictMode>
      <App serverRouter={router} />
    </StrictMode>,
  )

  return { html }
}
