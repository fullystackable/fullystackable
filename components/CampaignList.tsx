import { deleteCampaign } from "@/app/actions/workspace";
import { CampaignEditForm } from "@/components/CampaignEditForm";
import { Badge, EmptyState } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import type { WorkspaceCampaign } from "@/lib/workspace-view";

type CampaignListProps = {
  campaigns: WorkspaceCampaign[];
  brandSlug?: string;
  allowDelete?: boolean;
  activeCampaignId?: string | null;
};

export function CampaignList({
  campaigns,
  brandSlug,
  allowDelete = false,
  activeCampaignId = null,
}: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="No campaigns yet"
        description="As launch initiatives and focused pushes are defined, they will show up here."
      />
    );
  }

  return (
    <div className="data-list">
      {campaigns.map((campaign) => (
        <article key={campaign.id} className="data-row">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-ink">{campaign.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {campaign.startDate ? formatShortDate(campaign.startDate) : "No start"}{" "}
                to {campaign.endDate ? formatShortDate(campaign.endDate) : "No end"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{campaign.status}</Badge>
              {activeCampaignId === campaign.id ? (
                <Badge tone="accent">Focused</Badge>
              ) : null}
              {allowDelete && brandSlug ? (
                <>
                  <CampaignEditForm campaign={campaign} brandSlug={brandSlug} />
                  <form action={deleteCampaign}>
                    <input type="hidden" name="campaignId" value={campaign.id} />
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
          {campaign.description ? (
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              {campaign.description}
            </p>
          ) : null}
          {campaign.goals.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {campaign.goals.map((goal) => (
                <Badge key={goal}>{goal}</Badge>
              ))}
            </div>
          ) : null}
          {campaign.notes ? (
            <p className="mt-3 text-sm leading-6 text-ink-muted">{campaign.notes}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
