export type ActionKind = "like" | "bookmark" | "follow" | "delete";

export type SyncPhase = "idle" | "syncing" | "synced" | "error";

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
