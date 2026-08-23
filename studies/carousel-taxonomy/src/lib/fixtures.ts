import { loc, type Localized } from "./site-locale";
import { SLIDE_COUNT } from "./machines";

export type SlideTone = 0 | 1 | 2 | 3;

export type Slide = {
  id: string;
  tone: SlideTone;
  kicker: Localized;
  title: Localized;
  caption: Localized;
  notes: Localized[];
};

export const SLIDES: Slide[] = [
  {
    id: "north",
    tone: 0,
    kicker: loc("01 · 北向", "01 · North"),
    title: loc("向北", "North"),
    caption: loc("整组画面先问怎么切", "Ask how the set advances"),
    notes: [
      loc("平移提交的是整页离开", "A slide commits the whole page leaving"),
      loc("圆点必须跟着 index", "Dots must follow the index"),
      loc("悬停要能暂停自动播放", "Hover must pause autoplay"),
    ],
  },
  {
    id: "lamp",
    tone: 1,
    kicker: loc("02 · 灯", "02 · Lamp"),
    title: loc("一夜", "All night"),
    caption: loc("淡入只改透明度", "A fade only changes opacity"),
    notes: [
      loc("叠在原位，不要位移", "Stack in place; do not translate"),
      loc("布局不能跟着跳", "The layout must not jump"),
      loc("减少动效仍可用透明度", "Reduced motion may still fade"),
    ],
  },
  {
    id: "ridge",
    tone: 2,
    kicker: loc("03 · 脊", "03 · Ridge"),
    title: loc("有体积", "Volume"),
    caption: loc("侧面转出来才像橱窗", "Sides rotate, or it is not a window"),
    notes: [
      loc("中间大，两侧 rotateY", "Center large; sides rotateY"),
      loc("点侧卡回到中间", "A side card comes to center"),
      loc("不是扁的轨道", "Not a flat track"),
    ],
  },
  {
    id: "camp",
    tone: 3,
    kicker: loc("04 · 营", "04 · Camp"),
    title: loc("一层一层", "Layer by layer"),
    caption: loc("近的快，远的慢", "Near is fast; far is slow"),
    notes: [
      loc("剥顶卡，不是推轨道", "Peel the top; do not push a track"),
      loc("或者沿书脊翻一页", "Or turn one page on the spine"),
      loc("360 转的是产品", "A 360 rotates the product"),
    ],
  },
];

if (SLIDES.length > SLIDE_COUNT) {
  throw new Error("carousel-taxonomy: more than four teaching slides");
}

export const SPIN_FACES: Localized[] = [
  loc("前", "Front"),
  loc("右", "Right"),
  loc("后", "Back"),
  loc("左", "Left"),
];
