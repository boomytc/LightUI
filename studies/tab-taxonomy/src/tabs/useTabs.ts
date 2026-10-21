import { useId, type KeyboardEvent } from "react";
import { nextTabIndex } from "../lib/machines";
/** Shared behavior for this study's six local fixtures, independent of skin. */
export function useTabs<T extends string>(
  ids: readonly T[],
  active: T,
  select: (id: T) => void,
) {
  const prefix = useId();
  const tabId = (id: T) => `${prefix}-tab-${id}`;
  const panelId = (id: T) => `${prefix}-panel-${id}`;
  function tabProps(id: T) {
    return {
      role: "tab" as const,
      id: tabId(id),
      "data-tab": id,
      "aria-selected": id === active,
      "aria-controls": panelId(id),
      tabIndex: id === active ? 0 : -1,
      onClick: () => select(id),
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const next = nextTabIndex(event.key, ids.indexOf(id), ids.length);
        if (next === null) return;
        event.preventDefault();
        event.stopPropagation();
        select(ids[next]!);
        const buttons = event.currentTarget
          .closest('[role="tablist"]')
          ?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons?.[next]?.focus();
      },
    };
  }
  function panelProps(id: T) {
    return {
      role: "tabpanel" as const,
      id: panelId(id),
      "aria-labelledby": tabId(id),
      tabIndex: id === active ? 0 : -1,
      "aria-hidden": id !== active,
      inert: id !== active,
    };
  }
  return { tabProps, panelProps };
}
