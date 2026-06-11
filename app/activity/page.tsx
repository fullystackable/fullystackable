import Link from "next/link";

import { ActivityFeed } from "@/components/ActivityFeed";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { getRecentActivityFeed } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const activity = await getRecentActivityFeed(50);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <DashboardHeader
        eyebrow="Activity"
        title="Recent activity"
        subtitle="A lightweight memory layer for what changed recently across brands, tasks, assets, contacts, campaigns, and deadlines."
        size="compact"
        meta={<Badge>{activity.length} recent events</Badge>}
        action={
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
          >
            Back to dashboard
          </Link>
        }
      />

      <Card>
        <SectionHeader
          title="Activity log"
          description="Useful for remembering what just changed, tracing side effects, and debugging workspace behavior."
          compact
        />
        <div className="mt-5">
          <ActivityFeed items={activity} />
        </div>
      </Card>
    </div>
  );
}
