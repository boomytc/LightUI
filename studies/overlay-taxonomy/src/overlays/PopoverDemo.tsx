import { useState } from "react";
import { pick, useLocale } from "../lib/site-locale";
import { Btn, DemoShell } from "./Frame";
import { MenuItem, Modal, PopoverMenu } from "./Overlay";

const SETTINGS = [
  { zh: "个人资料", en: "Profile", hintZh: "显示名、头像", hintEn: "Name and avatar" },
  { zh: "通知", en: "Notifications", hintZh: "邮件与推送", hintEn: "Mail and push" },
  { zh: "语言", en: "Language", hintZh: "简体中文", hintEn: "English" },
  { zh: "外观", en: "Appearance", hintZh: "跟随系统", hintEn: "Match system" },
  { zh: "账单", en: "Billing", hintZh: "席位与发票", hintEn: "Seats and invoices" },
  { zh: "团队", en: "Team", hintZh: "12 位成员", hintEn: "12 members" },
];

export function PopoverDemo({
  defaultOpen = false,
  compact = false,
}: { defaultOpen?: boolean; compact?: boolean } = {}) {
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(defaultOpen);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const rows = compact ? SETTINGS.slice(0, 4) : SETTINGS;

  return (
    <DemoShell
      compact={compact}
      title={locale === "en" ? "Orbit · settings" : "Orbit · 设置"}
      brand={locale === "en" ? "Settings" : "设置"}
      action={
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
      }
      overlay={
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
      }
    >
      <div className="px-4 pt-4 pb-3 sm:px-5">
        <h3 className="text-[15px] font-medium">{locale === "en" ? "Workspace" : "工作区"}</h3>
        <p className="text-[12px] text-fg-subtle">
          {locale === "en"
            ? "The page stays readable. Four actions stick to the avatar."
            : "页面仍可扫读。四项动作贴着头像。"}
        </p>
      </div>
      <ul>
        {rows.map((row) => (
          <li
            key={row.zh}
            className="flex min-w-0 items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px]">{pick({ zh: row.zh, en: row.en }, locale)}</p>
              <p className="truncate text-[11px] text-fg-subtle">
                {pick({ zh: row.hintZh, en: row.hintEn }, locale)}
              </p>
            </div>
            <span className="shrink-0 text-[12px] text-fg-subtle">{locale === "en" ? "Edit" : "更改"}</span>
          </li>
        ))}
      </ul>
    </DemoShell>
  );
}
