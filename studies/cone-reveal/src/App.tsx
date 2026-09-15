import { StageView } from "./StageView";
import { StudyView } from "./StudyView";

export function App() {
  const params = new URLSearchParams(window.location.search);
  const isStage = params.get("stage") === "1";

  if (isStage) {
    return <StageView />;
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <header className="page-width flex items-center justify-between py-4">
        <a href="/" className="text-[15px] font-semibold tracking-tight text-fg">
          LightUI · Study
        </a>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-fg-muted">
          /s/cone-reveal
        </span>
      </header>
      <StudyView />
    </div>
  );
}
