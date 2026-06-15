"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  tone?: "primary" | "danger";
};

export function SubmitButton({
  idleLabel,
  pendingLabel,
  tone = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const className =
    tone === "danger"
      ? "inline-flex min-h-11 items-center rounded-full bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex min-h-11 items-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
