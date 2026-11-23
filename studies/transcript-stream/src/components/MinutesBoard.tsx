import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  Square,
  Sparkles,
  Zap,
  RotateCcw,
  Printer,
  Edit3,
} from "lucide-react";
import type { ActionItem, MeetingMinutesData, TopicItem, TurnRecord } from "../lib/types";
import { filterTurnsBySpeaker, formatTimestampFull, getSpeakerTheme } from "../lib/machines";
import { useLocale } from "../lib/site-locale";

interface MinutesBoardProps {
  turns: TurnRecord[];
  minutes: MeetingMinutesData;
  onReturnToLive: () => void;
  onResetToPrep: () => void;
}

export function MinutesBoard({
  turns,
  minutes,
  onReturnToLive,
  onResetToPrep,
}: MinutesBoardProps) {
  const en = useLocale() === "en";
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "source">("preview");
  const [copied, setCopied] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);

  const [executiveSummary, setExecutiveSummary] = useState(minutes.executiveSummary);
  const [topics, setTopics] = useState<TopicItem[]>(minutes.topics);
  const [decisions, setDecisions] = useState<string[]>(minutes.decisions);
  const [actionItems, setActionItems] = useState<ActionItem[]>(minutes.actionItems);
  const [rawMarkdown, setRawMarkdown] = useState(minutes.rawMarkdown);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const filteredTurns = filterTurnsBySpeaker(turns, selectedSpeaker, searchQuery);

  const handleCopyMarkdown = () => {
    navigator.clipboard?.writeText(rawMarkdown);
    setCopied(true);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      copyTimerRef.current = null;
    }, 2000);
  };

  const handleToggleActionItem = (id: string) => {
    setActionItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      const targetItem = prev.find((item) => item.id === id);
      if (targetItem) {
        const fromPattern = targetItem.completed ? `- [x] ${targetItem.task}` : `- [ ] ${targetItem.task}`;
        const toPattern = targetItem.completed ? `- [ ] ${targetItem.task}` : `- [x] ${targetItem.task}`;
        setRawMarkdown((md) => md.replace(fromPattern, toPattern));
      }
      return updated;
    });
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleExportHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="${en ? "en" : "zh-CN"}">
<head>
  <meta charset="utf-8">
  <title>${minutes.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; line-height: 1.6; max-width: 820px; margin: 40px auto; padding: 0 24px; color: #1e293b; background: #ffffff; }
    h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 8px; color: #0f172a; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 16px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .box-title { font-size: 13px; font-weight: bold; color: #0284c7; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-title { font-size: 16px; font-weight: bold; margin: 24px 0 12px; color: #334155; }
    .topic-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
    .decision-item { display: flex; gap: 8px; margin-bottom: 8px; font-size: 14px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: #e0f2fe; color: #0369a1; }
    .action-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px; font-size: 13px; }
    .completed { text-decoration: line-through; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>${minutes.title}</h1>
  <div class="meta">
    <span>${en ? "Date" : "日期"}: ${minutes.date}</span>
    <span>${en ? "Duration" : "时长"}: ${minutes.durationStr}</span>
    <span>${en ? "Attendees" : "参会人"}: ${minutes.attendees.join(en ? ", " : "、")}</span>
  </div>
  <div class="box">
    <div class="box-title">${en ? "Executive Summary" : "会议核心摘要"}</div>
    <p style="margin: 0; font-size: 14px;">${executiveSummary}</p>
  </div>
  <div class="section-title">${en ? "Discussion Topics" : "议题讨论与关键决议"}</div>
  ${topics
    .map(
      (t) => `
    <div class="topic-card">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <strong>${t.title}</strong>
        <span style="font-size:12px; color:#64748b;">${en ? "Speakers" : "主要发言"}: ${t.speakers.join(", ")}</span>
      </div>
      <p style="font-size:13px; color:#475569; margin: 0 0 8px;">${t.summary}</p>
      <ul style="margin:0; padding-left:20px; font-size:13px; color:#475569;">
        ${t.keyPoints.map((kp) => `<li>${kp}</li>`).join("")}
      </ul>
    </div>
  `,
    )
    .join("")}
  <div class="section-title">${en ? "Key Decisions" : "核心决议"}</div>
  <div class="box" style="background:#f0fdf4; border-color:#bbf7d0;">
    ${decisions
      .map(
        (d, idx) => `
      <div class="decision-item">
        <strong style="color:#16a34a;">${idx + 1}.</strong>
        <span>${d}</span>
      </div>
    `,
      )
      .join("")}
  </div>
  <div class="section-title">${en ? "Action Items" : "待办事项清单 (Action Items)"}</div>
  ${actionItems
    .map(
      (item) => `
    <div class="action-item">
      <span class="${item.completed ? "completed" : ""}">${item.completed ? "☑" : "☐"} ${item.task}</span>
      <span class="badge">${item.assignee} · ${item.deadline}</span>
    </div>
  `,
    )
    .join("")}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting_minutes_${minutes.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col h-[740px] bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-surface-2/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent-soft text-accent">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-fg">{minutes.title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-fg-muted mt-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-fg-subtle" /> {minutes.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-fg-subtle" /> {minutes.durationStr}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-fg-subtle" />{" "}
              {en ? "Attendees: " : "参会人: "}
              {minutes.attendees.join(en ? ", " : "、")}
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onResetToPrep}
            className="px-3 py-1.5 text-xs font-medium text-fg-muted hover:text-fg bg-surface border border-border rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-1.5 cursor-pointer"
            title={en ? "Reset session and return to voiceprints" : "清空当前会议记录并返回会前声纹抽屉"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {en ? "Reset to Prep" : "重置并建档"}
          </button>

          <button
            type="button"
            onClick={onReturnToLive}
            className="px-3 py-1.5 text-xs font-medium text-fg-muted hover:text-fg bg-surface border border-border rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {en ? "Back to Live" : "回到实时舞台"}
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 text-xs font-medium text-accent bg-accent-soft border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-intent" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? (en ? "Copied" : "已复制") : en ? "Copy Markdown" : "复制 Markdown"}
          </button>

          <button
            type="button"
            onClick={handleExportHtml}
            className="px-3 py-1.5 text-xs font-medium text-fg bg-surface border border-border hover:bg-surface-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            title={en ? "Export standalone HTML minutes" : "导出为独立自包含的 HTML 纪要文件"}
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            {en ? "Export HTML" : "导出 HTML"}
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="px-3.5 py-1.5 text-xs font-semibold text-accent-fg bg-accent hover:bg-accent/90 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title={en ? "Open print dialog to export PDF" : "调起打印并导出高保真 PDF"}
          >
            <Printer className="w-3.5 h-3.5" />
            {en ? "Export PDF" : "导出 PDF"}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="lg:col-span-5 flex flex-col h-full bg-surface">
          <div className="p-3.5 border-b border-border bg-surface-2/40 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-fg flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                {en
                  ? `Transcript Timeline (${filteredTurns.length} turns)`
                  : `时间轴对话流水 (${filteredTurns.length} 话轮)`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSpeaker("all")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${
                  selectedSpeaker === "all"
                    ? "bg-accent text-accent-fg font-medium"
                    : "bg-surface border border-border text-fg-muted hover:text-fg"
                }`}
              >
                {en ? "All" : "全部"}
              </button>
              {minutes.attendees.map((name, idx) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedSpeaker(name)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] flex items-center gap-1 ${
                    selectedSpeaker === name
                      ? "bg-accent text-accent-fg font-medium"
                      : "bg-surface border border-border text-fg-muted hover:text-fg"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: getSpeakerTheme(idx).primary }}
                  />
                  {name}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-fg-subtle absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  en
                    ? "Search transcript keywords or speakers..."
                    : "搜索转录关键词或人名 (如: 张三、架构)..."
                }
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredTurns.length === 0 ? (
              <div className="text-center py-12 text-xs text-fg-subtle">
                {en ? "No matching transcript turns" : "未检索到匹配的发言记录"}
              </div>
            ) : (
              filteredTurns.map((turn, i) => {
                const theme = getSpeakerTheme(turn.speaker_id);
                return (
                  <div
                    key={turn.turn_id || i}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                      turn.has_overlap
                        ? "border-amber-300 dark:border-amber-800 bg-amber-50/20"
                        : "border-border bg-surface hover:bg-surface-2/60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <strong className="text-fg">{turn.speaker_name}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {turn.has_overlap && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> {en ? "Overlap" : "抢话重叠"}
                          </span>
                        )}
                        <span className="font-mono text-fg-subtle">
                          {formatTimestampFull(turn.start_s)}
                        </span>
                      </div>
                    </div>
                    <p className="text-fg-muted leading-relaxed pl-3.5 border-l-2 border-border/80">
                      {turn.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col h-full bg-surface">
          <div className="px-6 py-3 border-b border-border bg-surface-2/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-surface text-accent shadow-xs border border-border"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {en ? "Formatted Preview" : "高保真排版预览"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("source")}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === "source"
                    ? "bg-surface text-accent shadow-xs border border-border"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {en ? "Markdown Source" : "Markdown 源码编辑"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "preview" && (
                <button
                  type="button"
                  onClick={() => setIsInlineEditing((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                    isInlineEditing
                      ? "bg-accent-soft text-accent border-accent/40"
                      : "bg-surface text-fg-muted border-border hover:text-fg"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  {isInlineEditing
                    ? en
                      ? "Done Editing"
                      : "退出所见即所得编辑"
                    : en
                      ? "Inline Edit"
                      : "行内富文本编辑"}
                </button>
              )}
              <span className="text-[11px] text-fg-subtle flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent" />
                {en ? "Structured Minutes" : "智能结构化纪要"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 text-sm">
            {activeTab === "preview" ? (
              <div className="space-y-6 max-w-2xl">
                <div className="p-4 rounded-xl bg-accent-soft/40 border border-accent/20 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {en ? "Executive Summary" : "会议核心摘要 (Executive Summary)"}
                  </h3>
                  {isInlineEditing ? (
                    <textarea
                      value={executiveSummary}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExecutiveSummary(val);
                      }}
                      rows={3}
                      className="w-full text-xs text-fg p-2 bg-surface rounded-lg border border-accent/40 focus:outline-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-xs text-fg leading-relaxed">{executiveSummary}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    {en ? "Discussion Topics" : "议题讨论与关键决议"}
                  </h3>
                  {topics.map((t, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-surface-2/20 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {isInlineEditing ? (
                          <input
                            type="text"
                            value={t.title}
                            onChange={(e) => {
                              const newTopics = [...topics];
                              newTopics[idx] = { ...newTopics[idx], title: e.target.value };
                              setTopics(newTopics);
                            }}
                            className="font-semibold text-fg text-sm bg-surface px-1.5 py-0.5 rounded border border-border"
                          />
                        ) : (
                          <h4 className="font-semibold text-fg text-sm">{t.title}</h4>
                        )}
                        <span className="text-xs text-fg-subtle">
                          {en ? "Speakers: " : "主要发言: "}
                          {t.speakers.join(", ")}
                        </span>
                      </div>
                      {isInlineEditing ? (
                        <textarea
                          value={t.summary}
                          onChange={(e) => {
                            const newTopics = [...topics];
                            newTopics[idx] = { ...newTopics[idx], summary: e.target.value };
                            setTopics(newTopics);
                          }}
                          rows={2}
                          className="w-full text-xs text-fg-muted p-1.5 bg-surface rounded border border-border"
                        />
                      ) : (
                        <p className="text-xs text-fg-muted">{t.summary}</p>
                      )}
                      <ul className="list-disc list-inside space-y-1 text-xs text-fg-muted pt-1">
                        {t.keyPoints.map((kp, kIdx) => (
                          <li key={kIdx} className="leading-relaxed">
                            {kp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    {en ? "Key Decisions" : "核心决议 (Decisions)"}
                  </h3>
                  <div className="p-4 rounded-xl border border-intent/20 bg-intent-soft/40 space-y-2">
                    {decisions.map((d, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-fg">
                        <span className="w-4 h-4 rounded-full bg-intent/20 text-intent flex items-center justify-center shrink-0 font-bold text-[10px]">
                          {dIdx + 1}
                        </span>
                        {isInlineEditing ? (
                          <input
                            type="text"
                            value={d}
                            onChange={(e) => {
                              const updated = [...decisions];
                              updated[dIdx] = e.target.value;
                              setDecisions(updated);
                            }}
                            className="flex-1 bg-surface px-1.5 py-0.5 rounded border border-intent/30 text-fg"
                          />
                        ) : (
                          <span className="leading-relaxed">{d}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fg-subtle flex items-center justify-between">
                    <span>{en ? "Action Items" : "待办事项清单 (Action Items)"}</span>
                    <span className="font-normal text-[11px] text-fg-subtle">
                      {en
                        ? `Completed ${actionItems.filter((i) => i.completed).length} / ${actionItems.length}`
                        : `已完成 ${actionItems.filter((i) => i.completed).length} / ${actionItems.length}`}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {actionItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={item.completed}
                        onClick={() => handleToggleActionItem(item.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          item.completed
                            ? "border-border bg-surface-2/40 opacity-70"
                            : "border-border bg-surface hover:border-accent hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.completed ? (
                            <CheckSquare className="w-4 h-4 text-intent shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-fg-subtle shrink-0" />
                          )}
                          <span
                            className={`text-xs ${
                              item.completed ? "line-through text-fg-muted" : "text-fg font-medium"
                            }`}
                          >
                            {item.task}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border text-[11px] font-medium text-fg flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-accent text-accent-fg flex items-center justify-center text-[9px] font-bold">
                              {item.assigneeAvatar}
                            </span>
                            {item.assignee}
                          </span>
                          <span className="text-[11px] text-fg-subtle font-mono">{item.deadline}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                value={rawMarkdown}
                onChange={(e) => setRawMarkdown(e.target.value)}
                className="w-full h-full font-mono text-xs p-4 bg-surface-2/40 border border-border rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed text-fg"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
