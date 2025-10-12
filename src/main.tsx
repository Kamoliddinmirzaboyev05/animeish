import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      theme="dark" 
      position="top-right"
      toastOptions={{
        style: {
          background: '#18181B',
          border: '1px solid #740775',
          color: 'white',
        },
        className: 'sonner-toast',
      }}
    />
  </StrictMode>,
)
