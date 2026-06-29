"use client";

import { useId, useState } from "react";

import { BrandColorBadge } from "@/components/BrandColorBadge";
import {
  brandColorPalette,
  defaultBrandColor,
  normalizeBrandColor,
} from "@/lib/brand-colors";

type BrandColorFieldProps = {
  name: string;
  defaultValue?: string | null;
  label?: string;
  description?: string;
};

export function BrandColorField({
  name,
  defaultValue = defaultBrandColor,
  label = "Brand color",
  description = "Used in the brand directory, workspace, and calendar planner for faster scanning.",
}: BrandColorFieldProps) {
  const inputId = useId();
  const normalizedDefaultValue = normalizeBrandColor(defaultValue);
  const [selectedColor, setSelectedColor] = useState(normalizedDefaultValue);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
        <p className="text-sm leading-6 text-ink-muted">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-app-line bg-app-soft/60 px-4 py-4">
        <input
          id={inputId}
          name={name}
          type="color"
          value={selectedColor}
          onChange={(event) => setSelectedColor(normalizeBrandColor(event.target.value))}
          className="h-12 w-16 cursor-pointer rounded-xl border border-app-line bg-white p-1"
        />
        <div className="min-w-0 space-y-2">
          <BrandColorBadge color={selectedColor} label={`Preview ${selectedColor}`} />
          <p className="text-xs text-ink-muted">
            Pick from the palette or fine-tune the swatch.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {brandColorPalette.map((option) => {
          const isSelected = selectedColor === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedColor(option.value)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "border-app-line-strong bg-app-surface text-ink shadow-app-soft"
                  : "border-app-line bg-app-soft/90 text-ink-muted hover:bg-app-soft hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: option.value }}
              />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
