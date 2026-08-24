import { type CategoryId, getStudyCategory } from "./categories";
import { compareDayDesc, parseDay } from "./dates";
import { parseFrontmatter } from "./frontmatter";
import type { Locale } from "./prefs";

export type Note = {
  slug: string;
  title: string;
  date: string;
  updated: string;
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
    updated: parseDay(data.updated) ?? data.date ?? "",
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
    return [...zh].sort(compareNotes);
  }
  return zh
    .map((note) => parsed.find((n) => n.locale === "en" && n.slug === note.slug) ?? note)
    .sort(compareNotes);
}

function compareNotes(a: Note, b: Note): number {
  return compareDayDesc(a.updated, b.updated) || a.slug.localeCompare(b.slug);
}

export function loadNote(slug: string, locale: Locale): Note | undefined {
  return loadNotes(locale).find((n) => n.slug === slug);
}

export function getNoteCategory(note: Note): CategoryId {
  if (note.related.length > 0 && note.related[0]) {
    return getStudyCategory(note.related[0]);
  }
  return "craft";
}

export function filterNotes(
  notes: Note[],
  query: string,
  categoryId: CategoryId,
): Note[] {
  const q = query.trim().toLowerCase();

  return notes.filter((note) => {
    if (categoryId !== "all" && getNoteCategory(note) !== categoryId) {
      return false;
    }

    if (!q) return true;

    const title = note.title.toLowerCase();
    const summary = note.summary.toLowerCase();
    const slug = note.slug.toLowerCase();
    const related = note.related.join(" ").toLowerCase();

    return (
      title.includes(q) ||
      summary.includes(q) ||
      slug.includes(q) ||
      related.includes(q)
    );
  });
}

export function getAdjacentNotes(
  slug: string,
  locale: Locale,
): { prev: Note | null; next: Note | null } {
  const all = loadNotes(locale);
  const idx = all.findIndex((n) => n.slug === slug);
  if (idx === -1) return { prev: null, next: null };

  const prev = idx > 0 ? all[idx - 1] ?? null : null;
  const next = idx < all.length - 1 ? all[idx + 1] ?? null : null;

  return { prev, next };
}
