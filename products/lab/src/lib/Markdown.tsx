import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { messages } from "./i18n";
import { navigate } from "./nav";
import type { Locale } from "./prefs";

type ListItem = {
  text: string;
  children: Block[];
};

type Block =
  | { type: "h"; level: 1 | 2 | 3; text: string; id?: string }
  | { type: "p"; text: string }
  | { type: "hr" }
  | { type: "quote"; text: string }
  | { type: "ul"; items: ListItem[] }
  | { type: "ol"; start?: number; items: ListItem[] }
  | { type: "pre"; code: string; lang: string }
  | { type: "math"; expr: string }
  | { type: "table"; headers: string[]; rows: string[][] };

const DEF = /^\*\*(.+?)\*\*[：:]\s*(.*)$/;

function asDefs(items: ListItem[]): { name: string; text: string }[] | null {
  if (items.length === 0 || items.some((item) => item.children.length > 0)) return null;
  const defs = items.map((item) => {
    const match = DEF.exec(item.text);
    return match?.[1] != null ? { name: match[1], text: match[2] ?? "" } : null;
  });
  if (defs.some((d) => !d)) return null;
  return defs as { name: string; text: string }[];
}

const MATH_SYMBOLS: Record<string, string> = {
  cdot: "·",
  times: "×",
  leftarrow: "←",
  to: "→",
  rightarrow: "→",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  approx: "≈",
  ne: "≠",
  neq: "≠",
  pm: "±",
  infty: "∞",
  circ: "°",
  Delta: "Δ",
  zeta: "ζ",
  theta: "θ",
  sigma: "σ",
  lambda: "λ",
  pi: "π",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  omega: "ω",
  "%": "%",
  "{": "{",
  "}": "}",
  ",": "\u2009",
  ";": "\u2004",
  " ": " ",
};

const MATH_FUNCTIONS = new Set([
  "ln",
  "log",
  "min",
  "max",
  "sin",
  "cos",
  "tan",
  "exp",
  "lim",
  "round",
]);

function readBraced(src: string, start: number): { content: string; next: number } {
  let i = start;
  while (i < src.length && src[i] === " ") i += 1;
  if (src[i] === "{") {
    let depth = 1;
    let j = i + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === "\\" && j + 1 < src.length) {
        j += 2;
        continue;
      }
      if (src[j] === "{") depth += 1;
      else if (src[j] === "}") depth -= 1;
      j += 1;
    }
    return { content: src.slice(i + 1, Math.max(i + 1, j - 1)), next: j };
  }
  if (src[i] === "\\") {
    const cmdMatch = /^\\([A-Za-z]+|.)/.exec(src.slice(i));
    if (cmdMatch) {
      return { content: cmdMatch[0], next: i + cmdMatch[0].length };
    }
  }
  return { content: src[i] ?? "", next: Math.min(src.length, i + 1) };
}

