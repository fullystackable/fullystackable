import Link from "next/link";

import { DashboardHeader } from "@/components/DashboardHeader";
import { NotesPanel } from "@/components/NotesPanel";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";
import {
  formatShortDate,
  formatWeekdayDate,
  getRelativeDateLabel,
} from "@/lib/date";
import {
  getDashboardPageData,
  type DashboardBrandHealthRow,
  type DashboardTaskWithBrand,
  type DashboardUpcomingWithBrand,
} from "@/lib/dashboard-data";
import {
  brandStatusTones,
  getDueDateTone,
  taskPriorityTones,
  taskStatusTones,
} from "@/lib/design";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardPageData();
  const todayLabel = formatWeekdayDate(data.todayLabel);
  const { stats, todaysFocus, thisWeek, brandHealth, recentNotes } = data;

  const statCards = [
    {
      label: "Attention now",
      value: String(stats.attentionNow),
      helper: "Tasks and milestones due today or already late.",
    },
    {
      label: "Due this week",
      value: String(stats.thisWeek),
      helper: "Open tasks and upcoming moments inside the next 7 days.",
    },
    {
      label: "High-priority tasks",
      value: String(stats.urgentTasks),
      helper: "Open high-priority work across the portfolio.",
    },
    {
      label: "Most urgent brand",
      value: stats.mostUrgentBrand?.brandName ?? "None",
      helper: stats.mostUrgentBrand
        ? `${stats.mostUrgentBrand.attentionNow} items need quick follow-up.`
        : "No urgent work is currently flagged.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Operations"
        title="Today and this week"
        subtitle={`As of ${todayLabel}, this command view highlights what needs attention now, what is due soon, and which brands need the fastest follow-up.`}
        meta={
          <>
            <Badge tone="info">{stats.activeBrands} active brands</Badge>
            <Badge>{stats.openTasks} open tasks</Badge>
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <Card id="tasks">
          <SectionHeader
            eyebrow="Today"
            title="Today's focus"
            description="The most urgent work across all brands, sorted by due date, priority, and brand pressure."
          />
          <div className="mt-6">
            {todaysFocus.length > 0 ? (
              <div className="data-list">
                {todaysFocus.map((task) => (
                  <TodayFocusItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing urgent today"
                description="When tasks become due or urgent, they will surface here first."
              />
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Snapshot"
            title="Brand health"
            description="A quick scan of open work, urgent load, and upcoming moments for each brand."
          />
          <div className="mt-6">
            {brandHealth.length > 0 ? (
              <div className="data-list">
                {brandHealth.map((brand, index) => (
                  <BrandHealthItem
                    key={brand.brandId}
                    brand={brand}
                    isTopPriority={index === 0}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No brand health data"
                description="Brand summaries will appear here as workspaces are added."
              />
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card id="upcoming">
          <SectionHeader
            eyebrow="This week"
            title="Upcoming tasks and moments"
            description="Everything landing in the next seven days, grouped by work items and calendar moments."
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ThisWeekColumn
              label="Tasks"
              count={thisWeek.tasks.length}
              emptyLabel="No open tasks due in the next 7 days."
            >
              {thisWeek.tasks.map((task) => (
                <ThisWeekTaskItem key={task.id} task={task} />
              ))}
            </ThisWeekColumn>
            <ThisWeekColumn
              label="Upcoming"
              count={thisWeek.upcoming.length}
              emptyLabel="No meetings, launches, or deadlines scheduled this week."
              withDivider
            >
              {thisWeek.upcoming.map((item) => (
                <ThisWeekUpcomingItem key={item.id} item={item} />
              ))}
            </ThisWeekColumn>
          </div>
        </Card>

        <NotesPanel
          id="notes"
          title="Quick notes"
          description="Recent reminders pulled from brand workspaces so context stays close to execution."
          notes={recentNotes}
          showBrandLink
        />
      </section>
    </div>
  );
}

function TodayFocusItem({ task }: { task: DashboardTaskWithBrand }) {
  return (
    <article className="data-row">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/brands/${task.brandSlug}`}
              className="inline-flex items-center rounded-full border border-app-line bg-white px-3 py-1 text-xs font-semibold text-ink-muted hover:text-ink"
            >
              {task.brandName}
            </Link>
            <Badge tone={taskStatusTones[task.status]}>{task.status}</Badge>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-ink">{task.title}</h3>
          <p className="mt-2 text-sm text-ink-muted">
            Due {formatWeekdayDate(task.dueDate)} | {task.priority} priority
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone={taskPriorityTones[task.priority]}>{task.priority}</Badge>
          <Badge tone={getDueDateTone(task.daysUntilDue)}>
            {getRelativeDateLabel(task.dueDate)}
          </Badge>
        </div>
      </div>
    </article>
  );
}

function BrandHealthItem({
  brand,
  isTopPriority,
}: {
  brand: DashboardBrandHealthRow;
  isTopPriority: boolean;
}) {
  return (
    <article className="data-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/brands/${brand.brandSlug}`}
              className="text-base font-semibold text-ink hover:text-accent"
            >
              {brand.brandName}
            </Link>
            {isTopPriority ? <Badge tone="warning">Most urgent</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            {brand.nextDate
              ? `Next key date ${formatShortDate(brand.nextDate)}`
              : "No upcoming deadlines"}
          </p>
        </div>
        <Badge tone={brandStatusTones[brand.status]}>{brand.status}</Badge>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-app-line pt-4">
        <MetricMini label="Open" value={brand.openTasks} />
        <MetricMini label="Urgent" value={brand.urgentTasks} />
        <MetricMini label="Upcoming" value={brand.upcomingItems} />
      </dl>
    </article>
  );
}

function MetricMini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-ink-muted">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-ink">{value}</dd>
    </div>
  );
}

type ThisWeekColumnProps = {
  label: string;
  count: number;
  emptyLabel: string;
  children: React.ReactNode;
  withDivider?: boolean;
};

function ThisWeekColumn({
  label,
  count,
  emptyLabel,
  children,
  withDivider = false,
}: ThisWeekColumnProps) {
  const childCount = Array.isArray(children)
    ? children.filter(Boolean).length
    : children
      ? 1
      : 0;

  return (
    <div
      className={`space-y-4 border-t border-app-line pt-5 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-5 ${
        withDivider ? "lg:border-l lg:pl-6" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">{label}</h3>
        <Badge>{count}</Badge>
      </div>
      {childCount > 0 ? (
        <div className="data-list">{children}</div>
      ) : (
        <EmptyState title={`No ${label.toLowerCase()}`} description={emptyLabel} />
      )}
    </div>
  );
}

function ThisWeekTaskItem({ task }: { task: DashboardTaskWithBrand }) {
  return (
    <article className="data-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {task.brandName}
          </p>
          <h4 className="mt-2 text-base font-semibold text-ink">{task.title}</h4>
          <p className="mt-2 text-sm text-ink-muted">
            {formatWeekdayDate(task.dueDate)} | {task.status}
          </p>
        </div>
        <Badge tone={taskPriorityTones[task.priority]}>{task.priority}</Badge>
      </div>
    </article>
  );
}

function ThisWeekUpcomingItem({ item }: { item: DashboardUpcomingWithBrand }) {
  return (
    <article className="data-row">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {item.brandName}
          </p>
          <h4 className="mt-2 text-base font-semibold text-ink">{item.title}</h4>
          <p className="mt-2 text-sm text-ink-muted">
            {formatWeekdayDate(item.date)} | {item.status}
          </p>
        </div>
        <Badge>{item.type}</Badge>
      </div>
    </article>
  );
}
