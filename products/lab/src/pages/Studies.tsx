import { Page } from "../components/Page";
import { StudyCard } from "../components/StudyCard";
import { loadStudies } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { usePrefs } from "../lib/prefs";

export function Studies() {
  const { locale } = usePrefs();
  const copy = messages(locale);
  const studies = loadStudies().filter((s) => s.meta.status !== "retired");

  return (
    <Page as="main" className="pb-20 pt-12">
      <header>
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{copy.studiesEyebrow}</p>
        <h1 className="mt-3 text-[1.8rem] font-semibold tracking-tight">{copy.studiesTitle}</h1>
        <p className="mt-3 max-w-[42rem] text-[15px] leading-relaxed text-fg-muted">{copy.studiesLede}</p>
      </header>

      {studies.length === 0 ? (
        <p className="mt-10 text-[13px] text-fg-subtle">{copy.emptyStudy}</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {studies.map((s) => (
            <StudyCard key={s.meta.slug} meta={s.meta} locale={locale} />
          ))}
        </div>
      )}
    </Page>
  );
}
