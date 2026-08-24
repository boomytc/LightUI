import type { ReactNode } from "react";
import { navigate } from "../lib/nav";

export function Link({
  href,
  className,
  children,
  ariaCurrent,
  title,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaCurrent?: "page" | undefined;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      className={className}
      title={title}
      aria-current={ariaCurrent}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
