import { Wallet, TrendingUp, Boxes, Users } from "lucide-react";
import Header from "./Header";
import KpiCard from "./KpiCard";
import AlertsPanel from "./AlertsPanel";
import { RevenueTrendChart, CategoryBarChart, ExpenseDonutChart } from "./Charts";
import { InventoryTable, StaffTable, TransactionsList } from "./DataTables";
import { DashboardSkeleton } from "./Skeletons";
import { useDashboard } from "../hooks/useDashboard";
import { formatNaira, formatNumber } from "../lib/format";

export default function StoreDashboardView({ storeId }: { storeId: string }) {
  const { data, loading, error } = useDashboard(storeId);

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
      <Header title={data.store.name} store={data.store} lastSynced={data.lastSynced} />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard
          label="Revenue (7d)"
          value={formatNaira(data.kpis.revenue.value)}
          deltaPct={data.kpis.revenue.deltaPct}
          icon={Wallet}
          sub="vs prior week"
        />
        <KpiCard
          label="Profit margin"
          value={`${data.kpis.profitMargin.value}%`}
          deltaPct={data.kpis.profitMargin.deltaPct}
          icon={TrendingUp}
          sub="vs prior week"
        />
        <KpiCard
          label="Inventory value"
          value={formatNaira(data.kpis.inventoryValue.value)}
          deltaPct={data.kpis.inventoryValue.deltaPct}
          icon={Boxes}
          sub="on hand"
        />
        <KpiCard
          label="Customers (7d)"
          value={formatNumber(data.kpis.customers.value)}
          deltaPct={data.kpis.customers.deltaPct}
          icon={Users}
          sub="new customers"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="panel p-5 col-span-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">Revenue trend · 14 days</p>
          <RevenueTrendChart data={data.revenueTrend} />
        </div>
        <AlertsPanel alerts={data.alerts} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="panel p-5">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">Sales by category</p>
          <CategoryBarChart data={data.salesByCategory} />
        </div>
        <div className="panel p-5">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">Expense breakdown</p>
          <ExpenseDonutChart data={data.expenseBreakdown} />
        </div>
        <div className="panel p-5">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-4">Customer insight</p>
          <div className="space-y-4">
            <Metric label="Total customers (7d)" value={formatNumber(data.customersInsight.total)} />
            <Metric label="New customers" value={formatNumber(data.customersInsight.new)} />
            <Metric label="Repeat rate" value={`${data.customersInsight.repeatRate}%`} />
            <Metric label="Satisfaction (CSAT)" value={`${data.customersInsight.csat} / 5`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <InventoryTable items={data.inventory} />
        <StaffTable members={data.staff.members} attendanceRate={data.staff.attendanceRate} />
        <TransactionsList transactions={data.recentTransactions} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-muted">{label}</span>
      <span className="text-[14px] font-mono text-ivory">{value}</span>
    </div>
  );
}
