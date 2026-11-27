import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '@/api/endpoints';
import { useAuth } from '@/auth/AuthContext';
import { useDictionary } from '@/hooks/useDictionary';
import { Button } from '@/ui/Button';
import { Banner } from '@/ui/Banner';
import { Icon, type IconName } from '@/ui/Icon';
import '@/ui/ui.css';
import './SettingsPage.css';

function Layout() {
  const item = (to: string, icon: IconName, label: string) => <NavLink to={to} className="set__item"><Icon name={icon} size={18} />{label}<Icon name="chevronRight" size={16} style={{ marginLeft: 'auto' }} /></NavLink>;
  return (
    <div className="set">
      <nav className="set__menu rp__card" aria-label="Настройки">{item('/profile', 'user', 'Профиль')}{item('/settings/diet', 'leaf', 'Особенности питания')}</nav>
      <div className="rp__card set__body"><Outlet /></div>
    </div>
  );
}

function DietForm() {
  const { user, setUser } = useAuth(); const diets = useDictionary('diet-tags'); const [sel, setSel] = useState<number[] | null>(null); const cur = sel ?? user?.diet_tags ?? [];
  const m = useMutation({ mutationFn: () => usersApi.savePreferences(cur), onSuccess: (r) => { if (user) setUser({ ...user, diet_tags: r.diet_tags }); setSel(null); } });
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div><h1 className="t-h2">Особенности питания</h1><p className="t-caption">Лента и поиск учтут ваши предпочтения</p></div>
      {diets.items.map((d) => <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, font: '500 15px var(--font)' }}>
        <input type="checkbox" style={{ width: 20, height: 20, accentColor: 'var(--ink)' }} checked={cur.includes(d.id)} onChange={() => setSel(cur.includes(d.id) ? cur.filter((x) => x !== d.id) : [...cur, d.id])} />{d.name}</label>)}
      {m.isSuccess && sel === null && <Banner kind="success">Особенности питания сохранены.</Banner>}{m.isError && <Banner kind="error">Не удалось сохранить. Повторите.</Banner>}
      <Button variant="ink" size="lg" block disabled={m.isPending || sel === null} onClick={() => m.mutate()}>{m.isPending ? 'Сохраняем…' : 'Сохранить'}</Button>
    </div>
  );
}

export default function SettingsPage() {
  return <Routes><Route element={<Layout />}><Route path="diet" element={<DietForm />} /><Route path="*" element={<Navigate to="/settings/diet" replace />} /></Route></Routes>;
}
