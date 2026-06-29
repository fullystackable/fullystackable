import { DashboardHeader } from "@/components/DashboardHeader";
import { UpcomingPlanner } from "@/components/UpcomingPlanner";
import { Badge } from "@/components/ui";
import {
  getUpcomingPlannerData,
  normalizeUpcomingPlannerLayout,
  normalizeUpcomingPlannerView,
} from "@/lib/upcoming-planner";

export const dynamic = "force-dynamic";

type CalendarPageProps = {
  searchParams: Promise<{
    layout?: string;
    view?: string;
  }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getUpcomingPlannerData();
  const layout = normalizeUpcomingPlannerLayout(resolvedSearchParams.layout);
  const view = normalizeUpcomingPlannerView(resolvedSearchParams.view);

  return (
    <div className="app-page-shell flex w-full flex-col">
      <DashboardHeader
        eyebrow="Calendar"
        title="Upcoming planner"
        subtitle="Plan launches, deadlines, reminders, meetings, and events with a date-first command center for the whole portfolio."
        size="compact"
        meta={
          <>
            <Badge>{data.totalUpcomingCount} future items</Badge>
            <Badge>{layout === "calendar" ? "Calendar layout" : "List layout"}</Badge>
          </>
        }
      />

      <UpcomingPlanner
        items={data.items}
        layout={layout}
        view={view}
        totalUpcomingCount={data.totalUpcomingCount}
        today={data.today}
      />
    </div>
  );
}
