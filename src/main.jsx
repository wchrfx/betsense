import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BetSenseApp from './BetSenseApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BetSenseApp />
  </StrictMode>
)