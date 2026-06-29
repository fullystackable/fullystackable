import { Suspense } from "react";
import Link from "next/link";

import { ActivityFeed } from "@/components/ActivityFeed";
import { BrandColorBadge } from "@/components/BrandColorBadge";
import { BrandReadinessSummary } from "@/components/BrandReadinessSummary";
import { DashboardHeader } from "@/components/DashboardHeader";
import { GlobalSearchForm } from "@/components/GlobalSearchForm";
import { QuickLinksList } from "@/components/QuickLinksList";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";
import {
  formatShortDate,
  formatWeekdayDate,
  getRelativeDateLabel,
} from "@/lib/date";
import type {
  DashboardAssetWithBrand,
  DashboardCampaignWithBrand,
  DashboardPinnedBrand,
  DashboardTaskWithBrand,
  DashboardUpcomingWithBrand,
  GlobalDashboardData,
} from "@/lib/dashboard-data";
import { getDueDateTone, taskPriorityTones, taskStatusTones } from "@/lib/design";
import {
  exportProtectionEnvVarNames,
  getExportProtectionStatus,
} from "@/lib/export-auth";
import {
  buildCampaignWorkspaceHref,
  buildWorkspaceTaskHref,
  buildWorkspaceViewHref,
} from "@/lib/workspace-url-state";

type GlobalDashboardProps = {
  data: GlobalDashboardData;
};

