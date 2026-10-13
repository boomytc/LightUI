import { lunchDocument, noticeDocument } from "./documents";
import type { RouteDraft, Surface } from "./machines";
import { loc, pick, type Locale, type Localized } from "./site-locale";

export type CompareSample = {
  id: "fact" | "notice" | "lunch";
  chosen: Surface;
  title: Localized;
  request: Localized;
  reason: Localized;
  text: Localized;
};

export const COMPARE_SAMPLES: readonly CompareSample[] = [
  {
    id: "fact",
    chosen: "text",
    title: loc("一句话", "One sentence"),
    request: loc("周三的站会改到几点？用一句话告诉我。", "What time is Wednesday's stand-up now? Answer in one sentence."),
    reason: loc(
      "这是一句事实。契约里没有比正文更合适的结构，不必升格成组件，也不必单独开一份文档。",
      "This is one fact. The catalog has nothing more specific than prose, so it stays text.",
    ),
    text: loc("周三站会改到 10:30，会议室仍是 3F-竹。", "Wednesday's stand-up moved to 10:30. The room is still 3F-Bamboo."),
  },
  {
    id: "notice",
    chosen: "native",
    title: loc("契约文本", "Contract text"),
    request: loc(
      "把这则通知按契约里的 Text 呈现：周三站会改到 10:30，会议室仍是 3F-竹。",
      "Render this notice with the contract Text component: Wednesday's stand-up moved to 10:30, room 3F-Bamboo.",
    ),
    reason: loc(
      "用户点名要目录里的 Text。props 只有必填的 content，类型是字符串。",
      "The turn names Text from the catalog. The only prop is the required string content.",
    ),
    text: loc("周三站会改到 10:30，会议室仍是 3F-竹。", "Wednesday's stand-up moved to 10:30. The room is still 3F-Bamboo."),
  },
  {
    id: "lunch",
    chosen: "iframe",
    title: loc("午餐估算", "Lunch estimate"),
    request: loc(
      "做一张可以改人数的午餐估算，每人 28 元，现场改人数立刻出总价。",
      "Make a lunch estimate I can edit: 28 each, and the total updates as the headcount changes.",
    ),
    reason: loc(
      "人数一改，总价就要变。v0 目录里没有这种控件，交互留在沙盒文档里，正文只留一句摘要。",
      "The total has to change with the headcount. v0 has no such control, so the interaction stays in a sandbox document and the prose is only a summary.",
    ),
    text: loc("6 人午餐，每人 28 元，合计 168 元。人数可以改。", "Lunch for 6 at 28 each is 168. The headcount can change."),
  },
];

export type DegradeId = "unknown" | "props" | "partial";

export type DegradeCase = {
  id: DegradeId;
  title: Localized;
  detail: Localized;
  buffer: string;
};

const unknownPayload = {
  surface: "native",
  component: "Table",
  props: { columns: ["时间", "地点"] },
  text: "周三站会 10:30，3F-竹。",
  reason: "想用一张表把时间和地点对齐",
};

const propsPayload = {
  surface: "native",
  component: "Text",
  props: { content: "周三站会 10:30，3F-竹。", tone: "warn" },
  text: "周三站会 10:30，3F-竹。",
  reason: "给 Text 加一个语气字段",
};

const partialFinal = {
  surface: "native",
  component: "Text",
  props: { content: "周三站会改到 10:30，会议室仍是 3F-竹。" },
  text: "周三站会改到 10:30，会议室仍是 3F-竹。",
  reason: "目录里就有 Text",
};

const partialFinalJson = JSON.stringify(partialFinal);

export const PARTIAL_STEPS: readonly string[] = [
  partialFinalJson.slice(0, partialFinalJson.indexOf(",")),
  partialFinalJson.slice(0, partialFinalJson.indexOf("content") + "content".length + 8),
  partialFinalJson,
];

export const DEGRADE_CASES: readonly DegradeCase[] = [
  {
    id: "unknown",
    title: loc("未知组件", "Unknown component"),
    detail: loc(
      "声明了目录里没有的 Table。宿主在原位给出 unknown_component，不挂这个名字。",
      "The turn names Table, which is not in the catalog. The host shows unknown_component and does not mount that name.",
    ),
    buffer: JSON.stringify(unknownPayload, null, 2),
  },
  {
    id: "props",
    title: loc("props 不通过", "Props fail"),
    detail: loc(
      "Text 的 schema 不允许 tone。宿主在原位给出 invalid_props，不挂组件。",
      "Text's schema does not allow tone. The host shows invalid_props and does not mount the component.",
    ),
    buffer: JSON.stringify(propsPayload, null, 2),
  },
  {
    id: "partial",
    title: loc("流式半截", "Partial stream"),
    detail: loc(
      "JSON 没闭合之前不提交。半截里已经能看见 native 和 Text，仍然不挂。",
      "Nothing commits until the JSON closes. native and Text can already be visible in the fragment.",
    ),
    buffer: PARTIAL_STEPS[1] ?? "",
  },
];

export function sampleByChosen(chosen: string): CompareSample {
  return COMPARE_SAMPLES.find((sample) => sample.chosen === chosen) ?? COMPARE_SAMPLES[0];
}

export function degradeById(id: string): DegradeCase {
  return DEGRADE_CASES.find((item) => item.id === id) ?? DEGRADE_CASES[0];
}

export function draftsFor(sample: CompareSample, locale: Locale): Record<Surface, RouteDraft> {
  const text = pick(sample.text, locale);
  const reason = pick(sample.reason, locale);
  const document = sample.id === "lunch" ? lunchDocument(locale) : noticeDocument(text, locale);
  return {
    text: { surface: "text", text, reason },
    native: {
      surface: "native",
      component: "Text",
      props: { content: text },
      text,
      reason,
    },
    iframe: { surface: "iframe", document, text, reason },
  };
}

export const ACCEPT_REQUEST =
  "把这则通知按契约里的 Text 呈现，并说明为什么选这种表面：周三站会改到 10:30，会议室仍是 3F-竹。";