function renderMathNodes(expr: string, keyPrefix = "m"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let k = 0;
  let prevWasOpOrStart = true;

  const pushSpacedOp = (symbol: string) => {
    nodes.push(
      <span key={`${keyPrefix}-${k++}`} className="lab-math-op">
        {symbol}
      </span>,
    );
    prevWasOpOrStart = true;
  };

  while (i < expr.length) {
    const ch = expr[i]!;

    if (ch === " " || ch === "\t" || ch === "\n") {
      i += 1;
      continue;
    }

    if (ch === "^" || ch === "_") {
      const isSup = ch === "^";
      const { content, next } = readBraced(expr, i + 1);
      i = next;
      if (isSup && content.trim() === "\\circ") {
        nodes.push(<span key={`${keyPrefix}-${k++}`}>°</span>);
      } else if (isSup) {
        nodes.push(
          <sup key={`${keyPrefix}-${k++}`} className="lab-math-sup">
            {renderMathNodes(content, `${keyPrefix}-sup-${k}`)}
          </sup>,
        );
      } else {
        nodes.push(
          <sub key={`${keyPrefix}-${k++}`} className="lab-math-sub">
            {renderMathNodes(content, `${keyPrefix}-sub-${k}`)}
          </sub>,
        );
      }
      prevWasOpOrStart = false;
      continue;
    }

    if (ch === "\\") {
      const cmdMatch = /^\\([A-Za-z]+|.)/.exec(expr.slice(i));
      const cmd = cmdMatch?.[1] ?? "";
      i += cmdMatch ? cmdMatch[0].length : 1;

      if (cmd === "frac") {
        const num = readBraced(expr, i);
        const den = readBraced(expr, num.next);
        i = den.next;
        nodes.push(
          <span key={`${keyPrefix}-${k++}`} className="lab-frac">
            <span className="lab-frac-num">{renderMathNodes(num.content, `${keyPrefix}-fn-${k}`)}</span>
            <span className="lab-frac-den">{renderMathNodes(den.content, `${keyPrefix}-fd-${k}`)}</span>
          </span>,
        );
        prevWasOpOrStart = false;
        continue;
      }

      if (cmd === "sqrt") {
        const arg = readBraced(expr, i);
        i = arg.next;
        nodes.push(
          <span key={`${keyPrefix}-${k++}`} className="lab-sqrt">
            <span className="lab-sqrt-sign" aria-hidden="true">√</span>
            <span className="lab-sqrt-body">{renderMathNodes(arg.content, `${keyPrefix}-sq-${k}`)}</span>
          </span>,
        );
        prevWasOpOrStart = false;
        continue;
      }

      if (cmd === "text" || cmd === "mathrm" || cmd === "operatorname") {
        const arg = readBraced(expr, i);
        i = arg.next;
        nodes.push(
          <span key={`${keyPrefix}-${k++}`} className="lab-math-text">
            {arg.content}
          </span>,
        );
        prevWasOpOrStart = false;
        continue;
      }

      if (cmd === "tilde") {
        const arg = readBraced(expr, i);
        i = arg.next;
        nodes.push(
          <span key={`${keyPrefix}-${k++}`} className="lab-math-var">
            {renderMathNodes(arg.content, `${keyPrefix}-tl-${k}`)}
            {"\u0303"}
          </span>,
        );
        prevWasOpOrStart = false;
        continue;
      }

      if (MATH_FUNCTIONS.has(cmd)) {
        nodes.push(
          <span key={`${keyPrefix}-${k++}`} className="lab-math-fn">
            {cmd}
          </span>,
        );
        prevWasOpOrStart = false;
        continue;
      }

      if (cmd in MATH_SYMBOLS) {
        const sym = MATH_SYMBOLS[cmd]!;
        if (
          cmd === "cdot" ||
          cmd === "times" ||
          cmd === "leftarrow" ||
          cmd === "to" ||
          cmd === "rightarrow" ||
          cmd === "le" ||
          cmd === "leq" ||
          cmd === "ge" ||
          cmd === "geq" ||
          cmd === "approx" ||
          cmd === "ne" ||
          cmd === "neq"
        ) {
          pushSpacedOp(sym);
        } else {
          nodes.push(<span key={`${keyPrefix}-${k++}`}>{sym}</span>);
          prevWasOpOrStart = false;
        }
        continue;
      }

      nodes.push(<span key={`${keyPrefix}-${k++}`}>{cmd}</span>);
      prevWasOpOrStart = false;
      continue;
    }

    if (ch === "{") {
      const group = readBraced(expr, i);
      i = group.next;
      nodes.push(
        <span key={`${keyPrefix}-${k++}`}>
          {renderMathNodes(group.content, `${keyPrefix}-g-${k}`)}
        </span>,
      );
      prevWasOpOrStart = false;
      continue;
    }

    if (ch === "=" || ch === "+" || ch === "<" || ch === ">") {
      pushSpacedOp(ch);
      i += 1;
      continue;
    }

    if (ch === "-") {
      if (prevWasOpOrStart) {
        nodes.push(<span key={`${keyPrefix}-${k++}`}>−</span>);
      } else {
        pushSpacedOp("−");
      }
      i += 1;
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "|") {
      nodes.push(<span key={`${keyPrefix}-${k++}`}>{ch}</span>);
      prevWasOpOrStart = ch !== "|";
      i += 1;
      continue;
    }

    if (ch === ")" || ch === "]") {
      nodes.push(<span key={`${keyPrefix}-${k++}`}>{ch}</span>);
      prevWasOpOrStart = false;
      i += 1;
      continue;
    }

    if (ch === "," || ch === ":") {
      nodes.push(
        <span key={`${keyPrefix}-${k++}`} className="mr-[0.18em]">
          {ch}
        </span>,
      );
      prevWasOpOrStart = true;
      i += 1;
      continue;
    }

    if (ch === "/") {
      nodes.push(
        <span key={`${keyPrefix}-${k++}`} className="mx-[0.1em]">
          /
        </span>,
      );
      prevWasOpOrStart = true;
      i += 1;
      continue;
    }

    const numMatch = /^\d+(?:\.\d+)?/.exec(expr.slice(i));
    if (numMatch) {
      nodes.push(
        <span key={`${keyPrefix}-${k++}`} className="lab-math-num">
          {numMatch[0]}
        </span>,
      );
      i += numMatch[0].length;
      prevWasOpOrStart = false;
      continue;
    }

    const wordMatch = /^[A-Za-z]+/.exec(expr.slice(i));
    if (wordMatch) {
      nodes.push(
        <var key={`${keyPrefix}-${k++}`} className="lab-math-var">
          {wordMatch[0]}
        </var>,
      );
      i += wordMatch[0].length;
      prevWasOpOrStart = false;
      continue;
    }

    nodes.push(<span key={`${keyPrefix}-${k++}`}>{ch}</span>);
    i += 1;
    prevWasOpOrStart = false;
  }

  return nodes;
}

