const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:9000";

export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(`API ${r.status}: ${await r.text()}`);
  return r.json() as Promise<T>;
}
