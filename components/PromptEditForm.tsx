"use client";

import { useState } from "react";

import { updatePrompt } from "@/app/actions/workspace";
import { SubmitButton } from "@/components/SubmitButton";
import type { WorkspacePrompt } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type PromptEditFormProps = {
  prompt: WorkspacePrompt;
  brandSlug: string;
};

export function PromptEditForm({ prompt, brandSlug }: PromptEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [label, setLabel] = useState(prompt.label);
  const [body, setBody] = useState(prompt.prompt);

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
          <p className="order-last basis-full text-sm text-success" aria-live="polite">
            {message}
          </p>
        ) : null}
      </>
    );
  }

  async function handleSubmit(formData: FormData) {
    const result = await updatePrompt(initialState, formData);
    setMessage(result.message);
    setWasSuccessful(result.success);

    if (result.success) {
      setIsEditing(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="order-last mt-4 w-full basis-full space-y-4 rounded-2xl border border-app-line bg-app-surface p-4"
    >
      <input type="hidden" name="promptId" value={prompt.id} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Label</span>
        <input
          name="label"
          required
          value={label}
          onChange={(event) => setLabel(event.currentTarget.value)}
          className="app-input"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Prompt</span>
        <textarea
          name="prompt"
          required
          rows={8}
          value={body}
          onChange={(event) => setBody(event.currentTarget.value)}
          className="app-input min-h-40 resize-y"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setLabel(prompt.label);
            setBody(prompt.prompt);
            setIsEditing(false);
          }}
          className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
        >
          Cancel
        </button>
        <SubmitButton idleLabel="Save prompt" pendingLabel="Saving..." />
      </div>

      {message && !wasSuccessful ? (
        <p className="text-sm text-danger" aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  );
}
