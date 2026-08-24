import { ArrowRight, Sparkles, Split } from "lucide-react";
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

  const afters = neighbors.filter((n) => n.rel === "after");
  const contrasts = neighbors.filter((n) => n.rel === "contrast");
  const befores = neighbors.filter((n) => n.rel === "before");

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-[1.25rem] font-semibold tracking-tight">{copy.relatedHeading}</h2>
          <p className="mt-1 text-[13px] text-fg-muted">
            {locale === "en"
              ? "The judgment graph connects this rule to its next questions and easy-to-mix alternatives."
              : "决策图谱将本则规则与后一步设问及易混淆方案相连。"}
          </p>
        </div>
        <Link href="/graph" className="text-[13px] font-medium text-accent no-underline hover:underline">
          {copy.homeSeeGraph} →
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {afters.map((item) => (
          <NeighborCard key={`after-${item.slug}`} item={item} metas={metas} locale={locale} relLabel={copy.relatedAfter} />
        ))}
        {contrasts.map((item) => (
          <NeighborCard key={`contrast-${item.slug}`} item={item} metas={metas} locale={locale} relLabel={copy.relatedContrast} />
        ))}
        {befores.map((item) => (
          <NeighborCard key={`before-${item.slug}`} item={item} metas={metas} locale={locale} relLabel={copy.relatedBefore} />
        ))}
      </div>
    </section>
  );
}

function NeighborCard({
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
    <Link
      href={`/s/${target.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 no-underline shadow-card transition-all duration-150 hover:border-border-strong hover:bg-surface-2"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={
              isAfter
                ? "inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent"
                : isContrast
                  ? "inline-flex items-center gap-1 rounded-md bg-wrong-soft px-2 py-0.5 text-[11px] font-medium text-wrong"
                  : "inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-subtle"
            }
          >
            {isAfter ? <Sparkles className="size-3" /> : isContrast ? <Split className="size-3" /> : null}
            {relLabel}
          </span>
          <ArrowRight className="size-3.5 text-fg-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-fg" />
        </div>

        {when ? (
          <p className="mt-2.5 text-[13px] font-medium text-fg">{when}</p>
        ) : null}

        <h3 className="mt-2 text-[15px] font-semibold tracking-tight text-fg group-hover:text-accent">
          {studyTitle(target, locale)}
        </h3>

        {asks ? (
          <p className="mt-1 text-[12px] leading-relaxed text-fg-muted line-clamp-2">{asks}</p>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-fg-subtle font-mono">
        <span>/s/{target.slug}</span>
        <span className="text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100 font-sans font-medium">
          {locale === "en" ? "Explore" : "前往"} →
        </span>
      </div>
    </Link>
  );
}
