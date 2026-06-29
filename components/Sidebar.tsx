"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cx } from "@/components/ui";
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
    label: "Today",
    href: "/today",
    match: (pathname) => pathname.startsWith("/today"),
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
    <aside className="w-full shrink-0 border-b border-app-sidebar-line bg-app-sidebar text-white lg:sticky lg:top-0 lg:h-screen lg:w-[244px] lg:border-b-0 lg:border-r lg:border-app-sidebar-line">
      <div className="px-4 py-4 sm:px-5 lg:flex lg:h-full lg:flex-col lg:overflow-y-auto lg:px-4 lg:py-5">
        <div className="border-b border-app-sidebar-line pb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="/brand/logos/fully-stackble-stack-logo.png"
                alt="Fullystackable logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <p className="text-[0.95rem] font-semibold tracking-tight text-white">
              fullystackable
            </p>
          </div>
        </div>

        <nav className="mt-4 overflow-x-auto pb-1 lg:mt-5 lg:overflow-visible lg:pb-0">
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

        <div className={cx("mt-5 lg:mt-7", isBrandWorkspace ? "" : "hidden lg:block")}>
          <p className="px-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
            Workspace
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
                    scroll={isBrandWorkspace ? false : undefined}
                    aria-label={`Jump to ${item.label} section`}
                    className={cx("sidebar-link", "py-2.5 text-sm whitespace-nowrap")}
                    data-active={isActive}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
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
    case "prompts":
    case "database":
    case "profile":
      return value;
    case "tasks":
    default:
      return "tasks";
  }
}
