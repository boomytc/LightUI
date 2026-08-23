import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  IME_KEYCODE,
  KIND_IDS,
  chromeVisible,
  isKindId,
  needsSelection,
  occupiesPage,
  shouldSendOnEnter,
  stageState,
  type KindId,
} from "./machines";

describe("occupiesPage", () => {
  it("is true for chat and canvas", () => {
    assert.equal(occupiesPage("chat"), true);
    assert.equal(occupiesPage("canvas"), true);
  });

  it("is false when the assistant sits on a host", () => {
    assert.equal(occupiesPage("panel"), false);
    assert.equal(occupiesPage("plugin"), false);
    assert.equal(occupiesPage("float"), false);
    assert.equal(occupiesPage("invisible"), false);
  });
});

describe("needsSelection", () => {
  it("is true for plugin and panel", () => {
    assert.equal(needsSelection("plugin"), true);
    assert.equal(needsSelection("panel"), true);
  });

  it("is false when selection is not the context", () => {
    assert.equal(needsSelection("chat"), false);
    assert.equal(needsSelection("float"), false);
    assert.equal(needsSelection("canvas"), false);
    assert.equal(needsSelection("invisible"), false);
  });
});

describe("chromeVisible", () => {
  it("is false only for invisible", () => {
    assert.equal(chromeVisible("invisible"), false);
    assert.equal(chromeVisible("chat"), true);
    assert.equal(chromeVisible("panel"), true);
    assert.equal(chromeVisible("plugin"), true);
    assert.equal(chromeVisible("float"), true);
    assert.equal(chromeVisible("canvas"), true);
  });
});

describe("shouldSendOnEnter", () => {
  it("does not send while composing", () => {
    assert.equal(shouldSendOnEnter(true), false);
  });

  it("sends when not composing", () => {
    assert.equal(shouldSendOnEnter(false), true);
  });

  it("does not send on IME keyCode 229", () => {
    assert.equal(shouldSendOnEnter(false, IME_KEYCODE), false);
    assert.equal(shouldSendOnEnter(false, 229), false);
  });
});

describe("stageState", () => {
  it("locks plugin open so the toolbar is visible", () => {
    assert.equal(stageState("open", "plugin"), "open");
  });

  it("defaults every kind to default", () => {
    assert.equal(stageState("", "chat"), "default");
    assert.equal(stageState("default", "plugin"), "default");
    assert.equal(stageState("open", "chat"), "default");
  });
});

describe("KIND_IDS", () => {
  it("is the six leaves", () => {
    const ids: readonly KindId[] = KIND_IDS;
    assert.deepEqual(ids, ["chat", "panel", "plugin", "float", "canvas", "invisible"]);
    assert.equal(isKindId("chat"), true);
    assert.equal(isKindId("modal"), false);
  });
});
