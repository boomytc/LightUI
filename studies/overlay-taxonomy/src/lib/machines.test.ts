import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  anchorsToTrigger,
  backdropDismiss,
  hasBackdrop,
  interruptKind,
  presence,
  restoreFocus,
  tooManyForPopover,
} from "./machines";

describe("interruptKind", () => {
  it("blocks on modal, weakly on drawer, not on popover", () => {
    assert.equal(interruptKind("modal"), "block");
    assert.equal(interruptKind("drawer"), "weak");
    assert.equal(interruptKind("popover"), "none");
  });
});

describe("hasBackdrop", () => {
  it("is true for modal and drawer, false for popover", () => {
    assert.equal(hasBackdrop("modal"), true);
    assert.equal(hasBackdrop("drawer"), true);
    assert.equal(hasBackdrop("popover"), false);
  });
});

describe("backdropDismiss", () => {
  it("does not dismiss a dangerous modal on the scrim", () => {
    assert.equal(backdropDismiss("modal", true), false);
  });

  it("allows a non-dangerous modal and any drawer", () => {
    assert.equal(backdropDismiss("modal", false), true);
    assert.equal(backdropDismiss("drawer", true), true);
    assert.equal(backdropDismiss("drawer", false), true);
  });

  it("is not applicable to a popover", () => {
    assert.equal(backdropDismiss("popover"), false);
    assert.equal(backdropDismiss("popover", true), false);
  });
});

describe("anchorsToTrigger", () => {
  it("is only the popover", () => {
    assert.equal(anchorsToTrigger("popover"), true);
    assert.equal(anchorsToTrigger("modal"), false);
    assert.equal(anchorsToTrigger("drawer"), false);
  });
});

describe("restoreFocus", () => {
  it("closes and asks to restore focus to the trigger", () => {
    assert.deepEqual(restoreFocus(), { open: false, restoreFocus: true });
  });
});

describe("tooManyForPopover", () => {
  it("caps at seven items", () => {
    assert.equal(tooManyForPopover(2), false);
    assert.equal(tooManyForPopover(7), false);
    assert.equal(tooManyForPopover(8), true);
  });
});

describe("presence", () => {
  it("mounts immediately when open", () => {
    assert.deepEqual(presence(true, false, 0, 150), { mounted: true, closing: false });
  });

  it("stays mounted and closing until the duration elapses", () => {
    assert.deepEqual(presence(false, true, 0, 150), { mounted: true, closing: true });
    assert.deepEqual(presence(false, true, 149, 150), { mounted: true, closing: true });
    assert.deepEqual(presence(false, true, 150, 150), { mounted: false, closing: false });
  });

  it("does not animate an already unmounted layer", () => {
    assert.deepEqual(presence(false, false, 0, 150), { mounted: false, closing: false });
  });
});
