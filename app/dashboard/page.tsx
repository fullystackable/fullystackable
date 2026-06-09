import { GlobalDashboard } from "@/components/GlobalDashboard";
import { getGlobalDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getGlobalDashboardData();

  return <GlobalDashboard data={data} />;
}
