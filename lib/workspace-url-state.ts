import type { TaskViewFilter, WorkspaceDensity } from "@/lib/workspace-view";

type TaskSortOption = "due_asc" | "priority_desc" | "status" | "title";
type AssetSortOption = "updated_desc" | "priority_desc" | "type" | "title";
type UpcomingSortOption = "date_asc" | "type" | "status" | "title";

export function buildWorkspaceResetHref(
  brandSlug: string,
  activeCampaignId: string | null,
) {
  const params = new URLSearchParams();

  if (activeCampaignId) {
    params.set("campaign", activeCampaignId);
  }

  const query = params.toString();
  return query ? `/brands/${brandSlug}?${query}` : `/brands/${brandSlug}`;
}

export function buildCampaignClearHref(
  brandSlug: string,
  taskSort: TaskSortOption,
  taskView: TaskViewFilter,
  assetSort: AssetSortOption,
  upcomingSort: UpcomingSortOption,
  density: WorkspaceDensity,
) {
  const params = new URLSearchParams();

  if (taskSort !== "due_asc") {
    params.set("taskSort", taskSort);
  }

  if (taskView !== "all") {
    params.set("taskView", taskView);
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
