import { StageView } from "./StageView";
import { StudyView } from "./StudyView";

export function App() {
  if (new URLSearchParams(window.location.search).has("stage")) {
    return <StageView />;
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="page-width flex items-center gap-3 py-4">
        <span className="grid size-8 place-items-center rounded-lg bg-fg text-surface" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-4" fill="none">
            <rect x="4.5" y="7" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight">control-taxonomy</p>
          <p className="text-[12px] text-fg-subtle">LightUI · standalone playground</p>
        </div>
      </header>
      <StudyView />
    </div>
  );
}
