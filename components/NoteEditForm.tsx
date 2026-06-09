"use client";

import { useState } from "react";

import { updateNote } from "@/app/actions/workspace";

import { SubmitButton } from "@/components/SubmitButton";
import type { WorkspaceNote } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type NoteEditFormProps = {
  note: WorkspaceNote;
  brandSlug: string;
};

export function NoteEditForm({ note, brandSlug }: NoteEditFormProps) {
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
    const result = await updateNote(initialState, formData);
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
      <input type="hidden" name="noteId" value={note.id} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Title</span>
        <input name="title" defaultValue={note.title ?? ""} className="app-input" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Category</span>
          <select
            name="category"
            defaultValue={note.categoryValue ?? "random"}
            className="app-input"
          >
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
          <input
            type="checkbox"
            name="pinned"
            defaultChecked={note.pinned}
            className="h-4 w-4 accent-[var(--app-accent)]"
          />
          Pin this note near the top
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Note</span>
        <textarea
          name="body"
          required
          rows={4}
          defaultValue={note.text}
          className="app-input min-h-28 resize-y"
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
        <SubmitButton idleLabel="Save note" pendingLabel="Saving..." />
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
