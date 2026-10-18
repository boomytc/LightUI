import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import {
  PROTOCOL_VERSION,
  RENDER_ROUTE_ERRORS,
  ROUTE_ENVELOPE_IS_COMPONENT,
  ROUTE_ERROR_CODES,
  ROUTE_ERROR_INVALID_PROPS,
  ROUTE_ERROR_UNKNOWN_COMPONENT,
  ROUTE_HOST_DISPLAY,
  ROUTE_PARTIAL_JSON_ACTION,
  ROUTE_PARTIAL_JSON_IS_ERROR,
  SANDBOX_CALLBACKS,
  SANDBOX_COMPLETE_KEY,
  SANDBOX_FIELD_ORDER,
  SANDBOX_FIELDS,
  SANDBOX_GENERATING_KEY,
  SANDBOX_HEIGHT,
  SANDBOX_LINK_PROTOCOL,
  SANDBOX_PROMPT_MAX_LENGTH,
  SANDBOX_PROMPT_MIN_LENGTH,
  SANDBOX_TRUST,
  classifyNativeRoute,
  interpretSandboxHeight,
  readClosedJsonObject,
  registry,
  sandboxEventTrusted,
  validateComponentProps,
  validateSandboxCallback,
  validateSandboxPayload,
} from "./index";

const textEntry = registry.find((entry) => entry.name === "Text");
assert.ok(textEntry, "registry exposes the Text component");
const textProps = textEntry.props;
const catalog = [{ name: "Text", props: textProps }];

function loadContract(name: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(
    fs.readFileSync(new URL(`../contract/${PROTOCOL_VERSION}/${name}`, import.meta.url), "utf8"),
  );
  assert.ok(parsed && typeof parsed === "object" && !Array.isArray(parsed));
  return parsed as Record<string, unknown>;
}

function payload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    initialHeight: 260,
    placeholderMessages: ["先占位"],
    css: "p{}",
    html: ["<p></p>"],
    jsFunctions: "function f(){}",
    jsExpressions: ["f()"],
    ...overrides,
  };
}

