"use client";

import { useActionState, useEffect, useRef } from "react";

import { createTask } from "@/app/actions/workspace";

import { SubmitButton } from "@/components/SubmitButton";

const initialState = {
  success: false,
  message: "",
};

type TaskCreateFormProps = {
  brandId: string;
  brandSlug: string;
};

export function TaskCreateForm({ brandId, brandSlug }: TaskCreateFormProps) {
  const [state, formAction] = useActionState(createTask, initialState);
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
        <span className="text-sm font-medium text-ink">Task title</span>
        <input
          name="title"
          required
          className="app-input"
          placeholder="Finalize Q3 webinar landing page copy"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Due date</span>
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
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="app-input min-h-24 resize-y"
          placeholder="Optional execution notes, blockers, or context."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          New tasks start as planned and appear on the dashboard immediately.
        </p>
        <SubmitButton idleLabel="Add task" pendingLabel="Adding..." />
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
