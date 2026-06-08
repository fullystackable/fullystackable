import type { ReactNode } from "react";

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
        <Sidebar />
        <div className="min-w-0 flex-1">
          <div className="border-b border-app-line bg-white/78 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Portfolio workspace</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Clean execution surfaces for tasks, assets, contacts, and notes.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="info">Command center</Badge>
                <Badge>{todayLabel}</Badge>
              </div>
            </div>
          </div>
          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
