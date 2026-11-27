import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/api/endpoints';
import { LIMITS } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';

export const FAV_NAME = 'Избранное';
const isFav = (n: string) => n.trim().toLowerCase() === FAV_NAME.toLowerCase();

export function useFavorites() {
  const { user } = useAuth(); const qc = useQueryClient();
  const folders = useQuery({ queryKey: ['folders'], queryFn: foldersApi.list, enabled: !!user });
  const folderId = folders.data?.items.find((f) => isFav(f.name))?.id ?? null;

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
      let fid = folderId;
      if (fid === null) { fid = (await foldersApi.create(FAV_NAME)).id; await qc.invalidateQueries({ queryKey: ['folders'] }); }
      if (set.has(recipeId)) await foldersApi.removeRecipe(fid, recipeId);
      else { if (set.size >= LIMITS.favorites) throw new Error('LIMIT'); await foldersApi.addRecipe(fid, recipeId); }
    },
    onMutate: async (recipeId) => {
      const key = ['fav-ids', folderId]; const prev = qc.getQueryData<number[]>(key);
      qc.setQueryData<number[]>(key, (o = []) => (o.includes(recipeId) ? o.filter((x) => x !== recipeId) : [...o, recipeId]));
      return { prev, key };
    },
    onError: (_e, _id, ctx) => ctx && qc.setQueryData(ctx.key, ctx.prev),
    onSettled: () => { qc.invalidateQueries({ queryKey: ['fav-ids'] }); qc.invalidateQueries({ queryKey: ['folders'] }); },
  });
  return { isFavorite: (id: number) => set.has(id), toggle: toggle.mutate, pending: toggle.isPending, error: toggle.error as Error | null, folderId };
}
