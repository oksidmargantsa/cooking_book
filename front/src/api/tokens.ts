const KEY = 'auth_tokens';
export type StoredTokens = { access: string; refresh: string };

export const tokenStore = {
  get(): StoredTokens | null {
    try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; }
  },
  set(t: StoredTokens) { localStorage.setItem(KEY, JSON.stringify(t)); },
  clear() { localStorage.removeItem(KEY); },
};
