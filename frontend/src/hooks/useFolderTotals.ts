import { useQueries, useQuery } from '@tanstack/react-query';
import { foldersApi } from '@/api/endpoints';
import type { Folder } from '@/api/types';

export function useFolders() {
  const q = useQuery({ queryKey: ['folders'], queryFn: foldersApi.list });
  const folders: Folder[] = [...(q.data?.items ?? [])].sort((a, b) => Number(b.is_default) - Number(a.is_default));
  const totals = useQueries({ queries: folders.map((f) => ({ queryKey: ['folder-recipes', 'total', f.id], queryFn: () => foldersApi.recipes(f.id, 1, 1).then((r) => r.total) })) });
  return { ...q, folders, totalOf: (i: number) => totals[i]?.data };
}
