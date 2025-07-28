import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug imports in development (can be disabled by removing this block)
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_IMPORTS !== 'false') {
  import('./debug-components');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)