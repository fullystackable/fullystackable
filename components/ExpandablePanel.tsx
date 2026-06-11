"use client";

import { useState, type ReactNode } from "react";

type ExpandablePanelProps = {
  title: string;
  description: string;
  buttonLabel: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function ExpandablePanel({
  title,
  description,
  buttonLabel,
  children,
  defaultOpen = false,
}: ExpandablePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="app-subtle-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          className="inline-flex items-center justify-center rounded-full border border-app-line bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-app-soft"
        >
          {isOpen ? "Hide form" : buttonLabel}
        </button>
      </div>

      {isOpen ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
