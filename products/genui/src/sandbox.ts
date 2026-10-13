export const SANDBOX_PROMPT_MIN_LENGTH = 1;
export const SANDBOX_PROMPT_MAX_LENGTH = 4000;
export const SANDBOX_LINK_PROTOCOL = "https:" as const;
export const SANDBOX_GENERATING_KEY = "generating" as const;

export const SANDBOX_FIELDS = {
  initialHeight: {
    type: "number",
    complete: "initialHeightComplete",
  },
  placeholderMessages: {
    type: "array",
    items: { type: "string" },
    complete: "placeholderMessagesComplete",
  },
  css: {
    type: "string",
    complete: "cssComplete",
  },
  html: {
    type: "array",
    items: { type: "string" },
    complete: "htmlComplete",
  },
  jsFunctions: {
    type: "string",
    complete: "jsFunctionsComplete",
  },
  jsExpressions: {
    type: "array",
    items: { type: "string" },
    complete: "jsExpressionsComplete",
  },
} as const;

export const SANDBOX_FIELD_ORDER = [
  "initialHeight",
  "placeholderMessages",
  "css",
  "html",
  "jsFunctions",
  "jsExpressions",
] as const satisfies readonly (keyof typeof SANDBOX_FIELDS)[];

export type SandboxFieldName = (typeof SANDBOX_FIELD_ORDER)[number];

type FieldOrderCovers =
  Exclude<keyof typeof SANDBOX_FIELDS, SandboxFieldName> extends never ? true : never;
const fieldOrderCovers: FieldOrderCovers = true;
void fieldOrderCovers;

export const SANDBOX_COMPLETE_KEY = {
  initialHeight: SANDBOX_FIELDS.initialHeight.complete,
  placeholderMessages: SANDBOX_FIELDS.placeholderMessages.complete,
  css: SANDBOX_FIELDS.css.complete,
  html: SANDBOX_FIELDS.html.complete,
  jsFunctions: SANDBOX_FIELDS.jsFunctions.complete,
  jsExpressions: SANDBOX_FIELDS.jsExpressions.complete,
} as const satisfies Record<SandboxFieldName, string>;

export const SANDBOX_CALLBACKS = [
  {
    name: "sendPrompt",
    additionalProperties: false,
    unknownFields: "reject",
    props: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      additionalProperties: false,
      properties: {
        text: {
          type: "string",
          description:
            "Prompt text. Leading and trailing whitespace is removed; the remaining length must be 1–4000.",
        },
      },
      required: ["text"],
    },
    text: {
      trim: true,
      minLength: SANDBOX_PROMPT_MIN_LENGTH,
      maxLength: SANDBOX_PROMPT_MAX_LENGTH,
    },
  },
  {
    name: "openLink",
    additionalProperties: false,
    unknownFields: "reject",
    props: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          description: "Absolute URL. Trimmed, then accepted only when the protocol is https.",
        },
      },
      required: ["url"],
    },
    url: { trim: true, protocol: SANDBOX_LINK_PROTOCOL },
  },
] as const;

export const SANDBOX_HEIGHT = {
  min: 50,
  max: 4000,
  nonFinite: "discard",
  finite: "clamp",
  ceil: true,
} as const;

export const SANDBOX_TRUST = {
  by: "event.source",
  equals: "iframe.contentWindow",
  nonce: "optional",
} as const;

export type SandboxPayload = {
  initialHeight: number;
  placeholderMessages: string[];
  css: string;
  html: string[];
  jsFunctions: string;
  jsExpressions: string[];
};

export type SandboxPayloadIssue = {
  field: string;
  code: "not-object" | "unexpected" | "missing" | "type" | "order";
};

export type SandboxCallDecision =
  | { ok: true; name: "sendPrompt"; text: string }
  | { ok: true; name: "openLink"; url: string }
  | { ok: false; name: string; reason: string };

export type SandboxHeightDecision =
  | { ok: true; height: number; raw: number; clamped: boolean }
  | { ok: false; reason: string };

export type SandboxNonce = {
  expected: string;
  received: unknown;
};

export function sandboxFieldOrderViolations<T extends string>(keyOrder: readonly T[]): T[] {
  let last = -1;
  const problems: T[] = [];
  const order: readonly string[] = SANDBOX_FIELD_ORDER;
  for (const key of keyOrder) {
    const index = order.indexOf(key);
    if (index < last) problems.push(key);
    last = Math.max(last, index);
  }
  return problems;
}

