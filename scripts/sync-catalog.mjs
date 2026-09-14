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

const known = new Set(rows.map((m) => m.slug));
for (const m of rows) {
  for (const link of Array.isArray(m.links) ? m.links : []) {
    if (!link?.slug) continue;
    if (!known.has(link.slug)) {
      console.error(`broken link: ${m.slug} -> ${link.slug}`);
      process.exitCode = 1;
    }
    if (link.rel && link.rel !== "after" && link.rel !== "contrast") {
      console.error(`bad rel on ${m.slug}: ${link.rel}`);
      process.exitCode = 1;
    }
  }
}

const categoriesFile = path.join(root, "products/lab/src/lib/categories.ts");
const categoriesRaw = await readFile(categoriesFile, "utf8").catch(() => null);
if (!categoriesRaw) {
  console.error("missing products/lab/src/lib/categories.ts");
  process.exitCode = 1;
} else {
  const mapBlockMatch = categoriesRaw.match(/export const SLUG_CATEGORY_MAP[^{]*\{([\s\S]*?)\};/);
  if (!mapBlockMatch) {
    console.error("missing SLUG_CATEGORY_MAP in products/lab/src/lib/categories.ts");
    process.exitCode = 1;
  } else {
    const VALID_CATEGORIES = new Set(["pointer", "layout", "controls", "feedback", "craft"]);
    const mapEntries = [...mapBlockMatch[1].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)];
    const mappedKeys = new Set(mapEntries.map((m) => m[1]));
    const slugSet = new Set(slugs);

    for (const slug of slugs) {
      if (!mappedKeys.has(slug)) {
        console.error(`missing category mapping in products/lab/src/lib/categories.ts: ${slug}`);
        process.exitCode = 1;
      }
    }

    for (const [, key, cat] of mapEntries) {
      if (!slugSet.has(key)) {
        console.error(`orphan category mapping in products/lab/src/lib/categories.ts: ${key}`);
        process.exitCode = 1;
      }
      if (!VALID_CATEGORIES.has(cat)) {
        console.error(`invalid category id in products/lab/src/lib/categories.ts: ${key} -> ${cat}`);
        process.exitCode = 1;
      }
    }
  }
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

const questions = rows
  .filter((m) => m.asks)
  .map((m) => `- **${m.title}** (\`${m.slug}\`) — ${m.asks}`)
  .join("\n");

const edges = [];
for (const m of rows) {
  for (const link of Array.isArray(m.links) ? m.links : []) {
    if (!link?.slug || !link.rel) continue;
    const when = link.when ? ` — ${link.when}` : "";
    edges.push(`- \`${m.slug}\` ${link.rel} \`${link.slug}\`${when}`);
  }
}

const md = `# Study Catalog

Generated from \`studies/*/study.json\`. Edit the JSON, then run \`make catalog\`.

The lab at \`products/lab\` discovers the same files with \`import.meta.glob\`.
Do not keep a second registry.

${table}

## Questions

Each study answers one question (\`asks\`). Edges live on the study as \`links\`.

${questions || "_No questions yet._"}

## Edges

${edges.join("\n") || "_No edges yet._"}

## How to read a row

- **Idea** is the transferable rule, not the demo skin.
- **Updated** is the day to bump when the study changes. The lab sorts by it.
- Do not keep a neighbor census in \`idea.md\`. The graph is \`asks\` + \`links\`.
`;

await writeFile(outFile, md);
console.log(`wrote ${path.relative(root, outFile)} (${rows.length} studies)`);
