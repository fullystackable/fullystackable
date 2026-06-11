import type { ReactNode } from "react";

import type { BadgeTone } from "@/lib/design";

type CardProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

const badgeStyles: Record<BadgeTone, string> = {
  neutral: "border-app-line bg-app-soft text-ink-muted",
  sidebar: "border-white/10 bg-white/10 text-white",
  accent: "border-accent/15 bg-accent-soft text-accent",
  success: "border-success/15 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  danger: "border-danger/18 bg-danger-soft text-danger",
  info: "border-frost/45 bg-frost/30 text-ink",
};

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ children, className, id }: CardProps) {
  return (
    <section id={id} className={cx("app-card p-4 sm:p-5", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  compact = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cx(
        compact
          ? "flex flex-col gap-3 border-b border-app-line pb-4 sm:flex-row sm:items-end sm:justify-between"
          : "flex flex-col gap-4 border-b border-app-line pb-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cx(
            "font-semibold tracking-tight text-ink",
            compact ? "mt-1 text-lg sm:text-xl" : "mt-2 text-xl sm:text-2xl",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.02em]",
        badgeStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-dashed border-app-line bg-app-soft px-4 py-5",
        className,
      )}
    >
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
    </div>
  );
}