export function validateSandboxPayload(
  value: unknown,
): { ok: true; payload: SandboxPayload } | { ok: false; issues: SandboxPayloadIssue[] } {
  if (!isPlainObject(value)) return { ok: false, issues: [{ field: "", code: "not-object" }] };
  const issues: SandboxPayloadIssue[] = [];
  const keys = Object.keys(value);
  for (const key of keys) {
    if (!(SANDBOX_FIELD_ORDER as readonly string[]).includes(key)) {
      issues.push({ field: key, code: "unexpected" });
    }
  }
  for (const field of SANDBOX_FIELD_ORDER) {
    if (!(field in value)) {
      issues.push({ field, code: "missing" });
      continue;
    }
    if (!valueMatchesField(field, value[field])) issues.push({ field, code: "type" });
  }
  const known = keys.filter((key): key is SandboxFieldName =>
    (SANDBOX_FIELD_ORDER as readonly string[]).includes(key),
  );
  const outOfOrder = sandboxFieldOrderViolations(known).length > 0;
  const incomplete = known.join(",") !== SANDBOX_FIELD_ORDER.join(",");
  if (outOfOrder || (incomplete && !issues.some((issue) => issue.code === "missing"))) {
    issues.push({ field: "", code: "order" });
  }
  if (issues.length > 0) return { ok: false, issues };
  return {
    ok: true,
    payload: {
      initialHeight: value.initialHeight as number,
      placeholderMessages: value.placeholderMessages as string[],
      css: value.css as string,
      html: value.html as string[],
      jsFunctions: value.jsFunctions as string,
      jsExpressions: value.jsExpressions as string[],
    },
  };
}

export function validateSandboxCallback(name: unknown, args: unknown): SandboxCallDecision {
  const label = typeof name === "string" ? name : "";
  const callback = SANDBOX_CALLBACKS.find((item) => item.name === name);
  if (!callback) return { ok: false, name: label || "（空）", reason: "未知函数" };
  if (!isPlainObject(args)) return { ok: false, name: callback.name, reason: "参数必须是对象" };
  if (callback.props.additionalProperties === false) {
    const allowed = new Set(Object.keys(callback.props.properties));
    if (Object.keys(args).some((key) => !allowed.has(key))) {
      return { ok: false, name: callback.name, reason: "出现了未声明的参数" };
    }
  }
  if (callback.name === "sendPrompt") {
    const text = args.text;
    if (typeof text !== "string") return { ok: false, name: callback.name, reason: "text 必须是字符串" };
    const trimmed = callback.text.trim ? text.trim() : text;
    if (trimmed.length < callback.text.minLength) {
      return { ok: false, name: callback.name, reason: "text 不能为空" };
    }
    if (trimmed.length > callback.text.maxLength) {
      return { ok: false, name: callback.name, reason: "text 超过 4000 字" };
    }
    return { ok: true, name: callback.name, text: trimmed };
  }
  const url = args.url;
  if (typeof url !== "string") return { ok: false, name: callback.name, reason: "url 必须是字符串" };
  const raw = callback.url.trim ? url.trim() : url;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, name: callback.name, reason: "url 不是合法地址" };
  }
  if (parsed.protocol !== callback.url.protocol) {
    return { ok: false, name: callback.name, reason: "url 必须是 https" };
  }
  return { ok: true, name: callback.name, url: parsed.toString() };
}

export function interpretSandboxHeight(height: unknown): SandboxHeightDecision {
  if (typeof height !== "number" || !Number.isFinite(height)) {
    return { ok: false, reason: "高度不是有限数字" };
  }
  const ceiled = SANDBOX_HEIGHT.ceil ? Math.ceil(height) : height;
  const next = Math.max(SANDBOX_HEIGHT.min, Math.min(ceiled, SANDBOX_HEIGHT.max));
  return { ok: true, height: next, raw: height, clamped: next !== height };
}

/**
 * Trust the sender when `event.source` is that iframe's `contentWindow`.
 * A nonce, when provided, must also match. It does not replace the window check.
 */
export function sandboxEventTrusted(
  eventSource: unknown,
  contentWindow: unknown,
  nonce?: SandboxNonce,
): boolean {
  if (typeof contentWindow !== "object" || contentWindow === null) return false;
  if (eventSource !== contentWindow) return false;
  if (nonce === undefined) return true;
  return nonce.expected.length > 0 && nonce.received === nonce.expected;
}

function valueMatchesField(field: SandboxFieldName, value: unknown): boolean {
  const spec = SANDBOX_FIELDS[field];
  if (spec.type === "number") return typeof value === "number" && Number.isFinite(value);
  if (spec.type === "string") return typeof value === "string";
  return spec.items.type === "string" && isStringArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
