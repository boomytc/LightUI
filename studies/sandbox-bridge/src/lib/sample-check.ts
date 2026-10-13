import {
  COMPLETE_KEY,
  FIELD_ORDER,
  MAX_HEIGHT,
  MAX_PROMPT,
  MIN_HEIGHT,
  SANDBOX_CHANNEL,
  decideSandboxMessage,
  interpretHeight,
  orderViolations,
  paintOf,
  parseStream,
  playbackSteps,
} from "./machines";
import type { CallDecision, FieldName, StreamState } from "./machines";

/**
 * Each piece of the recorded source is handed to `parseStream` (the parser
 * `playbackSteps` uses). Inside a piece, prefixes are checked one character
 * at a time so a `*Complete` flag can be pinned to the closing token.
 */
export const RECORDED_CHUNK_SIZE = 12;

export type SampleCheck = {
  id: string;
  ok: boolean;
  detail: string;
};

type Snap = { at: number; state: StreamState };

type Replay = {
  snaps: Snap[];
  final: StreamState;
  completeAt: Partial<Record<FieldName, number>>;
  functionsProblem: string | null;
  expressionsProblem: string | null;
  sawPartialFunctions: boolean;
  sawPartialExpressions: boolean;
};

type HostCall =
  | { name: "sendPrompt" | "openLink"; parsed: true; args: Record<string, unknown> }
  | { name: "sendPrompt" | "openLink"; parsed: false };

type Draft = {
  initialHeight: number;
  placeholderMessages: string[];
  css: string;
  html: string[];
  jsFunctions: string;
  jsExpressions: string[];
};

/**
 * Checks a recorded model source with the page parser and the page's call/height decisions.
 * The record script and the recorded-sample tests both call this. Neither reimplements it.
 */
export function checkRecordedSource(source: string): SampleCheck[] {
  const replayed = replay(source);
  const calls = hostCalls(replayed.final);
  return [
    checkJson(source),
    checkOrder(source, replayed),
    ...FIELD_ORDER.map((field) => checkFieldComplete(source, replayed, field)),
    checkGenerating(source, replayed),
    checkFunctionsWait(replayed),
    checkExpressionsWait(replayed),
    checkHeight(replayed.final),
    checkSendPrompt(calls),
    checkOpenLink(calls),
    checkUnknownField(calls),
    checkTamperHttp(replayed.final),
    checkTamperExtra(replayed.final),
  ];
}

export function formatSampleCheck(check: SampleCheck): string {
  return `${check.ok ? "通过" : "失败"}  ${check.id}  ${check.detail}`;
}

function replay(source: string): Replay {
  const snaps: Snap[] = [];
  const completeAt: Partial<Record<FieldName, number>> = {};
  let functionsProblem: string | null = null;
  let expressionsProblem: string | null = null;
  let sawPartialFunctions = false;
  let sawPartialExpressions = false;
  let final = parseStream("", false);
  if (source.length === 0) snaps.push({ at: 0, state: final });

  for (let base = 0; base < source.length; base += RECORDED_CHUNK_SIZE) {
    const end = Math.min(source.length, base + RECORDED_CHUNK_SIZE);
    for (let at = base + 1; at <= end; at += 1) {
      const state = parseStream(source.slice(0, at), at < source.length);
      final = state;
      if (at === end) snaps.push({ at, state });
      for (const field of FIELD_ORDER) {
        if (completeAt[field] === undefined && state[COMPLETE_KEY[field]]) completeAt[field] = at;
      }
      if (!functionsProblem) functionsProblem = functionsWaitProblem(state);
      if (!expressionsProblem) expressionsProblem = expressionsWaitProblem(state);
      const paint = paintOf(state);
      if (state.jsFunctions.length > 0 && !state.jsFunctionsComplete && paint.functions === null) {
        sawPartialFunctions = true;
      }
      if (
        state.jsExpressions.length > state.jsExpressionsClosed &&
        paint.expressions.length === state.jsExpressionsClosed
      ) {
        sawPartialExpressions = true;
      }
    }
  }

  return {
    snaps,
    final,
    completeAt,
    functionsProblem,
    expressionsProblem,
    sawPartialFunctions,
    sawPartialExpressions,
  };
}

