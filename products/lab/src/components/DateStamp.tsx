import { parseDay, stampLabel } from "../lib/dates";
import type { Locale } from "../lib/prefs";

export function DateStamp({
  created,
  updated,
  locale,
  className,
}: {
  created?: string;
  updated?: string;
  locale: Locale;
  className?: string;
}) {
  const label = stampLabel(created, updated, locale);
  const day = parseDay(updated) ?? parseDay(created);
  if (!label || !day) return null;
  return (
    <time dateTime={day} className={className}>
      {label}
    </time>
  );
}
