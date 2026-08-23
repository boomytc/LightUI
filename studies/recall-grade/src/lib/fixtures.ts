import { loc, pick, type Locale, type Localized } from "./site-locale";
import { shiftISO, type Card } from "./machines";

export type FixtureSeed = {
  id: string;
  reviewCount: number;
  dueOffset: number;
  question: Localized;
  mine: Localized;
  answer: Localized;
};

export const FIXTURES: readonly FixtureSeed[] = [
  {
    id: "again-today",
    reviewCount: 0,
    dueOffset: 0,
    question: loc("点了「忘了」，这张牌该去哪？", "After Forgot, where does this card go?"),
    mine: loc("明天，和「模糊」同一天", "Tomorrow — the same day as Fuzzy"),
    answer: loc(
      "插回今天队列末尾，次数归零。模糊才是明天。",
      "Back to the end of today's pile, count reset to 0. Fuzzy is the one that waits until tomorrow.",
    ),
  },
  {
    id: "flip-grade",
    reviewCount: 1,
    dueOffset: 0,
    question: loc("翻开之后，底下三个按钮提交的是什么？", "After the flip, what do the three buttons commit?"),
    mine: loc("下一张", "The next card"),
    answer: loc(
      "记得程度，用来排下次间隔。不是把画面滑走。",
      "How well you knew it — that sets the next interval. Not a swipe to the next frame.",
    ),
  },
  {
    id: "empty-due",
    reviewCount: 2,
    dueOffset: -1,
    question: loc("今天没有到期的牌，屏幕上该留什么？", "When nothing is due today, what should occupy the screen?"),
    mine: loc("「暂无数据」", "“No data”"),
    answer: loc(
      "图标、一句人话、一个按钮。不是一条提示，也不是白板。",
      "An icon, one human line, one button. Not a notice, and not a blank board.",
    ),
  },
];

export function fixtureCards(today: string, locale: Locale): Card[] {
  return FIXTURES.map((seed) => ({
    id: seed.id,
    question: pick(seed.question, locale),
    mine: pick(seed.mine, locale),
    answer: pick(seed.answer, locale),
    reviewCount: seed.reviewCount,
    nextReview: shiftISO(today, seed.dueOffset),
  }));
}

const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatDay(iso: string, locale: Locale): string {
  const parts = iso.split("-");
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!month || !day) return iso;
  if (locale === "en") return `${day} ${MONTHS_EN[month - 1]}`;
  return `${month}月${day}日`;
}
