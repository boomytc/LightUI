import { loc, type Localized } from "./site-locale";
import type { ErrorCode, LessonId } from "./machines";

export type KindId = LessonId;

export type KindMeta = {
  id: KindId;
  index: string;
  name: string;
  zh: Localized;
  oneLiner: Localized;
  scenes: Localized[];
  rules: Localized[];
  spec: Localized;
  tryHint: Localized;
  note?: Localized;
  tells: Localized;
  defaultState: "error" | "ok";
};

export const KINDS: KindMeta[] = [
  {
    id: "blur",
    index: "01",
    name: "On blur",
    zh: loc("失焦校验", "On blur"),
    oneLiner: loc("光标离开这一格就检查", "Check when the cursor leaves this field"),
    scenes: [
      loc("活动名称", "Activity name"),
      loc("邮箱", "Email"),
      loc("短文本", "A short fill"),
    ],
    rules: [
      loc("光标离开才检查", "Check only after blur"),
      loc("输入时不要报错", "Do not claim while typing"),
      loc("名称至少 4 个字", "Name needs at least 4 characters"),
    ],
    spec: loc(
      "做失焦校验。活动名称离开这一格再检查，至少 4 个字；输入两个字时先别报，点到空白处再在字段下提示。",
      "Validate on blur. Check the activity name after the field is left; at least 4 characters. Two characters stay quiet until the pointer clicks away.",
    ),
    tryHint: loc(
      "在活动名称里输入「夏日」（只有 2 个字），再点到表单空白处。",
      "Type “夏日” (two characters) in the name, then click the empty part of the form.",
    ),
    note: loc("失焦不是边打边骂。短内容写完再检查。", "Blur is not yelling while they type. Check a short fill after they leave."),
    tells: loc("离开这一格才说", "Speak after the field is left"),
    defaultState: "error",
  },
  {
    id: "inline",
    index: "02",
    name: "Inline",
    zh: loc("行内校验", "Inline"),
    oneLiner: loc("这一栏选到非法值，收起后立刻说清", "An illegal pick is named under that column as it closes"),
    scenes: [
      loc("活动日期", "Activity date"),
      loc("优惠截止", "A deadline"),
      loc("不可用的选项", "A value that is not allowed"),
    ],
    rules: [
      loc("选到非法值立刻在字段下说", "Speak under the field as soon as the illegal value is picked"),
      loc("月历收起后错误还在这一栏", "The miss stays in that column after the grid closes"),
      loc("不是飘一条通知", "Not a toast"),
    ],
    spec: loc(
      "做行内校验。活动时间选到过去日期时，月历收起后在字段下方立即提示「不能选择过去时间创建活动」。",
      "Validate inline. When the activity date is a past day, close the month grid and immediately say under that field that a past date cannot create an activity.",
    ),
    tryHint: loc(
      "打开活动时间，选一个已经过去的日子，看这一栏如何立刻说清错误。",
      "Open the activity date, pick a day already in the past, and watch that column name the miss at once.",
    ),
    note: loc("行内报错写在这一栏下面，不是一条 toast。", "Inline copy sits under this column. It is not a toast."),
    tells: loc("收起后立刻在字段下说", "Speak under the field as it closes"),
    defaultState: "error",
  },
  {
    id: "submit",
    index: "03",
    name: "On submit",
    zh: loc("提交校验", "On submit"),
    oneLiner: loc("点发布一次标出全部未通过项", "Clicking publish marks every miss at once"),
    scenes: [
      loc("空表单发布", "Publishing an empty form"),
      loc("最后把关", "A last gate"),
      loc("必填未齐", "Required slots still empty"),
    ],
    rules: [
      loc("提交前字段保持安静", "Fields stay quiet until submit"),
      loc("一次标出全部未通过项", "Mark every miss in one click"),
      loc("看起来置灰的按钮仍可点", "A grey-looking button still receives the click"),
    ],
    spec: loc(
      "做提交校验。保存并发布在未通过时保持置灰，但点击后仍要把所有未通过项一次标出。不要做成点不了的死按钮。",
      "Validate on submit. Save & publish looks idle while the form is incomplete, but a click still marks every miss at once. Not a dead disabled button.",
    ),
    tryHint: loc(
      "表单未填完时，置灰的「保存并发布」仍然可以点，用来一次标出全部问题。",
      "Leave the form empty. The idle-looking “Save & publish” can still be clicked, and every miss is marked at once.",
    ),
    note: loc("提交一次标出不是弹出确认框。错误还在字段下。", "Marking misses on submit is not a confirm modal. The copy stays under the fields."),
    tells: loc("置灰也能点，一次标出全部", "Idle-looking still clicks; every miss at once"),
    defaultState: "error",
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「表单校验」，说失焦、行内、还是提交", "Not “form validation” — on blur, inline, or on submit"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("离开这一格、这一栏选到非法值、还是点发布", "Leaving a field, picking an illegal value, or hitting publish"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("失焦才说 / 收起后立刻说 / 一次标出全部（置灰也能点）", "Speak on blur / speak as the column closes / mark every miss (a grey button still clicks)"),
  },
];

export const ERROR_COPY: Record<ErrorCode, Localized> = {
  "name-empty": loc("请输入活动名称", "Enter an activity name"),
  "name-short": loc("活动名称至少需要 4 个字", "Name needs at least 4 characters"),
  "type-empty": loc("请选择活动类型", "Choose an activity type"),
  "date-empty": loc("请选择活动日期", "Choose an activity date"),
  "date-past": loc("不能选择过去时间创建活动", "A past date cannot create an activity"),
  "confirm-empty": loc("请确认活动时间与规则", "Confirm the time and rules"),
};

export const TYPE_OPTIONS = [
  { value: "online" as const, label: loc("线上活动", "Online") },
  { value: "offline" as const, label: loc("线下活动", "In person") },
];
