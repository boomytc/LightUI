import { useState } from "react";
import { useLocale } from "../lib/site-locale";
import { Btn, Window } from "./Frame";
import { MenuItem, Modal, PopoverMenu } from "./Overlay";

const CARDS = [
  { zh: "本周灵感", en: "This week" },
  { zh: "视频选题", en: "Video ideas" },
  { zh: "知识卡片", en: "Notes" },
  { zh: "创作计划", en: "Plan" },
];

export function PopoverDemo({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(defaultOpen);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Window title={locale === "en" ? "Orbit · studio" : "Orbit · 工作室"}>
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <p className="text-[12px] font-semibold tracking-[0.14em]">{locale === "en" ? "STUDIO" : "工作室"}</p>
        <div className="relative">
          <button
            type="button"
            data-popover-trigger
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={locale === "en" ? "Account menu" : "账号菜单"}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-8 place-items-center rounded-full bg-accent text-[12px] font-semibold text-accent-fg"
          >
            A
          </button>
          <PopoverMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
            <MenuItem onClick={() => setMenuOpen(false)}>
              {locale === "en" ? "Profile" : "个人资料"}
            </MenuItem>
            <MenuItem onClick={() => setMenuOpen(false)}>
              {locale === "en" ? "Preferences" : "偏好设置"}
            </MenuItem>
            <MenuItem onClick={() => setMenuOpen(false)}>
              {locale === "en" ? "Sign out" : "退出登录"}
            </MenuItem>
            <MenuItem
              tone="danger"
              onClick={() => {
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
            >
              {locale === "en" ? "Delete account" : "删除账号"}
            </MenuItem>
          </PopoverMenu>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {CARDS.map((card) => (
          <div key={card.zh} className="rounded-lg border border-border px-3 py-3">
            <span className="mb-2 block h-0.5 w-6 rounded-full bg-accent" />
            <p className="text-[13px] font-medium">{locale === "en" ? card.en : card.zh}</p>
            <p className="mt-1 text-[11px] text-fg-subtle">{locale === "en" ? "Continue" : "继续整理"}</p>
          </div>
        ))}
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={locale === "en" ? "Delete this account?" : "确认删除账号？"}
        description={
          locale === "en"
            ? "The menu was the light action. This modal is the heavy decision — it does not close on the scrim."
            : "气泡负责轻操作，居中弹窗负责重决策。点遮罩关不掉。"
        }
      >
        <div className="flex justify-end gap-2">
          <Btn tone="outline" onClick={() => setDeleteOpen(false)}>
            {locale === "en" ? "Cancel" : "取消"}
          </Btn>
          <Btn onClick={() => setDeleteOpen(false)}>{locale === "en" ? "Delete" : "确认删除"}</Btn>
        </div>
      </Modal>
    </Window>
  );
}
