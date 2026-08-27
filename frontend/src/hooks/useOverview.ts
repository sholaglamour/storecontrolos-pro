import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import type { Overview } from "../types";

export function useOverview(active: boolean) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!active) return;
    setLoading(true);
    api
      .getOverview()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load overview"))
      .finally(() => setLoading(false));
  }, [active]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
