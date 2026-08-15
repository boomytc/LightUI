import { loadStudy } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { usePrefs } from "../lib/prefs";

export function StagePage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const study = loadStudy(slug);
  const StageView = study?.StageView;

  if (!study || !StageView) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-6 text-[15px] text-fg-muted">
        {study ? messages(locale).noStageView : messages(locale).missingStudy(slug)}
      </div>
    );
  }

  return <StageView />;
}
