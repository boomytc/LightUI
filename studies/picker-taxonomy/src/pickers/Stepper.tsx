import { useEffect, useRef, useState } from "react";
import { PRODUCT, STEPPER } from "../lib/fixtures";
import { atCeil, atFloor, stepQty } from "../lib/machines";
import { loc, pick, useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { Phone, PhoneButton } from "./Frame";

function money(n: number) {
  return `¥${n.toFixed(2)}`;
}

function useHoldRepeat(action: () => void, enabled: boolean) {
  const hold = useRef<{ t: number | null; i: number | null }>({ t: null, i: null });
  const actionRef = useRef(action);
  const enabledRef = useRef(enabled);
  actionRef.current = action;
  enabledRef.current = enabled;

  const clear = () => {
    if (hold.current.t != null) window.clearTimeout(hold.current.t);
    if (hold.current.i != null) window.clearInterval(hold.current.i);
    hold.current = { t: null, i: null };
  };

  useEffect(() => () => clear(), []);

  return {
    onPointerDown: () => {
      if (!enabledRef.current) return;
      actionRef.current();
      hold.current.t = window.setTimeout(() => {
        hold.current.i = window.setInterval(() => {
          if (!enabledRef.current) {
            clear();
            return;
          }
          actionRef.current();
        }, 80);
      }, 380);
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  };
}

export function Stepper() {
  const locale = useLocale();
  const [qty, setQty] = useState<number>(STEPPER.qty);
  const [checked, setChecked] = useState(false);
  const name = pick(loc(PRODUCT.nameZh, PRODUCT.nameEn), locale);

  const dec = () => {
    setQty((n) => stepQty(n, -1, STEPPER.min, STEPPER.max));
    setChecked(false);
  };
  const inc = () => {
    setQty((n) => stepQty(n, 1, STEPPER.min, STEPPER.max));
    setChecked(false);
  };

  const floor = atFloor(qty, STEPPER.min);
  const ceil = atCeil(qty, STEPPER.max);
  const decHold = useHoldRepeat(dec, !floor);
  const incHold = useHoldRepeat(inc, !ceil);
  const subtotal = PRODUCT.price * qty;

  return (
    <Phone
      title={locale === "en" ? "Bag" : "购物袋"}
      footer={
        <PhoneButton onClick={() => setChecked(true)}>
          {locale === "en" ? "Checkout" : "去结算"}
        </PhoneButton>
      }
    >
      <div className="flex flex-1 flex-col px-6 pt-6">
        <div className="flex flex-col items-center">
          <BagMark />
          <p className="mt-4 text-[15px] font-medium">{name}</p>
          <p className="mt-1 text-[13px] tabular-nums text-accent">{money(PRODUCT.price)}</p>
        </div>

        <div className="mt-8 flex items-center justify-between border-y border-border py-4">
          <span className="text-[13px] text-fg-muted">{locale === "en" ? "Quantity" : "数量"}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={locale === "en" ? "Decrease" : "减少"}
              disabled={floor}
              className={cn(
                "grid size-11 place-items-center rounded-full border border-border text-fg",
                "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]",
                "disabled:text-fg-subtle disabled:opacity-50",
              )}
              {...decHold}
            >
              <Minus />
            </button>
            <span className="w-10 text-center text-[15px] font-medium tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label={locale === "en" ? "Increase" : "增加"}
              disabled={ceil}
              className={cn(
                "grid size-11 place-items-center rounded-full border border-border text-fg",
                "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]",
                "disabled:text-fg-subtle disabled:opacity-50",
              )}
              {...incHold}
            >
              <Plus />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <span className="text-[13px] text-fg-muted">{locale === "en" ? "Subtotal" : "小计"}</span>
          <span className="text-[15px] font-medium tabular-nums">{money(subtotal)}</span>
        </div>

        <p className="mt-auto pb-4 text-center text-[11px] text-accent">
          {checked
            ? locale === "en"
              ? `${name} × ${qty}, ${money(subtotal)}`
              : `${name} × ${qty}，小计 ${money(subtotal)}`
            : locale === "en"
              ? "One at a time · floor is 1 · minus stops"
              : "每次 1 个 · 最少为 1 · 下限禁用"}
        </p>
      </div>
    </Phone>
  );
}

function Minus() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Plus() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function BagMark() {
  return (
    <svg viewBox="0 0 88 88" className="size-16 text-surface-2" aria-hidden>
      <rect x="8" y="8" width="72" height="72" rx="16" fill="currentColor" />
      <path
        d="M28 36h32l-3.5 30H31.5z"
        fill="var(--color-surface)"
        stroke="var(--color-border-strong)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M36 36c0-8 16-8 16 0"
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
