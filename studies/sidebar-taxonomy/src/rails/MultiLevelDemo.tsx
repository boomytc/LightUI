import { useState } from "react";
import { BarChart3, ChevronDown, Home, Megaphone, Package, ShoppingBag, Users } from "lucide-react";
import { defaultChild, toggleBranch } from "../lib/accordion";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Frame } from "./Frame";

const TREE = [
  { id: "home", label: loc("首页", "Home"), icon: Home },
  {
    id: "orders",
    label: loc("订单", "Orders"),
    icon: ShoppingBag,
    children: [
      { id: "orders-all", label: loc("全部订单", "All orders") },
      { id: "orders-ship", label: loc("待发货", "To ship"), badge: 12 },
    ],
  },
  {
    id: "goods",
    label: loc("商品", "Goods"),
    icon: Package,
    children: [
      { id: "goods-all", label: loc("全部商品", "All goods") },
      { id: "goods-stock", label: loc("库存", "Stock"), badge: 12 },
    ],
  },
  { id: "customers", label: loc("客户", "Customers"), icon: Users },
  {
    id: "marketing",
    label: loc("营销", "Marketing"),
    icon: Megaphone,
    children: [
      { id: "mkt-campaigns", label: loc("营销活动", "Campaigns") },
      { id: "mkt-coupons", label: loc("优惠券", "Coupons") },
    ],
  },
  { id: "analytics", label: loc("分析", "Analytics"), icon: BarChart3 },
];

export function MultiLevelDemo() {
  const locale = useLocale();
  const [open, setOpen] = useState<string[]>(["goods"]);
  const [page, setPage] = useState("goods-stock");

  const currentLabel = (() => {
    for (const branch of TREE) {
      if (branch.id === page) return pick(branch.label, locale);
      const child = branch.children?.find((item) => item.id === page);
      if (child) return pick(child.label, locale);
    }
    return page;
  })();

  return (
    <Frame title={locale === "en" ? "Field Supply · admin" : "Field Supply · 后台"}>
      <div className="flex min-h-[22rem] bg-surface">
        <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-surface-2">
          <div className="flex items-center gap-2 px-4 py-3.5">
            <span className="grid size-7 place-items-center rounded-md bg-accent text-[10px] font-semibold text-accent-fg">
              FS
            </span>
            <span className="text-[13px] font-medium">Field Supply</span>
          </div>
          <nav className="flex-1 px-2 pb-3" aria-label={locale === "en" ? "Admin" : "后台导航"}>
            {TREE.map((branch) => {
              const Icon = branch.icon;
              const expanded = open.includes(branch.id);
              const hasKids = Boolean(branch.children?.length);
              const selfActive = page === branch.id;
              return (
                <div key={branch.id} className="mb-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasKids) {
                        setOpen((prev) => toggleBranch(prev, branch.id));
                        if (!expanded) setPage(defaultChild(branch));
                      } else {
                        setPage(branch.id);
                      }
                    }}
                    className={cn(
                      "flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-[13px]",
                      selfActive ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-surface hover:text-fg",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" strokeWidth={1.8} />
                    <span className="min-w-0 flex-1 truncate">{pick(branch.label, locale)}</span>
                    {hasKids ? (
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-fg-subtle transition-transform duration-200",
                          expanded ? "rotate-0" : "-rotate-90",
                        )}
                      />
                    ) : null}
                  </button>
                  {hasKids ? (
                    <div
                      className="grid transition-[grid-template-rows] duration-200"
                      style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l border-border pl-2">
                          {branch.children?.map((child) => {
                            const on = page === child.id;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => setPage(child.id)}
                                className={cn(
                                  "flex h-8 items-center gap-2 rounded-md px-2 text-left text-[13px]",
                                  on ? "bg-accent-soft text-fg" : "text-fg-subtle hover:bg-surface hover:text-fg",
                                )}
                              >
                                <span className="min-w-0 flex-1 truncate">{pick(child.label, locale)}</span>
                                {"badge" in child && child.badge ? (
                                  <span className="text-[11px] text-fg-subtle tabular-nums">{child.badge}</span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0 flex-1 px-5 py-5">
          <p className="text-[12px] text-fg-subtle">
            {locale === "en" ? "Parent files. Child is the page." : "父级归类。子级才是页。"}
          </p>
          <h3 className="mt-2 text-[1.2rem] font-semibold tracking-tight">{currentLabel}</h3>
          <div className="mt-4 space-y-2">
            {["LMP-226", "BAG-114", "TBL-052"].map((sku) => (
              <div
                key={sku}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[13px]"
              >
                <span className="font-mono text-[12px]">{sku}</span>
                <span className="text-fg-muted">{locale === "en" ? "In stock" : "在库"}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Frame>
  );
}
