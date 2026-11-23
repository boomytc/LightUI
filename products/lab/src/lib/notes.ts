import { type CategoryId, getStudyCategory } from "./categories";
import { loadStudy } from "./catalog";
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

function compareNotes(a: Note, b: Note): number {
  return compareDayDesc(a.updated, b.updated) || a.slug.localeCompare(b.slug);
}

const parsed = Object.entries(noteModules).map(([path, raw]) => toNote(path, raw));
const zhNotes: Note[] = parsed.filter((n) => n.locale === "zh").sort(compareNotes);
const enNotesBySlug = new Map<string, Note>(
  parsed.filter((n) => n.locale === "en").map((n) => [n.slug, n]),
);
const enNotes: Note[] = zhNotes
  .map((note) => enNotesBySlug.get(note.slug) ?? note)
  .sort(compareNotes);

export function loadNotes(locale: Locale): Note[] {
  return locale === "en" ? enNotes : zhNotes;
}

export function loadNote(slug: string, locale: Locale): Note | undefined {
  return loadNotes(locale).find((n) => n.slug === slug);
}

export function getNoteCategory(note: Note): CategoryId {
  const related = note.related[0];
  if (!related) return "craft";
  return getStudyCategory(loadStudy(related)?.meta);
}

export function filterNotes(
  notes: Note[],
  query: string,
  categoryId: CategoryId,
): Note[] {
  const q = query.trim().toLowerCase();

  return notes.filter((note) => {
    if (categoryId !== "all") {
      const matchesCategory =
        note.related.length > 0
          ? note.related.some((slug) => getStudyCategory(loadStudy(slug)?.meta) === categoryId)
          : getNoteCategory(note) === categoryId;
      if (!matchesCategory) return false;
    }

    if (!q) return true;

    const title = note.title.toLowerCase();
    const summary = note.summary.toLowerCase();
    const slug = note.slug.toLowerCase();
    const related = note.related.join(" ").toLowerCase();

    if (
      title.includes(q) ||
      summary.includes(q) ||
      slug.includes(q) ||
      related.includes(q)
    ) {
      return true;
    }

    return note.related.some((relSlug) => {
      const meta = loadStudy(relSlug)?.meta;
      if (!meta) return false;
      return (
        (meta.title ?? "").toLowerCase().includes(q) ||
        (meta.titleEn ?? "").toLowerCase().includes(q) ||
        (meta.asks ?? "").toLowerCase().includes(q) ||
        (meta.asksEn ?? "").toLowerCase().includes(q)
      );
    });
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
