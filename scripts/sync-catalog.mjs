import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studiesDir = path.join(root, "studies");
const catalogFile = path.join(root, "docs/catalog.md");
const readmeFile = path.join(root, "README.md");
const check = process.argv.includes("--check");

const CATEGORIES = [
  { id: "pointer", nameZh: "指针与手势", nameEn: "Pointer & Gesture" },
  { id: "layout", nameZh: "结构与导览", nameEn: "Layout & Navigation" },
  { id: "controls", nameZh: "表单与控件", nameEn: "Controls & Forms" },
  { id: "feedback", nameZh: "反馈与打断", nameEn: "Feedback & Interruption" },
  { id: "craft", nameZh: "工程与几何", nameEn: "Craft & Geometry" },
];
const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.id));

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function cell(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}

function trimOuterNewlines(value) {
  return String(value).replace(/^\n+/, "").replace(/\n+$/, "");
}

function replaceMarker(source, name, body) {
  const start = `<!-- catalog:${name} -->`;
  const end = `<!-- /catalog:${name} -->`;
  const startAt = source.indexOf(start);
  const endAt = source.indexOf(end, startAt + start.length);
  if (startAt === -1 || endAt === -1) {
    fail(`missing README marker <!-- catalog:${name} --> … <!-- /catalog:${name} -->`);
    return null;
  }
  if (source.indexOf(start, startAt + start.length) !== -1) {
    fail(`duplicate README marker catalog:${name}`);
    return null;
  }
  const lineStart = source.lastIndexOf("\n", endAt - 1) + 1;
  const prefix = source.slice(lineStart, endAt);
  const indent = /^[ \t]*$/.test(prefix) ? prefix : "";
  return (
    source.slice(0, startAt + start.length) +
    "\n" +
    trimOuterNewlines(body) +
    "\n" +
    indent +
    source.slice(endAt)
  );
}

function firstDiff(actual, expected) {
  const a = actual.split("\n");
  const b = expected.split("\n");
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      const clip = (line) => {
        if (line === undefined) return "(missing)";
        if (line.length === 0) return "(blank)";
        return line.slice(0, 180);
      };
      return `line ${i + 1}\n  have: ${clip(a[i])}\n  want: ${clip(b[i])}`;
    }
  }
  return "contents differ";
}

