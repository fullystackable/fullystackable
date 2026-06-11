import Link from "next/link";
import type { ReactNode } from "react";

import { AssetCreateForm } from "@/components/AssetCreateForm";
import { AssetList } from "@/components/AssetList";
import { BrandProfilePanel } from "@/components/BrandProfilePanel";
import { BrandSnapshotPanel } from "@/components/BrandSnapshotPanel";
import { CampaignCreateForm } from "@/components/CampaignCreateForm";
import { CampaignList } from "@/components/CampaignList";
import { ContactCreateForm } from "@/components/ContactCreateForm";
import { ContactList } from "@/components/ContactList";
import { ExpandablePanel } from "@/components/ExpandablePanel";
import { NoteCreateForm } from "@/components/NoteCreateForm";
import { NotesPanel } from "@/components/NotesPanel";
import { TaskCreateForm } from "@/components/TaskCreateForm";
import { TaskList } from "@/components/TaskList";
import { UpcomingCreateForm } from "@/components/UpcomingCreateForm";
import { UpcomingList } from "@/components/UpcomingList";
import { Badge, Card, SectionHeader, cx } from "@/components/ui";
import { WorkspaceControlBar } from "@/components/WorkspaceControlBar";
import {
  buildWorkspaceViewHref,
  type WorkspaceTab,
} from "@/lib/workspace-url-state";
import {
  isTaskIncompleteStatus,
  type BrandWorkspaceData,
  type TaskViewFilter,
  type WorkspaceDensity,
} from "@/lib/workspace-view";

type BrandWorkspaceProps = {
  brand: BrandWorkspaceData;
  activeCampaignId?: string | null;
  taskSort?: "due_asc" | "priority_desc" | "status" | "title";
  taskView?: TaskViewFilter;
  assetSort?: "updated_desc" | "priority_desc" | "type" | "title";
  upcomingSort?: "date_asc" | "type" | "status" | "title";
  density?: WorkspaceDensity;
  activeTab?: WorkspaceTab;
};

type WorkspaceTabConfig = {
  id: WorkspaceTab;
  label: string;
  count?: number;
};

