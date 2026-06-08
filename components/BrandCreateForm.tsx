"use client";

import { useActionState, useEffect, useRef } from "react";

import { createBrand } from "@/app/actions/workspace";

import { SubmitButton } from "@/components/SubmitButton";

const initialState = {
  success: false,
  message: "",
};

export function BrandCreateForm() {
  const [state, formAction] = useActionState(createBrand, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Brand name</span>
          <input name="name" required className="app-input" placeholder="Fun Slides" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Website</span>
          <input
            name="website"
            type="url"
            className="app-input"
            placeholder="https://example.com"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Description</span>
        <textarea
          name="description"
          rows={4}
          className="app-input min-h-28 resize-y"
          placeholder="What this brand is working on, what matters most, and how the workspace should be used."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          The slug is generated automatically from the brand name.
        </p>
        <SubmitButton idleLabel="Add brand" pendingLabel="Adding..." />
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
