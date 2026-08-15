import type { ReactNode } from "react";
import { Link } from "./Link";
import { usePath } from "../lib/nav";

const NAV = [
  { href: "/studies", label: "作品", match: (p: string) => p === "/studies" || p.startsWith("/s/") },
  { href: "/notes", label: "笔记", match: (p: string) => p.startsWith("/notes") },
  { href: "/about", label: "关于", match: (p: string) => p === "/about" },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePath();

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="grid size-7 place-items-center rounded-md bg-fg text-surface" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
                <path
                  d="M5 19 19 5v14Z"
                  fill="currentColor"
                  fillOpacity="0.35"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">LightUI</span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="站点">
            {NAV.map((item) => {
              const active = item.match(path);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ariaCurrent={active ? "page" : undefined}
                  className={
                    active
                      ? "rounded-md px-2.5 py-1 text-[13px] font-medium text-fg no-underline"
                      : "rounded-md px-2.5 py-1 text-[13px] text-fg-muted no-underline hover:bg-surface-2 hover:text-fg"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 sm:px-8">
          <p className="text-[12px] text-fg-subtle">LightUI · 可操作的 UI/UX 笔记</p>
          <p className="text-[12px] text-fg-subtle">作品是 study，文章是笔记</p>
        </div>
      </footer>
    </div>
  );
}
