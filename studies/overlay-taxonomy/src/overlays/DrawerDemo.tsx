import { useState } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Btn, Window, fieldClass } from "./Frame";
import { Drawer } from "./Overlay";

const PRODUCTS = [
  { id: "bag", zh: "轻量通勤双肩包", en: "Commute pack", stock: 36, price: 299 },
  { id: "knit", zh: "羊毛针织开衫", en: "Wool cardigan", stock: 48, price: 379 },
  { id: "tote", zh: "复古皮革托特包", en: "Leather tote", stock: 60, price: 459 },
  { id: "shirt", zh: "纯棉基础衬衫", en: "Cotton shirt", stock: 72, price: 539 },
];

export function DrawerDemo({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  const locale = useLocale();
  const [editing, setEditing] = useState<(typeof PRODUCTS)[number] | null>(
    defaultOpen ? PRODUCTS[0] : null,
  );

  return (
    <Window title={locale === "en" ? "Orbit · products" : "Orbit · 商品"}>
      <div className="flex items-center justify-between px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium">{locale === "en" ? "Products" : "商品管理"}</h3>
          <p className="text-[12px] text-fg-subtle">{locale === "en" ? "24 items" : "共 24 件商品"}</p>
        </div>
        <Btn tone="outline">{locale === "en" ? "Add" : "新增"}</Btn>
      </div>
      <ul className="px-3 pb-3">
        {PRODUCTS.map((product) => (
          <li
            key={product.id}
            className={cn(
              "mb-1 flex min-w-0 items-center justify-between gap-2 rounded-lg px-2 py-2",
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
                <p className="text-[11px] text-fg-subtle">
                  {locale === "en" ? `Stock ${product.stock}` : `库存 ${product.stock}`} · ¥{product.price}
                </p>
              </div>
            </div>
            <Btn tone="ghost" onClick={() => setEditing(product)}>
              {locale === "en" ? "Edit" : "编辑"}
            </Btn>
          </li>
        ))}
      </ul>

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
            <Field label={locale === "en" ? "Category" : "分类"} defaultValue={locale === "en" ? "Bags" : "包袋"} />
            <Field label={locale === "en" ? "Stock" : "库存"} defaultValue={String(editing.stock)} />
            <Field label={locale === "en" ? "Price" : "价格"} defaultValue={String(editing.price)} />
          </div>
        ) : null}
      </Drawer>
    </Window>
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
