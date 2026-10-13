export type DeepseekRecording =
  | { status: "not-run"; reason: string }
  | {
      status: "recorded";
      requestedModel: string;
      model: string;
      recordedAt: string;
      request: string;
      raw: string;
    };

export function readRecording(value: unknown): DeepseekRecording {
  if (!value || typeof value !== "object") {
    return { status: "not-run", reason: "recording file is unreadable" };
  }
  const record = value as Record<string, unknown>;
  if (
    record.status === "recorded" &&
    nonEmpty(record.requestedModel) &&
    nonEmpty(record.model) &&
    typeof record.recordedAt === "string" &&
    typeof record.request === "string" &&
    typeof record.raw === "string" &&
    record.raw.trim().length > 0
  ) {
    return {
      status: "recorded",
      requestedModel: record.requestedModel,
      model: record.model,
      recordedAt: record.recordedAt,
      request: record.request,
      raw: record.raw,
    };
  }
  if (record.status === "not-run" && typeof record.reason === "string") {
    return { status: "not-run", reason: record.reason };
  }
  return { status: "not-run", reason: "recording file is unreadable" };
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
