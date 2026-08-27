import { MapPin, User, Clock } from "lucide-react";
import type { StoreSummary } from "../types";
import { formatClock } from "../lib/format";

interface HeaderProps {
  title: string;
  subtitle?: string;
  store?: StoreSummary | null;
  lastSynced?: string | null;
}

export default function Header({ title, subtitle, store, lastSynced }: HeaderProps) {
  return (
    <div className="flex items-start justify-between mb-7 animate-fadeUp">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        {store && (
          <div className="flex items-center gap-4 mt-2 text-[12px] text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {store.location}
            </span>
            <span className="flex items-center gap-1">
              <User size={12} /> {store.manager}
            </span>
          </div>
        )}
      </div>
      {lastSynced && (
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted bg-panel border border-hairline rounded-lg px-3 py-2">
          <Clock size={12} className="text-signal-green" />
          Live · synced {formatClock(lastSynced)}
        </div>
      )}
    </div>
  );
}
