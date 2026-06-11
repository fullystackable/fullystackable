import type { ReactNode } from "react";

import { Badge } from "@/components/ui";

type DashboardHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta?: ReactNode;
  action?: ReactNode;
  size?: "default" | "compact";
};

export function DashboardHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  action,
  size = "default",
}: DashboardHeaderProps) {
  const isCompact = size === "compact";

  return (
    <header
      className={`flex flex-col gap-5 border-b border-app-line pb-6 lg:flex-row lg:items-end lg:justify-between ${
        isCompact ? "mb-6" : "mb-8"
      }`}
    >
      <div className="min-w-0 max-w-3xl">
        <Badge tone="info">{eyebrow}</Badge>
        <h1
          className={`font-semibold tracking-tight text-ink ${
            isCompact
              ? "mt-3 text-2xl sm:text-3xl"
              : "mt-4 text-3xl sm:text-4xl"
          }`}
        >
          {title}
        </h1>
        <p
          className={`text-sm leading-7 text-ink-muted sm:text-base ${
            isCompact ? "mt-2" : "mt-3"
          }`}
        >
          {subtitle}
        </p>
        {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
      </div>
      {action ? (
        <div className="shrink-0 self-start lg:self-end">{action}</div>
      ) : null}
    </header>
  );
}
