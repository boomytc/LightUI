import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { frameDocument } from "./frame";
import {
  COMPLETE_KEY,
  FIELD_ORDER,
  IFRAME_SANDBOX,
  KIND_IDS,
  MAX_HEIGHT,
  MAX_PROMPT,
  MIN_HEIGHT,
  PROBES,
  decideSandboxMessage,
  fieldStatus,
  interpretHeight,
  isKindId,
  lockedStep,
  orderViolations,
  paintOf,
  parseStream,
  playbackSteps,
  validateCall,
  visiblePhase,
} from "./machines";
import { TEACHING_SOURCE } from "./samples";

const steps = playbackSteps(TEACHING_SOURCE);

describe("field order", () => {
  it("names the six sandbox fields in arrival order", () => {
    assert.deepEqual(FIELD_ORDER, [
      "initialHeight",
      "placeholderMessages",
      "css",
      "html",
      "jsFunctions",
      "jsExpressions",
    ]);
  });

  it("completes the teaching stream in that order", () => {
    const first = new Map<string, number>();
    for (const step of steps) {
      assert.equal(step.state.error, undefined);
      for (const field of FIELD_ORDER) {
        if (step.state[COMPLETE_KEY[field]] && !first.has(field)) first.set(field, step.at);
      }
    }
    const ats = FIELD_ORDER.map((field) => first.get(field));
    assert.equal(ats.some((at) => at === undefined), false);
    for (let i = 1; i < ats.length; i += 1) {
      assert.ok((ats[i] as number) > (ats[i - 1] as number), FIELD_ORDER[i]);
    }
    const last = steps[steps.length - 1]!.state;
    assert.deepEqual(last.keyOrder, [...FIELD_ORDER]);
    assert.deepEqual(orderViolations(last.keyOrder), []);
    assert.equal(last.generating, false);
    assert.equal(last.html.length > 1, true);
    assert.equal(last.jsExpressions.length > 1, true);
    assert.equal(typeof last.css, "string");
    assert.equal(typeof last.jsFunctions, "string");
  });
});

describe("phases", () => {
  it("holds HTML until css completes, including when html arrives first", () => {
    const early = '{"initialHeight":100,"html":["<p>early</p>"],"css":"p{color:red';
    const state = parseStream(early, true);
    assert.equal(state.htmlComplete, true);
    assert.equal(state.cssComplete, false);
    assert.equal(visiblePhase(state), "placeholder");
    assert.equal(paintOf(state).html, null);
    assert.equal(paintOf(state).functions, null);
    assert.deepEqual(orderViolations(state.keyOrder), ["css"]);
  });

  it("previews joined html without running scripts", () => {
    const preview = lockedStep(TEACHING_SOURCE, "stream", "preview");
    const paint = paintOf(preview.state);
    assert.equal(paint.phase, "preview");
    assert.equal(preview.state.cssComplete, true);
    assert.equal(preview.state.htmlComplete, false);
    assert.ok(paint.html?.includes("<"));
    assert.equal(paint.functions, null);
    assert.deepEqual(paint.expressions, []);
  });

  it("locks placeholder, live, and bridge fixtures", () => {
    const placeholder = paintOf(lockedStep(TEACHING_SOURCE, "stream", "placeholder").state);
    assert.equal(placeholder.phase, "placeholder");
    assert.equal(placeholder.html, null);
    assert.ok(placeholder.messages.length >= 2);
    assert.equal(placeholder.height, 260);

    const live = lockedStep(TEACHING_SOURCE, "stream", "final").state;
    const livePaint = paintOf(live);
    assert.equal(livePaint.phase, "live");
    assert.equal(live.generating, false);
    assert.equal(livePaint.functions?.includes("function askHost"), true);
    assert.equal(livePaint.expressions.length, live.jsExpressions.length);
    assert.equal(livePaint.expressions.some((line) => line.includes("grow")), true);

    const bridge = lockedStep(TEACHING_SOURCE, "bridge", "rejected");
    assert.equal(bridge.at, steps[steps.length - 1]!.at);
  });

  it("does not run a trailing partial expression", () => {
    const closedHtml = parseStream(
      '{"initialHeight":10,"placeholderMessages":[],"css":"p{}","html":["<p></p>"],"jsFunctions":"function f(){}","jsExpressions":["f()","gro',
      true,
    );
    assert.equal(closedHtml.htmlComplete, true);
    assert.equal(closedHtml.jsFunctionsComplete, true);
    assert.equal(closedHtml.jsExpressionsComplete, false);
    assert.equal(closedHtml.jsExpressionsClosed, 1);
    assert.deepEqual(paintOf(closedHtml).expressions, ["f()"]);
  });
});

