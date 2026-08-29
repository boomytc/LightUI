import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { navigate } from "./nav";

type Block =
  | { type: "h"; level: 1 | 2 | 3; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "pre"; code: string }
  | { type: "table"; headers: string[]; rows: string[][] };

const DEF = /^\*\*(.+?)\*\*[：:]\s*(.*)$/;

function asDefs(items: string[]): { name: string; text: string }[] | null {
  const defs = items.map((item) => {
    const match = DEF.exec(item);
    return match?.[1] != null ? { name: match[1], text: match[2] ?? "" } : null;
  });
  if (defs.length === 0 || defs.some((d) => !d)) return null;
  return defs as { name: string; text: string }[];
}

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re =
    /(\[([^\]]+)\]\(([^)]+)\))|(`[^`]+`)|(\*\*[^*]+\*\*)|(~~[^~]+~~)|(\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const [full, , label, href, code, bold, strike, italic] = match;
    if (label && href) {
      const internal = href.startsWith("/");
      parts.push(
        <a
          key={key++}
          href={href}
          className="font-medium text-accent underline-offset-2 hover:underline"
          onClick={
            internal
              ? (e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  navigate(href);
                }
              : undefined
          }
        >
          {label}
        </a>,
      );
    } else if (code) {
      parts.push(
        <code
          key={key++}
          className="rounded-md border border-border/70 bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-fg"
        >
          {code.slice(1, -1)}
        </code>,
      );
    } else if (bold) {
      parts.push(
        <strong key={key++} className="font-semibold text-fg">
          {bold.slice(2, -2)}
        </strong>,
      );
    } else if (strike) {
      parts.push(
        <del key={key++} className="text-fg-subtle line-through">
          {strike.slice(2, -2)}
        </del>,
      );
    } else if (italic) {
      parts.push(
        <em key={key++} className="italic text-fg">
          {italic.slice(1, -1)}
        </em>,
      );
    } else {
      parts.push(full);
    }
    last = match.index + full.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

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
        <span key={key++} className="text-white/40 italic">
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

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-[#12141a] p-4 text-[#e2e4ea] shadow-card sm:p-5">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-white/45">
          code
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-[#dcdfe6]">
        {highlightCode(code)}
      </pre>
    </div>
  );
}

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const flushPara = (buf: string[]) => {
    const text = buf.join(" ").trim();
    if (text) blocks.push({ type: "p", text });
    buf.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("```")) {
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        buf.push(lines[i] ?? "");
        i += 1;
      }
      i += 1;
      blocks.push({ type: "pre", code: buf.join("\n") });
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
      blocks.push({ type: "h", level, text: heading[2] });
      i += 1;
      continue;
    }

    if (line.startsWith("|") && (lines[i + 1] ?? "").includes("---")) {
      const headers = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("|")) {
        rows.push(
          (lines[i] ?? "")
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim()),
        );
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const para: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{1,3}\s+|```|\||\s*[-*]\s+|\s*\d+\.\s+|>\s+)/.test(lines[i] ?? "")
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    flushPara(para);
  }

  return blocks;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parse(source);

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "h") {
          const cls =
            block.level === 1
              ? "text-[1.8rem] font-bold tracking-tight text-fg"
              : block.level === 2
                ? "pt-4 text-[1.25rem] font-bold tracking-tight text-fg"
                : "pt-2 text-[1.05rem] font-semibold tracking-tight text-fg";
          const Tag = `h${block.level}` as const;
          return (
            <Tag key={i} className={cls}>
              {inline(block.text)}
            </Tag>
          );
        }
        if (block.type === "p") {
          return (
            <p key={i} className="text-[15px] leading-[1.75] text-fg">
              {inline(block.text)}
            </p>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={i}
              className="rounded-r-xl border-l-[3px] border-accent bg-accent-soft/40 px-4 py-3 text-[14px] leading-relaxed text-fg italic"
            >
              {inline(block.text)}
            </blockquote>
          );
        }
        if (block.type === "ul") {
          const defs = asDefs(block.items);
          if (defs) {
            return (
              <dl key={i} className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1.5 text-[15px] leading-[1.75] text-fg">
                {defs.map((def) => (
                  <div key={def.name} className="contents">
                    <dt className="font-semibold text-fg">{def.name}</dt>
                    <dd className="min-w-0 text-fg-muted">{inline(def.text)}</dd>
                  </div>
                ))}
              </dl>
            );
          }
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 text-[15px] leading-[1.75] text-fg">
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i} className="list-decimal space-y-1.5 pl-5 text-[15px] leading-[1.75] text-fg">
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ol>
          );
        }
        if (block.type === "pre") {
          return <CodeBlock key={i} code={block.code} />;
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
      })}
    </div>
  );
}
