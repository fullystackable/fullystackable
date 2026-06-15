"use client";

import { useState } from "react";

import { updateUpcomingItem } from "@/app/actions/workspace";
import { CampaignSelectField } from "@/components/CampaignSelectField";

import { SubmitButton } from "@/components/SubmitButton";
import type {
  WorkspaceCampaign,
  WorkspaceUpcomingItem,
} from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type UpcomingEditFormProps = {
  item: WorkspaceUpcomingItem;
  brandSlug: string;
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
};

export function UpcomingEditForm({
  item,
  brandSlug,
  campaigns,
}: UpcomingEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);

  if (!isEditing) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
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
    const result = await updateUpcomingItem(initialState, formData);
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
      <input type="hidden" name="upcomingItemId" value={item.id} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Title</span>
        <input
          name="title"
          required
          defaultValue={item.title}
          className="app-input"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Date</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={item.date}
            className="app-input"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Type</span>
          <select
            name="type"
            defaultValue={item.typeValue}
            className="app-input"
          >
            <option value="meeting">Meeting</option>
            <option value="event">Event</option>
            <option value="campaign_launch">Campaign launch</option>
            <option value="deadline">Deadline</option>
            <option value="reminder">Reminder</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            name="status"
            defaultValue={item.statusValue}
            className="app-input"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
            <option value="postponed">Postponed</option>
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={item.notes ?? ""}
          className="app-input min-h-24 resize-y"
        />
      </label>

      <CampaignSelectField
        campaigns={campaigns}
        defaultValue={item.relatedCampaignId ?? ""}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
        >
          Cancel
        </button>
        <SubmitButton idleLabel="Save item" pendingLabel="Saving..." />
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
