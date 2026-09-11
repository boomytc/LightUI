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
  const isMain = Tag === "main";
  return (
    <Tag id={isMain ? "lab-main" : undefined} className={className ? `${base} ${className}` : base}>
      {children}
    </Tag>
  );
}
