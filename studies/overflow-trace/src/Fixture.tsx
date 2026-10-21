import { useLayoutEffect, useRef, useState } from "react";
import { escapes, type Cause, type Mode } from "./lib/machines";
import { useLocale } from "./lib/site-locale";
import "./fixture.css";

const LABELS: Record<Cause, [string, string]> = {
  width: ["父级宽度", "Parent width"],
  negative: ["负外边距", "Negative margin"],
  text: ["长文本", "Long text"],
  fixed: ["固定宽度", "Fixed width"],
  absolute: ["绝对定位", "Absolute position"],
};
export function Fixture({
  mode,
  width = 375,
  cause = "all",
}: {
  mode: Mode;
  width?: number;
  cause?: Cause | "all";
}) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [hits, setHits] = useState<Cause[]>([]);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      const box = node.getBoundingClientRect();
      const next: Cause[] = [];
      node.querySelectorAll<HTMLElement>("[data-cause]").forEach((el) => {
        const hit = escapes(box, el.getBoundingClientRect());
        el.dataset.escaped = String(hit);
        if (hit) next.push(el.dataset.cause as Cause);
      });
      setHits((prev) => (prev.join() === next.join() ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    node
      .querySelectorAll<HTMLElement>("[data-cause]")
      .forEach((el) => observer.observe(el));
    node.addEventListener("scroll", measure);
    document.fonts.ready.then(() => {
      if (node.isConnected) measure();
    });
    return () => {
      active = false;
      observer.disconnect();
      node.removeEventListener("scroll", measure);
    };
  }, [mode, width, cause, locale]);
  const show = (id: Cause) => cause === "all" || cause === id;
  return (
    <div className="overflow-demo" style={{ width, maxWidth: "100%" }}>
      <div className="overflow-demo-isolate">
        <div
          ref={ref}
          data-overflow-frame
          data-mode={mode}
          className="overflow-demo-frame"
        >
          <div className="overflow-demo-content">
            <p>
              {locale === "en"
                ? "A container has boundaries"
                : "容器有自己的边界"}
            </p>
            {show("width") && (
              <div data-cause="width" className="overflow-cause-width">
                {locale === "en"
                  ? "Width plus parent padding"
                  : "宽度加上父级内边距"}
              </div>
            )}
            {show("negative") && (
              <div data-cause="negative" className="overflow-cause-negative">
                {locale === "en"
                  ? "Pulled beyond both edges"
                  : "负外边距拉出边界"}
              </div>
            )}
            {show("text") && (
              <p data-cause="text" className="overflow-cause-text">
                release_2026_very_long_document_name_without_any_break_opportunities.txt
              </p>
            )}
            {show("fixed") && (
              <div data-cause="fixed" className="overflow-cause-fixed">
                {locale === "en" ? "Tags must wrap" : "标签需要换行"}
                <span>2026</span>
                <span>design</span>
                <span>review</span>
                <span>release</span>
                <span>archive</span>
              </div>
            )}
            {show("absolute") && (
              <div className="overflow-position-host">
                <span data-cause="absolute" className="overflow-cause-absolute">
                  {locale === "en" ? "Action outside" : "边界外的操作"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <p
        aria-live="polite"
        data-overflow-report
        className="mt-3 text-sm leading-relaxed"
        style={{
          color: hits.length ? "var(--color-wrong)" : "var(--color-intent)",
        }}
      >
        {hits.length
          ? `${locale === "en" ? "Escaped" : "越界"} ${hits.length}: ${hits.map((id) => LABELS[id][locale === "en" ? 1 : 0]).join(" · ")}`
          : locale === "en"
            ? "All elements fit the container"
            : "所有元素均在容器内"}
      </p>
      {mode === "hide" && (
        <p className="mt-2 text-xs text-fg-muted">
          {locale === "en"
            ? "Clipping hides content; the measured boxes still escape."
            : "裁掉的是可见内容，越界的几何尺寸仍在。"}
        </p>
      )}
    </div>
  );
}
