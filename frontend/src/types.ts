export type Health = "healthy" | "warning" | "critical";

export interface StoreSummary {
  id: string;
  name: string;
  location: string;
  manager: string;
  color: string;
  createdAt: string;
  health: Health;
  lastSynced: string;
}

export interface KpiValue {
  value: number;
  deltaPct: number;
}

export interface TrendPoint {
  date: string;
  revenue: number;
}

export interface CategoryValue {
  category: string;
  value: number;
}

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  status: "ok" | "low" | "out";
}

export interface StaffMember {
  name: string;
  role: string;
  status: "present" | "late" | "absent";
  attendancePct: number;
}

export interface Alert {
  severity: "warning" | "critical";
  message: string;
}

export interface Transaction {
  id: string;
  customer: string;
  item: string;
  amount: number;
  time: string;
}

export interface StoreDashboard {
  store: StoreSummary;
  storeId: string;
  lastSynced: string;
  kpis: {
    revenue: KpiValue;
    profitMargin: KpiValue;
    inventoryValue: KpiValue;
    customers: KpiValue;
  };
  revenueTrend: TrendPoint[];
  salesByCategory: CategoryValue[];
  expenseBreakdown: CategoryValue[];
  inventory: InventoryItem[];
  staff: {
    members: StaffMember[];
    total: number;
    present: number;
    attendanceRate: number;
  };
  customersInsight: {
    total: number;
    new: number;
    repeatRate: number;
    csat: number;
  };
  recentTransactions: Transaction[];
  alerts: Alert[];
  health: Health;
}

export interface OverviewStoreRow {
  id: string;
  name: string;
  revenue: number;
  deltaPct: number;
  health: Health;
}

export interface Overview {
  totalRevenue: number;
  totalInventoryValue: number;
  totalCustomers: number;
  avgMargin: number;
  storeCount: number;
  storesNeedingAttention: number;
  bestStore: { name: string; id: string; deltaPct: number } | null;
  worstStore: { name: string; id: string; deltaPct: number } | null;
  combinedTrend: TrendPoint[];
  stores: OverviewStoreRow[];
}
