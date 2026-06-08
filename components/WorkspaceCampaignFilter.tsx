import Link from "next/link";

import { Badge } from "@/components/ui";
import type { WorkspaceCampaign, WorkspaceDensity } from "@/lib/workspace-view";

type WorkspaceCampaignFilterProps = {
  brandSlug: string;
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  activeCampaignId: string | null;
  activeCampaignTitle: string | null;
  taskSort: "due_asc" | "priority_desc" | "status" | "title";
  assetSort: "updated_desc" | "priority_desc" | "type" | "title";
  upcomingSort: "date_asc" | "type" | "status" | "title";
  density: WorkspaceDensity;
  tasksCount: number;
  assetsCount: number;
  upcomingCount: number;
};

function buildClearHref(
  brandSlug: string,
  taskSort: "due_asc" | "priority_desc" | "status" | "title",
  assetSort: "updated_desc" | "priority_desc" | "type" | "title",
  upcomingSort: "date_asc" | "type" | "status" | "title",
  density: WorkspaceDensity,
) {
  const params = new URLSearchParams();

  if (taskSort !== "due_asc") {
    params.set("taskSort", taskSort);
  }

  if (assetSort !== "updated_desc") {
    params.set("assetSort", assetSort);
  }

  if (upcomingSort !== "date_asc") {
    params.set("upcomingSort", upcomingSort);
  }

  if (density !== "comfortable") {
    params.set("density", density);
  }

  const query = params.toString();
  return query ? `/brands/${brandSlug}?${query}` : `/brands/${brandSlug}`;
}

export function WorkspaceCampaignFilter({
  brandSlug,
  campaigns,
  activeCampaignId,
  activeCampaignTitle,
  taskSort,
  assetSort,
  upcomingSort,
  density,
  tasksCount,
  assetsCount,
  upcomingCount,
}: WorkspaceCampaignFilterProps) {
  if (campaigns.length === 0) {
    return null;
  }

  return (
    <section className="app-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-app-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Focus
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Campaign filter
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
            Narrow tasks, assets, and upcoming items to one initiative without losing
            the full campaign list.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{tasksCount} tasks</Badge>
          <Badge>{assetsCount} assets</Badge>
          <Badge>{upcomingCount} upcoming</Badge>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <form
          action={`/brands/${brandSlug}`}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
        >
          <input type="hidden" name="taskSort" value={taskSort} />
          <input type="hidden" name="assetSort" value={assetSort} />
          <input type="hidden" name="upcomingSort" value={upcomingSort} />
          <input type="hidden" name="density" value={density} />

          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Focus campaign</span>
            <select
              name="campaign"
              defaultValue={activeCampaignId ?? ""}
              className="app-input"
            >
              <option value="">All campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
            >
              Apply focus
            </button>
            {activeCampaignId ? (
              <Link
                href={buildClearHref(
                  brandSlug,
                  taskSort,
                  assetSort,
                  upcomingSort,
                  density,
                )}
                className="inline-flex items-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        <p className="text-sm text-ink-muted">
          {activeCampaignTitle
            ? `Currently focused on ${activeCampaignTitle}. New tasks, assets, and upcoming items will default to this campaign.`
            : "No campaign focus is active. Notes, contacts, and the campaign list always stay global to the brand."}
        </p>
      </div>
    </section>
  );
}
