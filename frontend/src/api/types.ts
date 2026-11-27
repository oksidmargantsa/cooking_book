export interface DictItem { id: number; name: string }
export interface DictResponse { items: DictItem[] }

export interface User { id: number; login: string; diet_tags: number[] }
export interface Tokens { access_token: string; refresh_token: string }

export interface RecipeCard {
  id: number;
  author_id: number;
  title: string;
  photo_key: string | null;
  cook_time_range_id: number;
  servings: number;
}
export interface Page<T> { items: T[]; total: number; page: number; per_page: number }
export interface FeedPage { items: RecipeCard[]; next_cursor: string | null }

export interface RecipeStep { step_no: number; description: string; photo_key: string | null }
export interface RecipeInput {
  title: string;
  ingredients: number[];
  photo_key: string | null;
  diet_tags: number[];
  dish_categories: number[];
  cuisine_id: number | null;
  cook_time_range_id: number;
  servings: number;
  recipe_steps: RecipeStep[];
}
export interface Recipe extends RecipeInput { id: number; author_id: number; created_at: string; updated_at: string }

export interface Folder { id: number; user_id: number; name: string }

export interface RecipeSearchParams {
  ingredients?: number[];
  cook_time_range_id?: number;
  cuisines?: number[];
  diet_tags?: number[];
  dish_categories?: number[];
  q?: string;
  page?: number;
  per_page?: number;
}

export const LIMITS = {
  ingredientsPerRecipe: 30,
  stepsPerRecipe: 50,
  recipesPerAuthor: 1000,
  recipesPerFolder: 50,
  favorites: 100,
  photoMaxBytes: 10 * 1024 * 1024,
  photoTypes: ['image/jpeg', 'image/png', 'image/webp'],
  listBlock: 10,
} as const;
