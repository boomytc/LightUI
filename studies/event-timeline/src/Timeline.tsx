import { EVENTS } from "./lib/fixtures";
import { useLocale } from "./lib/site-locale";
import "./timeline.css";
export function Timeline({ visible }: { visible: number }) {
  const en = useLocale() === "en";
  return (
    <ol
      className="event-rail"
      aria-label={en ? "Studio history" : "工作室历程"}
    >
      {EVENTS.slice(0, visible).map((event) => (
        <li key={event.id} className="event-node" data-event={event.id}>
          <span
            className="event-dot"
            data-latest={event.id === EVENTS.at(-1)!.id}
            aria-hidden="true"
          />
          <time
            dateTime={event.date}
            className="text-xs tabular-nums text-fg-muted"
          >
            {event.date}
          </time>
          <p className="mt-1 text-sm">{en ? event.en : event.zh}</p>
          {event.id === EVENTS.at(-1)!.id && (
            <span className="mt-2 inline-block rounded-full bg-accent-soft px-2 py-1 text-xs text-accent">
              {en ? "Latest event" : "最新节点"}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
