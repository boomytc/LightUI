export function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  // A BOM at the start of a note must not hide the opening fence.
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const match = text.match(/^---\r?\n([\s\S]*?)(?:\r?\n)?---[ \t]*\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const cut = line.indexOf(":");
    if (cut < 1) continue;
    const key = line.slice(0, cut).trim();
    const value = line.slice(cut + 1).trim();
    if (key) data[key] = value;
  }

  return { data, body: (match[2] ?? "").replace(/^\r?\n/, "") };
}
