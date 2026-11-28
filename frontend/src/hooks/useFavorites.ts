import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/api/endpoints';
import { LIMITS } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';

export function useFavorites() {
  const { user } = useAuth(); const qc = useQueryClient();
  const folders = useQuery({ queryKey: ['folders'], queryFn: foldersApi.list, enabled: !!user });
  const folderId = folders.data?.items.find((f) => f.is_default)?.id ?? null;

  const ids = useQuery({
    queryKey: ['fav-ids', folderId], enabled: !!user && folderId !== null,
    queryFn: async () => {
      const out: number[] = []; let page = 1;
      for (;;) { const r = await foldersApi.recipes(folderId!, page, 50); out.push(...r.items.map((i) => i.id)); if (page * r.per_page >= r.total) break; page++; }
      return out;
    },
  });
  const set = new Set(ids.data ?? []);

  const toggle = useMutation({
    mutationFn: async (recipeId: number) => {
      if (folderId === null) throw new Error('Папка «Избранное» недоступна.');
      if (set.has(recipeId)) await foldersApi.removeRecipe(folderId, recipeId);
      else { if (set.size >= LIMITS.favorites) throw new Error('LIMIT'); await foldersApi.addRecipe(folderId, recipeId); }
    },
    onMutate: async (recipeId) => {
      const key = ['fav-ids', folderId]; const prev = qc.getQueryData<number[]>(key);
      qc.setQueryData<number[]>(key, (o = []) => (o.includes(recipeId) ? o.filter((x) => x !== recipeId) : [...o, recipeId]));
      return { prev, key };
    },
    onError: (_e, _id, ctx) => ctx && qc.setQueryData(ctx.key, ctx.prev),
    onSettled: () => { qc.invalidateQueries({ queryKey: ['fav-ids'] }); qc.invalidateQueries({ queryKey: ['folder-recipes'] }); },
  });
  return { isFavorite: (id: number) => set.has(id), toggle: toggle.mutate, pending: toggle.isPending, error: toggle.error as Error | null, folderId };
}
