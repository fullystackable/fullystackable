export const defaultBrandColor = "#0F766E";

export const brandColorPalette = [
  { label: "Teal", value: "#0F766E" },
  { label: "Ocean", value: "#0C4A6E" },
  { label: "Blue", value: "#1D4ED8" },
  { label: "Indigo", value: "#4338CA" },
  { label: "Berry", value: "#9D174D" },
  { label: "Rose", value: "#E11D48" },
  { label: "Orange", value: "#C2410C" },
  { label: "Amber", value: "#D97706" },
  { label: "Lime", value: "#4D7C0F" },
  { label: "Emerald", value: "#047857" },
  { label: "Slate", value: "#475569" },
  { label: "Espresso", value: "#7C2D12" },
] as const;

const brandColorPattern = /^#[0-9a-f]{6}$/i;

export function normalizeBrandColor(value: string | null | undefined) {
  if (!value) {
    return defaultBrandColor;
  }

  const normalized = value.trim();

  if (!brandColorPattern.test(normalized)) {
    return defaultBrandColor;
  }

  return normalized.toUpperCase();
}

export function toBrandColorRgba(
  value: string | null | undefined,
  alpha: number,
) {
  const normalized = normalizeBrandColor(value);
  const red = Number.parseInt(normalized.slice(1, 3), 16);
  const green = Number.parseInt(normalized.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.slice(5, 7), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
