import { LayoutGrid, Plus, Radio, Search } from "lucide-react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import type { StoreSummary, Health } from "../types";
import { timeAgo } from "../lib/format";

const HEALTH_COLOR: Record<Health, string> = {
  healthy: "bg-signal-green",
  warning: "bg-signal-amber",
  critical: "bg-signal-rust",
};

interface SidebarProps {
  stores: StoreSummary[];
  selectedId: string | null; // null = "All Stores" overview
  onSelect: (id: string | null) => void;
  onAddStore: () => void;
  loading: boolean;
}

export default function Sidebar({ stores, selectedId, onSelect, onAddStore, loading }: SidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      stores.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.location.toLowerCase().includes(query.toLowerCase())
      ),
    [stores, query]
  );

  const attentionCount = stores.filter((s) => s.health !== "healthy").length;

  return (
    <aside className="w-[300px] shrink-0 h-screen sticky top-0 border-r border-hairline flex flex-col bg-panel/60 backdrop-blur-sm">
      <div className="px-5 pt-6 pb-4 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brass to-brassdim flex items-center justify-center shadow-glow">
            <Radio size={16} className="text-ink" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-semibold text-[15px] leading-tight tracking-tight">StoreControlOS</p>
            <p className="text-[11px] text-muted font-mono">Command Center</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <button
          onClick={() => onSelect(null)}
          className={clsx(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1",
            selectedId === null
              ? "bg-brass/10 text-brass border border-brass/30"
              : "text-ivory/80 border border-transparent hover:bg-white/5"
          )}
        >
          <LayoutGrid size={16} />
          All Stores
          {attentionCount > 0 && (
            <span className="ml-auto text-[10px] font-mono bg-signal-rust/15 text-signal-rust px-1.5 py-0.5 rounded-full">
              {attentionCount} need attention
            </span>
          )}
        </button>
      </div>

      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted">
            Showrooms · {stores.length}
          </p>
        </div>
        <div className="relative mb-2">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search showrooms"
            className="w-full bg-panel2 border border-hairline rounded-lg pl-8 pr-2 py-1.5 text-xs placeholder:text-muted/70 focus:border-brass/40 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loading && stores.length === 0 && (
          <div className="space-y-2 px-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 rounded-xl shimmer" />
            ))}
          </div>
        )}
        {filtered.map((store) => {
          const active = store.id === selectedId;
          return (
            <button
              key={store.id}
              onClick={() => onSelect(store.id)}
              className={clsx(
                "w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all group",
                active ? "bg-white/[0.06] border border-brass/25" : "border border-transparent hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-display font-semibold text-ink shrink-0 mt-0.5"
                  style={{ backgroundColor: store.color }}
                >
                  {store.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p
                      className={clsx(
                        "text-[13px] font-medium truncate",
                        active ? "text-ivory" : "text-ivory/85"
                      )}
                    >
                      {store.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted truncate">{store.location}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className={clsx(
                          "absolute inline-flex h-full w-full rounded-full animate-pulseDot",
                          HEALTH_COLOR[store.health]
                        )}
                      />
                    </span>
                    <span className="text-[10px] font-mono text-muted">synced {timeAgo(store.lastSynced)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-hairline">
        <button
          onClick={onAddStore}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl border border-dashed border-hairline text-muted hover:text-brass hover:border-brass/40 transition-colors"
        >
          <Plus size={14} /> Add showroom
        </button>
      </div>
    </aside>
  );
}
