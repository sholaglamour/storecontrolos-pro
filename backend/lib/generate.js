// Deterministic mock-data engine.
//
// WHY THIS EXISTS: the whole point of StoreControlOS is that switching stores
// shows that store's REAL data. Since we don't have a live POS/inventory feed
// wired in yet, we simulate one — but deterministically, seeded from the
// store's own id, so the numbers are stable across reloads and genuinely
// distinct per store (not random noise that changes every fetch).
//
// TO GO LIVE: replace the body of `buildDashboardForStore()` with real
// queries (POS API, inventory DB, HR system, accounting export) keyed by
// storeId. Nothing in server.js or the frontend needs to change — they only
// know about the shape returned here.

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

const FIRST_NAMES = ["Amara", "Chidi", "Tolu", "Ifeoma", "Femi", "Ngozi", "Kunle", "Bola", "Uche", "Yemi", "Dare", "Chioma", "Segun", "Ada", "Kemi", "Tunde"];
const LAST_NAMES = ["Okafor", "Balogun", "Eze", "Adeyemi", "Nwosu", "Okonkwo", "Bakare", "Umeh", "Adebayo", "Nnamdi"];
const ROLES = ["Sales Associate", "Showroom Lead", "Cashier", "Inventory Officer", "Store Manager"];
const CATEGORIES = ["Furniture", "Electronics", "Home Decor", "Appliances", "Lighting"];
const EXPENSE_CATEGORIES = ["Rent", "Payroll", "Utilities", "Logistics", "Marketing", "Maintenance"];
const SKU_ITEMS = [
  { name: "Oak Dining Set", cat: "Furniture" },
  { name: "Velvet Sofa 3-Seater", cat: "Furniture" },
  { name: "55\" Smart TV", cat: "Electronics" },
  { name: "Bluetooth Speaker", cat: "Electronics" },
  { name: "Ceramic Table Lamp", cat: "Lighting" },
  { name: "Wall Art Set", cat: "Home Decor" },
  { name: "Double Door Fridge", cat: "Appliances" },
  { name: "Microwave Oven", cat: "Appliances" },
  { name: "Pendant Light Fixture", cat: "Lighting" },
  { name: "Accent Armchair", cat: "Furniture" },
];

function money(n) {
  return Math.round(n);
}

