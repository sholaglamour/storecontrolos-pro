import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string;
  deltaPct: number;
  icon: LucideIcon;
  invertDelta?: boolean; // for metrics where "up" isn't necessarily good context-wise
  sub?: string;
}

export default function KpiCard({ label, value, deltaPct, icon: Icon, sub }: KpiCardProps) {
  const positive = deltaPct >= 0;
  return (
    <div className="panel kpi-accent p-5 relative overflow-hidden animate-fadeUp">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-brass">
          <Icon size={14} />
        </div>
      </div>
      <p className="font-display text-[26px] font-semibold mt-3 tracking-tight text-ivory">{value}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <span
          className={clsx(
            "inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded-md",
            positive ? "bg-signal-green/10 text-signal-green" : "bg-signal-rust/10 text-signal-rust"
          )}
        >
          {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(deltaPct).toFixed(1)}%
        </span>
        {sub && <span className="text-[11px] text-muted">{sub}</span>}
      </div>
    </div>
  );
}
