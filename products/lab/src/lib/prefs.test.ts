import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { LOCALE_KEY, PREFS_EVENT, THEME_KEY } from "./prefs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

function studySources(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".cache") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) studySources(full, out);
    else if (/\.[tj]sx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("prefs literals", () => {
  it("keeps the inline boot script on the same storage keys", () => {
    // The script runs before the module graph, so it must repeat the literals.
    const html = fs.readFileSync(path.join(root, "products/lab/index.html"), "utf8");
    assert.equal(html.includes(`"${THEME_KEY}"`), true, "index.html reads the theme key");
    assert.equal(html.includes(`"${LOCALE_KEY}"`), true, "index.html reads the locale key");
  });

  it("keeps every study listener on the same prefs event", () => {
    const files = studySources(path.join(root, "studies"));
    assert.ok(files.length > 0, "found study sources");
    const listeners = files.filter((file) => fs.readFileSync(file, "utf8").includes("lightui:"));
    assert.ok(listeners.length > 0, "found study prefs listeners");
    for (const file of listeners) {
      const source = fs.readFileSync(file, "utf8");
      assert.equal(
        source.includes(PREFS_EVENT),
        true,
        `${path.relative(root, file)} listens on a stale prefs event`,
      );
    }
  });
});