function checkJson(source: string): SampleCheck {
  try {
    const value = JSON.parse(source) as unknown;
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return fail("json", "根节点不是对象");
    }
    return pass("json", "源文本是一个 JSON 对象");
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法解析 JSON";
    return fail("json", message);
  }
}

function checkOrder(source: string, replayed: Replay): SampleCheck {
  const { final, snaps } = replayed;
  if (final.error) return fail("order", final.error);
  for (const snap of snaps) {
    const problems = orderViolations(snap.state.keyOrder);
    if (problems.length > 0) return fail("order", `偏移 ${snap.at} 出现逆序字段 ${problems.join(", ")}`);
    const prefix = FIELD_ORDER.slice(0, snap.state.keyOrder.length);
    if (snap.state.keyOrder.join(",") !== prefix.join(",")) {
      return fail("order", `偏移 ${snap.at} 的键序是 ${snap.state.keyOrder.join(", ") || "（空）"}`);
    }
  }
  if (final.keyOrder.join(",") !== FIELD_ORDER.join(",")) {
    return fail("order", `最终键序是 ${final.keyOrder.join(", ") || "（空）"}`);
  }
  let previous = -1;
  for (const field of FIELD_ORDER) {
    const at = replayed.completeAt[field];
    if (at === undefined) return fail("order", `${field} 没有完成`);
    if (at <= previous) return fail("order", `${field} 的完成点不晚于前一个字段`);
    previous = at;
  }
  const page = playbackSteps(source);
  const last = page[page.length - 1];
  if (!last || last.state.keyOrder.join(",") !== FIELD_ORDER.join(",")) {
    return fail("order", "页面回放的最终键序与六个字段不一致");
  }
  return pass("order", `六字段按序到达，按 ${RECORDED_CHUNK_SIZE} 字一块喂入，共 ${snaps.length} 块`);
}

function checkFieldComplete(source: string, replayed: Replay, field: FieldName): SampleCheck {
  const id = `${field}-complete`;
  const at = replayed.completeAt[field];
  if (at === undefined) return fail(id, "没有置位");
  if (at < 1 || at > source.length) return fail(id, `偏移 ${at} 越界`);
  const before = parseStream(source.slice(0, at - 1), true);
  if (before[COMPLETE_KEY[field]]) return fail(id, "在内容结束前已经置位");
  const here = parseStream(source.slice(0, at), at < source.length);
  if (!here[COMPLETE_KEY[field]]) return fail(id, "完成点没有置位");
  if (!closerMatches(source, field, at)) {
    return fail(id, `置位时结束符是 ${JSON.stringify(source[at - 1] ?? "")}，不是该字段内容的结束`);
  }
  if (at >= source.length || !here.generating) return fail(id, "置位时 generating 已经落下");
  const content = contentProblem(here, field);
  if (content) return fail(id, content);
  return pass(id, `偏移 ${at} 才置位，结束符 ${JSON.stringify(source[at - 1] ?? "")}，此时 generating 仍为真`);
}

function checkGenerating(source: string, replayed: Replay): SampleCheck {
  for (const snap of replayed.snaps) {
    const expected = snap.at < source.length;
    if (snap.state.generating !== expected) {
      return fail("generating-last", `偏移 ${snap.at} 的 generating 为 ${String(snap.state.generating)}`);
    }
  }
  const latest = Math.max(...FIELD_ORDER.map((field) => replayed.completeAt[field] ?? 0));
  if (!Number.isFinite(latest) || latest <= 0 || latest >= source.length) {
    return fail("generating-last", "六个字段没有在源文本结束前全部置位");
  }
  const still = parseStream(source.slice(0, latest), true);
  if (!still.generating) return fail("generating-last", "字段到齐时 generating 已经为假");
  for (const field of FIELD_ORDER) {
    if (!still[COMPLETE_KEY[field]]) return fail("generating-last", `${field} 到齐前 generating 已落下`);
  }
  if (replayed.final.generating) return fail("generating-last", "源文本结束后 generating 仍为真");
  const page = playbackSteps(source);
  if (page.length < 2) return fail("generating-last", "页面回放没有留下生成中的步骤");
  if (page.slice(0, -1).some((step) => !step.state.generating)) {
    return fail("generating-last", "页面回放在结束前就把 generating 落下了");
  }
  const last = page[page.length - 1];
  if (!last || last.at !== source.length || last.state.generating) {
    return fail("generating-last", "页面回放的最后一步不是 generating = false");
  }
  return pass("generating-last", `六个 *Complete 在偏移 ${latest} 时已经到齐，generating 在源文本结束时才落下`);
}

