import { parseFrontmatter } from "./frontmatter";
import type { Locale } from "./prefs";

export type Note = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  related: string[];
  body: string;
};

const noteModules = import.meta.glob("../../../../writing/notes/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function parseNoteFile(path: string): { slug: string; locale: Locale } {
  const file = (path.split("/").pop() ?? "").replace(/\.md$/, "");
  if (file.endsWith(".en")) return { slug: file.slice(0, -3), locale: "en" };
  return { slug: file, locale: "zh" };
}

function toNote(path: string, raw: string): Note & { locale: Locale } {
  const { slug, locale } = parseNoteFile(path);
  const { data, body } = parseFrontmatter(raw);
  return {
    slug,
    locale,
    title: data.title ?? slug,
    date: data.date ?? "",
    summary: data.summary ?? "",
    related: (data.related ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    body,
  };
}

const parsed = Object.entries(noteModules).map(([path, raw]) => toNote(path, raw));

export function loadNotes(locale: Locale): Note[] {
  const zh = parsed.filter((n) => n.locale === "zh");
  if (locale !== "en") {
    return [...zh].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  }
  return zh
    .map((note) => parsed.find((n) => n.locale === "en" && n.slug === note.slug) ?? note)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function loadNote(slug: string, locale: Locale): Note | undefined {
  return loadNotes(locale).find((n) => n.slug === slug);
}
