import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { InputProvider } from './Context/CodeInput.jsx'
import { LanguageProvider } from './Context/Languages__.jsx'
import { CodeDataProvider } from './Components/Sidebar/CodeData.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CodeDataProvider>
      <InputProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </InputProvider>
    </CodeDataProvider>
  </StrictMode>,
)
