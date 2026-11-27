import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { useFolders, isFavName } from '@/hooks/useFolderTotals';
import { Icon, type IconName } from './Icon';
import { Button } from './Button';

const DOTS = ['var(--lilac)', 'var(--yellow)', 'var(--lime)', 'var(--peach)', 'var(--mint)'];
function FolderPills({ onClose }: { onClose: () => void }) {
  const f = useFolders(); const list = f.folders.filter((x) => !isFavName(x.name)).slice(0, 5);
  return <div className="drawer__sub">{list.map((x) => <Link key={x.id} to={`/folders/${x.id}`} className="drawer__pill" onClick={onClose}><i style={{ background: DOTS[x.id % DOTS.length] }} />{x.name}</Link>)}</div>;
}

/** Боковое меню мобильной версии (из макета «Лента · меню»). */
export function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth(); const nav = useNavigate();
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', h);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; };
  }, [onClose]);
  const link = (to: string, icon: IconName, label: string) => <Link to={to} className="drawer__link" onClick={onClose}><Icon name={icon} size={22} />{label}</Link>;
  return createPortal(
    <div className="drawer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Меню">
        {user ? (<>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--lilac)', display: 'grid', placeItems: 'center', font: '800 22px var(--font)' }}>{user.login[0].toUpperCase()}</span>
            <div><p className="t-title">{user.login}</p><Link to="/profile" className="t-caption" onClick={onClose}>Посмотреть профиль</Link></div>
          </div>
          {link('/profile', 'user', 'Профиль')}{link('/settings', 'filters', 'Настройки')}{link('/my-recipes', 'pencil', 'Мои рецепты')}{link('/folders/favorites', 'heart', 'Избранное')}{link('/folders', 'folder', 'Мои папки')}
          <FolderPills onClose={onClose} />
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', width: '100%', margin: '8px 0' }} />
          <button className="drawer__link" style={{ color: 'var(--error)' }} onClick={async () => { onClose(); await logout(); nav('/login'); }}><Icon name="logout" size={22} />Выйти</button>
        </>) : (<>
          <p className="t-h3" style={{ marginBottom: 12 }}>Рецептник</p>
          <Link to="/login" onClick={onClose}><Button variant="accent" size="lg" block>Войти</Button></Link>
          <Link to="/register" onClick={onClose}><Button variant="outline" size="lg" block>Зарегистрироваться</Button></Link>
        </>)}
      </aside>
    </div>, document.body);
}
