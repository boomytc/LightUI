import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KIND_IDS,
  TOOLTIP_DELAY_MS,
  anchorsToTrigger,
  appearsFrom,
  backdropDismiss,
  hasBackdrop,
  interruptKind,
  isInteractive,
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

  it("does not interrupt a tooltip; weakly interrupts a sheet", () => {
    assert.equal(interruptKind("tooltip"), "none");
    assert.equal(interruptKind("sheet"), "weak");
  });
});

describe("hasBackdrop", () => {
  it("is true for modal and drawer, false for popover", () => {
    assert.equal(hasBackdrop("modal"), true);
    assert.equal(hasBackdrop("drawer"), true);
    assert.equal(hasBackdrop("popover"), false);
  });

  it("gives a sheet a scrim and a tooltip none", () => {
    assert.equal(hasBackdrop("sheet"), true);
    assert.equal(hasBackdrop("tooltip"), false);
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

  it("lets a sheet close on the scrim", () => {
    assert.equal(backdropDismiss("sheet"), true);
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

  it("anchors a tooltip and does not anchor a sheet", () => {
    assert.equal(anchorsToTrigger("tooltip"), true);
    assert.equal(anchorsToTrigger("sheet"), false);
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

describe("isInteractive", () => {
  it("is false only for tooltip", () => {
    for (const id of KIND_IDS) {
      assert.equal(isInteractive(id), id !== "tooltip");
    }
  });
});

describe("appearsFrom", () => {
  it("puts a sheet at the bottom and a tooltip on the trigger", () => {
    assert.equal(appearsFrom("sheet"), "bottom");
    assert.equal(appearsFrom("tooltip"), "anchor");
    assert.equal(appearsFrom("drawer"), "side");
    assert.equal(appearsFrom("modal"), "center");
  });
});

describe("TOOLTIP_DELAY_MS", () => {
  it("delays hover so a pass-over does not flash", () => {
    assert.equal(TOOLTIP_DELAY_MS, 280);
    assert.ok(TOOLTIP_DELAY_MS >= 200);
    assert.ok(TOOLTIP_DELAY_MS <= 400);
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
