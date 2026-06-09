import Link from "next/link";

import { buildWorkspaceResetHref } from "@/lib/workspace-url-state";
import type { TaskViewFilter, WorkspaceDensity } from "@/lib/workspace-view";

type TaskSortOption = "due_asc" | "priority_desc" | "status" | "title";
type AssetSortOption = "updated_desc" | "priority_desc" | "type" | "title";
type UpcomingSortOption = "date_asc" | "type" | "status" | "title";

type WorkspaceSortControlsProps = {
  brandSlug: string;
  activeCampaignId: string | null;
  taskSort: TaskSortOption;
  taskView: TaskViewFilter;
  assetSort: AssetSortOption;
  upcomingSort: UpcomingSortOption;
  density: WorkspaceDensity;
  hasCustomSettings: boolean;
};

export function WorkspaceSortControls({
  brandSlug,
  activeCampaignId,
  taskSort,
  taskView,
  assetSort,
  upcomingSort,
  density,
  hasCustomSettings,
}: WorkspaceSortControlsProps) {
  return (
    <section className="app-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-app-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Ordering
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Workspace sorting
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
            Change how tasks, assets, and upcoming items are ordered while keeping the
            current campaign focus in place.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <form
          action={`/brands/${brandSlug}`}
          className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          {activeCampaignId ? (
            <input type="hidden" name="campaign" value={activeCampaignId} />
          ) : null}

          <label className="space-y-2 xl:col-span-2">
            <span className="text-sm font-medium text-ink">Tasks</span>
            <div className="grid gap-4 md:grid-cols-2">
              <select
                name="taskSort"
                aria-label="Task sort"
                defaultValue={taskSort}
                className="app-input"
              >
                <option value="due_asc">Due date</option>
                <option value="priority_desc">Priority</option>
                <option value="status">Status</option>
                <option value="title">Title</option>
              </select>
              <select
                name="taskView"
                aria-label="Task view"
                defaultValue={taskView}
                className="app-input"
              >
                <option value="all">All tasks</option>
                <option value="incomplete">Incomplete only</option>
              </select>
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Assets</span>
            <select name="assetSort" defaultValue={assetSort} className="app-input">
              <option value="updated_desc">Recently updated</option>
              <option value="priority_desc">Priority</option>
              <option value="type">Type</option>
              <option value="title">Title</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Upcoming</span>
            <select
              name="upcomingSort"
              defaultValue={upcomingSort}
              className="app-input"
            >
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

          <div className="flex flex-wrap items-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
            >
              Apply view
            </button>
            {hasCustomSettings ? (
              <Link
                href={buildWorkspaceResetHref(brandSlug, activeCampaignId)}
                className="inline-flex items-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
