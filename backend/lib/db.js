// Tiny file-backed "database" for the store registry.
//
// TO GO LIVE: swap this module for a real DB client (Postgres/Supabase/etc).
// Keep the exported function names and shapes identical and nothing else in
// the app needs to change — server.js and the frontend only talk to these
// functions, never to the file directly.

import { readFileSync, writeFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "db.json");

const SEED_STORES = [
  { name: "Victoria Island Showroom", location: "Lagos, NG", manager: "Ada Nwosu" },
  { name: "Ikeja Flagship", location: "Lagos, NG", manager: "Femi Balogun" },
  { name: "Abuja Central", location: "Abuja, NG", manager: "Chioma Eze" },
  { name: "Port Harcourt Branch", location: "Port Harcourt, NG", manager: "Tunde Okafor" },
];

const AVATAR_COLORS = ["#C89B4A", "#5FAE82", "#6C8AE4", "#C1613F", "#9A7BD1", "#4FB0B0"];

function seedDb() {
  const stores = SEED_STORES.map((s, i) => ({
    id: randomUUID(),
    name: s.name,
    location: s.location,
    manager: s.manager,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    createdAt: new Date().toISOString(),
  }));
  const data = { stores };
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  return data;
}

function load() {
  if (!existsSync(DB_PATH)) return seedDb();
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8"));
  } catch {
    return seedDb();
  }
}

function save(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function listStores() {
  return load().stores;
}

export function getStore(id) {
  return load().stores.find((s) => s.id === id) || null;
}

export function addStore({ name, location, manager }) {
  const data = load();
  const color = AVATAR_COLORS[data.stores.length % AVATAR_COLORS.length];
  const store = {
    id: randomUUID(),
    name: name?.trim() || "Untitled Store",
    location: location?.trim() || "Unspecified",
    manager: manager?.trim() || "Unassigned",
    color,
    createdAt: new Date().toISOString(),
  };
  data.stores.push(store);
  save(data);
  return store;
}

export function removeStore(id) {
  const data = load();
  const before = data.stores.length;
  data.stores = data.stores.filter((s) => s.id !== id);
  save(data);
  return data.stores.length < before;
}
