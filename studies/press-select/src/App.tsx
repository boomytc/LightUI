import { StageView } from "./StageView";
import { StudyView } from "./StudyView";

export function App() {
  const params = new URLSearchParams(window.location.search);
  const isStage = params.get("stage") === "1";

  if (isStage) {
    return <StageView />;
  }

  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="text-sm font-semibold tracking-tight text-fg">
            LightUI · Study
          </a>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-fg-muted font-mono">
            /s/press-select
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <StudyView />
      </div>
    </main>
  );
}
