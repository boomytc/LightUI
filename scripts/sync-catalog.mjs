import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studiesDir = path.join(root, "studies");
const outFile = path.join(root, "docs/catalog.md");

const slugs = (await readdir(studiesDir, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const rows = [];
for (const slug of slugs) {
  const file = path.join(studiesDir, slug, "study.json");
  const raw = await readFile(file, "utf8").catch(() => null);
  if (!raw) {
    console.error(`missing study.json: ${slug}`);
    process.exitCode = 1;
    continue;
  }
  const meta = JSON.parse(raw);
  if (meta.slug !== slug) {
    console.error(`slug mismatch: folder=${slug} study.json=${meta.slug}`);
    process.exitCode = 1;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.created ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(meta.updated ?? "")) {
    console.error(`missing created/updated (YYYY-MM-DD): ${slug}`);
    process.exitCode = 1;
  }
  rows.push(meta);
}

rows.sort((a, b) => {
  const rank = { active: 0, draft: 1, retired: 2 };
  const byStatus = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
  if (byStatus !== 0) return byStatus;
  const byUpdated = String(b.updated ?? "").localeCompare(String(a.updated ?? ""));
  if (byUpdated !== 0) return byUpdated;
  return String(a.slug).localeCompare(String(b.slug));
});

const table = [
  "| Slug | Idea | Status | Created | Updated |",
  "| --- | --- | --- | --- | --- |",
  ...rows.map((m) => {
    const idea = m.summary.replace(/\|/g, "\\|");
    return `| [${m.slug}](../studies/${m.slug}/) | ${idea} | ${m.status} | ${m.created} | ${m.updated} |`;
  }),
].join("\n");

const md = `# Study Catalog

Generated from \`studies/*/study.json\`. Edit the JSON, then run \`make catalog\`.

The lab at \`products/lab\` discovers the same files with \`import.meta.glob\`.
Do not keep a second registry.

${table}

## How to read a row

- **Idea** is the transferable rule, not the demo skin.
- **Updated** is the day to bump when the study changes. The lab sorts by it.
`;

await writeFile(outFile, md);
console.log(`wrote ${path.relative(root, outFile)} (${rows.length} studies)`);
