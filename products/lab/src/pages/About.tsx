import { Page } from "../components/Page";
import { Markdown } from "../lib/Markdown";
import { loadAbout } from "../lib/about";
import { usePrefs } from "../lib/prefs";

export function About() {
  const { locale } = usePrefs();
  return (
    <Page as="article" measure="prose" className="py-12">
      <Markdown source={loadAbout(locale)} />
    </Page>
  );
}
