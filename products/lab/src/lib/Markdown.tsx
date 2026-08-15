import type { ReactNode } from "react";
import { navigate } from "./nav";

type Block =
  | { type: "h"; level: 1 | 2 | 3; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "pre"; code: string }
  | { type: "table"; headers: string[]; rows: string[][] };

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\[([^\]]+)\]\(([^)]+)\))|(`[^`]+`)|(\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const [full, , label, href, code, bold] = match;
    if (label && href) {
      const internal = href.startsWith("/");
      parts.push(
        <a
          key={key++}
          href={href}
          className="text-accent underline-offset-2 hover:underline"
          onClick={
            internal
              ? (e) => {
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
        <code key={key++} className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[12px] text-fg">
          {code.slice(1, -1)}
        </code>,
      );
    } else if (bold) {
      parts.push(
        <strong key={key++} className="font-medium text-fg">
          {bold.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(full);
    }
    last = match.index + full.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
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
    while (i < lines.length && (lines[i] ?? "").trim() && !/^(#{1,3}\s+|```|\||\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i] ?? "")) {
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
              ? "text-[1.8rem] font-semibold tracking-tight"
              : block.level === 2
                ? "pt-4 text-[1.25rem] font-semibold tracking-tight"
                : "pt-2 text-[1.05rem] font-semibold tracking-tight";
          const Tag = (`h${block.level}` as const);
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
        if (block.type === "ul") {
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
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-xl bg-fg px-4 py-3 font-mono text-[12px] leading-relaxed text-surface/85"
            >
              {block.code}
            </pre>
          );
        }
        return (
          <div key={i} className="overflow-x-auto">
            <table className="w-full min-w-md border-collapse text-left text-[13px]">
              <thead>
                <tr>
                  {block.headers.map((h) => (
                    <th key={h} className="border-b border-border px-3 py-2 font-medium text-fg">
                      {inline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b border-border px-3 py-2 text-fg-muted">
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
