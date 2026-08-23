import { useState } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Btn, DemoShell, fieldClass } from "./Frame";
import { Drawer } from "./Overlay";

const PRODUCTS = [
  { id: "bag", zh: "轻量通勤双肩包", en: "Commute pack", stock: 36, price: 299, sku: "BAG-291" },
  { id: "knit", zh: "羊毛针织开衫", en: "Wool cardigan", stock: 48, price: 379, sku: "KNT-048" },
  { id: "tote", zh: "复古皮革托特包", en: "Leather tote", stock: 60, price: 459, sku: "TOT-112" },
  { id: "shirt", zh: "纯棉基础衬衫", en: "Cotton shirt", stock: 72, price: 539, sku: "SHT-007" },
  { id: "cap", zh: "刺绣棒球帽", en: "Cap", stock: 90, price: 129, sku: "CAP-019" },
  { id: "sock", zh: "素色中筒袜", en: "Crew socks", stock: 140, price: 49, sku: "SCK-003" },
  { id: "belt", zh: "针扣皮带", en: "Pin belt", stock: 28, price: 189, sku: "BLT-221" },
  { id: "mug", zh: "炻器马克杯", en: "Stone mug", stock: 54, price: 79, sku: "MUG-014" },
];

export function DrawerDemo({
  defaultOpen = false,
  compact = false,
}: { defaultOpen?: boolean; compact?: boolean } = {}) {
  const locale = useLocale();
  const rows = compact ? PRODUCTS.slice(0, 4) : PRODUCTS;
  const [editing, setEditing] = useState<(typeof PRODUCTS)[number] | null>(
    defaultOpen ? PRODUCTS[0] : null,
  );

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · products" : "Orbit · 商品"}
      brand={locale === "en" ? "Products" : "商品"}
      action={<Btn tone="outline">{locale === "en" ? "Add" : "新增"}</Btn>}
      overlay={
        <Drawer
          open={editing !== null}
          onClose={() => setEditing(null)}
          title={locale === "en" ? "Edit product" : "编辑商品"}
          description={
            locale === "en"
              ? "The list stays visible. Click the scrim to close."
              : "列表仍可见。点遮罩即可关闭。"
          }
          footer={
            <>
              <Btn tone="outline" onClick={() => setEditing(null)}>
                {locale === "en" ? "Cancel" : "取消"}
              </Btn>
              <Btn onClick={() => setEditing(null)}>{locale === "en" ? "Save" : "保存"}</Btn>
            </>
          }
        >
          {editing ? (
            <div key={editing.id} className="space-y-3 pb-4">
              <span className="block h-16 w-full rounded-md bg-linear-to-br from-accent-soft to-bg-warm" />
              <Field
                label={locale === "en" ? "Name" : "商品名称"}
                defaultValue={pick({ zh: editing.zh, en: editing.en }, locale)}
              />
              <Field
                label={locale === "en" ? "SKU" : "货号"}
                defaultValue={editing.sku}
              />
              <Field
                label={locale === "en" ? "Category" : "分类"}
                defaultValue={locale === "en" ? "Goods" : "商品"}
              />
              <Field label={locale === "en" ? "Stock" : "库存"} defaultValue={String(editing.stock)} />
              <Field label={locale === "en" ? "Price" : "价格"} defaultValue={String(editing.price)} />
              <Field
                label={locale === "en" ? "Supplier" : "供应商"}
                defaultValue={locale === "en" ? "North mill" : "北厂"}
              />
            </div>
          ) : null}
        </Drawer>
      }
    >
      <div className="flex items-end justify-between gap-3 px-4 pt-4 pb-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium">{locale === "en" ? "Catalog" : "商品管理"}</h3>
          <p className="text-[12px] text-fg-subtle">
            {locale === "en" ? `${rows.length} items · edit beside the list` : `共 ${rows.length} 件 · 对照着列表改`}
          </p>
        </div>
      </div>
      <div className="hidden grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_auto] gap-3 border-t border-border px-4 py-2 text-[11px] text-fg-subtle sm:grid sm:px-5">
        <span>{locale === "en" ? "Product" : "商品"}</span>
        <span>{locale === "en" ? "Stock" : "库存"}</span>
        <span>{locale === "en" ? "Price" : "价格"}</span>
        <span />
      </div>
      <ul>
        {rows.map((product) => (
          <li
            key={product.id}
            className={cn(
              "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-border px-4 py-2 sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_auto] sm:px-5",
              editing?.id === product.id ? "bg-accent-soft" : "hover:bg-surface-2",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="size-10 shrink-0 rounded-md bg-linear-to-br from-accent-soft to-bg-warm"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-[13px]">{pick({ zh: product.zh, en: product.en }, locale)}</p>
                <p className="truncate text-[11px] text-fg-subtle">{product.sku}</p>
              </div>
            </div>
            <span className="hidden text-[12px] text-fg-muted sm:block">{product.stock}</span>
            <span className="hidden text-[12px] text-fg-muted sm:block">¥{product.price}</span>
            <Btn tone="ghost" onClick={() => setEditing(product)}>
              {locale === "en" ? "Edit" : "编辑"}
            </Btn>
          </li>
        ))}
      </ul>
    </DemoShell>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12px] font-medium text-fg-muted">{label}</span>
      <input className={fieldClass} defaultValue={defaultValue} />
    </label>
  );
}
