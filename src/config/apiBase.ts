/** API root for fetch(). In dev, defaults to /api (Vite proxy → Flask). */
const fromEnv = import.meta.env.VITE_API_BASE_URL;

export const API_BASE =
  typeof fromEnv === 'string' && fromEnv.trim() !== ''
    ? fromEnv.trim()
    : import.meta.env.DEV
      ? '/api'
      : 'http://localhost:5000/api';

/** Turn stored `profile_photo_path` (filesystem path) into a URL for <img src>. */
export function profilePhotoSrc(stored: string | undefined | null): string {
  if (stored == null || String(stored).trim() === '') return '';
  const s = String(stored).trim();
  if (s.startsWith('data:') || s.startsWith('blob:')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  const slash = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\'));
  const filename = slash >= 0 ? s.slice(slash + 1) : s;
  if (!filename) return '';
  const path = `/uploads/${encodeURIComponent(filename)}`;
  if (import.meta.env.DEV) return path;
  const api = typeof fromEnv === 'string' ? fromEnv.trim() : '';
  if (api) {
    try {
      return new URL(path, new URL(api).origin).href;
    } catch {
      /* fall through */
    }
  }
  return `http://localhost:5000${path}`;
}
