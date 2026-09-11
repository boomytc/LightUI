import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  TOUR_COUNT,
  allowsSkip,
  checklistProgress,
  hintActive,
  hotspotNext,
  stageLock,
  tourStep,
  type Hotspot,
  type KindId,
} from "../lib/machines";
import { loc, pick, type Locale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { AnchorCard, HoleScrim, HotspotDot, PinRing } from "./Hole";
import { GuideHud, GuideLeftover } from "./Status";
import { Workbench, type TargetId } from "./Workbench";
import { useCutout } from "./use-cutout";

const TOUR_PINS: TargetId[] = ["metric", "title", "publish"];

const TOUR_COPY = [
  loc("本周发布钉在这张卡上。先认识工作台，再动手。", "This week’s count lives on this card. Learn the bench before you act."),
  loc("给这一次发布起名。空着就发不出去。", "Name this release. Empty cannot ship."),
  loc("点发布才算交出去。下一步仍由你点，不是点空白。", "Publish is the commit. You click Next — not empty space."),
];

const SPOT_COPY = [
  loc("先选谁能看见。点这个选择本身推进，没有下一步。", "Pick who can see it. Click this control — there is no Next."),
  loc("再点发布。挖孔跟着手点的控件走。", "Now click Publish. The hole follows the control they must hit."),
];

const CHECKLIST_TASKS = [
  { id: "look", zh: "看过指标卡", en: "Look at the metric" },
  { id: "title", zh: "填写标题", en: "Fill in a title" },
  { id: "perm", zh: "选择可见范围", en: "Choose who can see it" },
  { id: "ship", zh: "点一次发布", en: "Publish once" },
] as const;

type Seed = {
  tourStep: number;
  tourDone: boolean;
  coachOn: boolean;
  hotspot: Hotspot;
  spot: number;
  checks: string[];
  title: string;
  permission: boolean;
  shipped: boolean;
};

function seed(kind: KindId, raw: string): Seed {
  const lock = stageLock(kind, raw);
  const base: Seed = {
    tourStep: 0,
    tourDone: false,
    coachOn: true,
    hotspot: "unread",
    spot: 0,
    checks: [],
    title: "",
    permission: false,
    shipped: false,
  };
  if (kind === "tour") {
    if (lock === "step2") return { ...base, tourStep: 1 };
    if (lock === "done") return { ...base, tourStep: TOUR_COUNT, tourDone: true };
    return base;
  }
  if (kind === "coach") {
    return { ...base, coachOn: lock !== "done" };
  }
  if (kind === "hotspot") {
    if (lock === "open" || lock === "read") return { ...base, hotspot: lock };
    return base;
  }
  if (kind === "spotlight") {
    if (lock === "mid") return { ...base, spot: 1, permission: true };
    if (lock === "done") return { ...base, spot: 2, permission: true, shipped: true };
    return base;
  }
  if (kind === "checklist") {
    if (lock === "mid") return { ...base, checks: ["look", "title"] };
    if (lock === "done") return { ...base, checks: CHECKLIST_TASKS.map((t) => t.id) };
    return base;
  }
  if (lock === "mid") return { ...base, title: "Hi" };
  if (lock === "done") return { ...base, title: "Hi", permission: true };
  return base;
}

function pinOf(
  kind: KindId,
  tour: { step: number; done: boolean },
  coachOn: boolean,
  hotspot: Hotspot,
  spot: number,
  hint: ReturnType<typeof hintActive>,
): TargetId | null {
  switch (kind) {
    case "tour":
      return tour.done ? null : (TOUR_PINS[tour.step] ?? null);
    case "coach":
      return coachOn ? "publish" : null;
    case "hotspot":
      return hotspot === "read" ? null : "feature";
    case "spotlight":
      if (spot <= 0) return "permission";
      if (spot === 1) return "publish";
      return null;
    case "hint":
      return hint;
    case "checklist":
      return null;
  }
}

function TourDots({ step, count }: { step: number; count: number }) {
  return (
    <ol className="guide-dots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={cn("guide-dot", i < step && "is-done", i === step && "is-now")} />
      ))}
    </ol>
  );
}

