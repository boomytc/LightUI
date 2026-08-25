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
};

export const KINDS: KindMeta[] = [
  {
    id: "reorder",
    index: "01",
    name: "Reorder",
    zh: loc("同列排序", "Reorder"),
    oneLiner: loc("松手交一份新顺序；按垂直中线插", "Commit a new order; insert on the vertical midline"),
    scenes: [
      loc("任务卡排序", "A task list"),
      loc("同列改顺序", "One list, new order"),
      loc("占位洞只是提示", "A hole is only a hint"),
    ],
    rules: [
      loc("按下后移动 6px 才抬起", "Lift after 6px"),
      loc("其余项按中线让出洞，FLIP 跟过去", "Others yield on the midline; FLIP follows"),
      loc("松手提交新顺序；Esc 取消", "Drop commits the order; Esc cancels"),
    ],
    spec: loc(
      "做同列排序。五张任务卡，按下后移动 6px 才抬起。按垂直中线计算插入下标，其余项用 FLIP 让出占位洞。松手提交一份新顺序。占位洞只是提示，不是另一种提交。靠近容器 64px 边时列表自滚，仍交新顺序。Esc 取消。",
      "A same-list reorder. Five task cards; lift after 6px. Insert on the vertical midline; others yield a hole with FLIP. Drop commits a new order. The hole is a hint, not a fifth commit. Near the 64px edge the list autoscrolls; the commit is still a new order. Esc cancels.",
    ),
    note: loc(
      "占位洞不是另一种提交。边缘滚动也不是。",
      "A placeholder hole is not another commit. Neither is autoscroll.",
    ),
    tells: loc("松手后顺序变了，还是同一列", "On drop the order changes, still one list"),
  },
  {
    id: "dropzone",
    index: "02",
    name: "Dropzone",
    zh: loc("投放区", "Dropzone"),
    oneLiner: loc("只有区内才接收；区外什么都不改", "Receive only inside the zone; outside does nothing"),
    scenes: [
      loc("丢进收件箱", "Drop into inbox"),
      loc("一次接收", "A single receive"),
      loc("区外松手", "Drop outside"),
    ],
    rules: [
      loc("只有指针在区内才高亮", "Highlight only while the pointer is inside"),
      loc("区内松手收下一次", "A drop inside receives once"),
      loc("区外松手不改模型，视觉回弹", "A drop outside leaves the model; the chip snaps back"),
    ],
    spec: loc(
      "做投放区。左侧筹码可拖，右侧虚线区只有指针在区内才高亮。区内松手接收一次；区外松手什么都不改，筹码沿路径回弹。不要做成同列排序。",
      "A dropzone. Chips on the left; a dashed zone on the right highlights only while the pointer is inside. Drop inside to receive once. Drop outside leaves the model; the chip follows its path back. Do not make it a reorder.",
    ),
    note: loc("区外松手不是一次失败的排序，是没有提交。", "A drop outside is not a failed reorder — it is no commit."),
    tells: loc("区内才亮，区外松手筹码回去", "Lights up inside; outside, the chip returns"),
  },
  {
    id: "transfer",
    index: "03",
    name: "Transfer",
    zh: loc("跨组转移", "Transfer"),
    oneLiner: loc("一次交源列、目标列和下标；源列拖时不塌", "One commit: source, dest, destIndex; source does not collapse"),
    scenes: [
      loc("从队列拖到今日", "Queue onto Today"),
      loc("跨列", "Across lists"),
      loc("源列留幽灵", "Source keeps a ghost"),
    ],
    rules: [
      loc("源列幽灵留着，拖的时候不塌", "The source ghost stays; the list does not collapse"),
      loc("目标列显示插入洞", "The destination shows a gap"),
      loc("松手一次改两列", "One drop updates both lists"),
    ],
    spec: loc(
      "做跨组转移。从队列拖到今日。源列幽灵留着、不塌；目标列显示插入洞。松手一次提交源列、目标列和下标。不要做成同列排序。",
      "A cross-list transfer. Drag from Queue onto Today. The source ghost stays — the list does not collapse. The destination shows a gap. One drop commits source, dest, and destIndex. Do not make it a same-list reorder.",
    ),
    note: loc("跨列不是同列排序。源列当场塌掉，看起来已经交了。", "Across lists is not a reorder. If the source collapses, it already looks committed."),
    tells: loc("源列还在，松手两列一起变", "Source still there; both lists change on drop"),
  },
  {
    id: "snapback",
    index: "04",
    name: "Snap-back",
    zh: loc("无效回弹", "Snap-back"),
    oneLiner: loc("无效目标：模型不变，路径倒回去", "Invalid target: model unchanged, path reverses"),
    scenes: [
      loc("拖到只读托盘", "Drop onto a read-only tray"),
      loc("拒绝提交", "A rejected drop"),
      loc("路径倒回", "The path reverses"),
    ],
    rules: [
      loc("只读托盘变红，不收下", "The read-only tray turns red and does not receive"),
      loc("数据数组保持原样", "The data arrays stay as they were"),
      loc("路径沿来路倒回，不是一次成功投放", "The path reverses — this is not a successful drop"),
    ],
    spec: loc(
      "做无效回弹。只读托盘变红，路径倒回，数据数组不变。回弹不是成功投放。",
      "An invalid snap-back. The read-only tray turns red, the path reverses, and the arrays do not change. A snap-back is not a successful drop.",
    ),
    note: loc("回弹不是成功投放。动画回去是因为目标无效。", "A snap-back is not a successful drop. It returns because the target is invalid."),
    tells: loc("只读变红，卡片沿路回去，数组没变", "Read-only turns red; the card returns; arrays stay"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「拖一下」，说新顺序、一次接收、跨组转移或无效回弹", "Not “a drag” — a new order, a receive, a transfer, or a snap-back"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("同列改顺序、丢进投放区、从队列拖到今日，还是拖到只读托盘", "Reorder a list, drop into a zone, move queue→today, or hit a read-only tray"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("松手交什么；占位洞只是提示；无效目标模型变不变", "What drop commits; the hole is a hint; whether an invalid target mutates"),
  },
];
