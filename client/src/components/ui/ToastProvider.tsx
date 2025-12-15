import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import '../../styles/components/Toast.css';
import '../../styles/components/Toast-mobile.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  createdAt: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs: number = 6000) => {
    // Generate a robust ID that works on older mobile browsers (no crypto.randomUUID)
    let id: string;
    try {
      const g: any = (globalThis as any);
      if (g.crypto && typeof g.crypto.randomUUID === 'function') {
        id = g.crypto.randomUUID();
      } else if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
        const buf = new Uint8Array(16);
        g.crypto.getRandomValues(buf);
        // RFC4122 v4-like fallback
        buf[6] = (buf[6] & 0x0f) | 0x40;
        buf[8] = (buf[8] & 0x3f) | 0x80;
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        id = (
          toHex(buf[0]) + toHex(buf[1]) + toHex(buf[2]) + toHex(buf[3]) + '-' +
          toHex(buf[4]) + toHex(buf[5]) + '-' +
          toHex(buf[6]) + toHex(buf[7]) + '-' +
          toHex(buf[8]) + toHex(buf[9]) + '-' +
          toHex(buf[10]) + toHex(buf[11]) + toHex(buf[12]) + toHex(buf[13]) + toHex(buf[14]) + toHex(buf[15])
        );
      } else {
        id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      }
    } catch {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }

    const toast: ToastItem = { id, type, message, duration: durationMs, createdAt: Date.now() };
    setToasts(prev => [...prev, toast]);
    timeouts.current[id] = window.setTimeout(() => removeToast(id), durationMs);
  }, [removeToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-portal" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            role={t.type === 'error' ? 'alert' : 'status'}
          >
            <div className="toast-message">{t.message}</div>
            <button
              className="toast-close"
              aria-label="Close notification"
              onClick={() => removeToast(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
