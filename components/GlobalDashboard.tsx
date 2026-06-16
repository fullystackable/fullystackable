import Link from "next/link";

import { ActivityFeed } from "@/components/ActivityFeed";
import { BrandColorBadge } from "@/components/BrandColorBadge";
import { BrandReadinessSummary } from "@/components/BrandReadinessSummary";
import { DashboardHeader } from "@/components/DashboardHeader";
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
  buildCampaignWorkspaceHref,
  buildWorkspaceTaskHref,
  buildWorkspaceViewHref,
} from "@/lib/workspace-url-state";

type GlobalDashboardProps = {
  data: GlobalDashboardData;
};

export function GlobalDashboard({ data }: GlobalDashboardProps) {
  const todayLabel = formatWeekdayDate(data.todayLabel);
  const statCards = [
    {
      label: "Active brands",
      value: String(data.stats.activeBrands),
      helper: "Current brand workspaces in the portfolio.",
    },
    {
      label: "Due this week",
      value: String(data.stats.tasksDueThisWeek),
      helper: "Open tasks scheduled in the next seven days.",
    },
    {
      label: "Overdue tasks",
      value: String(data.stats.overdueTasks),
      helper: "Items that need attention before anything else.",
    },
    {
      label: "Upcoming items",
      value: String(data.stats.upcomingItems),
      helper: "Future launches, meetings, deadlines, and reminders.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Dashboard"
        title="Global portfolio view"
        subtitle={`As of ${todayLabel}, this dashboard gives you a single place to scan priorities, quick-access brands, deadlines, and recent workspace activity.`}
        meta={
          <>
            <Badge tone="info">{data.stats.activeBrands} active brands</Badge>
            <Badge>{data.stats.pinnedBrands} pinned</Badge>
            <Badge>{data.stats.overdueTasks} overdue</Badge>
          </>
        }
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/today"
              className="inline-flex items-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
            >
              Open today view
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
            >
              Open brand directory
            </Link>
            <a
              href="/api/export"
              className="inline-flex items-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
            >
              Download backup
            </a>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="h-full">
            <p className="text-sm font-medium text-ink-muted">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {card.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{card.helper}</p>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card id="daily-focus">
          <SectionHeader
            eyebrow="Focus"
            title="Daily focus"
            description="A tighter working view for today, the next three days, and the soonest upcoming moments."
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{todayLabel}</Badge>
                <Link
                  href="/today"
                  className="inline-flex items-center rounded-full border border-app-line px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-app-soft hover:text-ink"
                >
                  Open planner
                </Link>
              </div>
            }
          />
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <FocusColumn
              title="Due today"
              items={data.dueTodayTasks}
              emptyTitle="Nothing due today"
              emptyDescription="No open tasks are due today."
            />
            <FocusColumn
              title="Next 3 days"
              items={data.nextThreeDaysTasks}
              emptyTitle="Nothing due soon"
              emptyDescription="No open tasks are due in the next three days."
            />
            <UpcomingFocusColumn
              title="Upcoming soon"
              items={data.upcomingSoon}
              emptyTitle="Nothing upcoming soon"
              emptyDescription="No launches, meetings, or reminders are scheduled in the next three days."
            />
          </div>
        </Card>

        <Card id="pinned-brands">
          <SectionHeader
            eyebrow="Pinned"
            title="Pinned brands"
            description="Keep the brands you open most often close to the top of the day."
            action={<Badge>{data.pinnedBrands.length}</Badge>}
          />
          <div className="mt-6">
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="tasks">
          <SectionHeader
            eyebrow="Tasks"
            title="Overdue tasks"
            description="The tasks that are already late and need attention first."
            action={<Badge tone="danger">{data.overdueTasks.length}</Badge>}
          />
          <div className="mt-6">
            {data.overdueTasks.length > 0 ? (
              <div className="data-list">
                {data.overdueTasks.map((task) => (
                  <DashboardTaskItem key={task.id} task={task} overdue />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No overdue tasks"
                description="Nothing is currently late across active brand workspaces."
              />
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Tasks"
            title="Due this week"
            description="Open work scheduled within the next seven days."
            action={<Badge>{data.dueThisWeekTasks.length}</Badge>}
          />
          <div className="mt-6">
            {data.dueThisWeekTasks.length > 0 ? (
              <div className="data-list">
                {data.dueThisWeekTasks.map((task) => (
                  <DashboardTaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing due this week"
                description="No open tasks are scheduled in the next seven days."
              />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="upcoming">
          <SectionHeader
            eyebrow="Upcoming"
            title="Upcoming items"
            description="Future launches, meetings, deadlines, and reminders across all brands."
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{data.upcomingItems.length}</Badge>
                <Link
                  href="/calendar"
                  className="inline-flex items-center rounded-full border border-app-line px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-app-soft hover:text-ink"
                >
                  Open planner
                </Link>
              </div>
            }
          />
          <div className="mt-6">
            {data.upcomingItems.length > 0 ? (
              <div className="data-list">
                {data.upcomingItems.map((item) => (
                  <DashboardUpcomingItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming items"
                description="New brand moments will appear here as they are scheduled."
              />
            )}
          </div>
        </Card>

        <Card id="assets">
          <SectionHeader
            eyebrow="Assets"
            title="Recent assets"
            description="The most recently touched asset records across the portfolio."
            action={<Badge>{data.recentAssets.length}</Badge>}
          />
          <div className="mt-6">
            {data.recentAssets.length > 0 ? (
              <div className="data-list">
                {data.recentAssets.map((asset) => (
                  <DashboardAssetItem key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent assets"
                description="Asset records will appear here as brands add links, references, and files."
              />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="activity">
          <SectionHeader
            eyebrow="Activity"
            title="Recent activity"
            description="A running memory of what changed most recently across the workspace."
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{data.recentActivity.length}</Badge>
                <Link
                  href="/activity"
                  className="inline-flex items-center rounded-full border border-app-line px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-app-soft hover:text-ink"
                >
                  Open full log
                </Link>
              </div>
            }
          />
          <div className="mt-6">
            <ActivityFeed
              items={data.recentActivity}
              emptyDescription="As you create and update records, this feed will start remembering the sequence."
            />
          </div>
        </Card>

        <Card id="notes">
          <SectionHeader
            eyebrow="Notes"
            title="Recent notes"
            description="The latest written context added across brand workspaces."
            action={<Badge>{data.recentNotes.length}</Badge>}
          />
          <div className="mt-6">
            {data.recentNotes.length > 0 ? (
              <div className="data-list">
                {data.recentNotes.map((note) => (
                  <DashboardNoteItem key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent notes"
                description="Notes will appear here once you start capturing brand context."
              />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card id="campaigns">
          <SectionHeader
            eyebrow="Campaigns"
            title="Recent campaigns"
            description="The most recently scheduled campaign records currently in the workspace."
            action={<Badge>{data.recentCampaigns.length}</Badge>}
          />
          <div className="mt-6">
            {data.recentCampaigns.length > 0 ? (
              <div className="data-list">
                {data.recentCampaigns.map((campaign) => (
                  <DashboardCampaignItem key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent campaigns"
                description="Campaigns with dates will appear here once brands start planning launch windows."
              />
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Backup"
            title="Data confidence"
            description="This stays a daily-use system when it is easy to trust, easy to recover, and easy to move."
          />
          <div className="mt-6 space-y-4">
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Export whenever you want</p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Download a full JSON snapshot of brands, campaigns, tasks, contacts,
                assets, upcoming items, notes, and activity from the backup button above.
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
  emptyDescription: string;
}) {
  return (
    <div className="rounded-2xl border border-app-line bg-app-soft/55 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <Badge>{items.length}</Badge>
      </div>
      <div className="mt-4">
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
  emptyDescription: string;
}) {
  return (
    <div className="rounded-2xl border border-app-line bg-app-soft/55 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <Badge>{items.length}</Badge>
      </div>
      <div className="mt-4">
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
            <div className="mt-3 rounded-2xl border border-app-line bg-app-soft/55 px-3 py-3">
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
          className="inline-flex items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
        >
          Open
        </Link>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
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
    <article className={compact ? "rounded-2xl border border-app-line bg-white px-4 py-3" : "data-row"}>
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
    <article className={compact ? "rounded-2xl border border-app-line bg-white px-4 py-3" : "data-row"}>
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
