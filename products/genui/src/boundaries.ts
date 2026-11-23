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

const GENUI_IMPORT =
  "products/genui must not import studies/* or products/lab";
const DEEP_IMPORT =
  "import @lightui/genui only; deep or relative imports into products/genui are not allowed";
const CONTRACT_IMPORT =
  "read products/genui/contract as files; do not import it";
const STUDY_TO_STUDY_IMPORT =
  "studies stay independent and must not import another study";
const STUDY_TO_LAB_IMPORT =
  "studies must not import products/lab";

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
  if (targetsGenui(filePath, specifier) && !isPublicGenuiEntry(specifier)) {
    return DEEP_IMPORT;
  }
  if (zone === "study") {
    if (targetsLab(filePath, specifier)) return STUDY_TO_LAB_IMPORT;
    const ownSlug = studySlugOf(filePath);
    if (ownSlug && targetsOtherStudy(filePath, specifier, ownSlug)) {
      return STUDY_TO_STUDY_IMPORT;
    }
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

function studySlugOf(filePath: string): string | null {
  const normalized = normalize(filePath);
  if (!normalized.startsWith("studies/")) return null;
  const slug = normalized.slice("studies/".length).split("/")[0];
  return slug || null;
}

function targetsStudiesOrLab(filePath: string, specifier: string): boolean {
  const pkg = lightuiPackage(specifier);
  if (pkg !== null) return pkg !== "genui";
  const resolved = resolveSpecifier(filePath, specifier);
  if (!resolved) return false;
  return isUnder(resolved, "studies") || isUnder(resolved, "products/lab");
}

function targetsLab(filePath: string, specifier: string): boolean {
  const pkg = lightuiPackage(specifier);
  if (pkg === "lab") return true;
  const resolved = resolveSpecifier(filePath, specifier);
  return resolved !== null && isUnder(resolved, "products/lab");
}

function targetsOtherStudy(filePath: string, specifier: string, ownSlug: string): boolean {
  const pkg = lightuiPackage(specifier);
  if (pkg !== null) {
    return pkg !== "genui" && pkg !== "lab" && pkg !== ownSlug;
  }
  const resolved = resolveSpecifier(filePath, specifier);
  if (!resolved || !isUnder(resolved, "studies")) return false;
  if (resolved === "studies") return true;
  const targetSlug = studySlugOf(resolved);
  return targetSlug !== null && targetSlug !== ownSlug;
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

function isPublicGenuiEntry(specifier: string): boolean {
  const { path: specPath, suffix } = splitSuffix(specifier);
  return !suffix && specPath === PUBLIC_ENTRY;
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
  const stripped = specPath.startsWith("!") ? specPath.slice(1) : specPath;
  if (stripped.startsWith(".")) return resolveRelative(filePath, stripped);
  if (
    stripped.startsWith("products/") ||
    stripped.startsWith("studies/") ||
    stripped.startsWith("design/")
  ) {
    return normalize(stripped);
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
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      const value = readStaticString(node.moduleSpecifier);
      if (value !== null) specs.push(value);
    }
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      const value = readStaticString(node.argument.literal);
      if (value !== null) specs.push(value);
    }
    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression
    ) {
      const value = readStaticString(node.moduleReference.expression);
      if (value !== null) specs.push(value);
    }
    if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword || isRequireCall(node)) {
        const value = node.arguments[0] ? readStaticString(node.arguments[0]) : null;
        if (value !== null) specs.push(value);
      }
      if (isImportMetaGlob(node)) {
        const arg = node.arguments[0];
        if (arg) collectGlobSpecifiers(arg, specs);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return specs;
}

function readStaticString(node: ts.Node): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

function isRequireCall(node: ts.CallExpression): boolean {
  return ts.isIdentifier(node.expression) && node.expression.text === "require";
}

function collectGlobSpecifiers(arg: ts.Expression, specs: string[]): void {
  const single = readStaticString(arg);
  if (single !== null) {
    specs.push(single);
    return;
  }
  if (ts.isArrayLiteralExpression(arg)) {
    for (const element of arg.elements) {
      const value = readStaticString(element);
      if (value !== null) specs.push(value);
    }
  }
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
