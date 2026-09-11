import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { BATCH, INITIAL_VISIBLE, PAGE_SIZE, RESOURCES } from "../lib/fixtures";
import { KINDS, type KindId } from "../lib/kinds";
import {
  appendCount,
  collectionMode,
  collectionView,
  dropsOldItems,
  pageCount,
  resetsScroll,
  stageLock,
  type StageState,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Window } from "./Frame";
import { AppendControl, PageControl, ResourceList, ShowingLine } from "./Scene";
import "./records.css";

export function Playground() {
  const locale = useLocale();
  const [active, setActive] = useState<KindId>("page");
  const meta = KINDS.find((k) => k.id === active) ?? KINDS[0]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= KINDS.length) {
        e.preventDefault();
        setActive(KINDS[n - 1]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-playground="records" className="min-w-0 overflow-x-hidden">
      <nav
        aria-label={locale === "en" ? "Collection kinds" : "集合种类"}
        className="grid gap-2 sm:grid-cols-2"
      >
        {KINDS.map((kind) => {
          const on = kind.id === active;
          const replace = collectionMode(kind.id) === "replace";
          return (
            <button
              key={kind.id}
              type="button"
              data-kind={kind.id}
              aria-pressed={on}
              onClick={() => setActive(kind.id)}
              className={cn(
                "rounded-2xl border px-4 py-3.5 text-left transition-colors",
                on
                  ? "border-fg bg-fg text-surface shadow-card"
                  : "border-border bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className={cn("font-mono text-[11px] tabular-nums", on ? "text-surface/55" : "text-fg-subtle")}>
                  {kind.index}
                </span>
                <span className={cn("text-[11px]", on ? "text-surface/55" : "text-fg-subtle")}>
                  {replace ? "replace" : "append"}
                </span>
              </span>
              <span className="mt-1 block text-[1.05rem] font-semibold tracking-tight">{kind.name}</span>
              <span className={cn("mt-0.5 block text-[13px]", on ? "text-surface/80" : "text-fg")}>
                {pick(kind.zh, locale)}
              </span>
              <span className={cn("mt-2 block text-[12px] leading-relaxed", on ? "text-surface/60" : "text-fg-subtle")}>
                {pick(kind.oneLiner, locale)}
              </span>
              <span className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <span>
                  <span className={cn("block", on ? "text-surface/45" : "text-fg-subtle")}>
                    {locale === "en" ? "Old nodes" : "旧节点"}
                  </span>
                  <span className="font-medium">
                    {dropsOldItems(kind.id)
                      ? locale === "en"
                        ? "Drop"
                        : "丢掉"
                      : locale === "en"
                        ? "Keep"
                        : "留下"}
                  </span>
                </span>
                <span>
                  <span className={cn("block", on ? "text-surface/45" : "text-fg-subtle")}>
                    {locale === "en" ? "Scroll" : "滚动"}
                  </span>
                  <span className="font-medium">
                    {resetsScroll(kind.id)
                      ? locale === "en"
                        ? "Top"
                        : "回顶"
                      : locale === "en"
                        ? "Stay"
                        : "保持"}
                  </span>
                </span>
                <span>
                  <span className={cn("block", on ? "text-surface/45" : "text-fg-subtle")}>
                    {locale === "en" ? "Range" : "范围"}
                  </span>
                  <span className="font-medium">{replace ? "a–b of n" : "1–k of n"}</span>
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <section className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] tabular-nums text-accent">{meta.index} / 02</p>
            <h2 className="mt-1 text-[1.6rem] font-semibold tracking-tight">{meta.name}</h2>
            <p className="mt-1 text-[14px] text-fg-muted">{pick(meta.oneLiner, locale)}</p>
          </div>
          <p className="max-w-xs text-right text-[12px] leading-relaxed text-fg-subtle">
            {pick(meta.tells, locale)}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {meta.scenes.map((scene) => (
            <span
              key={scene.zh}
              className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
            >
              {pick(scene, locale)}
            </span>
          ))}
        </div>

        {meta.note ? <p className="mb-4 text-[13px] text-accent">{pick(meta.note, locale)}</p> : null}

        <KindDemo key={meta.id} id={meta.id} />

        <SpecCard text={pick(meta.spec, locale)} locale={locale} />

        <ul className="mt-4 flex flex-wrap gap-2">
          {meta.rules.map((rule) => (
            <li
              key={rule.zh}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
            >
              {pick(rule, locale)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SpecCard({ text, locale }: { text: string; locale: Locale }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-surface/45">
          {locale === "en" ? "Say it this way" : "说清楚"}
        </p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-surface/45 transition-colors hover:text-surface"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? (locale === "en" ? "Copied" : "已复制") : locale === "en" ? "Copy" : "复制"}
        </button>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-surface/90">{text}</p>
    </div>
  );
}

export function KindDemo({
  id,
  state,
  compact = false,
}: {
  id: KindId;
  state?: StageState;
  compact?: boolean;
}) {
  const locale = useLocale();
  const locked = state !== undefined;
  const total = RESOURCES.length;
  const seed = locked
    ? stageLock(id, state, total, PAGE_SIZE, BATCH)
    : { page: 1, visible: INITIAL_VISIBLE };
  const [page, setPage] = useState(seed.page);
  const [visible, setVisible] = useState(seed.visible);
  const scroller = useRef<HTMLDivElement>(null);
  const firstReset = useRef(true);
  const [resetFlash, setResetFlash] = useState(false);
  const pageNow = locked ? seed.page : page;
  const visibleNow = locked ? seed.visible : visible;
  const view = collectionView(id, RESOURCES, {
    page: pageNow,
    pageSize: PAGE_SIZE,
    visible: visibleNow,
    batch: BATCH,
  });
  const pages = pageCount(total, PAGE_SIZE);
  const meta = KINDS.find((k) => k.id === id) ?? KINDS[0]!;
  const from =
    id === "page"
      ? view.shown.length === 0
        ? 0
        : (pageNow - 1) * PAGE_SIZE + 1
      : view.shown.length === 0
        ? 0
        : 1;
  const to = id === "page" ? (view.shown.length === 0 ? 0 : from + view.shown.length - 1) : view.visible;
  const mode = collectionMode(id);

  useLayoutEffect(() => {
    if (!view.scrollReset) return;
    const el = scroller.current;
    if (el) el.scrollTop = 0;
    if (firstReset.current) {
      firstReset.current = false;
      return;
    }
    if (locked) return;
    setResetFlash(true);
    const timer = window.setTimeout(() => setResetFlash(false), 640);
    return () => window.clearTimeout(timer);
  }, [id, pageNow, view.scrollReset, locked]);

  return (
    <div>
      {compact ? null : (
        <CollectionRule
          locale={locale}
          id={id}
          ids={view.shown.map((item) => item.id)}
        />
      )}
      <Window
        compact={compact}
        title={pick(meta.window, locale)}
        brand={locale === "en" ? "Library" : "资料"}
        scrollerRef={scroller}
        resetting={resetFlash}
        toolbar={
          <ShowingLine
            locale={locale}
            kind={id}
            from={from}
            to={to}
            total={total}
            exhausted={view.exhausted}
          />
        }
        footer={
          id === "page" ? (
            <PageControl
              locale={locale}
              page={pageNow}
              pages={pages}
              locked={locked}
              onPage={setPage}
            />
          ) : (
            <AppendControl
              locale={locale}
              exhausted={view.exhausted}
              locked={locked}
              onMore={() => setVisible((n) => appendCount(n, BATCH, total))}
            />
          )
        }
      >
        {resetFlash ? (
          <span className="records-reset-cue">
            {locale === "en" ? "scrollTop = 0" : "回到顶部 · scrollTop = 0"}
          </span>
        ) : null}
        <ResourceList
          resources={view.shown}
          locale={locale}
          replace={mode === "replace"}
          pageKey={pageNow}
        />
      </Window>
    </div>
  );
}

function CollectionRule({
  locale,
  id,
  ids,
}: {
  locale: Locale;
  id: KindId;
  ids: readonly string[];
}) {
  const replace = collectionMode(id) === "replace";
  return (
    <dl className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 sm:grid-cols-4 sm:px-4">
      <div>
        <dt className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">mode</dt>
        <dd className="mt-0.5 text-[13px] font-medium">{replace ? "replace" : "append"}</dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">old nodes</dt>
        <dd className={cn("mt-0.5 text-[13px] font-medium", replace ? "text-wrong" : "text-intent")}>
          {dropsOldItems(id) ? "drop" : "keep"}
        </dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">scroll</dt>
        <dd className="mt-0.5 text-[13px] font-medium">{resetsScroll(id) ? "reset" : "stay"}</dd>
      </div>
      <div className="min-w-0">
        <dt className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">mounted</dt>
        <dd className="mt-0.5 truncate font-mono text-[12px] tabular-nums text-fg-muted">
          {ids.length === 0 ? "—" : ids.join(" ")}
        </dd>
      </div>
      <p className="col-span-2 text-[11px] leading-relaxed text-fg-subtle sm:col-span-4">
        {locale === "en"
          ? replace
            ? "Changing page unmounts the last slice and returns the list to the top."
            : "A click grows visibleCount. Already mounted ids stay; new cards arrive at the end."
          : replace
            ? "换页卸掉上一页切片，列表滚回顶部。"
            : "点一下才增加 visibleCount。已挂上的 id 留下，新卡出现在末尾。"}
      </p>
    </dl>
  );
}
