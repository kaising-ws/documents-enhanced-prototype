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
  success: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  error: <XCircle className="w-4 h-4 text-red-600" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  info: <Info className="w-4 h-4 text-blue-600" />,
}

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
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
      className={`flex items-center gap-3 px-4 py-3 rounded-container border shadow-lg min-w-[300px] max-w-[450px] animate-slide-in ${toastStyles[toast.type]}`}
    >
      <span className="flex-shrink-0">{toastIcons[toast.type]}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 transition-colors"
      >
        <X className="w-3 h-3" />
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
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

