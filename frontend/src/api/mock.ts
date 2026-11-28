import { ApiError } from './errors';
import { tokenStore } from './tokens';
import { FAVORITES_NAME, LIMITS, type Folder, type Recipe, type RecipeCard } from './types';

type U = { id: number; login: string; password: string; diet_tags: number[] };
type DB = { users: U[]; recipes: Recipe[]; folders: Folder[]; links: { f: number; r: number }[]; seq: number };
const D: Record<string, string[]> = {
  'cook-time-ranges': ['до 15 мин', '15–30 мин', '30–60 мин', 'более 60 мин'],
  cuisines: ['Азиатская', 'Итальянская', 'Тайская', 'Русская', 'Украинская', 'Японская', 'Европейская', 'Американская'],
  'diet-tags': ['безлактозное', 'вегетарианское', 'безглютеновое', 'веганское'],
  'dish-categories': ['Первое блюдо', 'Горячее блюдо', 'Закуска', 'Салат', 'Десерт', 'Напиток'],
  ingredients: ['Куриное филе', 'Сливки', 'Шампиньоны', 'Лук репчатый', 'Соль', 'Свёкла', 'Говядина', 'Капуста', 'Авокадо', 'Нут', 'Спагетти', 'Бекон', 'Яйца', 'Пармезан', 'Креветки', 'Кокосовое молоко', 'Лайм', 'Мята', 'Рис', 'Томаты', 'Курица', 'Картофель', 'Морковь', 'Чеснок', 'Молоко', 'Мука', 'Сливочное масло', 'Сахар', 'Сметана', 'Перец чёрный'],
};
const dict = (n: string) => ({ items: (D[n] ?? []).map((name, i) => ({ id: i + 1, name })) });
const steps = (t: string[]) => t.map((description, i) => ({ step_no: i + 1, description, photo_key: null }));
const rec = (id: number, author_id: number, title: string, ing: number[], diet: number[], cat: number[], cu: number, time: number, sv: number): Recipe => ({
  id, author_id, title, ingredients: ing, photo_key: null, diet_tags: diet, dish_categories: cat, cuisine_id: cu, cook_time_range_id: time, servings: sv,
  recipe_steps: steps(['Нарежьте ингредиенты', 'Обжарьте основу на среднем огне', 'Добавьте сливки или соус и доведите до готовности']), created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z' });
const seed = (): DB => ({ seq: 100,
  users: [{ id: 1, login: 'anna_cook', password: 'Password1', diet_tags: [] }, { id: 2, login: 'chef_ivan', password: 'Password1', diet_tags: [] }],
  recipes: [rec(1, 1, 'Сливочная курица с грибами', [1, 2, 3, 4, 5], [3], [2], 8, 3, 4), rec(2, 1, 'Борщ с пампушками', [6, 7, 8, 4], [], [1], 5, 4, 6), rec(3, 1, 'Салат с авокадо и нутом', [9, 10, 17], [2, 4], [4], 8, 1, 2),
    rec(4, 2, 'Паста карбонара', [11, 12, 13, 14], [], [2], 2, 2, 2), rec(5, 2, 'Том ям с креветками и кокосовым молоком', [15, 16, 17], [1], [1], 3, 3, 3), rec(6, 2, 'Мохито', [17, 18], [2, 3, 4], [6], 8, 1, 1),
    rec(7, 2, 'Курица карри', [1, 16, 19], [1], [2], 1, 3, 4), rec(8, 2, 'Овощная чаша с рисом', [19, 20, 9], [2, 3], [2], 6, 2, 2)],
  folders: [{ id: 1, user_id: 1, name: FAVORITES_NAME, is_default: true }, { id: 2, user_id: 1, name: 'На ужин', is_default: false }], links: [{ f: 1, r: 2 }, { f: 2, r: 4 }] });

const load = (): DB => {
  try {
    const db = JSON.parse(localStorage.getItem('mock_db') ?? '') as DB;
    for (const folder of db.folders) {
      folder.is_default ??= folder.name === FAVORITES_NAME;
    }
    return db;
  } catch {
    return seed();
  }
};

function folderName(value: unknown): string {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name || [...name].length > LIMITS.folderNameLength || name.toLowerCase() === FAVORITES_NAME.toLowerCase()) {
    throw new ApiError(422, 'VALIDATION_ERROR');
  }
  return name;
}
const save = (db: DB) => { try { localStorage.setItem('mock_db', JSON.stringify(db)); } catch { /* квота */ } };
const arr = (v: unknown): number[] => (Array.isArray(v) ? v.map(Number) : v == null ? [] : [Number(v)]);
const card = (r: Recipe): RecipeCard => ({ id: r.id, author_id: r.author_id, title: r.title, photo_key: r.photo_key, cook_time_range_id: r.cook_time_range_id, servings: r.servings });
const page = (all: RecipeCard[], q: Record<string, unknown>) => { const per = Number(q.per_page ?? 10), p = Number(q.page ?? 1); return { items: all.slice((p - 1) * per, p * per), total: all.length, page: p, per_page: per }; };

export async function mockRequest<T>(path: string, o: { method?: string; query?: Record<string, unknown>; body?: unknown }): Promise<T> {
  await new Promise((r) => setTimeout(r, 150));
  const m = o.method ?? 'GET', b = (o.body ?? {}) as Record<string, any>, q = o.query ?? {};
  const db = load(); const tok = tokenStore.get()?.access ?? '';
  const me = db.users.find((u) => `mock-${u.id}` === tok) ?? null;
  const need = () => { if (!me) throw new ApiError(401, 'UNAUTHORIZED'); return me; };
  const find = (id: number) => { const r = db.recipes.find((x) => x.id === id); if (!r) throw new ApiError(404, 'NOT_FOUND'); return r; };
  const ownFolder = (id: number) => { const f = db.folders.find((x) => x.id === id && x.user_id === need().id); if (!f) throw new ApiError(404, 'NOT_FOUND'); return f; };
  const done = <X,>(x: X) => { save(db); return x as unknown as T; };
  let x: RegExpMatchArray | null;

  if (path === '/auth/register' && m === 'POST') {
    if (db.users.some((u) => u.login === b.login)) throw new ApiError(409, 'LOGIN_EXISTS');
    const u = { id: db.seq++, login: b.login, password: b.password, diet_tags: [] }; db.users.push(u);
    db.folders.push({ id: db.seq++, user_id: u.id, name: FAVORITES_NAME, is_default: true }); return done({ id: u.id, login: u.login });
  }
  if (path === '/auth/login') {
    const u = db.users.find((v) => v.login === b.login && v.password === b.password);
    if (!u) throw new ApiError(401, 'INVALID_CREDENTIALS'); return { access_token: `mock-${u.id}`, refresh_token: `mock-${u.id}` } as T;
  }
  if (path === '/auth/refresh') return { access_token: tok } as T;
  if (path === '/auth/logout') return undefined as T;
  if (path === '/users/me') { const u = need(); return { id: u.id, login: u.login, diet_tags: u.diet_tags } as T; }
  if (path === '/users/me/preferences') { need().diet_tags = b.diet_tags; return done({ diet_tags: b.diet_tags }); }
  if (path === '/users/me/recipes') return page(db.recipes.filter((r) => r.author_id === need().id).map(card), q) as T;
  if ((x = path.match(/^\/dictionaries\/(.+)$/))) return dict(x[1]) as T;
  if (path === '/feed') {
    const off = Number(q.cursor ?? 0), all = [...db.recipes].reverse().map(card);
    return { items: all.slice(off, off + 10), next_cursor: off + 10 < all.length ? String(off + 10) : null } as T;
  }
  if (path === '/recipes' && m === 'GET') {
    const ing = arr(q.ingredients), cu = arr(q.cuisines), dt = arr(q.diet_tags), ct = arr(q.dish_categories), t = String(q.q ?? '').toLowerCase();
    return page(db.recipes.filter((r) => ing.every((i) => r.ingredients.includes(i)) && (!cu.length || (r.cuisine_id != null && cu.includes(r.cuisine_id))) &&
      dt.every((d) => r.diet_tags.includes(d)) && (!ct.length || r.dish_categories.some((c) => ct.includes(c))) &&
      (!q.cook_time_range_id || r.cook_time_range_id === Number(q.cook_time_range_id)) && r.title.toLowerCase().includes(t)).map(card), q) as T;
  }
  if (path === '/recipes' && m === 'POST') {
    const r = { ...b, id: db.seq++, author_id: need().id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Recipe;
    db.recipes.push(r); return done({ id: r.id });
  }
  if ((x = path.match(/^\/recipes\/(\d+)$/))) {
    const r = find(Number(x[1]));
    if (m === 'GET') return r as T;
    if (r.author_id !== need().id) throw new ApiError(403, 'FORBIDDEN');
    if (m === 'PUT') { Object.assign(r, b, { updated_at: new Date().toISOString() }); return done({ id: r.id }); }
    db.recipes = db.recipes.filter((v) => v !== r); db.links = db.links.filter((l) => l.r !== r.id); return done(undefined);
  }
  if (path === '/folders' && m === 'GET') {
    const userId = need().id;
    const items = db.folders.filter((folder) => folder.user_id === userId)
      .sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.id - b.id);
    return { items } as T;
  }
  if (path === '/folders' && m === 'POST') {
    const userId = need().id;
    const name = folderName(b.name);
    const mine = db.folders.filter((folder) => folder.user_id === userId && !folder.is_default);
    if (mine.length >= LIMITS.folders) throw new ApiError(422, 'FOLDERS_LIMIT_EXCEEDED');
    const f = { id: db.seq++, user_id: userId, name, is_default: false };
    db.folders.push(f);
    return done({ id: f.id });
  }
  if ((x = path.match(/^\/folders\/(\d+)$/))) {
    const f = ownFolder(Number(x[1]));
    if (m === 'PATCH') {
      const name = folderName(b.name);
      if (f.is_default) throw new ApiError(403, 'FORBIDDEN');
      f.name = name;
      return done({ id: f.id, name: f.name });
    }
    if (f.is_default) throw new ApiError(403, 'FORBIDDEN');
    db.folders = db.folders.filter((v) => v !== f); db.links = db.links.filter((l) => l.f !== f.id); return done(undefined);
  }
  if ((x = path.match(/^\/folders\/(\d+)\/recipes\/(\d+)$/))) {
    const f = ownFolder(Number(x[1])), rid = Number(x[2]);
    if (m === 'POST') {
      find(rid);
      const links = db.links.filter((link) => link.f === f.id);
      if (links.some((link) => link.r === rid)) return undefined as T;
      const limit = f.is_default ? LIMITS.favorites : LIMITS.recipesPerFolder;
      if (links.length >= limit) {
        const code = f.is_default ? 'FAVORITES_LIMIT_EXCEEDED' : 'FOLDER_RECIPES_LIMIT_EXCEEDED';
        throw new ApiError(422, code);
      }
      db.links.push({ f: f.id, r: rid });
    } else {
      db.links = db.links.filter((link) => !(link.f === f.id && link.r === rid));
    }
    return done(undefined);
  }
  if ((x = path.match(/^\/folders\/(\d+)\/recipes$/))) {
    const f = ownFolder(Number(x[1]));
    return page(db.links.filter((l) => l.f === f.id).map((l) => db.recipes.find((r) => r.id === l.r)).filter(Boolean).map((r) => card(r!)), q) as T;
  }
  throw new ApiError(404, 'NOT_FOUND');
}
