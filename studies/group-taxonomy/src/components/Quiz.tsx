import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import {
  QUIZ,
  PATTERNS,
  gradeQuizAnswer,
  type PatternId,
} from "../lib/machines.js";

const VALID_CHOICES = PATTERNS.filter(
  (p): p is typeof p & { id: Exclude<PatternId, "overview" | "cards"> } =>
    p.id !== "cards",
);

export function RelationQuiz({
  onOpen,
}: {
  onOpen: (id: PatternId) => void;
}) {
  const [answers, setAnswers] = useState<
    Record<string, Exclude<PatternId, "overview" | "cards">>
  >({});

  function handleSelect(
    quizId: string,
    choice: Exclude<PatternId, "overview" | "cards">,
  ) {
    setAnswers((prev) => ({ ...prev, [quizId]: choice }));
  }

  function handleReset() {
    setAnswers({});
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([id, choice]) => gradeQuizAnswer(id, choice)?.correct,
  ).length;

  return (
    <section className="rounded-2xl border border-border bg-surface-2 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold tracking-widest text-accent uppercase">
            关系自测
          </p>
          <h2 className="mt-1 text-2xl font-bold text-fg">
            看到这些场景，你会怎么分组？
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            先判断内容关系，再决定用留白、表单、列表、色块还是分割线。
          </p>
        </div>

        {answeredCount > 0 ? (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-surface px-3 py-1 font-mono text-xs font-semibold text-fg border border-border">
              得分：{correctCount} / {QUIZ.length}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="pressable inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs text-fg-muted hover:text-fg"
            >
              <RotateCcw className="size-3" />
              重测
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {QUIZ.map((item, index) => {
          const chosen = answers[item.id];
          const result = chosen ? gradeQuizAnswer(item.id, chosen) : null;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-surface p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-xs font-bold text-accent border border-border">
                  0{index + 1}
                </span>
                <p className="text-sm font-medium text-fg leading-relaxed">
                  {item.scene}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 pl-9">
                {VALID_CHOICES.map((choice) => {
                  const isSelected = chosen === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSelect(item.id, choice.id)}
                      className={`pressable rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-accent bg-accent text-accent-fg shadow-sm"
                          : "border-border bg-surface-2 text-fg-muted hover:text-fg hover:border-border-strong"
                      }`}
                    >
                      {choice.name}（{choice.relation}）
                    </button>
                  );
                })}
              </div>

              {result ? (
                <div
                  className={`mt-4 flex flex-col gap-2 rounded-lg p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between border ${
                    result.correct
                      ? "border-intent/30 bg-intent-soft/40 text-intent"
                      : "border-wrong/30 bg-wrong-soft/40 text-wrong"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.correct ? (
                      <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="size-4 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {result.correct ? "回答正确！" : "再想想看："}
                      </p>
                      <p className="mt-0.5 text-fg-muted">{result.why}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpen(result.expected)}
                    className="pressable inline-flex shrink-0 items-center gap-1 self-end rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-fg border border-border hover:bg-surface-2"
                  >
                    查看此技法
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
