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