function MathExpr({ expr, block = false }: { expr: string; block?: boolean }) {
  const rendered = renderMathNodes(expr.trim());
  if (block) {
    return (
      <div className="lab-math-block overflow-x-auto rounded-xl border border-border/70 bg-surface-2/50 px-5 py-3.5 text-center text-[15px] text-fg">
        <span className="lab-math inline-flex items-center">{rendered}</span>
      </div>
    );
  }
  return <span className="lab-math">{rendered}</span>;
}

function findInlineClose(text: string, start: number, marker: string): number {
  let i = start;
  while (i < text.length) {
    if (text[i] === "`") {
      const endCode = text.indexOf("`", i + 1);
      if (endCode !== -1) {
        i = endCode + 1;
        continue;
      }
    }
    if (text[i] === "$" && text[i + 1] !== "$") {
      const endMath = findMathClose(text, i + 1);
      if (endMath !== -1) {
        i = endMath + 1;
        continue;
      }
    }
    if (text.startsWith(marker, i)) {
      if (marker === "*" && text[i + 1] === "*") {
        i += 2;
        continue;
      }
      if (marker === "*" && text[i - 1] === " ") {
        i += 1;
        continue;
      }
      return i;
    }
    i += 1;
  }
  return -1;
}

function findMathClose(text: string, start: number): number {
  if (start >= text.length || text[start] === " ") return -1;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === "\\" && i + 1 < text.length) {
      i += 1;
      continue;
    }
    if (text[i] === "$") {
      if (i > start && text[i - 1] !== " ") return i;
      return -1;
    }
  }
  return -1;
}

