export const FIELD_ORDER = [
  "initialHeight",
  "placeholderMessages",
  "css",
  "html",
  "jsFunctions",
  "jsExpressions",
] as const;

export type FieldName = (typeof FIELD_ORDER)[number];

export const COMPLETE_KEY = {
  initialHeight: "initialHeightComplete",
  placeholderMessages: "placeholderMessagesComplete",
  css: "cssComplete",
  html: "htmlComplete",
  jsFunctions: "jsFunctionsComplete",
  jsExpressions: "jsExpressionsComplete",
} as const;

export const DEFAULT_INITIAL_HEIGHT = 200;
export const MIN_HEIGHT = 50;
export const MAX_HEIGHT = 4000;
export const MAX_PROMPT = 4000;

export const SANDBOX_CHANNEL = "lightui.sandbox";
export const HOST_CHANNEL = "lightui.host";

/** Scripts only. `allow-same-origin` would put a srcdoc frame on the host origin. */
export const IFRAME_SANDBOX = "allow-scripts";

const FIELD_SET = new Set<string>(FIELD_ORDER);

export type StreamState = {
  initialHeight?: number;
  initialHeightRaw: string;
  initialHeightComplete: boolean;
  placeholderMessages: string[];
  placeholderMessagesClosed: number;
  placeholderMessagesComplete: boolean;
  css: string;
  cssComplete: boolean;
  html: string[];
  htmlClosed: number;
  htmlComplete: boolean;
  jsFunctions: string;
  jsFunctionsComplete: boolean;
  jsExpressions: string[];
  jsExpressionsClosed: number;
  jsExpressionsComplete: boolean;
  generating: boolean;
  keyOrder: FieldName[];
  error?: string;
};

export type Phase = "placeholder" | "preview" | "live";

export type Paint = {
  phase: Phase;
  height: number;
  messages: string[];
  css: string | null;
  html: string | null;
  functions: string | null;
  expressions: string[];
};

export type Step = {
  at: number;
  state: StreamState;
};

export type CallDecision =
  | { ok: true; name: "sendPrompt"; text: string }
  | { ok: true; name: "openLink"; url: string }
  | { ok: false; name: string; reason: string };

export type Decision =
  | { type: "ignore" }
  | { type: "foreign"; reason: string }
  | { type: "ready" }
  | { type: "resize"; height: number; raw: number; clamped: boolean }
  | { type: "resize-rejected"; reason: string }
  | { type: "rejected"; reason: string }
  | { type: "call"; id: string; decision: CallDecision };

export type Probe =
  | {
      id: string;
      group: string;
      label: string;
      kind: "call";
      name: string;
      args: unknown;
      expect: "accept" | "reject";
    }
  | { id: string; group: string; label: string; kind: "foreign" }
  | {
      id: string;
      group: string;
      label: string;
      kind: "resize";
      height?: unknown;
      special?: "nan" | "infinity";
      expect: "apply" | "clamp" | "reject";
    };

