import {
  Component,
  type ComponentType,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowUpRight } from "lucide-react";
import { DateStamp } from "./DateStamp";
import { Link } from "./Link";
import type { LoadedStudy } from "../lib/catalog";
import { categoryLabel, getStudyCategory } from "../lib/categories";
import { messages } from "../lib/i18n";
import { studyAsks, studySummary, studyTitle } from "../lib/localize";
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

const MAX_PREVIEW_SCALE = 0.72;
const MIN_PREVIEW_SCALE = 0.12;
const MAX_FIT_ASPECT_RATIO = 1.75;
const PREVIEW_PADDING_PX = 20;

type PreviewLayout = {
  scale: number;
  topAligned: boolean;
};

function StagePlaceholder({ loading = false }: { loading?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {loading ? (
        <div className="size-6 animate-spin rounded-full border-2 border-border border-t-accent/70" />
      ) : (
        <div className="size-6 rounded-full border border-border/70 opacity-40" />
      )}
    </div>
  );
}

function ScaledStagePreview({ StageView }: { StageView: ComponentType }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<PreviewLayout>({
    scale: MAX_PREVIEW_SCALE,
    topAligned: false,
  });

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

      // 优先按实际可视子容器包围盒测量宽度，避免窄型组件被 480px 外壳强行缩得过小
      const stageRoot = content.querySelector<HTMLElement>('[data-stage="root"]') ?? content;
      const singleChild =
        stageRoot.children.length === 1 ? (stageRoot.firstElementChild as HTMLElement | null) : null;
      const rawContentW = Math.max(content.offsetWidth, content.scrollWidth);
      const contentW =
        singleChild && singleChild.offsetWidth > 48 && singleChild.offsetWidth < rawContentW - 36
          ? singleChild.offsetWidth + 24
          : rawContentW;
      const contentH = Math.max(content.offsetHeight, content.scrollHeight);
      if (contentW <= 0 || contentH <= 0) return;

      const topAligned = contentH / contentW > MAX_FIT_ASPECT_RATIO;
      const raw = topAligned
        ? Math.min(MAX_PREVIEW_SCALE, availW / contentW)
        : Math.min(MAX_PREVIEW_SCALE, availW / contentW, availH / contentH);
      const nextScale = Math.max(MIN_PREVIEW_SCALE, Math.floor(raw * 10000) / 10000);
      setLayout((prev) =>
        prev.topAligned === topAligned && Math.abs(prev.scale - nextScale) <= 0.0005
          ? prev
          : { scale: nextScale, topAligned },
      );
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
    <div
      ref={frameRef}
      className={
        layout.topAligned
          ? "absolute inset-0 flex items-start justify-center overflow-hidden pt-3.5"
          : "absolute inset-0 flex items-center justify-center overflow-hidden"
      }
      style={
        layout.topAligned
          ? { maskImage: "linear-gradient(to bottom, black 78%, transparent)" }
          : undefined
      }
    >
      <div
        ref={contentRef}
        className={
          layout.topAligned ? "w-[480px] shrink-0 origin-top" : "w-[480px] shrink-0 origin-center"
        }
        style={{ transform: `scale(${layout.scale})` }}
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
      { rootMargin: "200px" },
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
    <article className="group relative flex h-full min-w-0 flex-col justify-between">
      <div>
        {/* 单层制图点阵微缩舞台：无外卡片套娃 */}
        <div
          ref={containerRef}
          inert
          aria-hidden="true"
          className="lab-stage-grid pointer-events-none relative aspect-[16/10] w-full select-none overflow-hidden rounded-xl border border-border transition-[border-color,transform] duration-200 ease-[var(--lab-ease)] group-hover:border-border-strong motion-safe:group-hover:-translate-y-0.5"
        >
          {StageView && isInView ? (
            <PreviewErrorBoundary fallback={<StagePlaceholder />}>
              <ScaledStagePreview StageView={StageView} />
            </PreviewErrorBoundary>
          ) : (
            <StagePlaceholder loading={isInView && isStageLoading} />
          )}
        </div>

        {/* 直接从标题起笔：零眉标胶囊、零灰底问号盒 */}
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h2 className="min-w-0 text-[1.125rem] font-semibold leading-snug tracking-[-0.02em] text-fg transition-colors duration-150 group-hover:text-accent">
            <Link
              href={href}
              className="no-underline after:absolute after:inset-0 after:content-['']"
            >
              {studyTitle(meta, locale)}
            </Link>
          </h2>
          <ArrowUpRight className="size-4 shrink-0 text-fg-subtle transition-[transform,color] duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>

        {asks ? (
          <p className="mt-1.5 text-[0.9375rem] font-medium leading-snug text-fg">{asks}</p>
        ) : null}

        <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-fg-muted">
          {studySummary(meta, locale)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-border pt-3 text-[0.8125rem] text-fg-subtle">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="shrink-0 text-fg-muted">{categoryLabel(categoryId, locale)}</span>
          {meta.tags?.slice(0, 2).map((tag) => (
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
                  ? "relative z-10 shrink-0 font-medium text-accent transition-colors duration-150"
                  : "relative z-10 shrink-0 text-fg-subtle transition-colors duration-150 hover:text-fg"
              }
            >
              #{tag}
            </button>
          ))}
        </div>

        {meta.status !== "active" ? (
          <span className={meta.status === "draft" ? "shrink-0 font-medium text-accent" : "shrink-0 text-fg-subtle"}>
            {meta.status === "draft" ? copy.statusDraft : copy.statusRetired}
          </span>
        ) : (
          <DateStamp
            created={meta.created}
            updated={meta.updated}
            locale={locale}
            className="shrink-0 whitespace-nowrap tabular-nums text-fg-subtle"
          />
        )}
      </div>
    </article>
  );
}
