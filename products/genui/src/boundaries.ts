import ts from "typescript";

export type SourceFile = {
  path: string;
  source: string;
};

export type BoundaryViolation = {
  path: string;
  specifier: string;
  reason: string;
};

const PUBLIC_ENTRY = "@lightui/genui";

const PUBLIC_INDEXES = new Set([
  "products/genui/src/index.ts",
  "products/genui/src/index.tsx",
  "products/genui/src/index.js",
  "products/genui/src/index.mjs",
  "products/genui",
]);

const GENUI_IMPORT =
  "products/genui must not import studies/* or products/lab";
const DEEP_IMPORT =
  "import @lightui/genui only; deep imports into products/genui are not allowed";
const CONTRACT_IMPORT =
  "read products/genui/contract as files; do not import it";

export function checkBoundaries(files: readonly SourceFile[]): BoundaryViolation[] {
  const violations: BoundaryViolation[] = [];
  for (const file of files) {
    for (const specifier of extractSpecifiers(file.path, file.source)) {
      const reason = violationReason(file.path, specifier);
      if (reason) violations.push({ path: file.path, specifier, reason });
    }
  }
  return violations;
}

export function extractSpecifiers(filePath: string, source: string): string[] {
  if (filePath.endsWith(".css")) return extractCssImports(source);
  return extractTsSpecifiers(filePath, source);
}

function violationReason(filePath: string, specifier: string): string | null {
  const zone = zoneOf(filePath);
  if (!zone) return null;
  if (targetsContract(filePath, specifier)) return CONTRACT_IMPORT;
  if (zone === "genui") {
    return targetsStudiesOrLab(filePath, specifier) ? GENUI_IMPORT : null;
  }
  if (targetsGenui(filePath, specifier) && !isPublicGenuiEntry(filePath, specifier)) {
    return DEEP_IMPORT;
  }
  return null;
}

function zoneOf(filePath: string): "genui" | "lab" | "study" | null {
  const normalized = normalize(filePath);
  if (isUnder(normalized, "products/genui")) return "genui";
  if (isUnder(normalized, "products/lab")) return "lab";
  if (isUnder(normalized, "studies")) return "study";
  return null;
}

function targetsStudiesOrLab(filePath: string, specifier: string): boolean {
  const pkg = lightuiPackage(specifier);
  if (pkg !== null) return pkg !== "genui";
  const resolved = resolveSpecifier(filePath, specifier);
  if (!resolved) return false;
  return isUnder(resolved, "studies") || isUnder(resolved, "products/lab");
}

function targetsGenui(filePath: string, specifier: string): boolean {
  const pkg = lightuiPackage(specifier);
  if (pkg === "genui") return true;
  const resolved = resolveSpecifier(filePath, specifier);
  return resolved !== null && isUnder(resolved, "products/genui");
}

function targetsContract(filePath: string, specifier: string): boolean {
  const { path: specPath } = splitSuffix(specifier);
  if (specPath === PUBLIC_ENTRY) return false;
  if (specPath.startsWith(`${PUBLIC_ENTRY}/contract`) || specPath.includes("/contract/")) {
    const pkg = lightuiPackage(specifier);
    if (pkg === "genui" || specPath.includes("products/genui/contract")) return true;
  }
  const resolved = resolveSpecifier(filePath, specifier);
  return resolved !== null && isUnder(resolved, "products/genui/contract");
}

function isPublicGenuiEntry(filePath: string, specifier: string): boolean {
  const { path: specPath, suffix } = splitSuffix(specifier);
  if (suffix) return false;
  if (specPath === PUBLIC_ENTRY) return true;
  const resolved = resolveSpecifier(filePath, specifier);
  return resolved !== null && PUBLIC_INDEXES.has(resolved);
}

function lightuiPackage(specifier: string): string | null {
  const { path: specPath } = splitSuffix(specifier);
  if (!specPath.startsWith("@lightui/")) return null;
  const rest = specPath.slice("@lightui/".length);
  const name = rest.split("/")[0];
  return name || "";
}

function resolveSpecifier(filePath: string, specifier: string): string | null {
  const { path: specPath } = splitSuffix(specifier);
  if (specPath.startsWith(".")) return resolveRelative(filePath, specPath);
  if (
    specPath.startsWith("products/") ||
    specPath.startsWith("studies/") ||
    specPath.startsWith("design/")
  ) {
    return normalize(specPath);
  }
  return null;
}

function resolveRelative(filePath: string, specifier: string): string {
  const stack = normalize(filePath).split("/").slice(0, -1);
  for (const part of specifier.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return stack.join("/");
}

function splitSuffix(specifier: string): { path: string; suffix: string } {
  const match = /^([^?#]*)(.*)$/.exec(specifier);
  return { path: match?.[1] ?? specifier, suffix: match?.[2] ?? "" };
}

function isUnder(resolved: string, prefix: string): boolean {
  return resolved === prefix || resolved.startsWith(`${prefix}/`);
}

function normalize(filePath: string): string {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function extractCssImports(source: string): string[] {
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const specs: string[] = [];
  const re = /@import\s+(?:url\(\s*["']?([^"')\s]+)["']?\s*\)|["']([^"']+)["'])/g;
  for (const match of stripped.matchAll(re)) {
    const specifier = match[1] || match[2];
    if (specifier) specs.push(specifier);
  }
  return specs;
}

function extractTsSpecifiers(filePath: string, source: string): string[] {
  const kind = scriptKind(filePath);
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, kind);
  const specs: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specs.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) specs.push(arg.text);
    }
    if (ts.isCallExpression(node) && isImportMetaGlob(node)) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) specs.push(arg.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return specs;
}

function isImportMetaGlob(node: ts.CallExpression): boolean {
  const expr = node.expression;
  if (!ts.isPropertyAccessExpression(expr) || expr.name.text !== "glob") return false;
  return ts.isMetaProperty(expr.expression) && expr.expression.keywordToken === ts.SyntaxKind.ImportKeyword;
}

function scriptKind(filePath: string): ts.ScriptKind {
  if (filePath.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (filePath.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs") || filePath.endsWith(".cjs")) {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}
