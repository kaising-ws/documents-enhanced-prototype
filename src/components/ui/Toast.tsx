import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  error: <XCircle className="w-5 h-5 text-accent-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
  info: <Info className="w-5 h-5 text-primary-500" />,
}

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-primary-50 border-primary-100 text-primary-700',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-container border shadow-dropdown min-w-[300px] max-w-[450px] animate-slide-in ${toastStyles[toast.type]}`}
    >
      <span className="flex-shrink-0">{toastIcons[toast.type]}</span>
      <p className="text-body font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-element hover:bg-black/5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
