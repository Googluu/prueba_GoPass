import { AlertTriangle } from 'lucide-react';
import { ModalOverlay, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';

export function DeleteConfirmModal({ title, message, confirmLabel = 'Eliminar', onClose, onConfirm }) {
  return (
    <ModalOverlay onClose={onClose} maxWidth={440} labelledBy="delete-modal-title">
      <div className="px-5 pt-5 pb-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full grid place-items-center shrink-0" style={{ background: '#3f1515' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#f87171' }} />
          </div>
          <div className="min-w-0">
            <h2 id="delete-modal-title" className="text-[16px] font-semibold tracking-tight text-ink">
              {title}
            </h2>
            <p className="text-[13px] text-mute mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </ModalFooter>
    </ModalOverlay>
  );
}
