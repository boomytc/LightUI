import { ArrowRight } from "lucide-react";
import { Link } from "./Link";
import { loadStudies } from "../lib/catalog";
import { neighborsOf, type Neighbor } from "../lib/graph";
import { messages } from "../lib/i18n";
import { linkWhen, studyAsks, studyTitle } from "../lib/localize";
import type { Locale } from "../lib/prefs";

export function RelatedDecisions({ slug, locale }: { slug: string; locale: Locale }) {
  const copy = messages(locale);
  const allStudies = loadStudies();
  const metas = allStudies.map((s) => s.meta);
  const neighbors = neighborsOf(slug, metas);

  if (neighbors.length === 0) {
    return null;
  }

  const ordered = [
    ...neighbors.filter((n) => n.rel === "after").map((item) => ({ item, label: copy.relatedAfter })),
    ...neighbors.filter((n) => n.rel === "contrast").map((item) => ({ item, label: copy.relatedContrast })),
    ...neighbors.filter((n) => n.rel === "before").map((item) => ({ item, label: copy.relatedBefore })),
  ];

  return (
    <section className="mt-14 border-t border-border pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">
            {copy.relatedHeading}
          </h2>
          <p className="mt-1 text-[0.8125rem] text-fg-muted">
            {locale === "en"
              ? "The judgment graph connects this rule to its next questions and easy-to-mix alternatives."
              : "决策图谱将本则规则与后一步设问及易混淆方案相连。"}
          </p>
        </div>
        <Link
          href="/graph"
          className="inline-flex shrink-0 items-center gap-1 text-[0.8125rem] font-medium text-accent no-underline transition-colors duration-150 hover:underline"
        >
          <span>{copy.homeSeeGraph}</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-border border-y border-border">
        {ordered.map(({ item, label }) => (
          <NeighborRow
            key={`${item.rel}-${item.slug}`}
            item={item}
            metas={metas}
            locale={locale}
            relLabel={label}
          />
        ))}
      </ul>
    </section>
  );
}

function NeighborRow({
  item,
  metas,
  locale,
  relLabel,
}: {
  item: Neighbor;
  metas: ReturnType<typeof loadStudies>[number]["meta"][];
  locale: Locale;
  relLabel: string;
}) {
  const target = metas.find((m) => m.slug === item.slug);
  if (!target) return null;

  const when = linkWhen(item.when, item.whenEn, locale);
  const asks = studyAsks(target, locale);
  const isAfter = item.rel === "after";
  const isContrast = item.rel === "contrast";

  return (
    <li>
      <Link
        href={`/s/${target.slug}`}
        className="group grid gap-2 py-4 no-underline transition-colors duration-150 hover:bg-surface/60 sm:-mx-3 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6 sm:rounded-lg sm:px-3"
      >
        <span
          className={
            isAfter
              ? "text-[0.8125rem] font-medium text-accent"
              : isContrast
                ? "text-[0.8125rem] font-medium text-wrong"
                : "text-[0.8125rem] font-medium text-fg-subtle"
          }
        >
          {relLabel}
        </span>

        <div className="min-w-0">
          <h3 className="text-[0.9375rem] font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
            {studyTitle(target, locale)}
          </h3>
          {when ? (
            <p className="mt-1 text-[0.9375rem] leading-snug text-fg-muted">{when}</p>
          ) : null}
          {asks ? (
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-fg-subtle">{asks}</p>
          ) : null}
        </div>

        <ArrowRight className="hidden size-4 shrink-0 text-fg-subtle transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-accent sm:block" />
      </Link>
    </li>
  );
}
