import { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

export function ModalOverlay({ onClose, children, maxWidth = 500, labelledBy }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 grid place-items-center px-4 anim-fade"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full bg-surface border border-border rounded-xl shadow-modal anim-pop"
        style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, onClose, id }) {
  return (
    <header className="flex items-start justify-between px-5 pt-5 pb-3">
      <h2 id={id} className="text-[16px] font-semibold tracking-tight text-ink">{title}</h2>
      <IconButton icon={X} label="Cerrar" onClick={onClose} className="-mt-1 -mr-1" />
    </header>
  );
}

export function ModalFooter({ children }) {
  return (
    <footer className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-bg/30 rounded-b-xl">
      {children}
    </footer>
  );
}
