import Link from "next/link";

import { BrandColorBadge } from "@/components/BrandColorBadge";
import { Badge, Card, EmptyState, SectionHeader, cx } from "@/components/ui";
import {
  buildMonthCalendarDays,
  buildUpcomingGroups,
  buildWeekCalendarDays,
  getPlannerViewItems,
  type PlannerCalendarDay,
  type PlannerUpcomingItem,
  type UpcomingPlannerLayout,
  type UpcomingPlannerView,
} from "@/lib/upcoming-planner";
import { formatWeekdayDate, getRelativeDateLabel } from "@/lib/date";
import { normalizeBrandColor, toBrandColorRgba } from "@/lib/brand-colors";

type UpcomingPlannerProps = {
  items: PlannerUpcomingItem[];
  layout: UpcomingPlannerLayout;
  view: UpcomingPlannerView;
  totalUpcomingCount: number;
  today: string;
};

const plannerViews: Array<{ id: UpcomingPlannerView; label: string }> = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "brand", label: "By brand" },
  { id: "campaign", label: "By campaign" },
  { id: "type", label: "By type" },
];

const plannerLayouts: Array<{ id: UpcomingPlannerLayout; label: string }> = [
  { id: "calendar", label: "Calendar" },
  { id: "list", label: "List" },
];

export function UpcomingPlanner({
  items,
  layout,
  view,
  totalUpcomingCount,
  today,
}: UpcomingPlannerProps) {
  const baseDate = new Date(`${today}T12:00:00`);
  const visibleItems = getPlannerViewItems(items, view, baseDate);
  const groups = buildUpcomingGroups(visibleItems, view);
  const isTimeGridView = layout === "calendar" && (view === "week" || view === "month");
  const calendarDays =
    layout === "calendar"
      ? view === "week"
        ? buildWeekCalendarDays(visibleItems, baseDate)
        : view === "month"
          ? buildMonthCalendarDays(visibleItems, baseDate)
          : null
      : null;

  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader
          eyebrow="Planning"
          title="Calendar-style upcoming view"
          description="Switch between a calendar layout and a grouped list so launches, reminders, meetings, and deadlines stay easy to plan."
          action={
            <div className="flex flex-wrap gap-2">
              <Badge>{visibleItems.length} visible</Badge>
              <Badge>{totalUpcomingCount} total upcoming</Badge>
            </div>
          }
          compact
        />

        <form action="/calendar" className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_auto]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">View</span>
            <select name="view" defaultValue={view} className="app-input">
              {plannerViews.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Layout</span>
            <select name="layout" defaultValue={layout} className="app-input">
              {plannerLayouts.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
            >
              Apply view
            </button>
            {(view !== "week" || layout !== "calendar") ? (
              <Link
                href="/calendar"
                className="inline-flex items-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {plannerViews.map((option) => (
            <Link
              key={option.id}
              href={`/calendar?view=${option.id}&layout=${layout}`}
              className={cx(
                "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium",
                view === option.id
                  ? "bg-app-sidebar text-white"
                  : "border border-app-line text-ink-muted hover:bg-app-soft hover:text-ink",
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </Card>

      {visibleItems.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing upcoming in this view"
            description="Try switching to another planning view, or add more upcoming items inside a brand workspace."
          />
        </Card>
      ) : isTimeGridView && calendarDays ? (
        <Card>
          <SectionHeader
            title={view === "week" ? "This week" : "This month"}
            description={
              view === "week"
                ? "A date-first planning view for launches, reminders, meetings, and deadlines happening this week."
                : "A month-at-a-glance calendar for launch timing and content planning."
            }
            compact
          />
          <div className="mt-5">
            <CalendarGrid days={calendarDays} monthView={view === "month"} />
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <SectionHeader
                title={group.title}
                description={group.helper}
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    {group.accentColor ? (
                      <BrandColorBadge
                        color={group.accentColor}
                        label="Brand color"
                        size="xs"
                      />
                    ) : null}
                    <Badge>{group.items.length}</Badge>
                  </div>
                }
                compact
              />
              <div className="mt-5 data-list">
                {group.items.map((item) => (
                  <PlannerItemRow key={item.id} item={item} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarGrid({
  days,
  monthView,
}: {
  days: PlannerCalendarDay[];
  monthView: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => (
        <article
          key={day.date}
          className={cx(
            "rounded-2xl border p-3",
            day.isCurrentMonth ? "border-app-line bg-app-soft/55" : "border-app-line/60 bg-white/55",
            day.isToday ? "ring-2 ring-accent/30" : "",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">{day.shortLabel}</p>
              {!monthView ? (
                <p className="mt-1 text-xs text-ink-muted">{day.label}</p>
              ) : null}
            </div>
            {day.items.length > 0 ? <Badge>{day.items.length}</Badge> : null}
          </div>

          <div className="mt-3 space-y-2">
            {day.items.length > 0 ? (
              day.items.slice(0, monthView ? 3 : 6).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-xl border bg-white px-3 py-2 hover:border-app-line-strong hover:bg-app-surface"
                  style={{
                    borderColor: toBrandColorRgba(item.brandColor, 0.26),
                    boxShadow: `inset 3px 0 0 ${normalizeBrandColor(item.brandColor)}`,
                  }}
                >
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: normalizeBrandColor(item.brandColor) }}
                    />
                    <span>{item.brandName}</span>
                    <span>|</span>
                    <span>{item.typeLabel}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-ink-muted">No items</p>
            )}
            {monthView && day.items.length > 3 ? (
              <p className="text-xs font-medium text-ink-muted">
                +{day.items.length - 3} more
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function PlannerItemRow({ item }: { item: PlannerUpcomingItem }) {
  return (
    <article
      className="data-row"
      style={{
        borderColor: toBrandColorRgba(item.brandColor, 0.24),
        boxShadow: `inset 3px 0 0 ${normalizeBrandColor(item.brandColor)}`,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={item.href} className="text-base font-semibold text-ink hover:text-accent">
            {item.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BrandColorBadge color={item.brandColor} label={item.brandName} size="xs" />
            <p className="text-sm text-ink-muted">{formatWeekdayDate(item.date)}</p>
          </div>
          {item.campaignTitle ? (
            <p className="mt-1 text-sm text-ink-muted">Campaign: {item.campaignTitle}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{item.typeLabel}</Badge>
          <Badge>{item.statusLabel}</Badge>
          <Badge>{getRelativeDateLabel(item.date)}</Badge>
        </div>
      </div>
      {item.notes ? (
        <p className="mt-3 text-sm leading-6 text-ink-muted">{item.notes}</p>
      ) : null}
    </article>
  );
}
