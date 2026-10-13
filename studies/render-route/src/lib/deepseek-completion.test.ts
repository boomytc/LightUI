import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_DEEPSEEK_MODEL,
  MISSING_MODEL_ERROR,
  readChatCompletion,
  readResponseModel,
  requestedModelName,
} from "./deepseek-completion";
import { readRecording } from "./recording";

const CONTENT = '{"surface":"text","text":"你好","reason":"一句"}';

function completion(model: unknown, content: unknown = CONTENT) {
  return {
    id: "chatcmpl-test",
    model,
    choices: [{ message: { role: "assistant", content } }],
  };
}

describe("requested model name", () => {
  it("uses deepseek-chat when DEEPSEEK_MODEL is unset or empty", () => {
    assert.equal(requestedModelName(undefined), DEFAULT_DEEPSEEK_MODEL);
    assert.equal(requestedModelName(""), "deepseek-chat");
  });

  it("keeps the name from DEEPSEEK_MODEL", () => {
    assert.equal(requestedModelName("deepseek-reasoner"), "deepseek-reasoner");
  });
});

describe("chat completion body", () => {
  it("reads the model the response actually returned", () => {
    const read = readChatCompletion(completion("deepseek-flash"));
    assert.equal(read.ok, true);
    if (!read.ok) return;
    assert.equal(read.model, "deepseek-flash");
    assert.equal(read.content, CONTENT);
    assert.equal(readResponseModel(completion("deepseek-flash")), "deepseek-flash");
  });

  it("rejects a body that has no model and does not invent the request name", () => {
    const missing: unknown[] = [
      { choices: [{ message: { content: CONTENT } }] },
      completion(""),
      completion(null),
      completion(1),
      completion(["deepseek-chat"]),
    ];
    for (const body of missing) {
      const read = readChatCompletion(body);
      assert.deepEqual(read, { ok: false, code: "missing-model", error: MISSING_MODEL_ERROR });
      assert.equal(readResponseModel(body), null);
    }
    for (const body of [null, "deepseek-chat", []]) {
      const read = readChatCompletion(body);
      assert.equal(read.ok, false);
      if (!read.ok) assert.equal(read.code, "unreadable");
      assert.equal(readResponseModel(body), null);
    }
  });

  it("reports missing content only after a model is present", () => {
    const read = readChatCompletion(completion("deepseek-flash", "  "));
    assert.deepEqual(read, {
      ok: false,
      code: "missing-content",
      error: "DeepSeek returned no message content.",
    });
    const neither = readChatCompletion({ choices: [{ message: { content: "" } }] });
    assert.equal(neither.ok, false);
    if (!neither.ok) assert.equal(neither.code, "missing-model");
  });

  it("keeps both names on a recording built from a fake response", () => {
    const requestedModel = requestedModelName(undefined);
    const read = readChatCompletion(completion("deepseek-flash"));
    assert.equal(read.ok, true);
    if (!read.ok) return;
    const recording = readRecording({
      status: "recorded",
      requestedModel,
      model: read.model,
      recordedAt: "2026-10-14T00:00:00.000Z",
      request: "把通知做成正文",
      raw: read.content,
    });
    assert.equal(recording.status, "recorded");
    if (recording.status !== "recorded") return;
    assert.equal(recording.requestedModel, "deepseek-chat");
    assert.equal(recording.model, "deepseek-flash");
    assert.notEqual(recording.model, recording.requestedModel);
  });

  it("drops a recorded payload that only stored the request name", () => {
    const recording = readRecording({
      status: "recorded",
      model: "deepseek-chat",
      recordedAt: "2026-10-14T00:00:00.000Z",
      request: "把通知做成正文",
      raw: CONTENT,
    });
    assert.deepEqual(recording, { status: "not-run", reason: "recording file is unreadable" });
  });
});
