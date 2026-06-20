import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PanganNusantara from './PanganNusantara'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PanganNusantara/>
  </StrictMode>,
)
