import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nativeMounts } from "../components/native-mount";
import { catalogFromRegistry } from "./catalog";
import { hostExplanation } from "./explain";
import {
  MOUNTED_COMPONENTS,
  buildRoutePrompt,
  componentNames,
  paintSurface,
  routeBuffer,
  routeTurn,
} from "./machines";
import { deepseekRecording } from "./recorded";
import { COMPARE_SAMPLES, DEGRADE_CASES, PARTIAL_STEPS, draftsFor } from "./samples";

describe("live genui catalog", () => {
  const catalog = catalogFromRegistry();

  it("follows protocol v0 and mounts every listed component", () => {
    assert.equal(catalog.protocol, "lightui.genui");
    assert.equal(catalog.version, "v0");
    assert.deepEqual(componentNames(catalog), ["Text"]);
    assert.deepEqual([...MOUNTED_COMPONENTS], componentNames(catalog));
    assert.deepEqual(Object.keys(nativeMounts), componentNames(catalog));
    const text = catalog.components[0];
    assert.equal(text?.props.additionalProperties, false);
    assert.deepEqual(text?.props.required, ["content"]);
    assert.equal(text?.props.properties.content?.type, "string");
  });

  it("commits the three authored surfaces for one request", () => {
    for (const sample of COMPARE_SAMPLES) {
      const drafts = draftsFor(sample, "zh");
      const columns = {
        text: routeTurn(drafts.text, catalog),
        native: routeTurn(drafts.native, catalog),
        iframe: routeTurn(drafts.iframe, catalog),
      };
      assert.equal(columns.text.status, "committed");
      assert.equal(paintSurface(columns.text), "text");
      assert.equal(columns.native.status, "committed");
      assert.equal(paintSurface(columns.native), "native");
      assert.equal(columns.native.component, "Text");
      assert.equal(columns.iframe.status, "committed");
      assert.equal(paintSurface(columns.iframe), "iframe");
      const decision = routeTurn(drafts[sample.chosen], catalog);
      assert.equal(decision.surface, sample.chosen);
    }
  });

  it("reports an unknown name and invalid props in place, and holds the partial stream", () => {
    const unknown = DEGRADE_CASES.find((item) => item.id === "unknown");
    const props = DEGRADE_CASES.find((item) => item.id === "props");
    assert.ok(unknown && props);
    const unknownRoute = routeBuffer(unknown.buffer, catalog);
    assert.equal(unknownRoute.status, "error");
    assert.equal(unknownRoute.errorCode, "unknown_component");
    assert.equal(unknownRoute.degradation, "unknown-component");
    assert.equal(unknownRoute.requestedComponent, "Table");
    assert.equal(unknownRoute.surface, null);
    assert.equal(paintSurface(unknownRoute), "error");
    assert.equal(componentNames(catalog).includes("Table"), false);
    const explained = hostExplanation(unknownRoute, componentNames(catalog), "zh");
    assert.match(explained, /unknown_component/);
    assert.match(explained, /Table/);
    assert.match(explained, /Text/);

    const propsRoute = routeBuffer(props.buffer, catalog);
    assert.equal(propsRoute.status, "error");
    assert.equal(propsRoute.errorCode, "invalid_props");
    assert.equal(propsRoute.degradation, "invalid-props");
    assert.equal(paintSurface(propsRoute), "error");
    assert.equal(propsRoute.component, null);
    const propsExplained = hostExplanation(propsRoute, componentNames(catalog), "zh");
    assert.match(propsExplained, /invalid_props/);
    assert.match(propsExplained, /tone/);

    const partial = routeBuffer(PARTIAL_STEPS[1] ?? "", catalog);
    assert.equal(partial.status, "pending");
    assert.equal(partial.errorCode, null);
    assert.equal(paintSurface(partial), "none");
    assert.equal(paintSurface(routeBuffer(PARTIAL_STEPS[2] ?? "", catalog)), "native");
  });

  it("keeps the acceptance prompt inside the live catalog", () => {
    const prompt = buildRoutePrompt(catalog, "hello");
    for (const name of componentNames(catalog)) {
      assert.match(prompt.system, new RegExp(`- ${name}:`));
    }
    assert.doesNotMatch(prompt.system, /^- Table:/m);
  });

  it("stores either no model recording or a finished DeepSeek payload", () => {
    if (deepseekRecording.status === "not-run") {
      assert.equal("raw" in deepseekRecording, false);
      assert.match(deepseekRecording.reason, /DEEPSEEK_API_KEY/);
      return;
    }
    assert.equal(deepseekRecording.requestedModel.length > 0, true);
    assert.equal(deepseekRecording.model.length > 0, true);
    assert.equal(deepseekRecording.request.length > 0, true);
    const routed = routeBuffer(deepseekRecording.raw, catalog);
    assert.notEqual(routed.status, "pending");
    assert.ok(routed.surface === "text" || routed.surface === "native" || routed.surface === "iframe");
  });
});
