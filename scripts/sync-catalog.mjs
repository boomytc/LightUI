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
  rows.push(meta);
}

const table = [
  "| Slug | Idea | Origin | Status |",
  "| --- | --- | --- | --- |",
  ...rows.map((m) => {
    const idea = m.summary.replace(/\|/g, "\\|");
    const origin = m.origin?.label ?? "";
    return `| [${m.slug}](../studies/${m.slug}/) | ${idea} | ${origin} | ${m.status} |`;
  }),
].join("\n");

const md = `# Study Catalog

Generated from \`studies/*/study.json\`. Edit the JSON, then run \`make catalog\`.

The lab at \`products/lab\` discovers the same files with \`import.meta.glob\`.
Do not keep a second registry.

${table}

## How to read a row

- **Idea** is the transferable rule, not the demo skin.
- **Origin** names the source we extracted from, or \`original\`.
- Host chrome from an external sandbox (auth, PWA, deploy adapters) is not part of the study.
`;

await writeFile(outFile, md);
console.log(`wrote ${path.relative(root, outFile)} (${rows.length} studies)`);
