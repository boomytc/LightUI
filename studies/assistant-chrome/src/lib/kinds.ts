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
};

export const KINDS: KindMeta[] = [
  {
    id: "chat",
    index: "01",
    name: "Chat",
    zh: loc("对话式", "Chat"),
    oneLiner: loc("整页都是消息列表，聊到哪算哪", "A full-page message list; talk until it lands"),
    scenes: [
      loc("想法还散着", "Ideas still loose"),
      loc("开放问题", "An open question"),
      loc("还没想清楚要什么", "Not sure what you want yet"),
    ],
    rules: [
      loc("messages[] 是唯一真相", "messages[] is the only source of truth"),
      loc("Enter 发送必须避开 IME 组字", "Enter must not send while IME is composing"),
      loc("假消息即可，不要接模型", "Fake messages only; no model calls"),
    ],
    spec: loc(
      "做整页对话助手。消息列表占满这一页，输入框在底。Enter 发送，组字中的回车是上屏不是提交。假消息即可，不要接模型。",
      "A full-page chat. The message list fills the page; the composer sits at the bottom. Enter sends; Enter while composing commits the IME, it does not send. Fake messages only; no model.",
    ),
    note: loc("组字中的 Enter 是上屏，不是发送。", "Enter while composing commits the IME; it does not send."),
    tells: loc("整页都是对话，占满这一页", "Chat occupies the whole page"),
    window: loc("助手 · 对话", "Assistant · chat"),
  },
  {
    id: "panel",
    index: "02",
    name: "Side panel",
    zh: loc("面板分割", "Side panel"),
    oneLiner: loc("左边干活，右边一张建议卡", "Work on the left, one suggestion card on the right"),
    scenes: [
      loc("写代码", "Write code"),
      loc("改文档", "Edit a document"),
      loc("选中哪段改哪段", "Change the selection"),
    ],
    rules: [
      loc("选区即上下文", "The selection is the context"),
      loc("侧栏是建议卡，不是对话流", "The rail is a suggestion card, not a chat stream"),
      loc("应用前压进撤销栈", "Push undo before apply"),
    ],
    spec: loc(
      "做左干活右建议卡。选中哪段改哪段。侧栏是一段建议加应用 / 撤销，不是完整对话流。",
      "Work on the left, a suggestion card on the right. The selection is what it changes. The rail is one note plus apply / undo, not a chat stream.",
    ),
    note: loc("侧栏建议卡不是对话流。", "A suggestion card is not a chat stream."),
    tells: loc("选区在左，建议在右，能应用也能撤销", "Selection left, advice right; apply or undo"),
    window: loc("编辑器 · tasks.js", "Editor · tasks.js"),
  },
  {
    id: "plugin",
    index: "03",
    name: "Plugin",
    zh: loc("插件式", "Plugin"),
    oneLiner: loc("宿主页面不动，选中才出工具条", "The host does not move; a toolbar appears on select"),
    scenes: [
      loc("老产品加能力", "Add capability to an old product"),
      loc("不想改习惯", "Do not change the habit"),
      loc("划词即用", "Select, then act"),
    ],
    rules: [
      loc("选区必须落在宿主里", "The selection must sit in the host"),
      loc("点击工具条前 cloneRange 存下来", "cloneRange before the toolbar click"),
      loc("动作要短，不要长出一轮聊天", "Short actions; do not grow a chat"),
    ],
    spec: loc(
      "做宿主页面原样不动的插件。选中文字才出工具条；点击工具条要保存 Range。不要改成弹窗，不要加侧栏。",
      "A plugin on an unchanged host. Select text, then a toolbar. Save the Range on click. Not a dialog. Not a rail.",
    ),
    note: loc("选区工具条不是弹窗。", "A selection toolbar is not a dialog."),
    tells: loc("页面原样，划选才冒工具条", "The page stays; select to see the toolbar"),
    window: loc("文档 · 发布说明", "Doc · release notes"),
  },
  {
    id: "float",
    index: "04",
    name: "Float",
    zh: loc("浮层助手", "Float"),
    oneLiner: loc("可拖的小窗，不改页面骨架", "A draggable mini window; the skeleton does not change"),
    scenes: [
      loc("跨页问一句", "Ask one question across a page"),
      loc("正在读的文档", "A document you are reading"),
      loc("不想切换窗口", "Do not switch windows"),
    ],
    rules: [
      loc("球可拖，不改骨架", "The ball drags; the skeleton stays"),
      loc("弹出层是迷你 Composer，不是整页 Chat", "The pop is a mini composer, not a full-page chat"),
      loc("没有任务时不要自动弹出", "Do not auto-open with no task"),
    ],
    spec: loc(
      "做可拖的浮层小窗。页面骨架不动。球在角落，点开问一句，不要做成整页聊天。",
      "A draggable float. The page skeleton does not change. A ball in the corner; open it to ask one thing. Not a full-page chat.",
    ),
    note: loc("不改页面骨架。", "The page skeleton does not change."),
    tells: loc("骨架还在，角落一个可拖的球", "The skeleton stays; a draggable ball in the corner"),
    window: loc("云文档 · Q3", "Cloud doc · Q3"),
  },
  {
    id: "canvas",
    index: "05",
    name: "Canvas",
    zh: loc("画布", "Canvas"),
    oneLiner: loc("助手在无限画布上的节点，不是聊天窗", "The assistant is a node on an infinite canvas, not a chat window"),
    scenes: [
      loc("头脑风暴", "A brainstorm"),
      loc("点子摊开", "Spread ideas"),
      loc("空间记忆", "Spatial memory"),
    ],
    rules: [
      loc("空白处拖是平移，卡片上拖是移动节点", "Drag empty space to pan; drag a card to move it"),
      loc("输出是节点和连线", "Output is nodes and edges"),
      loc("不要聊天气泡", "Not chat bubbles"),
    ],
    spec: loc(
      "做无限画布上的助手节点。点子是卡片，关系是连线。不要做成聊天窗。空白处拖是平移。",
      "Assistant nodes on an infinite canvas. Ideas are cards; relations are edges. Not a chat window. Drag empty space to pan.",
    ),
    note: loc("发散用空间，收敛才用对话。", "Spread in space; use chat when you need to converge."),
    tells: loc("点子是卡片，不是气泡", "Ideas are cards, not bubbles"),
    window: loc("白板 · 点子", "Board · ideas"),
  },
  {
    id: "invisible",
    index: "06",
    name: "Invisible",
    zh: loc("看不见", "Invisible"),
    oneLiner: loc("快捷键触发，没有常驻铬", "A shortcut; no resident chrome"),
    scenes: [
      loc("相册分类", "Sort an album"),
      loc("邮件归档", "File mail"),
      loc("不需要来回讨论", "No back-and-forth"),
    ],
    rules: [
      loc("不加聊天、悬浮球、侧栏", "No chat, no ball, no rail"),
      loc("结果写进已有 UI", "Write results into the UI that is already there"),
      loc("标签可逆", "Tags are reversible"),
    ],
    spec: loc(
      "做没有常驻铬的助手。快捷键触发，结果写进已有界面。不要加聊天、悬浮球或侧栏。",
      "An assistant with no resident chrome. A shortcut fires it; results write into the UI that is already there. No chat, no ball, no rail.",
    ),
    note: loc("没有常驻铬。需要讨论时再升级成对话或面板。", "No resident chrome. Upgrade to chat or a panel when you need to discuss."),
    tells: loc("相册还是相册，按 K 才写回标签", "The album is still an album; press K to write tags back"),
    window: loc("相册", "Photos"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个聊天」，说对话、侧栏、插件、浮层、画布、看不见", "Not “make a chat” — chat, a rail, a plugin, a float, a canvas, or invisible"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("发散、对着选区改、老产品、跨页问一句、点子摊开，还是后台写回", "Loose ideas, change the selection, an old product, one question, spread ideas, or write back"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("占不占整页、要不要选区、铬看不看得见", "Occupies the page, needs a selection, chrome visible or not"),
  },
];
