import { useMemo, useState } from "react";
import type { GroupMode } from "../../lib/machines.js";

const FIELDS = [
  { key: "name", label: "姓名", group: "基本信息", placeholder: "苏小明", hint: "在成员名录中公开显示", required: true },
  { key: "email", label: "邮箱", group: "基本信息", placeholder: "atlas@example.com", hint: "用于登录验证与系统通知", required: true },
  { key: "phone", label: "手机号", group: "基本信息", placeholder: "138 0000 2026", hint: "用于多因素安全验证", required: true },
  { key: "team", label: "团队名称", group: "工作信息", placeholder: "Atlas Studio", hint: "你所属的项目协作团队", required: true },
  { key: "role", label: "工作职位", group: "工作信息", placeholder: "产品设计师", hint: "你的职能角色与权限基线", required: true },
  { key: "city", label: "工作城市", group: "工作信息", placeholder: "上海", hint: "用于匹配就近数据中心与时区", required: true },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

function FieldInput({
  id,
  value,
  onChange,
  placeholder,
  boxed,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  boxed: boolean;
}) {
  return (
    <input
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={
        boxed
          ? "mt-1.5 h-9 w-full rounded-md border border-border bg-surface-2 px-2.5 text-sm text-fg outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-2 focus:ring-accent/20"
          : "mt-1 h-9 w-full border-0 border-b border-border-strong bg-transparent text-sm text-fg outline-none transition-[border-color] focus:border-accent"
      }
    />
  );
}

function Cards({
  values,
  set,
}: {
  values: Record<FieldKey, string>;
  set: (key: FieldKey, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 bg-surface-2/40">
      {FIELDS.map((field, i) => (
        <article key={field.key} className="rounded-xl border border-border bg-surface p-3.5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor={`card-${field.key}`} className="text-xs font-medium text-fg">
              {field.label} <span className="text-accent">*</span>
            </label>
            <span className="font-mono text-[0.65rem] text-fg-subtle">0{i + 1}</span>
          </div>
          <FieldInput
            id={`card-${field.key}`}
            boxed
            value={values[field.key]}
            placeholder={field.placeholder}
            onChange={(v) => set(field.key, v)}
          />
          <p className="mt-1.5 text-[0.65rem] text-fg-subtle">{field.hint}</p>
        </article>
      ))}
    </div>
  );
}

function Grouped({
  values,
  set,
  percent,
}: {
  values: Record<FieldKey, string>;
  set: (key: FieldKey, value: string) => void;
  percent: number;
}) {
  const basic = FIELDS.filter((f) => f.group === "基本信息");
  const work = FIELDS.filter((f) => f.group === "工作信息");

  return (
    <div className="px-5 py-6 sm:px-7 sm:py-7 bg-surface">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-medium tracking-wider text-accent uppercase">Account Setup</p>
          <h3 className="mt-1 text-lg font-bold text-fg">完善账号资料</h3>
        </div>
        <div className="w-40">
          <div className="mb-1 flex justify-between text-[0.65rem] text-fg-muted">
            <span>资料完成度</span>
            <span className="tabular-nums font-mono">{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </header>

      <section className="mt-6 border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-fg">基本信息</h4>
        <p className="mt-0.5 text-xs text-fg-subtle">用于全局账号识别与组织联系</p>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
          {basic.map((field) => (
            <div key={field.key}>
              <label htmlFor={`group-${field.key}`} className="text-xs font-medium text-fg-muted">
                {field.label} <span className="text-accent">*</span>
              </label>
              <FieldInput
                id={`group-${field.key}`}
                boxed={false}
                value={values[field.key]}
                placeholder={field.placeholder}
                onChange={(v) => set(field.key, v)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-fg">工作信息</h4>
        <p className="mt-0.5 text-xs text-fg-subtle">帮助系统匹配你的空间环境与协作角色</p>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
          {work.map((field) => (
            <div key={field.key}>
              <label htmlFor={`group-${field.key}`} className="text-xs font-medium text-fg-muted">
                {field.label} <span className="text-accent">*</span>
              </label>
              <FieldInput
                id={`group-${field.key}`}
                boxed={false}
                value={values[field.key]}
                placeholder={field.placeholder}
                onChange={(v) => set(field.key, v)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FormSectionsDemo({ mode }: { mode: GroupMode }) {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: "苏小明",
    email: "atlas@example.com",
    phone: "138 0000 2026",
    team: "Atlas Studio",
    role: "产品设计师",
    city: "上海",
  });

  const percent = useMemo(() => {
    const filled = FIELDS.filter((f) => values[f.key].trim().length > 0).length;
    return Math.round((filled / FIELDS.length) * 100);
  }, [values]);

  const set = (key: FieldKey, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="relative min-h-[380px]">
      <div
        className={`transition-opacity duration-200 ${
          mode === "cards" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        <Cards values={values} set={set} />
      </div>
      <div
        className={`transition-opacity duration-200 ${
          mode === "grouped" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      >
        <Grouped values={values} set={set} percent={percent} />
      </div>
    </div>
  );
}
