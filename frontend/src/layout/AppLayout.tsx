import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Icon, type IconName } from '@/ui/Icon';
import { Button } from '@/ui/Button';
import '@/ui/ui.css';
import './layout.css';

const Logo = () => <Link to="/" className="logo"><span className="logo__mark"><Icon name="utensils" size={18} /></span>Рецептник</Link>;

function ProfileMenu({ onClose }: { onClose: () => void }) {
  const { logout } = useAuth(); const nav = useNavigate();
  const item = (to: string, icon: IconName, label: string) => <Link to={to} onClick={onClose}><Icon name={icon} />{label}</Link>;
  return (
    <div className="pmenu" role="menu">
      {item('/profile', 'user', 'Профиль')}
      {item('/settings/diet', 'leaf', 'Особенности питания')}
      <button onClick={async () => { onClose(); await logout(); nav('/login'); }}><Icon name="logout" />Выйти</button>
    </div>
  );
}

function Header() {
  const { user } = useAuth(); const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <header className="hdr">
      <Logo />
      <nav className="hdr__tabs" aria-label="Основная навигация">
        <NavLink to="/" end>Лента</NavLink>
        {user && <NavLink to="/profile">Мой профиль</NavLink>}
      </nav>
      {user ? (
        <>
          <div ref={ref} style={{ position: 'relative' }}>
            <button className="hdr__avatar" aria-label="Меню профиля" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{user.login[0].toUpperCase()}</button>
            {open && <ProfileMenu onClose={() => setOpen(false)} />}
          </div>
          <Link to="/recipes/new"><Button variant="accent" size="md"><Icon name="plus" />Создать рецепт</Button></Link>
        </>
      ) : <Link to="/login"><Button variant="accent" size="md">Войти</Button></Link>}
    </header>
  );
}

function BottomNav() {
  const { user } = useAuth(); const { pathname } = useLocation();
  const to = (p: string) => (user ? p : '/login');
  const cls = (p: string) => (pathname === p || pathname.startsWith(p + '/') ? 'active' : '');
  return (
    <nav className="nav" aria-label="Основная навигация">
      <NavLink to="/" end aria-label="Лента"><span><Icon name="home" size={22} /></span></NavLink>
      <Link to={to('/folders/favorites')} className={cls('/folders/favorites')} aria-label="Избранное"><span><Icon name="heart" size={22} /></span></Link>
      <Link to={to('/recipes/new')} className="nav__add" aria-label="Создать рецепт"><span><Icon name="plus" size={24} /></span></Link>
      <Link to={to('/folders')} className={pathname === '/folders' ? 'active' : ''} aria-label="Папки"><span><Icon name="folder" size={22} /></span></Link>
      <Link to={to('/profile')} className={cls('/profile')} aria-label="Профиль"><span><Icon name="user" size={22} /></span></Link>
    </nav>
  );
}

export default function AppLayout() {
  return (
    <div className="shell">
      <div className="hdrbar"><Header /></div>
      <main className="shell__main"><Outlet /></main>
      <BottomNav />
    </div>
  );
}
