import { loc, type Localized } from "./site-locale";
import { KIND_IDS, type KindId } from "./machines";

export type { KindId };
export { KIND_IDS };

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
  defaultState: string;
};

export const KINDS: KindMeta[] = [
  {
    id: "tour",
    index: "01",
    name: "Tour",
    zh: loc("漫游", "Tour"),
    oneLiner: loc("下一步推进；遮罩挖孔跟着目标；可跳过", "Advance with Next; hole follows the target; skip allowed"),
    scenes: [
      loc("第一次进工作台", "First visit to the workbench"),
      loc("三步认识页面", "Three steps around the page"),
    ],
    rules: [
      loc("下一步或跳过", "Next or Skip"),
      loc("挡住外面，孔跟着目标走", "Blocks outside; the hole follows the target"),
      loc("走完卸掉", "Unloads when done"),
    ],
    spec: loc(
      "做漫游引导。第一次进工作台，三步挖孔跟着指标卡、标题和发布走，1/3 步进，可下一步或跳过；遮罩挡住外面，走完卸掉。",
      "A tour. First visit: three steps, hole follows metric, title, then Publish. 1/3 stepper; Next or Skip. Scrim blocks outside; unload when done.",
    ),
    note: loc("漫游要可跳过。没有跳过，每一步都要挨打。", "A tour must allow Skip. Without it, every step must be endured."),
    tells: loc("1/3，下一步或跳过，孔会搬家", "1/3; Next or Skip; the hole moves"),
    defaultState: "step1",
  },
  {
    id: "coach",
    index: "02",
    name: "Coach",
    zh: loc("教练", "Coach"),
    oneLiner: loc("钉在一个按钮上，点明白了就走，页面不遮", "Pinned to one button; Got it dismisses; no dim"),
    scenes: [
      loc("发布旁一句", "One line on Publish"),
      loc("只教一个动作", "Teach a single action"),
    ],
    rules: [
      loc("点「明白了」推进", "Advance with Got it"),
      loc("无遮罩，页面仍可点", "No scrim; the page stays clickable"),
      loc("关掉即卸掉", "Unloads on confirm"),
    ],
    spec: loc(
      "做教练气泡。钉在发布按钮上，点「明白了」关闭，页面不遮罩、仍可点击。",
      "A coach bubble on Publish. Got it closes it. No scrim; the page stays clickable.",
    ),
    tells: loc("明白了，整页不暗", "Got it; the page is not dimmed"),
    defaultState: "start",
  },
  {
    id: "hotspot",
    index: "03",
    name: "Hotspot",
    zh: loc("热点", "Hotspot"),
    oneLiner: loc("新功能上的脉冲圆点，点开读完就卸掉", "A pulsing dot on a new feature; open, read, gone"),
    scenes: [
      loc("新上的模板", "A new Templates feature"),
      loc("点开才算教过", "Teaching counts after they open it"),
    ],
    rules: [
      loc("未读 → 打开 → 已读", "unread → open → read"),
      loc("不挡住页面", "Does not block the page"),
      loc("已读后圆点卸掉", "The dot unloads once read"),
    ],
    spec: loc(
      "做热点引导。新功能「模板」上一个脉冲圆点，点开阅读，关掉后圆点卸掉；不是未读数字角标。",
      "A hotspot. A pulsing dot on Templates. Open, read, dismiss — the dot unloads. Not an unread badge.",
    ),
    note: loc("热点不是未读角标。角标叠数字；热点教怎么用，读完卸掉。", "A hotspot is not an unread badge. A badge stacks a number; a hotspot teaches, then unloads."),
    tells: loc("点圆点打开，关掉就没了", "Click the dot; dismiss and it is gone"),
    defaultState: "unread",
  },
  {
    id: "spotlight",
    index: "04",
    name: "Spotlight",
    zh: loc("聚光", "Spotlight"),
    oneLiner: loc("没有下一步；必须点挖出的那个控件", "No Next — they must click the control in the hole"),
    scenes: [
      loc("先选可见范围再发布", "Pick visibility, then publish"),
      loc("逼人手点真实控件", "Force a click on the real control"),
    ],
    rules: [
      loc("点洞里的控件才推进", "Only a click on the hole advances"),
      loc("四片遮罩挡住外面", "Four panes block the outside"),
      loc("不要放下一步按钮", "Do not put a Next button"),
    ],
    spec: loc(
      "做聚光引导。遮罩挖孔，必须点洞里的可见范围，再点发布才推进；没有下一步按钮。挖孔垫 10px。",
      "A spotlight. Four-pane cutout. They must click visibility, then Publish. No Next. Pad the hole 10px.",
    ),
    note: loc("聚光不是确认弹窗。洞里是真实控件，不是「确定吗」。", "A spotlight is not a confirm dialog. The hole is a real control, not “are you sure?”"),
    tells: loc("没有下一步，只能点洞", "No Next; only the hole is live"),
    defaultState: "start",
  },
  {
    id: "checklist",
    index: "05",
    name: "Checklist",
    zh: loc("清单", "Checklist"),
    oneLiner: loc("勾任务推进；100% 标题换成入门完成，列表还在", "Checking tasks; at 100% the title becomes Ready, list stays"),
    scenes: [
      loc("入门四件事", "Four getting-started tasks"),
      loc("做完仍要能回看", "Still there after they finish"),
    ],
    rules: [
      loc("勾选推进", "Advance by checking items"),
      loc("进度条用完成比例", "The bar is the completion ratio"),
      loc("100% 仍留着", "Stays at 100%"),
    ],
    spec: loc(
      "做入门清单。四项可勾选，进度条用 scaleX 反映完成比例；到 100% 标题改成「入门完成」，列表仍留着。",
      "A getting-started checklist. Four checks; the bar uses scaleX from the ratio. At 100% the title becomes Ready; the list stays.",
    ),
    tells: loc("勾满仍留着，标题换成入门完成", "Full bar still stays; title becomes Ready"),
    defaultState: "start",
  },
  {
    id: "hint",
    index: "06",
    name: "Hint",
    zh: loc("空态", "Hint"),
    oneLiner: loc("空着才出现，填上就卸掉；两项互斥", "Appears while empty; unmounts when filled; one at a time"),
    scenes: [
      loc("空着的标题", "An empty title"),
      loc("标题填了再提权限", "Permission only after the title is filled"),
    ],
    rules: [
      loc("标题空 → 钉标题", "Empty title pins to the title"),
      loc("标题有了且未授权 → 钉权限", "Title filled and no permission pins to permission"),
      loc("填上即卸掉，不是红字", "Filling unmounts it — not a red error"),
    ],
    spec: loc(
      "做空态提示。标题空着时钉在标题上；标题填了且未选权限时改钉权限；两项互斥，填上就卸掉，不是校验红字。",
      "A hint. Empty title pins to the title. Filled title and no permission pins to permission. Mutually exclusive; filling unmounts it. Not a validation error.",
    ),
    note: loc("空态提示不是校验报错。提示在还空着时出现；校验是填错了才开口。", "A hint is not a validation error. A hint speaks while empty; validation speaks after a wrong value."),
    tells: loc("填上就走，一次只钉一处", "Leaves when filled; pins one place at a time"),
    defaultState: "start",
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「新手引导」，说漫游、聚光或空态", "Not “onboarding” — a tour, a spotlight, or a hint"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("第一次进工作台、新功能、空着的标题，还是入门清单", "First visit, a new feature, an empty title, or a getting-started list"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("何时出现、钉在谁身上、靠什么推进、结束后还挡不挡", "When it appears, what it pins to, how they advance, whether it still blocks"),
  },
];
