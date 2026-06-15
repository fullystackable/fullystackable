"use client";

import { useEffect } from "react";

import { Card } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-danger">
          Something broke
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          The workspace could not finish loading.
        </h1>
        <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
          Try the page again. If this keeps happening, the most likely issue is a
          temporary data or network problem rather than lost app state.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
          >
            Try again
          </button>
        </div>
      </Card>
    </div>
  );
}
