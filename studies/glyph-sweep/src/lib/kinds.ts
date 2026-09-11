import { loc, type Localized } from "./site-locale";
import type { SweepPath } from "./shimmer";

export type PathMeta = {
  id: SweepPath;
  index: string;
  zh: Localized;
  oneLiner: Localized;
  tells: Localized;
  rules: Localized[];
};

export const COMPARE_PATHS: PathMeta[] = [
  {
    id: "glyph",
    index: "01",
    zh: loc("跟字形", "Follow glyphs"),
    oneLiner: loc("光带裁进字母，时长跟字数", "Clip the band to letters; duration follows length"),
    tells: loc("从字形外进、字形外出", "Enters and leaves the glyphs"),
    rules: [
      loc("宽度用 ch", "Width in ch"),
      loc("时长 = 字数 × 每字秒数", "Duration = length × seconds per glyph"),
      loc("background-clip: text", "background-clip: text"),
    ],
  },
  {
    id: "box",
    index: "02",
    zh: loc("扫整块（错）", "Sweep the box (wrong)"),
    oneLiner: loc("高光扫过整块盒子，短词长句一起完", "A sheen sweeps the box; short and long finish together"),
    tells: loc("从盒子边缘切进去，盖住字", "Cuts in from the box edge and covers the type"),
    rules: [
      loc("固定像素宽", "Fixed pixel width"),
      loc("时长不跟字数", "Duration ignores length"),
      loc("这是 naive 反例", "This is the naive counterexample"),
    ],
  },
];
