import fs from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { diffComponents, type NamedComponent } from "./contract-diff";
import {
  PROTOCOL_VERSION,
  RENDER_ROUTE_ERRORS,
  ROUTE_CODE_FENCE,
  ROUTE_ENVELOPE,
  ROUTE_ENVELOPE_IS_COMPONENT,
  ROUTE_PARTIAL_JSON_ACTION,
  ROUTE_PARTIAL_JSON_IS_ERROR,
  ROUTE_SURFACES,
  SANDBOX_CALLBACKS,
  SANDBOX_FIELD_ORDER,
  SANDBOX_FIELDS,
  SANDBOX_GENERATING_KEY,
  SANDBOX_HEIGHT,
  SANDBOX_TRUST,
  registry,
} from "./index";
import { readWorkspaceSources, repoRootFrom } from "./read-sources";

const LITERAL_COLOR_RE =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab)\s*\(|@theme\b/i;
const VAR_TOKEN_RE = /var\(\s*(--[a-z0-9-]+)\s*(?:,[^)]+)?\)/g;
const CSS_DECL_TOKEN_RE = /(--[a-z0-9-]+)\s*:/g;

const errors: string[] = [];
const metadata = { protocol: "lightui.genui", version: PROTOCOL_VERSION };
const components = readContract("components.json");
if (!Array.isArray(components.components) || !components.components.every(isNamedComponent)) {
  errors.push("components.json: components must contain name, description, and props");
} else {
  compare("components.json", components, { ...metadata, components: components.components });
  errors.push(...diffComponents(registry, components.components));
}

for (const entry of registry) {
  if (typeof entry.component !== "function") errors.push(`${entry.name}: component must be callable`);
}

compare("render-route.json", readContract("render-route.json"), {
  ...metadata,
  envelopeIsComponent: ROUTE_ENVELOPE_IS_COMPONENT,
  surfaces: ROUTE_SURFACES,
  codeFence: ROUTE_CODE_FENCE,
  envelope: ROUTE_ENVELOPE,
  partialJson: { isError: ROUTE_PARTIAL_JSON_IS_ERROR, action: ROUTE_PARTIAL_JSON_ACTION },
  errors: RENDER_ROUTE_ERRORS,
});

compare("sandbox.json", readContract("sandbox.json"), {
  ...metadata,
  fieldOrder: SANDBOX_FIELD_ORDER,
  fields: SANDBOX_FIELDS,
  generating: SANDBOX_GENERATING_KEY,
  callbacks: SANDBOX_CALLBACKS,
  height: SANDBOX_HEIGHT,
  trust: SANDBOX_TRUST,
});

const tokens = fs.readFileSync(new URL("../../../design/tokens.css", import.meta.url), "utf8");
const tokenNames = new Set([...tokens.matchAll(CSS_DECL_TOKEN_RE)].map((match) => match[1]));
const sources = readWorkspaceSources(repoRootFrom(import.meta.url));
for (const file of sources.filter((file) => file.path.startsWith("products/genui/"))) {
  const stripped = file.source.replace(/\/\*[\s\S]*?\*\//g, "");
  if (file.path.endsWith(".css")) {
    if (/@theme\b/.test(stripped)) {
      errors.push(`${file.path}: use design/tokens.css instead of a local theme`);
    }
    for (const match of stripped.matchAll(CSS_DECL_TOKEN_RE)) {
      const declared = match[1];
      if (tokenNames.has(declared)) {
        errors.push(`${file.path}: do not redefine design/tokens.css variable ${declared}`);
      }
    }
    for (const match of stripped.matchAll(VAR_TOKEN_RE)) {
      const variable = match[1];
      if (!tokenNames.has(variable)) errors.push(`${file.path}: unknown design token ${variable}`);
    }
    if (LITERAL_COLOR_RE.test(stripped)) {
      errors.push(`${file.path}: use design tokens instead of literal colors or a local theme`);
    }
    continue;
  }
  if (!file.path.startsWith("products/genui/src/components/") || !file.path.endsWith(".tsx")) continue;
  const used = [...stripped.matchAll(VAR_TOKEN_RE)].map((match) => match[1]);
  if (used.length === 0) errors.push(`${file.path}: reference design/tokens.css variables`);
  for (const variable of used) {
    if (!tokenNames.has(variable)) errors.push(`${file.path}: unknown design token ${variable}`);
  }
  if (LITERAL_COLOR_RE.test(stripped)) {
    errors.push(`${file.path}: use design tokens instead of literal colors or a local theme`);
  }
}

for (const error of errors) console.error(error);
process.exitCode = errors.length === 0 ? 0 : 1;

function readContract(name: string): Record<string, unknown> {
  const document: unknown = JSON.parse(
    fs.readFileSync(new URL(`../contract/${PROTOCOL_VERSION}/${name}`, import.meta.url), "utf8"),
  );
  if (!isRecord(document)) throw new Error(`${name}: contract document must be an object`);
  return document;
}

function compare(name: string, actual: unknown, expected: unknown): void {
  if (isDeepStrictEqual(actual, expected)) return;
  const diffs = diffPaths(actual, expected, "");
  if (diffs.length === 0) {
    errors.push(`contract/${PROTOCOL_VERSION}/${name}: document differs from the implementation`);
    return;
  }
  for (const detail of diffs.slice(0, 8)) {
    errors.push(`contract/${PROTOCOL_VERSION}/${name}: ${detail}`);
  }
}

function diffPaths(actual: unknown, expected: unknown, prefix: string): string[] {
  if (isDeepStrictEqual(actual, expected)) return [];
  const label = prefix || "$";
  if (Array.isArray(actual) && Array.isArray(expected)) {
    const diffs: string[] = [];
    const max = Math.max(actual.length, expected.length);
    for (let i = 0; i < max; i += 1) {
      if (i >= actual.length) diffs.push(`${label}[${i}] missing in contract`);
      else if (i >= expected.length) diffs.push(`${label}[${i}] extra in contract`);
      else diffs.push(...diffPaths(actual[i], expected[i], `${label}[${i}]`));
    }
    return diffs;
  }
  if (isRecord(actual) && isRecord(expected)) {
    const diffs: string[] = [];
    const keys = new Set([...Object.keys(actual), ...Object.keys(expected)]);
    for (const key of keys) {
      const next = prefix ? `${prefix}.${key}` : key;
      if (!Object.hasOwn(actual, key)) diffs.push(`${next} missing in contract`);
      else if (!Object.hasOwn(expected, key)) diffs.push(`${next} unexpected in contract`);
      else diffs.push(...diffPaths(actual[key], expected[key], next));
    }
    return diffs;
  }
  return [`${label} differs (contract=${JSON.stringify(actual)}, impl=${JSON.stringify(expected)})`];
}

function isNamedComponent(value: unknown): value is NamedComponent {
  return isRecord(value) && typeof value.name === "string" &&
    typeof value.description === "string" && "props" in value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
