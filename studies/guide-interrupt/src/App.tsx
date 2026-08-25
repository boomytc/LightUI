import { StageView } from "./StageView";
import { StudyView } from "./StudyView";

export function App() {
  if (new URLSearchParams(window.location.search).has("stage")) {
    return <StageView />;
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <header className="page-width flex items-center gap-3 py-4">
        <span className="grid size-8 place-items-center rounded-lg bg-fg text-surface" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-4" fill="none">
            <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="12" cy="12" r="3.1" fill="currentColor" fillOpacity="0.35" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight">guide-interrupt</p>
          <p className="text-[12px] text-fg-subtle">LightUI · standalone playground</p>
        </div>
      </header>
      <StudyView />
    </div>
  );
}
