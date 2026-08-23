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
            <path
              d="M5 8.5h14v3.2c0 .6-.3 1.1-.8 1.4L16 14.8v1.7c0 .8-.7 1.5-1.5 1.5h-5A1.5 1.5 0 0 1 8 16.5v-1.7L5.8 13.1c-.5-.3-.8-.8-.8-1.4Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight">notify-taxonomy</p>
          <p className="text-[12px] text-fg-subtle">LightUI · standalone playground</p>
        </div>
      </header>
      <StudyView />
    </div>
  );
}
