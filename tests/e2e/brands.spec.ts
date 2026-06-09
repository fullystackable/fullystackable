import { expect, test, type Page } from "@playwright/test";

test.describe("brands directory", () => {
  test("shows the main brands page controls", async ({ page }) => {
    await page.goto("/brands");

    await expect(
      page.getByRole("heading", { name: "All brands" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Workspace directory" }),
    ).toBeVisible();
    await expect(page.getByLabel("Search brands")).toBeVisible();
    await expect(page.getByLabel("Status")).toBeVisible();
    await expect(page.getByLabel("Brand name")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add brand" }),
    ).toBeVisible();
  });

  test("creates, edits, and deletes a temporary brand", async ({ page }) => {
    test.setTimeout(60_000);

    const suffix = Date.now();
    const brandName = `E2E Temp Brand ${suffix}`;
    const updatedDescription = `Updated E2E description ${suffix}`;
    const updatedWebsite = `https://edited-${suffix}.example.com`;

    await createBrandFromDirectory(
      page,
      brandName,
      `Temporary brand created by Playwright at ${suffix}.`,
      `https://temp-${suffix}.example.com`,
    );

    try {
      await openBrandWorkspaceFromDirectory(page, brandName);

      const editForm = page.locator("form").filter({
        has: page.getByRole("button", { name: "Save brand" }),
      }).first();

      await expect(editForm).toBeVisible();
      await editForm.getByLabel("Website").fill(updatedWebsite);
      await editForm.getByLabel("Description").fill(updatedDescription);
      await editForm.getByRole("button", { name: "Save brand" }).click();

      await expect(editForm.getByLabel("Description")).toHaveValue(
        updatedDescription,
      );
      await expect(editForm.getByLabel("Website")).toHaveValue(updatedWebsite);

      await page.getByRole("button", { name: "Delete brand" }).click();

      await expect(page).toHaveURL(/\/brands$/);
      await page.getByLabel("Search brands").fill(brandName);
      await page.getByRole("button", { name: "Apply filters" }).click();
      await expect(
        page.getByText("No brands match these filters"),
      ).toBeVisible();
    } finally {
      await cleanupBrand(page, brandName);
    }
  });

  test("creates a task, uses quick status changes, and filters incomplete tasks", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const suffix = Date.now();
    const brandName = `E2E Task Brand ${suffix}`;
    const taskTitle = `E2E Task ${suffix}`;
    const dueDate = buildFutureDate(3);

    await createBrandFromDirectory(
      page,
      brandName,
      `Temporary task brand created by Playwright at ${suffix}.`,
      `https://task-${suffix}.example.com`,
    );

    try {
      await openBrandWorkspaceFromDirectory(page, brandName);

      const taskCreateForm = page.locator("form").filter({
        has: page.getByRole("button", { name: "Add task" }),
      }).first();

      await taskCreateForm.getByLabel("Task title").fill(taskTitle);
      await taskCreateForm.getByLabel("Due date").fill(dueDate);
      await taskCreateForm.getByLabel("Priority").selectOption("urgent");
      await taskCreateForm.getByRole("button", { name: "Add task" }).click();

      await expect(page.getByText("Task added.")).toBeVisible();

      const getTaskCard = () =>
        page.getByRole("group", {
          name: `Task card for ${taskTitle}`,
        });

      await expect(getTaskCard()).toBeVisible();
      await expect(
        getTaskCard().getByRole("heading", { name: taskTitle }),
      ).toBeVisible();
      await expect(getTaskCard().getByText("Urgent priority")).toBeVisible();
      await expect(getTaskCard().getByText("Due this week")).toBeVisible();
      await expect(getTaskCard().getByText("Planned")).toBeVisible();

      await getTaskCard().getByRole("button", { name: "Start" }).click();
      await expect(getTaskCard().getByText("In progress")).toBeVisible();

      await page.getByLabel("Task view").selectOption("incomplete");
      await page.getByRole("button", { name: "Apply view" }).click();

      await expect(page).toHaveURL(/taskView=incomplete/);
      await expect(getTaskCard()).toBeVisible();

      await getTaskCard().getByRole("button", { name: "Mark done" }).click();
      await expect(
        page.getByText("No incomplete tasks in this workspace"),
      ).toBeVisible();
    } finally {
      await cleanupBrand(page, brandName);
    }
  });
});

async function createBrandFromDirectory(
  page: Page,
  brandName: string,
  description: string,
  website: string,
) {
  await page.goto("/brands");
  await page.getByLabel("Brand name").fill(brandName);
  await page.getByLabel("Website").fill(website);
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "Add brand" }).click();
  await expect(page.getByText("Brand created.")).toBeVisible();
}

async function openBrandWorkspaceFromDirectory(page: Page, brandName: string) {
  await page.goto(`/brands?q=${encodeURIComponent(brandName)}&status=all`);

  const brandCard = page.getByRole("group", {
    name: `Brand card for ${brandName}`,
  });

  await expect(brandCard).toBeVisible();
  await expect(
    brandCard.getByRole("heading", { name: brandName }),
  ).toBeVisible();
  await brandCard.getByRole("link", { name: "Open workspace" }).click();

  await expect(page).toHaveURL(new RegExp(`/brands/[^/?#]+$`));
  await expect(
    page.getByRole("heading", { name: brandName }),
  ).toBeVisible();
}

function buildFutureDate(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function cleanupBrand(page: Page, brandName: string) {
  if (page.isClosed()) {
    return;
  }

  await page.goto(`/brands?q=${encodeURIComponent(brandName)}&status=all`);

  const brandCard = page.getByRole("group", {
    name: `Brand card for ${brandName}`,
  });

  if (!(await brandCard.isVisible().catch(() => false))) {
    return;
  }

  await brandCard.getByRole("link", { name: "Open workspace" }).click();

  const deleteButton = page.getByRole("button", { name: "Delete brand" });

  if (await deleteButton.isVisible().catch(() => false)) {
    await deleteButton.click();
    await expect(page).toHaveURL(/\/brands$/);
  }
}