export const PROBES: readonly Probe[] = [
  {
    id: "send-ok",
    group: "放行",
    label: "sendPrompt",
    kind: "call",
    name: "sendPrompt",
    args: { text: "把说明再缩短一句" },
    expect: "accept",
  },
  {
    id: "link-ok",
    group: "放行",
    label: "openLink https",
    kind: "call",
    name: "openLink",
    args: { url: "https://example.com/sandbox-bridge" },
    expect: "accept",
  },
  {
    id: "empty",
    group: "参数",
    label: "空文本",
    kind: "call",
    name: "sendPrompt",
    args: { text: "   " },
    expect: "reject",
  },
  {
    id: "long",
    group: "参数",
    label: "超长文本",
    kind: "call",
    name: "sendPrompt",
    args: { text: "字".repeat(MAX_PROMPT + 1) },
    expect: "reject",
  },
  {
    id: "extra",
    group: "参数",
    label: "多余参数",
    kind: "call",
    name: "sendPrompt",
    args: { text: "你好", extra: true },
    expect: "reject",
  },
  {
    id: "http",
    group: "参数",
    label: "http 链接",
    kind: "call",
    name: "openLink",
    args: { url: "http://example.com/sandbox-bridge" },
    expect: "reject",
  },
  {
    id: "js-url",
    group: "参数",
    label: "javascript 链接",
    kind: "call",
    name: "openLink",
    args: { url: "javascript:alert(1)" },
    expect: "reject",
  },
  {
    id: "unknown",
    group: "白名单",
    label: "未知函数 fetch",
    kind: "call",
    name: "fetch",
    args: { url: "https://example.com" },
    expect: "reject",
  },
  { id: "foreign", group: "来源", label: "宿主伪造", kind: "foreign" },
  {
    id: "nan",
    group: "高度",
    label: "NaN",
    kind: "resize",
    special: "nan",
    expect: "reject",
  },
  {
    id: "inf",
    group: "高度",
    label: "Infinity",
    kind: "resize",
    special: "infinity",
    expect: "reject",
  },
  {
    id: "text-height",
    group: "高度",
    label: "字符串高度",
    kind: "resize",
    height: "200",
    expect: "reject",
  },
  {
    id: "huge",
    group: "高度",
    label: "9000 钳到 4000",
    kind: "resize",
    height: 9000,
    expect: "clamp",
  },
  {
    id: "tiny",
    group: "高度",
    label: "负数钳到 50",
    kind: "resize",
    height: -20,
    expect: "clamp",
  },
];

export const KIND_IDS = ["stream", "bridge"] as const;
export type KindId = (typeof KIND_IDS)[number];

export function isKindId(value: string): value is KindId {
  return (KIND_IDS as readonly string[]).includes(value);
}

export function emptyStream(generating: boolean): StreamState {
  return {
    initialHeightRaw: "",
    initialHeightComplete: false,
    placeholderMessages: [],
    placeholderMessagesClosed: 0,
    placeholderMessagesComplete: false,
    css: "",
    cssComplete: false,
    html: [],
    htmlClosed: 0,
    htmlComplete: false,
    jsFunctions: "",
    jsFunctionsComplete: false,
    jsExpressions: [],
    jsExpressionsClosed: 0,
    jsExpressionsComplete: false,
    generating,
    keyOrder: [],
  };
}

export function normalizeSource(source: string): string {
  const withoutBom = source.replace(/^\uFEFF/, "");
  const fence = withoutBom.match(/^\s*```(?:json)?\s*\n/);
  if (!fence) return withoutBom;
  return withoutBom.slice(fence[0].length);
}

export function parseStream(source: string, generating = false): StreamState {
  const state = emptyStream(generating);
  const src = normalizeSource(source);
  const cursor = { i: 0 };
  const skip = () => {
    while (cursor.i < src.length && /\s/.test(src[cursor.i] ?? "")) cursor.i += 1;
  };
  const eof = () => cursor.i >= src.length;
  const peek = () => src[cursor.i] ?? "";

  skip();
  if (eof()) return state;
  if (peek() !== "{") {
    if (src.trimStart().startsWith("`")) return state;
    state.error = "流应以 { 开始";
    return state;
  }
  cursor.i += 1;

  let closed = false;
  while (!eof()) {
    skip();
    if (eof()) break;
    if (peek() === "}") {
      cursor.i += 1;
      closed = true;
      break;
    }
    if (peek() === ",") {
      cursor.i += 1;
      continue;
    }
    const key = readString(src, cursor);
    if (key.status === "error") {
      state.error = key.reason;
      return state;
    }
    if (key.status === "partial") return state;
    skip();
    if (eof()) return state;
    if (peek() !== ":") {
      state.error = "键后缺少冒号";
      return state;
    }
    cursor.i += 1;
    skip();
    if (eof()) return state;

    const field = FIELD_SET.has(key.value) ? (key.value as FieldName) : null;
    if (field) state.keyOrder.push(field);
    const value = readField(src, cursor, state, field);
    if (value === "error") return state;
    if (value === "partial") return state;
    if (field) markComplete(state, field);
  }

  if (closed) {
    for (const field of FIELD_ORDER) markComplete(state, field);
  }
  return state;
}

