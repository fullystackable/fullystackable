import Link from "next/link";

import { AssetCreateForm } from "@/components/AssetCreateForm";
import { AssetList } from "@/components/AssetList";
import { BrandColorBadge } from "@/components/BrandColorBadge";
import { CampaignEditForm } from "@/components/CampaignEditForm";
import { ExpandablePanel } from "@/components/ExpandablePanel";
import { TaskCreateForm } from "@/components/TaskCreateForm";
import { TaskList } from "@/components/TaskList";
import { UpcomingCreateForm } from "@/components/UpcomingCreateForm";
import { UpcomingList } from "@/components/UpcomingList";
import { Badge, Card, EmptyState, SectionHeader, cx } from "@/components/ui";
import { formatShortDate } from "@/lib/date";
import { brandStatusTones } from "@/lib/design";
import {
  buildCampaignWorkspaceHref,
  type CampaignWorkspaceTab,
} from "@/lib/workspace-url-state";
import {
  isTaskIncompleteStatus,
  type CampaignWorkspaceData,
} from "@/lib/workspace-view";

type CampaignWorkspaceProps = {
  campaign: CampaignWorkspaceData;
  activeTab?: CampaignWorkspaceTab;
};

const tabs: Array<{ id: CampaignWorkspaceTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "assets", label: "Assets" },
  { id: "deadlines", label: "Deadlines" },
];

