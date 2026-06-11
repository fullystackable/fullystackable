"use client";

import { useState } from "react";

import { updateTask } from "@/app/actions/workspace";
import { CampaignSelectField } from "@/components/CampaignSelectField";
import { SubmitButton } from "@/components/SubmitButton";
import type { WorkspaceCampaign, WorkspaceTask } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type TaskEditFormProps = {
  task: WorkspaceTask;
  brandSlug: string;
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
};

export function TaskEditForm({
  task,
  brandSlug,
  campaigns,
}: TaskEditFormProps) {
  const [isEditing, setIsEditing] = useState(true);
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
    const result = await updateTask(initialState, formData);
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
      <input type="hidden" name="taskId" value={task.id} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Task title</span>
        <input
          name="title"
          required
          defaultValue={task.title}
          className="app-input"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Due date</span>
          <input
            name="dueDate"
            type="date"
            defaultValue={task.dueDate ?? ""}
            className="app-input"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            name="status"
            defaultValue={task.statusValue}
            className="app-input"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In progress</option>
            <option value="needs_review">Needs review</option>
            <option value="done">Done</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Priority</span>
          <select
            name="priority"
            defaultValue={task.priorityValue}
            className="app-input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </div>

      <CampaignSelectField
        campaigns={campaigns}
        defaultValue={task.relatedCampaignId ?? ""}
      />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={task.notes ?? ""}
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
        <SubmitButton idleLabel="Save task" pendingLabel="Saving..." />
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