export function GuideScene({
  kind,
  lock = "",
  compact = false,
  locale,
}: {
  kind: KindId;
  lock?: string;
  compact?: boolean;
  locale: Locale;
}) {
  const initial = useMemo(() => seed(kind, lock), [kind, lock]);
  const [tour, setTour] = useState({ step: initial.tourStep, done: initial.tourDone });
  const [coachOn, setCoachOn] = useState(initial.coachOn);
  const [hotspot, setHotspot] = useState<Hotspot>(initial.hotspot);
  const [spot, setSpot] = useState(initial.spot);
  const [checks, setChecks] = useState<string[]>(initial.checks);
  const [title, setTitle] = useState(initial.title);
  const [permission, setPermission] = useState(initial.permission);
  const [shipped, setShipped] = useState(initial.shipped);

  const [hostEl, setHostEl] = useState<HTMLDivElement | null>(null);
  const nodes = useRef<Partial<Record<TargetId, HTMLElement | null>>>({});
  const [, bump] = useState(0);

  const register = useCallback((id: TargetId, el: HTMLElement | null) => {
    if (el == null) return;
    if (nodes.current[id] === el) return;
    nodes.current[id] = el;
    bump((n) => n + 1);
  }, []);

  const hint = hintActive({ title, permission });
  const pin = pinOf(kind, tour, coachOn, hotspot, spot, hint);
  const target = pin ? (nodes.current[pin] ?? null) : null;
  const { hole, hostSize } = useCutout(kind, target, hostEl);

  const teaching =
    (kind === "tour" && !tour.done) ||
    (kind === "coach" && coachOn) ||
    (kind === "hotspot" && hotspot !== "read") ||
    (kind === "spotlight" && spot < 2) ||
    (kind === "hint" && hint !== null) ||
    kind === "checklist";

  const finished =
    (kind === "tour" && tour.done) ||
    (kind === "coach" && !coachOn) ||
    (kind === "hotspot" && hotspot === "read") ||
    (kind === "spotlight" && spot >= 2) ||
    (kind === "hint" && hint === null) ||
    (kind === "checklist" && checklistProgress(checks, CHECKLIST_TASKS.length) === 1);

  const locked = Boolean(lock);

  function onTarget(id: TargetId) {
    if (locked) return;
    if (kind === "spotlight") {
      if (spot === 0 && id === "permission") {
        setPermission(true);
        setSpot(1);
      } else if (spot === 1 && id === "publish") {
        setSpot(2);
      }
      return;
    }
    if (kind === "hotspot" && id === "feature") {
      setHotspot((s) => hotspotNext(s, "click-dot"));
    }
  }

  function replay() {
    if (locked) return;
    const next = seed(kind, "");
    setTour({ step: next.tourStep, done: next.tourDone });
    setCoachOn(next.coachOn);
    setHotspot(next.hotspot);
    setSpot(next.spot);
    setChecks(next.checks);
    setTitle(next.title);
    setPermission(next.permission);
    setShipped(next.shipped);
  }

  const ratio = checklistProgress(checks, CHECKLIST_TASKS.length);
  const listTitle =
    ratio === 1
      ? pick(loc("入门完成", "Ready"), locale)
      : pick(loc("入门清单", "Getting started"), locale);

  const overlay = (
    <>
      {hole ? renderOverlay() : null}
      {finished && kind !== "checklist" ? (
        <GuideLeftover kind={kind} locale={locale} compact={compact} locked={locked} onReplay={replay} />
      ) : null}
    </>
  );

  function renderOverlay(): ReactNode {
    if (!hole) return null;
    if (kind === "tour" && !tour.done) {
      return (
        <HoleScrim hole={hole} blockHole>
          <AnchorCard hole={hole} host={hostSize} tone="ink">
            <div className="px-3.5 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TourDots step={tour.step} count={TOUR_COUNT} />
                  <span className="font-mono text-[11px] tabular-nums text-surface/50">
                    {tour.step + 1}/{TOUR_COUNT}
                  </span>
                </div>
                {allowsSkip(kind) ? (
                  <button
                    type="button"
                    disabled={locked}
                    className="text-[11px] text-surface/50 hover:text-surface disabled:pointer-events-none"
                    onClick={() => setTour(tourStep(tour.step, TOUR_COUNT, "skip"))}
                  >
                    {pick(loc("跳过", "Skip"), locale)}
                  </button>
                ) : null}
              </div>
              <p key={tour.step} className="guide-copy-in mt-2 text-[13px] leading-snug">
                {pick(TOUR_COPY[tour.step]!, locale)}
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled={locked}
                  className="h-8 rounded-lg bg-surface px-3 text-[12px] font-medium text-fg disabled:cursor-default"
                  onClick={() => setTour(tourStep(tour.step, TOUR_COUNT, "next"))}
                >
                  {tour.step + 1 >= TOUR_COUNT
                    ? pick(loc("完成", "Done"), locale)
                    : pick(loc("下一步", "Next"), locale)}
                </button>
              </div>
            </div>
          </AnchorCard>
        </HoleScrim>
      );
    }
    if (kind === "spotlight" && spot < 2) {
      return (
        <HoleScrim hole={hole} blockHole={false} invite>
          <AnchorCard hole={hole} host={hostSize} tone="ink">
            <div className="px-3.5 py-3">
              <p className="text-[11px] font-medium tracking-wide text-surface/45">
                {pick(loc("没有下一步", "No Next"), locale)}
              </p>
              <p key={spot} className="guide-copy-in mt-1.5 text-[13px] leading-snug">
                {pick(SPOT_COPY[spot] ?? SPOT_COPY[0]!, locale)}
              </p>
            </div>
          </AnchorCard>
        </HoleScrim>
      );
    }
    if (kind === "coach" && coachOn) {
      return (
        <div className="pointer-events-none absolute inset-0 z-30">
          <PinRing hole={hole} />
          <AnchorCard hole={hole} host={hostSize} tone="paper">
            <div className="px-3.5 py-3">
              <p className="text-[13px] leading-snug">
                {pick(loc("发布会立刻同步给成员。看过这一下就行。", "Publish syncs to the team at once. One look is enough."), locale)}
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled={locked}
                  className="h-8 rounded-lg bg-fg px-3 text-[12px] font-medium text-surface disabled:cursor-default"
                  onClick={() => setCoachOn(false)}
                >
                  {pick(loc("明白了", "Got it"), locale)}
                </button>
              </div>
            </div>
          </AnchorCard>
        </div>
      );
    }
    if (kind === "hotspot" && hotspot !== "read") {
      return (
        <div className="pointer-events-none absolute inset-0 z-30">
          {hotspot === "unread" || hotspot === "open" ? (
            <HotspotDot
              hole={hole}
              label={pick(loc("打开新功能提示", "Open the new-feature tip"), locale)}
              onClick={() => {
                if (!locked) setHotspot((s) => hotspotNext(s, "click-dot"));
              }}
            />
          ) : null}
          {hotspot === "open" ? (
            <AnchorCard hole={hole} host={hostSize} tone="paper">
              <div className="px-3.5 py-3">
                <p className="text-[13px] leading-snug">
                  {pick(
                    loc("新：模板库。从现成结构起稿，不必从空白页开始。", "New: Templates. Start from a structure, not a blank page."),
                    locale,
                  )}
                </p>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    disabled={locked}
                    className="h-8 rounded-lg bg-fg px-3 text-[12px] font-medium text-surface disabled:cursor-default"
                    onClick={() => setHotspot((s) => hotspotNext(s, "dismiss"))}
                  >
                    {pick(loc("知道了", "Dismiss"), locale)}
                  </button>
                </div>
              </div>
            </AnchorCard>
          ) : null}
        </div>
      );
    }
    if (kind === "hint" && hint) {
      return (
        <div className="pointer-events-none absolute inset-0 z-30">
          <PinRing hole={hole} />
          <AnchorCard hole={hole} host={hostSize} width={220} tone="hint">
            <p key={hint} className="guide-copy-in px-3.5 py-2.5 text-[12px] leading-snug">
              {hint === "title"
                ? pick(loc("先写标题。填上之后这条会自己卸掉。", "Write a title first. Filling it unmounts this hint."), locale)
                : pick(loc("标题有了，再选可见范围。", "Title is in. Now pick visibility."), locale)}
            </p>
          </AnchorCard>
        </div>
      );
    }
    return null;
  }

  const rail =
    kind === "checklist" ? (
      <aside className="rounded-xl border border-border bg-surface px-3 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="text-[13px] font-semibold tracking-tight">{listTitle}</h3>
            {ratio === 1 ? (
              <span className="rounded-full bg-intent-soft px-1.5 py-px text-[10px] font-medium text-intent">
                {pick(loc("仍留着", "Stays"), locale)}
              </span>
            ) : null}
          </div>
          <span className="font-mono text-[11px] tabular-nums text-fg-subtle">
            {checks.length}/{CHECKLIST_TASKS.length}
          </span>
        </div>
        <div className={cn("guide-bar mt-2", ratio === 1 && "is-done")}>
          <div className="guide-bar-fill" style={{ transform: `scaleX(${ratio})` }} />
        </div>
        <ul className="mt-3 space-y-1.5">
          {CHECKLIST_TASKS.map((task) => {
            const on = checks.includes(task.id);
            return (
              <li key={task.id}>
                <label className="guide-task flex cursor-pointer items-center gap-2 text-[12px]">
                  <input
                    type="checkbox"
                    className="guide-check"
                    checked={on}
                    disabled={locked}
                    onChange={() => {
                      if (locked) return;
                      setChecks((list) =>
                        list.includes(task.id) ? list.filter((id) => id !== task.id) : [...list, task.id],
                      );
                    }}
                  />
                  <span className={cn(on && "text-fg-muted line-through")}>
                    {pick({ zh: task.zh, en: task.en }, locale)}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </aside>
    ) : null;

  return (
    <div
      data-guide-kind={kind}
      data-guide-teaching={teaching ? "" : undefined}
      data-guide-finished={finished ? "" : undefined}
    >
      <Workbench
        compact={compact}
        locale={locale}
        title={title}
        permission={permission}
        shipped={shipped}
        locked={locked}
        pin={pin}
        onTitle={setTitle}
        onPermission={setPermission}
        onPublish={() => setShipped(true)}
        onTarget={onTarget}
        register={register}
        hostRef={setHostEl}
        overlay={overlay}
        rail={rail}
      />
      {compact ? null : (
        <GuideHud
          kind={kind}
          locale={locale}
          pin={pin}
          teaching={teaching}
          finished={finished}
          tour={tour}
          hotspot={hotspot}
          checks={checks.length}
          total={CHECKLIST_TASKS.length}
        />
      )}
    </div>
  );
}
