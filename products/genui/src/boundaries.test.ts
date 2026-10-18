import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { checkBoundaries, extractSpecifiers } from "./boundaries";
import { readWorkspaceSources, repoRootFrom } from "./read-sources";

const GENUI = "products/genui/src/index.ts";
const LAB = "products/lab/src/App.tsx";
const STUDY = "studies/intent-cascade/src/App.tsx";

function violationsFor(path: string, source: string) {
  return checkBoundaries([{ path, source }]);
}

function assertViolation(path: string, source: string, reason: string) {
  const violations = violationsFor(path, source);
  assert.equal(violations.length, 1, JSON.stringify(violations));
  assert.equal(violations[0]?.reason, reason);
}

describe("genui boundary", () => {
  it("rejects a relative import of a study", () => {
    assertViolation(
      GENUI,
      `import { StudyView } from "../../../studies/intent-cascade/src/StudyView";\n`,
      "products/genui must not import studies/* or products/lab",
    );
  });

  it("rejects a relative import of lab", () => {
    assertViolation(
      GENUI,
      `import { App } from "../../lab/src/App";\n`,
      "products/genui must not import studies/* or products/lab",
    );
  });

  it("rejects another @lightui package", () => {
    const violations = violationsFor(
      GENUI,
      `import { App } from "@lightui/lab";\nexport type { StudyView } from "@lightui/intent-cascade";\n`,
    );
    assert.equal(violations.length, 2);
    assert.ok(
      violations.every((item) => item.reason === "products/genui must not import studies/* or products/lab"),
    );
  });

  it("rejects a stylesheet that pulls in a study", () => {
    assertViolation(
      "products/genui/src/styles.css",
      `@import "../../../studies/intent-cascade/src/styles.css";\n`,
      "products/genui must not import studies/* or products/lab",
    );
  });

  it("allows design tokens and internal modules", () => {
    const violations = violationsFor(
      GENUI,
      `import "../../../design/tokens.css";\nimport { Text } from "./components/Text";\n`,
    );
    assert.deepEqual(violations, []);
  });

  it("ignores imports that appear only in comments or strings", () => {
    const violations = violationsFor(
      GENUI,
      `
        // import { StudyView } from "../../../studies/intent-cascade/src/StudyView";
        /* import { App } from "@lightui/lab"; */
        const sample = "import { App } from \\"../../lab/src/App\\"";
      `,
    );
    assert.deepEqual(violations, []);
  });
});

describe("lab and study imports of genui", () => {
  it("allows the package public entry", () => {
    assert.deepEqual(violationsFor(LAB, `import { Text } from "@lightui/genui";\n`), []);
    assert.deepEqual(violationsFor(STUDY, `import { registry } from "@lightui/genui";\n`), []);
  });

  it("allows a relative import of the public file", () => {
    assert.deepEqual(
      violationsFor(LAB, `import { Text } from "../../genui/src/index.ts";\n`),
      [],
    );
    assert.deepEqual(
      violationsFor(STUDY, `import { Text } from "../../../products/genui/src/index.ts";\n`),
      [],
    );
  });

  it("rejects a deep package subpath, including the index subpath", () => {
    assertViolation(
      LAB,
      `import { Text } from "@lightui/genui/src/index.ts";\n`,
      "import @lightui/genui only; deep imports into products/genui are not allowed",
    );
    assertViolation(
      STUDY,
      `import { registry } from "@lightui/genui/src/registry";\n`,
      "import @lightui/genui only; deep imports into products/genui are not allowed",
    );
  });

  it("rejects a relative import of an internal module", () => {
    assertViolation(
      LAB,
      `import { Text } from "../../genui/src/components/Text";\n`,
      "import @lightui/genui only; deep imports into products/genui are not allowed",
    );
    assertViolation(
      STUDY,
      `import { Text } from "../../../products/genui/src/components/Text";\n`,
      "import @lightui/genui only; deep imports into products/genui are not allowed",
    );
  });

  it("rejects importing the contract", () => {
    assertViolation(
      LAB,
      `import catalog from "../../genui/contract/v0/components.json";\n`,
      "read products/genui/contract as files; do not import it",
    );
    assertViolation(
      GENUI,
      `import catalog from "../contract/v0/components.json";\n`,
      "read products/genui/contract as files; do not import it",
    );
  });

  it("still allows lab to glob studies", () => {
    const violations = violationsFor(
      "products/lab/src/lib/catalog.ts",
      `const views = import.meta.glob("../../../../studies/*/src/StudyView.tsx", { eager: true });\n`,
    );
    assert.deepEqual(violations, []);
  });

  it("rejects a glob of genui internals", () => {
    assertViolation(
      "products/lab/src/lib/catalog.ts",
      `const views = import.meta.glob("../../../genui/src/components/*.tsx", { eager: true });\n`,
      "import @lightui/genui only; deep imports into products/genui are not allowed",
    );
  });

  it("rejects a multiline import and a dynamic import", () => {
    assertViolation(
      LAB,
      `import {\n  Text,\n} from "@lightui/genui/src/components/Text";\n`,
      "import @lightui/genui only; deep imports into products/genui are not allowed",
    );
    assertViolation(
      STUDY,
      `const load = () => import("@lightui/genui/src/registry");\n`,
      "import @lightui/genui only; deep imports into products/genui are not allowed",
    );
  });
});

describe("workspace sources", () => {
  it("matches the package exports to the public entry", () => {
    const pkg = JSON.parse(
      fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { name: string; exports: Record<string, string> };
    assert.equal(pkg.name, "@lightui/genui");
    assert.deepEqual(Object.keys(pkg.exports), ["."]);
    assert.equal(pkg.exports["."], "./src/index.ts");
  });

  it("keeps the public entry on the component and the registry", () => {
    const source = fs.readFileSync(new URL("./index.ts", import.meta.url), "utf8");
    assert.deepEqual([...new Set(extractSpecifiers(GENUI, source))].sort(), [
      "./components/Text",
      "./registry",
      "./render-route",
      "./sandbox",
    ]);
  });

  it("accepts the current workspace", () => {
    const sources = readWorkspaceSources(repoRootFrom(import.meta.url));
    // Without a floor an empty scan would silently satisfy deepEqual([], []).
    assert.ok(sources.length > 500, `scanned only ${sources.length} files`);
    const violations = checkBoundaries(sources);
    assert.deepEqual(
      violations,
      [],
      violations.map((item) => `${item.path}: ${item.reason} (${item.specifier})`).join("\n"),
    );
  });
});
