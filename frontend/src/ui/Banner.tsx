import type { ReactNode } from 'react';
import { Icon } from './Icon';
import './ui.css';

const ICON = { error: 'alert', success: 'check', info: 'info' } as const;
export function Banner({ kind = 'error', children }: { kind?: 'error' | 'success' | 'info'; children: ReactNode }) {
  return (
    <div className={`banner banner--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span className="banner__dot"><Icon name={ICON[kind]} size={14} strokeWidth={2.5} /></span>
      <span>{children}</span>
    </div>
  );
}
