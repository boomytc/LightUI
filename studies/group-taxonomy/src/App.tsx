import { StageView } from "./StageView.js";
import { StudyView } from "./StudyView.js";

export function App() {
  const params = new URLSearchParams(window.location.search);
  const isStage = params.get("stage") === "1";

  if (isStage) {
    return <StageView />;
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="text-sm font-semibold tracking-tight text-fg">
            LightUI · Study
          </a>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-fg-muted font-mono border border-border">
            /s/group-taxonomy
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <StudyView />
      </div>
    </div>
  );
}
