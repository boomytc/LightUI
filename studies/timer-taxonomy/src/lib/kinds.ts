import { loc, type Localized } from "./site-locale";
import type { KindId } from "./machines";

export type { KindId };

export type KindMeta = {
  id: KindId;
  index: string;
  name: string;
  zh: Localized;
  oneLiner: Localized;
  scenes: Localized[];
  rules: Localized[];
  spec: Localized;
  note?: Localized;
  tells: Localized;
  window: Localized;
  caption: Localized;
  hint: Localized;
};

export const KINDS: KindMeta[] = [
  {
    id: "stopwatch",
    index: "01",
    name: "Stopwatch",
    zh: loc("累计", "Stopwatch"),
    oneLiner: loc("从 0 往上走，数字是已经过了多久", "From 0 up; the number is how long has passed"),
    scenes: [
      loc("自由学习", "Free study"),
      loc("没有会话上限", "No session cap"),
      loc("暂停保留已过时间", "Pause keeps elapsed"),
    ],
    rules: [
      loc("displaySeconds = liveSeconds", "displaySeconds = liveSeconds"),
      loc("暂停保留 accumulated，结束清零", "Pause keeps accumulated; end zeros it"),
      loc("没有会话百分比，不要假番茄上限", "No session percent; no fake pomodoro cap"),
    ],
    spec: loc(
      "做累计计时。从 0 往上走，没有会话上限，数字是已经过了多久。暂停保留已过时间，结束清零。不要做成有上限的假番茄，不要用转圈代替数字。进行中切到计划，顶栏仍露出这段会话。",
      "A stopwatch. Count up from 0 with no session cap. The number is how long has passed. Pause keeps elapsed; end zeros it. Not a capped fake pomodoro. Not a spinner. While running, switching to Plan still shows this session in the top bar.",
    ),
    note: loc(
      "累计没有会话百分比。进度问的是工作能不能算，不是这一段的方向。",
      "A stopwatch has no session percent. Progress asks whether work can be measured — not which way this session runs.",
    ),
    tells: loc("数字只往上，暂停还在，结束归零", "The number only grows; pause holds; end clears"),
    window: loc("工位 · 计时", "Desk · timer"),
    caption: loc("已经过了多久", "Elapsed this session"),
    hint: loc("没有上限", "No cap"),
  },
  {
    id: "focus",
    index: "02",
    name: "Focus",
    zh: loc("专注", "Focus"),
    oneLiner: loc("从 N 分钟往下走，数字是还剩多久", "From N minutes down; the number is how long is left"),
    scenes: [
      loc("专注一段", "A focus block"),
      loc("到点停在 0", "Stop at 0"),
      loc("进度是这一段会话", "Progress is this session"),
    ],
    rules: [
      loc("displaySeconds = remaining，不要变负数", "displaySeconds = remaining; never negative"),
      loc("elapsed 到 cap 必须 pause 在 0", "Hitting the cap must pause at 0"),
      loc("环是 elapsed/cap，不是今日目标", "The ring is elapsed/cap, not today’s goal"),
    ],
    spec: loc(
      "做专注倒计时。playground 从 1 分钟往下走（产品里常用 25），数字是还剩多久。elapsed 到 cap 停在 0，不要变成负数。进度是这一段会话 elapsed/cap，不是今日目标。到点不是一条 toast。进行中顶栏仍露出这段会话。",
      "A focus countdown. The playground counts down from 1 minute (products often use 25). The number is how long is left. When elapsed hits the cap, stop at 0 — never negative. Progress is this session’s elapsed/cap, not today’s goal. Hitting zero is not a toast. While running, the top bar still shows this session.",
    ),
    note: loc(
      "到点计时器自己停在完成态。不要弹一条 toast 代替停表。",
      "Hitting zero, the timer stops itself in a done state. A toast is not a substitute for stopping.",
    ),
    tells: loc("数字往下，到 0 停住，不要变负", "The number falls, stops at 0, never goes negative"),
    window: loc("工位 · 计时", "Desk · timer"),
    caption: loc("还剩多久", "Remaining this session"),
    hint: loc("专注 1 分钟", "Focus · 1 minute"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个计时器」，说累计或专注", "Not “a timer” — stopwatch, or focus"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("这一段要往上加，还是从 N 分钟往下走", "This stretch counts up, or it counts down from N minutes"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc(
      "live 公式；暂停保留；专注停在 0；进行中顶栏仍露出",
      "The live formula; pause keeps elapsed; focus stops at 0; chrome still shows it",
    ),
  },
];
