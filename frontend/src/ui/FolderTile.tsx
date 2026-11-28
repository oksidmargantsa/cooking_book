import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import './cards.css';

const COLORS = ['var(--lilac)', 'var(--yellow)', 'var(--lime)', 'var(--peach)', 'var(--mint)'];
export function FolderTile({ id, name, count, favorite }: { id: number; name: string; count?: number; favorite?: boolean }) {
  return (
    <Link to={`/folders/${id}`} className={`ftile ${favorite ? 'ftile--fav' : ''}`} style={{ background: favorite ? 'var(--orange)' : COLORS[id % COLORS.length] }}>
      <span className="ftile__icon"><Icon name={favorite ? 'heart' : 'folder'} size={16} /></span>
      <span className="ftile__name">{name}</span>
      {count !== undefined && <span className="ftile__count">{count} рецептов</span>}
    </Link>
  );
}
