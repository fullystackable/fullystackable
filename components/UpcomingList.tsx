import { deleteUpcomingItem } from "@/app/actions/workspace";
import { UpcomingEditForm } from "@/components/UpcomingEditForm";
import { Badge, EmptyState } from "@/components/ui";
import { formatWeekdayDate } from "@/lib/date";
import type { WorkspaceUpcomingItem } from "@/lib/workspace-view";

type UpcomingListProps = {
  items: WorkspaceUpcomingItem[];
  brandSlug?: string;
  allowDelete?: boolean;
};

export function UpcomingList({
  items,
  brandSlug,
  allowDelete = false,
}: UpcomingListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing upcoming"
        description="Future launches, meetings, and checkpoints will show up here as they are scheduled."
      />
    );
  }

  return (
    <div className="data-list">
      {items.map((item) => (
        <article key={item.id} className="data-row">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {formatWeekdayDate(item.date)} | {item.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{item.type}</Badge>
              {allowDelete && brandSlug ? (
                <>
                  <UpcomingEditForm item={item} brandSlug={brandSlug} />
                  <form action={deleteUpcomingItem}>
                    <input type="hidden" name="upcomingItemId" value={item.id} />
                    <input type="hidden" name="brandSlug" value={brandSlug} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-danger hover:opacity-80"
                    >
                      Remove
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
          {item.notes ? (
            <p className="mt-3 text-sm leading-6 text-ink-muted">{item.notes}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
