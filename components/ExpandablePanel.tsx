"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ExpandablePanelProps = {
  title: string;
  description: string;
  buttonLabel: string;
  children: ReactNode;
  defaultOpen?: boolean;
  alwaysVisible?: boolean;
};

export function ExpandablePanel({
  title,
  description,
  buttonLabel,
  children,
  defaultOpen = false,
  alwaysVisible = false,
}: ExpandablePanelProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (alwaysVisible) {
      return;
    }

    const details = detailsRef.current;

    if (!details) {
      return;
    }

    setIsOpen(details.open);
  }, [alwaysVisible]);

  useEffect(() => {
    if (alwaysVisible) {
      return;
    }

    const details = detailsRef.current;

    if (!details) {
      return;
    }

    if (isOpen) {
      details.setAttribute("open", "");
      return;
    }

    details.removeAttribute("open");
  }, [alwaysVisible, isOpen]);

  if (alwaysVisible) {
    return (
      <div className="app-subtle-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
          </div>
          <span className="inline-flex w-full items-center justify-center rounded-full border border-app-line bg-white px-3 py-1.5 text-sm font-medium text-ink sm:w-auto">
            {buttonLabel}
          </span>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    );
  }

  return (
    <details
      ref={detailsRef}
      className="app-subtle-card p-4"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={defaultOpen ? true : undefined}
    >
      <summary
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide form" : buttonLabel}
        className="list-none cursor-pointer [&::-webkit-details-marker]:hidden"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
          </div>
          <span className="inline-flex w-full items-center justify-center rounded-full border border-app-line bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-app-soft sm:w-auto">
            {isOpen ? "Hide form" : buttonLabel}
          </span>
        </div>
      </summary>

      <div className="mt-4">{children}</div>
    </details>
  );
}
