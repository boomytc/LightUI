import { useEffect, useMemo, useRef, useState } from "react";
import { frameDocument } from "../lib/frame";
import {
  FIELD_ORDER,
  HOST_CHANNEL,
  IFRAME_SANDBOX,
  PROBES,
  SANDBOX_CHANNEL,
  decideSandboxMessage,
  fieldPreview,
  fieldStatus,
  paintOf,
  type Paint,
  type Probe,
  type Step,
} from "../lib/machines";

type LogTone = "ok" | "bad" | "warn";

export type LogLine = {
  id: number;
  tone: LogTone;
  title: string;
  detail: string;
};

const DOC = frameDocument();

export function SandboxStage({
  step,
  interactive,
  scripted = [],
}: {
  step: Step;
  interactive: boolean;
  scripted?: LogLine[];
}) {
  const paint = useMemo(() => paintOf(step.state), [step]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const paintRef = useRef(paint);
  const jsStarted = useRef(false);
  const sentExpr = useRef(0);
  const logId = useRef(0);
  paintRef.current = paint;

  const [frameReady, setFrameReady] = useState(false);
  const [loadEpoch, setLoadEpoch] = useState(0);
  const [applied, setApplied] = useState<number | null>(null);
  const [reported, setReported] = useState<number | null>(null);
  const [lines, setLines] = useState<LogLine[]>(scripted);
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    if (paint.phase !== "placeholder" || paint.messages.length < 2) return;
    const timer = window.setInterval(() => {
      setPhrase((index) => (index + 1) % paint.messages.length);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [paint.phase, paint.messages.length]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const iframe = iframeRef.current;
      const sourceIsFrame = iframe !== null && event.source === iframe.contentWindow;
      const decision = decideSandboxMessage({ sourceIsFrame, data: event.data });
      if (decision.type === "ignore") return;
      if (decision.type === "ready") return;
      if (decision.type === "resize") {
        setReported(decision.raw);
        setApplied(decision.height);
        if (decision.clamped) {
          push(setLines, logId, {
            tone: "warn",
            title: "高度被钳制",
            detail: `报告 ${formatRaw(decision.raw)}，采用 ${decision.height}`,
          });
        }
        return;
      }
      if (decision.type === "resize-rejected") {
        push(setLines, logId, {
          tone: "bad",
          title: "高度被拒绝",
          detail: decision.reason,
        });
        return;
      }
      if (decision.type === "foreign" || decision.type === "rejected") {
        push(setLines, logId, {
          tone: "bad",
          title: decision.type === "foreign" ? "伪造来源已丢弃" : "消息被拒绝",
          detail: decision.reason,
        });
        return;
      }
      if (decision.type === "call") {
        const call = decision.decision;
        push(setLines, logId, {
          tone: call.ok ? "ok" : "bad",
          title: call.ok ? `${call.name} 已收下` : `${call.name} 被拒绝`,
          detail: call.ok
            ? call.name === "sendPrompt"
              ? call.text
              : call.url
            : call.reason,
        });
        if (sourceIsFrame && iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              channel: HOST_CHANNEL,
              kind: "result",
              id: decision.id,
              ok: call.ok,
              value: call.ok ? { ok: true } : undefined,
              error: call.ok ? undefined : call.reason,
            },
            "*",
          );
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!frameReady || paint.phase === "placeholder") return;
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;
    flush(frame, paintRef.current, jsStarted, sentExpr);
  }, [frameReady, loadEpoch, paint, paint.phase]);

  const shown = applied ?? paint.height;
  const message = paint.messages[phrase] ?? paint.messages[0] ?? "等待占位句";

  return (
    <div className="grid gap-4" data-sandbox-root="true">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
            sandbox="{IFRAME_SANDBOX}"
          </p>
          <p className="mt-1 text-[13px] text-fg-muted">
            校验 <span className="font-mono text-[12px]">event.source === iframe.contentWindow</span>
            。origin 会是 "null"，不能拿来放行。
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-[12px]">
          <Meter label="初始" value={String(paint.height)} />
          <Meter label="报告" value={reported === null ? "—" : String(reported)} />
          <Meter label="采用" value={String(shown)} />
        </dl>
      </div>

      <div
        data-sandbox-phase={paint.phase}
        data-sandbox-applied={shown}
        className="overflow-hidden rounded-xl border border-border bg-surface shadow-card"
        style={{ height: shown }}
      >
        {paint.phase === "placeholder" ? (
          <div className="flex h-full flex-col justify-between px-4 py-3">
            <p className="text-[12px] text-fg-subtle">样式完成前不挂文档</p>
            <p className="text-[15px] text-fg">{message}</p>
            <div className="h-1 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="沙盒"
            sandbox={IFRAME_SANDBOX}
            srcDoc={DOC}
            referrerPolicy="no-referrer"
            onLoad={() => {
              jsStarted.current = false;
              sentExpr.current = 0;
              setFrameReady(true);
              setLoadEpoch((value) => value + 1);
            }}
            className="h-full w-full border-0 bg-transparent"
          />
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ol className="grid gap-1.5" aria-label="字段顺序">
          {FIELD_ORDER.map((field, index) => {
            const status = fieldStatus(step.state, field);
            return (
              <li
                key={field}
                data-field={field}
                data-field-status={status}
                className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-baseline gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5"
              >
                <span className="font-mono text-[11px] text-fg-subtle">{index + 1}</span>
                <span className="truncate font-mono text-[12px] text-fg" title={fieldPreview(step.state, field)}>
                  {field}
                </span>
                <span className={statusClass(status)}>{statusLabel(status)}</span>
              </li>
            );
          })}
        </ol>

        <div>
          <p className="mb-1.5 text-[12px] text-fg-subtle">回传</p>
          <ul className="grid max-h-52 gap-1.5 overflow-auto" aria-live="polite">
            {lines.length === 0 ? (
              <li className="rounded-lg border border-dashed border-border px-2.5 py-2 text-[12px] text-fg-subtle">
                还没有回传。点沙盒里的按钮，或用下面的探针。
              </li>
            ) : (
              lines.map((line) => (
                <li
                  key={line.id}
                  data-log-tone={line.tone}
                  className={`rounded-lg px-2.5 py-1.5 text-[12px] ${toneClass(line.tone)}`}
                >
                  <p className="font-medium">{line.title}</p>
                  <p className="mt-0.5 break-all text-fg-muted">{line.detail}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {interactive ? (
        <div className="grid gap-3">
          {groups().map(([group, probes]) => (
            <div key={group}>
              <p className="mb-1.5 text-[12px] text-fg-subtle">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {probes.map((probe) => (
                  <button
                    key={probe.id}
                    type="button"
                    className="rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] text-fg hover:bg-surface-2"
                    disabled={probe.kind !== "foreign" && !frameReady}
                    onClick={() => sendProbe(probe, iframeRef.current)}
                  >
                    {probe.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function flush(
  frame: Window,
  paint: Paint,
  jsStarted: { current: boolean },
  sentExpr: { current: number },
) {
  if (paint.css !== null) {
    frame.postMessage({ channel: HOST_CHANNEL, kind: "css", css: paint.css }, "*");
  }
  if (!jsStarted.current && paint.html !== null) {
    frame.postMessage({ channel: HOST_CHANNEL, kind: "html", html: paint.html }, "*");
  }
  if (!jsStarted.current && paint.functions !== null) {
    frame.postMessage({ channel: HOST_CHANNEL, kind: "functions", code: paint.functions }, "*");
    jsStarted.current = true;
  }
  if (!jsStarted.current) return;
  const next = paint.expressions.slice(sentExpr.current);
  for (const code of next) {
    frame.postMessage({ channel: HOST_CHANNEL, kind: "expression", code }, "*");
  }
  sentExpr.current = paint.expressions.length;
}

function sendProbe(probe: Probe, iframe: HTMLIFrameElement | null) {
  if (probe.kind === "foreign") {
    window.postMessage(
      {
        channel: SANDBOX_CHANNEL,
        kind: "call",
        id: `probe-${probe.id}`,
        name: "sendPrompt",
        args: { text: "伪造的回传" },
      },
      "*",
    );
    return;
  }
  const frame = iframe?.contentWindow;
  if (!frame) return;
  if (probe.kind === "resize") {
    frame.postMessage(
      {
        channel: HOST_CHANNEL,
        kind: "probe",
        action: "resize",
        height: probe.height,
        special: probe.special,
      },
      "*",
    );
    return;
  }
  frame.postMessage(
    {
      channel: HOST_CHANNEL,
      kind: "probe",
      action: "call",
      name: probe.name,
      args: probe.args,
    },
    "*",
  );
}

function groups(): [string, Probe[]][] {
  const map = new Map<string, Probe[]>();
  for (const probe of PROBES) {
    const list = map.get(probe.group) ?? [];
    list.push(probe);
    map.set(probe.group, list);
  }
  return [...map.entries()];
}

function push(
  setLines: (value: (current: LogLine[]) => LogLine[]) => void,
  logId: { current: number },
  line: Omit<LogLine, "id">,
) {
  const id = ++logId.current;
  setLines((current) => [{ ...line, id }, ...current].slice(0, 12));
}

function formatRaw(value: number): string {
  if (Number.isNaN(value)) return "NaN";
  if (!Number.isFinite(value)) return "Infinity";
  return String(value);
}

function statusLabel(status: string): string {
  if (status === "complete") return "完成";
  if (status === "streaming") return "正在写入";
  return "未到";
}

function statusClass(status: string): string {
  if (status === "complete") return "text-[11px] text-intent";
  if (status === "streaming") return "text-[11px] text-accent";
  return "text-[11px] text-fg-subtle";
}

function toneClass(tone: LogTone): string {
  if (tone === "ok") return "bg-intent-soft text-fg";
  if (tone === "warn") return "bg-accent-soft text-fg";
  return "bg-wrong-soft text-fg";
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-fg-subtle">{label}</dt>
      <dd className="font-mono text-[13px] text-fg">{value}</dd>
    </div>
  );
}
