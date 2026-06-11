import type { TaskViewFilter, WorkspaceDensity } from "@/lib/workspace-view";

type TaskSortOption = "due_asc" | "priority_desc" | "status" | "title";
type AssetSortOption = "updated_desc" | "priority_desc" | "type" | "title";
type UpcomingSortOption = "date_asc" | "type" | "status" | "title";
export type WorkspaceTab =
  | "tasks"
  | "upcoming"
  | "assets"
  | "contacts"
  | "notes"
  | "profile";
export type CampaignWorkspaceTab = "overview" | "tasks" | "assets" | "deadlines";

type WorkspaceViewState = {
  activeCampaignId?: string | null;
  taskSort?: TaskSortOption;
  taskView?: TaskViewFilter;
  assetSort?: AssetSortOption;
  upcomingSort?: UpcomingSortOption;
  density?: WorkspaceDensity;
  tab?: WorkspaceTab;
  hash?: string;
};

type CampaignWorkspaceViewState = {
  tab?: CampaignWorkspaceTab;
  hash?: string;
};

function buildWorkspaceHref(
  brandSlug: string,
  params: URLSearchParams,
  hash?: string,
) {
  const query = params.toString();
  const baseHref = query ? `/brands/${brandSlug}?${query}` : `/brands/${brandSlug}`;

  return hash ? `${baseHref}${hash}` : baseHref;
}

export function buildWorkspaceViewHref(
  brandSlug: string,
  {
    activeCampaignId = null,
    taskSort = "due_asc",
    taskView = "all",
    assetSort = "updated_desc",
    upcomingSort = "date_asc",
    density = "comfortable",
    tab = "tasks",
    hash,
  }: WorkspaceViewState = {},
) {
  const params = new URLSearchParams();

  if (activeCampaignId) {
    params.set("campaign", activeCampaignId);
  }

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

  if (tab !== "tasks") {
    params.set("tab", tab);
  }

  return buildWorkspaceHref(brandSlug, params, hash);
}

export function buildWorkspaceResetHref(
  brandSlug: string,
  activeCampaignId: string | null,
  tab: WorkspaceTab = "tasks",
) {
  return buildWorkspaceViewHref(brandSlug, {
    activeCampaignId,
    tab,
  });
}

export function buildCampaignClearHref(
  brandSlug: string,
  taskSort: TaskSortOption,
  taskView: TaskViewFilter,
  assetSort: AssetSortOption,
  upcomingSort: UpcomingSortOption,
  density: WorkspaceDensity,
  tab: WorkspaceTab = "tasks",
) {
  return buildWorkspaceViewHref(brandSlug, {
    taskSort,
    taskView,
    assetSort,
    upcomingSort,
    density,
    tab,
  });
}

export function buildWorkspaceTaskHref(
  brandSlug: string,
  activeCampaignId: string | null,
) {
  return buildWorkspaceViewHref(brandSlug, {
    activeCampaignId,
    taskView: "incomplete",
    hash: "#tasks",
  });
}

export function buildCampaignWorkspaceHref(
  brandSlug: string,
  campaignId: string,
  {
    tab = "overview",
    hash,
  }: CampaignWorkspaceViewState = {},
) {
  const params = new URLSearchParams();

  if (tab !== "overview") {
    params.set("tab", tab);
  }

  const query = params.toString();
  const baseHref = query
    ? `/brands/${brandSlug}/campaigns/${campaignId}?${query}`
    : `/brands/${brandSlug}/campaigns/${campaignId}`;

  return hash ? `${baseHref}${hash}` : baseHref;
}
