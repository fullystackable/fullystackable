"use client";

import { useState } from "react";

import { updateCampaign } from "@/app/actions/workspace";
import { SubmitButton } from "@/components/SubmitButton";
import type { WorkspaceCampaign } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type CampaignEditFormProps = {
  campaign: WorkspaceCampaign;
  brandSlug: string;
};

export function CampaignEditForm({
  campaign,
  brandSlug,
}: CampaignEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);

  if (!isEditing) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          Edit
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
      setIsEditing(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="order-last mt-4 w-full basis-full space-y-4 rounded-2xl border border-app-line bg-white/90 p-4"
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
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
