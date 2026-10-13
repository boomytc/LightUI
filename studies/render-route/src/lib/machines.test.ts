import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { noticeDocument } from "./documents";
import {
  buildRoutePrompt,
  committedNative,
  extractRouteJson,
  paintSurface,
  routeBuffer,
  routeTurn,
  validateProps,
  type Catalog,
} from "./machines";
import { PARTIAL_STEPS } from "./samples";

const catalog: Catalog = {
  protocol: "lightui.genui",
  version: "v0",
  components: [
    {
      name: "Text",
      description: "Plain text block.",
      props: {
        type: "object",
        additionalProperties: false,
        properties: { content: { type: "string", description: "Visible text." } },
        required: ["content"],
      },
    },
  ],
};

describe("routeTurn", () => {
  it("commits plain text without a component", () => {
    const result = routeTurn({ surface: "text", text: "周三站会 10:30", reason: "一句事实" }, catalog);
    assert.equal(result.status, "committed");
    assert.equal(result.surface, "text");
    assert.equal(paintSurface(result), "text");
    assert.equal(result.component, null);
    assert.equal(committedNative(result), null);
    assert.equal(result.text, "周三站会 10:30");
  });

  it("commits Text when the name and props match the catalog", () => {
    const result = routeTurn(
      {
        surface: "native",
        component: "Text",
        props: { content: "周三站会 10:30" },
        text: "周三站会 10:30",
        reason: "目录里就有 Text",
      },
      catalog,
    );
    assert.equal(result.status, "committed");
    assert.equal(paintSurface(result), "native");
    assert.deepEqual(committedNative(result), {
      name: "Text",
      props: { content: "周三站会 10:30" },
    });
  });

  it("returns unknown_component in place and does not mount the name", () => {
    const result = routeTurn(
      {
        surface: "native",
        component: "Table",
        props: { columns: ["时间"] },
        text: "周三站会 10:30",
        reason: "想画表",
      },
      catalog,
    );
    assert.equal(result.status, "error");
    assert.equal(result.errorCode, "unknown_component");
    assert.equal(result.degradation, "unknown-component");
    assert.equal(result.requestedComponent, "Table");
    assert.equal(result.component, null);
    assert.equal(result.props, null);
    assert.equal(result.surface, null);
    assert.equal(paintSurface(result), "error");
    assert.equal(committedNative(result), null);
  });

  it("returns invalid_props when a field is outside the schema", () => {
    const result = routeTurn(
      {
        surface: "native",
        component: "Text",
        props: { content: "周三站会 10:30", tone: "warn" },
        text: "周三站会 10:30",
      },
      catalog,
    );
    assert.equal(result.status, "error");
    assert.equal(result.errorCode, "invalid_props");
    assert.equal(result.degradation, "invalid-props");
    assert.equal(result.component, null);
    assert.equal(result.surface, null);
    assert.equal(paintSurface(result), "error");
    assert.equal(committedNative(result), null);
    assert.ok(result.errors.some((error) => error.path === "tone" && error.code === "unexpected"));
  });

  it("returns invalid_props when content has the wrong type", () => {
    const errors = validateProps(catalog.components[0].props, { content: 123 });
    assert.ok(errors.some((error) => error.path === "content" && error.code === "type"));
    const result = routeTurn(
      { surface: "native", component: "Text", props: { content: 123 }, text: "回退" },
      catalog,
    );
    assert.equal(result.errorCode, "invalid_props");
    assert.equal(paintSurface(result), "error");
    assert.equal(committedNative(result), null);
  });

  it("returns invalid_props when a required prop is missing", () => {
    const result = routeTurn({ surface: "native", component: "Text", props: {}, text: "回退" }, catalog);
    assert.equal(result.errorCode, "invalid_props");
    assert.equal(paintSurface(result), "error");
    assert.equal(committedNative(result), null);
    assert.ok(result.errors.some((error) => error.path === "content" && error.code === "missing"));
  });

  it("commits an iframe document and drops an empty one", () => {
    const committed = routeTurn(
      { surface: "iframe", document: "<p>估算</p>", text: "摘要", reason: "目录没有控件" },
      catalog,
    );
    assert.equal(committed.status, "committed");
    assert.equal(paintSurface(committed), "iframe");
    assert.equal(committed.document, "<p>估算</p>");

    const empty = routeTurn({ surface: "iframe", document: "  ", text: "摘要" }, catalog);
    assert.equal(empty.degradation, "invalid-document");
    assert.equal(empty.document, null);
    assert.equal(paintSurface(empty), "text");
  });
});

describe("routeBuffer", () => {
  it("holds a half packet even when the fragment already names Text", () => {
    assert.equal(PARTIAL_STEPS.length, 3);
    assert.match(PARTIAL_STEPS[0] ?? "", /native/);
    assert.doesNotMatch(PARTIAL_STEPS[0] ?? "", /Text/);
    assert.match(PARTIAL_STEPS[1] ?? "", /Text/);

    for (const buffer of PARTIAL_STEPS.slice(0, 2)) {
      const result = routeBuffer(buffer, catalog);
      assert.equal(result.status, "pending");
      assert.equal(result.degradation, "partial-stream");
      assert.equal(result.errorCode, null);
      assert.equal(paintSurface(result), "none");
      assert.equal(result.component, null);
      assert.equal(result.document, null);
      assert.equal(committedNative(result), null);
    }

    const done = routeBuffer(PARTIAL_STEPS[2] ?? "", catalog);
    assert.equal(done.status, "committed");
    assert.equal(paintSurface(done), "native");
    assert.equal(committedNative(done)?.name, "Text");
  });

  it("does not treat an empty buffer as text", () => {
    const result = routeBuffer("   ", catalog);
    assert.equal(result.status, "pending");
    assert.equal(paintSurface(result), "none");
  });
});

describe("model payload", () => {
  it("strips a json fence before routing", () => {
    const raw = '```json\n{"surface":"text","text":"你好","reason":"一句"}\n```';
    const extracted = extractRouteJson(raw);
    assert.equal(extracted.ok, true);
    if (!extracted.ok || !extracted.value || typeof extracted.value !== "object") {
      assert.fail("expected an object");
    }
    const result = routeTurn(extracted.value, catalog);
    assert.equal(result.status, "committed");
    assert.equal(result.surface, "text");
    assert.equal(result.text, "你好");
  });

  it("lists only catalog components in the router prompt", () => {
    const prompt = buildRoutePrompt(catalog, "把通知做成正文");
    assert.match(prompt.system, /Text/);
    assert.match(prompt.system, /"content"/);
    assert.doesNotMatch(prompt.system, /^- Table:/m);
    assert.match(prompt.user, /通知/);
  });
});

describe("sandbox document", () => {
  it("escapes notice text so it cannot open a script tag", () => {
    const html = noticeDocument('<script>alert("x")</script>', "zh");
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /<script>/);
  });
});
