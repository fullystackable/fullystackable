import type { Brand } from "@/data/mockData";

import { AssetList } from "@/components/AssetList";
import { ContactList } from "@/components/ContactList";
import { TaskList } from "@/components/TaskList";
import { UpcomingList } from "@/components/UpcomingList";

type BrandWorkspaceProps = {
  brand: Brand;
};

const statusStyles: Record<Brand["status"], string> = {
  "On track": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Needs attention": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Launching soon": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
};

export function BrandWorkspace({ brand }: BrandWorkspaceProps) {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">
                Overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Brand snapshot
              </h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[brand.status]}`}>
              {brand.status}
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            {brand.description}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Website
              </p>
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                {brand.website}
              </a>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Open tasks
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {brand.tasks.filter((task) => task.status !== "Done").length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Active contacts
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {brand.contacts.length}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-700">
            Notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Working notes
          </h2>
          <div className="mt-5 space-y-3">
            {brand.notes.map((note) => (
              <article
                key={note}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-600"
              >
                {note}
              </article>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkspaceSection
          title="Tasks"
          description="Campaign execution, approvals, and production milestones."
        >
          <TaskList tasks={brand.tasks} />
        </WorkspaceSection>
        <WorkspaceSection
          title="Assets"
          description="Creative files, decks, briefs, and reference links."
        >
          <AssetList assets={brand.assets} />
        </WorkspaceSection>
        <WorkspaceSection
          title="Contacts"
          description="Core client and partner relationships for fast follow-up."
        >
          <ContactList contacts={brand.contacts} />
        </WorkspaceSection>
        <WorkspaceSection
          title="Upcoming"
          description="Meetings, launches, deadlines, and moments to prepare for."
        >
          <UpcomingList items={brand.upcoming} />
        </WorkspaceSection>
      </div>
    </section>
  );
}

type WorkspaceSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function WorkspaceSection({
  title,
  description,
  children,
}: WorkspaceSectionProps) {
  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
    </article>
  );
}
