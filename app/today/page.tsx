import { DailyPlanner } from "@/components/DailyPlanner";
import { getDailyPlannerData } from "@/lib/daily-planner";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const data = await getDailyPlannerData();

  return <DailyPlanner data={data} />;
}
