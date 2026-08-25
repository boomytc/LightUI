import { StageView } from "./StageView.tsx";
import { StudyView } from "./StudyView.tsx";

export function App() {
  if (new URLSearchParams(window.location.search).has("stage")) {
    return <StageView />;
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <header className="page-width flex items-center justify-between py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-fg text-surface" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-4" fill="none">
              <path d="M5 19 19 5v14Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">bm25-explain</p>
            <p className="text-xs text-fg-muted">LightUI · Standalone Study</p>
          </div>
        </div>
      </header>
      <StudyView />
    </div>
  );
}
