import type { Locale } from "./prefs";

const aboutModules = import.meta.glob("../../../../writing/about*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function pick(suffix: string): string {
  const hit = Object.entries(aboutModules).find(([path]) => path.endsWith(suffix));
  return hit?.[1] ?? "";
}

const zh = pick("/about.md");
const en = pick("/about.en.md") || zh;

export function loadAbout(locale: Locale): string {
  return locale === "en" ? en : zh;
}
