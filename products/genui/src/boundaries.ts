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
const STUDY_ENTRY_CSS_RULES =
  "studies/*/src/styles.css must contain only @import statements and comments; move study rules into a CSS file imported by StudyView or StageView";
const STUDY_ENTRY_CSS_RE = /^studies\/[^/]+\/src\/styles\.css$/;
const GLOBAL_ANCESTOR_CLASSES = new Set(["dark"]);
const CSS_IDENT_RE = /^[A-Za-z_-][A-Za-z0-9_-]*$/;
const MODULE_EXTENSIONS = [
  "",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  "/index.ts",
  "/index.tsx",
  "/index.js",
  "/index.jsx",
];

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

export function checkStudyStyles(files: readonly SourceFile[]): BoundaryViolation[] {
  const violations: BoundaryViolation[] = [];
  const fileByPath = new Map<string, SourceFile>();
  const studySlugs = new Set<string>();

  for (const file of files) {
    const normalized = normalize(file.path);
    fileByPath.set(normalized, { path: normalized, source: file.source });
    const slug = studySlugOf(normalized);
    if (slug) studySlugs.add(slug);
    if (STUDY_ENTRY_CSS_RE.test(normalized) && !hasOnlyCssImports(file.source)) {
      violations.push({
        path: normalized,
        specifier: "src/styles.css",
        reason: STUDY_ENTRY_CSS_RULES,
      });
    }
  }

  const classOwners = new Map<string, Map<string, string>>();
  const keyframeOwners = new Map<string, Map<string, string>>();

  for (const slug of [...studySlugs].sort()) {
    const importedCss = collectImportedStudyCss(slug, fileByPath);
    for (const cssPath of importedCss) {
      const cssFile = fileByPath.get(cssPath);
      if (!cssFile) continue;
      const symbols = extractCssSymbols(cssFile.source);
      for (const className of symbols.classes) {
        recordSymbolOwner(classOwners, className, slug, cssPath);
      }
      for (const keyframeName of symbols.keyframes) {
        recordSymbolOwner(keyframeOwners, keyframeName, slug, cssPath);
      }
    }
  }

  appendSymbolCollisions(
    violations,
    classOwners,
    (name) => `.${name}`,
    "duplicate top-level CSS class across studies",
  );
  appendSymbolCollisions(
    violations,
    keyframeOwners,
    (name) => `@keyframes ${name}`,
    "duplicate @keyframes across studies",
  );

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
  const stripped = stripCssComments(source);
  const specs: string[] = [];
  const re = /@import\s+(?:url\(\s*["']?([^"')\s]+)["']?\s*\)|["']([^"']+)["'])/g;
  for (const match of stripped.matchAll(re)) {
    const specifier = match[1] || match[2];
    if (specifier) specs.push(specifier);
  }
  return specs;
}

function stripCssComments(source: string): string {
  let out = "";
  let inQuote: "'" | '"' | null = null;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (inQuote) {
      out += ch;
      if (ch === "\\" && i + 1 < source.length) {
        i += 1;
        out += source[i];
      } else if (ch === inQuote) {
        inQuote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch;
      out += ch;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
        i += 1;
      }
      i += 1;
      out += " ";
      continue;
    }
    out += ch;
  }
  return out;
}