function checkFunctionsWait(replayed: Replay): SampleCheck {
  if (replayed.functionsProblem) return fail("js-functions-wait", replayed.functionsProblem);
  if (!replayed.sawPartialFunctions) return fail("js-functions-wait", "没有观察到函数正文未完成、且尚未执行的前缀");
  const paint = paintOf(replayed.final);
  if (paint.functions === null) return fail("js-functions-wait", "字段完成后函数仍不可执行");
  return pass("js-functions-wait", "jsFunctionsComplete 之前不注入，完成后才可执行");
}

function checkExpressionsWait(replayed: Replay): SampleCheck {
  if (replayed.expressionsProblem) return fail("js-expressions-wait", replayed.expressionsProblem);
  if (!replayed.sawPartialExpressions) {
    return fail("js-expressions-wait", "没有观察到未闭合、且未被执行的表达式");
  }
  const paint = paintOf(replayed.final);
  if (paint.expressions.length !== replayed.final.jsExpressions.length) {
    return fail("js-expressions-wait", "全部闭合后仍有表达式没有执行");
  }
  return pass("js-expressions-wait", "只执行已经闭合的表达式；未闭合的那一条在 jsExpressionsComplete 前不执行");
}

function checkHeight(state: StreamState): SampleCheck {
  if (!state.initialHeightComplete) return fail("height-clamp", "initialHeight 尚未完成");
  const decision = interpretHeight(state.initialHeight);
  if (!decision.ok) return fail("height-clamp", decision.reason);
  if (MIN_HEIGHT !== 50 || MAX_HEIGHT !== 4000) {
    return fail("height-clamp", `钳制边界是 ${MIN_HEIGHT}–${MAX_HEIGHT}，不是 50–4000`);
  }
  if (decision.height < 50 || decision.height > 4000) {
    return fail("height-clamp", `钳制结果 ${decision.height} 不在 50–4000`);
  }
  const painted = paintOf(state).height;
  if (painted < MIN_HEIGHT || painted > MAX_HEIGHT) {
    return fail("height-clamp", `页面采用 ${painted}，不在 ${MIN_HEIGHT}–${MAX_HEIGHT}`);
  }
  const relation = decision.clamped ? "已钳制" : "落在区间内";
  return pass(
    "height-clamp",
    `原始 ${decision.raw}，钳制后 ${decision.height}，页面采用 ${painted}（${MIN_HEIGHT}–${MAX_HEIGHT}，${relation}）`,
  );
}

function checkSendPrompt(calls: HostCall[]): SampleCheck {
  const prompts = calls.filter((call) => call.name === "sendPrompt");
  if (prompts.length === 0) return fail("send-prompt", "样本里没有 sendPrompt");
  const lengths: number[] = [];
  for (const call of prompts) {
    if (!call.parsed) return fail("send-prompt", "无法解析 sendPrompt 的参数");
    const decision = acceptedCall("sendPrompt", call.args);
    if (!decision.ok || decision.name !== "sendPrompt") return fail("send-prompt", reasonOf(decision));
    if (decision.text.length < 1 || decision.text.length > MAX_PROMPT) {
      return fail("send-prompt", `trim 后长度为 ${decision.text.length}`);
    }
    lengths.push(decision.text.length);
  }
  return pass("send-prompt", `${prompts.length} 次放行，trim 后长度 ${lengths.join("、")}（1–${MAX_PROMPT}）`);
}

