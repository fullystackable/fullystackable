"use client";

import { useActionState, useMemo, useState } from "react";

import {
  completeCampaignObjective,
  createTask,
  createUpcomingItem,
} from "@/app/actions/workspace";
import { SubmitButton } from "@/components/SubmitButton";
import { Badge, cx } from "@/components/ui";
import type { BrandDirectoryItem } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type BrandQuickActionsProps = {
  brand: Pick<BrandDirectoryItem, "id" | "slug" | "name" | "campaigns">;
};

type QuickActionTab = "task" | "deadline" | "objective";

const quickActionTabs: Array<{ id: QuickActionTab; label: string }> = [
  { id: "task", label: "Quick task" },
  { id: "deadline", label: "Quick deadline" },
  { id: "objective", label: "Complete objective" },
];

export function BrandQuickActions({ brand }: BrandQuickActionsProps) {
  const [activeTab, setActiveTab] = useState<QuickActionTab>("task");

  return (
    <section className="rounded-2xl border border-app-line bg-app-soft/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Quick edit</p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Use this card for operational moves, not long-term brand profile edits.
          </p>
        </div>
        <Badge>{brand.campaigns.length} campaigns</Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickActionTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cx(
              "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium",
              activeTab === tab.id
                ? "bg-app-sidebar text-white"
                : "border border-app-line bg-white text-ink-muted hover:bg-app-soft hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "task" ? <QuickTaskForm brand={brand} /> : null}
        {activeTab === "deadline" ? <QuickDeadlineForm brand={brand} /> : null}
        {activeTab === "objective" ? <QuickObjectiveForm brand={brand} /> : null}
      </div>
    </section>
  );
}

function QuickTaskForm({ brand }: BrandQuickActionsProps) {
  const [state, formAction] = useActionState(createTask, initialState);
  const campaignOptions = useMemo(
    () => brand.campaigns.filter((campaign) => campaign.statusValue !== "completed"),
    [brand.campaigns],
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="brandId" value={brand.id} />
      <input type="hidden" name="brandSlug" value={brand.slug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Task</span>
        <input
          name="title"
          required
          className="app-input"
          placeholder="Draft launch email copy"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Due</span>
          <input name="dueDate" type="date" className="app-input" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Priority</span>
          <select name="priority" defaultValue="medium" className="app-input">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Campaign</span>
          <select name="relatedCampaignId" defaultValue="" className="app-input">
            <option value="">No campaign</option>
            {campaignOptions.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Lightweight task capture for fast brand operations.
        </p>
        <SubmitButton idleLabel="Add quick task" pendingLabel="Adding..." />
      </div>

      {state.message ? (
        <p
          className={`text-sm ${state.success ? "text-success" : "text-danger"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function QuickDeadlineForm({ brand }: BrandQuickActionsProps) {
  const [state, formAction] = useActionState(createUpcomingItem, initialState);
  const campaignOptions = useMemo(
    () => brand.campaigns.filter((campaign) => campaign.statusValue !== "completed"),
    [brand.campaigns],
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="brandId" value={brand.id} />
      <input type="hidden" name="brandSlug" value={brand.slug} />
      <input type="hidden" name="type" value="deadline" />
      <input type="hidden" name="status" value="scheduled" />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Deadline</span>
        <input
          name="title"
          required
          className="app-input"
          placeholder="Final approval due"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Date</span>
          <input name="date" type="date" required className="app-input" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Campaign</span>
          <select name="relatedCampaignId" defaultValue="" className="app-input">
            <option value="">No campaign</option>
            {campaignOptions.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Fast deadline capture for launch timing and approvals.
        </p>
        <SubmitButton idleLabel="Add deadline" pendingLabel="Adding..." />
      </div>

      {state.message ? (
        <p
          className={`text-sm ${state.success ? "text-success" : "text-danger"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function QuickObjectiveForm({ brand }: BrandQuickActionsProps) {
  const [state, formAction] = useActionState(completeCampaignObjective, initialState);
  const activeCampaigns = useMemo(
    () =>
      brand.campaigns.filter(
        (campaign) =>
          campaign.statusValue !== "completed" && campaign.statusValue !== "archived",
      ),
    [brand.campaigns],
  );

  if (activeCampaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-app-line bg-white/75 px-4 py-4">
        <p className="text-sm font-semibold text-ink">No active objectives to complete</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Once this brand has planned or active campaigns, you can mark them complete from here.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="brandSlug" value={brand.slug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Objective / campaign</span>
        <select name="campaignId" required defaultValue={activeCampaigns[0]?.id ?? ""} className="app-input">
          {activeCampaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.title}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Completed on</span>
        <input name="completedOn" type="date" className="app-input" />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Marks the selected campaign objective as completed and removes it from active planning.
        </p>
        <SubmitButton idleLabel="Mark complete" pendingLabel="Saving..." />
      </div>

      {state.message ? (
        <p
          className={`text-sm ${state.success ? "text-success" : "text-danger"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
