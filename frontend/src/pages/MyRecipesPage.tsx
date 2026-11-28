import { MyRecipesSection } from '@/ui/MyRecipesSection';
export default function MyRecipesPage() {
  return <div style={{ display: 'grid', gap: 16 }}><h1 className="t-h1">Мои рецепты</h1><MyRecipesSection perPage={6} /></div>;
}
