import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Backdrop, Header, PageIntro, ScrollTop } from './components/Layout'
import { ContentProvider, useContent } from './data/content'
import Home from './pages/Home'
import Work from './pages/Work'
import Project from './pages/Project'
import Studio from './pages/Studio'
import Insights from './pages/Insights'
import Contact from './pages/Contact'
import { initTheme } from './theme'
import './styles/global.css'

initTheme()

const AdminApp = lazy(() => import('./admin/AdminApp'))

function SiteLayout() {
  const c = useContent()
  if (!c.ready)
    return (
      <div className="site-wait mono">
        {c.error ? `Kontent yuklanmadi (${c.error}). Server ishlayaptimi? — npm run dev` : ''}
      </div>
    )
  return (
    <>
      <ScrollTop />
      <Backdrop />
      <PageIntro />
      <Header />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/admin/*',
    element: (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ),
  },
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/work', element: <Work /> },
      { path: '/work/:slug', element: <Project /> },
      { path: '/studio', element: <Studio /> },
      { path: '/insights', element: <Insights /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <Home /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <ContentProvider>
    <RouterProvider router={router} />
  </ContentProvider>,
)
