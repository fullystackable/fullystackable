import { deleteUpcomingItem } from "@/app/actions/workspace";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { UpcomingEditForm } from "@/components/UpcomingEditForm";
import { Badge, EmptyState } from "@/components/ui";
import { formatWeekdayDate } from "@/lib/date";
import type {
  WorkspaceCampaign,
  WorkspaceUpcomingItem,
} from "@/lib/workspace-view";

type UpcomingListProps = {
  items: WorkspaceUpcomingItem[];
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  brandSlug?: string;
  allowDelete?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function UpcomingList({
  items,
  campaigns,
  brandSlug,
  allowDelete = false,
  emptyTitle = "Nothing upcoming",
  emptyDescription = "Future launches, meetings, and checkpoints will show up here as they are scheduled.",
}: UpcomingListProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="data-list">
      {items.map((item) => (
        <article key={item.id} className="data-row">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {formatWeekdayDate(item.date)} | {item.status}
              </p>
              {item.relatedCampaignTitle ? (
                <p className="mt-1 text-sm text-ink-muted">
                  Campaign: {item.relatedCampaignTitle}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge>{item.type}</Badge>
            </div>
          </div>
          {allowDelete && brandSlug ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
              <UpcomingEditForm
                item={item}
                brandSlug={brandSlug}
                campaigns={campaigns}
              />
              <form action={deleteUpcomingItem}>
                <input type="hidden" name="upcomingItemId" value={item.id} />
                <input type="hidden" name="brandSlug" value={brandSlug} />
                <ConfirmSubmitButton
                  idleLabel="Remove"
                  confirmLabel="Remove item"
                  confirmPrompt="Remove this item?"
                />
              </form>
            </div>
          ) : null}
          {item.notes ? (
            <p className="mt-3 text-sm leading-6 text-ink-muted">{item.notes}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
