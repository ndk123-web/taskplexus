import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { ToastProvider } from './components/ui';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <ToastProvider>
    <App />
  </ToastProvider>
  // </StrictMode>,
)