function checkOpenLink(calls: HostCall[]): SampleCheck {
  const links = calls.filter((call) => call.name === "openLink");
  if (links.length === 0) return fail("open-link", "样本里没有 openLink");
  const urls: string[] = [];
  for (const call of links) {
    if (!call.parsed) return fail("open-link", "无法解析 openLink 的参数");
    const decision = acceptedCall("openLink", call.args);
    if (!decision.ok || decision.name !== "openLink") return fail("open-link", reasonOf(decision));
    let url: URL;
    try {
      url = new URL(decision.url);
    } catch {
      return fail("open-link", "放行结果不是合法地址");
    }
    if (url.protocol !== "https:") return fail("open-link", `协议是 ${url.protocol}`);
    urls.push(decision.url);
  }
  return pass("open-link", `${links.length} 次放行，均为 https：${urls.join("，")}`);
}

function checkUnknownField(calls: HostCall[]): SampleCheck {
  const prompt = calls.find((call) => call.name === "sendPrompt" && call.parsed);
  if (!prompt || !prompt.parsed) return fail("unknown-field", "没有可附加未知字段的 sendPrompt");
  const decision = acceptedCall("sendPrompt", { ...prompt.args, extra: true });
  if (decision.ok) return fail("unknown-field", "多出未知字段仍被放行");
  return pass("unknown-field", `带未知字段的消息被拒绝：${decision.reason}`);
}

