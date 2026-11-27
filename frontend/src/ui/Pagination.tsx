import { Icon } from './Icon';

export function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const n = Math.ceil(total / perPage); if (n <= 1) return null;
  const b = (on: boolean): React.CSSProperties => ({ minWidth: 40, height: 40, borderRadius: 999, display: 'grid', placeItems: 'center', font: '700 14px var(--font)', background: on ? 'var(--ink)' : 'var(--white)', color: on ? 'var(--white)' : 'var(--ink)', border: '2px solid ' + (on ? 'var(--ink)' : 'var(--line-2)') });
  return (
    <nav aria-label="Страницы" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
      <button style={b(false)} aria-label="Назад" disabled={page === 1} onClick={() => onChange(page - 1)}><Icon name="chevronLeft" size={18} /></button>
      {Array.from({ length: n }, (_, i) => i + 1).map((p) => <button key={p} style={b(p === page)} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>)}
      <button style={b(false)} aria-label="Вперёд" disabled={page === n} onClick={() => onChange(page + 1)}><Icon name="chevronRight" size={18} /></button>
    </nav>
  );
}
