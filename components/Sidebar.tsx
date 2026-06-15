"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Badge, cx } from "@/components/ui";
import {
  getSidebarWorkspaceNav,
  isBrandWorkspacePath,
} from "@/lib/sidebar-workspace-nav";
import type { WorkspaceTab } from "@/lib/workspace-url-state";

type NavItem = {
  label: string;
  href: string;
  match?: (pathname: string) => boolean;
  tab?: WorkspaceTab;
};

const primaryNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    match: (pathname) => pathname === "/" || pathname === "/dashboard",
  },
  {
    label: "Brands",
    href: "/brands",
    match: (pathname) => pathname.startsWith("/brands"),
  },
  {
    label: "Calendar",
    href: "/calendar",
    match: (pathname) => pathname.startsWith("/calendar"),
  },
  {
    label: "Activity",
    href: "/activity",
    match: (pathname) => pathname.startsWith("/activity"),
  },
  {
    label: "Search",
    href: "/search",
    match: (pathname) => pathname.startsWith("/search"),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBrandWorkspace = isBrandWorkspacePath(pathname);
  const activeWorkspaceTab = normalizeWorkspaceTab(searchParams.get("tab"));
  const workspaceNav: NavItem[] = getSidebarWorkspaceNav(
    pathname,
    searchParams.toString(),
  );

  return (
    <aside className="w-full shrink-0 border-b border-app-sidebar-line bg-app-sidebar text-white lg:sticky lg:top-0 lg:h-screen lg:w-[260px] lg:border-b-0 lg:border-r lg:border-app-sidebar-line">
      <div className="px-4 py-4 sm:px-5 lg:flex lg:h-full lg:flex-col lg:px-6 lg:py-5">
        <div className="flex items-start justify-between gap-3 border-b border-app-sidebar-line pb-4 lg:pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-frost">
                F
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight text-white">
                  fullystackable
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Brand command center
                </p>
              </div>
            </div>
          </div>
          <Badge tone="sidebar">MVP</Badge>
        </div>

        <nav className="mt-4 overflow-x-auto pb-1 lg:mt-6 lg:overflow-visible lg:pb-0">
          <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
            {primaryNav.map((item) => {
              const isActive = item.match?.(pathname) ?? pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="sidebar-link whitespace-nowrap"
                  data-active={isActive}
                >
                  <span className="font-medium">{item.label}</span>
                  {isActive ? (
                    <span className="h-2 w-2 rounded-full bg-frost" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={cx("mt-5 lg:mt-8", isBrandWorkspace ? "" : "hidden lg:block")}>
          <p className="px-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
            Workspace
          </p>
          <p className="mt-2 px-1 text-sm text-white/60">
            {isBrandWorkspace
              ? "Jump around this brand workspace."
              : "Quick links into the main operating views."}
          </p>
          <nav className="mt-3 overflow-x-auto pb-1 lg:overflow-visible lg:pb-0">
            <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
              {workspaceNav.map((item) => {
                const isActive = isBrandWorkspace
                  ? activeWorkspaceTab === item.tab
                  : false;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={`Jump to ${item.label} section`}
                    className={cx("sidebar-link", "py-3 text-sm whitespace-nowrap")}
                    data-active={isActive}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="mt-auto hidden pt-8 lg:block">
          <div className="rounded-3xl border border-app-sidebar-line bg-app-sidebar-muted px-4 py-4">
            <p className="text-sm font-semibold text-white">Mock-data workspace</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              A compact operating layer for marketers managing multiple brands at
              once.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="sidebar">6 brands</Badge>
              <Badge tone="sidebar">Tasks</Badge>
              <Badge tone="sidebar">Assets</Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function normalizeWorkspaceTab(value: string | null): WorkspaceTab {
  switch (value) {
    case "upcoming":
    case "assets":
    case "contacts":
    case "notes":
    case "profile":
      return value;
    case "tasks":
    default:
      return "tasks";
  }
}
