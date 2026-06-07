import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes.tsx'
import './index.css'

// Bootstrap theme before first paint to avoid flash
const storedTheme = localStorage.getItem('zikstock-theme') ?? 'light';
document.documentElement.setAttribute('data-theme', storedTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

