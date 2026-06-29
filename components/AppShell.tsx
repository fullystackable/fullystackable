import { Suspense, type ReactNode } from "react";

import { Sidebar } from "@/components/Sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-app-bg text-ink">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <Suspense fallback={<div className="w-full shrink-0 bg-app-sidebar lg:w-[244px]" />}>
          <Sidebar />
        </Suspense>
        <div className="min-w-0 flex-1">
          <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 xl:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
