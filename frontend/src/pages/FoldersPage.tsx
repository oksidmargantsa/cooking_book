import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/api/endpoints';
import { FAVORITES_NAME, LIMITS } from '@/api/types';
import { ApiError } from '@/api/client';
import { useFolders } from '@/hooks/useFolderTotals';
import { FolderTile } from '@/ui/FolderTile';
import { Field } from '@/ui/Field';
import { Button } from '@/ui/Button';
import { Banner } from '@/ui/Banner';
import '@/ui/ui.css';

export function folderError(error: unknown) {
  if (error instanceof ApiError && error.code === 'FOLDERS_LIMIT_EXCEEDED') {
    return `Достигнут лимит: ${LIMITS.folders} папок. Удалите ненужную.`;
  }
  return 'Не удалось выполнить действие. Повторите позже.';
}

export function validateFolderName(name: string) {
  if (!name) return 'Введите название папки.';
  if (name.toLowerCase() === FAVORITES_NAME.toLowerCase()) return `Название «${FAVORITES_NAME}» зарезервировано.`;
  if ([...name].length > LIMITS.folderNameLength) return `Название должно содержать не больше ${LIMITS.folderNameLength} символов.`;
  return null;
}

export default function FoldersPage() {
  const qc = useQueryClient(); const f = useFolders(); const [name, setName] = useState(''); const [err, setErr] = useState<string | null>(null);
  const create = useMutation({ mutationFn: (n: string) => foldersApi.create(n), onSuccess: () => { setName(''); qc.invalidateQueries({ queryKey: ['folders'] }); }, onError: (e) => setErr(folderError(e)) });
  const customCount = f.folders.filter((folder) => !folder.is_default).length;
  const submit = (e: FormEvent) => { e.preventDefault(); const n = name.trim(); const error = validateFolderName(n); setErr(error); if (!error) create.mutate(n); };
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h1 className="t-h1">Мои папки</h1>
      {f.isError && <Banner kind="error">Не удалось загрузить папки. Повторите позже.</Banner>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
        {f.isLoading && Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        {f.folders.map((x, i) => <FolderTile key={x.id} id={x.id} name={x.name} count={f.totalOf(i)} favorite={x.is_default} />)}
      </div>
      <form onSubmit={submit} className="rp__card" style={{ display: 'grid', gap: 12, maxWidth: 480 }} noValidate>
        <Field label="Название папки" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, На ужин" error={err} hint={`до ${LIMITS.folderNameLength} символов`} />
        <Button type="submit" variant="ink" size="lg" block disabled={create.isPending || customCount >= LIMITS.folders}>{create.isPending ? 'Создаём…' : 'Создать папку'}</Button>
        <p className="t-caption">Папок: {customCount} из {LIMITS.folders}</p>
      </form>
    </div>
  );
}
