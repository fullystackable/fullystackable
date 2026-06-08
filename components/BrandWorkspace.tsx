import type { ReactNode } from "react";

import { AssetList } from "@/components/AssetList";
import { AssetCreateForm } from "@/components/AssetCreateForm";
import { BrandEditForm } from "@/components/BrandEditForm";
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
import { Badge, Card, SectionHeader, cx } from "@/components/ui";
import { brandStatusTones } from "@/lib/design";
import type { BrandWorkspaceData, WorkspaceDensity } from "@/lib/workspace-view";

type BrandWorkspaceProps = {
  brand: BrandWorkspaceData;
  activeCampaignId?: string | null;
  taskSort?: "due_asc" | "priority_desc" | "status" | "title";
  assetSort?: "updated_desc" | "priority_desc" | "type" | "title";
  upcomingSort?: "date_asc" | "type" | "status" | "title";
  density?: WorkspaceDensity;
};

export function BrandWorkspace({
  brand,
  activeCampaignId = null,
  taskSort = "due_asc",
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
  const filteredAssets = activeCampaign
    ? brand.assets.filter((asset) => asset.relatedCampaignId === activeCampaign.id)
    : brand.assets;
  const filteredUpcoming = activeCampaign
    ? brand.upcoming.filter((item) => item.relatedCampaignId === activeCampaign.id)
    : brand.upcoming;
  const visibleTasks = [...filteredTasks].sort((left, right) => {
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
  const openTasks = visibleTasks.filter(
    (task) => task.status !== "Done" && task.status !== "Archived",
  ).length;
  const campaignOptions = brand.campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
  }));
  const hasCustomSorts =
    taskSort !== "due_asc" ||
    assetSort !== "updated_desc" ||
    upcomingSort !== "date_asc";
  const hasCustomSettings = hasCustomSorts || density !== "comfortable";
  const topGridClass = isCompact
    ? "grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]"
    : "grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]";
  const sectionGridClass = isCompact ? "grid gap-4 xl:grid-cols-2" : "grid gap-6 xl:grid-cols-2";
  const stackClass = isCompact ? "space-y-4" : "space-y-6";

  return (
    <section
      className={cx(
        isCompact ? "workspace-density-compact space-y-4" : "space-y-6",
      )}
    >
      <div className={topGridClass}>
        <Card>
          <SectionHeader
            eyebrow="Overview"
            title="Brand snapshot"
            description="A practical operating summary of the current brand status, workload, and core reference points."
            action={<Badge tone={brandStatusTones[brand.status]}>{brand.status}</Badge>}
          />

          <p className="mt-5 max-w-3xl text-sm leading-7 text-ink-muted sm:text-base">
            {brand.description}
          </p>

          {brand.brandNotes ? (
            <div className="mt-6 rounded-2xl border border-app-line bg-app-soft px-4 py-4">
              <p className="text-sm font-semibold text-ink">Brand notes</p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {brand.brandNotes}
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="metric-tile">
              <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                Website
              </p>
              {brand.website ? (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-medium text-accent hover:text-app-sidebar"
                >
                  {brand.website}
                </a>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">No website added</p>
              )}
            </div>
            <div className="metric-tile">
              <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                Open tasks
              </p>
              <p className="mt-3 text-3xl font-semibold text-ink">{openTasks}</p>
            </div>
            <div className="metric-tile">
              <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                Active contacts
              </p>
              <p className="mt-3 text-3xl font-semibold text-ink">
                {brand.contacts.length}
              </p>
            </div>
          </div>

          <BrandEditForm
            brand={{
              id: brand.id,
              slug: brand.slug,
              name: brand.name,
              descriptionValue: brand.descriptionValue,
              website: brand.website,
              statusValue: brand.statusValue,
              brandNotes: brand.brandNotes,
            }}
          />
        </Card>

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

      <WorkspaceCampaignFilter
        brandSlug={brand.slug}
        campaigns={campaignOptions}
        activeCampaignId={activeCampaign?.id ?? null}
        activeCampaignTitle={activeCampaign?.title ?? null}
        taskSort={taskSort}
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
          description="Campaign execution, approvals, and production milestones."
        >
          <div className={stackClass}>
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add a task</p>
              <p className="mt-1 text-sm text-ink-muted">
                Keep the workspace current with new execution items as they appear.
              </p>
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
            />
          </div>
        </WorkspaceSection>
        <WorkspaceSection
          id="assets"
          title="Assets"
          description="Metadata-first asset records for links, uploads, and references."
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
          description="Meetings, launches, deadlines, and moments to prepare for."
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
