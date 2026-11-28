import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from './Button';
import { Icon } from './Icon';

/** «В избранное» → lime «В избранном» (по гайдлайну). Гостя отправляет на вход. */
export function FavButton({ recipeId }: { recipeId: number }) {
  const { user } = useAuth(); const nav = useNavigate(); const f = useFavorites();
  const on = f.isFavorite(recipeId);
  return (
    <Button className="fav-desk" variant={on ? 'lime' : 'outline'} size="md" disabled={f.pending}
      title={f.error?.message === 'LIMIT' ? 'В избранном уже 100 рецептов' : undefined}
      onClick={() => (user ? f.toggle(recipeId) : nav('/login', { state: { from: '/' } }))}>
      <Icon name={on ? 'check' : 'heart'} size={16} />{on ? 'В избранном' : 'В избранное'}
    </Button>
  );
}
