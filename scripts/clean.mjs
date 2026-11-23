import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_ROOTS = ["products", "studies"];
const CACHE_DIRS = new Set(["dist", ".cache"]);
const SKIP_DIRS = new Set(["node_modules", ".git"]);

let removedDirs = 0;
let removedFiles = 0;

async function cleanCaches(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (CACHE_DIRS.has(entry.name)) {
      await rm(full, { recursive: true, force: true });
      removedDirs += 1;
      continue;
    }
    await cleanCaches(full);
  }
}

async function cleanDsStore(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await cleanDsStore(full);
      continue;
    }
    if (entry.name === ".DS_Store") {
      await rm(full, { force: true });
      removedFiles += 1;
    }
  }
}

for (const rel of CACHE_ROOTS) {
  await cleanCaches(path.join(root, rel));
}
await cleanDsStore(root);

console.log(`Cleaning completed (${removedDirs} cache dirs, ${removedFiles} .DS_Store files).`);
