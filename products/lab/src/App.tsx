import { Page } from "./components/Page";
import { Shell } from "./components/Shell";
import { messages } from "./lib/i18n";
import { parseRoute, usePath } from "./lib/nav";
import { usePrefs } from "./lib/prefs";
import { About } from "./pages/About";
import { Graph } from "./pages/Graph";
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
      {route.name === "graph" ? <Graph /> : null}
      {route.name === "study" ? <StudyPage slug={route.slug} /> : null}
      {route.name === "notes" ? <Notes /> : null}
      {route.name === "note" ? <NotePage slug={route.slug} /> : null}
      {route.name === "about" ? <About /> : null}
      {route.name === "missing" ? <NotFound path={route.path} /> : null}
    </Shell>
  );
}

function NotFound({ path }: { path: string }) {
  const { locale } = usePrefs();
  return (
    <Page as="main" className="py-16">
      <p className="text-[15px] text-fg-muted">{messages(locale).missingPage(path)}</p>
    </Page>
  );
}
