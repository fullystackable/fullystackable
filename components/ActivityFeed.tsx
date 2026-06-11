import Link from "next/link";

import { Badge, EmptyState, cx } from "@/components/ui";
import type { ActivityFeedItem } from "@/lib/activity-log";

const ACTIVITY_TIMESTAMP_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type ActivityFeedProps = {
  items: ActivityFeedItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function ActivityFeed({
  items,
  emptyTitle = "No activity yet",
  emptyDescription = "As brands, tasks, assets, contacts, campaigns, and deadlines change, the feed will start building memory here.",
  className,
}: ActivityFeedProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cx("data-list", className)}>
      {items.map((item) => {
        const content = (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-ink">{item.title}</p>
                {item.subject ? (
                  <p className="mt-1 text-sm text-ink-muted">{item.subject}</p>
                ) : null}
              </div>
              <Badge>{ACTIVITY_TIMESTAMP_FORMATTER.format(new Date(item.createdAt))}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              {item.brandName ? <span>{item.brandName}</span> : null}
              {item.campaignTitle ? <span>| {item.campaignTitle}</span> : null}
            </div>
            {item.details ? (
              <p className="mt-3 text-sm leading-6 text-ink-muted">{item.details}</p>
            ) : null}
          </>
        );

        return item.href ? (
          <Link
            key={item.id}
            href={item.href}
            className="data-row block hover:border-app-line-strong hover:bg-app-surface"
          >
            {content}
          </Link>
        ) : (
          <article key={item.id} className="data-row">
            {content}
          </article>
        );
      })}
    </div>
  );
}
