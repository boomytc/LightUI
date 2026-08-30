import { loc, type Localized } from "./site-locale";

export type RiskLevel = "reversible" | "light" | "medium" | "severe" | "irreversible";

export type ConfirmSlug = "undo" | "hold" | "swipe" | "pop" | "modal" | "type" | "select";

export type ConfirmPattern = {
  slug: ConfirmSlug;
  id: string;
  title: Localized;
  eyebrow: Localized;
  risk: RiskLevel;
  riskLabel: Localized;
  interruptWeight: Localized;
  scenes: Localized;
  caption: Localized;
  rulePrompt: Localized;
};

export const RISK_LADDER: {
  level: RiskLevel;
  label: Localized;
  advice: Localized;
  slugs: ConfirmSlug[];
}[] = [
  {
    level: "reversible",
    label: loc("后果可逆", "Reversible"),
    advice: loc("用事后撤销（零打断）", "Use Undo Toast (Zero interrupt)"),
    slugs: ["undo"],
  },
  {
    level: "light",
    label: loc("轻微风险 · 防误触", "Mild Risk · Anti-slip"),
    advice: loc("用长按蓄力或滑动露出", "Use Hold-to-confirm or Swipe-to-reveal"),
    slugs: ["hold", "swipe"],
  },
  {
    level: "medium",
    label: loc("中等局部风险", "Medium Local Risk"),
    advice: loc("用锚点气泡确认（局部打断）", "Use Popconfirm (Local interrupt)"),
    slugs: ["pop"],
  },
  {
    level: "severe",
    label: loc("严重破坏性决策", "Severe Decision"),
    advice: loc("用模态弹窗（全局阻断）", "Use Modal Dialog (Global blocking)"),
    slugs: ["modal"],
  },
  {
    level: "irreversible",
    label: loc("不可逆 · 最高风险", "Irreversible · Maximum Risk"),
    advice: loc("用文本匹配或后果清单勾选页", "Use Type-to-confirm or Checklist review"),
    slugs: ["type", "select"],
  },
];

