import type { ReactNode } from "react";

import { Badge } from "@/components/ui";

type DashboardHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta?: ReactNode;
  action?: ReactNode;
};

export function DashboardHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  action,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-app-line pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        <Badge tone="info">{eyebrow}</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
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
