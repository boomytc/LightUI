import {
  Component,
  type ComponentType,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowUpRight, HelpCircle } from "lucide-react";
import { DateStamp } from "./DateStamp";
import { Link } from "./Link";
import type { LoadedStudy } from "../lib/catalog";
import { categoryLabel, getStudyCategory } from "../lib/categories";
import { messages } from "../lib/i18n";
import { studyAsks, studyEyebrow, studySummary, studyTitle } from "../lib/localize";
import { navigate } from "../lib/nav";
import type { Locale } from "../lib/prefs";

class PreviewErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // 捕获个别 Study 运行时异常，防止整个列表白屏
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const MAX_PREVIEW_SCALE = 0.46;
const MIN_PREVIEW_SCALE = 0.08;
const PREVIEW_PADDING_PX = 8;

function StagePlaceholder({ loading = false }: { loading?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-2/30">
      {loading ? (
        <div className="size-7 animate-spin rounded-full border-2 border-border/80 border-t-accent/60 opacity-40" />
      ) : (
        <div className="size-7 rounded-full border border-border/60 opacity-25" />
      )}
    </div>
  );
}

function ScaledStagePreview({ StageView }: { StageView: ComponentType }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(MAX_PREVIEW_SCALE);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const update = () => {
      const frameW = frame.clientWidth;
      const frameH = frame.clientHeight;
      if (frameW <= 0 || frameH <= 0) return;

      const availW = Math.max(1, frameW - PREVIEW_PADDING_PX * 2);
      const availH = Math.max(1, frameH - PREVIEW_PADDING_PX * 2);
      const contentW = Math.max(content.offsetWidth, content.scrollWidth);
      const contentH = Math.max(content.offsetHeight, content.scrollHeight);
      if (contentW <= 0 || contentH <= 0) return;

      const raw = Math.min(MAX_PREVIEW_SCALE, availW / contentW, availH / contentH);
      const next = Math.max(MIN_PREVIEW_SCALE, Math.floor(raw * 10000) / 10000);
      setScale((prev) => (Math.abs(prev - next) > 0.0005 ? next : prev));
    };

    update();
    const raf = requestAnimationFrame(update);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(frame);
    observer?.observe(content);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [StageView]);

  return (
    <div ref={frameRef} className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        ref={contentRef}
        className="w-[560px] shrink-0 origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="lab-stage-preview">
          <StageView />
        </div>
      </div>
    </div>
  );
}

export function StudyCard({
  study,
  locale,
  onSelectTag,
  selectedTag,
}: {
  study: LoadedStudy;
  locale: Locale;
  onSelectTag?: (tag: string) => void;
  selectedTag?: string;
}) {
  const { meta } = study;
  const href = `/s/${meta.slug}`;
  const copy = messages(locale);
  const asks = studyAsks(meta, locale);
  const categoryId = getStudyCategory(meta);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [stageState, setStageState] = useState<{
    slug: string;
    Component: ComponentType | undefined;
    loading: boolean;
  }>(() => ({
    slug: meta.slug,
    Component: study.getCachedStageView(),
    loading: false,
  }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { rootMargin: "160px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !study.hasStageView) return;
    const cached = study.getCachedStageView();
    if (cached) {
      setStageState({ slug: meta.slug, Component: cached, loading: false });
      return;
    }
    let cancelled = false;
    setStageState({ slug: meta.slug, Component: undefined, loading: true });
    study
      .loadStageView()
      .then((Component) => {
        if (!cancelled) {
          setStageState({ slug: meta.slug, Component, loading: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStageState({ slug: meta.slug, Component: undefined, loading: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isInView, meta.slug, study]);

  const StageView = stageState.slug === meta.slug ? stageState.Component : study.getCachedStageView();
  const isStageLoading = stageState.slug === meta.slug && stageState.loading;

  return (
    <article className="lab-card group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card motion-safe:hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:shadow-menu">
      <div>
        <div
          ref={containerRef}
          inert
          aria-hidden="true"
          className="pointer-events-none relative mb-3.5 h-40 w-full select-none overflow-hidden rounded-xl border border-border/60 bg-surface-2/40 transition-colors duration-150 group-hover:border-border-strong"
        >
          {StageView && isInView ? (
            <PreviewErrorBoundary fallback={<StagePlaceholder />}>
              <ScaledStagePreview StageView={StageView} />
            </PreviewErrorBoundary>
          ) : (
            <StagePlaceholder loading={isInView && isStageLoading} />
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-accent">
              {studyEyebrow(meta, locale) || categoryLabel(categoryId, locale)}
            </p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-tight text-fg transition-colors duration-150 group-hover:text-accent">
              <Link
                href={href}
                className="no-underline after:absolute after:inset-0 after:content-['']"
              >
                {studyTitle(meta, locale)}
              </Link>
            </h2>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg" />
        </div>

        {asks ? (
          <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[12px] font-medium text-fg">
            <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <span className="leading-snug">{asks}</span>
          </div>
        ) : null}

        <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-fg-muted">
          {studySummary(meta, locale)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="relative z-10 flex flex-wrap gap-1">
          {meta.tags?.slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (onSelectTag) {
                  onSelectTag(tag);
                } else {
                  navigate(`/studies?tag=${encodeURIComponent(tag)}`);
                }
              }}
              className={
                selectedTag === tag
                  ? "rounded-md border border-accent bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-accent"
                  : "rounded-md border border-border/80 bg-bg px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle transition-colors duration-150 hover:border-border-strong hover:text-fg"
              }
            >
              #{tag}
            </button>
          ))}
        </div>

        {meta.status !== "active" ? (
          <span
            className={
              meta.status === "draft"
                ? "rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent"
                : "rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-subtle"
            }
          >
            {meta.status === "draft" ? copy.statusDraft : copy.statusRetired}
          </span>
        ) : (
          <DateStamp
            created={meta.created}
            updated={meta.updated}
            locale={locale}
            className="font-mono text-[11px] text-fg-subtle"
          />
        )}
      </div>
    </article>
  );
}
