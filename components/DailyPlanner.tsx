import Link from "next/link";

import { BrandColorBadge } from "@/components/BrandColorBadge";
import { DashboardHeader } from "@/components/DashboardHeader";
import { QuickLinksList } from "@/components/QuickLinksList";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";
import type { DailyPlannerData } from "@/lib/daily-planner";
import type { DailyPlannerEntry } from "@/lib/daily-planner-helpers";
import { formatWeekdayDate, getRelativeDateLabel } from "@/lib/date";
import { taskPriorityTones, taskStatusTones } from "@/lib/design";

type DailyPlannerProps = {
  data: DailyPlannerData;
};

export function DailyPlanner({ data }: DailyPlannerProps) {
  const todayLabel = formatWeekdayDate(data.todayLabel);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Today"
        title="Daily planner"
        subtitle={`As of ${todayLabel}, this is the tighter operating view for overdue work, today's tasks, the next few days, and near-term upcoming moments.`}
        size="compact"
        meta={
          <>
            <Badge tone="danger">{data.overdueCount} overdue</Badge>
            <Badge tone="accent">{data.dueTodayCount} due today</Badge>
            <Badge>{data.upcomingSoonCount} upcoming soon</Badge>
          </>
        }
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
            >
              Open dashboard
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
            >
              Open calendar
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="h-full">
          <p className="text-sm font-medium text-ink-muted">Overdue</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {data.overdueCount}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Work that should be handled before anything newly scheduled.
          </p>
        </Card>
        <Card className="h-full">
          <p className="text-sm font-medium text-ink-muted">Due today</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {data.dueTodayCount}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Tasks that belong in today&apos;s working set.
          </p>
        </Card>
        <Card className="h-full">
          <p className="text-sm font-medium text-ink-muted">Next 3 days</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {data.nextThreeDaysCount}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Near-term tasks worth planning before they become urgent.
          </p>
        </Card>
        <Card className="h-full">
          <p className="text-sm font-medium text-ink-muted">Upcoming soon</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {data.upcomingSoonCount}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Meetings, launches, reminders, and deadlines happening next.
          </p>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card id="agenda">
          <SectionHeader
            eyebrow="Action"
            title="Action agenda"
            description="Tasks and upcoming items grouped by when they matter, so the next few days are easy to work through in order."
            action={<Badge>{data.groups.reduce((sum, group) => sum + group.entries.length, 0)} items</Badge>}
          />
          <div className="mt-6">
            {data.groups.length > 0 ? (
              <div className="space-y-4">
                {data.groups.map((group) => (
                  <section
                    key={group.id}
                    className="rounded-3xl border border-app-line bg-app-soft/55 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {group.date ? formatWeekdayDate(group.date) : group.title}
                        </p>
                        <p className="mt-1 text-sm text-ink-muted">{group.helper}</p>
                      </div>
                      <Badge tone={group.date ? "info" : "danger"}>
                        {group.date ? getRelativeDateLabel(group.date) : "Priority first"}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-3">
                      {group.entries.map((entry) => (
                        <DailyPlannerEntryRow key={`${entry.kind}-${entry.id}`} entry={entry} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing pressing right now"
                description="Your next few days are clear. New tasks and upcoming items will appear here automatically."
              />
            )}
          </div>
        </Card>

        <Card id="pinned-brands">
          <SectionHeader
            eyebrow="Pinned"
            title="Pinned brands"
            description="Keep quick-access brands close while you work the day."
            action={<Badge>{data.pinnedBrands.length}</Badge>}
          />
          <div className="mt-6">
            {data.pinnedBrands.length > 0 ? (
              <div className="data-list">
                {data.pinnedBrands.map((brand) => (
                  <article key={brand.id} className="data-row">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/brands/${brand.slug}`}
                          className="text-base font-semibold text-ink hover:text-accent"
                        >
                          {brand.name}
                        </Link>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <BrandColorBadge
                            color={brand.brandColor}
                            label={brand.status}
                            size="xs"
                          />
                          <Badge>{brand.openTasksCount} open tasks</Badge>
                          {brand.overdueTasksCount > 0 ? (
                            <Badge tone="danger">{brand.overdueTasksCount} overdue</Badge>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        href={`/brands/${brand.slug}`}
                        className="inline-flex items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
                      >
                        Open
                      </Link>
                    </div>
                    <div className="mt-4">
                      {brand.spotlightNote ? (
                        <div className="mb-4 rounded-2xl border border-app-line bg-app-soft/55 px-3 py-3">
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
                      <QuickLinksList
                        links={brand.quickLinks}
                        compact
                        emptyTitle="No quick links pinned yet"
                        emptyDescription="Flag the links you open most often from this brand."
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No pinned brands yet"
                description="Pin the brands you touch most often so this page feels like a real daily command center."
              />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function DailyPlannerEntryRow({ entry }: { entry: DailyPlannerEntry }) {
  return (
    <article className="rounded-2xl border border-app-line bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={entry.href} className="text-base font-semibold text-ink hover:text-accent">
            {entry.title}
          </Link>
          <p className="mt-2 text-sm text-ink-muted">{entry.brandName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={entry.kind === "task" ? "accent" : "info"}>
            {entry.kind === "task" ? "Task" : "Upcoming"}
          </Badge>
          {entry.kind === "task" ? (
            <>
              <Badge tone={taskStatusTones[entry.status]}>{entry.status}</Badge>
              <Badge tone={taskPriorityTones[entry.detail]}>{entry.detail}</Badge>
            </>
          ) : (
            <>
              <Badge>{entry.detail}</Badge>
              <Badge>{entry.status}</Badge>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
