import Link from "next/link";

import { deleteCampaign } from "@/app/actions/workspace";
import { CampaignEditForm } from "@/components/CampaignEditForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { Badge, EmptyState } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import { buildCampaignWorkspaceHref } from "@/lib/workspace-url-state";
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
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">
                {brandSlug ? (
                  <Link
                    href={buildCampaignWorkspaceHref(brandSlug, campaign.id)}
                    className="hover:text-accent"
                  >
                    {campaign.title}
                  </Link>
                ) : (
                  campaign.title
                )}
              </h3>
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
            </div>
          </div>
          {allowDelete && brandSlug ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
              <Link
                href={buildCampaignWorkspaceHref(brandSlug, campaign.id)}
                className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
              >
                Open
              </Link>
              <CampaignEditForm campaign={campaign} brandSlug={brandSlug} />
              <form action={deleteCampaign}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="brandSlug" value={brandSlug} />
                <ConfirmSubmitButton
                  idleLabel="Remove"
                  confirmLabel="Remove campaign"
                  confirmPrompt="Remove this campaign?"
                />
              </form>
            </div>
          ) : null}
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
