import { useState } from "react";
import { CARD_INVITES, CARD_MEMBERS, CARD_ROLES, CARD_TABS } from "../lib/fixtures";
import { cardPanelRadius } from "../lib/machines";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { TableHead, TableRow, Window } from "./Frame";

const RADIUS = 16;

export function CardDemo({
  defaultTab,
  fill = false,
}: { defaultTab?: string; fill?: boolean } = {}) {
  const locale = useLocale();
  const allowed = new Set(CARD_TABS.map((t) => t.id));
  const initial = defaultTab && allowed.has(defaultTab) ? defaultTab : "members";
  const [tab, setTab] = useState(initial);
  const selected = CARD_TABS.findIndex((t) => t.id === tab);
  const radius = cardPanelRadius(selected, RADIUS);

  return (
    <Window title={locale === "en" ? "North · team" : "North · 团队管理"} fill={fill}>
      <div className={fill ? "flex h-full min-h-0 flex-1 flex-col px-5 pt-4" : undefined}>
        <h3 className={cn("text-[1.15rem] font-semibold tracking-tight", fill && "shrink-0")}>
          {locale === "en" ? "Members and access" : "成员与权限"}
        </h3>

        <div
          role="tablist"
          aria-label={locale === "en" ? "Access" : "成员与权限"}
          className={cn("mt-4 flex gap-1.5", fill && "shrink-0")}
        >
          {CARD_TABS.map((item) => {
            const on = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative z-[1] px-3.5 py-2 text-[13px] transition-colors",
                  on ? "-mb-px rounded-t-xl" : "rounded-xl",
                  on
                    ? "border border-b-transparent border-border bg-surface font-medium text-fg"
                    : "border border-border bg-surface-2 text-fg-muted hover:text-fg",
                )}
              >
                {pick(item.label, locale)}
              </button>
            );
          })}
        </div>

        <div
          className={cn("relative border border-border bg-surface px-4 py-4", fill && "min-h-0 flex-1 overflow-auto")}
          style={{
            borderTopLeftRadius: radius.topLeft,
            borderTopRightRadius: radius.topRight,
            borderBottomLeftRadius: RADIUS,
            borderBottomRightRadius: RADIUS,
          }}
        >
          <div className="tab-swap" key={tab}>
            {tab === "members" ? <Members locale={locale} /> : null}
            {tab === "roles" ? <Roles locale={locale} /> : null}
            {tab === "invites" ? <Invites locale={locale} /> : null}
          </div>
        </div>
      </div>
    </Window>
  );
}

function Members({ locale }: { locale: "zh" | "en" }) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-fg-subtle">
        {locale === "en" ? "18 members · 5 active recently · synced 09:30" : "共 18 位成员，5 位最近活跃 · 同步于今天 09:30"}
      </p>
      <TableHead
        cells={locale === "en" ? ["Member", "Role", "Access", "Seen"] : ["成员", "职能", "角色", "最近活跃"]}
      />
      {CARD_MEMBERS.map((row) => (
        <TableRow
          key={row.name.zh}
          cells={[pick(row.name, locale), pick(row.role, locale), pick(row.access, locale), pick(row.seen, locale)]}
        />
      ))}
    </div>
  );
}

function Roles({ locale }: { locale: "zh" | "en" }) {
  return (
    <div>
      <TableHead cells={locale === "en" ? ["Role", "People", "Scope"] : ["角色", "成员", "访问范围"]} />
      {CARD_ROLES.map((row) => (
        <TableRow key={row.role.zh} cells={[pick(row.role, locale), pick(row.n, locale), pick(row.scope, locale)]} />
      ))}
    </div>
  );
}

function Invites({ locale }: { locale: "zh" | "en" }) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-fg-subtle">
        {locale === "en"
          ? "3 invites waiting · 1 expires soon"
          : "3 封邀请等待接受，其中 1 封即将过期"}
      </p>
      <TableHead cells={locale === "en" ? ["Email", "Team", "Expiry"] : ["邀请邮箱", "部门", "有效期"]} />
      {CARD_INVITES.map((row) => (
        <TableRow key={row.email} cells={[row.email, pick(row.dept, locale), pick(row.expiry, locale)]} />
      ))}
    </div>
  );
}
