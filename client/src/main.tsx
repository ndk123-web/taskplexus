import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { ToastProvider } from './components/ui';
import { HelmetProvider } from 'react-helmet-async';

const HelmetProviderAny = HelmetProvider as any;

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <HelmetProviderAny>
    <ToastProvider>
      <App />
    </ToastProvider>
  </HelmetProviderAny>
  // </StrictMode>,
)
