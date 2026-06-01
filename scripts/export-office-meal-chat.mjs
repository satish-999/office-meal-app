import Database from "better-sqlite3";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const COMPOSER_ID = "e57a6169-032b-49f0-81cd-a6db93847f2e";
const OUT_DIR = "scripts/cursor-chat-export";

const globalDb = new Database(
  "C:/Users/satis/AppData/Roaming/Cursor/User/globalStorage/state.vscdb",
  { readonly: true }
);

mkdirSync(OUT_DIR, { recursive: true });

const composerRow = globalDb
  .prepare("SELECT value FROM cursorDiskKV WHERE key = ?")
  .get(`composerData:${COMPOSER_ID}`);

if (!composerRow?.value) {
  console.error("Composer session not found");
  process.exit(1);
}

const composer = JSON.parse(composerRow.value.toString());
writeFileSync(
  join(OUT_DIR, "composer-session.json"),
  JSON.stringify(composer, null, 2)
);

console.log("Composer name:", composer.name || "(unnamed)");
console.log("Created:", composer.createdAt);
console.log("Updated:", composer.lastUpdatedAt || composer.updatedAt);

const bubbles = globalDb
  .prepare(
    "SELECT key, value FROM cursorDiskKV WHERE key LIKE ? ORDER BY rowid ASC"
  )
  .all(`bubbleId:${COMPOSER_ID}:%`);

console.log("Bubble rows:", bubbles.length);

const messages = [];
for (const row of bubbles) {
  try {
    const bubble = JSON.parse(row.value.toString());
    const text =
      bubble.text ??
      bubble.rawText ??
      bubble.content ??
      bubble.message?.content ??
      "";
    const role = bubble.type ?? bubble.role ?? bubble.bubbleType ?? "unknown";
    messages.push({
      key: row.key,
      role,
      text: typeof text === "string" ? text : JSON.stringify(text),
      createdAt: bubble.createdAt ?? bubble.timestamp,
    });
  } catch {
    messages.push({ key: row.key, role: "parse-error", text: row.value.toString().slice(0, 500) });
  }
}

// Also pull large composer.content blobs linked to this workspace
const contentRows = globalDb
  .prepare(
    "SELECT key, value FROM cursorDiskKV WHERE key LIKE 'composer.content.%' AND length(value) > 100 ORDER BY rowid ASC"
  )
  .all();

const contentSnippets = [];
for (const row of contentRows) {
  const s = row.value.toString();
  if (
    s.includes("office-meal") ||
    s.includes("Office Meal") ||
    s.includes("Layer") ||
    s.includes("BUILD-LAYERS") ||
    s.includes("Render") ||
    s.includes("veg")
  ) {
    contentSnippets.push({ key: row.key, preview: s.slice(0, 2000) });
  }
}

writeFileSync(join(OUT_DIR, "messages.json"), JSON.stringify(messages, null, 2));
writeFileSync(
  join(OUT_DIR, "content-snippets.json"),
  JSON.stringify(contentSnippets, null, 2)
);

// Human-readable markdown summary
const md = [];
md.push("# Office Meal App — recovered Cursor chat");
md.push("");
md.push(`Composer ID: \`${COMPOSER_ID}\``);
md.push(`Session name: ${composer.name || "(unnamed)"}`);
md.push(`Messages extracted: ${messages.length}`);
md.push("");
md.push("---");
md.push("");

for (const m of messages) {
  if (!m.text?.trim()) continue;
  const heading = m.role === "user" || m.role === 1 ? "## You" : "## Assistant";
  md.push(heading);
  md.push("");
  md.push(m.text.slice(0, 8000));
  md.push("");
  md.push("---");
  md.push("");
}

writeFileSync(join(OUT_DIR, "CHAT-HISTORY.md"), md.join("\n"));

console.log("\nWrote:");
console.log("-", join(OUT_DIR, "composer-session.json"));
console.log("-", join(OUT_DIR, "messages.json"));
console.log("-", join(OUT_DIR, "CHAT-HISTORY.md"));
console.log("-", join(OUT_DIR, "content-snippets.json"), `(${contentSnippets.length} snippets)`);

// Print last few user messages as summary
const userMsgs = messages.filter(
  (m) => m.role === "user" || m.role === 1 || /user/i.test(String(m.role))
);
console.log("\nLast user messages:");
for (const m of userMsgs.slice(-8)) {
  console.log("-", (m.text || "").replace(/\s+/g, " ").slice(0, 120));
}

globalDb.close();
