import { loc, type Locale, type Localized } from "./site-locale";
import {
  hintKind,
  type DutyId,
  type Phase,
  type RepairResult,
  type StageState,
} from "./machines";

export type KindId = DutyId;

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
  defaultState: StageState;
};

export const KINDS: KindMeta[] = [
  {
    id: "label",
    index: "01",
    name: "Label",
    zh: loc("字段标签", "Label"),
    oneLiner: loc("输入框上方写清填什么，不能只靠占位文字", "Name the field above the box. A placeholder is not a label"),
    scenes: [
      loc("姓名", "A name"),
      loc("公司", "A company"),
      loc("任何短填", "Any short fill"),
    ],
    rules: [
      loc("可见 label 永远在框的上方", "A visible label stays above the box"),
      loc("占位符会在输入后消失", "A placeholder vanishes after typing"),
      loc("读屏不把占位符当标签", "A screen reader does not treat placeholder as a label"),
    ],
    spec: loc(
      "做报名姓名。标签写在输入框上方并绑定 htmlFor。占位可以写「请输入真实姓名」，但输入后标签还在。不要只靠占位符。",
      "A sign-up name. The label sits above the box and is bound with htmlFor. A placeholder may say “Your real name”, but the label remains after typing. Not placeholder-only.",
    ),
    tryHint: loc(
      "在没有标签的框里输入几个字，占位符没了，就不知道这一格填什么。",
      "Type a few characters in the unlabeled box. Once the placeholder is gone, the slot is anonymous.",
    ),
    note: loc("占位符绝不当标签。", "A placeholder is never a label."),
    tells: loc("标签常在，占位会消失", "The label stays; the placeholder vanishes"),
    defaultState: "naive",
  },
  {
    id: "required",
    index: "02",
    name: "Required",
    zh: loc("必填标记", "Required"),
    oneLiner: loc("必填和选填要明确，不要等提交后才告诉用户", "Mark required and optional before submit"),
    scenes: [
      loc("姓名必填", "A required name"),
      loc("公司选填", "An optional company"),
      loc("报名表", "A sign-up form"),
    ],
    rules: [
      loc("必填用 * 加读屏「必填」", "Required uses * plus an sr-only “required”"),
      loc("选填写「选填」", "Optional is written as optional"),
      loc("颜色不能是唯一信号", "Color is not the only signal"),
    ],
    spec: loc(
      "做报名表的必填标记。姓名加星号和读屏「必填」，公司与职位写「选填」。不要等提交后才说哪一格是必填。",
      "Mark the sign-up form. Name gets an asterisk and an sr-only “required”; company says “optional”. Do not wait for submit to name which slots are required.",
    ),
    tryHint: loc(
      "点「提前标出必填项」，看姓名的星号和公司的「选填」。",
      "Turn required marks on. Watch the name asterisk and the company “optional”.",
    ),
    note: loc("必填不是提交时才骂人。", "Required is not a scolding after submit."),
    tells: loc("填前标出，不只靠颜色", "Mark it before fill, not by color alone"),
    defaultState: "clear",
  },
  {
    id: "helper",
    index: "03",
    name: "Helper",
    zh: loc("辅助说明", "Helper"),
    oneLiner: loc("复杂格式提前给示例；出错时用错误替换说明，不要两行叠在一起", "Give the format up front; on error replace the helper, do not stack two lines"),
    scenes: [
      loc("手机号格式", "Phone format"),
      loc("叠了两行", "Two stacked lines"),
      loc("一行替换", "One replaced line"),
    ],
    rules: [
      loc("aria-describedby 绑到说明", "aria-describedby points at the helper"),
      loc("有错误时替换说明", "On error, replace the helper"),
      loc("不要辅助说明和错误叠两行", "Do not stack helper and error"),
    ],
    spec: loc(
      "做手机号辅助说明。框下写「请填写 11 位手机号，例如 138 0000 0000」。出错时用错误文案替换这一行，不要说明和错误叠在一起。",
      "A phone helper. Under the box, say to enter 11 digits, e.g. 138 0000 0000. On error, replace that line — do not stack helper and error.",
    ),
    tryHint: loc(
      "对照叠了两行的说明，和只留一行错误的写法。",
      "Compare a stacked helper-plus-error with a single replaced line.",
    ),
    note: loc("说明和错误互斥，同一时刻只留一行。", "Helper and error are exclusive. One line at a time."),
    tells: loc("格式提前说，出错就替换", "Format first; error replaces it"),
    defaultState: "clear",
  },
  {
    id: "group",
    index: "04",
    name: "Group",
    zh: loc("逻辑分组", "Group"),
    oneLiner: loc("按填写任务分组；已知事实只读，不要让人再填一遍", "Group by task; known facts are read-only — do not ask them again"),
    scenes: [
      loc("活动报名", "Event sign-up"),
      loc("已知场次", "A known session"),
      loc("一长串字段", "A long dump of fields"),
    ],
    rules: [
      loc("fieldset + legend 按任务分", "fieldset + legend, split by task"),
      loc("已知事实做成只读", "Known facts become readouts"),
      loc("去掉不必填的项", "Drop slots nobody should type"),
    ],
    spec: loc(
      "做活动报名分组。活动名称、时间、地点只读展示。报名信息、参会偏好分两组。不要把费用、名额、截止时间再做成输入框。",
      "Group an event sign-up. Title, time, and place are read-only. Sign-up and preferences are two groups. Do not turn fee, capacity, and deadline into more inputs.",
    ),
    tryHint: loc(
      "对照一串排到底的表，和按「活动 / 报名 / 偏好」分组、已知事实只读的表。",
      "Compare a flat dump with groups for event / sign-up / preferences, known facts read-only.",
    ),
    note: loc("整齐的一列不是分组。已知事实不要再填。", "A tidy column is not grouping. Known facts are not fills."),
    tells: loc("按任务分，已知事实只读", "Split by task; known facts are read-only"),
    defaultState: "naive",
  },
  {
    id: "hint",
    index: "05",
    name: "Hint",
    zh: loc("占位与默认", "Hint"),
    oneLiner: loc("格式示例放占位符；真正的默认值预选好", "Format belongs in the placeholder; a real default is preselected"),
    scenes: [
      loc("手机号格式", "Phone format"),
      loc("邮箱示例", "An email example"),
      loc("席位默认", "A default seat"),
    ],
    rules: [
      loc("格式示例放占位符", "Format example goes in the placeholder"),
      loc("真正的默认值预选好", "A real default is already chosen"),
      loc("占位符绝不当标签", "A placeholder is never a label"),
    ],
    spec: loc(
      "做占位与默认。手机号占位「例如：138 0000 0000」，邮箱占位 name@example.com，席位预选标准席。不要空着让人猜，也不要用占位符代替标签。",
      "Format and defaults. Phone placeholder “e.g. 138 0000 0000”, email name@example.com, seat preselected as Standard. Do not leave people guessing, and do not replace the label with a placeholder.",
    ),
    tryHint: loc(
      "点「给出格式提示」，看占位符和已经选中的标准席。",
      "Turn format hints on. Watch the placeholders and the preselected Standard seat.",
    ),
    note: loc("占位是格式，默认是已经选中的值。", "A placeholder is format. A default is an already chosen value."),
    tells: loc("占位给格式，默认已选中", "Placeholder for format; default already chosen"),
    defaultState: "clear",
  },
  {
    id: "repair",
    index: "06",
    name: "Repair",
    zh: loc("当场能改", "Repair"),
    oneLiner: loc("错了写在这一栏下，同时说哪里错了和该怎么改", "A miss sits under that column and names both what is wrong and how to fix it"),
    scenes: [
      loc("手机号少一位", "A phone one digit short"),
      loc("页顶失败", "A page-top failure"),
      loc("栏下带改法", "A fix under the field"),
    ],
    rules: [
      loc("错误写在当前字段旁", "The miss sits beside this field"),
      loc("文案同时说哪里错和怎么改", "Copy names the miss and the fix"),
      loc("不是页顶一句「请检查」", "Not a page-top “please check”"),
    ],
    spec: loc(
      "做手机号当场能改。同一截短号码，错误写在这一栏下：「还差 N 位，请填写 11 位手机号」。不要只在页顶报「提交失败，请检查后重试」。",
      "A phone the person can fix in place. Same short number, the miss sits under that column: how many digits remain, and to enter 11. Not a page-top “submit failed, please check”.",
    ),
    tryHint: loc(
      "对照同一截短号码：页顶一句失败，对不上栏；栏下还差几位，带着改法。",
      "Same short number: a banner that names no field, versus “N digits remain” under the box.",
    ),
    note: loc("当场能改不是错误何时开口。那是校验那一则。", "A field-level fix is not when the error speaks. That is the validation study."),
    tells: loc("错在栏下，带改法", "The miss sits under the field, with a fix"),
    defaultState: "clear",
  },
  {
    id: "done",
    index: "07",
    name: "Done",
    zh: loc("成功反馈", "Done"),
    oneLiner: loc("提交后写清发生了什么，并给出下一步", "After submit, say what happened and name a next step"),
    scenes: [
      loc("报名成功", "Sign-up complete"),
      loc("确认邮件", "A confirmation email"),
      loc("加到日历", "Add to calendar"),
    ],
    rules: [
      loc("不要只弹「成功」", "Do not leave only “Success”"),
      loc("写清发生了什么、确认发到哪", "Name what happened and where confirmation went"),
      loc("给出下一步动作", "Give a next action"),
    ],
    spec: loc(
      "做报名成功反馈。写清确认邮件发到哪个邮箱，并给出「添加到日历」。不要只弹「成功」，也不要做成一条 toast。",
      "A completed sign-up. Name the mailbox the confirmation went to, and offer “Add to calendar”. Not the word “Success” alone, and not a toast.",
    ),
    tryHint: loc(
      "提交一次。对照只写「成功」的结果，和带确认邮箱、下一步按钮的结果。",
      "Submit once. Compare a “Success” only result with one that names the mailbox and a next step.",
    ),
    note: loc("提交成功不是一条 toast。", "A completed submit is not a toast."),
    tells: loc("发生了什么 + 下一步", "What happened + a next step"),
    defaultState: "clear",
  },
];

