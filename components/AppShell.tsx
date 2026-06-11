import { Suspense, type ReactNode } from "react";

import { GlobalSearchForm } from "@/components/GlobalSearchForm";
import { Badge } from "@/components/ui";
import { Sidebar } from "@/components/Sidebar";

const TOPBAR_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const todayLabel = TOPBAR_DATE_FORMATTER.format(new Date());

  return (
    <div className="min-h-screen bg-app-bg text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <Suspense fallback={<div className="w-full shrink-0 bg-app-sidebar lg:w-[260px]" />}>
          <Sidebar />
        </Suspense>
        <div className="min-w-0 flex-1">
          <div className="border-b border-app-line bg-white/78 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] xl:items-center">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Portfolio workspace</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Clean execution surfaces for tasks, assets, contacts, and notes.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="info">Command center</Badge>
                  <Badge>{todayLabel}</Badge>
                </div>
              </div>

              <div className="min-w-0">
                <Suspense fallback={<div className="h-10 rounded-full border border-app-line bg-white/70" />}>
                  <GlobalSearchForm compact />
                </Suspense>
              </div>
            </div>
          </div>
          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
