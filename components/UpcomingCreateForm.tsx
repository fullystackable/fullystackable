"use client";

import { useActionState, useEffect, useRef } from "react";

import { createUpcomingItem } from "@/app/actions/workspace";
import { CampaignSelectField } from "@/components/CampaignSelectField";

import { SubmitButton } from "@/components/SubmitButton";
import type { WorkspaceCampaign } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type UpcomingCreateFormProps = {
  brandId: string;
  brandSlug: string;
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  defaultCampaignId?: string | null;
};

export function UpcomingCreateForm({
  brandId,
  brandSlug,
  campaigns,
  defaultCampaignId = null,
}: UpcomingCreateFormProps) {
  const [state, formAction] = useActionState(createUpcomingItem, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Title</span>
        <input
          name="title"
          required
          className="app-input"
          placeholder="Summer escape launch"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Date</span>
          <input name="date" type="date" required className="app-input" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Type</span>
          <select name="type" defaultValue="reminder" className="app-input">
            <option value="meeting">Meeting</option>
            <option value="event">Event</option>
            <option value="campaign_launch">Campaign launch</option>
            <option value="deadline">Deadline</option>
            <option value="reminder">Reminder</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select name="status" defaultValue="scheduled" className="app-input">
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
            <option value="postponed">Postponed</option>
          </select>
        </label>
        <div className="rounded-2xl border border-app-line bg-app-soft/90 px-4 py-3 text-sm text-ink">
          Timeline items show up on the dashboard automatically after save.
        </div>
      </div>

      <CampaignSelectField
        campaigns={campaigns}
        defaultValue={defaultCampaignId ?? ""}
      />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="app-input min-h-24 resize-y"
          placeholder="Optional prep notes, meeting context, or delivery details."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Use this for launches, meetings, deadlines, reminders, and seasonal timing.
        </p>
        <SubmitButton idleLabel="Add upcoming item" pendingLabel="Adding..." />
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
