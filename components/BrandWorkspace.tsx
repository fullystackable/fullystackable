import type { ReactNode } from "react";

import { AssetList } from "@/components/AssetList";
import { AssetCreateForm } from "@/components/AssetCreateForm";
import { BrandEditForm } from "@/components/BrandEditForm";
import { BrandProfilePanel } from "@/components/BrandProfilePanel";
import { BrandSnapshotPanel } from "@/components/BrandSnapshotPanel";
import { CampaignCreateForm } from "@/components/CampaignCreateForm";
import { CampaignList } from "@/components/CampaignList";
import { ContactCreateForm } from "@/components/ContactCreateForm";
import { ContactList } from "@/components/ContactList";
import { NoteCreateForm } from "@/components/NoteCreateForm";
import { NotesPanel } from "@/components/NotesPanel";
import { TaskList } from "@/components/TaskList";
import { TaskCreateForm } from "@/components/TaskCreateForm";
import { UpcomingCreateForm } from "@/components/UpcomingCreateForm";
import { UpcomingList } from "@/components/UpcomingList";
import { WorkspaceCampaignFilter } from "@/components/WorkspaceCampaignFilter";
import { WorkspaceSortControls } from "@/components/WorkspaceSortControls";
import { Card, SectionHeader, cx } from "@/components/ui";
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
};