function findLinkEnd(text: string, start: number): { label: string; href: string; next: number } | null {
  let i = start + 1;
  let bracketDepth = 1;
  while (i < text.length && bracketDepth > 0) {
    if (text[i] === "`") {
      const endCode = text.indexOf("`", i + 1);
      if (endCode !== -1) {
        i = endCode + 1;
        continue;
      }
    }
    if (text[i] === "[") bracketDepth += 1;
    else if (text[i] === "]") bracketDepth -= 1;
    i += 1;
  }
  if (bracketDepth !== 0 || text[i] !== "(") return null;
  const label = text.slice(start + 1, i - 1);
  let j = i + 1;
  let parenDepth = 1;
  while (j < text.length && parenDepth > 0) {
    if (text[j] === "(") parenDepth += 1;
    else if (text[j] === ")") parenDepth -= 1;
    j += 1;
  }
  if (parenDepth !== 0) return null;
  const href = text.slice(i + 1, j - 1).trim();
  if (!href) return null;
  return { label, href, next: j };
}

function inline(text: string, keyPrefix = "in"): ReactNode[] {
  const parts: ReactNode[] = [];
  let plain = "";
  let i = 0;
  let key = 0;

  const flushPlain = () => {
    if (plain) {
      parts.push(plain);
      plain = "";
    }
  };

  while (i < text.length) {
    // Line break tag (<br>, <br/>, <br />)
    if (text[i] === "<") {
      const brMatch = /^<br\s*\/?>/i.exec(text.slice(i));
      if (brMatch) {
        flushPlain();
        parts.push(<br key={`${keyPrefix}-${key++}`} />);
        i += brMatch[0].length;
        continue;
      }
    }

    // Inline code span
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i + 1) {
        flushPlain();
        parts.push(
          <code
            key={`${keyPrefix}-${key++}`}
            className="rounded-md border border-border/70 bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-fg"
          >
            {text.slice(i + 1, end)}
          </code>,
        );
        i = end + 1;
        continue;
      }
    }

    // Inline math $...$
    if (text[i] === "$" && text[i + 1] !== "$") {
      const end = findMathClose(text, i + 1);
      if (end > i + 1) {
        flushPlain();
        parts.push(<MathExpr key={`${keyPrefix}-${key++}`} expr={text.slice(i + 1, end)} />);
        i = end + 1;
        continue;
      }
    }

    // Markdown link [label](href)
    if (text[i] === "[") {
      const link = findLinkEnd(text, i);
      if (link) {
        flushPlain();
        const internal = link.href.startsWith("/");
        parts.push(
          <a
            key={`${keyPrefix}-${key++}`}
            href={link.href}
            className="font-medium text-accent underline-offset-2 hover:underline"
            onClick={
              internal
                ? (e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    navigate(link.href);
                  }
                : undefined
            }
          >
            {inline(link.label, `${keyPrefix}-a-${key}`)}
          </a>,
        );
        i = link.next;
        continue;
      }
    }

    // Bold **...**
    if (text.startsWith("**", i)) {
      const end = findInlineClose(text, i + 2, "**");
      if (end > i + 2) {
        flushPlain();
        parts.push(
          <strong key={`${keyPrefix}-${key++}`} className="font-semibold text-fg">
            {inline(text.slice(i + 2, end), `${keyPrefix}-b-${key}`)}
          </strong>,
        );
        i = end + 2;
        continue;
      }
    }

    // Strikethrough ~~...~~
    if (text.startsWith("~~", i)) {
      const end = findInlineClose(text, i + 2, "~~");
      if (end > i + 2) {
        flushPlain();
        parts.push(
          <del key={`${keyPrefix}-${key++}`} className="text-fg-subtle line-through">
            {inline(text.slice(i + 2, end), `${keyPrefix}-s-${key}`)}
          </del>,
        );
        i = end + 2;
        continue;
      }
    }

    // Italic *...*
    if (text[i] === "*" && text[i + 1] !== "*" && text[i + 1] !== " ") {
      const end = findInlineClose(text, i + 1, "*");
      if (end > i + 1) {
        flushPlain();
        parts.push(
          <em key={`${keyPrefix}-${key++}`} className="italic text-fg">
            {inline(text.slice(i + 1, end), `${keyPrefix}-i-${key}`)}
          </em>,
        );
        i = end + 1;
        continue;
      }
    }

    plain += text[i];
    i += 1;
  }

  flushPlain();
  return parts;
}