function checkTamperHttp(state: StreamState): SampleCheck {
  const tampered = rebuild(state, (draft) => {
    const nextFunctions = draft.jsFunctions.replace(/https:\/\//gi, "http://");
    const nextExpressions = draft.jsExpressions.map((line) => line.replace(/https:\/\//gi, "http://"));
    const changed =
      nextFunctions !== draft.jsFunctions ||
      nextExpressions.some((line, index) => line !== draft.jsExpressions[index]);
    draft.jsFunctions = nextFunctions;
    draft.jsExpressions = nextExpressions;
    return changed;
  });
  if (!tampered) return fail("tamper-http", "样本里没有可改成 http 的链接");
  const calls = hostCalls(parseStream(tampered, false));
  const links = calls.filter((call) => call.name === "openLink");
  if (links.length === 0) return fail("tamper-http", "篡改样本里没有 openLink");
  for (const call of links) {
    if (!call.parsed) return fail("tamper-http", "篡改后的 openLink 无法解析");
    const decision = acceptedCall("openLink", call.args);
    if (decision.ok && decision.name === "openLink") {
      return fail("tamper-http", `http 链接被放行：${decision.url}`);
    }
    if (decision.ok) return fail("tamper-http", "http 链接被放行");
  }
  return pass("tamper-http", "篡改样本里的 http 链接被拒绝");
}

function checkTamperExtra(state: StreamState): SampleCheck {
  const tampered = rebuild(state, (draft) => {
    const next = insertUnknownField(draft.jsFunctions);
    if (next === null) return false;
    draft.jsFunctions = next;
    return true;
  });
  if (!tampered) return fail("tamper-extra", "没有可插入未知字段的 sendPrompt");
  const calls = hostCalls(parseStream(tampered, false));
  const tainted = calls.filter((call) => call.parsed && call.name === "sendPrompt" && hasUnknownKey(call.args));
  if (tainted.length === 0) return fail("tamper-extra", "篡改样本里没有带未知字段的 sendPrompt");
  for (const call of tainted) {
    if (!call.parsed) continue;
    const decision = acceptedCall("sendPrompt", call.args);
    if (decision.ok) return fail("tamper-extra", "多出未知字段的 sendPrompt 被放行");
  }
  return pass("tamper-extra", "篡改样本里多出未知字段的消息被拒绝");
}

function functionsWaitProblem(state: StreamState): string | null {
  const paint = paintOf(state);
  if (!state.jsFunctionsComplete && paint.functions !== null) {
    return "jsFunctionsComplete 之前函数已进入可执行状态";
  }
  return null;
}

function expressionsWaitProblem(state: StreamState): string | null {
  const paint = paintOf(state);
  if (!state.jsFunctionsComplete && paint.expressions.length > 0) {
    return "jsFunctionsComplete 之前表达式已被执行";
  }
  if (paint.expressions.length > state.jsExpressionsClosed) return "未闭合的表达式被执行";
  const live = state.htmlComplete && state.jsFunctionsComplete;
  const expected = live ? state.jsExpressionsClosed : 0;
  if (paint.expressions.length !== expected) {
    return `执行了 ${paint.expressions.length} 条，已闭合可执行的是 ${expected} 条`;
  }
  return null;
}

function closerMatches(source: string, field: FieldName, at: number): boolean {
  const ch = source[at - 1] ?? "";
  if (field === "initialHeight") return /[\s,}\]]/.test(ch);
  if (field === "css" || field === "jsFunctions") return ch === '"';
  return ch === "]";
}

function contentProblem(state: StreamState, field: FieldName): string | null {
  if (field === "initialHeight") {
    if (typeof state.initialHeight !== "number" || !Number.isFinite(state.initialHeight)) return "initialHeight 不是有限数字";
    return null;
  }
  if (field === "placeholderMessages") {
    if (state.placeholderMessages.length < 1) return "placeholderMessages 是空的";
    return null;
  }
  if (field === "css") return state.css.length > 0 ? null : "css 是空的";
  if (field === "html") return state.html.some((part) => part.length > 0) ? null : "html 是空的";
  if (field === "jsFunctions") return state.jsFunctions.length > 0 ? null : "jsFunctions 是空的";
  return state.jsExpressions.some((part) => part.length > 0) ? null : "jsExpressions 是空的";
}

function hostCalls(state: StreamState): HostCall[] {
  return extractHostCalls([state.jsFunctions, ...state.jsExpressions].join("\n"));
}

function acceptedCall(name: "sendPrompt" | "openLink", args: unknown): CallDecision {
  const decision = decideSandboxMessage({
    sourceIsFrame: true,
    data: { channel: SANDBOX_CHANNEL, kind: "call", id: "recorded", name, args },
  });
  if (decision.type !== "call") return { ok: false, name, reason: "消息没有进入调用校验" };
  return decision.decision;
}

function reasonOf(decision: CallDecision): string {
  return decision.ok ? "已放行" : decision.reason;
}

function hasUnknownKey(args: Record<string, unknown>): boolean {
  return Object.keys(args).some((key) => key !== "text");
}

function rebuild(state: StreamState, mutate: (draft: Draft) => boolean): string | null {
  if (state.error || typeof state.initialHeight !== "number") return null;
  if (!state.jsFunctionsComplete || !state.jsExpressionsComplete) return null;
  const draft: Draft = {
    initialHeight: state.initialHeight,
    placeholderMessages: [...state.placeholderMessages],
    css: state.css,
    html: [...state.html],
    jsFunctions: state.jsFunctions,
    jsExpressions: [...state.jsExpressions],
  };
  if (!mutate(draft)) return null;
  return JSON.stringify(draft);
}

function insertUnknownField(code: string): string | null {
  const re = /\bsendPrompt\s*\(\s*\{/g;
  const match = re.exec(code);
  if (!match) return null;
  const at = match.index + match[0].length;
  return `${code.slice(0, at)} extra: true,${code.slice(at)}`;
}

function extractHostCalls(code: string): HostCall[] {
  const calls: HostCall[] = [];
  const re = /\b(sendPrompt|openLink)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code))) {
    const name = match[1] === "openLink" ? "openLink" : "sendPrompt";
    let index = match.index + match[0].length;
    while (index < code.length && /\s/.test(code[index] ?? "")) index += 1;
    if ((code[index] ?? "") !== "{") {
      calls.push({ name, parsed: false });
      continue;
    }
    const object = readJsObject(code, index);
    if (!object) {
      calls.push({ name, parsed: false });
      continue;
    }
    calls.push({ name, parsed: true, args: object.value });
    re.lastIndex = object.end;
  }
  return calls;
}

