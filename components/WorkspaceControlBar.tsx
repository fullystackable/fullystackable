import Link from "next/link";

import { Badge } from "@/components/ui";
import {
  buildWorkspaceResetHref,
  buildCampaignClearHref,
  type WorkspaceTab,
} from "@/lib/workspace-url-state";
import type {
  TaskViewFilter,
  WorkspaceCampaign,
  WorkspaceDensity,
} from "@/lib/workspace-view";

type TaskSortOption = "due_asc" | "priority_desc" | "status" | "title";
type AssetSortOption = "updated_desc" | "priority_desc" | "type" | "title";
type UpcomingSortOption = "date_asc" | "type" | "status" | "title";

type WorkspaceControlBarProps = {
  brandSlug: string;
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  activeCampaignId: string | null;
  activeCampaignTitle: string | null;
  taskSort: TaskSortOption;
  taskView: TaskViewFilter;
  assetSort: AssetSortOption;
  upcomingSort: UpcomingSortOption;
  density: WorkspaceDensity;
  hasCustomSettings: boolean;
  tasksCount: number;
  assetsCount: number;
  upcomingCount: number;
  activeTab: WorkspaceTab;
  hasInvalidCampaignFocus: boolean;
};

export function WorkspaceControlBar({
  brandSlug,
  campaigns,
  activeCampaignId,
  activeCampaignTitle,
  taskSort,
  taskView,
  assetSort,
  upcomingSort,
  density,
  hasCustomSettings,
  tasksCount,
  assetsCount,
  upcomingCount,
  activeTab,
  hasInvalidCampaignFocus,
}: WorkspaceControlBarProps) {
  return (
    <section className="app-card p-4">
      <div className="flex flex-col gap-3 border-b border-app-line pb-3.5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Workspace view
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink sm:text-[1.35rem]">
            Focus and sorting
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
            Filter the workspace without leaving the page. The current view stays encoded in the URL so refreshes and shared links stay stable.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{tasksCount} tasks</Badge>
          <Badge>{assetsCount} assets</Badge>
          <Badge>{upcomingCount} upcoming</Badge>
          {activeCampaignTitle ? (
            <Badge tone="accent">{activeCampaignTitle}</Badge>
          ) : null}
          {hasInvalidCampaignFocus ? (
            <Badge tone="warning">Focus removed</Badge>
          ) : null}
        </div>
      </div>

      <form
        action={`/brands/${brandSlug}`}
        className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        {activeTab !== "tasks" ? <input type="hidden" name="tab" value={activeTab} /> : null}

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Focus campaign</span>
          <select name="campaign" defaultValue={activeCampaignId ?? ""} className="app-input">
            <option value="">All campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Task sort</span>
          <select name="taskSort" defaultValue={taskSort} className="app-input">
            <option value="due_asc">Due date</option>
            <option value="priority_desc">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Task view</span>
          <select name="taskView" defaultValue={taskView} className="app-input">
            <option value="all">All tasks</option>
            <option value="incomplete">Incomplete only</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Asset sort</span>
          <select name="assetSort" defaultValue={assetSort} className="app-input">
            <option value="updated_desc">Recently updated</option>
            <option value="priority_desc">Priority</option>
            <option value="type">Type</option>
            <option value="title">Title</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Upcoming sort</span>
          <select name="upcomingSort" defaultValue={upcomingSort} className="app-input">
            <option value="date_asc">Date</option>
            <option value="type">Type</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Density</span>
          <select name="density" defaultValue={density} className="app-input">
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>

        <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:flex-wrap sm:items-end xl:col-span-3 2xl:col-span-6">
          <button
            type="submit"
            className="app-primary-button"
          >
            Apply view
          </button>
          {activeCampaignId ? (
            <Link
              href={buildCampaignClearHref(
                brandSlug,
                taskSort,
                taskView,
                assetSort,
                upcomingSort,
                density,
                activeTab,
              )}
              scroll={false}
              className="app-secondary-button"
            >
              Clear focus
            </Link>
          ) : null}
          {hasCustomSettings ? (
            <Link
              href={buildWorkspaceResetHref(brandSlug, activeCampaignId, activeTab)}
              scroll={false}
              className="app-secondary-button"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>
    </section>
  );
}
