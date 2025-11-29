import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { SettingsProvider } from './context/SettingsContext'
import { GameProvider } from './context/GameContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SettingsProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </SettingsProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
