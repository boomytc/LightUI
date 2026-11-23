import fs from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { checkBoundaries, checkStudyStyles } from "./boundaries";
import { readWorkspaceSources, repoRootFrom } from "./read-sources";

const sources = readWorkspaceSources(repoRootFrom(import.meta.url));
const errors = [...checkBoundaries(sources), ...checkStudyStyles(sources)].map(
  (violation) => `${violation.path}: ${violation.reason} (${violation.specifier})`,
);

for (const file of sources) {
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$|\/(?:__tests__|__mocks__|__snapshots__)\//.test(file.path)) {
    errors.push(`${file.path}: move temporary verification assets to the system temporary directory`);
  }
}

const pkg: unknown = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
if (
  !pkg || typeof pkg !== "object" || !("name" in pkg) || pkg.name !== "@lightui/genui" ||
  !("exports" in pkg) || !isDeepStrictEqual(pkg.exports, { ".": "./src/index.ts" })
) {
  errors.push("products/genui/package.json: expose only @lightui/genui through ./src/index.ts");
}

for (const error of errors) console.error(error);
process.exitCode = errors.length === 0 ? 0 : 1;
