export type SelectionMode = "normal" | "selecting";

export type SelectionFormula = {
  id: string;
  title: { zh: string; en: string };
  eyebrow: { zh: string; en: string };
  desc: { zh: string; en: string };
};

export const SELECTION_FORMULAS: SelectionFormula[] = [
  {
    id: "disambiguate",
    title: { zh: "手势三向消歧", en: "Three-way Gesture Disambiguation" },
    eyebrow: { zh: "单击 · 长按 · 滑屏", en: "Tap · Hold · Scroll" },
    desc: {
      zh: "原地长按 480ms 触发选择；滑动超 8px 立即转为正常滚动；短促抬起执行单击。",
      en: "Hold stationary 480ms for selection; drift > 8px cancels for scroll; quick release triggers tap.",
    },
  },
  {
    id: "space-economy",
    title: { zh: "空间动态出让", en: "Dynamic Screen Space Economy" },
    eyebrow: { zh: "纯净浏览 · 按需出现", en: "Clean View · On-demand Controls" },
    desc: {
      zh: "日常浏览隐藏复选框，文本全宽展示；进入选择模式后动态为每一项挂载勾选框。",
      en: "Hide checkboxes during normal browsing; mount checkboxes dynamically in select mode.",
    },
  },
  {
    id: "batch-dock",
    title: { zh: "批量操作底栏", en: "Batch Action Dock" },
    eyebrow: { zh: "底部拇指热区", en: "Bottom Thumb Reach" },
    desc: {
      zh: "进入选择模式后底部滑出主动作栏（移动/下载/删除/同步），并支持一键全选与取消。",
      en: "Slide up bottom action bar for batch operations, with one-tap select-all and cancel.",
    },
  },
];
