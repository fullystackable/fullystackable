import type { ReactNode } from "react";

import { BrandColorBadge } from "@/components/BrandColorBadge";
import { BrandReadinessSummary } from "@/components/BrandReadinessSummary";
import { QuickLinksList } from "@/components/QuickLinksList";
import { Badge, Card, SectionHeader } from "@/components/ui";
import {
  compareDateStrings,
  differenceInCalendarDays,
  formatShortDate,
  formatWeekdayDate,
  getRelativeDateLabel,
} from "@/lib/date";
import { brandStatusTones, getDueDateTone } from "@/lib/design";
import {
  isTaskIncompleteStatus,
  type BrandWorkspaceData,
  type WorkspaceCampaign,
  type WorkspaceContact,
  type WorkspaceNote,
  type WorkspaceUpcomingItem,
} from "@/lib/workspace-view";

type BrandSnapshotPanelProps = {
  brand: BrandWorkspaceData;
};

type SnapshotActivity =
  | {
      kind: "note";
      title: string;
      detail: string;
      date: string;
    }
  | {
      kind: "campaign";
      title: string;
      detail: string;
      date: string | null;
    }
  | null;

export function BrandSnapshotPanel({ brand }: BrandSnapshotPanelProps) {
  const primaryContact = getPrimaryContact(brand.contacts);
  const activeCampaignsCount = getActiveCampaignCount(brand.campaigns);
  const openTasksCount = getOpenTaskCount(brand.tasks);
  const overdueTasksCount = getOverdueTaskCount(brand.tasks);
  const nextUpcomingItem = getNextUpcomingItem(brand.upcoming);
  const recentActivity = getRecentActivity(brand.notes, brand.campaigns);

  return (
    <Card>
      <SectionHeader
        eyebrow="Snapshot"
        title="Brand snapshot"
        description="A quick operating read on the brand's current status, work volume, setup health, and latest movement."
        compact
        action={
          <div className="flex flex-wrap gap-2">
            <BrandColorBadge color={brand.brandColor} label="Workspace color" />
            <Badge tone={brandStatusTones[brand.status]}>{brand.status}</Badge>
          </div>
        }
      />

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MetricTile label="Active campaigns" value={String(activeCampaignsCount)} />
        <MetricTile label="Open tasks" value={String(openTasksCount)} />
        <MetricTile
          label="Overdue tasks"
          value={String(overdueTasksCount)}
          tone={overdueTasksCount > 0 ? "text-danger" : undefined}
        />
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        <InfoTile label="Website">
          {brand.website ? (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-0 break-all text-sm font-medium text-accent hover:text-app-sidebar"
            >
              {brand.website}
            </a>
          ) : (
            <p className="text-sm text-ink-muted">No website added</p>
          )}
        </InfoTile>

        <InfoTile label="Workspace color">
          <BrandColorBadge color={brand.brandColor} label={brand.brandColor} />
        </InfoTile>

        <InfoTile label="Primary contact">
          {primaryContact ? (
            <>
              <p className="text-sm font-semibold text-ink">{primaryContact.name}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {[primaryContact.role, primaryContact.company]
                  .filter(Boolean)
                  .join(" | ") || primaryContact.contactType}
              </p>
              {primaryContact.email ? (
                <a
                  href={`mailto:${primaryContact.email}`}
                  className="mt-2 inline-flex text-sm font-medium text-accent hover:text-app-sidebar"
                >
                  {primaryContact.email}
                </a>
              ) : primaryContact.phone ? (
                <p className="mt-2 text-sm text-ink-muted">{primaryContact.phone}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-ink-muted">No contact added yet</p>
          )}
        </InfoTile>

        <InfoTile label="Next upcoming item">
          {nextUpcomingItem ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink">{nextUpcomingItem.title}</p>
                <Badge tone={getDueDateTone(differenceInCalendarDays(nextUpcomingItem.date))}>
                  {getRelativeDateLabel(nextUpcomingItem.date)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {formatWeekdayDate(nextUpcomingItem.date)} | {nextUpcomingItem.type}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-muted">Nothing upcoming yet</p>
          )}
        </InfoTile>

        <InfoTile label="Latest activity">
          {recentActivity ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink">{recentActivity.title}</p>
                <Badge>{recentActivity.kind === "note" ? "Note" : "Campaign"}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{recentActivity.detail}</p>
              {recentActivity.date ? (
                <p className="mt-2 text-sm text-ink-muted">
                  {formatShortDate(recentActivity.date)}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-ink-muted">No recent note or campaign activity</p>
          )}
        </InfoTile>

        <InfoTile label="Workspace readiness">
          <BrandReadinessSummary readiness={brand.readiness} compact />
        </InfoTile>

        <InfoTile label="Quick links">
          <QuickLinksList
            links={brand.quickLinks}
            compact
            emptyTitle="No quick links yet"
            emptyDescription="Pin the URLs you open most often from the assets section."
          />
        </InfoTile>
      </div>
    </Card>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="metric-tile">
      <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className={`mt-2.5 text-2xl font-semibold ${tone ?? "text-ink"}`}>{value}</p>
    </div>
  );
}

function InfoTile({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-app-line bg-app-soft/90 px-4 py-3.5">
      <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function getPrimaryContact(contacts: WorkspaceContact[]) {
  return (
    contacts.find((contact) => contact.contactTypeValue === "owner") ?? contacts[0] ?? null
  );
}

function getActiveCampaignCount(campaigns: WorkspaceCampaign[]) {
  return campaigns.filter((campaign) => campaign.statusValue === "active").length;
}

function getOpenTaskCount(tasks: BrandWorkspaceData["tasks"]) {
  return tasks.filter((task) => isTaskIncompleteStatus(task.statusValue)).length;
}

function getOverdueTaskCount(tasks: BrandWorkspaceData["tasks"]) {
  return tasks.filter(
    (task) =>
      task.dueDate &&
      isTaskIncompleteStatus(task.statusValue) &&
      differenceInCalendarDays(task.dueDate) < 0,
  ).length;
}

function getNextUpcomingItem(items: WorkspaceUpcomingItem[]) {
  return items
    .filter(
      (item) =>
        item.statusValue !== "completed" &&
        item.statusValue !== "canceled" &&
        differenceInCalendarDays(item.date) >= 0,
    )
    .sort((left, right) => compareDateStrings(left.date, right.date))[0] ?? null;
}

function getRecentActivity(
  notes: WorkspaceNote[],
  campaigns: WorkspaceCampaign[],
): SnapshotActivity {
  const latestNote = notes[0] ?? null;
  const latestCampaign = getLatestCampaign(campaigns);

  if (latestNote && latestCampaign?.date) {
    return compareDateStrings(latestNote.createdAt, latestCampaign.date) >= 0
      ? {
          kind: "note",
          title: latestNote.title ?? "Working note",
          detail: truncateText(latestNote.text, 120),
          date: latestNote.createdAt,
        }
      : latestCampaign;
  }

  if (latestNote) {
    return {
      kind: "note",
      title: latestNote.title ?? "Working note",
      detail: truncateText(latestNote.text, 120),
      date: latestNote.createdAt,
    };
  }

  return latestCampaign;
}

function getLatestCampaign(campaigns: WorkspaceCampaign[]): SnapshotActivity {
  const datedCampaigns = campaigns
    .map((campaign) => ({
      campaign,
      date: campaign.endDate ?? campaign.startDate,
    }))
    .filter((entry): entry is { campaign: WorkspaceCampaign; date: string } => Boolean(entry.date))
    .sort((left, right) => compareDateStrings(right.date, left.date));

  const latestCampaign = datedCampaigns[0]?.campaign;
  const latestCampaignDate = datedCampaigns[0]?.date ?? null;

  if (!latestCampaign) {
    return null;
  }

  return {
    kind: "campaign",
    title: latestCampaign.title,
    detail: latestCampaign.description ?? latestCampaign.status,
    date: latestCampaignDate,
  };
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}\u2026`;
}
