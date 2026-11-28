import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/api/endpoints';
import { LIMITS } from '@/api/types';
import { useFolders } from '@/hooks/useFolderTotals';
import { RecipeCard, RecipeCardSkeleton } from '@/ui/RecipeCard';
import { Pagination } from '@/ui/Pagination';
import { ConfirmModal, Overlay } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Banner } from '@/ui/Banner';
import { Icon } from '@/ui/Icon';
import { folderError, validateFolderName } from './FoldersPage';
import '@/ui/ui.css';

const PER = 6;
export default function FolderPage() {
  const param = useParams().id!; const nav = useNavigate(); const qc = useQueryClient(); const f = useFolders();
  const folder = param === 'favorites' ? f.folders.find((x) => x.is_default) : f.folders.find((x) => x.id === Number(param));
  const [page, setPage] = useState(1); const [rename, setRename] = useState(false); const [name, setName] = useState(''); const [rErr, setRErr] = useState<string | null>(null); const [del, setDel] = useState(false);
  const q = useQuery({ queryKey: ['folder-recipes', 'page', folder?.id, page], enabled: !!folder, queryFn: () => foldersApi.recipes(folder!.id, page, PER), placeholderData: (p) => p });
  const refresh = () => qc.invalidateQueries();
  const ren = useMutation({ mutationFn: (n: string) => foldersApi.rename(folder!.id, n), onSuccess: () => { setRename(false); refresh(); }, onError: (e) => setRErr(folderError(e)) });
  const rm = useMutation({ mutationFn: () => foldersApi.remove(folder!.id), onSuccess: () => { refresh(); nav('/folders', { replace: true }); } });
  const out = useMutation({ mutationFn: (rid: number) => foldersApi.removeRecipe(folder!.id, rid), onSuccess: refresh });
  useEffect(() => { if (q.data && q.data.items.length === 0 && page > 1) setPage(page - 1); }, [q.data, page]);

  if (f.isLoading) return <div className="skeleton" style={{ height: 300 }} />;
  if (!folder) return param === 'favorites'
    ? <div style={{ display: 'grid', gap: 12 }}><h1 className="t-h1">Избранное</h1><Banner kind="info">В избранном пока пусто. Нажмите «В избранное» на любой карточке рецепта.</Banner><Link to="/"><Button variant="outline">В ленту</Button></Link></div>
    : <div style={{ display: 'grid', gap: 12 }}><Banner kind="error">Такой папки нет. Возможно, вы её удалили.</Banner><Link to="/folders"><Button variant="outline">К папкам</Button></Link></div>;
  const fav = folder.is_default;
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="outline" className="btn--round" aria-label="Назад" onClick={() => nav('/folders')}><Icon name="back" /></Button>
        <div style={{ marginRight: 'auto' }}><h1 className="t-h2">{folder.name}</h1><p className="t-caption">{q.data ? `${q.data.total} рецептов` : ' '}</p></div>
        {!fav && <><Button variant="outline" size="md" onClick={() => { setName(folder.name); setRErr(null); setRename(true); }}>Переименовать</Button>
          <Button variant="danger-outline" size="md" onClick={() => setDel(true)}><Icon name="trash" size={16} />Удалить папку</Button></>}
      </div>
      {q.isError && <Banner kind="error">Не удалось загрузить рецепты папки.</Banner>}
      {out.isError && <Banner kind="error">Не удалось убрать рецепт. Повторите.</Banner>}
      <div className="grid grid--cards grid--3">
        {q.isLoading && Array.from({ length: 3 }, (_, i) => <RecipeCardSkeleton key={i} />)}
        {q.data?.items.map((r) => <RecipeCard key={r.id} recipe={r} action={<Button variant="outline" size="md" block disabled={out.isPending} onClick={() => out.mutate(r.id)}>Убрать из папки</Button>} />)}
      </div>
      {q.data?.total === 0 && <Banner kind="info">В этой папке пока нет рецептов. Добавьте их на странице рецепта.</Banner>}
      {q.data && <Pagination page={page} total={q.data.total} perPage={PER} onChange={setPage} />}
      {rename && <Overlay onClose={() => setRename(false)}><form className="modal" onSubmit={(e) => { e.preventDefault(); const n = name.trim(); const error = validateFolderName(n); setRErr(error); if (!error) ren.mutate(n); }} noValidate>
        <h2 className="t-h3">Переименовать папку</h2><Field label="Название папки" value={name} onChange={(e) => setName(e.target.value)} hint={`до ${LIMITS.folderNameLength} символов`} error={rErr} autoFocus />
        <Button type="submit" variant="ink" size="lg" block disabled={ren.isPending}>Сохранить</Button><Button variant="outline" size="lg" block onClick={() => setRename(false)}>Отмена</Button></form></Overlay>}
      {del && <ConfirmModal danger title={`Удалить папку «${folder.name}»?`} text="Папка будет удалена, а сами рецепты останутся на сайте." confirmLabel="Да, удалить" busy={rm.isPending} onConfirm={() => rm.mutate()} onCancel={() => setDel(false)} />}
    </div>
  );
}
