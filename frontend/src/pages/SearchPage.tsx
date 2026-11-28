import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDictionary } from '@/hooks/useDictionary';
import { useFeed, useRecipeSearch } from '@/hooks/useLists';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MobileDrawer } from '@/ui/MobileDrawer';
import type { RecipeSearchParams } from '@/api/types';
import { LIMITS } from '@/api/types';
import { RecipeCard, RecipeCardSkeleton } from '@/ui/RecipeCard';
import type { RecipeCard as Card } from '@/api/types';
import { FavButton } from '@/ui/FavButton';
import { Banner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import '@/ui/ui.css';
import './SearchPage.css';

type Filters = Omit<RecipeSearchParams, 'page' | 'per_page'>;
const nums = (a: string[]) => a.map(Number).filter(Number.isFinite);
const fromParams = (sp: URLSearchParams): Filters => ({
  q: sp.get('q') ?? undefined, ingredients: nums(sp.getAll('ingredients')), cuisines: nums(sp.getAll('cuisines')),
  diet_tags: nums(sp.getAll('diet_tags')), dish_categories: nums(sp.getAll('dish_categories')),
  cook_time_range_id: sp.get('cook_time_range_id') ? Number(sp.get('cook_time_range_id')) : undefined,
});
const toParams = (f: Filters) => {
  const sp = new URLSearchParams();
  if (f.q) sp.set('q', f.q); if (f.cook_time_range_id) sp.set('cook_time_range_id', String(f.cook_time_range_id));
  (['ingredients', 'cuisines', 'diet_tags', 'dish_categories'] as const).forEach((k) => f[k]?.forEach((v) => sp.append(k, String(v))));
  return sp;
};
const toggle = (a: number[] = [], id: number) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);

function ChipGroup({ title, items, selected, onToggle }: { title: string; items: { id: number; name: string }[]; selected: number[]; onToggle: (id: number) => void }) {
  return (
    <section><h3>{title}</h3>
      <div className="filters__chips">{items.map((i) => <button key={i.id} className="chip" aria-pressed={selected.includes(i.id)} onClick={() => onToggle(i.id)}>{i.name}</button>)}</div>
    </section>
  );
}

function FiltersPanel({ value, onApply, onReset, onClose }: { value: Filters; onApply: (f: Filters) => void; onReset: () => void; onClose?: () => void }) {
  const [d, setD] = useState<Filters>(value); const [term, setTerm] = useState('');
  const cuisines = useDictionary('cuisines'), times = useDictionary('cook-time-ranges'), diets = useDictionary('diet-tags'), cats = useDictionary('dish-categories'), ings = useDictionary('ingredients');
  const sugg = term.trim() ? ings.items.filter((i) => i.name.toLowerCase().includes(term.trim().toLowerCase()) && !d.ingredients?.includes(i.id)).slice(0, 6) : [];
  const set = (p: Partial<Filters>) => setD((o) => ({ ...o, ...p }));
  return (
    <div className="filters">
      {onClose ? (
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'center', gap: 8 }}>
          <Button variant="outline" className="btn--round" aria-label="Назад" onClick={onClose}><Icon name="back" /></Button>
          <h2 className="t-title" style={{ textAlign: 'center', fontSize: 18 }}>Фильтры</h2>
          <Button variant="outline" size="sm" onClick={() => { setD({ q: d.q }); onReset(); }}>Сбросить</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="t-h3">Фильтры</h2><button className="t-caption" onClick={() => { setD({ q: d.q }); onReset(); }}>Сбросить</button>
        </div>
      )}
      <ChipGroup title="Тип кухни" items={cuisines.items} selected={d.cuisines ?? []} onToggle={(id) => set({ cuisines: toggle(d.cuisines, id) })} />
      <ChipGroup title="Время приготовления · один вариант" items={times.items} selected={d.cook_time_range_id ? [d.cook_time_range_id] : []}
        onToggle={(id) => set({ cook_time_range_id: d.cook_time_range_id === id ? undefined : id })} />
      <ChipGroup title="Особенности питания" items={diets.items} selected={d.diet_tags ?? []} onToggle={(id) => set({ diet_tags: toggle(d.diet_tags, id) })} />
      <ChipGroup title="Категория" items={cats.items} selected={d.dish_categories ?? []} onToggle={(id) => set({ dish_categories: toggle(d.dish_categories, id) })} />
      <section><h3>Ингредиенты</h3>
        <div className="field"><div className="field__box"><input className="field__input" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Начните вводить…" aria-label="Ингредиент" /></div></div>
        {sugg.length > 0 && <div className="sugg">{sugg.map((i) => <button key={i.id} onClick={() => { set({ ingredients: [...(d.ingredients ?? []), i.id].slice(0, LIMITS.ingredientsPerRecipe) }); setTerm(''); }}>{i.name}</button>)}</div>}
        <div className="filters__chips" style={{ marginTop: 8 }}>
          {d.ingredients?.map((id) => <button key={id} className="chip" aria-pressed="true" aria-label={`Убрать ${ings.byId.get(id)}`} onClick={() => set({ ingredients: toggle(d.ingredients, id) })}>{ings.byId.get(id) ?? id}<Icon name="close" size={14} /></button>)}
        </div>
      </section>
      <div className="sheetfull__bar"><Button variant="accent" size="lg" block onClick={() => onApply(d)}>{onClose ? 'Показать рецепты' : 'Применить'}</Button></div>
    </div>
  );
}

