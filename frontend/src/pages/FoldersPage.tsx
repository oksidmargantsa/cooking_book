import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { useFolders, isFavName } from '@/hooks/useFolderTotals';
import { FolderTile } from '@/ui/FolderTile';
import { Field } from '@/ui/Field';
import { Button } from '@/ui/Button';
import { Banner } from '@/ui/Banner';
import '@/ui/ui.css';

export const folderError = (e: unknown) => e instanceof ApiError && e.code === 'FOLDER_EXISTS' ? 'Папка с таким названием уже есть. Введите другое.'
  : e instanceof ApiError && e.code === 'FOLDERS_LIMIT' ? 'Достигнут лимит: 50 папок. Удалите ненужную.' : 'Не удалось выполнить действие. Повторите позже.';

export default function FoldersPage() {
  const qc = useQueryClient(); const f = useFolders(); const [name, setName] = useState(''); const [err, setErr] = useState<string | null>(null);
  const create = useMutation({ mutationFn: (n: string) => foldersApi.create(n), onSuccess: () => { setName(''); qc.invalidateQueries({ queryKey: ['folders'] }); }, onError: (e) => setErr(folderError(e)) });
  const submit = (e: FormEvent) => { e.preventDefault(); const n = name.trim(); setErr(null); if (!n) return setErr('Введите название папки.'); create.mutate(n); };
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h1 className="t-h1">Мои папки</h1>
      {f.isError && <Banner kind="error">Не удалось загрузить папки. Повторите позже.</Banner>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
        {f.isLoading && Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        {f.folders.map((x, i) => <FolderTile key={x.id} id={x.id} name={x.name} count={f.totalOf(i)} favorite={isFavName(x.name)} />)}
      </div>
      <form onSubmit={submit} className="rp__card" style={{ display: 'grid', gap: 12, maxWidth: 480 }} noValidate>
        <Field label="Название папки" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="Например, На ужин" error={err} hint="до 20 символов" />
        <Button type="submit" variant="ink" size="lg" block disabled={create.isPending || f.folders.length >= 50}>{create.isPending ? 'Создаём…' : 'Создать папку'}</Button>
        <p className="t-caption">Папок: {f.folders.length} из 50</p>
      </form>
    </div>
  );
}