export function BrandWorkspace({
  brand,
  activeCampaignId = null,
  taskSort = "due_asc",
  taskView = "all",
  assetSort = "updated_desc",
  upcomingSort = "date_asc",
  density = "comfortable",
  activeTab = "tasks",
}: BrandWorkspaceProps) {
  const isCompact = density === "compact";
  const activeCampaign =
    brand.campaigns.find((campaign) => campaign.id === activeCampaignId) ?? null;
  const filteredTasks = activeCampaign
    ? brand.tasks.filter((task) => task.relatedCampaignId === activeCampaign.id)
    : brand.tasks;
  const taskPool =
    taskView === "incomplete"
      ? filteredTasks.filter((task) => isTaskIncompleteStatus(task.statusValue))
      : filteredTasks;
  const filteredAssets = activeCampaign
    ? brand.assets.filter((asset) => asset.relatedCampaignId === activeCampaign.id)
    : brand.assets;
  const filteredUpcoming = activeCampaign
    ? brand.upcoming.filter((item) => item.relatedCampaignId === activeCampaign.id)
    : brand.upcoming;
  const visibleTasks = [...taskPool].sort((left, right) => {
    switch (taskSort) {
      case "priority_desc": {
        const priorityRank = {
          Urgent: 0,
          High: 1,
          Medium: 2,
          Low: 3,
        };

        return priorityRank[left.priority] - priorityRank[right.priority];
      }
      case "status":
        return left.status.localeCompare(right.status);
      case "title":
        return left.title.localeCompare(right.title);
      case "due_asc":
      default: {
        if (left.dueDate && right.dueDate) {
          return left.dueDate.localeCompare(right.dueDate);
        }

        if (left.dueDate) {
          return -1;
        }

        if (right.dueDate) {
          return 1;
        }

        return left.title.localeCompare(right.title);
      }
    }
  });
  const visibleAssets = [...filteredAssets].sort((left, right) => {
    switch (assetSort) {
      case "priority_desc": {
        const priorityRank = {
          high: 0,
          medium: 1,
          low: 2,
        };

        return (
          priorityRank[left.priorityValue] - priorityRank[right.priorityValue]
        );
      }
      case "type":
        return left.type.localeCompare(right.type);
      case "title":
        return left.title.localeCompare(right.title);
      case "updated_desc":
      default:
        return right.updatedAt.localeCompare(left.updatedAt);
    }
  });
  const visibleUpcoming = [...filteredUpcoming].sort((left, right) => {
    switch (upcomingSort) {
      case "type":
        return left.type.localeCompare(right.type);
      case "status":
        return left.status.localeCompare(right.status);
      case "title":
        return left.title.localeCompare(right.title);
      case "date_asc":
      default:
        return left.date.localeCompare(right.date);
    }
  });
  const campaignOptions = brand.campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
  }));
  const hasCustomSorts =
    taskSort !== "due_asc" ||
    assetSort !== "updated_desc" ||
    upcomingSort !== "date_asc";
  const hasCustomSettings =
    hasCustomSorts || density !== "comfortable" || taskView !== "all";
  const sectionGridClass = isCompact ? "grid gap-4 xl:grid-cols-2" : "grid gap-5 xl:grid-cols-2";
  const stackClass = isCompact ? "space-y-4" : "space-y-5";
  const taskSectionDescription = activeCampaign
    ? `Campaign execution, approvals, and production milestones tied to ${activeCampaign.title}.`
    : "Campaign execution, approvals, and production milestones.";
  const taskSectionSummary =
    taskView === "incomplete"
      ? "Showing incomplete tasks only."
      : "Showing all tasks.";
  const assetSectionDescription = activeCampaign
    ? `Metadata-first asset records linked to ${activeCampaign.title}.`
    : "Metadata-first asset records for links, uploads, and references.";
  const upcomingSectionDescription = activeCampaign
    ? `Meetings, launches, deadlines, and reminders tied to ${activeCampaign.title}.`
    : "Meetings, launches, deadlines, and moments to prepare for.";
  const taskEmptyTitle = activeCampaign
    ? taskView === "incomplete"
      ? `No incomplete tasks for ${activeCampaign.title}`
      : `No tasks for ${activeCampaign.title}`
    : taskView === "incomplete"
      ? "No incomplete tasks in this workspace"
      : "No tasks in this workspace";
  const taskEmptyDescription = activeCampaign
    ? taskView === "incomplete"
      ? "Every task in this focused campaign is done or archived. Switch back to all tasks if you want to review completed work."
      : "This focused campaign does not have any tasks yet. Add one here to keep execution attached to the initiative."
    : taskView === "incomplete"
      ? "Everything currently visible here is already done or archived. Switch back to all tasks to review the full history."
      : "As new campaign work, approvals, or production items are added, they will appear here.";
  const assetEmptyTitle = activeCampaign
    ? `No assets for ${activeCampaign.title}`
    : "No assets yet";
  const assetEmptyDescription = activeCampaign
    ? "No asset records are tied to this campaign yet. Add one here to keep links, references, and placeholders together."
    : "Creative files, reference documents, and working links will show up here when they are added.";
  const upcomingEmptyTitle = activeCampaign
    ? `Nothing upcoming for ${activeCampaign.title}`
    : "Nothing upcoming";
  const upcomingEmptyDescription = activeCampaign
    ? "This campaign does not have any scheduled launches, meetings, or reminders yet."
    : "Future launches, meetings, and checkpoints will show up here as they are scheduled.";
  const tabs: WorkspaceTabConfig[] = [
    { id: "tasks", label: "Tasks", count: visibleTasks.length },
    { id: "upcoming", label: "Upcoming", count: visibleUpcoming.length },
    { id: "assets", label: "Assets", count: visibleAssets.length },
    { id: "contacts", label: "Contacts", count: brand.contacts.length },
    { id: "notes", label: "Notes", count: brand.notes.length },
    { id: "profile", label: "Profile" },
  ];

  return (
    <section
      className={cx(
        isCompact ? "workspace-density-compact space-y-4" : "space-y-5",
      )}
    >
      <BrandSnapshotPanel brand={brand} />

      <WorkspaceControlBar
        brandSlug={brand.slug}
        campaigns={campaignOptions}
        activeCampaignId={activeCampaign?.id ?? null}
        activeCampaignTitle={activeCampaign?.title ?? null}
        taskSort={taskSort}
        taskView={taskView}
        assetSort={assetSort}
        upcomingSort={upcomingSort}
        density={density}
        hasCustomSettings={hasCustomSettings}
        tasksCount={visibleTasks.length}
        assetsCount={visibleAssets.length}
        upcomingCount={visibleUpcoming.length}
        activeTab={activeTab}
      />

      <nav aria-label="Workspace sections" className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-2xl border border-app-line bg-white/80 p-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={buildWorkspaceViewHref(brand.slug, {
                  activeCampaignId: activeCampaign?.id ?? null,
                  taskSort,
                  taskView,
                  assetSort,
                  upcomingSort,
                  density,
                  tab: tab.id,
                })}
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-app-sidebar text-white shadow-app-soft"
                    : "text-ink-muted hover:bg-app-soft hover:text-ink",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" ? (
                  <span
                    className={cx(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive ? "bg-white/14 text-white" : "bg-app-soft text-ink",
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {activeTab === "tasks" ? (
        <div className={sectionGridClass}>
          <WorkspaceSection
            id="campaigns"
            title="Campaigns"
            description="The brand's active pushes, launch windows, and initiative-level context."
            action={
              <Badge>{brand.campaigns.length} campaign{brand.campaigns.length === 1 ? "" : "s"}</Badge>
            }
          >
            <div className={stackClass}>
              <ExpandablePanel
                title="Add a campaign"
                description="Group related work under one initiative before you start tying tasks and assets to it."
                buttonLabel="New campaign"
              >
                <CampaignCreateForm brandId={brand.id} brandSlug={brand.slug} />
              </ExpandablePanel>
              <CampaignList
                campaigns={brand.campaigns}
                brandSlug={brand.slug}
                allowDelete
                activeCampaignId={activeCampaign?.id ?? null}
              />
            </div>
          </WorkspaceSection>
          <WorkspaceSection
            id="tasks"
            title="Tasks"
            description={taskSectionDescription}
            action={
              <div className="flex flex-wrap gap-2">
                <Badge>{visibleTasks.length} visible</Badge>
                {taskView === "incomplete" ? <Badge tone="accent">Incomplete only</Badge> : null}
              </div>
            }
          >
            <div className={stackClass}>
              <ExpandablePanel
                title="Add a task"
                description={`Keep the workspace current with new execution items as they appear. ${taskSectionSummary}`}
                buttonLabel="New task"
              >
                <TaskCreateForm
                  brandId={brand.id}
                  brandSlug={brand.slug}
                  campaigns={campaignOptions}
                  defaultCampaignId={activeCampaign?.id ?? null}
                />
              </ExpandablePanel>
              <TaskList
                tasks={visibleTasks}
                brandSlug={brand.slug}
                campaigns={campaignOptions}
                emptyTitle={taskEmptyTitle}
                emptyDescription={taskEmptyDescription}
              />
            </div>
          </WorkspaceSection>
        </div>
      ) : null}

      {activeTab === "upcoming" ? (
        <WorkspaceSection
          id="upcoming"
          title="Upcoming"
          description={upcomingSectionDescription}
          action={<Badge>{visibleUpcoming.length} visible</Badge>}
        >
          <div className={stackClass}>
            <ExpandablePanel
              title="Add an upcoming item"
              description="Keep launches, deadlines, meetings, and reminders visible without leaving the workspace."
              buttonLabel="New upcoming item"
            >
              <UpcomingCreateForm
                brandId={brand.id}
                brandSlug={brand.slug}
                campaigns={campaignOptions}
                defaultCampaignId={activeCampaign?.id ?? null}
              />
            </ExpandablePanel>
            <UpcomingList
              items={visibleUpcoming}
              campaigns={campaignOptions}
              brandSlug={brand.slug}
              allowDelete
              emptyTitle={upcomingEmptyTitle}
              emptyDescription={upcomingEmptyDescription}
            />
          </div>
        </WorkspaceSection>
      ) : null}

      {activeTab === "assets" ? (
        <WorkspaceSection
          id="assets"
          title="Assets"
          description={assetSectionDescription}
          action={<Badge>{visibleAssets.length} visible</Badge>}
        >
          <div className={stackClass}>
            <ExpandablePanel
              title="Add an asset"
              description="Start with the record, then attach links, storage paths, and notes around the work."
              buttonLabel="New asset"
            >
              <AssetCreateForm
                brandId={brand.id}
                brandSlug={brand.slug}
                campaigns={campaignOptions}
                defaultCampaignId={activeCampaign?.id ?? null}
              />
            </ExpandablePanel>
            <AssetList
              assets={visibleAssets}
              campaigns={campaignOptions}
              brandSlug={brand.slug}
              allowDelete
              emptyTitle={assetEmptyTitle}
              emptyDescription={assetEmptyDescription}
            />
          </div>
        </WorkspaceSection>
      ) : null}

      {activeTab === "contacts" ? (
        <WorkspaceSection
          id="contacts"
          title="Contacts"
          description="Core client and partner relationships for fast follow-up."
          action={<Badge>{brand.contacts.length} total</Badge>}
        >
          <div className={stackClass}>
            <ExpandablePanel
              title="Add a contact"
              description="Keep the key people around this brand close to the work."
              buttonLabel="New contact"
            >
              <ContactCreateForm brandId={brand.id} brandSlug={brand.slug} />
            </ExpandablePanel>
            <ContactList
              contacts={brand.contacts}
              brandSlug={brand.slug}
              allowDelete
            />
          </div>
        </WorkspaceSection>
      ) : null}

      {activeTab === "notes" ? (
        <NotesPanel
          id="notes"
          title="Working notes"
          description="Recent reminders and operating context for this brand."
          notes={brand.notes}
          brandSlug={brand.slug}
          allowDelete
          beforeList={
            <ExpandablePanel
              title="Add a note"
              description="Capture brand voice, reminders, and operating context while it is fresh."
              buttonLabel="New note"
            >
              <NoteCreateForm brandId={brand.id} brandSlug={brand.slug} />
            </ExpandablePanel>
          }
        />
      ) : null}

      {activeTab === "profile" ? <BrandProfilePanel brand={brand} /> : null}
    </section>
  );
}

type WorkspaceSectionProps = {
  id?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

function WorkspaceSection({
  id,
  title,
  description,
  action,
  children,
}: WorkspaceSectionProps) {
  return (
    <Card id={id}>
      <SectionHeader
        title={title}
        description={description}
        action={action}
        compact
      />
      <div className="mt-5">{children}</div>
    </Card>
  );
}
