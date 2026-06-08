"use client";

import { useState } from "react";

import { updateBrand } from "@/app/actions/workspace";
import { SubmitButton } from "@/components/SubmitButton";
import type { BrandStatusValue } from "@/lib/workspace-view";

const initialState = {
  success: false,
  message: "",
};

type BrandEditFormProps = {
  brand: {
    id: string;
    slug: string;
    name: string;
    descriptionValue: string | null;
    website: string | null;
    statusValue: BrandStatusValue;
    brandNotes: string | null;
  };
  buttonLabel?: string;
};

export function BrandEditForm({
  brand,
  buttonLabel = "Edit brand",
}: BrandEditFormProps) {
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
        {buttonLabel}
      </button>
    );
  }

  async function handleSubmit(formData: FormData) {
    const result = await updateBrand(initialState, formData);
    setMessage(result.message);
    setWasSuccessful(result.success);

    if (result.success) {
      setIsEditing(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="mt-6 space-y-4 rounded-2xl border border-app-line bg-white/90 p-4"
    >
      <input type="hidden" name="brandId" value={brand.id} />
      <input type="hidden" name="brandSlug" value={brand.slug} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Brand name</span>
          <input
            name="name"
            required
            defaultValue={brand.name}
            className="app-input"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Website</span>
          <input
            name="website"
            type="url"
            defaultValue={brand.website ?? ""}
            className="app-input"
            placeholder="https://example.com"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Status</span>
        <select
          name="status"
          defaultValue={brand.statusValue}
          className="app-input"
        >
          <option value="active">On track</option>
          <option value="needs_attention">Needs attention</option>
          <option value="launching">Launching soon</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Description</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={brand.descriptionValue ?? ""}
          className="app-input min-h-28 resize-y"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Brand notes</span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={brand.brandNotes ?? ""}
          className="app-input min-h-28 resize-y"
          placeholder="Optional operating notes that belong to the brand itself."
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
        <SubmitButton idleLabel="Save brand" pendingLabel="Saving..." />
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
