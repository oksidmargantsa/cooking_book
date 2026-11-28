import { tokenStore } from './tokens';
import { ApiError } from './errors';
import { isMock } from './mode';
import { mockRequest } from './mock';
export { ApiError };

export const API_BASE = '/api/v1';

export type Query = Record<string, string | number | boolean | (string | number)[] | null | undefined>;

export function buildQuery(q?: Query): string {
  if (!q) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x))); // ?ingredients=1&ingredients=2
    else sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

let onAuthLost: () => void = () => {};
export const setAuthLostHandler = (fn: () => void) => { onAuthLost = fn; };

let refreshing: Promise<string | null> | null = null;
async function refreshAccess(): Promise<string | null> {
  const t = tokenStore.get();
  if (!t) return null;
  refreshing ??= fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: t.refresh }),
  })
    .then(async (r) => {
      if (!r.ok) return null;
      const { access_token } = await r.json();
      tokenStore.set({ ...t, access: access_token });
      return access_token as string;
    })
    .catch(() => null)
    .finally(() => { refreshing = null; });
  return refreshing;
}

interface Opts { method?: string; query?: Query; body?: unknown; auth?: boolean }

export async function request<T>(path: string, { method = 'GET', query, body, auth = true }: Opts = {}): Promise<T> {
  if (isMock()) return mockRequest<T>(path, { method, query, body });
  const doFetch = (access?: string) =>
    fetch(`${API_BASE}${path}${buildQuery(query)}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch(auth ? tokenStore.get()?.access : undefined);

  if (res.status === 401 && auth && tokenStore.get()) {
    const fresh = await refreshAccess();
    if (fresh) res = await doFetch(fresh);
    else { tokenStore.clear(); onAuthLost(); }
  }

  if (!res.ok) {
    let code: string | null = null;
    try { const j = await res.json(); code = j?.code ?? j?.detail?.code ?? (typeof j?.detail === 'string' ? j.detail : null); } catch { /* пустое тело */ }
    throw new ApiError(res.status, code);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
