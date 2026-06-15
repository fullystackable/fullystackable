import Link from "next/link";

import { ActivityFeed } from "@/components/ActivityFeed";
import { BrandColorBadge } from "@/components/BrandColorBadge";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";
import {
  formatShortDate,
  formatWeekdayDate,
  getRelativeDateLabel,
} from "@/lib/date";
import type {
  DashboardAssetWithBrand,
  DashboardCampaignWithBrand,
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
      helper: "Currently active brand workspaces in the portfolio.",
    },
    {
      label: "Due this week",
      value: String(data.stats.tasksDueThisWeek),
      helper: "Open tasks due in the next seven days across all brands.",
    },
    {
      label: "Overdue tasks",
      value: String(data.stats.overdueTasks),
      helper: "Open tasks that need follow-up immediately.",
    },
    {
      label: "Upcoming items",
      value: String(data.stats.upcomingItems),
      helper: "Future meetings, launches, deadlines, and reminders.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Dashboard"
        title="Global portfolio view"
        subtitle={`As of ${todayLabel}, this dashboard gives you a single place to scan brand load, deadlines, upcoming moments, and the latest workspace activity.`}
        meta={
          <>
            <Badge tone="info">{data.stats.activeBrands} active brands</Badge>
            <Badge>{data.stats.overdueTasks} overdue</Badge>
          </>
        }
        action={
          <Link
            href="/brands"
            className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
          >
            Open brand directory
          </Link>
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
                description="Notes will appear here once teams start capturing brand context."
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
            eyebrow="Memory"
            title="Why this helps"
            description="Activity history makes solo workflows easier to trust because the app can show what changed and in what order."
          />
          <div className="mt-6">
            <div className="space-y-4">
              <div className="app-subtle-card p-4">
                <p className="text-sm font-semibold text-ink">Debug faster</p>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  When something looks off, the feed shows whether a task, contact,
                  asset, campaign, deadline, or brand record changed recently.
                </p>
              </div>
              <div className="app-subtle-card p-4">
                <p className="text-sm font-semibold text-ink">Keep context</p>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Even if you are the only user, the activity log gives the app a
                  lightweight memory of recent operations.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function DashboardTaskItem({
  task,
  overdue = false,
}: {
  task: DashboardTaskWithBrand;
  overdue?: boolean;
}) {
  return (
    <article className="data-row">
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
          <Badge tone={taskStatusTones[task.status]}>{task.status}</Badge>
          <Badge tone={taskPriorityTones[task.priority]}>{task.priority}</Badge>
          <Badge tone={overdue ? "danger" : getDueDateTone(task.daysUntilDue)}>
            {getRelativeDateLabel(task.dueDate)}
          </Badge>
        </div>
      </div>
    </article>
  );
}

function DashboardUpcomingItem({ item }: { item: DashboardUpcomingWithBrand }) {
  return (
    <article className="data-row">
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
          <Badge>{item.type}</Badge>
          <Badge>{item.status}</Badge>
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
        <Badge>{note.category}</Badge>
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