export function GlobalDashboard({ data }: GlobalDashboardProps) {
  const exportProtection = getExportProtectionStatus();
  const isExportProtected = exportProtection.mode === "configured";
  const todayLabel = formatWeekdayDate(data.todayLabel);
  const statCards = [
    {
      label: "Active brands",
      value: String(data.stats.activeBrands),
    },
    {
      label: "Due this week",
      value: String(data.stats.tasksDueThisWeek),
    },
    {
      label: "Overdue tasks",
      value: String(data.stats.overdueTasks),
    },
    {
      label: "Upcoming items",
      value: String(data.stats.upcomingItems),
    },
  ];

  return (
    <div className="app-page-shell flex w-full flex-col">
      <DashboardHeader
        title="Global portfolio view"
        size="compact"
        meta={
          <>
            <Badge tone="info">{data.stats.activeBrands} active brands</Badge>
            <Badge>{data.stats.pinnedBrands} pinned</Badge>
            <Badge>{data.stats.overdueTasks} overdue</Badge>
          </>
        }
      />

      <section className="mb-5 flex flex-wrap items-center gap-3 border-b border-app-line pb-5">
        <div className="min-w-[min(100%,18rem)] flex-1 max-w-xl">
          <Suspense fallback={<div className="h-11 rounded-full border border-app-line bg-app-soft/80" />}>
            <GlobalSearchForm compact />
          </Suspense>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/today"
            className="app-secondary-button"
          >
            Open today view
          </Link>
          <Link
            href="/brands"
            className="app-primary-button"
          >
            Open brand directory
          </Link>
          {isExportProtected ? (
            <a
              href="/api/export"
              className="app-secondary-button"
            >
              Download protected backup
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="app-secondary-button-muted opacity-70"
            >
              Backup unavailable
            </span>
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="h-full">
            <p className="text-sm font-medium text-ink-muted">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-[2.4rem]">
              {card.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <Card id="daily-focus">
          <SectionHeader
            title="Daily focus"
            compact
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{todayLabel}</Badge>
                <Link
                  href="/today"
                  className="app-secondary-button text-xs"
                >
                  Open planner
                </Link>
              </div>
            }
          />
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            <FocusColumn
              title="Due today"
              items={data.dueTodayTasks}
              emptyTitle="Nothing due today"
            />
            <FocusColumn
              title="Next 3 days"
              items={data.nextThreeDaysTasks}
              emptyTitle="Nothing due soon"
            />
            <UpcomingFocusColumn
              title="Upcoming soon"
              items={data.upcomingSoon}
              emptyTitle="Nothing upcoming soon"
            />
          </div>
        </Card>

        <Card id="pinned-brands">
          <SectionHeader
            title="Pinned brands"
            compact
            action={<Badge>{data.pinnedBrands.length}</Badge>}
          />
          <div className="mt-4">
            {data.pinnedBrands.length > 0 ? (
              <div className="data-list">
                {data.pinnedBrands.map((brand) => (
                  <PinnedBrandRow key={brand.id} brand={brand} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No pinned brands yet"
                description="Pin your core daily brands from the directory or inside a workspace to keep them close at hand."
              />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="tasks">
          <SectionHeader
            title="Overdue tasks"
            compact
            action={<Badge tone="danger">{data.overdueTasks.length}</Badge>}
          />
          <div className="mt-4">
            {data.overdueTasks.length > 0 ? (
              <div className="data-list">
                {data.overdueTasks.map((task) => (
                  <DashboardTaskItem key={task.id} task={task} overdue />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No overdue tasks"
              />
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Due this week"
            compact
            action={<Badge>{data.dueThisWeekTasks.length}</Badge>}
          />
          <div className="mt-4">
            {data.dueThisWeekTasks.length > 0 ? (
              <div className="data-list">
                {data.dueThisWeekTasks.map((task) => (
                  <DashboardTaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing due this week"
              />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="upcoming">
          <SectionHeader
            title="Upcoming items"
            compact
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{data.upcomingItems.length}</Badge>
                <Link
                  href="/calendar"
                  className="app-secondary-button text-xs"
                >
                  Open planner
                </Link>
              </div>
            }
          />
          <div className="mt-4">
            {data.upcomingItems.length > 0 ? (
              <div className="data-list">
                {data.upcomingItems.map((item) => (
                  <DashboardUpcomingItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming items"
              />
            )}
          </div>
        </Card>

        <Card id="assets">
          <SectionHeader
            title="Recent assets"
            compact
            action={<Badge>{data.recentAssets.length}</Badge>}
          />
          <div className="mt-4">
            {data.recentAssets.length > 0 ? (
              <div className="data-list">
                {data.recentAssets.map((asset) => (
                  <DashboardAssetItem key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent assets"
              />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="activity">
          <SectionHeader
            title="Recent activity"
            compact
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{data.recentActivity.length}</Badge>
                <Link
                  href="/activity"
                  className="app-secondary-button text-xs"
                >
                  Open full log
                </Link>
              </div>
            }
          />
          <div className="mt-4">
            <ActivityFeed
              items={data.recentActivity}
              emptyDescription="As you create and update records, this feed will start remembering the sequence."
            />
          </div>
        </Card>

        <Card id="notes">
          <SectionHeader
            title="Recent notes"
            compact
            action={<Badge>{data.recentNotes.length}</Badge>}
          />
          <div className="mt-4">
            {data.recentNotes.length > 0 ? (
              <div className="data-list">
                {data.recentNotes.map((note) => (
                  <DashboardNoteItem key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent notes"
              />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="campaigns">
          <SectionHeader
            title="Recent campaigns"
            compact
            action={<Badge>{data.recentCampaigns.length}</Badge>}
          />
          <div className="mt-4">
            {data.recentCampaigns.length > 0 ? (
              <div className="data-list">
                {data.recentCampaigns.map((campaign) => (
                  <DashboardCampaignItem key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent campaigns"
              />
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Data confidence"
            compact
            action={
              <Badge tone={isExportProtected ? "success" : "warning"}>
                {isExportProtected ? "Protected by credentials" : "Needs setup"}
              </Badge>
            }
          />
          <div className="mt-4 space-y-3">
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">
                {isExportProtected ? "Export with a credential check" : "Backups are off until protected"}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {isExportProtected
                  ? "The backup endpoint now requires HTTP Basic auth before it returns the full workspace JSON. Your browser may prompt the first time you download from this device."
                  : `Set ${exportProtectionEnvVarNames.username} and ${exportProtectionEnvVarNames.password} on the server to re-enable protected backup downloads.`}
              </p>
            </div>
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Pin the brands that matter</p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Pinned brands and quick links keep the app biased toward your real
                daily work instead of treating every workspace equally.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function FocusColumn({
  title,
  items,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  items: DashboardTaskWithBrand[];
  emptyTitle: string;
  emptyDescription?: string;
}) {
  return (
    <div className="rounded-2xl border border-app-line bg-app-soft/90 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <Badge>{items.length}</Badge>
      </div>
      <div className="mt-3">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((task) => (
              <DashboardTaskItem key={task.id} task={task} compact />
            ))}
          </div>
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </div>
    </div>
  );
}

function UpcomingFocusColumn({
  title,
  items,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  items: DashboardUpcomingWithBrand[];
  emptyTitle: string;
  emptyDescription?: string;
}) {
  return (
    <div className="rounded-2xl border border-app-line bg-app-soft/90 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <Badge>{items.length}</Badge>
      </div>
      <div className="mt-3">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <DashboardUpcomingItem key={item.id} item={item} compact />
            ))}
          </div>
        ) : (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </div>
    </div>
  );
}

function PinnedBrandRow({ brand }: { brand: DashboardPinnedBrand }) {
  return (
    <article className="data-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/brands/${brand.slug}`}
            className="text-base font-semibold text-ink hover:text-accent"
          >
            {brand.name}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BrandColorBadge color={brand.brandColor} label={brand.status} size="xs" />
            <Badge>{brand.openTasksCount} open tasks</Badge>
            {brand.overdueTasksCount > 0 ? (
              <Badge tone="danger">{brand.overdueTasksCount} overdue</Badge>
            ) : null}
          </div>
          {brand.nextUpcoming ? (
            <p className="mt-3 text-sm text-ink-muted">
              Next up: {brand.nextUpcoming.title} on {formatWeekdayDate(brand.nextUpcoming.date)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">No upcoming item scheduled yet.</p>
          )}
          {brand.spotlightNote ? (
            <div className="mt-3 rounded-2xl border border-app-line bg-app-soft/90 px-3 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">Pinned note</Badge>
                <Badge>{brand.spotlightNote.category}</Badge>
              </div>
              {brand.spotlightNote.title ? (
                <p className="mt-3 text-sm font-semibold text-ink">
                  {brand.spotlightNote.title}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {brand.spotlightNote.text}
              </p>
            </div>
          ) : null}
        </div>
        <Link
          href={`/brands/${brand.slug}`}
          className="app-secondary-button"
        >
          Open
        </Link>
      </div>
      <div className="mt-4 grid gap-3 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <BrandReadinessSummary readiness={brand.readiness} compact />
        <QuickLinksList
          links={brand.quickLinks}
          compact
          emptyTitle="No quick links pinned yet"
          emptyDescription="Flag the URLs you open most often from this brand."
        />
      </div>
    </article>
  );
}

function DashboardTaskItem({
  task,
  overdue = false,
  compact = false,
}: {
  task: DashboardTaskWithBrand;
  overdue?: boolean;
  compact?: boolean;
}) {
  return (
    <article className={compact ? "rounded-2xl border border-app-line bg-app-surface px-4 py-3" : "data-row"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={buildWorkspaceTaskHref(task.brandSlug, task.relatedCampaignId)}
            className="text-base font-semibold text-ink hover:text-accent"
          >
            {task.title}
          </Link>
          <p className="mt-2 text-sm text-ink-muted">
            {task.brandName} | Due {formatWeekdayDate(task.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!compact ? (
            <Badge tone={taskStatusTones[task.status]}>{task.status}</Badge>
          ) : null}
          <Badge tone={taskPriorityTones[task.priority]}>{task.priority}</Badge>
          <Badge tone={overdue ? "danger" : getDueDateTone(task.daysUntilDue)}>
            {getRelativeDateLabel(task.dueDate)}
          </Badge>
        </div>
      </div>
    </article>
  );
}

function DashboardUpcomingItem({
  item,
  compact = false,
}: {
  item: DashboardUpcomingWithBrand;
  compact?: boolean;
}) {
  return (
    <article className={compact ? "rounded-2xl border border-app-line bg-app-surface px-4 py-3" : "data-row"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={buildWorkspaceViewHref(item.brandSlug, {
              tab: "upcoming",
              hash: "#upcoming",
            })}
            className="text-base font-semibold text-ink hover:text-accent"
          >
            {item.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BrandColorBadge color={item.brandColor} label={item.brandName} size="xs" />
            <p className="text-sm text-ink-muted">{formatWeekdayDate(item.date)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!compact ? <Badge>{item.type}</Badge> : null}
          <Badge>{getRelativeDateLabel(item.date)}</Badge>
        </div>
      </div>
    </article>
  );
}

function DashboardAssetItem({ asset }: { asset: DashboardAssetWithBrand }) {
  return (
    <article className="data-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={buildWorkspaceViewHref(asset.brandSlug, {
              tab: "assets",
              hash: "#assets",
            })}
            className="text-base font-semibold text-ink hover:text-accent"
          >
            {asset.title}
          </Link>
          <p className="mt-2 text-sm text-ink-muted">
            {asset.brandName} | Updated {formatShortDate(asset.updatedAt)}
          </p>
        </div>
        <Badge>{asset.type}</Badge>
      </div>
    </article>
  );
}

function DashboardNoteItem({ note }: { note: GlobalDashboardData["recentNotes"][number] }) {
  const noteHref = note.brandSlug
    ? buildWorkspaceViewHref(note.brandSlug, {
        tab: "notes",
        hash: "#notes",
      })
    : "/brands";

  return (
    <article className="data-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={noteHref}
            className="text-base font-semibold text-ink hover:text-accent"
          >
            {note.title ?? note.brandName ?? "Working note"}
          </Link>
          <p className="mt-2 text-sm text-ink-muted">
            {note.brandName} | {formatShortDate(note.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {note.pinned ? <Badge tone="accent">Pinned</Badge> : null}
          <Badge>{note.category}</Badge>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{note.text}</p>
    </article>
  );
}

function DashboardCampaignItem({
  campaign,
}: {
  campaign: DashboardCampaignWithBrand;
}) {
  return (
    <article className="data-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={buildCampaignWorkspaceHref(campaign.brandSlug, campaign.id)}
            className="text-base font-semibold text-ink hover:text-accent"
          >
            {campaign.title}
          </Link>
          <p className="mt-2 text-sm text-ink-muted">
            {campaign.brandName} |{" "}
            {campaign.startDate
              ? `Starts ${formatShortDate(campaign.startDate)}`
              : "No start date"}
          </p>
        </div>
        <Badge>{campaign.status}</Badge>
      </div>
    </article>
  );
}