const slugs = (await readdir(studiesDir, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const rows = [];
for (const slug of slugs) {
  const file = path.join(studiesDir, slug, "study.json");
  const raw = await readFile(file, "utf8").catch(() => null);
  if (!raw) {
    fail(`missing study.json: ${slug}`);
    continue;
  }
  const meta = JSON.parse(raw);
  if (meta.slug !== slug) {
    fail(`slug mismatch: folder=${slug} study.json=${meta.slug}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.created ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(meta.updated ?? "")) {
    fail(`missing created/updated (YYYY-MM-DD): ${slug}`);
  }
  if (!VALID_CATEGORIES.has(meta.category)) {
    fail(`invalid or missing category: ${slug} -> ${meta.category ?? "(missing)"}`);
  }
  rows.push(meta);
}

const known = new Set(rows.map((m) => m.slug));
for (const m of rows) {
  for (const link of Array.isArray(m.links) ? m.links : []) {
    if (!link?.slug) continue;
    if (!known.has(link.slug)) {
      fail(`broken link: ${m.slug} -> ${link.slug}`);
    }
    if (link.rel && link.rel !== "after" && link.rel !== "contrast") {
      fail(`bad rel on ${m.slug}: ${link.rel}`);
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);

rows.sort((a, b) => {
  const rank = { active: 0, draft: 1, retired: 2 };
  const byStatus = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
  if (byStatus !== 0) return byStatus;
  const byUpdated = String(b.updated ?? "").localeCompare(String(a.updated ?? ""));
  if (byUpdated !== 0) return byUpdated;
  return String(a.slug).localeCompare(String(b.slug));
});

const table = [
  "| Slug | Category | Idea | Status | Created | Updated |",
  "| --- | --- | --- | --- | --- | --- |",
  ...rows.map((m) => {
    const idea = cell(m.summary);
    return `| [${m.slug}](../studies/${m.slug}/) | ${m.category} | ${idea} | ${m.status} | ${m.created} | ${m.updated} |`;
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

const catalog = `# Study Catalog

Generated from \`studies/*/study.json\`. Edit the JSON, then run \`make catalog\`.
\`make catalog-check\` fails when this file or the README catalog markers drift.

The lab at \`products/lab\` discovers the same files with \`import.meta.glob\`.
Category chips read \`category\` on each study. Do not keep a second registry.

${table}

## Questions

Each study answers one question (\`asks\`). Edges live on the study as \`links\`.

${questions || "_No questions yet._"}

## Edges

${edges.join("\n") || "_No edges yet._"}

## How to read a row

- **Category** is \`pointer\` | \`layout\` | \`controls\` | \`feedback\` | \`craft\`.
- **Idea** is the transferable rule, not the demo skin.
- **Updated** is the day to bump when the study changes. The lab sorts by it.
- Do not keep a neighbor census in \`idea.md\`. The graph is \`asks\` + \`links\`.
`;

const total = rows.length;
const active = rows.filter((m) => m.status === "active").length;
const badgeLabel = active === total ? `${total}_Active` : `${active}_Active`;

const badge = `  <a href="docs/catalog.md"><img src="https://img.shields.io/badge/Studies-${badgeLabel}-10B981?style=flat-square" alt="Studies" /></a>`;

const byCategory = new Map(CATEGORIES.map((c) => [c.id, []]));
for (const row of [...rows].sort((a, b) => String(a.slug).localeCompare(String(b.slug)))) {
  byCategory.get(row.category)?.push(row);
}

const featuredSections = CATEGORIES.filter((c) => byCategory.get(c.id).length > 0).map((c) => {
  const lines = [
    `| 课题 (Study) | 核心规则 |`,
    `| :--- | :--- |`,
    ...byCategory.get(c.id).map((m) => `| **[${m.slug}](studies/${m.slug}/)** ${cell(m.title)} | ${cell(m.summary)} |`),
  ];
  return `### ${c.nameZh} (${c.nameEn})\n\n${lines.join("\n")}`;
});

const featured = [
  `LightUI 目前收录了 **${total} 个经过深思与实战检验的交互课题**（完整列表见 [docs/catalog.md](docs/catalog.md)）：`,
  "",
  "下表按每个 `study.json` 的 `category` 与 `summary` 生成。改课题后运行 `make catalog`，不要手改表。",
  "",
  featuredSections.join("\n\n"),
].join("\n");

const tree = `\`\`\`
LightUI/
├── design/                   # 🎨 设计代币源：色板、字体、圆角（tokens.css, base.css）
├── docs/                     # 📚 架构与设计契约
│   ├── catalog.md            #   由 study.json 自动汇总生成的完整索引
│   ├── conventions.md        #   如何新增 Study 与设计规范
│   ├── study-contract.md     #   Study 契约接口定义
│   └── writing.md            #   设计笔记写作约定
├── products/lab/             # 🔬 Lab 综合站点（首页 / 作品列表 / 知识图谱 / 思考笔记）
├── studies/                  # 🧪 ${total} 个独立的交互研究课题目录
│   ├── intent-cascade/
│   ├── path-morph/
│   ├── confirm-taxonomy/
│   └── ...
├── writing/                  # ✍️ 公开设计与交互工程笔记（中英双语）
├── skills/                   # 🤖 仓库 Agent 规范与工作流技能
├── scripts/                  # 🛠️ 自动化同步与静帧抓取脚本
│   ├── sync-catalog.mjs      #   自动扫描 study.json 并生成 catalog.md 与 README 标记块
│   └── capture-stage.py      #   自动化 Playwright 舞台静帧导出
├── package.json              # 根目录 npm workspace 编排配置
└── Makefile                  # 统一工作流命令入口
\`\`\``;

const readmeRaw = await readFile(readmeFile, "utf8");
let readme = readmeRaw;
for (const [name, body] of [
  ["badge", badge],
  ["featured", featured],
  ["tree", tree],
]) {
  const next = replaceMarker(readme, name, body);
  if (!next) process.exit(process.exitCode || 1);
  readme = next;
}

if (check) {
  const existingCatalog = await readFile(catalogFile, "utf8").catch(() => "");
  let stale = false;
  if (existingCatalog !== catalog) {
    stale = true;
    console.error(`docs/catalog.md is out of date\n${firstDiff(existingCatalog, catalog)}`);
  }
  if (readme !== readmeRaw) {
    stale = true;
    console.error(`README.md catalog markers are out of date\n${firstDiff(readmeRaw, readme)}`);
  }
  if (stale) {
    console.error("Run make catalog.");
    process.exit(1);
  }
  console.log(`catalog check ok (${total} studies)`);
} else {
  await writeFile(catalogFile, catalog);
  await writeFile(readmeFile, readme);
  console.log(`wrote docs/catalog.md and README markers (${total} studies)`);
}