export function visiblePhase(state: StreamState): Phase {
  if (!state.cssComplete) return "placeholder";
  if (!state.htmlComplete) return "preview";
  return "live";
}

export function paintOf(state: StreamState): Paint {
  const phase = visiblePhase(state);
  const height =
    state.initialHeightComplete && state.initialHeight !== undefined
      ? state.initialHeight
      : DEFAULT_INITIAL_HEIGHT;
  const live = state.htmlComplete && state.jsFunctionsComplete;
  return {
    phase,
    height,
    messages: state.placeholderMessages,
    css: state.cssComplete ? state.css : null,
    html: state.cssComplete ? state.html.join("") : null,
    functions: live ? state.jsFunctions : null,
    expressions: live ? state.jsExpressions.slice(0, state.jsExpressionsClosed) : [],
  };
}

export type FieldStatus = "waiting" | "streaming" | "complete";

export function fieldStatus(state: StreamState, field: FieldName): FieldStatus {
  if (state[COMPLETE_KEY[field]]) return "complete";
  if (field === "initialHeight") return state.initialHeightRaw.length > 0 ? "streaming" : "waiting";
  if (field === "css") return state.css.length > 0 ? "streaming" : "waiting";
  if (field === "jsFunctions") return state.jsFunctions.length > 0 ? "streaming" : "waiting";
  if (field === "placeholderMessages") {
    return state.placeholderMessages.length > 0 ? "streaming" : "waiting";
  }
  if (field === "html") return state.html.length > 0 ? "streaming" : "waiting";
  return state.jsExpressions.length > 0 ? "streaming" : "waiting";
}

export function fieldPreview(state: StreamState, field: FieldName): string {
  if (field === "initialHeight") {
    if (state.initialHeightComplete && state.initialHeight !== undefined) return String(state.initialHeight);
    return state.initialHeightRaw;
  }
  if (field === "placeholderMessages") return state.placeholderMessages.join(" / ");
  if (field === "css") return state.css;
  if (field === "html") return state.html.join("");
  if (field === "jsFunctions") return state.jsFunctions;
  return state.jsExpressions.join("\n");
}

export function orderViolations(keyOrder: readonly FieldName[]): FieldName[] {
  let last = -1;
  const problems: FieldName[] = [];
  for (const key of keyOrder) {
    const index = FIELD_ORDER.indexOf(key);
    if (index < last) problems.push(key);
    last = Math.max(last, index);
  }
  return problems;
}

const stepCache = new Map<string, Step[]>();

export function playbackSteps(source: string, grain = 18): Step[] {
  const key = `${grain}\n${source}`;
  const hit = stepCache.get(key);
  if (hit) return hit;
  const steps: Step[] = [];
  let lastSig = "";
  let lastKept = -grain;
  let lastComplete = "";
  for (let i = 0; i <= source.length; i += 1) {
    const state = parseStream(source.slice(0, i), i < source.length);
    const complete = FIELD_ORDER.map((field) => (state[COMPLETE_KEY[field]] ? "1" : "0")).join("");
    const sig = signature(state);
    const boundary = i === 0 || i === source.length || complete !== lastComplete;
    const grew = i - lastKept >= grain;
    if ((boundary || grew) && sig !== lastSig) {
      steps.push({ at: i, state });
      lastSig = sig;
      lastKept = i;
      lastComplete = complete;
    }
  }
  stepCache.set(key, steps);
  return steps;
}

export function lockedStep(source: string, kind: string, state: string): Step {
  const steps = playbackSteps(source);
  const last = steps[steps.length - 1] ?? { at: 0, state: emptyStream(false) };
  if (kind === "bridge" || state === "final" || state === "rejected") return last;
  if (state === "placeholder") {
    const found = [...steps].reverse().find((step) => {
      return step.state.placeholderMessagesComplete && !step.state.cssComplete;
    });
    return found ?? steps[0] ?? last;
  }
  if (state === "preview") {
    const found = steps.filter((step) => {
      return step.state.cssComplete && !step.state.htmlComplete && step.state.html.join("").includes("<");
    });
    if (found.length === 0) return last;
    return found[Math.min(found.length - 1, Math.max(0, Math.floor(found.length * 0.65)))] ?? last;
  }
  return last;
}