const PLAIN_CODE_LANGS = new Set(["text", "txt", "plain", "ascii", "markdown", "md"]);

function highlightCode(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:function|return|const|let|var|if|else|switch|case|break|for|while|import|export|from|type|interface|as|true|false|null|undefined|boolean|string|number|void)\b)|(\b\d+(?:\.\d+)?(?:ms|px|rem|ch|%)?\b)|(\b[A-Za-z_$][A-Za-z0-9_$]*(?=\s*\())/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(code)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(code.slice(lastIndex, match.index));
    }

    const [token, comment, str, keyword, num, func] = match;

    if (comment) {
      nodes.push(
        <span key={key++} className="italic text-white/40">
          {comment}
        </span>,
      );
    } else if (str) {
      nodes.push(
        <span key={key++} className="text-emerald-400">
          {str}
        </span>,
      );
    } else if (keyword) {
      nodes.push(
        <span key={key++} className="font-medium text-sky-300">
          {keyword}
        </span>,
      );
    } else if (num) {
      nodes.push(
        <span key={key++} className="text-amber-300">
          {num}
        </span>,
      );
    } else if (func) {
      nodes.push(
        <span key={key++} className="text-purple-300">
          {func}
        </span>,
      );
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < code.length) {
    nodes.push(code.slice(lastIndex));
  }

  return nodes;
}

export function CodeBlock({
  code,
  filename,
  lang,
  locale,
  copyLabel,
  copiedLabel,
}: {
  code: string;
  filename?: string;
  lang?: string;
  locale?: Locale;
  copyLabel?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const localizedCopy = locale ? messages(locale) : null;
  const resolvedCopyLabel = copyLabel ?? localizedCopy?.copyCode ?? "Copy";
  const resolvedCopiedLabel = copiedLabel ?? localizedCopy?.copiedCode ?? "Copied";
  const normalizedLang = (lang ?? "").trim().toLowerCase();
  const headerLabel = filename ?? (normalizedLang || (locale === "zh" ? "代码" : "code"));
  const shouldHighlight = !normalizedLang || !PLAIN_CODE_LANGS.has(normalizedLang);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-[#12141a] p-4 text-[#e2e4ea] shadow-card sm:p-5">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-mono text-[11px] tracking-wider text-white/55">
          {headerLabel}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? resolvedCopiedLabel : resolvedCopyLabel}</span>
        </button>
      </div>
      <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-[#dcdfe6]">
        {shouldHighlight ? highlightCode(code) : code}
      </pre>
    </div>
  );
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim();
  const inner = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
  const content = inner.endsWith("|") ? inner.slice(0, -1) : inner;
  const cells: string[] = [];
  let buf = "";
  let inCode = false;
  let inMath = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i]!;
    if (ch === "\\" && i + 1 < content.length && content[i + 1] === "|") {
      buf += "|";
      i += 1;
      continue;
    }
    if (ch === "`" && !inMath) {
      inCode = !inCode;
      buf += ch;
      continue;
    }
    if (ch === "$" && !inCode) {
      inMath = !inMath;
      buf += ch;
      continue;
    }
    if (ch === "|" && !inCode && !inMath) {
      cells.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  cells.push(buf.trim());
  return cells;
}

function slugifyHeading(text: string): string {
  const plain = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~$]/g, "")
    .trim()
    .toLowerCase();
  const slug = plain
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

