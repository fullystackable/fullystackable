"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge, cx } from "@/components/ui";

type NavItem = {
  label: string;
  href: string;
  match?: (pathname: string) => boolean;
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
];

export function Sidebar() {
  const pathname = usePathname();
  const isBrandWorkspace =
    pathname.startsWith("/brands/") && pathname.split("/").length > 2;

  const workspaceNav: NavItem[] = [
    {
      label: "Tasks",
      href: isBrandWorkspace ? `${pathname}#tasks` : "/dashboard#tasks",
    },
    {
      label: "Upcoming",
      href: isBrandWorkspace ? `${pathname}#upcoming` : "/dashboard#upcoming",
    },
    {
      label: "Assets",
      href: isBrandWorkspace ? `${pathname}#assets` : "/dashboard#assets",
    },
    {
      label: "Contacts",
      href: isBrandWorkspace ? `${pathname}#contacts` : "/brands#directory",
    },
    {
      label: "Notes",
      href: isBrandWorkspace ? `${pathname}#notes` : "/dashboard#notes",
    },
  ];

  return (
    <aside className="w-full shrink-0 border-b border-app-sidebar-line bg-app-sidebar text-white lg:sticky lg:top-0 lg:h-screen lg:w-[260px] lg:border-b-0 lg:border-r lg:border-app-sidebar-line">
      <div className="flex h-full flex-col px-4 py-5 sm:px-5 lg:px-6">
        <div className="flex items-start justify-between gap-3 border-b border-app-sidebar-line pb-5">
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

        <nav className="mt-6 space-y-2">
          {primaryNav.map((item) => {
            const isActive = item.match?.(pathname) ?? pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="sidebar-link"
                data-active={isActive}
              >
                <span className="font-medium">{item.label}</span>
                {isActive ? (
                  <span className="h-2 w-2 rounded-full bg-frost" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          <p className="px-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
            Workspace
          </p>
          <nav className="mt-3 space-y-2">
            {workspaceNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cx("sidebar-link", "py-3 text-sm")}
                data-active={false}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-8">
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
