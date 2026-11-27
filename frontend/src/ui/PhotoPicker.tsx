import { useRef, useState } from 'react';
import { uploadPhoto, photoUrl } from '@/api/upload';
import { ApiError } from '@/api/client';
import { Icon } from './Icon';

function msg(e: unknown) {
  if (e instanceof ApiError) {
    if (e.code === 'UNSUPPORTED_TYPE') return 'Формат не подходит. Загрузите JPG, PNG или WebP.';
    if (e.code === 'FILE_TOO_LARGE') return 'Файл больше 10 МБ. Выберите фото поменьше.';
  }
  return 'Не удалось загрузить фото. Повторите попытку.';
}
export function PhotoPicker({ value, onChange, label, tone = 'mint', ratio = '16/9' }: {
  value: string | null; onChange: (k: string | null) => void; label: string; tone?: 'mint' | 'lilac'; ratio?: string;
}) {
  const ref = useRef<HTMLInputElement>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const src = photoUrl(value);
  async function pick(f?: File) {
    if (!f) return; setBusy(true); setErr(null);
    try { onChange((await uploadPhoto(f)).photo_key); } catch (e) { setErr(msg(e)); } finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  }
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <div style={{ position: 'relative', aspectRatio: ratio, borderRadius: 20, overflow: 'hidden', background: tone === 'mint' ? 'var(--mint)' : '#E9E2FB' }}>
        {src && <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} aria-label={src ? `Заменить: ${label}` : label}
          style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', alignContent: 'center', gap: 4, font: '700 14px var(--font)', background: src ? 'transparent' : 'none' }}>
          {!src && <><Icon name="camera" size={24} />{busy ? 'Загружаем…' : label}<span className="t-caption">JPG, PNG, WebP · до 10 МБ</span></>}
        </button>
        {src && <button type="button" onClick={() => onChange(null)} aria-label="Убрать фото" style={{ position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: '50%', background: 'var(--white)', display: 'grid', placeItems: 'center' }}><Icon name="close" size={16} /></button>}
      </div>
      {err && <p className="field__error"><Icon name="alert" size={14} />{err}</p>}
    </div>
  );
}
