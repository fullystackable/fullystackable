"use client";

import { useState } from "react";

import { updateTask } from "@/app/actions/workspace";

import { SubmitButton } from "@/components/SubmitButton";
import type { WorkspaceTask } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type TaskEditFormProps = {
  task: WorkspaceTask;
  brandSlug: string;
};

export function TaskEditForm({ task, brandSlug }: TaskEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-sm font-medium text-ink-muted hover:text-ink"
      >
        Edit
      </button>
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
      className="mt-4 space-y-4 rounded-2xl border border-app-line bg-white/90 p-4"
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
            defaultValue={task.status.toLowerCase().replace(/\s+/g, "_")}
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
            defaultValue={task.priority.toLowerCase()}
            className="app-input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </div>

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

      {message ? (
        <p
          className={`text-sm ${wasSuccessful ? "text-success" : "text-danger"}`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