const HR_RE = /^\s*(?:-(?:\s*-){2,}|\*(?:\s*\*){2,}|_(?:\s*_){2,})\s*$/;
const UL_RE = /^([ \t]*)[-*]\s+(.*)$/;
const OL_RE = /^([ \t]*)(\d+)\.\s+(.*)$/;
const BLOCK_START_RE = /^(#{1,3}\s+|\s*```|\s*\$\$|\||\s*[-*]\s+|\s*\d+\.\s+|\s*>\s+)/;

function lineIndent(line: string): number {
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === " ") count += 1;
    else if (line[i] === "\t") count += 2;
    else break;
  }
  return count;
}

function stripIndent(line: string, columns: number): string {
  let i = 0;
  let removed = 0;
  while (i < line.length && removed < columns) {
    if (line[i] === " ") {
      removed += 1;
      i += 1;
    } else if (line[i] === "\t") {
      removed += 2;
      i += 1;
    } else {
      break;
    }
  }
  return line.slice(i);
}

function dedentLines(lines: string[]): string[] {
  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    const indent = lineIndent(line);
    if (indent < minIndent) minIndent = indent;
  }
  if (!Number.isFinite(minIndent) || minIndent <= 0) return lines;
  return lines.map((line) => (line.trim() ? stripIndent(line, minIndent) : ""));
}

function matchListItem(
  line: string,
  kind: "ul" | "ol",
): { indent: number; number?: number; text: string } | null {
  if (HR_RE.test(line)) return null;
  if (kind === "ul") {
    const match = UL_RE.exec(line);
    if (!match) return null;
    return { indent: lineIndent(match[1] ?? ""), text: match[2] ?? "" };
  }
  const match = OL_RE.exec(line);
  if (!match) return null;
  return { indent: lineIndent(match[1] ?? ""), number: Number(match[2]), text: match[3] ?? "" };
}

function isNestedBlockStart(trimmed: string): boolean {
  return (
    HR_RE.test(trimmed) ||
    trimmed.startsWith("```") ||
    trimmed.startsWith("$$") ||
    trimmed.startsWith("> ") ||
    trimmed.startsWith("|") ||
    /^[-*]\s+/.test(trimmed) ||
    /^\d+\.\s+/.test(trimmed)
  );
}

function parseList(
  lines: string[],
  startIndex: number,
  kind: "ul" | "ol",
  baseIndent: number,
  headingCounts: Map<string, number>,
): { block: Extract<Block, { type: "ul" | "ol" }>; nextIndex: number } {
  const items: ListItem[] = [];
  let startNumber: number | undefined;
  let i = startIndex;

  while (i < lines.length) {
    const matched = matchListItem(lines[i] ?? "", kind);
    if (!matched || matched.indent !== baseIndent) break;
    if (kind === "ol" && startNumber === undefined) {
      startNumber = matched.number;
    }

    const textLines: string[] = [matched.text];
    const childLines: string[] = [];
    let hasChildBlocks = false;
    let inFence = false;
    let inMath = false;
    i += 1;

    while (i < lines.length) {
      const cur = lines[i] ?? "";
      const curTrimmed = cur.trim();

      if (inFence) {
        childLines.push(cur);
        if (curTrimmed.startsWith("```")) inFence = false;
        i += 1;
        continue;
      }
      if (inMath) {
        childLines.push(cur);
        if (curTrimmed.endsWith("$$")) inMath = false;
        i += 1;
        continue;
      }

      if (!curTrimmed) {
        let look = i + 1;
        while (look < lines.length && !(lines[look] ?? "").trim()) look += 1;
        const nextLine = lines[look];
        if (nextLine !== undefined && lineIndent(nextLine) > baseIndent) {
          hasChildBlocks = true;
          childLines.push("");
          i += 1;
          continue;
        }
        const sibling = nextLine !== undefined ? matchListItem(nextLine, kind) : null;
        if (sibling && sibling.indent === baseIndent) {
          i = look;
        }
        break;
      }

      const curIndent = lineIndent(cur);
      if (curIndent <= baseIndent) break;

      if (!hasChildBlocks && !isNestedBlockStart(curTrimmed)) {
        textLines.push(curTrimmed);
      } else {
        hasChildBlocks = true;
        childLines.push(cur);
        if (curTrimmed.startsWith("```")) {
          inFence = true;
        } else if (curTrimmed.startsWith("$$") && !(curTrimmed.length > 4 && curTrimmed.endsWith("$$"))) {
          inMath = true;
        }
      }
      i += 1;
    }

    const children = childLines.length > 0 ? parseLines(dedentLines(childLines), headingCounts) : [];
    items.push({ text: textLines.join(" ").trim(), children });
  }

  if (kind === "ol") {
    return { block: { type: "ol", start: startNumber, items }, nextIndex: i };
  }
  return { block: { type: "ul", items }, nextIndex: i };
}

