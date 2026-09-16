import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import type { WorkspaceAction } from "../lib/workspace";

export function Composer({
  open,
  name,
  run,
}: {
  open: boolean;
  name: string;
  run: (action: WorkspaceAction) => void;
}) {
  const locale = useLocale();
  return (
    <>
      <button
        type="button"
        aria-label={locale === "en" ? "Close new customer" : "关闭新建客户"}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        disabled={!open}
        onClick={() => run({ type: "closeComposer" })}
        className={cn(
          "empty-drawer-dim absolute inset-0 bg-fg/20",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "empty-drawer-panel absolute inset-y-0 right-0 flex w-64 max-w-full flex-col border-l border-border bg-surface shadow-card",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
        inert={open ? undefined : true}
        aria-label={locale === "en" ? "New customer" : "新建客户"}
      >
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-[14px] font-medium">
            {locale === "en" ? "New customer" : "新建客户"}
          </h3>
        </div>
        <form
          className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            run({ type: "save" });
          }}
        >
          <label className="block text-[12px]">
            <span className="mb-1 block text-fg-muted">
              {locale === "en" ? "Name" : "姓名"}
            </span>
            <input
              value={name}
              onChange={(event) => run({ type: "draftName", name: event.target.value })}
              required
              className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-[13px] outline-none focus:border-border-strong"
            />
          </label>
          <div className="mt-auto flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => run({ type: "closeComposer" })}
              className="h-8 px-2 text-[12px] text-fg-muted"
            >
              {locale === "en" ? "Cancel" : "取消"}
            </button>
            <button
              type="submit"
              className="h-8 rounded-full bg-fg px-3 text-[12px] font-medium text-surface"
            >
              {locale === "en" ? "Save" : "保存客户"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
