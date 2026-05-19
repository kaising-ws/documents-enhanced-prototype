import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const w = size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      style={{ background: 'rgba(35, 39, 47, 0.2)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-[12px] shadow-[0_2px_2px_rgba(35,39,47,0.08),0_4px_8px_rgba(35,39,47,0.12)] w-full ${w} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-ink-300"
          style={{ boxShadow: '0 2px 4px 1px rgba(35, 39, 47, 0.1)' }}
        >
          <h2 className="text-lg font-bold text-ink-1000">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100" aria-label="Close">
            <X className="w-5 h-5 text-ink-700" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div
            className="px-6 py-4 border-t border-ink-300 flex justify-end gap-2"
            style={{ boxShadow: '0 -2px 4px 1px rgba(35, 39, 47, 0.1)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
