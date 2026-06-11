import { describe, expect, it } from "vitest";

import {
  buildSidebarWorkspaceHref,
  getSidebarWorkspaceNav,
  isBrandWorkspacePath,
} from "../../lib/sidebar-workspace-nav";

describe("sidebar workspace navigation", () => {
  it("treats only brand overview routes as brand workspaces", () => {
    expect(isBrandWorkspacePath("/brands/acme")).toBe(true);
    expect(isBrandWorkspacePath("/brands")).toBe(false);
    expect(isBrandWorkspacePath("/brands/acme/campaigns/summer-launch")).toBe(false);
    expect(isBrandWorkspacePath("/dashboard")).toBe(false);
  });

  it("preserves current brand workspace filters while switching tabs", () => {
    expect(
      buildSidebarWorkspaceHref(
        "/brands/acme",
        "campaign=cmp-123&taskView=incomplete&density=compact",
        "tasks",
      ),
    ).toBe("/brands/acme?campaign=cmp-123&taskView=incomplete&density=compact#tasks");

    expect(
      buildSidebarWorkspaceHref(
        "/brands/acme",
        "campaign=cmp-123&taskView=incomplete&density=compact",
        "notes",
      ),
    ).toBe(
      "/brands/acme?campaign=cmp-123&taskView=incomplete&density=compact&tab=notes#notes",
    );
  });

  it("uses deliberate global destinations outside a brand workspace", () => {
    expect(
      buildSidebarWorkspaceHref(
        "/brands/acme/campaigns/summer-launch",
        "tab=assets",
        "tasks",
      ),
    ).toBe("/dashboard#tasks");

    expect(getSidebarWorkspaceNav("/brands", "")).toEqual([
      { label: "Tasks", href: "/dashboard#tasks", tab: "tasks" },
      { label: "Upcoming", href: "/calendar", tab: "upcoming" },
      { label: "Assets", href: "/dashboard#assets", tab: "assets" },
      { label: "Contacts", href: "/search", tab: "contacts" },
      { label: "Notes", href: "/dashboard#notes", tab: "notes" },
    ]);
  });
});
