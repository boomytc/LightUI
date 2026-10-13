import { checkBoundaries } from "./boundaries";
import { readWorkspaceSources, repoRootFrom } from "./read-sources";

const violations = checkBoundaries(readWorkspaceSources(repoRootFrom(import.meta.url)));
if (violations.length === 0) {
  process.exit(0);
}

for (const violation of violations) {
  console.error(`${violation.path}: ${violation.reason} (${violation.specifier})`);
}
process.exit(1);
