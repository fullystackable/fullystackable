"use client";

import { useActionState, useEffect, useState } from "react";

import { createPrompt } from "@/app/actions/workspace";
import { SubmitButton } from "@/components/SubmitButton";

const initialState = {
  success: false,
  message: "",
};

type PromptCreateFormProps = {
  brandId: string;
  brandSlug: string;
};

export function PromptCreateForm({
  brandId,
  brandSlug,
}: PromptCreateFormProps) {
  const [state, formAction] = useActionState(createPrompt, initialState);
  const [label, setLabel] = useState("");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (state.success) {
      setLabel("");
      setPrompt("");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="brandSlug" value={brandSlug} />

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Label</span>
        <input
          name="label"
          required
          value={label}
          onChange={(event) => setLabel(event.currentTarget.value)}
          className="app-input"
          placeholder="Blog Copy"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Prompt</span>
        <textarea
          name="prompt"
          required
          rows={8}
          value={prompt}
          onChange={(event) => setPrompt(event.currentTarget.value)}
          className="app-input min-h-40 resize-y"
          placeholder="Paste the prompt you reuse with your AI tools."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Save reusable prompts here with labels that are quick to scan.
        </p>
        <SubmitButton idleLabel="Add prompt" pendingLabel="Adding..." />
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
