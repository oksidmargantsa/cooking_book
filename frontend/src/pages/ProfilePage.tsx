import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/endpoints';
import { LIMITS } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { useDictionary } from '@/hooks/useDictionary';
import { useFolders } from '@/hooks/useFolderTotals';
import { FolderTile } from '@/ui/FolderTile';
import { MyRecipesSection } from '@/ui/MyRecipesSection';
import { Button } from '@/ui/Button';
import { Banner } from '@/ui/Banner';
import { Icon } from '@/ui/Icon';
import '@/ui/ui.css';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth(); const nav = useNavigate(); const diets = useDictionary('diet-tags');
  const f = useFolders(); const mine = useQuery({ queryKey: ['my-recipes', 'page', 1, 1], queryFn: () => usersApi.myRecipes(1, 1) });
  const [sel, setSel] = useState<number[] | null>(null); const cur = sel ?? user?.diet_tags ?? [];
  const save = useMutation({ mutationFn: () => usersApi.savePreferences(cur), onSuccess: (r) => { if (user) setUser({ ...user, diet_tags: r.diet_tags }); setSel(null); } });
  if (!user) return null;
  const fav = f.folders.findIndex((x) => x.is_default);
  const metric = (n: string | number, l: string, bg: string) => <div className="prof__metric" style={{ background: bg }}><div className="prof__num">{n}</div><div className="prof__lbl">{l}</div></div>;
  return (
    <div className="prof">
      <aside className="prof__aside">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="hdr__avatar" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--lilac)', display: 'grid', placeItems: 'center', font: '800 22px var(--font)' }}>{user.login[0].toUpperCase()}</span>
          <div><p className="t-title">{user.login}</p><Link to="/settings/diet" className="t-caption">Настройки</Link></div>
        </div>
        <div className="prof__metrics">
          {metric(mine.data?.total ?? '–', 'рецептов', 'var(--yellow)')}{metric(fav >= 0 ? f.totalOf(fav) ?? '–' : 0, 'избранных', 'var(--peach)')}{metric(`${f.folders.filter((folder) => !folder.is_default).length}/${LIMITS.folders}`, 'папок', 'var(--lilac)')}
        </div>
        <div><p className="t-title" style={{ marginBottom: 8 }}>Особенности питания</p>
          {diets.items.map((d) => <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40, font: '500 14px var(--font)' }}>
            <input type="checkbox" style={{ width: 20, height: 20, accentColor: 'var(--ink)' }} checked={cur.includes(d.id)} onChange={() => setSel(cur.includes(d.id) ? cur.filter((x) => x !== d.id) : [...cur, d.id])} />{d.name}</label>)}
          {save.isSuccess && !sel && <Banner kind="success">Особенности питания сохранены.</Banner>}{save.isError && <Banner kind="error">Не удалось сохранить. Повторите.</Banner>}
          <Button variant="ink" size="md" block disabled={save.isPending || sel === null} onClick={() => save.mutate()} style={{ marginTop: 8 }}>{save.isPending ? 'Сохраняем…' : 'Сохранить'}</Button>
        </div>
        <Button variant="outline" size="md" block onClick={async () => { await logout(); nav('/login'); }}><Icon name="logout" size={16} />Выйти</Button>
      </aside>
      <div style={{ display: 'grid', gap: 32 }}>
        <section style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 className="t-h2">Мои папки</h2><Link to="/folders" className="btn btn--round btn--outline" aria-label="Все папки" style={{ width: 44, height: 44 }}><Icon name="forward" size={18} /></Link></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12 }}>
            {f.folders.slice(0, 4).map((x, i) => <FolderTile key={x.id} id={x.id} name={x.name} count={f.totalOf(i)} favorite={x.name.trim().toLowerCase() === 'избранное'} />)}
            <Link to="/folders" className="ftile" style={{ border: '2px dashed var(--line-2)', alignItems: 'center', justifyContent: 'center', font: '700 14px var(--font)' }}><Icon name="plus" />Новая папка</Link>
          </div>
        </section>
        <section style={{ display: 'grid', gap: 16 }}><h2 className="t-h2">Мои рецепты {mine.data && <span className="tag tag--yellow">{mine.data.total}</span>}</h2><MyRecipesSection perPage={3} /></section>
      </div>
    </div>
  );
}
