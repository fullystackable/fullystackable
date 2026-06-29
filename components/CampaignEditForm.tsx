"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateCampaign } from "@/app/actions/workspace";
import { SubmitButton } from "@/components/SubmitButton";
import { cx } from "@/components/ui";
import type { WorkspaceCampaign } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type CampaignEditFormProps = {
  campaign: WorkspaceCampaign;
  brandSlug: string;
  buttonLabel?: string;
  alwaysExpanded?: boolean;
  framed?: boolean;
};

export function CampaignEditForm({
  campaign,
  brandSlug,
  buttonLabel = "Edit",
  alwaysExpanded = false,
  framed = true,
}: CampaignEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const router = useRouter();

  if (!alwaysExpanded && !isEditing) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
        >
          {buttonLabel}
        </button>
        {wasSuccessful && message ? (
          <p
            className="order-last basis-full text-sm text-success"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
      </>
    );
  }

  async function handleSubmit(formData: FormData) {
    const result = await updateCampaign(initialState, formData);
    setMessage(result.message);
    setWasSuccessful(result.success);

    if (result.success) {
      router.refresh();
      setIsEditing(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className={cx(
        "order-last w-full basis-full space-y-4",
        alwaysExpanded ? "" : "mt-4",
        framed ? "rounded-2xl border border-app-line bg-app-surface p-4" : "",
      )}
    >
      <input type="hidden" name="campaignId" value={campaign.id} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Campaign title</span>
        <input
          name="title"
          required
          defaultValue={campaign.title}
          className="app-input"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            name="status"
            defaultValue={campaign.statusValue}
            className="app-input"
          >
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Goals</span>
          <input
            name="goals"
            defaultValue={campaign.goals.join(", ")}
            className="app-input"
            placeholder="Launch offer, refresh creative, improve retargeting"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Launch date</span>
          <input
            name="launchDate"
            type="date"
            defaultValue={campaign.launchDate ?? ""}
            className="app-input"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Start date</span>
          <input
            name="startDate"
            type="date"
            defaultValue={campaign.startDate ?? ""}
            className="app-input"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">End date</span>
          <input
            name="endDate"
            type="date"
            defaultValue={campaign.endDate ?? ""}
            className="app-input"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={campaign.description ?? ""}
          className="app-input min-h-24 resize-y"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={campaign.notes ?? ""}
          className="app-input min-h-24 resize-y"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Content ideas</span>
          <textarea
            name="contentIdeas"
            rows={4}
            defaultValue={campaign.contentIdeas ?? ""}
            className="app-input min-h-28 resize-y"
            placeholder="One idea per line"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Links</span>
          <textarea
            name="links"
            rows={4}
            defaultValue={campaign.links ?? ""}
            className="app-input min-h-28 resize-y"
            placeholder="One link per line"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Results / post-campaign notes</span>
        <textarea
          name="resultsNotes"
          rows={4}
          defaultValue={campaign.resultsNotes ?? ""}
          className="app-input min-h-28 resize-y"
          placeholder="What happened, what worked, and what to carry forward."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {alwaysExpanded ? (
          <p className="text-sm text-ink-muted">
            Update campaign details directly from this workspace.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
          >
            Cancel
          </button>
        )}
        <SubmitButton idleLabel="Save campaign" pendingLabel="Saving..." />
      </div>

      {message && !wasSuccessful ? (
        <p
          className="text-sm text-danger"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