function readJsObject(code: string, start: number): { value: Record<string, unknown>; end: number } | null {
  if ((code[start] ?? "") !== "{") return null;
  const value: Record<string, unknown> = {};
  let index = start + 1;
  while (index < code.length) {
    while (index < code.length && /[\s,]/.test(code[index] ?? "")) index += 1;
    if ((code[index] ?? "") === "}") return { value, end: index + 1 };
    const key = readJsKey(code, index);
    if (!key) return null;
    index = key.end;
    while (index < code.length && /\s/.test(code[index] ?? "")) index += 1;
    if ((code[index] ?? "") !== ":") return null;
    index += 1;
    while (index < code.length && /\s/.test(code[index] ?? "")) index += 1;
    const item = readJsValue(code, index);
    if (!item) return null;
    value[key.value] = item.value;
    index = item.end;
  }
  return null;
}

function readJsKey(code: string, start: number): { value: string; end: number } | null {
  const ch = code[start] ?? "";
  if (ch === '"' || ch === "'") return readJsString(code, start);
  const match = /^[A-Za-z_$][\w$]*/.exec(code.slice(start));
  if (!match) return null;
  return { value: match[0], end: start + match[0].length };
}

function readJsValue(code: string, start: number): { value: unknown; end: number } | null {
  const ch = code[start] ?? "";
  if (ch === '"' || ch === "'" || ch === "`") return readJsString(code, start);
  if (ch === "{") {
    const object = readJsObject(code, start);
    return object ? { value: object.value, end: object.end } : null;
  }
  if (ch === "[") return skipJsContainer(code, start, "[", "]");
  if (ch === "-" || /[0-9]/.test(ch)) {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(code.slice(start));
    if (!match) return null;
    return { value: Number(match[0]), end: start + match[0].length };
  }
  for (const literal of ["true", "false", "null"] as const) {
    if (!code.startsWith(literal, start)) continue;
    const next = code[start + literal.length] ?? "";
    if (/[\w$]/.test(next)) continue;
    const value = literal === "true" ? true : literal === "false" ? false : null;
    return { value, end: start + literal.length };
  }
  return null;
}

function readJsString(code: string, start: number): { value: string; end: number } | null {
  const quote = code[start] ?? "";
  if (quote !== '"' && quote !== "'" && quote !== "`") return null;
  let value = "";
  let index = start + 1;
  while (index < code.length) {
    const ch = code[index] ?? "";
    if (ch === "\\") {
      if (index + 1 >= code.length) return null;
      const next = code[index + 1] ?? "";
      const simple: Record<string, string> = {
        n: "\n",
        r: "\r",
        t: "\t",
        b: "\b",
        f: "\f",
        "\\": "\\",
        "'": "'",
        '"': '"',
        "`": "`",
      };
      value += simple[next] ?? next;
      index += 2;
      continue;
    }
    if (quote === "`" && ch === "$" && (code[index + 1] ?? "") === "{") return null;
    if (ch === quote) return { value, end: index + 1 };
    value += ch;
    index += 1;
  }
  return null;
}

function skipJsContainer(
  code: string,
  start: number,
  open: string,
  close: string,
): { value: unknown; end: number } | null {
  if ((code[start] ?? "") !== open) return null;
  let depth = 1;
  let index = start + 1;
  while (index < code.length) {
    const ch = code[index] ?? "";
    if (ch === '"' || ch === "'" || ch === "`") {
      const text = readJsString(code, index);
      if (!text) return null;
      index = text.end;
      continue;
    }
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      index += 1;
      if (depth === 0) return { value: null, end: index };
      continue;
    }
    index += 1;
  }
  return null;
}

function pass(id: string, detail: string): SampleCheck {
  return { id, ok: true, detail };
}

function fail(id: string, detail: string): SampleCheck {
  return { id, ok: false, detail };
}
