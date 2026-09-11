import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import {
  PATTERNS,
  QUIZ,
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
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.16em] text-accent uppercase">
            关系自测
          </p>
          <h2 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-fg">
            看到这些场景，你会怎么分组？
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            先判断关系，再选留白、标题、列表、色带或竖线。
          </p>
        </div>

        {answeredCount > 0 ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-fg">
              {correctCount} / {QUIZ.length}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="pressable inline-flex items-center gap-1 text-fg-muted hover:text-fg"
            >
              <RotateCcw className="size-3" />
              重测
            </button>
          </div>
        ) : null}
      </div>

      <ol className="mt-6 divide-y divide-border border-y border-border">
        {QUIZ.map((item, index) => {
          const chosen = answers[item.id];
          const result = chosen ? gradeQuizAnswer(item.id, chosen) : null;

          return (
            <li key={item.id} className="py-5">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-semibold text-accent">
                  0{index + 1}
                </span>
                <p className="text-sm leading-relaxed font-medium text-fg">
                  {item.scene}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 pl-7">
                {VALID_CHOICES.map((choice) => {
                  const isSelected = chosen === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSelect(item.id, choice.id)}
                      className={`pressable rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-accent text-accent-fg"
                          : "bg-surface-2 text-fg-muted hover:text-fg"
                      }`}
                    >
                      {choice.num} {choice.name}
                    </button>
                  );
                })}
              </div>

              {result ? (
                <div
                  className={`mt-3 flex flex-col gap-2 pl-7 text-xs sm:flex-row sm:items-start sm:justify-between ${
                    result.correct ? "text-intent" : "text-wrong"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.correct ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    ) : (
                      <XCircle className="mt-0.5 size-4 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {result.correct ? "关系判断对了" : "再看一眼关系"}
                      </p>
                      <p className="mt-0.5 text-fg-muted">{result.why}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpen(result.expected)}
                    className="pressable inline-flex shrink-0 items-center gap-1 self-end text-xs font-medium text-fg hover:text-accent"
                  >
                    查看此技法
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
