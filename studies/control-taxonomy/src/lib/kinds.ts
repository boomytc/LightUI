import { loc, type Localized } from "./site-locale";
import type { ControlId } from "./machines";

export type KindId = ControlId;

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
  defaultState: string;
};

export const KINDS: KindMeta[] = [
  {
    id: "text-field",
    index: "01",
    name: "Text field",
    zh: loc("单行文本", "Text field"),
    oneLiner: loc("姓名、邮箱，只填一行短内容", "A name or email — one short line"),
    scenes: [
      loc("注册邮箱", "Sign-up email"),
      loc("姓名", "A name"),
      loc("公司名", "A company"),
    ],
    rules: [
      loc("用户自己填写", "The person types it"),
      loc("内容通常不超过一行", "Usually one line"),
      loc("失焦才说空，不要输入时就报错", "Claim empty on blur, not while typing"),
    ],
    spec: loc(
      "做单行文本「姓名」。标签在上，星号标必填，占位「请输入真实姓名」。失焦时空值提示「请填写姓名」，不要做成多行。",
      "A required name text field. Label above, asterisk for required, placeholder “Your name”. On blur, empty claims “Enter a name”. Not a textarea.",
    ),
    note: loc("短内容用一行。一段话才用多行。", "One line for a short value. A paragraph is a textarea."),
    tells: loc("一行，失焦才说空", "One line; empty is claimed on blur"),
    defaultState: "empty",
  },
  {
    id: "textarea",
    index: "02",
    name: "Textarea",
    zh: loc("多行文本", "Textarea"),
    oneLiner: loc("简介、需求，要写一段就用它", "A bio or a brief — a block of text"),
    scenes: [
      loc("需求描述", "A brief"),
      loc("意见反馈", "Feedback"),
      loc("备注", "A note"),
    ],
    rules: [
      loc("用户自己写一段", "The person writes a paragraph"),
      loc("占满一栏，初始约四行", "Fills the column; about four rows to start"),
      loc("右下字数，变化时布局不跳", "A count at the corner; the layout does not jump"),
    ],
    spec: loc(
      "做多行文本「需求描述」。初始四行，右下显示 0/500，到上限不能再输入。占位「请输入需求描述…」。不要做成单行。",
      "A “Brief” textarea. Four rows to start, 0/500 at the corner, hard stop at the cap. Placeholder “Describe the brief…”. Not a single line.",
    ),
    note: loc("一段话用多行。姓名、邮箱不要用它。", "A paragraph uses a textarea. Names and emails do not."),
    tells: loc("一段，右下有字数", "A block, with a count"),
    defaultState: "empty",
  },
  {
    id: "checkbox",
    index: "03",
    name: "Checkbox",
    zh: loc("复选", "Checkbox"),
    oneLiner: loc("兴趣、偏好，可以同时选多个", "Interests or prefs — several at once"),
    scenes: [
      loc("兴趣标签", "Interest tags"),
      loc("通知偏好", "Notification prefs"),
      loc("同意条款", "Agree to terms"),
    ],
    rules: [
      loc("可以同时选多个", "Several can be on at once"),
      loc("到上限后禁用其余未选项", "Lock the rest when the cap is hit"),
      loc("单个勾选也用于同意条款", "A single box is also “agree to terms”"),
    ],
    spec: loc(
      "做兴趣标签复选。设计、写作、效率、编程可同时多选，最多 3 项；到上限后其余未选项禁用。不要做成单选。",
      "Interest checkboxes: Design, Writing, Focus, Code. Several on, cap at 3, lock the rest. Not radios.",
    ),
    note: loc("可叠的是复选。互斥档位才是单选组。同意条款是一个布尔，不是档位。", "Stacking is checkbox. Rival tiers are radios. Agree-to-terms is one boolean, not a tier."),
    tells: loc("可叠，到上限其余禁用", "Stack them; lock the rest at the cap"),
    defaultState: "one",
  },
  {
    id: "radio",
    index: "04",
    name: "Radio group",
    zh: loc("单选组", "Radio group"),
    oneLiner: loc("选项少、要并排比较，并且只能一个", "Few options, compared in view, only one on"),
    scenes: [
      loc("配送方式", "Shipping"),
      loc("会员档位", "A plan"),
      loc("支付方式", "Payment"),
    ],
    rules: [
      loc("2–5 项全部可见", "Two to five, all visible"),
      loc("要并排比较标题和说明", "Compare title and hint side by side"),
      loc("只能选一个，选中项有明确状态", "Only one on; the current state is obvious"),
    ],
    spec: loc(
      "做配送方式单选组。普通配送、次日达、到店自取全部可见，带时效说明，默认普通配送，只能选一个。不要做成下拉。",
      "A shipping radio group. Standard, next day, and pickup all visible with timing. Default to standard. Only one on. Not a Select.",
    ),
    note: loc("要比外观和时效时摊开。选项一多再收到面板里。", "Lay them out to compare. Hide them in a panel only when the list is longer."),
    tells: loc("全部看见，只能一个", "All in view; only one on"),
    defaultState: "standard",
  },
  {
    id: "select",
    index: "05",
    name: "Select",
    zh: loc("下拉选择", "Select"),
    oneLiner: loc("固定短列表里选一个，点中即关", "One value from a short fixed list; close on pick"),
    scenes: [
      loc("所在城市", "A city"),
      loc("省份", "A province"),
      loc("状态", "A status"),
    ],
    rules: [
      loc("从固定选项里选一个", "One value from a fixed list"),
      loc("大约 5–15 项，不需要搜索", "About 5–15 items; no search"),
      loc("点中即关，回填选中项", "Close on pick; the trigger shows the value"),
    ],
    spec: loc(
      "做「所在城市」下拉选择。默认「请选择」，选项为几个城市，只能选一个，不提供搜索，点中即关。",
      "A city Select. Placeholder “Choose one”, a short list of cities, one value, no search, close on pick.",
    ),
    note: loc("短列表扫一眼。要比较外观时用单选组；上百项要搜时用 Combobox。", "Scan a short list. Compare in view with radios; search hundreds with a combobox."),
    tells: loc("打开短列表，点中即关", "Open a short list; close on pick"),
    defaultState: "closed",
  },
  {
    id: "combobox",
    index: "06",
    name: "Combobox",
    zh: loc("可搜索选择", "Combobox"),
    oneLiner: loc("选项太多时先输入再从结果里选", "Too many options: type, then pick from the hits"),
    scenes: [
      loc("邀请成员", "Invite a member"),
      loc("联系人", "A contact"),
      loc("商品", "A product"),
    ],
    rules: [
      loc("选项很多，要先搜再选", "Many options; type to find, then pick"),
      loc("输入时实时过滤", "Filter as the query changes"),
      loc("方向键移动，Enter 确认，Escape 关闭", "Arrows move, Enter commits, Escape closes"),
    ],
    spec: loc(
      "做「邀请成员」可搜索选择。输入姓名或邮箱时实时过滤，结果出示姓名和邮箱，键盘上下选择，Enter 确认。不要做成不可搜索的下拉。",
      "An “Invite” combobox. Filter on name or email as you type. Results show both. Arrows move, Enter commits. Not a plain Select.",
    ),
    note: loc("上百项才先打字。五个城市不该强迫搜索。", "Type first when there are hundreds. Five cities should not force a query."),
    tells: loc("输入即筛，再点一个", "Type to filter, then pick one"),
    defaultState: "closed",
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「输入框」，说单行文本或单选组", "Not “an input” — a text field, or a radio group"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("填短内容、写一段、比较三档，还是从两百人里找", "A short fill, a brief, three tiers, or one person among two hundred"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("自己填 / 只能一个 / 要能搜 / 可以同时多个", "Fill it in / only one / type to find / several at once"),
  },
];
