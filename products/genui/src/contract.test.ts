import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { diffComponents, type NamedComponent } from "./contract-diff";
import { extractSpecifiers } from "./boundaries";
import { Text } from "./components/Text";
import { PROTOCOL_VERSION, registry } from "./index";

const contractPath = new URL(`../contract/${PROTOCOL_VERSION}/components.json`, import.meta.url);

type ContractFile = {
  protocol: string;
  version: string;
  components: NamedComponent[];
};

function loadContract(): ContractFile {
  const parsed: unknown = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  assert.ok(parsed && typeof parsed === "object" && !Array.isArray(parsed));
  const record = parsed as Record<string, unknown>;
  assert.equal(record.protocol, "lightui.genui");
  assert.equal(record.version, PROTOCOL_VERSION);
  assert.ok(Array.isArray(record.components));
  return {
    protocol: "lightui.genui",
    version: PROTOCOL_VERSION,
    components: record.components as NamedComponent[],
  };
}

describe("contract v0", () => {
  it("matches the registry exactly", () => {
    const contract = loadContract();
    const errors = diffComponents([...registry], contract.components);
    assert.deepEqual(errors, [], errors.join("\n"));
    const text = registry.find((entry) => entry.name === "Text");
    assert.equal(text?.component, Text);
  });

  it("fails when the registry drops a contract component", () => {
    const contract = loadContract();
    const errors = diffComponents([], contract.components);
    assert.ok(errors.some((error) => error.includes("Text")));
    assert.ok(errors.some((error) => error.includes("missing from the registry")));
  });

  it("fails when a props schema drifts", () => {
    const contract = loadContract();
    const drifted = contract.components.map((component) => ({
      ...component,
      props: { ...(component.props as Record<string, unknown>), additionalProperties: true },
    }));
    const errors = diffComponents([...registry], drifted);
    assert.ok(errors.length > 0, errors.join("\n"));
    assert.ok(
      errors.some(
        (error) => error.includes("props schema mismatch") || error.includes("additionalProperties"),
      ),
    );
  });

  it("does not import the contract into the implementation", () => {
    for (const name of ["index.ts", "registry.ts", "components/Text.tsx"]) {
      const source = fs.readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
      const specs = extractSpecifiers(`products/genui/src/${name}`, source);
      assert.equal(
        specs.some((specifier) => specifier.includes("contract")),
        false,
        `${name} imports the contract`,
      );
    }
  });

  it("uses design tokens and does not start a theme", () => {
    const tokens = fs.readFileSync(new URL("../../../design/tokens.css", import.meta.url), "utf8");
    const componentsDir = new URL("./components/", import.meta.url);
    const componentFiles = fs.readdirSync(componentsDir).filter((name) => name.endsWith(".tsx"));
    assert.ok(componentFiles.length > 0);
    for (const name of componentFiles) {
      const source = fs.readFileSync(new URL(name, componentsDir), "utf8");
      const used = [...source.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((match) => match[1] ?? "");
      assert.ok(used.length > 0, `${name} does not reference a design token`);
      for (const variable of used) {
        assert.match(tokens, new RegExp(`${variable}\\s*:`), variable);
      }
      assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b/);
      assert.doesNotMatch(source, /@theme/);
    }

    const packageRoot = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
    const cssFiles = walkFiles(packageRoot).filter((file) => file.endsWith(".css"));
    for (const file of cssFiles) {
      const source = fs.readFileSync(file, "utf8");
      assert.doesNotMatch(source, /@theme/);
    }
  });
});

function walkFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else files.push(absolute);
  }
  return files;
}