export function buildDashboardForStore(store) {
  const rng = mulberry32(hashSeed(store.id));

  // ---- Revenue trend (last 14 days) ----
  const baseDaily = 180000 + rng() * 420000; // Naira/day baseline, wide spread across stores
  const revenueTrend = [];
  let running = baseDaily * (0.75 + rng() * 0.2);
  for (let i = 13; i >= 0; i--) {
    const weekendBoost = i % 7 === 0 || i % 7 === 6 ? 1.15 : 1;
    const noise = 0.85 + rng() * 0.3;
    running = baseDaily * weekendBoost * noise;
    const d = new Date();
    d.setDate(d.getDate() - i);
    revenueTrend.push({
      date: d.toISOString().slice(5, 10), // MM-DD
      revenue: money(running),
    });
  }
  const todayRevenue = revenueTrend[revenueTrend.length - 1].revenue;
  const yesterdayRevenue = revenueTrend[revenueTrend.length - 2].revenue;
  const revenueDeltaPct = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
  const weekRevenue = revenueTrend.slice(-7).reduce((s, d) => s + d.revenue, 0);
  const prevWeekRevenue = revenueTrend.slice(0, 7).reduce((s, d) => s + d.revenue, 0);
  const weekDeltaPct = ((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100;

  // ---- Sales by category ----
  const salesByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    value: money(weekRevenue * (0.08 + rng() * 0.3) * 0.4),
  }));

  // ---- Expenses ----
  const totalExpense = weekRevenue * (0.35 + rng() * 0.2);
  let remaining = totalExpense;
  const expenseBreakdown = EXPENSE_CATEGORIES.map((cat, idx) => {
    const isLast = idx === EXPENSE_CATEGORIES.length - 1;
    const share = isLast ? remaining : totalExpense * (0.08 + rng() * 0.22);
    remaining -= share;
    return { category: cat, value: money(Math.max(share, totalExpense * 0.03)) };
  });
  const profitMargin = ((weekRevenue - totalExpense) / weekRevenue) * 100;
  const prevMargin = profitMargin - (rng() * 6 - 3);
  const marginDeltaPct = profitMargin - prevMargin;

  // ---- Inventory ----
  const inventory = SKU_ITEMS.map((item, i) => {
    const stock = Math.floor(rng() * 60);
    const threshold = 10 + Math.floor(rng() * 10);
    return {
      sku: `${store.id.slice(0, 3).toUpperCase()}-${100 + i}`,
      name: item.name,
      category: item.cat,
      stock,
      threshold,
      status: stock === 0 ? "out" : stock < threshold ? "low" : "ok",
    };
  });
  const inventoryValue = inventory.reduce((s, it) => s + it.stock * (15000 + rng() * 60000), 0);
  const lowStockCount = inventory.filter((i) => i.status !== "ok").length;

  // ---- Staff ----
  const staffCount = 6 + Math.floor(rng() * 14);
  const staff = Array.from({ length: staffCount }).map(() => {
    const roll = rng();
    const status = roll < 0.78 ? "present" : roll < 0.92 ? "late" : "absent";
    return {
      name: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      role: pick(rng, ROLES),
      status,
      attendancePct: Math.round(70 + rng() * 30),
    };
  });
  const presentCount = staff.filter((s) => s.status !== "absent").length;
  const attendanceRate = (presentCount / staffCount) * 100;

  // ---- Customers ----
  const customerCount = Math.floor(weekRevenue / (25000 + rng() * 20000));
  const newCustomers = Math.floor(customerCount * (0.15 + rng() * 0.2));
  const repeatRate = 40 + rng() * 35;
  const csat = 3.6 + rng() * 1.3;

  const recentTransactions = Array.from({ length: 8 }).map((_, i) => {
    const amount = money(8000 + rng() * 380000);
    const hoursAgo = i * (1 + rng() * 2);
    const t = new Date(Date.now() - hoursAgo * 3600 * 1000);
    return {
      id: `TXN-${hashSeed(store.id + i).toString(16).slice(-6).toUpperCase()}`,
      customer: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      item: pick(rng, SKU_ITEMS).name,
      amount,
      time: t.toISOString(),
    };
  });

  // ---- Alerts (derived, drive the "signal" indicator) ----
  const alerts = [];
  if (lowStockCount > 0) {
    alerts.push({
      severity: lowStockCount > 3 ? "critical" : "warning",
      message: `${lowStockCount} item${lowStockCount > 1 ? "s" : ""} low or out of stock`,
    });
  }
  if (attendanceRate < 80) {
    alerts.push({ severity: "warning", message: `Staff attendance at ${attendanceRate.toFixed(0)}% today` });
  }
  if (revenueDeltaPct < -8) {
    alerts.push({ severity: "critical", message: `Revenue down ${Math.abs(revenueDeltaPct).toFixed(1)}% vs yesterday` });
  }
  if (profitMargin < 15) {
    alerts.push({ severity: "warning", message: `Profit margin thin at ${profitMargin.toFixed(1)}%` });
  }

  const health = alerts.some((a) => a.severity === "critical")
    ? "critical"
    : alerts.length > 0
    ? "warning"
    : "healthy";

  return {
    storeId: store.id,
    lastSynced: new Date().toISOString(),
    kpis: {
      revenue: { value: money(weekRevenue), deltaPct: Number(weekDeltaPct.toFixed(1)) },
      profitMargin: { value: Number(profitMargin.toFixed(1)), deltaPct: Number(marginDeltaPct.toFixed(1)) },
      inventoryValue: { value: money(inventoryValue), deltaPct: Number((rng() * 10 - 4).toFixed(1)) },
      customers: { value: customerCount, deltaPct: Number(((newCustomers / customerCount) * 100).toFixed(1)) },
    },
    revenueTrend,
    salesByCategory,
    expenseBreakdown,
    inventory,
    staff: { members: staff, total: staffCount, present: presentCount, attendanceRate: Number(attendanceRate.toFixed(1)) },
    customersInsight: {
      total: customerCount,
      new: newCustomers,
      repeatRate: Number(repeatRate.toFixed(1)),
      csat: Number(csat.toFixed(1)),
    },
    recentTransactions,
    alerts,
    health,
  };
}