const countActive = (f: Filters) => (f.ingredients?.length ?? 0) + (f.cuisines?.length ?? 0) + (f.diet_tags?.length ?? 0) + (f.dish_categories?.length ?? 0) + (f.cook_time_range_id ? 1 : 0);

export default function SearchPage() {
  const [sp, setSp] = useSearchParams(); const filters = useMemo(() => fromParams(sp), [sp]);
  const [open, setOpen] = useState(false); const [menu, setMenu] = useState(false); const [q, setQ] = useState(filters.q ?? '');
  const active = countActive(filters) > 0 || !!filters.q;
  const feed = useFeed(!active); const res = useRecipeSearch(filters, 10, active);
  const c = active ? res : feed;
  const pages = c.data?.pages as { items: Card[]; total?: number }[] | undefined;
  const items = pages?.flatMap((p) => p.items) ?? []; const total = active ? res.data?.pages[0]?.total ?? 0 : undefined;
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current; if (!el || active) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage(), { rootMargin: '400px' });
    io.observe(el); return () => io.disconnect();
  }, [active, feed.hasNextPage, feed.isFetchingNextPage, feed.fetchNextPage]);

  const apply = (f: Filters) => { setSp(toParams({ ...f, q: q.trim() || undefined })); setOpen(false); };
  const submit = (e: FormEvent) => { e.preventDefault(); apply(filters); };
  const n = countActive(filters);

  return (
    <div className="search">
      <aside className="only-desktop filters__panel"><FiltersPanel key={sp.toString()} value={filters} onApply={apply} onReset={() => setSp(toParams({ q: filters.q }))} /></aside>
      <div>
        <div className="mhdr only-mobile">
          <Button variant="outline" className="btn--round" aria-label="Меню" onClick={() => setMenu(true)} style={{ width: 44, height: 44 }}><Icon name="menu" /></Button>
          <Link to="/" className="logo"><span className="logo__mark"><Icon name="utensils" size={22} /></span>Рецептник</Link><span />
        </div>
        <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div className="field" style={{ flex: 1 }}><div className="field__box" style={{ borderRadius: 999, gap: 8, height: 52 }}>
            <Icon name="search" size={20} style={{ color: 'var(--grey)' }} />
            <input className="field__input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти рецепт…" maxLength={100} aria-label="Поиск рецепта" />
            <Button type="submit" variant="ink" size="md" className="only-desktop" style={{ marginRight: -10 }}>Найти</Button></div></div>
          <button type="button" className="only-mobile filterbtn" aria-label={`Фильтры${n ? `, выбрано ${n}` : ''}`} onClick={() => setOpen(true)}>
            <Icon name="filters" size={22} />{n > 0 && <span className="filterbtn__badge">{n}</span>}</button>
        </form>
        {active && !c.isLoading && !c.isError && <p className="t-caption" style={{ marginBottom: 12 }}>Найдено: {total}</p>}
        {c.isError && <Banner kind="error">Не удалось загрузить рецепты. Проверьте соединение и повторите.</Banner>}
        <div className="grid grid--cards grid--3">
          {items.map((x) => <RecipeCard key={x.id} recipe={x} showHeart action={<FavButton recipeId={x.id} />} />)}
          {(c.isLoading || c.isFetchingNextPage) && Array.from({ length: 3 }, (_, i) => <RecipeCardSkeleton key={i} />)}
        </div>
        {!c.isLoading && !c.isError && items.length === 0 && <Banner kind="info">{active ? 'Ничего не найдено. Измените фильтры или запрос.' : 'Пока здесь нет рецептов. Создайте первый.'}</Banner>}
        {active && res.hasNextPage && <div style={{ textAlign: 'center', marginTop: 24 }}><Button variant="outline" size="lg" onClick={() => res.fetchNextPage()} disabled={res.isFetchingNextPage}>Показать ещё</Button></div>}
        <div ref={sentinel} style={{ height: 1 }} />
      </div>
      {open && <div className="sheetfull only-mobile" role="dialog" aria-modal="true" aria-label="Фильтры"><FiltersPanel value={filters} onApply={apply} onReset={() => {}} onClose={() => setOpen(false)} /></div>}
      {menu && <MobileDrawer onClose={() => setMenu(false)} />}
    </div>
  );
}
