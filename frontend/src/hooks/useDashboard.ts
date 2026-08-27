import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { StoreDashboard } from "../types";

// The core proof-of-correctness for the whole product: this hook re-fetches
// from the backend every time `storeId` changes, so the dashboard always
// reflects that specific store's own data — never a cached/local swap.
export function useDashboard(storeId: string | null) {
  const [data, setData] = useState<StoreDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getDashboard(storeId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return { data, loading, error };
}
