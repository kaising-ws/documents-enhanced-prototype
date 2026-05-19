import { createContext, useCallback, useContext, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

const ToastCtx = createContext<{ push: (msg: string, tone?: Toast['tone']) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-[8px] shadow-[0_4px_12px_rgba(35,39,47,0.18)] text-sm font-medium ${
              t.tone === 'success'
                ? 'bg-success-500 text-white'
                : t.tone === 'error'
                ? 'bg-danger-500 text-white'
                : 'bg-ink-1000 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast outside provider');
  return ctx;
}
