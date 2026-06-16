"use client";

import { useActionState, useEffect, useRef } from "react";

import { createNote } from "@/app/actions/workspace";

import { SubmitButton } from "@/components/SubmitButton";

const initialState = {
  success: false,
  message: "",
};

type NoteCreateFormProps = {
  brandId: string;
  brandSlug: string;
};

export function NoteCreateForm({ brandId, brandSlug }: NoteCreateFormProps) {
  const [state, formAction] = useActionState(createNote, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === "Enter" || event.key === "NumpadEnter")
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

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
          className="app-input"
          placeholder="Narrative direction"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Category</span>
          <select name="category" defaultValue="random" className="app-input">
            <option value="brand_voice">Brand voice</option>
            <option value="audience">Audience</option>
            <option value="cta">CTA</option>
            <option value="pricing">Pricing</option>
            <option value="reminder">Reminder</option>
            <option value="strategy">Strategy</option>
            <option value="random">Random</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-app-line bg-white/80 px-4 py-3 text-sm text-ink">
          <input type="checkbox" name="pinned" className="h-4 w-4 accent-[var(--app-accent)]" />
          Pin this note near the top
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Note</span>
        <textarea
          name="body"
          required
          rows={4}
          className="app-input min-h-28 resize-y"
          placeholder="Add the context the team should keep close while executing."
          onKeyDown={handleTextareaKeyDown}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Notes also feed the dashboard and today view. Press Ctrl/Cmd + Enter to save.
        </p>
        <SubmitButton idleLabel="Add note" pendingLabel="Adding..." />
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
