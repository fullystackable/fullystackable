import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { deleteBrand } from "@/app/actions/workspace";
import { BrandColorBadge } from "@/components/BrandColorBadge";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { BrandWorkspace } from "@/components/BrandWorkspace";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Badge } from "@/components/ui";
import { getBrandWorkspaceBySlug } from "@/lib/brand-workspaces";
import { brandStatusTones } from "@/lib/design";
import type { WorkspaceTab } from "@/lib/workspace-url-state";
import type { TaskViewFilter, WorkspaceDensity } from "@/lib/workspace-view";

type TaskSortOption = "due_asc" | "priority_desc" | "status" | "title";
type AssetSortOption = "updated_desc" | "priority_desc" | "type" | "title";
type UpcomingSortOption = "date_asc" | "type" | "status" | "title";

type BrandPageProps = {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{
    campaign?: string;
    taskSort?: string;
    taskView?: string;
    assetSort?: string;
    upcomingSort?: string;
    density?: string;
    tab?: string;
  }>;
};

function normalizeTaskSort(value: string | undefined): TaskSortOption {
  switch (value) {
    case "priority_desc":
    case "status":
    case "title":
      return value;
    case "due_asc":
    default:
      return "due_asc";
  }
}

function normalizeAssetSort(value: string | undefined): AssetSortOption {
  switch (value) {
    case "priority_desc":
    case "type":
    case "title":
      return value;
    case "updated_desc":
    default:
      return "updated_desc";
  }
}

function normalizeUpcomingSort(value: string | undefined): UpcomingSortOption {
  switch (value) {
    case "type":
    case "status":
    case "title":
      return value;
    case "date_asc":
    default:
      return "date_asc";
  }
}

function normalizeDensity(value: string | undefined): WorkspaceDensity {
  switch (value) {
    case "compact":
      return "compact";
    case "comfortable":
    default:
      return "comfortable";
  }
}

function normalizeTaskView(value: string | undefined): TaskViewFilter {
  switch (value) {
    case "incomplete":
      return "incomplete";
    case "all":
    default:
      return "all";
  }
}

function normalizeWorkspaceTab(value: string | undefined): WorkspaceTab {
  switch (value) {
    case "upcoming":
    case "assets":
    case "contacts":
    case "notes":
    case "profile":
      return value;
    case "tasks":
    default:
      return "tasks";
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { brandId } = await params;
  const brand = await getBrandWorkspaceBySlug(brandId);

  if (!brand) {
    return {
      title: "Brand not found | Fullystackable",
    };
  }

  return {
    title: `${brand.name} | Fullystackable`,
    description: brand.description,
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { brandId } = await params;
  const resolvedSearchParams = await searchParams;
  const brand = await getBrandWorkspaceBySlug(brandId);

  if (!brand) {
    notFound();
  }

  const activeCampaign =
    brand.campaigns.find(
      (campaign) => campaign.id === resolvedSearchParams.campaign,
    ) ?? null;
  const hadInvalidCampaignFocus = Boolean(
    resolvedSearchParams.campaign && !activeCampaign,
  );
  const taskSort = normalizeTaskSort(resolvedSearchParams.taskSort);
  const taskView = normalizeTaskView(resolvedSearchParams.taskView);
  const assetSort = normalizeAssetSort(resolvedSearchParams.assetSort);
  const upcomingSort = normalizeUpcomingSort(resolvedSearchParams.upcomingSort);
  const density = normalizeDensity(resolvedSearchParams.density);
  const activeTab = normalizeWorkspaceTab(resolvedSearchParams.tab);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Workspace"
        title={brand.name}
        subtitle={brand.description}
        meta={
          <>
            <BrandColorBadge color={brand.brandColor} label="Calendar color" />
            <Badge tone={brandStatusTones[brand.status]}>{brand.status}</Badge>
          </>
        }
        action={
          <div className="flex flex-wrap gap-3">
            {brand.website ? (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
              >
                Visit website
              </a>
            ) : null}
            <form action={deleteBrand}>
              <input type="hidden" name="brandId" value={brand.id} />
              <ConfirmSubmitButton
                idleLabel="Delete brand"
                confirmLabel="Delete permanently"
                confirmPrompt="Delete this brand?"
              />
            </form>
          </div>
        }
      />
      <BrandWorkspace
        brand={brand}
        activeCampaignId={activeCampaign?.id ?? null}
        taskSort={taskSort}
        taskView={taskView}
        assetSort={assetSort}
        upcomingSort={upcomingSort}
        density={density}
        activeTab={activeTab}
        hadInvalidCampaignFocus={hadInvalidCampaignFocus}
      />
    </div>
  );
}
