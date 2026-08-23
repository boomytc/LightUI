import { useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { MEMBERS } from "../lib/fixtures";
import { filterMembers, type Member } from "../lib/machines";
import { useLocale } from "../lib/site-locale";
import { cn } from "../lib/utils";
import { FieldLabel, Frame, fieldClass } from "./Frame";
import { Popover } from "./Popover";

export function ComboboxDemo({ state }: { state?: string } = {}) {
  const locale = useLocale();
  const id = useId();
  const listId = `${id}-list`;
  const triggerRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(state === "open" ? "su" : state === "picked" ? "Sue" : "");
  const [open, setOpen] = useState(state === "open");
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState<Member | null>(state === "picked" ? MEMBERS[0] : null);

  const results = useMemo(() => filterMembers(MEMBERS, query), [query]);

  function choose(member: Member) {
    setPicked(member);
    setQuery(member.name);
    setOpen(false);
  }

  return (
    <Frame title={locale === "en" ? "Invite · member" : "邀请 · 成员"}>
      <FieldLabel htmlFor={id}>{locale === "en" ? "Invite a member" : "邀请成员"}</FieldLabel>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" />
        <input
          ref={triggerRef}
          id={id}
          className={`${fieldClass} pl-9`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && results[active] ? `${id}-${results[active].id}` : undefined}
          placeholder={locale === "en" ? "Name or email" : "输入姓名或邮箱"}
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setPicked(null);
            setOpen(next.trim().length > 0);
            setActive(0);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && open && results[active]) {
              e.preventDefault();
              choose(results[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </div>
      <Popover open={open && query.trim().length > 0} onClose={() => setOpen(false)} triggerRef={triggerRef} id={listId}>
        <ul role="listbox" aria-label={locale === "en" ? "Members" : "成员"} className="max-h-56 overflow-y-auto p-1">
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-[13px] text-fg-subtle">
              {locale === "en" ? "No matching members" : "没有匹配的成员"}
            </li>
          ) : (
            results.map((member, i) => (
              <li key={member.id}>
                <button
                  id={`${id}-${member.id}`}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left",
                    i === active ? "bg-surface-2" : "hover:bg-surface-2",
                  )}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(member)}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-fg text-[12px] font-medium text-surface">
                    {member.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">{member.name}</span>
                    <span className="block truncate text-[12px] text-fg-subtle">{member.email}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </Popover>
      {picked ? (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-[13px] text-accent">
          {picked.name}
          <span className="ml-2 text-fg-muted">{picked.email}</span>
        </p>
      ) : null}
    </Frame>
  );
}