describe("render-route contract", () => {
  const document = loadContract("render-route.json");

  it("matches the exported route rules", () => {
    assert.equal(document.protocol, "lightui.genui");
    assert.equal(document.version, PROTOCOL_VERSION);
    assert.equal(document.envelopeIsComponent, ROUTE_ENVELOPE_IS_COMPONENT);
    assert.equal(ROUTE_ENVELOPE_IS_COMPONENT, false);
    assert.deepEqual(document.partialJson, {
      isError: ROUTE_PARTIAL_JSON_IS_ERROR,
      action: ROUTE_PARTIAL_JSON_ACTION,
    });
    assert.equal(ROUTE_PARTIAL_JSON_IS_ERROR, false);
    assert.deepEqual(document.errors, RENDER_ROUTE_ERRORS);
    assert.deepEqual(
      RENDER_ROUTE_ERRORS.map((item) => item.code),
      ROUTE_ERROR_CODES,
    );
    assert.deepEqual(Object.keys(document).sort(), [
      "envelopeIsComponent",
      "errors",
      "partialJson",
      "protocol",
      "version",
    ]);
  });

  it("returns unknown_component in place and does not fall back", () => {
    const decision = classifyNativeRoute(catalog, "Table", { columns: ["时间"] });
    assert.equal(decision.status, "error");
    if (decision.status !== "error") return;
    assert.equal(decision.errorCode, ROUTE_ERROR_UNKNOWN_COMPONENT);
    assert.equal(decision.errorCode, "unknown_component");
    assert.equal(decision.display, ROUTE_HOST_DISPLAY);
    assert.equal(decision.display, "in-place");
    assert.equal(decision.surface, null);
    assert.equal(decision.fallbackRoute, false);
    assert.equal(decision.degradeToText, false);
    assert.equal(decision.requestedComponent, "Table");
    assert.deepEqual(decision.errors, []);
  });

  it("returns invalid_props in place when props fail the schema", () => {
    const extra = classifyNativeRoute(catalog, "Text", { content: "周三站会", tone: "warn" });
    assert.equal(extra.status, "error");
    if (extra.status !== "error") return;
    assert.equal(extra.errorCode, ROUTE_ERROR_INVALID_PROPS);
    assert.equal(extra.errorCode, "invalid_props");
    assert.equal(extra.display, "in-place");
    assert.equal(extra.surface, null);
    assert.equal(extra.fallbackRoute, false);
    assert.equal(extra.degradeToText, false);
    assert.ok(extra.errors.some((error) => error.path === "tone" && error.code === "unexpected"));

    const wrongType = validateComponentProps(textProps, { content: 123 });
    assert.ok(wrongType.some((error) => error.path === "content" && error.code === "type"));
    const typed = classifyNativeRoute(catalog, "Text", { content: 123 });
    assert.equal(typed.status, "error");
    if (typed.status === "error") assert.equal(typed.degradeToText, false);

    const missing = classifyNativeRoute(catalog, "Text", {});
    assert.equal(missing.status, "error");
    if (missing.status === "error") {
      assert.equal(missing.errorCode, "invalid_props");
      assert.ok(missing.errors.some((error) => error.path === "content" && error.code === "missing"));
      assert.equal(missing.fallbackRoute, false);
    }
  });

  it("commits a known component whose props match", () => {
    const decision = classifyNativeRoute(catalog, "Text", { content: "周三站会" });
    assert.deepEqual(decision, {
      status: "commit",
      name: "Text",
      props: { content: "周三站会" },
    });
  });

  it("waits out a partial JSON packet and validates only after it closes", () => {
    const full = JSON.stringify({
      surface: "native",
      component: "Table",
      props: { columns: ["时间"] },
      text: "回退",
    });
    for (let i = 0; i < full.length - 1; i += 1) {
      const packet = readClosedJsonObject(full.slice(0, i));
      assert.equal(packet.status, "pending", `prefix ${i} was not held`);
      assert.equal("errorCode" in packet, false);
    }
    assert.equal(readClosedJsonObject("   ").status, "pending");
    assert.equal(readClosedJsonObject("null").status, "pending");
    const named = readClosedJsonObject('{"surface":"native","component":"Tex');
    assert.equal(named.status, "pending");
    assert.equal("errorCode" in named, false);

    const closed = readClosedJsonObject(full);
    assert.equal(closed.status, "closed");
    if (closed.status !== "closed") return;
    const decision = classifyNativeRoute(catalog, closed.value.component, closed.value.props);
    assert.equal(decision.status, "error");
    if (decision.status === "error") {
      assert.equal(decision.errorCode, "unknown_component");
      assert.equal(decision.degradeToText, false);
      assert.equal(decision.surface, null);
    }
  });

  it("commits the first balanced object and ignores text after it", () => {
    const full = JSON.stringify({ surface: "native", component: "Text", props: { content: "好" } });

    const trailing = readClosedJsonObject(`${full}\n\n希望有帮助`);
    assert.equal(trailing.status, "closed");
    if (trailing.status === "closed") assert.equal(trailing.value.component, "Text");

    const adjacent = readClosedJsonObject(`${full}${full}`);
    assert.equal(adjacent.status, "closed");
    if (adjacent.status === "closed") assert.equal(adjacent.value.component, "Text");

    const braceInString = readClosedJsonObject('{"text":"}{"}');
    assert.equal(braceInString.status, "closed");
    if (braceInString.status === "closed") assert.equal(braceInString.value.text, "}{");

    assert.equal(readClosedJsonObject('{"text":"}{').status, "pending");
    assert.equal(readClosedJsonObject("[1,2]").status, "pending");
  });

  it("does not register the route envelope as a component", () => {
    assert.equal(ROUTE_ENVELOPE_IS_COMPONENT, false);
    const names: string[] = registry.map((entry) => entry.name);
    for (const name of ["Envelope", "Route", "RenderRoute", "Sandbox", "surface", "component"]) {
      assert.equal(names.includes(name), false, name);
    }
    const components = loadContract("components.json");
    const listed = components.components as { name: string }[];
    assert.deepEqual(
      listed.map((item) => item.name),
      names,
    );
    const envelope = classifyNativeRoute(catalog, "Envelope", {
      surface: "native",
      component: "Text",
      props: { content: "你好" },
    });
    assert.equal(envelope.status, "error");
    if (envelope.status === "error") assert.equal(envelope.errorCode, "unknown_component");
  });
});

