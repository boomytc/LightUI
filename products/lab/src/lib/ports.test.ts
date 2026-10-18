import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const studiesDir = path.join(root, "studies");

function configPorts(slug: string): { server: number; preview: number } {
  const source = fs.readFileSync(path.join(studiesDir, slug, "vite.config.ts"), "utf8");
  const server = source.match(/server:\s*\{[\s\S]*?\bport:\s*(\d+)/)?.[1];
  const preview = source.match(/preview:\s*\{[\s\S]*?\bport:\s*(\d+)/)?.[1];
  assert.ok(server && preview, `${slug} declares server and preview ports`);
  return { server: Number(server), preview: Number(preview) };
}

const slugs = fs
  .readdirSync(studiesDir)
  .filter((slug) => fs.existsSync(path.join(studiesDir, slug, "vite.config.ts")));

describe("study dev ports", () => {
  it("gives every study its own server and preview port", () => {
    const servers = new Map<number, string>();
    const previews = new Map<number, string>();
    for (const slug of slugs) {
      const { server, preview } = configPorts(slug);
      assert.equal(
        servers.has(server),
        false,
        `${slug} reuses server port ${server} (already ${servers.get(server)})`,
      );
      assert.equal(
        previews.has(preview),
        false,
        `${slug} reuses preview port ${preview} (already ${previews.get(preview)})`,
      );
      servers.set(server, slug);
      previews.set(preview, slug);
      assert.equal(preview, server - 1000, `${slug}: preview should be server - 1000`);
    }
    assert.ok(slugs.length >= 50, `expected the study set, found ${slugs.length}`);
  });

  it("matches the ledger in docs/conventions.md", () => {
    const doc = fs.readFileSync(path.join(root, "docs/conventions.md"), "utf8");
    const start = doc.indexOf("Lab is");
    const end = doc.indexOf("Next free");
    assert.ok(start > 0 && end > start, "conventions.md still carries the port ledger");
    const ledger = [...doc.slice(start, end).matchAll(/`(\d{4})`\s+([a-z][a-z0-9-]+)/g)].map((m) => ({
      port: Number(m[1]),
      slug: m[2]!,
    }));
    assert.equal(ledger.length, slugs.length, "the ledger names every study once");
    for (const { port, slug } of ledger) {
      assert.equal(configPorts(slug).server, port, `${slug} should listen on ${port}`);
    }
  });
});
