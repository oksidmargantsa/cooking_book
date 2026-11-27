import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/api/endpoints';
import { BottomSheet } from './Modal';
import { Button } from './Button';
import { Banner } from './Banner';
import { Icon } from './Icon';

async function allIds(fid: number) {
  const out: number[] = []; let p = 1;
  for (;;) { const r = await foldersApi.recipes(fid, p, 50); out.push(...r.items.map((i) => i.id)); if (p * r.per_page >= r.total) return out; p++; }
}

export function FolderSheet({ recipeId, onClose }: { recipeId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const folders = useQuery({ queryKey: ['folders'], queryFn: foldersApi.list });
  const list = folders.data?.items ?? [];
  const members = useQueries({ queries: list.map((f) => ({ queryKey: ['folder-ids', f.id], queryFn: () => allIds(f.id) })) });
  const flip = useMutation({
    mutationFn: ({ fid, has }: { fid: number; has: boolean }) => (has ? foldersApi.removeRecipe(fid, recipeId) : foldersApi.addRecipe(fid, recipeId)),
    onSettled: () => { ['folder-ids', 'fav-ids', 'folders', 'folder-recipes'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); },
  });
  return (
    <BottomSheet onClose={onClose}>
      <h2 className="t-h3" style={{ padding: '0 8px 4px' }}>Добавить в папки</h2>
      {flip.isError && <Banner kind="error">Не удалось изменить папку. В папке может быть уже 50 рецептов (в избранном — 100).</Banner>}
      {list.map((f, i) => { const has = members[i]?.data?.includes(recipeId) ?? false; return (
        <button key={f.id} role="checkbox" aria-checked={has} onClick={() => flip.mutate({ fid: f.id, has })}
          style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, padding: '0 8px', textAlign: 'left', font: '600 15px var(--font)' }}>
          <span style={{ width: 24, height: 24, borderRadius: 8, display: 'grid', placeItems: 'center', border: '2px solid var(--ink)', background: has ? 'var(--ink)' : 'var(--white)', color: 'var(--white)' }}>{has && <Icon name="check" size={16} />}</span>
          {f.name}
        </button>); })}
      {!folders.isLoading && list.length === 0 && <Banner kind="info">Папок пока нет. Создайте первую на экране «Папки».</Banner>}
      <Button variant="ink" size="lg" block onClick={onClose} style={{ marginTop: 8 }}>Готово</Button>
    </BottomSheet>
  );
}