describe("sandbox contract", () => {
  const document = loadContract("sandbox.json");

  it("matches the exported activity", () => {
    assert.equal(document.protocol, "lightui.genui");
    assert.equal(document.version, PROTOCOL_VERSION);
    assert.deepEqual(document.fieldOrder, [...SANDBOX_FIELD_ORDER]);
    assert.deepEqual(document.fields, SANDBOX_FIELDS);
    assert.equal(document.generating, SANDBOX_GENERATING_KEY);
    assert.deepEqual(document.callbacks, SANDBOX_CALLBACKS);
    assert.deepEqual(document.height, SANDBOX_HEIGHT);
    assert.deepEqual(document.trust, SANDBOX_TRUST);
    assert.deepEqual(Object.keys(document).sort(), [
      "callbacks",
      "fieldOrder",
      "fields",
      "generating",
      "height",
      "protocol",
      "trust",
      "version",
    ]);
    for (const field of SANDBOX_FIELD_ORDER) {
      assert.equal(SANDBOX_COMPLETE_KEY[field], `${field}Complete`);
      assert.equal(SANDBOX_FIELDS[field].complete, `${field}Complete`);
    }
    assert.equal(SANDBOX_FIELDS.html.type, "array");
    assert.deepEqual(SANDBOX_FIELDS.html.items, { type: "string" });
    assert.equal(SANDBOX_FIELDS.jsExpressions.type, "array");
    assert.deepEqual(SANDBOX_FIELDS.jsExpressions.items, { type: "string" });
    assert.equal(SANDBOX_FIELDS.placeholderMessages.type, "array");
    assert.equal(SANDBOX_FIELDS.css.type, "string");
    assert.equal(SANDBOX_FIELDS.jsFunctions.type, "string");
    assert.equal(SANDBOX_GENERATING_KEY in SANDBOX_FIELDS, false);
    for (const callback of SANDBOX_CALLBACKS) {
      assert.equal(callback.additionalProperties, false);
      assert.equal(callback.props.additionalProperties, false);
      assert.equal(callback.unknownFields, "reject");
    }
  });

  it("accepts one ordered payload and rejects a broken one", () => {
    const ok = validateSandboxPayload(payload());
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.deepEqual(ok.payload.html, ["<p></p>"]);
      assert.deepEqual(ok.payload.jsExpressions, ["f()"]);
    }

    const orderedWrong = {
      initialHeight: 10,
      css: "p{}",
      placeholderMessages: ["a"],
      html: ["<p></p>"],
      jsFunctions: "function f(){}",
      jsExpressions: ["f()"],
    };
    const disorder = validateSandboxPayload(orderedWrong);
    assert.equal(disorder.ok, false);
    if (!disorder.ok) assert.ok(disorder.issues.some((issue) => issue.code === "order"));

    const htmlString = validateSandboxPayload(payload({ html: "<p></p>" }));
    assert.equal(htmlString.ok, false);
    if (!htmlString.ok) {
      assert.ok(htmlString.issues.some((issue) => issue.field === "html" && issue.code === "type"));
    }
    const expressions = validateSandboxPayload(payload({ jsExpressions: "f()" }));
    assert.equal(expressions.ok, false);
    if (!expressions.ok) {
      assert.ok(expressions.issues.some((issue) => issue.field === "jsExpressions" && issue.code === "type"));
    }

    const extra = validateSandboxPayload(payload({ generating: true }));
    assert.equal(extra.ok, false);
    if (!extra.ok) {
      assert.ok(extra.issues.some((issue) => issue.field === "generating" && issue.code === "unexpected"));
    }
    const missing = validateSandboxPayload({ initialHeight: 200, css: "p{}" });
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.ok(missing.issues.some((issue) => issue.field === "html" && issue.code === "missing"));
  });

  it("whitelists sendPrompt and openLink and rejects unknown fields", () => {
    assert.deepEqual(validateSandboxCallback("sendPrompt", { text: "  你好  " }), {
      ok: true,
      name: "sendPrompt",
      text: "你好",
    });
    assert.equal(validateSandboxCallback("sendPrompt", { text: "a".repeat(SANDBOX_PROMPT_MIN_LENGTH) }).ok, true);
    assert.equal(validateSandboxCallback("sendPrompt", { text: "a".repeat(SANDBOX_PROMPT_MAX_LENGTH) }).ok, true);
    assert.equal(validateSandboxCallback("sendPrompt", { text: "a".repeat(SANDBOX_PROMPT_MAX_LENGTH + 1) }).ok, false);
    assert.equal(validateSandboxCallback("sendPrompt", { text: "   " }).ok, false);
    assert.equal(validateSandboxCallback("sendPrompt", { text: "hi", extra: true }).ok, false);
    assert.equal(validateSandboxCallback("sendPrompt", ["hi"]).ok, false);

    const link = validateSandboxCallback("openLink", { url: "  https://example.com/sandbox-bridge  " });
    assert.equal(link.ok, true);
    if (link.ok) {
      assert.equal(link.name, "openLink");
      assert.equal(new URL(link.url).protocol, SANDBOX_LINK_PROTOCOL);
    }
    assert.equal(validateSandboxCallback("openLink", { url: "http://example.com" }).ok, false);
    assert.equal(validateSandboxCallback("openLink", { url: "javascript:alert(1)" }).ok, false);
    assert.equal(validateSandboxCallback("openLink", { url: "https://example.com", extra: 1 }).ok, false);
    const unknown = validateSandboxCallback("fetch", { url: "https://example.com" });
    assert.equal(unknown.ok, false);
    if (!unknown.ok) assert.equal(unknown.reason.length > 0, true);
  });

  it("discards non-finite heights and clamps the rest to 50–4000", () => {
    assert.equal(SANDBOX_HEIGHT.min, 50);
    assert.equal(SANDBOX_HEIGHT.max, 4000);
    assert.equal(SANDBOX_HEIGHT.nonFinite, "discard");
    assert.equal(SANDBOX_HEIGHT.finite, "clamp");
    assert.deepEqual(interpretSandboxHeight(180), { ok: true, height: 180, raw: 180, clamped: false });
    assert.deepEqual(interpretSandboxHeight(50), { ok: true, height: 50, raw: 50, clamped: false });
    assert.deepEqual(interpretSandboxHeight(4000), { ok: true, height: 4000, raw: 4000, clamped: false });
    assert.deepEqual(interpretSandboxHeight(10.2), { ok: true, height: 50, raw: 10.2, clamped: true });
    assert.deepEqual(interpretSandboxHeight(9000), { ok: true, height: 4000, raw: 9000, clamped: true });
    assert.deepEqual(interpretSandboxHeight(-20), { ok: true, height: 50, raw: -20, clamped: true });
    assert.equal(interpretSandboxHeight(Number.NaN).ok, false);
    assert.equal(interpretSandboxHeight(Number.POSITIVE_INFINITY).ok, false);
    assert.equal(interpretSandboxHeight(Number.NEGATIVE_INFINITY).ok, false);
    assert.equal(interpretSandboxHeight("200").ok, false);
    assert.equal(interpretSandboxHeight(null).ok, false);
  });

  it("trusts the iframe contentWindow and can require a nonce on top", () => {
    assert.equal(SANDBOX_TRUST.by, "event.source");
    assert.equal(SANDBOX_TRUST.equals, "iframe.contentWindow");
    assert.equal(SANDBOX_TRUST.nonce, "optional");
    const frame = { window: true };
    const other = { window: true };
    assert.equal(sandboxEventTrusted(frame, frame), true);
    assert.equal(sandboxEventTrusted(other, frame), false);
    assert.equal(sandboxEventTrusted(null, frame), false);
    assert.equal(sandboxEventTrusted(frame, null), false);
    assert.equal(sandboxEventTrusted(frame, frame, { expected: "n-1", received: "n-1" }), true);
    assert.equal(sandboxEventTrusted(frame, frame, { expected: "n-1", received: "other" }), false);
    assert.equal(sandboxEventTrusted(frame, frame, { expected: "", received: "" }), false);
    assert.equal(sandboxEventTrusted(other, frame, { expected: "n-1", received: "n-1" }), false);
  });
});
