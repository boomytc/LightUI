import { parseFrontmatter } from "./frontmatter";

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

function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? "";
  return file.replace(/\.md$/, "");
}

export function loadNotes(): Note[] {
  return Object.entries(noteModules)
    .map(([path, raw]) => {
      const { data, body } = parseFrontmatter(raw);
      const slug = slugFromPath(path);
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        summary: data.summary ?? "",
        related: (data.related ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        body,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function loadNote(slug: string): Note | undefined {
  return loadNotes().find((n) => n.slug === slug);
}