describe("height", () => {
  it("clamps finite numbers and refuses the rest", () => {
    assert.deepEqual(interpretHeight(180), { ok: true, height: 180, raw: 180, clamped: false });
    assert.deepEqual(interpretHeight(10.2), {
      ok: true,
      height: MIN_HEIGHT,
      raw: 10.2,
      clamped: true,
    });
    assert.deepEqual(interpretHeight(9000), {
      ok: true,
      height: MAX_HEIGHT,
      raw: 9000,
      clamped: true,
    });
    assert.equal(interpretHeight(Number.NaN).ok, false);
    assert.equal(interpretHeight(Number.POSITIVE_INFINITY).ok, false);
    assert.equal(interpretHeight("200").ok, false);
    assert.equal(interpretHeight(null).ok, false);
  });
});

describe("callbacks", () => {
  it("accepts the two whitelisted calls and refuses the probes that should fail", () => {
    const prompt = validateCall("sendPrompt", { text: "  你好  " });
    assert.deepEqual(prompt, { ok: true, name: "sendPrompt", text: "你好" });
    const link = validateCall("openLink", { url: "https://example.com/sandbox-bridge" });
    assert.equal(link.ok, true);
    if (link.ok) assert.equal(link.name, "openLink");

    assert.equal(validateCall("sendPrompt", { text: "a".repeat(MAX_PROMPT) }).ok, true);
    assert.equal(validateCall("sendPrompt", { text: "a".repeat(MAX_PROMPT + 1) }).ok, false);
    assert.equal(validateCall("sendPrompt", { text: "   " }).ok, false);
    assert.equal(validateCall("sendPrompt", { text: "hi", extra: 1 }).ok, false);
    assert.equal(validateCall("openLink", { url: "http://example.com" }).ok, false);
    assert.equal(validateCall("openLink", { url: "javascript:alert(1)" }).ok, false);
    assert.equal(validateCall("fetch", { url: "https://example.com" }).ok, false);
    assert.equal(validateCall("sendPrompt", ["hi"]).ok, false);

    for (const probe of PROBES) {
      if (probe.kind !== "call") continue;
      const decision = validateCall(probe.name, probe.args);
      assert.equal(decision.ok, probe.expect === "accept", probe.id);
    }
  });

  it("drops foreign messages and messages from the wrong channel", () => {
    const forged = decideSandboxMessage({
      sourceIsFrame: false,
      data: {
        channel: "lightui.sandbox",
        kind: "call",
        id: "forged",
        name: "sendPrompt",
        args: { text: "伪造的回传" },
      },
    });
    assert.deepEqual(forged, { type: "foreign", reason: "来源不是这块沙盒" });

    const noise = decideSandboxMessage({
      sourceIsFrame: false,
      data: { channel: "other", kind: "call" },
    });
    assert.deepEqual(noise, { type: "ignore" });

    const accepted = decideSandboxMessage({
      sourceIsFrame: true,
      data: {
        channel: "lightui.sandbox",
        kind: "call",
        id: "ok",
        name: "sendPrompt",
        args: { text: "在吗" },
      },
    });
    assert.equal(accepted.type, "call");
    if (accepted.type === "call") {
      assert.equal(accepted.decision.ok, true);
      assert.equal(accepted.id, "ok");
    }

    const huge = decideSandboxMessage({
      sourceIsFrame: true,
      data: { channel: "lightui.sandbox", kind: "resize", height: 9000 },
    });
    assert.equal(huge.type, "resize");
    if (huge.type === "resize") {
      assert.equal(huge.height, MAX_HEIGHT);
      assert.equal(huge.clamped, true);
    }
  });
});

describe("frame isolation", () => {
  it("keeps the sandbox attribute free of same-origin and checks the parent", () => {
    assert.equal(IFRAME_SANDBOX, "allow-scripts");
    assert.equal(IFRAME_SANDBOX.includes("allow-same-origin"), false);
    const doc = frameDocument();
    assert.equal(doc.includes("allow-same-origin"), false);
    assert.equal(doc.includes("event.source !== parent"), true);
    assert.equal(doc.includes("sandboxHost"), true);
    assert.equal(doc.includes("sendPrompt"), true);
    assert.equal(doc.includes("openLink"), true);
    assert.equal(doc.includes("<script src"), false);
    assert.equal(doc.includes("localStorage"), false);
  });
});

describe("stage query kinds", () => {
  it("only aliases stream and bridge", () => {
    assert.deepEqual(KIND_IDS, ["stream", "bridge"]);
    assert.equal(isKindId("stream"), true);
    assert.equal(isKindId("bridge"), true);
    assert.equal(isKindId("closed"), false);
  });

  it("shows css as streaming on the placeholder fixture", () => {
    const state = lockedStep(TEACHING_SOURCE, "stream", "placeholder").state;
    assert.equal(fieldStatus(state, "placeholderMessages"), "complete");
    assert.equal(fieldStatus(state, "css"), "streaming");
    assert.equal(fieldStatus(state, "html"), "waiting");
  });
});
