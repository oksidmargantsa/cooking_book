import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '@/api/endpoints';
import { photoUrl } from '@/api/upload';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { useDictionary } from '@/hooks/useDictionary';
import { Button } from '@/ui/Button';
import { Banner } from '@/ui/Banner';
import { Icon } from '@/ui/Icon';
import { ConfirmModal } from '@/ui/Modal';
import { FolderSheet } from '@/ui/FolderSheet';
import { dishBg } from '@/ui/dishColors';
import '@/ui/ui.css';
import './RecipePage.css';

const TAG = ['lilac', 'yellow', 'mint', 'peach'] as const;

export default function RecipePage() {
  const id = Number(useParams().id); const nav = useNavigate(); const qc = useQueryClient(); const { user } = useAuth();
  const [sheet, setSheet] = useState(false); const [confirm, setConfirm] = useState(false);
  const q = useQuery({ queryKey: ['recipe', id], queryFn: () => recipesApi.get(id), retry: false });
  const times = useDictionary('cook-time-ranges'), cuis = useDictionary('cuisines'), diets = useDictionary('diet-tags'), cats = useDictionary('dish-categories'), ings = useDictionary('ingredients');
  const del = useMutation({ mutationFn: () => recipesApi.remove(id), onSuccess: () => { qc.invalidateQueries(); nav('/profile', { replace: true }); } });

  if (q.isLoading) return <div className="skeleton" style={{ height: 400 }} />;
  if (q.isError || !q.data) {
    const nf = q.error instanceof ApiError && q.error.status === 404;
    return <div style={{ display: 'grid', gap: 12 }}><Banner kind="error">{nf ? 'Такого рецепта нет. Возможно, автор его удалил.' : 'Не удалось загрузить рецепт. Повторите позже.'}</Banner><Link to="/"><Button variant="outline">В ленту</Button></Link></div>;
  }
  const r = q.data; const src = photoUrl(r.photo_key); const mine = user?.id === r.author_id;
  const tags = [...r.diet_tags.map((t) => diets.byId.get(t)), ...r.dish_categories.map((c) => cats.byId.get(c))].filter(Boolean) as string[];

  return (
    <article className="rp">
      <div className="rp__bar">
        <Button variant="outline" className="btn--round" aria-label="Назад" onClick={() => (history.length > 1 ? nav(-1) : nav('/'))}><Icon name="back" /></Button>
        <span style={{ font: '600 14px var(--font)' }}>Назад</span>
        <span className="sp" />
        <Button variant="lime" size="md" onClick={() => (user ? setSheet(true) : nav('/login', { state: { from: `/recipes/${id}` } }))}><Icon name="folder" size={18} />Добавить в папки</Button>
        {mine && <><Link to={`/recipes/${id}/edit`}><Button variant="outline" size="md">Изменить</Button></Link>
          <Button variant="danger-outline" size="md" onClick={() => setConfirm(true)}><Icon name="trash" size={16} />Удалить</Button></>}
      </div>

      <h1 className="t-h1">{r.title}</h1>
      <div className="rp__meta">
        <span><Icon name="clock" size={16} />{times.byId.get(r.cook_time_range_id) ?? '—'}</span>
        <span><Icon name="user" size={16} />{r.servings} порц.</span>
        {r.cuisine_id && <span><Icon name="utensils" size={16} />{cuis.byId.get(r.cuisine_id)}</span>}
      </div>
      {tags.length > 0 && <div className="rp__tags">{tags.map((t, i) => <span key={t} className={`tag tag--${TAG[i % TAG.length]}`}>{t}</span>)}</div>}

      <div className="rp__cols">
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="rp__photo" style={{ background: src ? 'var(--line)' : dishBg(r.id) }}>
            {src ? <img src={src} alt={r.title} /> : <span className="rp__plate" aria-hidden><i /></span>}
          </div>
          <section className="rp__card">
            <h2 className="t-h3">Ингредиенты <span className="tag tag--yellow">{r.ingredients.length}</span></h2>
            <ul className="rp__ing">{r.ingredients.map((i) => <li key={i}><span className="rp__dot"><Icon name="check" size={12} /></span>{ings.byId.get(i) ?? `#${i}`}</li>)}</ul>
          </section>
        </div>
        <section style={{ display: 'grid', gap: 16 }}>
          <h2 className="t-h2">Приготовление</h2>
          {[...r.recipe_steps].sort((a, b) => a.step_no - b.step_no).map((s) => (
            <div key={s.step_no} className="rp__card rp__step">
              <h3 className="t-title"><span className="rp__num">{s.step_no}</span>Шаг {s.step_no}</h3>
              {photoUrl(s.photo_key) && <img className="rp__stepphoto" src={photoUrl(s.photo_key)!} alt={`Шаг ${s.step_no}`} loading="lazy" />}
              <p>{s.description}</p>
            </div>
          ))}
        </section>
      </div>

      {sheet && <FolderSheet recipeId={id} onClose={() => setSheet(false)} />}
      {confirm && <ConfirmModal danger title="Удалить рецепт?" text={`Рецепт «${r.title}» исчезнет из папок, избранного и ленты. Это действие нельзя отменить.`}
        confirmLabel="Да, удалить" busy={del.isPending} onConfirm={() => del.mutate()} onCancel={() => setConfirm(false)} />}
      {del.isError && <Banner kind="error">Не удалось удалить рецепт. Повторите позже.</Banner>}
    </article>
  );
}
