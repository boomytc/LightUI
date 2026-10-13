export const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";

export const MISSING_MODEL_ERROR = "响应里没有 model，未写入 recording-data.ts";

export type ChatCompletion =
  | { ok: true; model: string; content: string }
  | { ok: false; code: "missing-model" | "missing-content" | "unreadable"; error: string };

/** Request name from `DEEPSEEK_MODEL`. Unset or empty falls back to `deepseek-chat`. */
export function requestedModelName(value: string | undefined): string {
  return value || DEFAULT_DEEPSEEK_MODEL;
}

/**
 * Read `model` and message content from a non-streaming chat completion body.
 * A usable `model` is a non-empty string, the same check the sandbox-bridge
 * stream reader applies to each SSE payload.
 */
export function readChatCompletion(body: unknown): ChatCompletion {
  if (!isRecord(body)) {
    return { ok: false, code: "unreadable", error: "DeepSeek response was not a completion object." };
  }
  const model = readResponseModel(body);
  if (!model) {
    return { ok: false, code: "missing-model", error: MISSING_MODEL_ERROR };
  }
  const content = readMessageContent(body);
  if (content === null) {
    return { ok: false, code: "missing-content", error: "DeepSeek returned no message content." };
  }
  return { ok: true, model, content };
}

export function readResponseModel(value: unknown): string | null {
  if (!isRecord(value)) return null;
  const model = value.model;
  if (typeof model === "string" && model.length > 0) return model;
  return null;
}

function readMessageContent(record: Record<string, unknown>): string | null {
  const choices = record.choices;
  if (!Array.isArray(choices)) return null;
  const first = choices[0];
  if (!isRecord(first)) return null;
  const message = first.message;
  if (!isRecord(message)) return null;
  const content = message.content;
  if (typeof content !== "string" || content.trim().length === 0) return null;
  return content;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
