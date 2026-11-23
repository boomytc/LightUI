import { useEffect, useState, type ComponentType } from "react";
import { loadStudy } from "../lib/catalog";
import { messages } from "../lib/i18n";
import { usePrefs } from "../lib/prefs";

export function StagePage({ slug }: { slug: string }) {
  const { locale } = usePrefs();
  const study = loadStudy(slug);
  const [stageState, setStageState] = useState<{
    slug: string;
    Component: ComponentType | undefined;
    loaded: boolean;
  }>(() => ({
    slug,
    Component: study?.getCachedStageView(),
    loaded: !study?.hasStageView || Boolean(study?.getCachedStageView()),
  }));

  useEffect(() => {
    if (!study || !study.hasStageView) {
      setStageState({ slug, Component: undefined, loaded: true });
      return;
    }
    const cached = study.getCachedStageView();
    if (cached) {
      setStageState({ slug, Component: cached, loaded: true });
      return;
    }
    let cancelled = false;
    setStageState({ slug, Component: undefined, loaded: false });
    study
      .loadStageView()
      .then((Component) => {
        if (!cancelled) {
          setStageState({ slug, Component, loaded: true });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStageState({ slug, Component: undefined, loaded: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, study]);

  const StageView = stageState.slug === slug ? stageState.Component : study?.getCachedStageView();
  const loaded = stageState.slug === slug ? stageState.loaded : Boolean(StageView);

  if (!study) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-6 text-[15px] text-fg-muted">
        {messages(locale).missingStudy(slug)}
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-6" aria-busy="true">
        <div className="size-7 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (!StageView) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-6 text-[15px] text-fg-muted">
        {messages(locale).noStageView}
      </div>
    );
  }

  return <StageView />;
}
