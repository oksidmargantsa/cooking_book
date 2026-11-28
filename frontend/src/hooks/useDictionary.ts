import { useQuery } from '@tanstack/react-query';
import { dictApi, type DictName } from '@/api/endpoints';

export function useDictionary(name: DictName) {
  const q = useQuery({ queryKey: ['dict', name], queryFn: () => dictApi.get(name), staleTime: 60 * 60 * 1000 });
  const items = q.data?.items ?? [];
  const byId = new Map(items.map((i) => [i.id, i.name]));
  return { ...q, items, byId };
}
