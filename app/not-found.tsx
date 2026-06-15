import Link from "next/link";

import { Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Not found
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          That workspace is no longer available.
        </h1>
        <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
          The brand or campaign may have been deleted, renamed, or never existed in
          this environment.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/brands"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-app-sidebar px-4 py-2 text-sm font-medium text-white hover:bg-app-sidebar-muted"
          >
            Back to brands
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-app-line px-4 py-2 text-sm font-medium text-ink hover:bg-app-soft"
          >
            Open dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