function parseLines(lines: string[], headingCounts: Map<string, number>): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  const flushPara = (buf: string[]) => {
    const text = buf.join(" ").trim();
    if (text) blocks.push({ type: "p", text });
    buf.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim().split(/\s+/)[0] ?? "";
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        buf.push(lines[i] ?? "");
        i += 1;
      }
      i += 1;
      blocks.push({ type: "pre", code: buf.join("\n"), lang });
      continue;
    }

    if (trimmed.startsWith("$$")) {
      if (trimmed.length > 4 && trimmed.endsWith("$$")) {
        blocks.push({ type: "math", expr: trimmed.slice(2, -2).trim() });
        i += 1;
        continue;
      }
      const buf: string[] = [];
      const firstRest = trimmed.slice(2).trim();
      if (firstRest) buf.push(firstRest);
      i += 1;
      while (i < lines.length) {
        const cur = (lines[i] ?? "").trim();
        if (cur.endsWith("$$")) {
          const tail = cur.slice(0, -2).trim();
          if (tail) buf.push(tail);
          i += 1;
          break;
        }
        buf.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push({ type: "math", expr: buf.join("\n").trim() });
      continue;
    }

    if (/^\s*>\s+/.test(line)) {
      const quotes: string[] = [];
      while (i < lines.length && /^\s*>\s+/.test(lines[i] ?? "")) {
        quotes.push((lines[i] ?? "").replace(/^\s*>\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: quotes.join(" ") });
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading?.[1] && heading[2]) {
      const level = heading[1].length as 1 | 2 | 3;
      let id: string | undefined;
      if (level >= 2) {
        const base = slugifyHeading(heading[2]);
        const seen = headingCounts.get(base) ?? 0;
        headingCounts.set(base, seen + 1);
        id = seen === 0 ? base : `${base}-${seen + 1}`;
      }
      blocks.push({ type: "h", level, text: heading[2], id });
      i += 1;
      continue;
    }

    if (line.startsWith("|") && (lines[i + 1] ?? "").includes("---")) {
      const headers = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("|")) {
        rows.push(splitTableRow(lines[i] ?? ""));
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    const ulMatch = matchListItem(line, "ul");
    if (ulMatch) {
      const parsed = parseList(lines, i, "ul", ulMatch.indent, headingCounts);
      blocks.push(parsed.block);
      i = parsed.nextIndex;
      continue;
    }

    const olMatch = matchListItem(line, "ol");
    if (olMatch) {
      const parsed = parseList(lines, i, "ol", olMatch.indent, headingCounts);
      blocks.push(parsed.block);
      i = parsed.nextIndex;
      continue;
    }

    if (!trimmed) {
      i += 1;
      continue;
    }

    const para: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !HR_RE.test(lines[i] ?? "") &&
      !BLOCK_START_RE.test(lines[i] ?? "")
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    flushPara(para);
  }

  return blocks;
}

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  return parseLines(lines, new Map<string, number>());
}

