import {
  createBrowserRouter,
  createMemoryRouter,
  RouteObject,
} from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import HomePage from '@/pages'
import CommonLayout from '@/components/layouts/common.layout'
import AuthenticationPage from '@/pages/authentication/page'

// Define your routes as plain objects that can be used with any router
export const routes: RouteObject[] = [
  {
    element: <CommonLayout />,
    children: [{ path: '/', element: <HomePage /> }],
  },
  { path: '/register', element: <AuthenticationPage /> },
]

// Client-side component that creates a browser router
const Routing = () => {
  const router = createBrowserRouter(routes)

  return <RouterProvider router={router} />
}

export default Routing

// Create a server router function that can be imported in entry-server.tsx
export function createServerRouter(url: string) {
  return createMemoryRouter(routes, {
    initialEntries: [url],
  })
}
