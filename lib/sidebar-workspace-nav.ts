import type { WorkspaceTab } from "@/lib/workspace-url-state";

type SidebarWorkspaceTab = Exclude<WorkspaceTab, "profile">;

export type SidebarWorkspaceNavItem = {
  label: string;
  href: string;
  tab: SidebarWorkspaceTab;
};

const workspaceTabs: Array<{ label: string; tab: SidebarWorkspaceTab }> = [
  { label: "Tasks", tab: "tasks" },
  { label: "Upcoming", tab: "upcoming" },
  { label: "Assets", tab: "assets" },
  { label: "Contacts", tab: "contacts" },
  { label: "Notes", tab: "notes" },
  { label: "Prompts", tab: "prompts" },
  { label: "Database Info", tab: "database" },
];

const globalWorkspaceDestinations: Record<SidebarWorkspaceTab, string> = {
  tasks: "/dashboard#tasks",
  upcoming: "/calendar",
  assets: "/dashboard#assets",
  contacts: "/search",
  notes: "/dashboard#notes",
  prompts: "/brands",
  database: "/brands",
};

export function isBrandWorkspacePath(pathname: string) {
  return /^\/brands\/[^/]+$/.test(pathname);
}

export function buildSidebarWorkspaceHref(
  pathname: string,
  searchParams: string,
  tab: SidebarWorkspaceTab,
) {
  if (!isBrandWorkspacePath(pathname)) {
    return globalWorkspaceDestinations[tab];
  }

  const params = new URLSearchParams(searchParams);

  if (tab === "tasks") {
    params.delete("tab");
  } else {
    params.set("tab", tab);
  }

  const query = params.toString();

  return `${pathname}${query ? `?${query}` : ""}#${tab}`;
}

export function getSidebarWorkspaceNav(pathname: string, searchParams: string) {
  return workspaceTabs.map((item) => ({
    ...item,
    href: buildSidebarWorkspaceHref(pathname, searchParams, item.tab),
  })) satisfies SidebarWorkspaceNavItem[];
}
