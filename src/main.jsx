import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App'
import ErrorPage from './pages/ErrorPage'
import StipplingDemoPage from './pages/StipplingDemoPage'
import StyleDemoPage from './pages/StyleDemoPage'
import PromptDemoPage from './pages/PromptDemoPage'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <StipplingDemoPage />
      },
      {
        path: '/stippling-demo',
        element: <StipplingDemoPage />
      },
      {
        path: '/style-demo',
        element: <StyleDemoPage />
      },
      {
        path: '/prompt-demo',
        element: <PromptDemoPage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
