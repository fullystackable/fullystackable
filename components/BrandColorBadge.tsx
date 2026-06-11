import { cx } from "@/components/ui";
import { normalizeBrandColor, toBrandColorRgba } from "@/lib/brand-colors";

type BrandColorBadgeProps = {
  color: string | null | undefined;
  label: string;
  className?: string;
  size?: "sm" | "xs";
};

export function BrandColorBadge({
  color,
  label,
  className,
  size = "sm",
}: BrandColorBadgeProps) {
  const normalizedColor = normalizeBrandColor(color);

  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border font-medium text-ink",
        size === "xs" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        className,
      )}
      style={{
        backgroundColor: toBrandColorRgba(normalizedColor, 0.1),
        borderColor: toBrandColorRgba(normalizedColor, 0.24),
      }}
    >
      <span
        aria-hidden="true"
        className={cx("shrink-0 rounded-full", size === "xs" ? "h-2 w-2" : "h-2.5 w-2.5")}
        style={{ backgroundColor: normalizedColor }}
      />
      <span>{label}</span>
    </span>
  );
}
