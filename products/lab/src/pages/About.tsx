import { Markdown } from "../lib/Markdown";
import { loadAbout } from "../lib/about";

export function About() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
      <Markdown source={loadAbout()} />
    </article>
  );
}
