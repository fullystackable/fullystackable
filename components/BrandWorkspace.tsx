import type { ReactNode } from "react";

import { AssetList } from "@/components/AssetList";
import { AssetCreateForm } from "@/components/AssetCreateForm";
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
import { Badge, Card, SectionHeader } from "@/components/ui";
import { brandStatusTones } from "@/lib/design";
import type { BrandWorkspaceData } from "@/lib/workspace-view";

type BrandWorkspaceProps = {
  brand: BrandWorkspaceData;
};

export function BrandWorkspace({ brand }: BrandWorkspaceProps) {
  const openTasks = brand.tasks.filter(
    (task) => task.status !== "Done" && task.status !== "Archived",
  ).length;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
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

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkspaceSection
          id="campaigns"
          title="Campaigns"
          description="The brand's active pushes, launch windows, and initiative-level context."
        >
          <div className="space-y-6">
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
            />
          </div>
        </WorkspaceSection>
        <WorkspaceSection
          id="tasks"
          title="Tasks"
          description="Campaign execution, approvals, and production milestones."
        >
          <div className="space-y-6">
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add a task</p>
              <p className="mt-1 text-sm text-ink-muted">
                Keep the workspace current with new execution items as they appear.
              </p>
              <div className="mt-4">
                <TaskCreateForm brandId={brand.id} brandSlug={brand.slug} />
              </div>
            </div>
            <TaskList tasks={brand.tasks} brandSlug={brand.slug} />
          </div>
        </WorkspaceSection>
        <WorkspaceSection
          id="assets"
          title="Assets"
          description="Metadata-first asset records for links, uploads, and references."
        >
          <div className="space-y-6">
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add an asset</p>
              <p className="mt-1 text-sm text-ink-muted">
                Start with the record. Link the external source or save the intended storage path, then organize the work around it.
              </p>
              <div className="mt-4">
                <AssetCreateForm brandId={brand.id} brandSlug={brand.slug} />
              </div>
            </div>
            <AssetList assets={brand.assets} brandSlug={brand.slug} allowDelete />
          </div>
        </WorkspaceSection>
        <WorkspaceSection
          id="contacts"
          title="Contacts"
          description="Core client and partner relationships for fast follow-up."
        >
          <div className="space-y-6">
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
          <div className="space-y-6">
            <div className="app-subtle-card p-4">
              <p className="text-sm font-semibold text-ink">Add an upcoming item</p>
              <p className="mt-1 text-sm text-ink-muted">
                Keep launches, deadlines, meetings, and reminders visible in the workspace timeline.
              </p>
              <div className="mt-4">
                <UpcomingCreateForm brandId={brand.id} brandSlug={brand.slug} />
              </div>
            </div>
            <UpcomingList
              items={brand.upcoming}
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
