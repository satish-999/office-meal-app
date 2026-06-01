import Database from "better-sqlite3";
import { writeFileSync } from "fs";

const globalDb = new Database(
  "C:/Users/satis/AppData/Roaming/Cursor/User/globalStorage/state.vscdb",
  { readonly: true }
);

const workspaceDb = new Database(
  "C:/Users/satis/AppData/Roaming/Cursor/User/workspaceStorage/d05723376fda903d7663d5a0debafe3a/state.vscdb",
  { readonly: true }
);

function queryItemTable(db, label) {
  const rows = db.prepare("SELECT key, length(value) as len FROM ItemTable").all();
  const interesting = rows.filter(
    (r) =>
      /composer|chat|aichat|prompt|generation|bubble/i.test(r.key) ||
      r.len > 5000
  );
  console.log(`\n=== ${label}: ${rows.length} keys, ${interesting.length} interesting ===`);
  for (const r of interesting.slice(0, 40)) {
    console.log(`${r.key} (${r.len} bytes)`);
  }
  return rows;
}

queryItemTable(globalDb, "globalStorage");
queryItemTable(workspaceDb, "Desktop workspace");

// Try composer.composerData from workspace
try {
  const row = workspaceDb
    .prepare("SELECT value FROM ItemTable WHERE key = 'composer.composerData'")
    .get();
  if (row?.value) {
    const data = JSON.parse(row.value.toString());
    writeFileSync(
      "scripts/cursor-composer-desktop.json",
      JSON.stringify(data, null, 2)
    );
    console.log("\nWrote scripts/cursor-composer-desktop.json");
    if (Array.isArray(data?.allComposers)) {
      console.log("Composer sessions:", data.allComposers.length);
      for (const c of data.allComposers.slice(0, 15)) {
        console.log("-", c.name || c.composerId || c.id, c.lastUpdatedAt || c.createdAt || "");
      }
    }
  }
} catch (e) {
  console.log("workspace composer parse:", e.message);
}

// Global cursorDiskKV if exists
try {
  const kvTables = globalDb
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='cursorDiskKV'")
    .all();
  if (kvTables.length) {
    const keys = globalDb
      .prepare(
        "SELECT key, length(value) as len FROM cursorDiskKV WHERE key LIKE '%composer%' OR key LIKE '%office-meal%' LIMIT 50"
      )
      .all();
    console.log("\n=== global cursorDiskKV composer keys ===");
    for (const k of keys) console.log(k.key, k.len);
  }
} catch (e) {
  console.log("cursorDiskKV:", e.message);
}

// Search all large values for office-meal mentions
const hits = [];
for (const db of [globalDb, workspaceDb]) {
  const rows = db.prepare("SELECT key, value FROM ItemTable").all();
  for (const r of rows) {
    const s = r.value?.toString() || "";
    if (s.includes("office-meal") || s.includes("Office Meal")) {
      hits.push({ db: db === globalDb ? "global" : "desktop-ws", key: r.key, len: s.length });
    }
  }
}
console.log("\n=== Keys mentioning office-meal ===");
for (const h of hits) console.log(h.db, h.key, h.len);

globalDb.close();
workspaceDb.close();
