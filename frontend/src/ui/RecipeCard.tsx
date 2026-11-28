import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import type { RecipeCard as Card } from '@/api/types';
import { photoUrl } from '@/api/upload';
import { useDictionary } from '@/hooks/useDictionary';
import { Icon } from './Icon';
import { dishBg } from './dishColors';
import './cards.css';

function Heart({ id }: { id: number }) {
  const { user } = useAuth(); const nav = useNavigate(); const f = useFavorites(); const on = f.isFavorite(id);
  return (
    <button type="button" className="rcard__heart" aria-pressed={on} aria-label={on ? 'Убрать из избранного' : 'Добавить в избранное'} onClick={() => (user ? f.toggle(id) : nav('/login'))}>
      <Icon name="heart" size={18} fill={on ? 'var(--orange)' : 'none'} stroke={on ? 'var(--orange)' : 'currentColor'} />
    </button>
  );
}
interface Props { recipe: Card; action?: ReactNode; showHeart?: boolean }

export function RecipeCard({ recipe, action, showHeart }: Props) {
  const { byId } = useDictionary('cook-time-ranges');
  const src = photoUrl(recipe.photo_key);
  return (
    <article className="rcard">
      <div className="rcard__ph">
        <Link to={`/recipes/${recipe.id}`} className="rcard__photo" style={{ background: src ? 'var(--line)' : dishBg(recipe.id) }}>
          {src ? <img src={src} alt={recipe.title} loading="lazy" /> : <span className="rcard__plate" aria-hidden><i /></span>}
        </Link>
        {showHeart && <Heart id={recipe.id} />}
      </div>
      <Link to={`/recipes/${recipe.id}`}><h3 className="t-title rcard__title">{recipe.title}</h3></Link>
      <p className="rcard__meta"><Icon name="clock" size={16} />{byId.get(recipe.cook_time_range_id) ?? '—'} · {recipe.servings} порц.</p>
      {action && <div className="rcard__action">{action}</div>}
    </article>
  );
}

export const RecipeCardSkeleton = () => <div className="skeleton" style={{ height: 300 }} />;