export function CampaignWorkspace({
  campaign,
  activeTab = "overview",
}: CampaignWorkspaceProps) {
  const openTasksCount = campaign.tasks.filter((task) =>
    isTaskIncompleteStatus(task.statusValue),
  ).length;
  const launchDateLabel = campaign.launchDate
    ? formatShortDate(campaign.launchDate)
    : "No launch date";
  const campaignOptions = campaign.brandCampaigns.map((item) => ({
    id: item.id,
    title: item.title,
  }));

  return (
    <section className="space-y-5">
      <Card>
        <SectionHeader
          eyebrow="Campaign"
          title="Campaign snapshot"
          description="A compact workspace for the brief, execution layer, deadlines, and final learnings around one campaign."
          action={
            <div className="flex flex-wrap gap-2">
              <BrandColorBadge color={campaign.brandColor} label={campaign.brandName} />
              <Badge tone={brandStatusTones[campaign.brandStatus]}>
                {campaign.brandStatus}
              </Badge>
            </div>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Status" value={campaign.status} />
          <MetricTile label="Launch date" value={launchDateLabel} />
          <MetricTile label="Open tasks" value={String(openTasksCount)} />
          <MetricTile label="Tracked assets" value={String(campaign.assets.length)} />
        </div>

        {campaign.goals.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {campaign.goals.map((goal) => (
              <Badge key={goal}>{goal}</Badge>
            ))}
          </div>
        ) : null}
      </Card>

      <nav aria-label="Campaign sections" className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-2xl border border-app-line bg-white/80 p-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={buildCampaignWorkspaceHref(campaign.brandSlug, campaign.id, {
                  tab: tab.id,
                })}
                className={cx(
                  "inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-app-sidebar text-white shadow-app-soft"
                    : "text-ink-muted hover:bg-app-soft hover:text-ink",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {activeTab === "overview" ? (
        <Card id="overview">
          <SectionHeader
            title="Campaign brief"
            description="Keep the core brief, ideas, links, notes, and post-campaign learnings in one place."
            compact
          />
          <div className="mt-5 space-y-5">
            <ExpandablePanel
              title="Edit campaign details"
              description="Update the brief, launch date, content ideas, links, and post-campaign notes without leaving this workspace."
              buttonLabel="Open editor"
            >
              <CampaignEditForm
                campaign={campaign}
                brandSlug={campaign.brandSlug}
                alwaysExpanded
                framed={false}
              />
            </ExpandablePanel>

            <div className="grid gap-4 xl:grid-cols-2">
              <OverviewField
                label="Campaign brief"
                value={campaign.description}
                empty="No brief added yet."
                preserveLines
              />
              <OverviewField
                label="Working notes"
                value={campaign.notes}
                empty="No campaign notes yet."
                preserveLines
              />
              <OverviewField
                label="Content ideas"
                value={campaign.contentIdeas}
                empty="No content ideas captured yet."
                asList
              />
              <OverviewField
                label="Links"
                value={campaign.links}
                empty="No campaign links added yet."
                asLinks
              />
              <OverviewField
                label="Results / post-campaign notes"
                value={campaign.resultsNotes}
                empty="No wrap-up notes yet."
                preserveLines
                className="xl:col-span-2"
              />
            </div>
          </div>
        </Card>
      ) : null}

      {activeTab === "tasks" ? (
        <Card id="tasks">
          <SectionHeader
            title="Related tasks"
            description="Execution items directly tied to this campaign."
            action={<Badge>{campaign.tasks.length}</Badge>}
            compact
          />
          <div className="mt-5 space-y-5">
            <ExpandablePanel
              title="Add a task"
              description="Capture new work without breaking campaign context."
              buttonLabel="New task"
            >
              <TaskCreateForm
                brandId={campaign.brandId}
                brandSlug={campaign.brandSlug}
                campaigns={campaignOptions}
                defaultCampaignId={campaign.id}
              />
            </ExpandablePanel>
            <TaskList
              tasks={campaign.tasks}
              brandSlug={campaign.brandSlug}
              campaigns={campaignOptions}
              emptyTitle="No campaign tasks yet"
              emptyDescription="As execution work gets attached to this campaign, it will show up here."
            />
          </div>
        </Card>
      ) : null}

      {activeTab === "assets" ? (
        <Card id="assets">
          <SectionHeader
            title="Related assets"
            description="Files, links, references, and placeholders supporting this campaign."
            action={<Badge>{campaign.assets.length}</Badge>}
            compact
          />
          <div className="mt-5 space-y-5">
            <ExpandablePanel
              title="Add an asset"
              description="Keep campaign files and working references attached to the initiative."
              buttonLabel="New asset"
            >
              <AssetCreateForm
                brandId={campaign.brandId}
                brandSlug={campaign.brandSlug}
                campaigns={campaignOptions}
                defaultCampaignId={campaign.id}
              />
            </ExpandablePanel>
            <AssetList
              assets={campaign.assets}
              campaigns={campaignOptions}
              brandSlug={campaign.brandSlug}
              allowDelete
              emptyTitle="No campaign assets yet"
              emptyDescription="Add creative, references, or storage links tied to this campaign."
            />
          </div>
        </Card>
      ) : null}

      {activeTab === "deadlines" ? (
        <Card id="deadlines">
          <SectionHeader
            title="Deadlines"
            description="Launches, reminders, deadlines, and scheduled campaign moments."
            action={<Badge>{campaign.upcoming.length}</Badge>}
            compact
          />
          <div className="mt-5 space-y-5">
            <ExpandablePanel
              title="Add a deadline or scheduled item"
              description="Keep launch timing and milestone visibility attached to the campaign."
              buttonLabel="New deadline"
            >
              <UpcomingCreateForm
                brandId={campaign.brandId}
                brandSlug={campaign.brandSlug}
                campaigns={campaignOptions}
                defaultCampaignId={campaign.id}
              />
            </ExpandablePanel>
            <UpcomingList
              items={campaign.upcoming}
              campaigns={campaignOptions}
              brandSlug={campaign.brandSlug}
              allowDelete
              emptyTitle="No campaign deadlines yet"
              emptyDescription="Add launch dates, deadlines, meetings, or reminders to build out the campaign calendar."
            />
          </div>
        </Card>
      ) : null}
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-tile">
      <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

type OverviewFieldProps = {
  label: string;
  value: string | null;
  empty: string;
  preserveLines?: boolean;
  asList?: boolean;
  asLinks?: boolean;
  className?: string;
};

function OverviewField({
  label,
  value,
  empty,
  preserveLines = false,
  asList = false,
  asLinks = false,
  className,
}: OverviewFieldProps) {
  const normalizedValue = value?.trim() ?? "";

  return (
    <article className={cx("rounded-2xl border border-app-line bg-app-soft px-4 py-4", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </p>
      <div className="mt-3">
        {normalizedValue ? (
          asLinks ? (
            <div className="space-y-2">
              {splitLines(normalizedValue).map((line) => {
                const href = normalizeLink(line);

                return href ? (
                  <a
                    key={line}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm font-medium leading-6 text-accent hover:text-app-sidebar"
                  >
                    {line}
                  </a>
                ) : (
                  <p key={line} className="text-sm leading-6 text-ink">
                    {line}
                  </p>
                );
              })}
            </div>
          ) : asList ? (
            <ul className="space-y-2 text-sm leading-6 text-ink">
              {splitLines(normalizedValue).map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className={cx(
                "text-sm leading-6 text-ink",
                preserveLines ? "whitespace-pre-wrap" : "",
              )}
            >
              {normalizedValue}
            </p>
          )
        ) : (
          <EmptyState
            title={empty}
            description="Add this detail in the campaign editor when it becomes relevant."
          />
        )}
      </div>
    </article>
  );
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeLink(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }

  return null;
}
