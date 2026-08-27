import { Wallet, TrendingUp, Boxes, Users, ArrowUpRight, ArrowDownRight, TriangleAlert } from "lucide-react";
import clsx from "clsx";
import Header from "./Header";
import KpiCard from "./KpiCard";
import { RevenueTrendChart } from "./Charts";
import { DashboardSkeleton } from "./Skeletons";
import { useOverview } from "../hooks/useOverview";
import { formatNaira, formatNumber } from "../lib/format";
import type { Health } from "../types";

const HEALTH_DOT: Record<Health, string> = {
  healthy: "bg-signal-green",
  warning: "bg-signal-amber",
  critical: "bg-signal-rust",
};

export default function AllStoresOverview({ onSelectStore }: { onSelectStore: (id: string) => void }) {
  const { data, loading, error } = useOverview(true);

  if (error) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-signal-rust text-sm">{error}</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div>
        <div className="h-16 mb-7" />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="All Stores"
        subtitle={`Command center across ${data.storeCount} showrooms`}
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard label="Total revenue (7d)" value={formatNaira(data.totalRevenue)} deltaPct={data.bestStore?.deltaPct ?? 0} icon={Wallet} sub="all showrooms" />
        <KpiCard label="Avg. profit margin" value={`${data.avgMargin}%`} deltaPct={data.avgMargin - 20} icon={TrendingUp} sub="blended" />
        <KpiCard label="Inventory value" value={formatNaira(data.totalInventoryValue)} deltaPct={0} icon={Boxes} sub="on hand, all stores" />
        <KpiCard label="Customers (7d)" value={formatNumber(data.totalCustomers)} deltaPct={0} icon={Users} sub="across network" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="panel p-5 col-span-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">Combined revenue trend · 14 days</p>
          <RevenueTrendChart data={data.combinedTrend} />
        </div>

        <div className="panel p-5 space-y-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted">Network signal</p>
          {data.storesNeedingAttention > 0 ? (
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-signal-amber/[0.07] border border-signal-amber/25">
              <TriangleAlert size={15} className="text-signal-amber mt-0.5 shrink-0" />
              <p className="text-[13px] text-ivory/90">
                {data.storesNeedingAttention} store{data.storesNeedingAttention > 1 ? "s" : ""} need attention today
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-signal-green">All showrooms healthy</p>
          )}

          {data.bestStore && (
            <div>
              <p className="text-[11px] text-muted mb-1">Top performer</p>
              <button
                onClick={() => onSelectStore(data.bestStore!.id)}
                className="flex items-center justify-between w-full text-left hover:opacity-80"
              >
                <span className="text-sm">{data.bestStore.name}</span>
                <span className="text-[12px] font-mono text-signal-green flex items-center gap-0.5">
                  <ArrowUpRight size={12} /> {data.bestStore.deltaPct}%
                </span>
              </button>
            </div>
          )}
          {data.worstStore && (
            <div>
              <p className="text-[11px] text-muted mb-1">Needs a look</p>
              <button
                onClick={() => onSelectStore(data.worstStore!.id)}
                className="flex items-center justify-between w-full text-left hover:opacity-80"
              >
                <span className="text-sm">{data.worstStore.name}</span>
                <span className="text-[12px] font-mono text-signal-rust flex items-center gap-0.5">
                  <ArrowDownRight size={12} /> {data.worstStore.deltaPct}%
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="panel p-5">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-4">All showrooms</p>
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_140px_100px_90px] text-[10px] font-mono uppercase text-muted/70 px-2 pb-2">
            <span>Store</span>
            <span className="text-right">Revenue (7d)</span>
            <span className="text-right">Change</span>
            <span className="text-right">Status</span>
          </div>
          {data.stores.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectStore(s.id)}
              className="grid grid-cols-[1fr_140px_100px_90px] items-center w-full text-left px-2 py-3 rounded-lg hover:bg-white/[0.04] text-[13px]"
            >
              <span>{s.name}</span>
              <span className="text-right font-mono">{formatNaira(s.revenue)}</span>
              <span
                className={clsx(
                  "text-right font-mono text-[12px]",
                  s.deltaPct >= 0 ? "text-signal-green" : "text-signal-rust"
                )}
              >
                {s.deltaPct >= 0 ? "+" : ""}
                {s.deltaPct}%
              </span>
              <span className="text-right">
                <span className={clsx("inline-block w-1.5 h-1.5 rounded-full", HEALTH_DOT[s.health])} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