function renderBlocks(blocks: Block[], locale?: Locale, nested = false): ReactNode {
  return blocks.map((block, i) => {
    if (block.type === "h") {
      const cls =
        block.level === 1
          ? "text-[1.7rem] font-semibold tracking-tight text-fg"
          : block.level === 2
            ? "pt-6 text-[1.2rem] font-semibold tracking-tight text-fg"
            : "pt-3 text-[1.05rem] font-semibold tracking-tight text-fg";
      const Tag = `h${block.level}` as const;
      return (
        <Tag key={i} id={block.id} className={cls}>
          {inline(block.text)}
        </Tag>
      );
    }
    if (block.type === "p") {
      return (
        <p key={i} className="text-[15px] leading-[1.8] text-fg">
          {inline(block.text)}
        </p>
      );
    }
    if (block.type === "hr") {
      return <hr key={i} className="my-2 border-0 border-t border-border" />;
    }
    if (block.type === "math") {
      return <MathExpr key={i} expr={block.expr} block />;
    }
    if (block.type === "quote") {
      return (
        <blockquote
          key={i}
          className="rounded-r-xl border-l-[3px] border-accent bg-accent-soft/30 px-4 py-3 text-[14px] leading-relaxed italic text-fg-muted"
        >
          {inline(block.text)}
        </blockquote>
      );
    }
    if (block.type === "ul") {
      const defs = !nested ? asDefs(block.items) : null;
      if (defs) {
        return (
          <dl key={i} className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1.5 text-[15px] leading-[1.8] text-fg">
            {defs.map((def, idx) => (
              <div key={`${def.name}-${idx}`} className="contents">
                <dt className="font-semibold text-fg">{inline(def.name)}</dt>
                <dd className="min-w-0 text-fg-muted">{inline(def.text)}</dd>
              </div>
            ))}
          </dl>
        );
      }
      return (
        <ul
          key={i}
          className={
            nested
              ? "list-[circle] space-y-1.5 pl-5 text-[14.5px] leading-[1.75] text-fg-muted"
              : "list-disc space-y-1.5 pl-5 text-[15px] leading-[1.8] text-fg"
          }
        >
          {block.items.map((item, j) => (
            <li key={j}>
              {inline(item.text)}
              {item.children.length > 0 ? (
                <div className="mt-2 space-y-2">{renderBlocks(item.children, locale, true)}</div>
              ) : null}
            </li>
          ))}
        </ul>
      );
    }
    if (block.type === "ol") {
      return (
        <ol
          key={i}
          start={block.start && block.start !== 1 ? block.start : undefined}
          className={
            nested
              ? "list-decimal space-y-1.5 pl-5 text-[14.5px] leading-[1.75] text-fg-muted"
              : "list-decimal space-y-2 pl-5 text-[15px] leading-[1.8] text-fg"
          }
        >
          {block.items.map((item, j) => (
            <li key={j}>
              {inline(item.text)}
              {item.children.length > 0 ? (
                <div className="mt-2 space-y-2">{renderBlocks(item.children, locale, true)}</div>
              ) : null}
            </li>
          ))}
        </ol>
      );
    }
    if (block.type === "pre") {
      return <CodeBlock key={i} code={block.code} lang={block.lang} locale={locale} />;
    }
    return (
      <div key={i} className="overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
        <table className="w-full min-w-md border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/60">
              {block.headers.map((h, hi) => (
                <th key={hi} className="px-4 py-2.5 font-semibold text-fg">
                  {inline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {block.rows.map((row, ri) => (
              <tr key={ri} className="transition-colors hover:bg-surface-2/40">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-fg-muted">
                    {inline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  });
}

export function Markdown({ source, locale }: { source: string; locale?: Locale }) {
  const blocks = parse(source);

  return <div className="space-y-6 [&>:first-child]:pt-0">{renderBlocks(blocks, locale)}</div>;
}
