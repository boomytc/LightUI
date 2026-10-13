import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SourceFile } from "./boundaries";

const ROOTS = ["products/genui", "products/lab", "studies"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".cache", "references"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);

export function readWorkspaceSources(repoRoot: string): SourceFile[] {
  const files: SourceFile[] = [];
  for (const root of ROOTS) {
    const absolute = path.join(repoRoot, root);
    if (!fs.existsSync(absolute)) continue;
    walk(absolute, repoRoot, files);
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

export function repoRootFrom(importMetaUrl: string): string {
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), "../../..");
}

function walk(dir: string, repoRoot: string, files: SourceFile[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), repoRoot, files);
      continue;
    }
    if (!EXTS.has(path.extname(entry.name))) continue;
    const absolute = path.join(dir, entry.name);
    const rel = path.relative(repoRoot, absolute).split(path.sep).join("/");
    files.push({ path: rel, source: fs.readFileSync(absolute, "utf8") });
  }
}
