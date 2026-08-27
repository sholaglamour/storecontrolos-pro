import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import { listStores, getStore, addStore, removeStore } from "./lib/db.js";
import { buildDashboardForStore } from "./lib/generate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// In local dev (no FRONTEND_URL set) allow any origin. In production, set
// FRONTEND_URL to the deployed frontend's exact URL so only it can call this API.
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// GET /api/stores — the store switcher's data source
app.get("/api/stores", (req, res) => {
  const stores = listStores();
  // attach a lightweight health signal so the switcher can show status
  // dots without the client having to fetch every store's full dashboard
  const withHealth = stores.map((s) => {
    const dash = buildDashboardForStore(s);
    return { ...s, health: dash.health, lastSynced: dash.lastSynced };
  });
  res.json(withHealth);
});

// POST /api/stores — add a new showroom
app.post("/api/stores", (req, res) => {
  const { name, location, manager } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Store name is required." });
  }
  const store = addStore({ name, location, manager });
  res.status(201).json(store);
});

// DELETE /api/stores/:id
app.delete("/api/stores/:id", (req, res) => {
  const ok = removeStore(req.params.id);
  if (!ok) return res.status(404).json({ error: "Store not found." });
  res.status(204).end();
});

// GET /api/stores/:id/dashboard — THE core contract: switching stores on
// the frontend calls this with a different id and gets that store's own
// data back. This is the one route to replace with real POS/ERP queries.
app.get("/api/stores/:id/dashboard", (req, res) => {
  const store = getStore(req.params.id);
  if (!store) return res.status(404).json({ error: "Store not found." });
  const dashboard = buildDashboardForStore(store);
  res.json({ store, ...dashboard });
});

// GET /api/overview — CEO's cross-store aggregate (the "command center" view)
app.get("/api/overview", (req, res) => {
  const stores = listStores();
  const dashboards = stores.map((s) => ({ store: s, dash: buildDashboardForStore(s) }));

  const totalRevenue = dashboards.reduce((sum, d) => sum + d.dash.kpis.revenue.value, 0);
  const totalInventoryValue = dashboards.reduce((sum, d) => sum + d.dash.kpis.inventoryValue.value, 0);
  const totalCustomers = dashboards.reduce((sum, d) => sum + d.dash.kpis.customers.value, 0);
  const avgMargin =
    dashboards.reduce((sum, d) => sum + d.dash.kpis.profitMargin.value, 0) / (dashboards.length || 1);

  const ranked = [...dashboards].sort((a, b) => b.dash.kpis.revenue.deltaPct - a.dash.kpis.revenue.deltaPct);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  const storesNeedingAttention = dashboards.filter((d) => d.dash.health !== "healthy").length;

  const combinedTrend = (dashboards[0]?.dash.revenueTrend || []).map((point, i) => ({
    date: point.date,
    revenue: dashboards.reduce((sum, d) => sum + (d.dash.revenueTrend[i]?.revenue || 0), 0),
  }));

  res.json({
    totalRevenue,
    totalInventoryValue,
    totalCustomers,
    avgMargin: Number(avgMargin.toFixed(1)),
    storeCount: stores.length,
    storesNeedingAttention,
    bestStore: best ? { name: best.store.name, id: best.store.id, deltaPct: best.dash.kpis.revenue.deltaPct } : null,
    worstStore: worst ? { name: worst.store.name, id: worst.store.id, deltaPct: worst.dash.kpis.revenue.deltaPct } : null,
    combinedTrend,
    stores: dashboards.map((d) => ({
      id: d.store.id,
      name: d.store.name,
      revenue: d.dash.kpis.revenue.value,
      deltaPct: d.dash.kpis.revenue.deltaPct,
      health: d.dash.health,
    })),
  });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---- Serve the built frontend as one deployable service ----
// After `npm run build` in /frontend, its output lands in /frontend/dist.
// If that folder exists (i.e. in production), serve it directly so a single
// Node process is the whole app — no separate static host, no CORS to
// configure. In local dev, frontend/dist won't exist yet (you're running
// `npm run dev` in /frontend on its own port instead), so this is skipped.
const frontendDist = join(__dirname, "..", "frontend", "dist");
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // Any non-API GET falls through to index.html so client-side routing
  // (and a plain refresh on any URL) works correctly.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(join(frontendDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`StoreControlOS running on http://localhost:${PORT}`);
});
