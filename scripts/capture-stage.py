#!/usr/bin/env python3
"""Capture fixture stills from this repo's stage."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
LAB = "http://127.0.0.1:5173"

SHOTS: dict[str, list[tuple[str, str, str]]] = {
    "dropdown-taxonomy": [
        *(
            (kind, state, f"{kind}-{state}.png")
            for kind in ("select", "multi", "grouped", "cascader", "split", "mega", "date")
            for state in ("closed", "open")
        )
    ],
    "intent-cascade": [
        ("status", "open", "status.png"),
        ("diagonal", "open", "diagonal.png"),
        ("project", "open", "project.png"),
        ("third", "open", "third.png"),
    ],
    "sidebar-taxonomy": [
        ("floating", "closed", "floating.png"),
        ("wheel", "closed", "wheel.png"),
        ("multilevel", "closed", "multilevel.png"),
        ("collapsible", "closed", "collapsible.png"),
        ("offcanvas", "open", "offcanvas-open.png"),
    ],
    "nav-taxonomy": [
        ("floating", "closed", "floating.png"),
        ("sidebar", "closed", "sidebar.png"),
        ("breadcrumb", "closed", "breadcrumb.png"),
        ("dropdown", "open", "dropdown-open.png"),
        ("mega", "open", "mega-open.png"),
        ("drawer", "open", "drawer-open.png"),
        ("overlay", "open", "overlay-open.png"),
        ("scrollspy", "closed", "scrollspy.png"),
        ("shrink", "closed", "shrink.png"),
        ("bottom", "closed", "bottom.png"),
    ],
    "inverted-notch": [
        ("shape", "closed", "shape-closed.png"),
        ("shape", "open", "shape-open.png"),
        ("shape", "exploded", "shape-exploded.png"),
        ("path", "closed", "path-closed.png"),
        ("scoop", "closed", "scoop-closed.png"),
    ],
    "glyph-sweep": [
        ("classic", "run", "classic-run.png"),
        ("classic", "park", "classic-park.png"),
        ("aurora", "run", "aurora-run.png"),
        ("flame", "run", "flame-run.png"),
    ],
    "look-quantize": [
        ("center", "locked", "center.png"),
        ("left", "locked", "left.png"),
        ("right", "locked", "right.png"),
        ("up", "locked", "up.png"),
        ("blink", "locked", "blink.png"),
    ],
    "tab-taxonomy": [
        ("linear", "files", "linear-files.png"),
        ("card", "invites", "card-invites.png"),
        ("chevron", "pay", "chevron-pay.png"),
        ("segmented", "today", "segmented-today.png"),
        ("folder", "req", "folder-req.png"),
        ("image", "living", "image-living.png"),
    ],
    "control-taxonomy": [
        ("text-field", "error", "text-field-error.png"),
        ("textarea", "filled", "textarea-filled.png"),
        ("select", "open", "select-open.png"),
        ("combobox", "open", "combobox-open.png"),
        ("radio", "express", "radio-express.png"),
        ("checkbox", "max", "checkbox-max.png"),
    ],
    "overlay-taxonomy": [
        ("modal", "open", "modal-open.png"),
        ("drawer", "open", "drawer-open.png"),
        ("popover", "open", "popover-open.png"),
        ("tooltip", "open", "tooltip-open.png"),
        ("sheet", "open", "sheet-open.png"),
    ],
    "notify-taxonomy": [
        ("badge", "3", "badge-count.png"),
        ("toast", "on", "toast-on.png"),
        ("snackbar", "on", "snackbar-on.png"),
        ("alert", "on", "alert-on.png"),
        ("banner", "on", "banner-on.png"),
    ],
    "validation-taxonomy": [
        ("blur", "error", "blur-error.png"),
        ("inline", "error", "inline-error.png"),
        ("submit", "error", "submit-error.png"),
    ],
    "progress-taxonomy": [
        ("fill", "mid", "fill-mid.png"),
        ("steps", "done", "steps-done.png"),
        ("circular", "mid", "circular-mid.png"),
        ("spin", "loop", "spin-loop.png"),
        ("dots", "loop", "dots-loop.png"),
        ("button", "loop", "button-loop.png"),
    ],
    "chart-taxonomy": [
        ("change", "primary", "change-line.png"),
        ("compare", "alt", "compare-bar.png"),
        ("share", "primary", "share-pie.png"),
        ("flow", "primary", "flow-funnel.png"),
    ],
    "carousel-taxonomy": [
        ("classic", "1", "classic-1.png"),
        ("fade", "1", "fade-1.png"),
        ("coverflow", "1", "coverflow-1.png"),
        ("stack", "0", "stack-0.png"),
        ("spin", "1", "spin-1.png"),
    ],
    "layout-taxonomy": [
        ("single", "default", "single.png"),
        ("masonry", "default", "masonry.png"),
        ("splitter", "default", "splitter.png"),
        ("dashboard", "default", "dashboard.png"),
    ],
    "button-taxonomy": [
        ("solid", "ok", "solid-ok.png"),
        ("solid", "wrong", "solid-wrong.png"),
        ("outline", "ok", "outline-ok.png"),
        ("text", "ok", "text-ok.png"),
    ],
    "hero-taxonomy": [
        ("product", "default", "product.png"),
        ("event", "default", "event.png"),
        ("commerce", "default", "commerce.png"),
        ("media", "default", "media.png"),
    ],
    "login-taxonomy": [
        ("centered", "default", "centered.png"),
        ("split", "default", "split.png"),
        ("roles", "default", "roles.png"),
        ("steps", "2", "steps-2.png"),
    ],
    "align-craft": [
        ("baseline", "wrong", "baseline-wrong.png"),
        ("baseline", "right", "baseline-right.png"),
        ("cover", "right", "cover-right.png"),
        ("optical", "right", "optical-right.png"),
    ],
    "dashboard-layers": [
        ("layered", "kpi", "layered-kpi.png"),
        ("layered", "dim", "layered-dim.png"),
        ("platter", "all", "platter-all.png"),
    ],
    "assistant-chrome": [
        ("chat", "default", "chat.png"),
        ("panel", "default", "panel.png"),
        ("plugin", "open", "plugin-open.png"),
        ("invisible", "default", "invisible.png"),
    ],
    "pending-taxonomy": [
        ("skeleton", "loading", "skeleton-loading.png"),
        ("skeleton", "ready", "skeleton-ready.png"),
        ("empty", "empty", "empty.png"),
        ("page", "loading", "page-loading.png"),
    ],
    "border-beam": [
        ("beam", "run", "beam-run.png"),
        ("beam", "park", "beam-park.png"),
        ("fill", "run", "fill-run.png"),
    ],
    "timer-taxonomy": [
        ("stopwatch", "running", "stopwatch-running.png"),
        ("focus", "running", "focus-running.png"),
        ("focus", "done", "focus-done.png"),
    ],
    "recall-grade": [
        ("deck", "question", "question.png"),
        ("deck", "answer", "answer.png"),
        ("deck", "empty", "empty.png"),
    ],
    "scroll-chrome": [
        ("native", "mid", "native-mid.png"),
        ("cue", "start", "cue-start.png"),
        ("track", "mid", "track-mid.png"),
        ("track", "fit", "track-fit.png"),
    ],
    "bm25-explain": [
        ("compare", "default", "compare.png"),
        ("score", "default", "score.png"),
    ],
    "container-morph": [
        ("circle-pill", "expanded", "circle-pill-expanded.png"),
        ("reverse", "dot", "reverse-dot.png"),
    ],
    "drag-commit": [
        ("reorder", "idle", "reorder-idle.png"),
        ("snapback", "lift", "snapback-lift.png"),
    ],
    "guide-interrupt": [
        ("spotlight", "mid", "spotlight-mid.png"),
        ("tour", "step1", "tour-step1.png"),
    ],
    "chart-read": [
        ("brush", "frozen", "brush-frozen.png"),
        ("drill", "l2", "drill-l2.png"),
    ],
    "expand-inflow": [
        ("accordion", "a", "accordion-a.png"),
        ("row", "open", "row-open.png"),
    ],
    "page-append": [
        ("page", "page2", "page-page2.png"),
        ("append", "exhausted", "append-exhausted.png"),
    ],
    "fill-taxonomy": [
        ("label", "naive", "label-naive.png"),
        ("required", "clear", "required-clear.png"),
        ("helper", "clear", "helper-clear.png"),
        ("group", "naive", "group-naive.png"),
        ("hint", "clear", "hint-clear.png"),
        ("repair", "clear", "repair-clear.png"),
        ("done", "clear", "done-clear.png"),
    ],
    "optimistic-rollback": [
        ("bookmark", "syncing", "bookmark-syncing.png"),
        ("bookmark", "synced", "bookmark-synced.png"),
        ("bookmark", "error", "bookmark-error.png"),
    ],
    "press-select": [
        ("selecting", "2", "selecting-2.png"),
        ("normal", "0", "normal-0.png"),
    ],
    "pull-refresh": [
        ("pull", "pulling", "pulling.png"),
        ("ready", "ready", "ready.png"),
        ("refreshing", "refreshing", "refreshing.png"),
    ],
}

def stage_url(slug: str, kind: str, state: str) -> str:
    return f"{LAB}/s/{slug}/stage?kind={kind}&state={state}"


def union_clip(page):
    boxes = []
    for sel in ("[data-stage=fixture]", "[data-stage=popover]"):
        for el in page.locator(sel).all():
            box = el.bounding_box()
            if box and box["width"] > 1 and box["height"] > 1:
                boxes.append(box)
    if not boxes:
        return None
    pad = 20
    left = min(b["x"] for b in boxes) - pad
    top = min(b["y"] for b in boxes) - pad
    right = max(b["x"] + b["width"] for b in boxes) + pad
    bottom = max(b["y"] + b["height"] for b in boxes) + pad
    vp = page.viewport_size or {"width": 1440, "height": 1000}
    left = max(0, left)
    top = max(0, top)
    right = min(vp["width"], right)
    bottom = min(vp["height"], bottom)
    return {"x": left, "y": top, "width": max(1, right - left), "height": max(1, bottom - top)}


def wipe_pngs(folder: Path) -> None:
    for path in folder.iterdir():
        if path.suffix.lower() == ".png":
            path.unlink()


def capture_slug(page, slug: str) -> None:
    dest = ROOT / "studies" / slug / "references"
    dest.mkdir(parents=True, exist_ok=True)
    wipe_pngs(dest)
    for kind, state, name in SHOTS[slug]:
        page.goto(stage_url(slug, kind, state), wait_until="networkidle")
        page.wait_for_timeout(350)
        if page.locator("[data-stage=fixture]").count() == 0:
            raise SystemExit(f"stage missing for {slug} {kind} {state}: {page.url}")
        clip = union_clip(page)
        out = dest / name
        page.screenshot(path=str(out), clip=clip, animations="disabled")
        print(f"  {out.relative_to(ROOT)}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", default="")
    args = parser.parse_args()
    slugs = [args.project] if args.project else list(SHOTS)
    unknown = [s for s in slugs if s not in SHOTS]
    if unknown:
        print(f"unknown project: {', '.join(unknown)}", file=sys.stderr)
        return 2

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=2)
        try:
            page.goto(f"{LAB}/", wait_until="domcontentloaded", timeout=8000)
        except Exception:
            print("lab is not running at 127.0.0.1:5173 — start it with `make dev`", file=sys.stderr)
            browser.close()
            return 1
        for slug in slugs:
            print(slug)
            capture_slug(page, slug)
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
