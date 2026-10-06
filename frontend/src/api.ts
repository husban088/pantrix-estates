const BASE = ((import.meta.env.VITE_API_URL as string | undefined) || '').replace(/\/$/, '');
const TOKEN_KEY = 'pantrix_admin_token';

export const auth = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(method: string, path: string, body?: unknown, form?: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const token = auth.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: form ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  } catch {
    throw new Error('Server se connect nahi ho pa raha. Backend chal raha hai?');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) { auth.clear(); }
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Something went wrong');
  return data as T;
}

export const api = {
  get: <T,>(p: string) => request<T>('GET', p),
  post: <T,>(p: string, b: unknown) => request<T>('POST', p, b),
  put: <T,>(p: string, b: unknown) => request<T>('PUT', p, b),
  patch: <T,>(p: string, b: unknown) => request<T>('PATCH', p, b),
  del: <T,>(p: string) => request<T>('DELETE', p),
  upload: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    return request<{ urls: string[]; storage: string }>('POST', '/upload', undefined, fd);
  },
};

export const assetUrl = (u: string) => (u.startsWith('/uploads') ? `${BASE}${u}` : u);