function hasOnlyCssImports(source: string): boolean {
  const stripped = stripCssComments(source);
  let i = 0;
  const len = stripped.length;
  while (i < len) {
    while (i < len && /\s/.test(stripped[i])) i += 1;
    if (i >= len) return true;
    const rest = stripped.slice(i);
    if (!/^@import(?:\s|["']|url\()/i.test(rest)) return false;
    i += "@import".length;
    let inQuote: "'" | '"' | null = null;
    let parenDepth = 0;
    let closed = false;
    while (i < len) {
      const ch = stripped[i];
      if (inQuote) {
        if (ch === "\\" && i + 1 < len) {
          i += 2;
          continue;
        }
        if (ch === inQuote) inQuote = null;
        i += 1;
        continue;
      }
      if (ch === "'" || ch === '"') {
        inQuote = ch;
        i += 1;
        continue;
      }
      if (ch === "(") {
        parenDepth += 1;
      } else if (ch === ")") {
        parenDepth = Math.max(0, parenDepth - 1);
      } else if (ch === "{" || ch === "}") {
        return false;
      } else if (ch === ";" && parenDepth === 0) {
        i += 1;
        closed = true;
        break;
      }
      i += 1;
    }
    if (!closed) return false;
  }
  return true;
}

function collectImportedStudyCss(slug: string, fileByPath: ReadonlyMap<string, SourceFile>): string[] {
  const prefix = `studies/${slug}/`;
  const visited = new Set<string>();
  const cssFiles = new Set<string>();
  const queue = [`${prefix}src/StudyView.tsx`, `${prefix}src/StageView.tsx`];

  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    if (visited.has(currentPath)) continue;
    const file = fileByPath.get(currentPath);
    if (!file) continue;
    visited.add(currentPath);
    if (currentPath.endsWith(".css") && !STUDY_ENTRY_CSS_RE.test(currentPath)) {
      cssFiles.add(currentPath);
    }
    for (const specifier of extractSpecifiers(currentPath, file.source)) {
      const { path: specPath } = splitSuffix(specifier);
      if (!specPath.startsWith(".")) continue;
      const base = resolveRelative(currentPath, specPath);
      const resolved = resolveInWorkspace(base, fileByPath);
      if (resolved && resolved.startsWith(prefix)) {
        queue.push(resolved);
      }
    }
  }

  return [...cssFiles].sort();
}

function resolveInWorkspace(base: string, fileByPath: ReadonlyMap<string, SourceFile>): string | null {
  for (const ext of MODULE_EXTENSIONS) {
    const candidate = `${base}${ext}`;
    if (fileByPath.has(candidate)) return candidate;
  }
  return null;
}

function recordSymbolOwner(
  owners: Map<string, Map<string, string>>,
  symbol: string,
  slug: string,
  filePath: string,
): void {
  let bySlug = owners.get(symbol);
  if (!bySlug) {
    bySlug = new Map<string, string>();
    owners.set(symbol, bySlug);
  }
  if (!bySlug.has(slug)) bySlug.set(slug, filePath);
}

function appendSymbolCollisions(
  violations: BoundaryViolation[],
  owners: ReadonlyMap<string, ReadonlyMap<string, string>>,
  formatSpecifier: (name: string) => string,
  label: string,
): void {
  for (const symbol of [...owners.keys()].sort()) {
    const bySlug = owners.get(symbol);
    if (!bySlug || bySlug.size < 2) continue;
    const entries = [...bySlug.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (let index = 1; index < entries.length; index += 1) {
      const [, filePath] = entries[index];
      const peers = entries
        .filter((_, peerIndex) => peerIndex !== index)
        .map(([, peerPath]) => peerPath)
        .join(", ");
      violations.push({
        path: filePath,
        specifier: formatSpecifier(symbol),
        reason: `${label} (also in ${peers})`,
      });
    }
  }
}

function extractCssSymbols(source: string): { classes: Set<string>; keyframes: Set<string> } {
  const stripped = stripCssComments(source);
  const classes = new Set<string>();
  const keyframes = new Set<string>();

  const blockStack: Array<"at" | "keyframes" | "rule"> = [];
  let keyframesDepth = 0;
  let ruleDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let inQuote: "'" | '"' | null = null;
  let prelude = "";

  for (let i = 0; i < stripped.length; i += 1) {
    const ch = stripped[i];
    if (inQuote) {
      if (ruleDepth === 0 && keyframesDepth === 0) prelude += ch;
      if (ch === "\\" && i + 1 < stripped.length) {
        i += 1;
        if (ruleDepth === 0 && keyframesDepth === 0) prelude += stripped[i];
      } else if (ch === inQuote) {
        inQuote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch;
      if (ruleDepth === 0 && keyframesDepth === 0) prelude += ch;
      continue;
    }
    if (ch === "(") {
      parenDepth += 1;
      if (ruleDepth === 0 && keyframesDepth === 0) prelude += ch;
      continue;
    }
    if (ch === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      if (ruleDepth === 0 && keyframesDepth === 0) prelude += ch;
      continue;
    }
    if (ch === "[") {
      bracketDepth += 1;
      if (ruleDepth === 0 && keyframesDepth === 0) prelude += ch;
      continue;
    }
    if (ch === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      if (ruleDepth === 0 && keyframesDepth === 0) prelude += ch;
      continue;
    }
    if (ch === "{" && parenDepth === 0 && bracketDepth === 0) {
      if (ruleDepth > 0 || keyframesDepth > 0) {
        blockStack.push("rule");
        ruleDepth += 1;
        prelude = "";
        continue;
      }
      const header = prelude.trim();
      prelude = "";
      const keyframeMatch = /^@(?:-webkit-)?keyframes\s+([A-Za-z_-][A-Za-z0-9_-]*)\b/i.exec(header);
      if (keyframeMatch) {
        keyframes.add(keyframeMatch[1]);
        blockStack.push("keyframes");
        keyframesDepth += 1;
      } else if (header.startsWith("@")) {
        blockStack.push("at");
      } else {
        if (header) extractTopLevelClasses(header, classes);
        blockStack.push("rule");
        ruleDepth += 1;
      }
      continue;
    }
    if (ch === "}" && parenDepth === 0 && bracketDepth === 0) {
      const popped = blockStack.pop();
      if (popped === "keyframes") keyframesDepth = Math.max(0, keyframesDepth - 1);
      else if (popped === "rule") ruleDepth = Math.max(0, ruleDepth - 1);
      prelude = "";
      continue;
    }
    if (ch === ";" && parenDepth === 0 && bracketDepth === 0 && ruleDepth === 0 && keyframesDepth === 0) {
      prelude = "";
      continue;
    }
    if (ruleDepth === 0 && keyframesDepth === 0) {
      prelude += ch;
    }
  }

  return { classes, keyframes };
}

function extractTopLevelClasses(selectorList: string, out: Set<string>): void {
  for (const complex of splitTopLevel(selectorList, ",")) {
    const compounds = splitCompounds(complex);
    for (const compound of compounds) {
      const found = extractPrimaryClassesFromCompound(compound);
      if (found.length > 0) {
        for (const name of found) out.add(name);
        break;
      }
    }
  }
}

function extractPrimaryClassesFromCompound(compound: string): string[] {
  const trimmed = compound.trim();
  if (!trimmed) return [];

  const leadingGroup = extractLeadingSelectorGroup(trimmed);
  if (leadingGroup !== null) {
    const nested = new Set<string>();
    extractTopLevelClasses(leadingGroup, nested);
    return [...nested];
  }

  const stripped = stripSelectorGroupsAndAttrs(trimmed);
  const tokens = stripped.match(/\.[^\s.#:\[>+~]+/g);
  if (!tokens) return [];

  for (const token of tokens) {
    const rawName = token.slice(1);
    if (rawName.includes("\\") || !CSS_IDENT_RE.test(rawName)) continue;
    if (GLOBAL_ANCESTOR_CLASSES.has(rawName)) continue;
    return [rawName];
  }
  return [];
}

function extractLeadingSelectorGroup(compound: string): string | null {
  const match = /^:(?:is|where)\(/i.exec(compound);
  if (!match) return null;
  let depth = 0;
  let inQuote: "'" | '"' | null = null;
  for (let i = match[0].length - 1; i < compound.length; i += 1) {
    const ch = compound[i];
    if (inQuote) {
      if (ch === "\\" && i + 1 < compound.length) i += 1;
      else if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch;
      continue;
    }
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) return compound.slice(match[0].length, i);
    }
  }
  return null;
}

function stripSelectorGroupsAndAttrs(compound: string): string {
  let out = "";
  let inQuote: "'" | '"' | null = null;
  let parenDepth = 0;
  let bracketDepth = 0;
  for (let i = 0; i < compound.length; i += 1) {
    const ch = compound[i];
    if (inQuote) {
      if (ch === "\\" && i + 1 < compound.length) {
        i += 1;
      } else if (ch === inQuote) {
        inQuote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch;
      continue;
    }
    if (ch === "(") {
      parenDepth += 1;
      continue;
    }
    if (ch === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (ch === "[") {
      bracketDepth += 1;
      continue;
    }
    if (ch === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (parenDepth === 0 && bracketDepth === 0) {
      out += ch;
    }
  }
  return out;
}

function splitTopLevel(input: string, delimiter: string): string[] {
  const parts: string[] = [];
  let inQuote: "'" | '"' | null = null;
  let parenDepth = 0;
  let bracketDepth = 0;
  let current = "";
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (inQuote) {
      current += ch;
      if (ch === "\\" && i + 1 < input.length) {
        i += 1;
        current += input[i];
      } else if (ch === inQuote) {
        inQuote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch;
      current += ch;
      continue;
    }
    if (ch === "(") parenDepth += 1;
    else if (ch === ")") parenDepth = Math.max(0, parenDepth - 1);
    else if (ch === "[") bracketDepth += 1;
    else if (ch === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (ch === delimiter && parenDepth === 0 && bracketDepth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}

function splitCompounds(selector: string): string[] {
  const parts: string[] = [];
  let inQuote: "'" | '"' | null = null;
  let parenDepth = 0;
  let bracketDepth = 0;
  let current = "";
  for (let i = 0; i < selector.length; i += 1) {
    const ch = selector[i];
    if (inQuote) {
      current += ch;
      if (ch === "\\" && i + 1 < selector.length) {
        i += 1;
        current += selector[i];
      } else if (ch === inQuote) {
        inQuote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch;
      current += ch;
      continue;
    }
    if (ch === "(") parenDepth += 1;
    else if (ch === ")") parenDepth = Math.max(0, parenDepth - 1);
    else if (ch === "[") bracketDepth += 1;
    else if (ch === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (parenDepth === 0 && bracketDepth === 0 && /[\s>+~]/.test(ch)) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
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
