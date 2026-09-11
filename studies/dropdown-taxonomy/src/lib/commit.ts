import { loc, type Localized } from "./site-locale";
import type { KindId } from "./kinds";

export type CommitId = "value" | "set" | "path" | "action" | "hop" | "span";

export type CloseId = "pick" | "stay" | "leaf" | "chevron" | "nav" | "ends";

export type CommitModel = {
  id: CommitId;
  index: string;
  kinds: readonly KindId[];
  title: Localized;
  ask: Localized;
  close: Localized;
};

const COMMIT_BY_KIND: Record<KindId, CommitId> = {
  select: "value",
  grouped: "value",
  multi: "set",
  cascader: "path",
  split: "action",
  mega: "hop",
  date: "span",
};

const CLOSE_BY_KIND: Record<KindId, CloseId> = {
  select: "pick",
  grouped: "pick",
  multi: "stay",
  cascader: "leaf",
  split: "chevron",
  mega: "nav",
  date: "ends",
};

export const COMMIT_MODELS: readonly CommitModel[] = [
  {
    id: "value",
    index: "01",
    kinds: ["select", "grouped"],
    title: loc("一个值", "One value"),
    ask: loc("点中一项就交出去？", "Does one pick commit the field?"),
    close: loc("点中即关", "Closes on pick"),
  },
  {
    id: "set",
    index: "02",
    kinds: ["multi"],
    title: loc("一组", "A set"),
    ask: loc("还要再选、还要再摘？", "Will they add or peel more?"),
    close: loc("面板保持开着", "Panel stays open"),
  },
  {
    id: "path",
    index: "03",
    kinds: ["cascader"],
    title: loc("一条路径", "A path"),
    ask: loc("父级能不能当最终值？", "Can a parent be the value?"),
    close: loc("叶子才关", "Closes on a leaf"),
  },
  {
    id: "action",
    index: "04",
    kinds: ["split"],
    title: loc("一次动作", "An action"),
    ask: loc("默认要不要先打开菜单？", "Must the default open a menu?"),
    close: loc("只有箭头打开", "Only the chevron opens"),
  },
  {
    id: "hop",
    index: "05",
    kinds: ["mega"],
    title: loc("一次导航", "A hop"),
    ask: loc("这是表单值吗？", "Is this a field value?"),
    close: loc("点链接或其它项", "On a link or another item"),
  },
  {
    id: "span",
    index: "06",
    kinds: ["date"],
    title: loc("两端日期", "Two ends"),
    ask: loc("一端算不算一段？", "Is one end a span?"),
    close: loc("两端齐了才是一段", "A span needs both ends"),
  },
];

export function commitOf(id: KindId): CommitId {
  return COMMIT_BY_KIND[id];
}

export function closeOf(id: KindId): CloseId {
  return CLOSE_BY_KIND[id];
}

export function modelOf(id: KindId): CommitModel {
  const commit = commitOf(id);
  return COMMIT_MODELS.find((model) => model.id === commit) ?? COMMIT_MODELS[0]!;
}

export function firstKindOf(commit: CommitId): KindId {
  const model = COMMIT_MODELS.find((item) => item.id === commit);
  return model?.kinds[0] ?? "select";
}

export const CLOSE_LABEL: Record<CloseId, Localized> = {
  pick: loc("点中即关", "Closes on pick"),
  stay: loc("保持开着", "Stays open"),
  leaf: loc("叶子才关", "Closes on a leaf"),
  chevron: loc("只有箭头打开", "Chevron opens"),
  nav: loc("点链接才走", "A link hops"),
  ends: loc("两端齐了才是一段", "Both ends make a span"),
};

export const NAIVE: Record<KindId, Localized> = {
  select: loc("三个固定选项，点一个就关——这一档本来就是 Select。", "Three fixed options, close on pick. This one really is a Select."),
  multi: loc("选一个就关，第二项进不去。", "Picking one closes it. The second skill never gets in."),
  grouped: loc("把「设计团队」点成路径，当成上下级。", "Treat “Design” as a parent and build a path."),
  cascader: loc("把「浙江省」当成最终值，父级也能提交。", "Commit “Zhejiang” as if a parent were a finished value."),
  split: loc("默认动作藏进菜单，发布还得先打开。", "Hide Publish inside the menu. The default is one extra click away."),
  mega: loc("当成表单 Select，点一项就交一个值。", "Treat the nav as a field Select and commit a value."),
  date: loc("一个 input type=date，没有两端，也禁不了过去。", "One input type=date. No two ends, and the past stays open."),
};
