import { Shell } from "./components/Shell";
import { parseRoute, usePath } from "./lib/nav";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { NotePage } from "./pages/NotePage";
import { Notes } from "./pages/Notes";
import { Studies } from "./pages/Studies";
import { StudyPage } from "./pages/StudyPage";

export function App() {
  const route = parseRoute(usePath());

  return (
    <Shell>
      {route.name === "home" ? <Home /> : null}
      {route.name === "studies" ? <Studies /> : null}
      {route.name === "study" ? <StudyPage slug={route.slug} /> : null}
      {route.name === "notes" ? <Notes /> : null}
      {route.name === "note" ? <NotePage slug={route.slug} /> : null}
      {route.name === "about" ? <About /> : null}
      {route.name === "missing" ? <NotFound path={route.path} /> : null}
    </Shell>
  );
}

function NotFound({ path }: { path: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
      <p className="text-[15px] text-fg-muted">没有这个页面：{path}</p>
    </main>
  );
}
