import './index.css'
import Routing from '@/router/routes'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { RouterProvider } from 'react-router-dom'
import { Router as RemixRouter } from '@remix-run/router'

// Accept an optional serverRouter prop for SSR
interface AppProps {
  serverRouter?: RemixRouter
}

function App({ serverRouter }: AppProps = {}) {
  return (
    <Provider store={store}>
      {serverRouter ? (
        // If we're rendering on the server, use the provided router
        <RouterProvider router={serverRouter} />
      ) : (
        // Otherwise use the client-side routing
        <Routing />
      )}
    </Provider>
  )
}

export default App
