import { useState } from "react";
import { isTypeMatchValid } from "../../lib/machines";
import { MacWindow } from "../mac-window";

const TARGET_TOKEN = "DELETE";

export function TypeDemo() {
  const [seed, setSeed] = useState(0);
  return <TypeInner key={seed} onReset={() => setSeed((n) => n + 1)} />;
}

function TypeInner({ onReset }: { onReset: () => void }) {
  const [value, setValue] = useState("");
  const [destroyed, setDestroyed] = useState(false);

  const isValid = isTypeMatchValid(value, TARGET_TOKEN);

  return (
    <MacWindow
      title="云平台控制台 · 生产数据库"
      eyebrow="Cloud Infrastructure / Production"
      badge={
        <span className="rounded-full bg-wrong-soft px-2.5 py-0.5 text-[10px] font-medium text-wrong border border-wrong/20">
          PROD-CLUSTER · 高危操作
        </span>
      }
      onReset={onReset}
    >
      <div className="px-5 pt-4 pb-6">
        <h3 className="text-base font-semibold text-fg">销毁生产主数据库</h3>
        <p className="mt-0.5 text-xs text-fg-muted">
          不可逆灭顶高危操作：先陈列全部影响规模，强制精确键入指定字符才解锁
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.1fr]">
          {/* Left: Dependency & Scale Visualization */}
          <div className="rounded-xl border border-border bg-surface-2/60 p-4">
            <p className="text-[10px] font-mono font-semibold tracking-wider text-fg-subtle uppercase">
              Impact Topology
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg-muted">核心记录总数</span>
                <span className="font-mono font-semibold text-fg">12,642,091 条</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg-muted">占用存储体积</span>
                <span className="font-mono font-semibold text-fg">86.4 GB</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg-muted">下游强依赖服务</span>
                <span className="font-mono font-semibold text-wrong">5 个微服务</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg-muted">最近快照备份</span>
                <span className="font-mono text-fg-subtle">今天 03:00</span>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-wrong/20 bg-wrong-soft/40 p-2.5 text-[11px] leading-relaxed text-wrong">
              ⚠️ 销毁后数据不可逆删除，依赖的所有下游业务将立刻熔断服务。
            </div>
          </div>

          {/* Right: Type to Confirm Box */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-fg p-4 text-surface shadow-card">
            <div>
              <p className="font-mono text-[11px] text-surface/60">$ cluster db destroy sue-prod-db</p>
              <p className="mt-1 font-mono text-[11px] text-wrong">WARNING: Action is completely irreversible.</p>

              {destroyed ? (
                <div className="mt-6 rounded-lg bg-wrong/20 p-3 text-center text-xs font-semibold text-wrong">
                  💥 生产数据库 sue-prod-db 已正式注销销毁。
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <label htmlFor="type-input" className="block text-[11px] text-surface/80">
                    请输入 <strong className="font-mono text-white">DELETE</strong> 以解锁销毁按钮：
                  </label>
                  <input
                    id="type-input"
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="在此输入 DELETE"
                    autoComplete="off"
                    spellCheck={false}
                    className="h-9 w-full rounded-lg border border-surface/20 bg-surface/10 px-3 font-mono text-xs text-white placeholder:text-surface/40 outline-none focus:border-wrong focus:ring-2 focus:ring-wrong/30"
                  />
                </div>
              )}
            </div>

            {!destroyed && (
              <button
                type="button"
                disabled={!isValid}
                onClick={() => setDestroyed(true)}
                className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-wrong text-xs font-semibold text-white shadow-sm transition-all hover:bg-wrong/90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                永久销毁 sue-prod-db (生产库)
              </button>
            )}
          </div>
        </div>
      </div>
    </MacWindow>
  );
}
