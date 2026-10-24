import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-2 font-mono">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-cad transition-all duration-150 animate-slide-up ${
              toast.type === 'error'
                ? 'border-l-4 border-l-[#DC2626] text-[#111111]'
                : toast.type === 'success'
                ? 'border-l-4 border-l-[#008A4B] text-[#111111]'
                : toast.type === 'warning'
                ? 'border-l-4 border-l-[#FF4F00] text-[#111111]'
                : 'border-l-4 border-l-[#111111] text-[#111111]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'error' && <XCircle className="w-4 h-4 text-[#DC2626]" />}
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-[#008A4B]" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#FF4F00]" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#111111]" />}
            </div>
            <div className="flex-1 text-xs leading-relaxed font-bold break-words">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#767676] hover:text-[#111111] transition-colors shrink-0 p-0.5"
              aria-label="Close toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
