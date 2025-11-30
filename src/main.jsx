import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { SettingsProvider } from './context/SettingsContext'
import { GameProvider } from './context/GameContext'
import { AudioProvider } from './context/AudioContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SettingsProvider>
        <AudioProvider>
          <GameProvider>
            <App />
          </GameProvider>
        </AudioProvider>
      </SettingsProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
