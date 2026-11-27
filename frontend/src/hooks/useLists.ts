import { useInfiniteQuery } from '@tanstack/react-query';
import { recipesApi, usersApi, foldersApi } from '@/api/endpoints';
import type { RecipeSearchParams } from '@/api/types';

const nextPage = (l: { page: number; per_page: number; total: number }) =>
  l.page * l.per_page < l.total ? l.page + 1 : undefined;

export const useFeed = (enabled = true) =>
  useInfiniteQuery({
    enabled,
    queryKey: ['feed'],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => recipesApi.feed(pageParam),
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  });

export const useRecipeSearch = (filters: Omit<RecipeSearchParams, 'page'>, per_page = 10, enabled = true) =>
  useInfiniteQuery({
    enabled,
    queryKey: ['recipes', filters, per_page],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => recipesApi.search({ ...filters, page: pageParam, per_page }),
    getNextPageParam: nextPage,
  });

export const useMyRecipes = (per_page = 10) =>
  useInfiniteQuery({
    queryKey: ['my-recipes', per_page], initialPageParam: 1,
    queryFn: ({ pageParam }) => usersApi.myRecipes(pageParam, per_page), getNextPageParam: nextPage,
  });

export const useFolderRecipes = (folderId: number, per_page = 10) =>
  useInfiniteQuery({
    queryKey: ['folder-recipes', folderId, per_page], initialPageParam: 1,
    queryFn: ({ pageParam }) => foldersApi.recipes(folderId, pageParam, per_page), getNextPageParam: nextPage,
  });
