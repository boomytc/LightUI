import type { ElementType, ReactNode } from "react";

export function Page({
  as: Tag = "div",
  children,
  className,
  measure = "wide",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  measure?: "wide" | "prose";
}) {
  const base = measure === "prose" ? "page-prose" : "page-width";
  return <Tag className={className ? `${base} ${className}` : base}>{children}</Tag>;
}
