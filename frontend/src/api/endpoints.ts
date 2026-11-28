import { request } from './client';
import type * as T from './types';

export const authApi = {
  register: (login: string, password: string) =>
    request<{ id: number; login: string }>('/auth/register', { method: 'POST', body: { login, password }, auth: false }),
  login: (login: string, password: string) =>
    request<T.Tokens>('/auth/login', { method: 'POST', body: { login, password }, auth: false }),
  logout: (refresh_token: string) => request<void>('/auth/logout', { method: 'POST', body: { refresh_token } }),
};

export const usersApi = {
  me: () => request<T.User>('/users/me'),
  savePreferences: (diet_tags: number[]) =>
    request<{ diet_tags: number[] }>('/users/me/preferences', { method: 'PUT', body: { diet_tags } }),
  myRecipes: (page: number, per_page = 3) =>
    request<T.Page<T.RecipeCard>>('/users/me/recipes', { query: { page, per_page } }),
};

export type DictName = 'ingredients' | 'cuisines' | 'diet-tags' | 'dish-categories' | 'cook-time-ranges';
export const dictApi = {
  get: (name: DictName) => request<T.DictResponse>(`/dictionaries/${name}`, { auth: false }),
};

export const recipesApi = {
  search: (p: T.RecipeSearchParams) =>
    request<T.Page<T.RecipeCard>>('/recipes', { query: p as Record<string, string | number | number[] | undefined> }),
  get: (id: number) => request<T.Recipe>(`/recipes/${id}`),
  feed: (cursor?: string | null) => request<T.FeedPage>('/feed', { query: { cursor } }),
  create: (b: T.RecipeInput) => request<{ id: number }>('/recipes', { method: 'POST', body: b }),
  update: (id: number, b: T.RecipeInput) => request<{ id: number }>(`/recipes/${id}`, { method: 'PUT', body: b }),
  remove: (id: number) => request<void>(`/recipes/${id}`, { method: 'DELETE' }),
};

export const foldersApi = {
  list: () => request<{ items: T.Folder[] }>('/folders'),
  create: (name: string) => request<{ id: number }>('/folders', { method: 'POST', body: { name } }),
  rename: (id: number, name: string) =>
    request<{ id: number; name: string }>(`/folders/${id}`, { method: 'PATCH', body: { name } }),
  remove: (id: number) => request<void>(`/folders/${id}`, { method: 'DELETE' }),
  addRecipe: (id: number, recipeId: number) => request<void>(`/folders/${id}/recipes/${recipeId}`, { method: 'POST' }),
  removeRecipe: (id: number, recipeId: number) =>
    request<void>(`/folders/${id}/recipes/${recipeId}`, { method: 'DELETE' }),
  recipes: (id: number, page: number, per_page = 3) =>
    request<T.Page<T.RecipeCard>>(`/folders/${id}/recipes`, { query: { page, per_page } }),
};