export function interpretHeight(
  height: unknown,
): { ok: true; height: number; raw: number; clamped: boolean } | { ok: false; reason: string } {
  if (typeof height !== "number" || !Number.isFinite(height)) {
    return { ok: false, reason: "高度不是有限数字" };
  }
  const next = Math.max(MIN_HEIGHT, Math.min(Math.ceil(height), MAX_HEIGHT));
  return { ok: true, height: next, raw: height, clamped: next !== height };
}

export function validateCall(name: unknown, args: unknown): CallDecision {
  const label = typeof name === "string" ? name : "";
  if (name !== "sendPrompt" && name !== "openLink") {
    return { ok: false, name: label || "（空）", reason: "未知函数" };
  }
  if (!isPlainObject(args)) {
    return { ok: false, name, reason: "参数必须是对象" };
  }
  const keys = Object.keys(args);
  if (name === "sendPrompt") {
    if (keys.some((key) => key !== "text")) {
      return { ok: false, name, reason: "出现了未声明的参数" };
    }
    const text = args.text;
    if (typeof text !== "string") return { ok: false, name, reason: "text 必须是字符串" };
    const trimmed = text.trim();
    if (trimmed.length < 1) return { ok: false, name, reason: "text 不能为空" };
    if (trimmed.length > MAX_PROMPT) return { ok: false, name, reason: "text 超过 4000 字" };
    return { ok: true, name, text: trimmed };
  }
  if (keys.some((key) => key !== "url")) {
    return { ok: false, name, reason: "出现了未声明的参数" };
  }
  const url = args.url;
  if (typeof url !== "string") return { ok: false, name, reason: "url 必须是字符串" };
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return { ok: false, name, reason: "url 不是合法地址" };
  }
  if (parsed.protocol !== "https:") return { ok: false, name, reason: "url 必须是 https" };
  return { ok: true, name, url: parsed.toString() };
}

export function decideSandboxMessage(input: { sourceIsFrame: boolean; data: unknown }): Decision {
  const parsed = classifyMessage(input.data);
  if (parsed.type === "ignore") return parsed;
  if (!input.sourceIsFrame) return { type: "foreign", reason: "来源不是这块沙盒" };
  return parsed;
}

export function probeExpectation(probe: Probe): "accept" | "reject" | "clamp" | "foreign" {
  if (probe.kind === "foreign") return "foreign";
  if (probe.kind === "resize") {
    if (probe.expect === "clamp") return "clamp";
    return probe.expect === "apply" ? "accept" : "reject";
  }
  return probe.expect;
}

function classifyMessage(data: unknown): Decision {
  if (!isPlainObject(data)) return { type: "ignore" };
  if (data.channel !== SANDBOX_CHANNEL) return { type: "ignore" };
  if (data.kind === "ready") return { type: "ready" };
  if (data.kind === "resize") {
    const height = interpretHeight(data.height);
    if (!height.ok) return { type: "resize-rejected", reason: height.reason };
    return { type: "resize", height: height.height, raw: height.raw, clamped: height.clamped };
  }
  if (data.kind === "call") {
    const id = typeof data.id === "string" ? data.id : "";
    return { type: "call", id, decision: validateCall(data.name, data.args) };
  }
  return { type: "rejected", reason: "无法识别的消息" };
}

function signature(state: StreamState): string {
  return JSON.stringify([
    state.initialHeight ?? null,
    state.initialHeightRaw,
    state.initialHeightComplete,
    state.placeholderMessages,
    state.placeholderMessagesComplete,
    state.css,
    state.cssComplete,
    state.html,
    state.htmlComplete,
    state.jsFunctions,
    state.jsFunctionsComplete,
    state.jsExpressions,
    state.jsExpressionsClosed,
    state.jsExpressionsComplete,
    state.generating,
    state.error ?? "",
  ]);
}

