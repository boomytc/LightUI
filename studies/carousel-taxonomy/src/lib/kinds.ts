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
    id: "classic",
    index: "01",
    name: "Slide",
    zh: loc("经典左右滑", "Classic slide"),
    oneLiner: loc("整页平移，圆点跟着当前页", "Whole frames translateX; dots track the page"),
    scenes: [
      loc("资讯头条", "Headlines"),
      loc("活动 Banner", "A campaign banner"),
      loc("需要快速扫过的列表", "A list you scan past"),
    ],
    rules: [
      loc("轨道只动画 transform: translateX", "The track only tweens transform: translateX"),
      loc("圆点与当前页双向绑定", "Dots and the index stay in sync"),
      loc("悬停暂停自动播放；减少动效则关掉并跳切", "Hover pauses autoplay; reduced motion jumps"),
    ],
    spec: loc(
      "做经典左右滑轮播。四张画面整页水平平移，只动画 transform: translateX，过渡约 480ms。底部圆点与当前页双向绑定，左右箭头切换。自动播放时悬停暂停；系统减少动效时关掉自动播放并直接跳到下一张。不要淡入或 3D。",
      "A classic slide carousel. Four frames translateX as whole pages, transform only, ~480ms. Dots stay bound to the index; arrows step. Hover pauses autoplay; reduced motion kills autoplay and jumps. No fade, no 3D.",
    ),
    tells: loc("整页在轨道上平移", "Whole pages move on a track"),
  },
  {
    id: "fade",
    index: "02",
    name: "Fade",
    zh: loc("淡入式", "Fade"),
    oneLiner: loc("叠在原位，只改透明度", "Stacked in place; opacity only"),
    scenes: [
      loc("品牌官网", "A brand site"),
      loc("大图 Banner", "A large banner"),
      loc("不要中间闪一刀", "When a hard cut would flash"),
    ],
    rules: [
      loc("全部绝对定位叠放，切页只改 opacity", "All slides stacked; the cut is opacity"),
      loc("不要位移，避免布局跳动", "No translation — no layout jump"),
      loc("圆点同步当前页；减少动效仍可用透明度", "Dots sync the index; reduced motion still fades"),
    ],
    spec: loc(
      "做淡入式轮播。四张叠在同一位置，切换只改 opacity，不要位移，避免布局跳动。圆点同步当前页。悬停暂停自动播放；减少动效时仍用透明度切换。不要左右滑。",
      "A fade carousel. Four frames stacked in one place; switch opacity only — no translation, no layout jump. Dots sync the index. Hover pauses autoplay; reduced motion still fades. Do not slide sideways.",
    ),
    note: loc("淡入不是平移变慢。切法是透明度，不是轨道。", "Fade is not a slower slide. The cut is opacity, not a track."),
    tells: loc("画面在原位交叉淡入", "Frames crossfade in place"),
  },
  {
    id: "coverflow",
    index: "03",
    name: "Coverflow",
    zh: loc("3D 旋转木马", "3D coverflow"),
    oneLiner: loc("中间大、两侧旋转，点侧卡回到中间", "Center large, sides rotate; a side card comes to center"),
    scenes: [
      loc("作品集", "A portfolio"),
      loc("项目橱窗", "A project window"),
      loc("一次看见三张", "Three cards in view"),
    ],
    rules: [
      loc("父级透视；中间正面，两侧 rotateY 约 40°", "Perspective; center faces you, sides rotateY ~40°"),
      loc("点侧卡或箭头，被选中的滑到中间", "A side card or arrow brings the pick to center"),
      loc("圆点同步当前中心卡", "Dots sync the center card"),
    ],
    spec: loc(
      "做 3D 旋转木马。中间卡片最大且正面朝向观众，左右两侧缩小并沿 Y 轴旋转约 40°，带透视。点侧卡或左右箭头，被选中的滑到中间。圆点同步当前中心卡。不要做成平面左右滑。",
      "A 3D coverflow. The center card is largest and faces you; sides scale down and rotateY ~40° with perspective. Click a side card or an arrow to bring it to center. Dots sync the center. Not a flat track.",
    ),
    tells: loc("侧面有体积，不是扁的轨道", "The sides have volume, not a flat track"),
  },
  {
    id: "stack",
    index: "04",
    name: "Stack",
    zh: loc("卡片堆叠", "Card stack"),
    oneLiner: loc("剥走顶卡，下一张露出来", "Peel the top card; the next one shows"),
    scenes: [
      loc("商品推荐", "Product picks"),
      loc("内容卡片流", "A card feed"),
      loc("一次处理一张", "One card at a time"),
    ],
    rules: [
      loc("只看见顶上三张；顶卡可拖或按箭头飞出", "Three cards visible; peel the top with drag or arrows"),
      loc("下面的卡略抬、略转、略缩", "Cards below lift, rotate, and scale a little"),
      loc("圆点同步当前顶卡；不要水平轨道", "Dots sync the top card; not a horizontal track"),
    ],
    spec: loc(
      "做卡片堆叠轮播。三到四张像扑克牌叠在一起，最上面一张可左右拖走或按箭头飞出，下一张顶上并略微抬起。圆点同步当前顶卡。不要做成水平轨道。",
      "A card stack. Three or four cards like a deck. Peel the top with a drag or an arrow; the next one lifts. Dots sync the top card. Not a horizontal track.",
    ),
    note: loc("叠卡是剥顶。平移才是轨道。", "A stack peels the top. A track is a slide."),
    tells: loc("处理的是顶上那一张", "You handle the card on top"),
  },
  {
    id: "flip",
    index: "05",
    name: "Flip",
    zh: loc("翻页式", "Page flip"),
    oneLiner: loc("沿书脊翻过去，左右两页同时可见", "Turn on the spine; both pages stay in view"),
    scenes: [
      loc("电子杂志", "A digital magazine"),
      loc("品牌画册", "A brand lookbook"),
      loc("要有书的手感", "When it should feel like a book"),
    ],
    rules: [
      loc("左右两页同时可见", "Left and right pages are both visible"),
      loc("下一页时右页沿书脊 rotateY(-180deg)", "Next: the right page rotateY(-180deg) on the spine"),
      loc("不要左右滑", "Do not slide sideways"),
    ],
    spec: loc(
      "做翻页式画册。左右两页同时可见，像打开的杂志。翻下一页时右页沿书脊做 rotateY(-180deg) 的 3D 翻转。圆点同步当前页。杂志感，不要左右滑。",
      "A page-flip lookbook. Both pages visible, like an open magazine. Next turns the right page rotateY(-180deg) on the spine. Dots sync the spread. Not a sideways slide.",
    ),
    tells: loc("有书脊，不是轨道", "There is a spine, not a track"),
  },
  {
    id: "accordion",
    index: "06",
    name: "Accordion",
    zh: loc("手风琴画廊", "Accordion gallery"),
    oneLiner: loc("一项展开，其余只露一条边", "One expands; the others keep a strip"),
    scenes: [
      loc("摄影集", "A photo set"),
      loc("作品墙", "A wall of work"),
      loc("还想看见旁边几张", "When the neighbors should stay visible"),
    ],
    rules: [
      loc("当前项展开，其余收窄", "The current column grows; the others shrink"),
      loc("改的是列宽，不是切走整屏", "Columns retune; the view is not taken away"),
      loc("圆点与当前展开项同步", "Dots sync the expanded item"),
    ],
    spec: loc(
      "做手风琴画廊。四张竖图横排，当前项展开、其余只露一条边。点击或箭头切换展开项，圆点同步。不要做成一次只露一张的轨道轮播。",
      "An accordion gallery. Four vertical frames in a row; the current one expands, the others keep a strip. Click or arrows retune which is open; dots sync. Not a one-frame track.",
    ),
    note: loc("手风琴还看得见旁边。轨道会把整块切走。", "An accordion still shows neighbors. A track takes the view away."),
    tells: loc("旁边还露着，没有切走", "Neighbors stay; the view is not cut away"),
  },
  {
    id: "spin",
    index: "07",
    name: "360°",
    zh: loc("360° 旋转展示", "360° spin"),
    oneLiner: loc("转的是产品角度，不是一组幻灯片", "You rotate a product, not a slide list"),
    scenes: [
      loc("电商产品图", "Product shots"),
      loc("硬件展示", "Hardware"),
      loc("要看一圈细节", "When you need every angle"),
    ],
    rules: [
      loc("拖的是 rotateY，不是切页", "Drag changes rotateY, not the page"),
      loc("圆点 / 滑杆同步同一角度", "Dots and the slider share one angle"),
      loc("不要做成四张侧面图左右滑", "Do not turn four side photos into a track"),
    ],
    spec: loc(
      "做 360° 产品旋转展示。中央是可拖的立方体，转的是产品角度，不是一组幻灯片。圆点与滑杆同步同一角度。不要做成图片左右滑。",
      "A 360° product turn. The cube in the middle is dragged; you rotate an object, not a list of slides. Dots and the slider share one angle. Not a sideways photo track.",
    ),
    note: loc("360 转的是物体。木马转的是一组卡片。", "360 rotates an object. Coverflow rotates a set of cards."),
    tells: loc("按住转一圈，不是翻下一张", "Hold and turn — you are not paging"),
  },
  {
    id: "parallax",
    index: "08",
    name: "Parallax",
    zh: loc("视差轮播", "Parallax"),
    oneLiner: loc("远近层用 0.3 / 0.7 / 1.0 错速", "Near and far move at 0.3 / 0.7 / 1.0"),
    scenes: [
      loc("品牌首页", "A brand home"),
      loc("活动主视觉", "A campaign hero"),
      loc("要有远近", "When depth should read"),
    ],
    rules: [
      loc("背景 0.3、中层 0.7、前景 1.0", "Background 0.3, mid 0.7, foreground 1.0"),
      loc("切页共用同一进度，只改 transform", "One progress drives every layer; transform only"),
      loc("圆点同步当前场景；不要单层左右滑", "Dots sync the scene; not a single-layer slide"),
    ],
    spec: loc(
      "做视差轮播。背景、中层、前景用不同位移系数（0.3 / 0.7 / 1.0）错开，切页时三层共用同一进度。圆点同步当前场景。品牌主视觉，不要单层左右滑。",
      "A parallax carousel. Background, mid, and foreground shift at 0.3 / 0.7 / 1.0 on one progress. Dots sync the scene. A brand hero, not a single-layer slide.",
    ),
    tells: loc("远的慢、近的快", "Far is slow; near is fast"),
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「轮播」，说左右滑、淡入或 360", "Not “a carousel” — a slide, a fade, or a 360"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("Banner、橱窗、叠卡、画册，还是产品转一圈", "A banner, a window, a stack, a book, or a product turn"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("平移、只改透明度、剥顶卡、沿书脊翻，还是转角度", "Translate, opacity only, peel, turn on a spine, or rotate"),
  },
];
