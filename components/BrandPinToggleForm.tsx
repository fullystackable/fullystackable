"use client";

import { useFormStatus } from "react-dom";

import { toggleBrandPinned } from "@/app/actions/workspace";
import { cx } from "@/components/ui";

type BrandPinToggleFormProps = {
  brandId: string;
  isPinned: boolean;
  compact?: boolean;
  className?: string;
};

function PinButton({
  isPinned,
  compact,
}: {
  isPinned: boolean;
  compact: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition",
        isPinned
          ? "border-warning/25 bg-warning-soft text-warning hover:opacity-90"
          : "border-app-line bg-app-surface text-ink-muted hover:bg-app-soft hover:text-ink",
        compact ? "px-3 py-1.5 text-xs" : "",
      )}
      disabled={pending}
      aria-label={isPinned ? "Unpin brand" : "Pin brand"}
    >
      {pending ? "Saving..." : isPinned ? "Pinned" : "Pin brand"}
    </button>
  );
}

export function BrandPinToggleForm({
  brandId,
  isPinned,
  compact = false,
  className,
}: BrandPinToggleFormProps) {
  return (
    <form action={toggleBrandPinned} className={className}>
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="isPinned" value={String(isPinned)} />
      <PinButton isPinned={isPinned} compact={compact} />
    </form>
  );
}
