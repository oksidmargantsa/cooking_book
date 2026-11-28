import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, recipesApi } from '@/api/endpoints';
import type { RecipeCard as Card } from '@/api/types';
import { RecipeCard, RecipeCardSkeleton } from './RecipeCard';
import { Pagination } from './Pagination';
import { ConfirmModal } from './Modal';
import { Button } from './Button';
import { Banner } from './Banner';

export function MyRecipesSection({ perPage }: { perPage: number }) {
  const qc = useQueryClient(); const [page, setPage] = useState(1); const [del, setDel] = useState<Card | null>(null);
  const q = useQuery({ queryKey: ['my-recipes', 'page', page, perPage], queryFn: () => usersApi.myRecipes(page, perPage), placeholderData: (p) => p });
  const rm = useMutation({ mutationFn: (id: number) => recipesApi.remove(id), onSuccess: () => { setDel(null); qc.invalidateQueries(); } });
  useEffect(() => { if (q.data && q.data.items.length === 0 && page > 1) setPage(page - 1); }, [q.data, page]);
  return (
    <>
      {q.isError && <Banner kind="error">Не удалось загрузить ваши рецепты. Повторите позже.</Banner>}
      <div className="grid grid--cards grid--3">
        {q.isLoading && Array.from({ length: perPage }, (_, i) => <RecipeCardSkeleton key={i} />)}
        {q.data?.items.map((r) => <RecipeCard key={r.id} recipe={r} action={<><Link to={`/recipes/${r.id}/edit`}><Button variant="outline" size="md" block>Изменить</Button></Link>
          <Button variant="danger-outline" size="md" onClick={() => setDel(r)}>Удалить</Button></>} />)}
      </div>
      {q.data?.total === 0 && <Banner kind="info">Вы ещё не создали ни одного рецепта.</Banner>}
      {q.data && <Pagination page={page} total={q.data.total} perPage={perPage} onChange={setPage} />}
      {del && <ConfirmModal danger title={`Удалить рецепт «${del.title}»?`} text="Рецепт исчезнет из папок, избранного и ленты. Это действие нельзя отменить."
        confirmLabel="Да, удалить" busy={rm.isPending} onConfirm={() => rm.mutate(del.id)} onCancel={() => setDel(null)} />}
      {rm.isError && <Banner kind="error">Не удалось удалить рецепт. Повторите позже.</Banner>}
    </>
  );
}
