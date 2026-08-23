import { loc, type Localized } from "./site-locale";

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc(
      "别说「翻卡片」，说复习打分：翻开对照，提交记得程度",
      "Not “flip cards” — a recall grade: flip to compare, then commit how well you knew it",
    ),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc(
      "先看题，翻开对照，再提交忘了 / 模糊 / 记得",
      "See the prompt, flip to compare, then commit forgot / fuzzy / knew",
    ),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc(
      "忘了归零并排到今天末尾；模糊明天；记得按 1、3、7、14、30 天",
      "Forgot resets and requeues today; fuzzy is tomorrow; knew follows 1, 3, 7, 14, 30 days",
    ),
  },
];

export const DECK = {
  spec: loc(
    "做复习牌。先看题，只能点「查看答案」。翻开后对照「我的答案 / 正确答案」，再提交忘了、模糊或记得。忘了次数归零、插回今天队列末尾；模糊明天再看；记得按 1、3、7、14、30 天排下次。今日无到期时给人话空状态，不要「暂无数据」，不要做成确认弹窗或左右滑走。",
    "A recall deck. The prompt only offers Reveal answer. After the flip, compare mine / the answer, then commit forgot, fuzzy, or knew. Forgot resets the count and goes to the end of today's pile; fuzzy is tomorrow; knew schedules 1, 3, 7, 14, then 30 days. When nothing is due: a human empty state — not “no data”, not a confirm, not a swipe-away.",
  ),
  scenes: [
    loc("先看题，不能打分", "Prompt first; no grade yet"),
    loc("翻开对照再提交间隔", "Flip to compare, then commit an interval"),
    loc("今日无到期", "Nothing due today"),
  ],
  rules: [
    loc("问题面只有「查看答案」", "The prompt face only has Reveal answer"),
    loc("答案面才出现三个记得程度", "The three grades appear only on the answer face"),
    loc("忘了 ≠ 模糊：今天再看，不是明天", "Forgot ≠ fuzzy: again today, not tomorrow"),
    loc("空牌是人话加一个按钮", "Empty is a human line plus one button"),
  ],
  tells: loc(
    "翻面是为了对照。提交的是记得程度。",
    "The flip is for comparison. What you commit is how well you knew it.",
  ),
  naive: loc(
    "错的做法：左右滑走下一张，没有打分。轮播切画面；这里翻面是为了对照，提交的是记得程度。",
    "The wrong move: swipe left or right to the next card, with no grade. A carousel advances a frame. Here the flip is to compare; what you commit is how well you knew it.",
  ),
  window: loc("复习 · 今日到期", "Recall · due today"),
  emptyTitle: loc("今天没有到期的牌", "Nothing due today"),
  emptyGuidance: loc(
    "忘了的会排到今天末尾。记得的按间隔走。回来时只看到期的。",
    "Forgotten cards go to the end of today's pile. Known ones follow the interval. Come back for what is due.",
  ),
  emptyAction: loc("再练一遍", "Practice again"),
};

export const GRADE_COPY: Record<"again" | "hard" | "good", Localized> = {
  again: loc("忘了", "Forgot"),
  hard: loc("模糊", "Fuzzy"),
  good: loc("记得", "Knew"),
};
