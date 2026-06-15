"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { cx } from "@/components/ui";

type ConfirmSubmitButtonProps = {
  idleLabel: string;
  confirmLabel: string;
  confirmPrompt?: string;
  className?: string;
};

function ConfirmingSubmitButton({
  confirmLabel,
}: {
  confirmLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Removing..." : confirmLabel}
    </button>
  );
}

export function ConfirmSubmitButton({
  idleLabel,
  confirmLabel,
  confirmPrompt = "Confirm removal",
  className,
}: ConfirmSubmitButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className={cx(
          "inline-flex min-h-11 items-center justify-center rounded-full border border-danger/20 bg-danger-soft px-3 py-2 text-sm font-medium text-danger hover:opacity-90",
          className,
        )}
      >
        {idleLabel}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-danger">
        {confirmPrompt}
      </span>
      <button
        type="button"
        onClick={() => setIsConfirming(false)}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-app-line px-3 py-2 text-sm font-medium text-ink hover:bg-app-soft"
      >
        Cancel
      </button>
      <ConfirmingSubmitButton confirmLabel={confirmLabel} />
    </div>
  );
}
