import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandColorBadge } from "@/components/BrandColorBadge";
import { CampaignWorkspace } from "@/components/CampaignWorkspace";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Badge } from "@/components/ui";
import { getCampaignWorkspaceById } from "@/lib/campaign-workspaces";
import { formatShortDate } from "@/lib/date";
import {
  buildWorkspaceViewHref,
  type CampaignWorkspaceTab,
} from "@/lib/workspace-url-state";

type CampaignPageProps = {
  params: Promise<{ brandId: string; campaignId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function normalizeCampaignTab(value: string | undefined): CampaignWorkspaceTab {
  switch (value) {
    case "tasks":
    case "assets":
    case "deadlines":
      return value;
    case "overview":
    default:
      return "overview";
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  const { brandId, campaignId } = await params;
  const campaign = await getCampaignWorkspaceById(brandId, campaignId);

  if (!campaign) {
    return {
      title: "Campaign not found | Fullystackable",
    };
  }

  return {
    title: `${campaign.title} | ${campaign.brandName} | Fullystackable`,
    description:
      campaign.description ??
      `Mini workspace for the ${campaign.title} campaign.`,
  };
}

export default async function CampaignPage({
  params,
  searchParams,
}: CampaignPageProps) {
  const { brandId, campaignId } = await params;
  const resolvedSearchParams = await searchParams;
  const campaign = await getCampaignWorkspaceById(brandId, campaignId);

  if (!campaign) {
    notFound();
  }

  const activeTab = normalizeCampaignTab(resolvedSearchParams.tab);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Campaign"
        title={campaign.title}
        subtitle={
          campaign.description ??
          "This campaign workspace keeps the brief, execution layer, deadlines, and wrap-up notes together."
        }
        meta={
          <>
            <BrandColorBadge color={campaign.brandColor} label={campaign.brandName} />
            <Badge>{campaign.status}</Badge>
            {campaign.launchDate ? (
              <Badge>Launch {formatShortDate(campaign.launchDate)}</Badge>
            ) : null}
          </>
        }
        action={
          <Link
            href={buildWorkspaceViewHref(campaign.brandSlug, {
              activeCampaignId: campaign.id,
              hash: "#campaigns",
            })}
            className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
          >
            Back to brand workspace
          </Link>
        }
        size="compact"
      />

      <CampaignWorkspace campaign={campaign} activeTab={activeTab} />
    </div>
  );
}