export function BrandWorkspace({
  brand,
  activeCampaignId = null,
  taskSort = "due_asc",
  taskView = "all",
  assetSort = "updated_desc",
  upcomingSort = "date_asc",
  density = "comfortable",
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
  const topGridClass = isCompact
    ? "grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]"
    : "grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]";
  const sectionGridClass = isCompact ? "grid gap-4 xl:grid-cols-2" : "grid gap-6 xl:grid-cols-2";
  const stackClass = isCompact ? "space-y-4" : "space-y-6";
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

  return (
    <section
      className={cx(
        isCompact ? "workspace-density-compact space-y-4" : "space-y-6",
      )}
    >
      <div className={topGridClass}>
        <div className={stackClass}>
          <BrandSnapshotPanel brand={brand} />
          <Card>
            <SectionHeader
              title="Brand settings"
              description="Update the core brand record without leaving the workspace."
            />
            <div className="mt-6">
              <BrandEditForm
                brand={{
                  id: brand.id,
                  slug: brand.slug,
                  name: brand.name,
                  descriptionValue: brand.descriptionValue,
                  website: brand.website,
                  statusValue: brand.statusValue,
                  brandNotes: brand.brandNotes,
                  brandVoice: brand.brandVoice,
                  commonCtas: brand.commonCtas,
                  audienceNotes: brand.audienceNotes,
                  servicesProducts: brand.servicesProducts,
                  pricingNotes: brand.pricingNotes,
                  positioningNotes: brand.positioningNotes,
                  doDontList: brand.doDontList,
                  referenceLinks: brand.referenceLinks,
                }}
                alwaysExpanded
              />
            </div>
          </Card>
        </div>

        <NotesPanel
          id="notes"
          title="Working notes"
          description="Recent reminders and operating context for this brand."
          notes={brand.notes}
          brandSlug={brand.slug}
          allowDelete
          beforeList={
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add a note</p>
              <p className="mt-1 text-sm text-ink-muted">
                Capture brand voice, reminders, and operating context while it is fresh.
              </p>
              <div className="mt-4">
                <NoteCreateForm brandId={brand.id} brandSlug={brand.slug} />
              </div>
            </div>
          }
        />
      </div>

      <BrandProfilePanel brand={brand} />

      <WorkspaceCampaignFilter
        brandSlug={brand.slug}
        campaigns={campaignOptions}
        activeCampaignId={activeCampaign?.id ?? null}
        activeCampaignTitle={activeCampaign?.title ?? null}
        taskSort={taskSort}
        taskView={taskView}
        assetSort={assetSort}
        upcomingSort={upcomingSort}
        density={density}
        tasksCount={visibleTasks.length}
        assetsCount={visibleAssets.length}
        upcomingCount={visibleUpcoming.length}
      />

      <WorkspaceSortControls
        brandSlug={brand.slug}
        activeCampaignId={activeCampaign?.id ?? null}
        taskSort={taskSort}
        taskView={taskView}
        assetSort={assetSort}
        upcomingSort={upcomingSort}
        density={density}
        hasCustomSettings={hasCustomSettings}
      />

      <div className={sectionGridClass}>
        <WorkspaceSection
          id="campaigns"
          title="Campaigns"
          description="The brand's active pushes, launch windows, and initiative-level context."
        >
          <div className={stackClass}>
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add a campaign</p>
              <p className="mt-1 text-sm text-ink-muted">
                Group related work under a shared initiative before you start tying tasks and assets to it.
              </p>
              <div className="mt-4">
                <CampaignCreateForm brandId={brand.id} brandSlug={brand.slug} />
              </div>
            </div>
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
        >
          <div className={stackClass}>
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add a task</p>
              <p className="mt-1 text-sm text-ink-muted">
                Keep the workspace current with new execution items as they appear.
              </p>
              <p className="mt-2 text-sm text-ink-muted">{taskSectionSummary}</p>
              <div className="mt-4">
                <TaskCreateForm
                  brandId={brand.id}
                  brandSlug={brand.slug}
                  campaigns={campaignOptions}
                  defaultCampaignId={activeCampaign?.id ?? null}
                />
              </div>
            </div>
            <TaskList
              tasks={visibleTasks}
              brandSlug={brand.slug}
              campaigns={campaignOptions}
              emptyTitle={taskEmptyTitle}
              emptyDescription={taskEmptyDescription}
            />
          </div>
        </WorkspaceSection>
        <WorkspaceSection
          id="assets"
          title="Assets"
          description={assetSectionDescription}
        >
          <div className={stackClass}>
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add an asset</p>
              <p className="mt-1 text-sm text-ink-muted">
                Start with the record. Link the external source or save the intended storage path, then organize the work around it.
              </p>
              <div className="mt-4">
                <AssetCreateForm
                  brandId={brand.id}
                  brandSlug={brand.slug}
                  campaigns={campaignOptions}
                  defaultCampaignId={activeCampaign?.id ?? null}
                />
              </div>
            </div>
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
        <WorkspaceSection
          id="contacts"
          title="Contacts"
          description="Core client and partner relationships for fast follow-up."
        >
          <div className={stackClass}>
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add a contact</p>
              <p className="mt-1 text-sm text-ink-muted">
                Keep the key people around this brand close to the work.
              </p>
              <div className="mt-4">
                <ContactCreateForm brandId={brand.id} brandSlug={brand.slug} />
              </div>
            </div>
            <ContactList
              contacts={brand.contacts}
              brandSlug={brand.slug}
              allowDelete
            />
          </div>
        </WorkspaceSection>
        <WorkspaceSection
          id="upcoming"
          title="Upcoming"
          description={upcomingSectionDescription}
        >
          <div className={stackClass}>
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add an upcoming item</p>
              <p className="mt-1 text-sm text-ink-muted">
                Keep launches, deadlines, meetings, and reminders visible in the workspace timeline.
              </p>
              <div className="mt-4">
                <UpcomingCreateForm
                  brandId={brand.id}
                  brandSlug={brand.slug}
                  campaigns={campaignOptions}
                  defaultCampaignId={activeCampaign?.id ?? null}
                />
              </div>
            </div>
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
      </div>
    </section>
  );
}

type WorkspaceSectionProps = {
  id?: string;
  title: string;
  description: string;
  children: ReactNode;
};

function WorkspaceSection({
  id,
  title,
  description,
  children,
}: WorkspaceSectionProps) {
  return (
    <Card id={id}>
      <SectionHeader title={title} description={description} />
      <div className="mt-6">{children}</div>
    </Card>
  );
}
