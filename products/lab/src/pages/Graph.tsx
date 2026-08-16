import { GraphCanvas } from "../components/GraphCanvas";
import { Page } from "../components/Page";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { useHash } from "../lib/nav";
import { usePrefs } from "../lib/prefs";

export function Graph() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const focus = useHash();
  const studies = loadStudies()
    .map((s) => s.meta)
    .filter((meta) => meta.status !== "retired");

  return (
    <Page as="main" className="pb-20 pt-12">
      <header>
        <h1 className="text-[1.8rem] font-semibold tracking-tight">{copy.graphPageTitle}</h1>
        <p className="mt-3 max-w-[42rem] text-[15px] leading-relaxed text-fg-muted">{copy.graphPageLede}</p>
      </header>
      <div className="mt-10">
        <GraphCanvas studies={studies} locale={locale} focus={focus} />
      </div>
    </Page>
  );
}
