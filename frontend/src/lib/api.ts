import type { StoreSummary, StoreDashboard, Overview } from "../types";

// In local dev, requests to "/api" are proxied to localhost:4000 (see vite.config.ts).
// In production (frontend and backend deployed as separate services), set
// VITE_API_URL to the backend's full public URL at build time, e.g.
//   VITE_API_URL=https://storecontrolos-backend.onrender.com
const API_ROOT = import.meta.env.VITE_API_URL || "";
const BASE = `${API_ROOT}/api`;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listStores: () => req<StoreSummary[]>("/stores"),
  getDashboard: (storeId: string) => req<StoreDashboard>(`/stores/${storeId}/dashboard`),
  getOverview: () => req<Overview>("/overview"),
  addStore: (input: { name: string; location: string; manager: string }) =>
    req<StoreSummary>("/stores", { method: "POST", body: JSON.stringify(input) }),
  removeStore: (id: string) => req<void>(`/stores/${id}`, { method: "DELETE" }),
};
