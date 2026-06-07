import Link from "next/link";

import { DashboardHeader } from "@/components/DashboardHeader";
import {
  formatShortDate,
  formatWeekdayDate,
  getRelativeDateLabel,
  toISODate,
} from "@/lib/date";
import {
  getBrandHealthSnapshot,
  getDashboardStats,
  getRecentNotes,
  getThisWeekItems,
  getTodaysFocus,
  type BrandHealthRow,
  type NoteWithBrand,
  type TaskWithBrand,
  type UpcomingWithBrand,
} from "@/lib/brands";

const priorityStyles: Record<TaskWithBrand["priority"], string> = {
  High: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Low: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

const statusStyles: Record<TaskWithBrand["status"], string> = {
  "Needs review": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "In progress": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Planned: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  Done: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const brandStatusStyles: Record<BrandHealthRow["status"], string> = {
  "On track": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Needs attention": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Launching soon": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
};

export default function Home() {
  const today = new Date();
  const todayLabel = formatWeekdayDate(toISODate(today));
  const stats = getDashboardStats(today);
  const todaysFocus = getTodaysFocus(today);
  const thisWeek = getThisWeekItems(today);
  const brandHealth = getBrandHealthSnapshot(today);
  const recentNotes = getRecentNotes();

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
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        active="dashboard"
        eyebrow="Operations"
        title="Today and this week"
        subtitle={`As of ${todayLabel}, this command view highlights what needs attention now, what is due soon, and which brands need the fastest follow-up.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.label}
            className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {card.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <SectionShell
          eyebrow="Today"
          title="Today's focus"
          description="The most urgent work across all brands, sorted by due date, priority, and brand pressure."
          action={
            <Link
              href="/brands"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              View all brands
            </Link>
          }
        >
          <div className="space-y-3">
            {todaysFocus.map((task) => (
              <TodayFocusItem key={task.id} task={task} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Snapshot"
          title="Brand health"
          description="A quick scan of open work, urgent load, and upcoming moments for each brand."
        >
          <div className="space-y-3">
            {brandHealth.map((brand, index) => (
              <BrandHealthItem
                key={brand.brandId}
                brand={brand}
                isTopPriority={index === 0}
              />
            ))}
          </div>
        </SectionShell>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <SectionShell
          eyebrow="This week"
          title="Upcoming tasks and moments"
          description="Everything landing in the next seven days, grouped by work items and calendar moments."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <ThisWeekGroup
              label="Tasks"
              count={thisWeek.tasks.length}
              emptyLabel="No open tasks due in the next 7 days."
            >
              {thisWeek.tasks.map((task) => (
                <ThisWeekTaskItem key={task.id} task={task} />
              ))}
            </ThisWeekGroup>
            <ThisWeekGroup
              label="Upcoming"
              count={thisWeek.upcoming.length}
              emptyLabel="No meetings, launches, or deadlines scheduled this week."
            >
              {thisWeek.upcoming.map((item) => (
                <ThisWeekUpcomingItem key={item.id} item={item} />
              ))}
            </ThisWeekGroup>
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Notes"
          title="Quick notes"
          description="Recent reminders pulled from brand workspaces so context stays close to execution."
        >
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <QuickNoteItem key={note.id} note={note} />
            ))}
          </div>
        </SectionShell>
      </section>
    </main>
  );
}

type SectionShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

function SectionShell({
  eyebrow,
  title,
  description,
  children,
  action,
}: SectionShellProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TodayFocusItem({ task }: { task: TaskWithBrand }) {
  const relativeLabel = getRelativeDateLabel(task.dueDate);
  const relativeStyles =
    task.daysUntilDue < 0
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      : task.daysUntilDue === 0
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/brands/${task.brandId}`}
              className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:text-slate-950"
            >
              {task.brandName}
            </Link>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>
              {task.status}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950">{task.title}</h3>
          <p className="mt-2 text-sm text-slate-600">
            Due {formatWeekdayDate(task.dueDate)} | Owner {task.assignee}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${relativeStyles}`}>
            {relativeLabel}
          </span>
        </div>
      </div>
    </article>
  );
}

function BrandHealthItem({
  brand,
  isTopPriority,
}: {
  brand: BrandHealthRow;
  isTopPriority: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/brands/${brand.brandId}`}
              className="text-base font-semibold text-slate-950 hover:text-blue-700"
            >
              {brand.brandName}
            </Link>
            {isTopPriority ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                Most urgent
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {brand.nextDate
              ? `Next key date ${formatShortDate(brand.nextDate)}`
              : "No upcoming deadlines"}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${brandStatusStyles[brand.status]}`}>
          {brand.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <MetricCell label="Open" value={brand.openTasks} />
        <MetricCell label="Urgent" value={brand.urgentTasks} />
        <MetricCell label="Upcoming" value={brand.upcomingItems} />
      </dl>
    </article>
  );
}

function MetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white px-3 py-3">
      <dt className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

type ThisWeekGroupProps = {
  label: string;
  count: number;
  emptyLabel: string;
  children: React.ReactNode;
};

function ThisWeekGroup({
  label,
  count,
  emptyLabel,
  children,
}: ThisWeekGroupProps) {
  const childCount = Array.isArray(children)
    ? children.filter(Boolean).length
    : children
      ? 1
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <h3 className="text-lg font-semibold text-slate-950">{label}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {count}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {childCount > 0 ? (
          children
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            {emptyLabel}
          </p>
        )}
      </div>
    </div>
  );
}

function ThisWeekTaskItem({ task }: { task: TaskWithBrand }) {
  return (
    <article className="rounded-2xl border border-white/80 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {task.brandName}
          </p>
          <h4 className="mt-2 text-base font-semibold text-slate-950">{task.title}</h4>
          <p className="mt-2 text-sm text-slate-600">
            {formatWeekdayDate(task.dueDate)} | {task.assignee}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>
    </article>
  );
}

function ThisWeekUpcomingItem({ item }: { item: UpcomingWithBrand }) {
  return (
    <article className="rounded-2xl border border-white/80 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {item.brandName}
          </p>
          <h4 className="mt-2 text-base font-semibold text-slate-950">{item.title}</h4>
          <p className="mt-2 text-sm text-slate-600">
            {formatWeekdayDate(item.date)} | {item.type}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
          {item.owner}
        </span>
      </div>
    </article>
  );
}

function QuickNoteItem({ note }: { note: NoteWithBrand }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/brands/${note.brandId}`}
          className="text-sm font-semibold text-slate-950 hover:text-blue-700"
        >
          {note.brandName}
        </Link>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${brandStatusStyles[note.brandStatus]}`}>
          {formatShortDate(note.createdAt)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note.text}</p>
    </article>
  );
}