export const FORMULA = [
  {
    n: "1",
    title: loc("名称", "Name"),
    example: loc("别说「做个表单」，说标签、必填、说明、分组、占位、当场能改、还是成功", "Not “make a form” — label, required, helper, group, hint, repair, or done"),
  },
  {
    n: "2",
    title: loc("场景", "Scene"),
    example: loc("填写前看标签必填格式分组，填写中给占位和改法，提交后给结果", "Before: label, required, format, group. During: hint and a field-level fix. After: the outcome"),
  },
  {
    n: "3",
    title: loc("规则", "Rules"),
    example: loc("标签常在 / 必填先标 / 说明与错误不叠行 / 已知事实只读 / 错在栏下且能改 / 成功带下一步", "Label stays / mark required first / helper and error never stack / known facts read-only / miss under the field with a fix / success carries a next step"),
  },
];

export const EVENT = {
  title: loc("夏日分享会", "Summer salon"),
  dateLabel: loc("8月26日 14:00", "26 Aug, 14:00"),
  place: loc("西岸艺术中心", "West Bund Art Center"),
} as const;

export const PHASES: { id: Phase; label: Localized }[] = [
  { id: "before", label: loc("填写前", "Before") },
  { id: "during", label: loc("填写中", "During") },
  { id: "after", label: loc("提交后", "After") },
];