export const PATTERNS: ConfirmPattern[] = [
  {
    slug: "undo",
    id: "01",
    title: loc("撤销式补救", "Undo Toast"),
    eyebrow: loc("事后可逆 · 零打断", "Post-action · Zero Interrupt"),
    risk: "reversible",
    riskLabel: loc("后果可逆", "Reversible"),
    interruptWeight: loc("零打断 · 5s 撤回", "Zero interrupt · 5s Undo"),
    scenes: loc("发信、归档、移入废纸篓、关注", "Send email, archive, trash, follow"),
    caption: loc(
      "风险低且完全可逆时直接乐观执行，顶部提供明确的 5 秒撤销入口",
      "Execute optimistically for reversible actions and provide a clear 5s undo entry",
    ),
    rulePrompt: loc(
      "对可逆操作不要弹阻断框。点击立即执行并在顶部展示倒计时 Undo toast，写清对象，超时后真正提交。",
      "Do not use blocking dialogs for reversible actions. Execute instantly and show an undo toast with the object name.",
    ),
  },
  {
    slug: "hold",
    id: "02",
    title: loc("长按蓄力确认", "Hold to Confirm"),
    eyebrow: loc("时间门槛 · 防手滑", "Time Barrier · Anti-slip"),
    risk: "light",
    riskLabel: loc("轻微风险", "Mild Risk"),
    interruptWeight: loc("连续按压 2 秒", "Continuous 2s press"),
    scenes: loc("移动端危险按钮、录音/快照删除", "Mobile dangerous buttons, voice memo deletion"),
    caption: loc(
      "持续按住 2 秒才执行，中途松手或指针移开即取消，有效防止手滑误触",
      "Hold for 2 seconds to confirm; releasing or drifting immediately cancels",
    ),
    rulePrompt: loc(
      "使用 pointer capture + rAF 实时填充进度，touch-action: none 阻止系统菜单打断，松手归零。",
      "Use pointer capture + rAF progress fill, set touch-action: none against context menus, cancel on release.",
    ),
  },
  {
    slug: "swipe",
    id: "03",
    title: loc("滑动露出删除", "Swipe to Reveal"),
    eyebrow: loc("空间隔离 · 两步手势", "Spatial Isolation · Two-step"),
    risk: "light",
    riskLabel: loc("轻微风险", "Mild Risk"),
    interruptWeight: loc("两步手势露出", "Two-step gesture"),
    scenes: loc("列表单项清理、行程记录、消息单条", "List row clean, itinerary item, message"),
    caption: loc(
      "将危险操作藏在内容层下方，向左滑动超过阈值露出，再次点击才执行",
      "Hide danger triggers below content; drag past threshold to reveal and tap again to delete",
    ),
    rulePrompt: loc(
      "指针追踪 dx，超过 56px 阈值吸附露出，未过阈值松手回弹，杜绝每一行常驻红色按钮。",
      "Track dx with pointer; snap open past 56px threshold, snap back otherwise; never leave red buttons permanently exposed.",
    ),
  },
  {
    slug: "pop",
    id: "04",
    title: loc("锚点气泡确认", "Popconfirm"),
    eyebrow: loc("局部贴附 · 不蒙全屏", "Anchored · No Full Scrim"),
    risk: "medium",
    riskLabel: loc("中等局部风险", "Medium Local Risk"),
    interruptWeight: loc("局部气泡提醒", "Local popover"),
    scenes: loc("自动化规则移除、单个接口断开", "Automation rule removal, single webhook disconnect"),
    caption: loc(
      "气泡贴着触发按钮展开，提醒到位且不会遮挡页面其余操作",
      "Popover anchors next to the button, giving focused notice without masking the whole screen",
    ),
    rulePrompt: loc(
      "相对触发器定位，不 portal 到全屏遮罩，文案写清具体对象与局部后果，点空白处关闭。",
      "Position relative to trigger without full backdrop; specify entity and consequence; close on outside click.",
    ),
  },
  {
    slug: "modal",
    id: "05",
    title: loc("模态弹窗确认", "Modal Confirm"),
    eyebrow: loc("全局强阻断 · 焦点锁定", "Global Blocking · Focus Trap"),
    risk: "severe",
    riskLabel: loc("严重破坏决策", "Severe Consequence"),
    interruptWeight: loc("蒙版全阻断", "Full backdrop mask"),
    scenes: loc("删除重要文档、停用共享、移除关键成员", "Delete important doc, disable share, remove key member"),
    caption: loc(
      "强遮罩阻断页面操作，强迫用户在取消与破坏动作间做出明确选择",
      "Strong backdrop blocks page interactions, forcing an explicit choice between Cancel and Danger",
    ),
    rulePrompt: loc(
      "全屏蒙版阻断，焦点默认落在取消按钮上，Esc 或取消安全退出，危险按钮使用 danger 警示色。",
      "Full scrim blocks background; focus trap defaults to Cancel; Esc exits cleanly; danger accent for confirm.",
    ),
  },
  {
    slug: "type",
    id: "06",
    title: loc("文本匹配确认", "Type to Confirm"),
    eyebrow: loc("认知摩擦 · 精确匹配", "Cognitive Friction · Exact Match"),
    risk: "irreversible",
    riskLabel: loc("不可逆高危", "Irreversible High Risk"),
    interruptWeight: loc("键入特定字符", "Type exact string"),
    scenes: loc("生产数据库销毁、清空代码仓库、重置主节点", "Drop production DB, wipe repo, reset master node"),
    caption: loc(
      "完整展示受影响规模与依赖服务，必须精确键入指定字符（如 DELETE）才解锁按钮",
      "Fully enumerate dependencies; require typing DELETE or repo name to unlock danger button",
    ),
    rulePrompt: loc(
      "先列出记录数与依赖服务，受控输入精准比对，未匹配前严格 disabled，防止肌肉记忆误触。",
      "List record counts and dependencies first; strict controlled match required to unlock danger button.",
    ),
  },
  {
    slug: "select",
    id: "07",
    title: loc("后果清单勾选页", "Checklist Review"),
    eyebrow: loc("全幅面板 · 强制阅读", "Full Panel · Forced Reading"),
    risk: "irreversible",
    riskLabel: loc("最高风险 · 组织注销", "Maximum Risk · Space Offboarding"),
    interruptWeight: loc("独立全幅确认页", "Dedicated full review page"),
    scenes: loc("注销团队空间、清空组织所有资产、解散项目", "Workspace offboarding, organization wipe, delete project"),
    caption: loc(
      "采用全幅独立确认面板，逐条陈列即将抹除的内容，必须全部勾选方可执行注销",
      "Use a dedicated full-width panel; list all consequence items and require 100% check-off",
    ),
    rulePrompt: loc(
      "独立确认页面，左侧陈列规模，右侧逐项陈列文档、成员、密钥等后果，全部勾选方可执行。",
      "Dedicated full panel; summary on the left, consequence checklist on the right; all must be checked before commit.",
    ),
  },
];
