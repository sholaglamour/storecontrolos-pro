import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { StoreSummary } from "../types";

export function useStores() {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.listStores();
      setStores(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Poll lightly so signal dots reflect near-real-time status without a websocket.
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  return { stores, loading, error, refresh };
}