export const PHONE_HELPER = loc(
  "请填写 11 位手机号，例如 138 0000 0000",
  "11-digit mainland number, e.g. 138 0000 0000",
);

export function hintPlaceholder(
  field: "phone" | "email",
  clear: boolean,
  locale: Locale,
): string {
  if (hintKind(field, clear) !== "format") return "";
  if (field === "phone") {
    return locale === "en" ? "e.g. 138 0000 0000" : "例如：138 0000 0000";
  }
  return "name@example.com";
}

export function repairCopy(result: RepairResult, locale: Locale): string | undefined {
  if (result.tone === "ok") return locale === "en" ? "Looks right" : "格式正确";
  if (result.tone !== "error") return undefined;
  if (result.remain != null) {
    return locale === "en"
      ? `${result.remain} digit(s) left. Enter an 11-digit mobile number.`
      : `还差${result.remain}位，请填写11位手机号`;
  }
  if (result.invalid) {
    return locale === "en"
      ? "Enter a mainland mobile number starting with 1."
      : "请填写有效的大陆手机号，以 1 开头";
  }
  return undefined;
}

export const FIELD_COPY: Record<string, Localized> = {
  name: loc("姓名", "Name"),
  company: loc("公司与职位", "Company & role"),
  phone: loc("手机号", "Phone"),
  email: loc("联系邮箱", "Email"),
  seat: loc("席位类型", "Seat"),
  diet: loc("饮食备注", "Diet notes"),
  title: loc("活动名称", "Event"),
  when: loc("活动时间", "When"),
  place: loc("活动地点", "Where"),
  fee: loc("报名费用", "Fee"),
  cap: loc("报名人数上限", "Capacity"),
  deadline: loc("报名截止时间", "Deadline"),
  standard: loc("标准席", "Standard"),
  vip: loc("前排席", "Front row"),
};
