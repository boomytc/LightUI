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
    id: "centered",
    index: "01",
    name: "Centered card",
    zh: loc("居中卡片", "Centered card"),
    oneLiner: loc("稳妥 SaaS，卡悬浮，页面留白", "Quiet SaaS — a card floats in whitespace"),
    scenes: [
      loc("通用工具", "A generic tool"),
      loc("SaaS 工作台", "A SaaS desk"),
      loc("后台入口", "An admin gate"),
    ],
    rules: [
      loc("一格；卡片居中悬浮", "One pane; the card floats, centered"),
      loc("背景留白，不要铺满海报", "Whitespace around it; not a full-bleed poster"),
      loc("邮箱和密码同卡，不是分步", "Email and password share the card; not steps"),
    ],
    spec: loc(
      "做居中卡片式登录页。卡片悬浮，页面留白充足。不要做成左右分栏，也不要铺满沉浸背景。",
      "A centered-card login. The card floats in generous whitespace. Not a brand split, not a full-bleed wash.",
    ),
    note: loc("居中卡片是稳妥进门。整页怎么铺是骨架，不是这张卡。", "Centered is a quiet gate. How the rest of the page is laid out is a skeleton."),
    tells: loc("一张白卡停在留白里", "A white card sits in the air"),
    window: loc("North · 登录", "North · Sign in"),
  },
  {
    id: "split",
    index: "02",
    name: "Split",
    zh: loc("左右分栏", "Split"),
    oneLiner: loc("左品牌，右表单", "Brand on the left, form on the right"),
    scenes: [
      loc("创作工坊", "A studio"),
      loc("品牌工具", "A brand tool"),
      loc("要讲故事的入口", "A gate that has to speak"),
    ],
    rules: [
      loc("两格；paneCount 为 2", "Two panes; paneCount is 2"),
      loc("左边是品牌，右边是表单", "Brand left, form right"),
      loc("不是同一块底上叠表单", "Not one wash with the form sitting on it"),
    ],
    spec: loc(
      "做左右分栏登录页。左边讲品牌，右边放表单。两格都在，不要做成沉浸背景上叠一张卡。",
      "A split login. Brand on the left, form on the right. Two panes stay. Not a form sitting on an immersive wash.",
    ),
    note: loc("分栏是两格。沉浸才是一块底上叠。", "A split is two panes. Immersive is one ground."),
    tells: loc("品牌一块，表单一块", "One pane for brand, one for the form"),
    window: loc("North Studio · 登录", "North Studio · Sign in"),
  },
  {
    id: "immersive",
    index: "03",
    name: "Immersive",
    zh: loc("沉浸背景", "Immersive"),
    oneLiner: loc("全幅图或渐变上叠表单", "The form sits on a full-bleed wash"),
    scenes: [
      loc("旅行账户", "A travel account"),
      loc("活动入场", "An event gate"),
      loc("要氛围的产品", "A product that needs atmosphere"),
    ],
    rules: [
      loc("一格；表单叠在底上", "One pane; the form sits on the ground"),
      loc("加深色遮罩保证字能读", "A dark veil keeps type readable"),
      loc("不是左品牌右表单的两格", "Not a two-pane brand / form split"),
    ],
    spec: loc(
      "使用全屏沉浸背景，登录框覆盖其上，并加遮罩保证可读性。不要做成左右分栏，也不要套一张白卡。",
      "A full-bleed immersive login. The form sits on the wash, with a veil so type stays readable. Not a split, not a floating white card.",
    ),
    note: loc("沉浸是一块底。分栏才是两格。", "Immersive is one ground. A split is two panes."),
    tells: loc("表单直接铺在渐变上", "The form sits on the gradient"),
    window: loc("Trail · 登录", "Trail · Sign in"),
  },
  {
    id: "roles",
    index: "04",
    name: "Role gate",
    zh: loc("角色入口", "Role gate"),
    oneLiner: loc("先选身份，再进各自表单", "Pick an identity, then enter its form"),
    scenes: [
      loc("个人 / 企业", "Personal / enterprise"),
      loc("B2B 与 B2C 并存", "B2B and B2C together"),
      loc("字段随身份变", "Fields that follow the role"),
    ],
    rules: [
      loc("先选身份；needsRole", "Pick a role first; needsRole"),
      loc("个人和企业不是同一套字段", "Personal and enterprise are not the same fields"),
      loc("不是同一身份里的分步", "Not steps inside one identity"),
    ],
    spec: loc(
      "先用入口区分个人端和企业端，再进入各自登录表单。个人端与企业端字段不同。不要做成一张长表里的分步。",
      "A role gate: pick personal or enterprise, then each form. The fields differ. Not steps inside one identity.",
    ),
    note: loc("角色入口是先选身份。分步才是一屏一事。", "A role gate picks an identity. Steps are one job per screen."),
    tells: loc("点身份，表单跟着换", "Pick a role; the form follows"),
    window: loc("North · 身份", "North · Role"),
  },
  {
    id: "steps",
    index: "05",
    name: "Steps",
    zh: loc("分步", "Steps"),
    oneLiner: loc("邮箱再密码，一屏一件事", "Email, then password — one job per screen"),
    scenes: [
      loc("验证步骤多", "Many verify steps"),
      loc("邮箱 → 验证 → 密码", "Email → verify → password"),
      loc("不要一张长表", "Not one long form"),
    ],
    rules: [
      loc("isStepped；一屏只填一件事", "isStepped; one field per screen"),
      loc("进度条标出当前屏", "A track marks the current screen"),
      loc("不是先选个人或企业", "Not picking personal versus enterprise first"),
    ],
    spec: loc(
      "把登录拆成分步。先输入邮箱，再输入密码，一屏只完成一个任务。不要做成一张长表，也不要先选角色。",
      "Split login into steps. Email first, then password — one job per screen. Not one long form, not a role gate.",
    ),
    note: loc("分步是同一身份里拆开。角色入口才是先选身份。", "Steps split one identity. A role gate picks the identity first."),
    tells: loc("一屏一个问题，看得见走到哪", "One question per screen; you can see how far"),
    window: loc("North · 分步", "North · Steps"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个登录页」，说居中卡片或分步", "Not “make a login page” — a centered card, or steps"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("稳妥工具、品牌分栏、氛围、先选身份，还是字段太多", "A quiet tool, a brand split, atmosphere, a role, or too many fields"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("一格悬浮、两格品牌、叠在底上、先选角色、一屏一事", "One floating card, two panes, sit on the wash, pick a role, one job per screen"),
  },
];
