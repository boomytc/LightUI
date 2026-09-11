export type SelectionMode = "normal" | "selecting";

export type SelectionFormula = {
  id: "open" | "select" | "scroll";
  title: { zh: string; en: string };
  eyebrow: { zh: string; en: string };
  desc: { zh: string; en: string };
};

export const SELECTION_FORMULAS: SelectionFormula[] = [
  {
    id: "open",
    title: { zh: "打开", en: "Open" },
    eyebrow: { zh: "单击 · 未满 480ms", en: "Tap · under 480ms" },
    desc: {
      zh: "按下后很快抬起，且位移仍在 8px 容差内：当作单击，推入详情，不进入多选。",
      en: "Release before 480ms with drift inside 8px: treat as a tap and open detail.",
    },
  },
  {
    id: "select",
    title: { zh: "进入选择", en: "Enter select" },
    eyebrow: { zh: "按住 ≥480ms", en: "Hold ≥480ms" },
    desc: {
      zh: "原地按住满 480ms：切到多选模式，勾上当前项，复选框与底部操作条同时挂上。",
      en: "Hold still past 480ms: enter multi-select, check this row, mount checkboxes and the dock.",
    },
  },
  {
    id: "scroll",
    title: { zh: "滚动", en: "Scroll" },
    eyebrow: { zh: "位移 >8px", en: "Drift >8px" },
    desc: {
      zh: "手指一滑出 8px 半径，立刻毁掉长按计时，把指针还给列表滚动。",
      en: "The moment drift leaves the 8px radius, kill the hold timer and yield to native scroll.",
    },
  },
];