function markComplete(state: StreamState, field: FieldName) {
  if (field === "initialHeight") state.initialHeightComplete = true;
  if (field === "placeholderMessages") state.placeholderMessagesComplete = true;
  if (field === "css") state.cssComplete = true;
  if (field === "html") state.htmlComplete = true;
  if (field === "jsFunctions") state.jsFunctionsComplete = true;
  if (field === "jsExpressions") state.jsExpressionsComplete = true;
}

type ReadStatus = "ok" | "partial" | "error";

function readField(
  src: string,
  cursor: { i: number },
  state: StreamState,
  field: FieldName | null,
): ReadStatus {
  const peek = src[cursor.i] ?? "";
  if (field === "initialHeight") return readHeight(src, cursor, state);
  if (field === "css" || field === "jsFunctions") return readTextField(src, cursor, state, field);
  if (field === "placeholderMessages" || field === "html" || field === "jsExpressions") {
    return readStringArray(src, cursor, state, field);
  }
  return skipValue(src, cursor, peek);
}

function readHeight(src: string, cursor: { i: number }, state: StreamState): ReadStatus {
  const start = cursor.i;
  const number = scanNumber(src, cursor);
  state.initialHeightRaw = src.slice(start, cursor.i);
  if (number.status === "error") {
    state.error = number.reason;
    return "error";
  }
  if (number.status === "partial") return "partial";
  state.initialHeight = number.value;
  return "ok";
}

function readTextField(
  src: string,
  cursor: { i: number },
  state: StreamState,
  field: "css" | "jsFunctions",
): ReadStatus {
  const text = readString(src, cursor);
  if (text.status === "error") {
    state.error = text.reason;
    return "error";
  }
  if (field === "css") state.css = text.value;
  else state.jsFunctions = text.value;
  return text.status === "partial" ? "partial" : "ok";
}

function readStringArray(
  src: string,
  cursor: { i: number },
  state: StreamState,
  field: "placeholderMessages" | "html" | "jsExpressions",
): ReadStatus {
  if ((src[cursor.i] ?? "") !== "[") {
    state.error = `${field} 应为字符串数组`;
    return "error";
  }
  cursor.i += 1;
  const items: string[] = [];
  let closed = 0;
  const publish = () => {
    if (field === "placeholderMessages") {
      state.placeholderMessages = items.slice();
      state.placeholderMessagesClosed = closed;
    } else if (field === "html") {
      state.html = items.slice();
      state.htmlClosed = closed;
    } else {
      state.jsExpressions = items.slice();
      state.jsExpressionsClosed = closed;
    }
  };
  while (cursor.i < src.length) {
    while (cursor.i < src.length && /\s/.test(src[cursor.i] ?? "")) cursor.i += 1;
    if (cursor.i >= src.length) {
      publish();
      return "partial";
    }
    const ch = src[cursor.i] ?? "";
    if (ch === "]") {
      cursor.i += 1;
      publish();
      return "ok";
    }
    if (ch === ",") {
      cursor.i += 1;
      continue;
    }
    const text = readString(src, cursor);
    if (text.status === "error") {
      state.error = text.reason;
      return "error";
    }
    items.push(text.value);
    if (text.status === "ok") closed += 1;
    publish();
    if (text.status === "partial") return "partial";
  }
  publish();
  return "partial";
}

