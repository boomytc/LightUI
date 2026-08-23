import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { fixtureCards } from "../lib/fixtures";
import { DECK } from "../lib/kinds";
import {
  advanceDueQueue,
  applyGrade,
  canGrade,
  dueCards,
  todayISO,
  type Card,
  type Face,
  type Grade,
} from "../lib/machines";
import { pick, useLocale, type Locale } from "../lib/site-locale";
import { Deck, type LastCommit, type RecallLayout } from "./Deck";
import { Well } from "./Frame";

export function Playground() {
  const locale = useLocale();

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[1.6rem] font-semibold tracking-tight">
            {locale === "en" ? "Recall deck" : "复习牌"}
          </h2>
          <p className="mt-1 text-[14px] text-fg-muted">{pick(DECK.tells, locale)}</p>
        </div>
      </div>

      <KindDemo layout="desk" />

      <p className="mt-4 max-w-xl text-[12px] leading-relaxed text-fg-subtle">
        {pick(DECK.naive, locale)}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {DECK.scenes.map((scene) => (
          <span
            key={scene.zh}
            className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent"
          >
            {pick(scene, locale)}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <SpecCard text={pick(DECK.spec, locale)} locale={locale} />
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {DECK.rules.map((rule) => (
          <li
            key={rule.zh}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted"
          >
            {pick(rule, locale)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KindDemo({
  state,
  layout = "stage",
}: {
  state?: "question" | "answer" | "empty";
  layout?: RecallLayout;
}) {
  const locale = useLocale();
  const locked = state !== undefined;
  const [today] = useState(() => todayISO());
  const seed = () => {
    const next = fixtureCards(today, locale);
    return { cards: next, pile: dueCards(next, today) };
  };
  const initial = seed();
  const [cards, setCards] = useState<Card[]>(initial.cards);
  const [pile, setPile] = useState<Card[]>(initial.pile);
  const [face, setFace] = useState<Face>(state === "answer" ? "answer" : "question");
  const [lastCommit, setLastCommit] = useState<LastCommit | null>(null);
  const [sessionTotal, setSessionTotal] = useState(initial.pile.length);

  useEffect(() => {
    if (locked) return;
    const next = seed();
    setCards(next.cards);
    setPile(next.pile);
    setFace("question");
    setLastCommit(null);
    setSessionTotal(next.pile.length);
  }, [locale, locked, today]);

  function flip() {
    if (locked) return;
    setFace("answer");
  }

  function grade(g: Grade) {
    if (locked) return;
    if (!canGrade(face)) return;
    const current = pile[0];
    if (!current) return;
    const graded = applyGrade(current, g, today);
    let nextPile = advanceDueQueue(pile, g);
    if (g === "again" && nextPile.length > 0) {
      nextPile = [...nextPile.slice(0, -1), graded];
    }
    setCards(cards.map((item) => (item.id === graded.id ? graded : item)));
    setPile(nextPile);
    setFace("question");
    setLastCommit({ grade: g, nextReview: graded.nextReview });
  }

  function reset() {
    if (locked) return;
    const next = seed();
    setCards(next.cards);
    setPile(next.pile);
    setFace("question");
    setLastCommit(null);
    setSessionTotal(next.pile.length);
  }

  const empty = locked ? state === "empty" : pile.length === 0;
  const current = empty ? null : locked ? cards[0]! : (pile[0] ?? null);
  const remaining = empty ? 0 : locked ? cards.length : pile.length;
  const shownFace: Face = locked && state === "answer" ? "answer" : empty ? "question" : face;

  const deck = (
    <Deck
      locale={locale}
      today={today}
      current={current}
      face={shownFace}
      remaining={remaining}
      total={sessionTotal || cards.length}
      lastCommit={locked ? null : lastCommit}
      locked={locked}
      layout={layout}
      onFlip={flip}
      onGrade={grade}
      onReset={reset}
    />
  );

  if (layout === "desk") {
    return (
      <Well>
        <div className="px-4 py-8 sm:px-10 sm:py-12">{deck}</div>
      </Well>
    );
  }

  return deck;
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
    <div className="rounded-2xl border border-fg bg-fg px-4 py-3.5 text-surface">
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
