import { StageView } from "./StageView";
import { StudyView } from "./StudyView";

export function App() {
  const params = new URLSearchParams(window.location.search);
  const isStage = params.get("stage") === "1";

  if (isStage) {
    return <StageView />;
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <a href="/" className="text-[13px] font-semibold tracking-tight text-fg">
            LightUI
          </a>
          <span className="font-mono text-[11px] text-fg-subtle">/s/wheel-picker</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <StudyView />
      </div>
    </main>
  );
}