function readString(
  src: string,
  cursor: { i: number },
): { status: "ok" | "partial"; value: string } | { status: "error"; reason: string; value: string } {
  if ((src[cursor.i] ?? "") !== '"') {
    return { status: "error", reason: "这里应为字符串", value: "" };
  }
  cursor.i += 1;
  let value = "";
  while (cursor.i < src.length) {
    const ch = src[cursor.i] ?? "";
    if (ch === '"') {
      cursor.i += 1;
      return { status: "ok", value };
    }
    if (ch === "\\") {
      if (cursor.i + 1 >= src.length) return { status: "partial", value };
      const next = src[cursor.i + 1] ?? "";
      const simple: Record<string, string> = {
        '"': '"',
        "\\": "\\",
        "/": "/",
        b: "\b",
        f: "\f",
        n: "\n",
        r: "\r",
        t: "\t",
      };
      if (next === "u") {
        if (cursor.i + 6 > src.length) return { status: "partial", value };
        const hex = src.slice(cursor.i + 2, cursor.i + 6);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
          return { status: "error", reason: "坏的转义", value };
        }
        value += String.fromCharCode(Number.parseInt(hex, 16));
        cursor.i += 6;
        continue;
      }
      if (!(next in simple)) return { status: "error", reason: "坏的转义", value };
      value += simple[next];
      cursor.i += 2;
      continue;
    }
    if (ch < " ") return { status: "error", reason: "字符串里有控制字符", value };
    value += ch;
    cursor.i += 1;
  }
  return { status: "partial", value };
}

function scanNumber(
  src: string,
  cursor: { i: number },
): { status: "ok"; value: number } | { status: "partial" } | { status: "error"; reason: string } {
  const start = cursor.i;
  if ((src[cursor.i] ?? "") === "-") cursor.i += 1;
  const digitStart = cursor.i;
  while (cursor.i < src.length && /[0-9]/.test(src[cursor.i] ?? "")) cursor.i += 1;
  if (cursor.i < src.length && src[cursor.i] === ".") {
    cursor.i += 1;
    while (cursor.i < src.length && /[0-9]/.test(src[cursor.i] ?? "")) cursor.i += 1;
  }
  if (cursor.i < src.length && /[eE]/.test(src[cursor.i] ?? "")) {
    cursor.i += 1;
    if (cursor.i < src.length && /[+-]/.test(src[cursor.i] ?? "")) cursor.i += 1;
    while (cursor.i < src.length && /[0-9]/.test(src[cursor.i] ?? "")) cursor.i += 1;
  }
  if (cursor.i >= src.length) return { status: "partial" };
  const next = src[cursor.i] ?? "";
  if (!/[\s,}\]]/.test(next)) return { status: "error", reason: "数字没有结束" };
  const raw = src.slice(start, cursor.i);
  if (digitStart === start && raw === "-") return { status: "error", reason: "数字没有结束" };
  const value = Number(raw);
  if (!Number.isFinite(value)) return { status: "error", reason: "数字不是有限值" };
  return { status: "ok", value };
}

function skipValue(src: string, cursor: { i: number }, peek: string): ReadStatus {
  if (peek === '"') {
    const text = readString(src, cursor);
    if (text.status === "error") return "error";
    return text.status === "partial" ? "partial" : "ok";
  }
  if (peek === "-" || /[0-9]/.test(peek)) {
    const number = scanNumber(src, cursor);
    if (number.status === "error") return "error";
    return number.status === "partial" ? "partial" : "ok";
  }
  if (peek === "{") return skipContainer(src, cursor, "{", "}");
  if (peek === "[") return skipContainer(src, cursor, "[", "]");
  for (const literal of ["true", "false", "null"]) {
    if (src.startsWith(literal, cursor.i)) {
      cursor.i += literal.length;
      return "ok";
    }
  }
  if (cursor.i >= src.length) return "partial";
  return "error";
}

function skipContainer(src: string, cursor: { i: number }, open: string, close: string): ReadStatus {
  if ((src[cursor.i] ?? "") !== open) return "error";
  cursor.i += 1;
  let depth = 1;
  while (cursor.i < src.length) {
    const ch = src[cursor.i] ?? "";
    if (ch === '"') {
      const text = readString(src, cursor);
      if (text.status === "error") return "error";
      if (text.status === "partial") return "partial";
      continue;
    }
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      cursor.i += 1;
      if (depth === 0) return "ok";
      continue;
    }
    cursor.i += 1;
  }
  return "partial";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
