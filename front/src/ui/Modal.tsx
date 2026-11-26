import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import './ui.css';

export function Overlay({ onClose, sheet, children }: { onClose: () => void; sheet?: boolean; children: ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; };
  }, [onClose]);
  return createPortal(
    <div className={`overlay ${sheet ? 'overlay--sheet' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>{children}</div>,
    document.body);
}

export function ConfirmModal({ title, text, confirmLabel, danger, busy, onConfirm, onCancel }: {
  title: string; text?: ReactNode; confirmLabel: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Overlay onClose={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2 className="t-h3">{title}</h2>
        {text && <p className="t-caption" style={{ color: 'var(--grey)' }}>{text}</p>}
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <Button variant={danger ? 'danger' : 'ink'} size="lg" block disabled={busy} onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="outline" size="lg" block onClick={onCancel}>Отмена</Button>
        </div>
      </div>
    </Overlay>
  );
}

export function BottomSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <Overlay onClose={onClose} sheet>
      <div className="sheet" role="dialog" aria-modal="true"><div className="sheet__grip" />{children}</div>
    </Overlay>
  );
}
