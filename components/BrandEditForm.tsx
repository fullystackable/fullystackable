"use client";

import { useState } from "react";

import { updateBrand } from "@/app/actions/workspace";
import { BrandColorField } from "@/components/BrandColorField";
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
    brandColor: string;
    descriptionValue: string | null;
    website: string | null;
    statusValue: BrandStatusValue;
    brandNotes: string | null;
    brandVoice?: string | null;
    commonCtas?: string | null;
    audienceNotes?: string | null;
    servicesProducts?: string | null;
    pricingNotes?: string | null;
    positioningNotes?: string | null;
    doDontList?: string | null;
    referenceLinks?: string | null;
  };
  buttonLabel?: string;
  alwaysExpanded?: boolean;
  framed?: boolean;
};

export function BrandEditForm({
  brand,
  buttonLabel = "Edit brand",
  alwaysExpanded = false,
  framed = true,
}: BrandEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [wasSuccessful, setWasSuccessful] = useState(false);

  if (!alwaysExpanded && !isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
      >
        {buttonLabel}
      </button>
    );
  }

  async function handleSubmit(formData: FormData) {
    const result = await updateBrand(initialState, formData);
    setMessage(result.message);
    setWasSuccessful(result.success);

    if (result.success && !alwaysExpanded) {
      setIsEditing(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className={`space-y-4 ${
        framed ? "rounded-2xl border border-app-line bg-app-surface p-4" : ""
      }`}
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

      <BrandColorField
        name="brandColor"
        defaultValue={brand.brandColor}
      />

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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Brand voice</span>
          <textarea
            name="brandVoice"
            rows={4}
            defaultValue={brand.brandVoice ?? ""}
            className="app-input min-h-28 resize-y"
            placeholder="Tone, style, personality, and how the brand should sound."
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Audience notes</span>
          <textarea
            name="audienceNotes"
            rows={4}
            defaultValue={brand.audienceNotes ?? ""}
            className="app-input min-h-28 resize-y"
            placeholder="Who this brand is speaking to and what matters to them."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Common CTAs</span>
          <textarea
            name="commonCtas"
            rows={4}
            defaultValue={brand.commonCtas ?? ""}
            className="app-input min-h-28 resize-y"
            placeholder="Book now, Request a quote, Schedule a consult"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Services / products</span>
          <textarea
            name="servicesProducts"
            rows={4}
            defaultValue={brand.servicesProducts ?? ""}
            className="app-input min-h-28 resize-y"
            placeholder="Main offers, product lines, or service categories."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Pricing notes</span>
          <textarea
            name="pricingNotes"
            rows={4}
            defaultValue={brand.pricingNotes ?? ""}
            className="app-input min-h-28 resize-y"
            placeholder="Pricing ranges, package logic, objections, or caveats."
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Positioning notes</span>
          <textarea
            name="positioningNotes"
            rows={4}
            defaultValue={brand.positioningNotes ?? ""}
            className="app-input min-h-28 resize-y"
            placeholder="Differentiators, category framing, and market angle."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Do / do not list</span>
          <textarea
            name="doDontList"
            rows={5}
            defaultValue={brand.doDontList ?? ""}
            className="app-input min-h-32 resize-y"
            placeholder="Use clear, direct language. Do not sound corporate or vague."
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Important links</span>
          <textarea
            name="referenceLinks"
            rows={5}
            defaultValue={brand.referenceLinks ?? ""}
            className="app-input min-h-32 resize-y"
            placeholder="One link per line: homepage, drive folder, guidelines, references"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {alwaysExpanded ? (
          <p className="text-sm text-ink-muted">
            Update the brand record directly from this workspace.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex min-h-11 items-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
          >
            Cancel
          </button>
        )}
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
