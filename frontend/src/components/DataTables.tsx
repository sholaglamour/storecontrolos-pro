import clsx from "clsx";
import type { InventoryItem, StaffMember, Transaction } from "../types";
import { formatNaira, timeAgo } from "../lib/format";

const STATUS_STYLE: Record<InventoryItem["status"], string> = {
  ok: "text-signal-green bg-signal-green/10",
  low: "text-signal-amber bg-signal-amber/10",
  out: "text-signal-rust bg-signal-rust/10",
};

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const sorted = [...items].sort((a, b) => (a.status === b.status ? 0 : a.status === "out" ? -1 : 1));
  return (
    <div className="panel p-5 animate-fadeUp">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-4">Inventory status</p>
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_70px_70px_70px] text-[10px] font-mono uppercase text-muted/70 px-2 pb-2">
          <span>Item</span>
          <span className="text-right">Stock</span>
          <span className="text-right">Min</span>
          <span className="text-right">Status</span>
        </div>
        {sorted.slice(0, 6).map((item) => (
          <div
            key={item.sku}
            className="grid grid-cols-[1fr_70px_70px_70px] items-center px-2 py-2 rounded-lg hover:bg-white/[0.03] text-[13px]"
          >
            <div className="min-w-0">
              <p className="truncate">{item.name}</p>
              <p className="text-[10px] font-mono text-muted">{item.sku}</p>
            </div>
            <span className="text-right font-mono text-ivory/80">{item.stock}</span>
            <span className="text-right font-mono text-muted">{item.threshold}</span>
            <span className="text-right">
              <span className={clsx("text-[10px] font-mono px-1.5 py-0.5 rounded-full", STATUS_STYLE[item.status])}>
                {item.status.toUpperCase()}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STAFF_DOT: Record<StaffMember["status"], string> = {
  present: "bg-signal-green",
  late: "bg-signal-amber",
  absent: "bg-signal-rust",
};

export function StaffTable({ members, attendanceRate }: { members: StaffMember[]; attendanceRate: number }) {
  return (
    <div className="panel p-5 animate-fadeUp">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted">Staff on duty</p>
        <span className="text-[11px] font-mono text-signal-green">{attendanceRate}% attendance</span>
      </div>
      <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
            <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", STAFF_DOT[m.status])} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] truncate">{m.name}</p>
              <p className="text-[10px] text-muted truncate">{m.role}</p>
            </div>
            <span className="text-[10px] font-mono text-muted capitalize">{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionsList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="panel p-5 animate-fadeUp">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-4">Recent transactions</p>
      <div className="space-y-1">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03]">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] truncate">{t.customer}</p>
              <p className="text-[11px] text-muted truncate">{t.item}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[13px] font-mono text-ivory/90">{formatNaira(t.amount)}</p>
              <p className="text-[10px] font-mono text-muted">{timeAgo(t.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
