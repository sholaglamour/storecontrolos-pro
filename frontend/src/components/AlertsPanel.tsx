import { AlertTriangle, ShieldCheck, TriangleAlert } from "lucide-react";
import clsx from "clsx";
import type { Alert } from "../types";

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="panel p-5 flex items-center gap-3 animate-fadeUp">
        <div className="w-9 h-9 rounded-lg bg-signal-green/10 flex items-center justify-center text-signal-green">
          <ShieldCheck size={17} />
        </div>
        <div>
          <p className="text-sm font-medium">All clear</p>
          <p className="text-[12px] text-muted">No alerts for this showroom right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel p-5 animate-fadeUp">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-3">Attention needed</p>
      <div className="space-y-2.5">
        {alerts.map((a, i) => (
          <div
            key={i}
            className={clsx(
              "flex items-start gap-2.5 px-3 py-2.5 rounded-xl border",
              a.severity === "critical"
                ? "bg-signal-rust/[0.07] border-signal-rust/25"
                : "bg-signal-amber/[0.07] border-signal-amber/25"
            )}
          >
            {a.severity === "critical" ? (
              <AlertTriangle size={15} className="text-signal-rust mt-0.5 shrink-0" />
            ) : (
              <TriangleAlert size={15} className="text-signal-amber mt-0.5 shrink-0" />
            )}
            <p className="text-[13px] text-ivory/90">{a.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
