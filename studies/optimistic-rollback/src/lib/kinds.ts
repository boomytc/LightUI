export type ActionKind = "like" | "bookmark" | "follow" | "delete";

export type SyncPhase = "idle" | "syncing" | "synced" | "error";

export type PathId = "lead" | "rollback" | "forbid";

export type PathFormula = {
  id: PathId;
  title: { zh: string; en: string };
  eyebrow: { zh: string; en: string };
  desc: { zh: string; en: string };
  kinds: ActionKind[];
};

export const PATHS: PathFormula[] = [
  {
    id: "lead",
    title: { zh: "先行", en: "Lead" },
    eyebrow: { zh: "成功默认", en: "Success default" },
    desc: {
      zh: "可逆低风险：UI 立刻翻到目标值，网络在后台静默同步。",
      en: "Reversible and low-risk: the UI flips now; the network syncs quietly.",
    },
    kinds: ["bookmark", "like", "follow"],
  },
  {
    id: "rollback",
    title: { zh: "回滚", en: "Rollback" },
    eyebrow: { zh: "快照还原", en: "Restore snapshot" },
    desc: {
      zh: "失败不撒谎：按点击前的快照原位弹回，并说清原因。",
      en: "Failure does not lie: snap back to the pre-click snapshot and say why.",
    },
    kinds: ["bookmark", "like", "follow"],
  },
  {
    id: "forbid",
    title: { zh: "禁止乐观", en: "Forbid" },
    eyebrow: { zh: "高风险等待", en: "High-risk wait" },
    desc: {
      zh: "不可逆操作不先行：锁定触发器，等服务端回执再提交。",
      en: "Irreversible work does not lead: lock the trigger and wait for the ACK.",
    },
    kinds: ["delete"],
  },
];

export const PATH_STEPS: Record<
  PathId,
  { id: "trigger" | "syncing" | "end"; zh: string; en: string }[]
> = {
  lead: [
    { id: "trigger", zh: "存快照", en: "Snapshot" },
    { id: "syncing", zh: "UI 先行", en: "UI leads" },
    { id: "end", zh: "确认", en: "Commit" },
  ],
  rollback: [
    { id: "trigger", zh: "存快照", en: "Snapshot" },
    { id: "syncing", zh: "UI 先行", en: "UI leads" },
    { id: "end", zh: "回滚", en: "Rollback" },
  ],
  forbid: [
    { id: "trigger", zh: "锁定", en: "Lock" },
    { id: "syncing", zh: "等回执", en: "Await ACK" },
    { id: "end", zh: "再提交", en: "Then commit" },
  ],
};

export type ActionFormula = {
  kind: ActionKind;
  title: { zh: string; en: string };
  eyebrow: { zh: string; en: string };
  allowOptimistic: boolean;
  desc: { zh: string; en: string };
};

export const ACTION_FORMULAS: ActionFormula[] = [
  {
    kind: "like",
    title: { zh: "点赞操作", en: "Like Action" },
    eyebrow: { zh: "高频 · 可逆", en: "Frequent · Reversible" },
    allowOptimistic: true,
    desc: {
      zh: "默认成功路径，UI 即时翻转，后台静默同步；失败原位回滚并给轻提示。",
      en: "Default success path, UI flips instantly, syncs in background; rolls back on failure.",
    },
  },
  {
    kind: "bookmark",
    title: { zh: "收藏内容", en: "Bookmark Content" },
    eyebrow: { zh: "单体 · 可逆", en: "Single-item · Reversible" },
    allowOptimistic: true,
    desc: {
      zh: "记录快照，立即点亮收藏图标；断网或接口报错自动恢复未收藏。",
      en: "Captures snapshot, lights up icon immediately; reverts on network error.",
    },
  },
  {
    kind: "follow",
    title: { zh: "关注用户", en: "Follow User" },
    eyebrow: { zh: "关系 · 连击幂等", en: "Relationship · Idempotent" },
    allowOptimistic: true,
    desc: {
      zh: "连击采用最新 Token 序列防竞态，避免前后请求乱序返回导致状态闪烁。",
      en: "Sequential token prevents race conditions on rapid multi-clicks.",
    },
  },
  {
    kind: "delete",
    title: { zh: "彻底删除", en: "Permanent Delete" },
    eyebrow: { zh: "高风险 · 不可逆", en: "High-risk · Irreversible" },
    allowOptimistic: false,
    desc: {
      zh: "不可逆高风险操作严禁乐观更新，必须显式等待服务端确认提交。",
      en: "Irreversible actions forbid optimistic updates; must wait for server confirmation.",
    },
  },
];
