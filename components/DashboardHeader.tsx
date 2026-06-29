import type { ReactNode } from "react";

import { Badge } from "@/components/ui";

type DashboardHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
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
      className={`flex flex-col gap-4 border-b border-app-line pb-5 lg:flex-row lg:items-end lg:justify-between ${
        isCompact ? "mb-5" : "mb-6"
      }`}
    >
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? <Badge tone="info">{eyebrow}</Badge> : null}
        <h1
          className={`font-semibold tracking-tight text-ink ${
            isCompact
              ? eyebrow
                ? "mt-3 text-2xl sm:text-[2rem]"
                : "text-2xl sm:text-[2rem]"
              : eyebrow
                ? "mt-4 text-[2rem] sm:text-[2.6rem]"
                : "text-[2rem] sm:text-[2.6rem]"
          }`}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={`text-sm leading-6 text-ink-muted sm:text-base ${
              isCompact ? "mt-2" : "mt-3"
            }`}
          >
            {subtitle}
          </p>
        ) : null}
        {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
      </div>
      {action ? (
        <div className="w-full self-start lg:w-auto lg:shrink-0 lg:self-end">{action}</div>
      ) : null}
    </header>
  );
}
