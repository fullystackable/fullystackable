"use client";

import { useActionState, useEffect, useRef } from "react";

import { createCampaign } from "@/app/actions/workspace";

import { SubmitButton } from "@/components/SubmitButton";

const initialState = {
  success: false,
  message: "",
};

type CampaignCreateFormProps = {
  brandId: string;
  brandSlug: string;
};

export function CampaignCreateForm({
  brandId,
  brandSlug,
}: CampaignCreateFormProps) {
  const [state, formAction] = useActionState(createCampaign, initialState);
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
        <span className="text-sm font-medium text-ink">Campaign title</span>
        <input
          name="title"
          required
          className="app-input"
          placeholder="Summer Escape Launch"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select name="status" defaultValue="planned" className="app-input">
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
            className="app-input"
            placeholder="Launch offer, refresh creative, improve retargeting"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Launch date</span>
          <input name="launchDate" type="date" className="app-input" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Start date</span>
          <input name="startDate" type="date" className="app-input" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">End date</span>
          <input name="endDate" type="date" className="app-input" />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Description</span>
        <textarea
          name="description"
          rows={3}
          className="app-input min-h-24 resize-y"
          placeholder="What this campaign covers and what it is trying to accomplish."
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="app-input min-h-24 resize-y"
          placeholder="Optional campaign context, dependencies, or handoff notes."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Campaigns give tasks, assets, and future work a shared initiative to orbit around. Extended details can be filled in from the campaign page.
        </p>
        <SubmitButton idleLabel="Add campaign" pendingLabel="Adding..." />
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
