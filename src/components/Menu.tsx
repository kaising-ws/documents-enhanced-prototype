import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export function Menu({
  items,
  label,
  ariaLabel,
  size = 'md',
}: {
  items: MenuItem[];
  label?: React.ReactNode;
  ariaLabel?: string;
  size?: 'sm' | 'md';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const sizeCls = size === 'sm' ? 'h-8 px-2' : 'h-10 px-3';

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-label={ariaLabel ?? 'Open menu'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-ink-300 bg-white text-ink-900 hover:bg-ink-100 font-semibold text-sm ${sizeCls}`}
      >
        {label ?? <MoreHorizontal className="w-4 h-4" />}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-[12px] border border-ink-300 bg-white shadow-[0_2px_2px_rgba(35,39,47,0.08),0_4px_8px_rgba(35,39,47,0.12)] py-1.5">
          {items.map((it, i) => (
            <div key={i}>
              {it.divider && <div className="my-1 border-t border-ink-200" />}
              <button
                type="button"
                disabled={it.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  if (!it.disabled) it.onClick();
                }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm font-medium ${
                  it.disabled
                    ? 'text-ink-400 cursor-not-allowed'
                    : it.destructive
                    ? 'text-danger-500 hover:bg-danger-100'
                    : 'text-ink-900 hover:bg-ink-100'
                }`}
              >
                {it.icon && <span className="w-4 h-4 flex items-center">{it.icon}</span>}
                <span>{it.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
