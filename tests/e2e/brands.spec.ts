import { expect, test, type Locator, type Page } from "@playwright/test";

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
      await openWorkspaceTab(page, "Profile");
      await page.getByRole("button", { name: "Edit brand settings" }).click();

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
      await page.getByRole("button", { name: "New task" }).click();

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

  test("edits campaign-linked tasks, assets, and upcoming items inline", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const suffix = Date.now();
    const brandName = `E2E Workspace Edit Brand ${suffix}`;
    const primaryCampaignTitle = `E2E Launch Campaign ${suffix}`;
    const secondaryCampaignTitle = `E2E Retarget Campaign ${suffix}`;

    const initialTaskTitle = `E2E Campaign Task ${suffix}`;
    const updatedTaskTitle = `E2E Campaign Task Updated ${suffix}`;
    const initialTaskDueDate = buildFutureDate(5);
    const updatedTaskDueDate = buildFutureDate(12);
    const updatedTaskNotes = `Updated task execution notes ${suffix}`;

    const initialAssetTitle = `E2E Asset ${suffix}`;
    const updatedAssetTitle = `E2E Asset Updated ${suffix}`;
    const updatedAssetStoragePath = `brands/e2e-${suffix}/assets/final-brief.pdf`;
    const updatedAssetDescription = `Updated asset description ${suffix}`;
    const updatedAssetNotes = `Updated asset notes ${suffix}`;

    const initialUpcomingTitle = `E2E Upcoming Item ${suffix}`;
    const updatedUpcomingTitle = `E2E Upcoming Item Updated ${suffix}`;
    const initialUpcomingDate = buildFutureDate(8);
    const updatedUpcomingDate = buildFutureDate(18);
    const updatedUpcomingNotes = `Updated upcoming prep notes ${suffix}`;

    await createBrandFromDirectory(
      page,
      brandName,
      `Temporary workspace edit brand created by Playwright at ${suffix}.`,
      `https://workspace-edit-${suffix}.example.com`,
    );

    try {
      await openBrandWorkspaceFromDirectory(page, brandName);

      await createCampaignInWorkspace(page, primaryCampaignTitle);
      await createCampaignInWorkspace(page, secondaryCampaignTitle);

      const tasksSection = getWorkspaceSection(page, "tasks");
      const taskCreateForm = await openSectionCreateForm(
        tasksSection,
        page,
        "New task",
        "Add task",
      );

      await taskCreateForm.getByLabel("Task title").fill(initialTaskTitle);
      await taskCreateForm.getByLabel("Due date").fill(initialTaskDueDate);
      await taskCreateForm.getByLabel("Priority").selectOption("urgent");
      await taskCreateForm
        .getByLabel("Related campaign")
        .selectOption({ label: primaryCampaignTitle });
      await taskCreateForm
        .getByLabel("Notes")
        .fill(`Initial task notes ${suffix}`);
      await taskCreateForm.getByRole("button", { name: "Add task" }).click();

      const initialTaskCard = getTaskCard(page, initialTaskTitle);

      await expect(initialTaskCard).toBeVisible();
      await expect(
        initialTaskCard.getByText(`Campaign: ${primaryCampaignTitle}`),
      ).toBeVisible();

      await page.reload();

      const reloadedTaskCard = getTaskCard(page, initialTaskTitle);

      await expect(reloadedTaskCard).toBeVisible();

      const taskEditForm = await openInlineEditForm(
        page,
        reloadedTaskCard,
        "Save task",
      );
      await taskEditForm.getByLabel("Task title").fill(updatedTaskTitle);
      await taskEditForm.getByLabel("Due date").fill(updatedTaskDueDate);
      await taskEditForm.getByLabel("Status").selectOption("needs_review");
      await taskEditForm.getByLabel("Priority").selectOption("high");
      await taskEditForm
        .getByLabel("Related campaign")
        .selectOption({ label: secondaryCampaignTitle });
      await taskEditForm.getByLabel("Notes").fill(updatedTaskNotes);
      await taskEditForm.getByRole("button", { name: "Save task" }).click();

      const updatedTaskCard = getTaskCard(page, updatedTaskTitle);

      await expect(updatedTaskCard).toBeVisible();
      await expect(
        updatedTaskCard.getByText(
          `Due ${formatWeekdayDateForAssertion(updatedTaskDueDate)}`,
        ),
      ).toBeVisible();
      await expect(updatedTaskCard.getByText("Needs review")).toBeVisible();
      await expect(updatedTaskCard.getByText("High priority")).toBeVisible();
      await expect(
        updatedTaskCard.getByText(`Campaign: ${secondaryCampaignTitle}`),
      ).toBeVisible();
      await expect(updatedTaskCard.getByText(updatedTaskNotes)).toBeVisible();
      await expect(
        updatedTaskCard.getByRole("button", { name: "Approve done" }),
      ).toBeVisible();

      await openWorkspaceTab(page, "Assets");
      const assetsSection = getWorkspaceSection(page, "assets");
      const assetCreateForm = await openSectionCreateForm(
        assetsSection,
        page,
        "New asset",
        "Add asset",
      );

      await assetCreateForm.getByLabel("Asset title").fill(initialAssetTitle);
      await assetCreateForm.getByLabel("Category").selectOption("document");
      await assetCreateForm
        .getByLabel("Asset detail type")
        .selectOption("document");
      await assetCreateForm.getByLabel("Source mode").selectOption("external_url");
      await assetCreateForm
        .getByLabel("URL")
        .fill(`https://assets-${suffix}.example.com/original`);
      await assetCreateForm.getByLabel("Status").selectOption("active");
      await assetCreateForm.getByLabel("Priority").selectOption("medium");
      await assetCreateForm
        .getByLabel("Related campaign")
        .selectOption({ label: primaryCampaignTitle });
      await assetCreateForm
        .getByLabel("Description")
        .fill(`Initial asset description ${suffix}`);
      await assetCreateForm
        .getByLabel("Notes")
        .fill(`Initial asset notes ${suffix}`);
      await assetCreateForm.getByRole("button", { name: "Add asset" }).click();

      const initialAssetRow = getArticleByHeading(assetsSection, initialAssetTitle);

      await expect(initialAssetRow).toBeVisible();
      await expect(
        initialAssetRow.getByRole("link", { name: "Open link" }),
      ).toBeVisible();

      await page.reload();

      const reloadedAssetsSection = getWorkspaceSection(page, "assets");
      const reloadedAssetRow = getArticleByHeading(
        reloadedAssetsSection,
        initialAssetTitle,
      );

      await expect(reloadedAssetRow).toBeVisible();

      const assetEditForm = await openInlineEditForm(
        page,
        reloadedAssetRow,
        "Save asset",
      );
      await assetEditForm.getByLabel("Asset title").fill(updatedAssetTitle);
      await assetEditForm.getByLabel("Category").selectOption("creative_asset");
      await assetEditForm
        .getByLabel("Asset detail type")
        .selectOption("campaign_asset");
      await assetEditForm.getByLabel("Source mode").selectOption("upload");
      await assetEditForm.getByLabel("URL").fill("");
      await assetEditForm
        .getByLabel("Storage path")
        .fill(updatedAssetStoragePath);
      await assetEditForm.getByLabel("Status").selectOption("draft");
      await assetEditForm.getByLabel("Priority").selectOption("high");
      await assetEditForm
        .getByLabel("Related campaign")
        .selectOption({ label: secondaryCampaignTitle });
      await assetEditForm
        .getByLabel("Description")
        .fill(updatedAssetDescription);
      await assetEditForm.getByLabel("Notes").fill(updatedAssetNotes);
      await assetEditForm.getByRole("button", { name: "Save asset" }).click();

      const updatedAssetRow = getArticleByHeading(assetsSection, updatedAssetTitle);

      await expect(updatedAssetRow).toBeVisible();
      await expect(
        updatedAssetRow.getByText(
          /Creative Asset \| Campaign Asset \| Upload \| Updated/,
        ),
      ).toBeVisible();
      await expect(updatedAssetRow.getByText("Draft", { exact: true })).toBeVisible();
      await expect(updatedAssetRow.getByText("High", { exact: true })).toBeVisible();
      await expect(
        updatedAssetRow.getByText(`Campaign: ${secondaryCampaignTitle}`),
      ).toBeVisible();
      await expect(updatedAssetRow.getByText(updatedAssetDescription)).toBeVisible();
      await expect(updatedAssetRow.getByText(updatedAssetNotes)).toBeVisible();
      await expect(
        updatedAssetRow.getByText(`Stored in app: ${updatedAssetStoragePath}`),
      ).toBeVisible();
      await expect(
        updatedAssetRow.getByRole("link", { name: "Open link" }),
      ).toHaveCount(0);

      await openWorkspaceTab(page, "Upcoming");
      const upcomingSection = getWorkspaceSection(page, "upcoming");
      const upcomingCreateForm = await openSectionCreateForm(
        upcomingSection,
        page,
        "New upcoming item",
        "Add upcoming item",
      );

      await upcomingCreateForm.getByLabel("Title").fill(initialUpcomingTitle);
      await upcomingCreateForm.getByLabel("Date").fill(initialUpcomingDate);
      await upcomingCreateForm.getByLabel("Type").selectOption("meeting");
      await upcomingCreateForm.getByLabel("Status").selectOption("scheduled");
      await upcomingCreateForm
        .getByLabel("Related campaign")
        .selectOption({ label: primaryCampaignTitle });
      await upcomingCreateForm
        .getByLabel("Notes")
        .fill(`Initial upcoming notes ${suffix}`);
      await upcomingCreateForm
        .getByRole("button", { name: "Add upcoming item" })
        .click();

      const initialUpcomingRow = getArticleByHeading(
        upcomingSection,
        initialUpcomingTitle,
      );

      await expect(initialUpcomingRow).toBeVisible();
      await expect(
        initialUpcomingRow.getByText(`Campaign: ${primaryCampaignTitle}`),
      ).toBeVisible();

      await page.reload();

      const reloadedUpcomingSection = getWorkspaceSection(page, "upcoming");
      const reloadedUpcomingRow = getArticleByHeading(
        reloadedUpcomingSection,
        initialUpcomingTitle,
      );

      await expect(reloadedUpcomingRow).toBeVisible();

      const upcomingEditForm = await openInlineEditForm(
        page,
        reloadedUpcomingRow,
        "Save item",
      );
      await upcomingEditForm.getByLabel("Title").fill(updatedUpcomingTitle);
      await upcomingEditForm.getByLabel("Date").fill(updatedUpcomingDate);
      await upcomingEditForm.getByLabel("Type").selectOption("deadline");
      await upcomingEditForm.getByLabel("Status").selectOption("completed");
      await upcomingEditForm.getByLabel("Notes").fill(updatedUpcomingNotes);
      await upcomingEditForm
        .getByLabel("Related campaign")
        .selectOption({ label: secondaryCampaignTitle });
      await upcomingEditForm.getByRole("button", { name: "Save item" }).click();

      const updatedUpcomingRow = getArticleByHeading(
        upcomingSection,
        updatedUpcomingTitle,
      );

      await expect(updatedUpcomingRow).toBeVisible();
      await expect(
        updatedUpcomingRow.getByText(
          `${formatWeekdayDateForAssertion(updatedUpcomingDate)} | Completed`,
        ),
      ).toBeVisible();
      await expect(
        updatedUpcomingRow.getByText("Deadline", { exact: true }),
      ).toBeVisible();
      await expect(
        updatedUpcomingRow.getByText(`Campaign: ${secondaryCampaignTitle}`),
      ).toBeVisible();
      await expect(updatedUpcomingRow.getByText(updatedUpcomingNotes)).toBeVisible();
    } finally {
      await cleanupBrand(page, brandName);
    }
  });

  test("edits contacts and notes inline in the workspace", async ({ page }) => {
    test.setTimeout(75_000);

    const suffix = Date.now();
    const brandName = `E2E Contact Note Brand ${suffix}`;

    const initialContactName = `E2E Contact ${suffix}`;
    const updatedContactName = `E2E Contact Updated ${suffix}`;
    const updatedContactNotes = `Updated contact notes ${suffix}`;

    const initialNoteTitle = `E2E Note ${suffix}`;
    const updatedNoteTitle = `E2E Note Updated ${suffix}`;
    const initialNoteBody = `Initial note body ${suffix}`;
    const updatedNoteBody = `Updated note body ${suffix}`;

    await createBrandFromDirectory(
      page,
      brandName,
      `Temporary contact and note brand created by Playwright at ${suffix}.`,
      `https://contact-note-${suffix}.example.com`,
    );

    try {
      await openBrandWorkspaceFromDirectory(page, brandName);

      await openWorkspaceTab(page, "Contacts");
      const contactsSection = getWorkspaceSection(page, "contacts");
      const contactCreateForm = await openSectionCreateForm(
        contactsSection,
        page,
        "New contact",
        "Add contact",
      );

      await contactCreateForm.getByLabel("Name").fill(initialContactName);
      await contactCreateForm.getByLabel("Contact type").selectOption("other");
      await contactCreateForm.getByLabel("Role").fill("Coordinator");
      await contactCreateForm.getByLabel("Company").fill("Known Associates");
      await contactCreateForm.getByLabel("Phone").fill("555-0101");
      await contactCreateForm
        .getByLabel("Notes")
        .fill(`Initial contact notes ${suffix}`);
      await contactCreateForm.getByRole("button", { name: "Add contact" }).click();

      const initialContactRow = getArticleByHeading(
        contactsSection,
        initialContactName,
      );

      await expect(initialContactRow).toBeVisible();
      await expect(initialContactRow.getByText("555-0101")).toBeVisible();

      await page.reload();

      const reloadedContactsSection = getWorkspaceSection(page, "contacts");
      const reloadedContactRow = getArticleByHeading(
        reloadedContactsSection,
        initialContactName,
      );

      await expect(reloadedContactRow).toBeVisible();

      const contactEditForm = await openInlineEditForm(
        page,
        reloadedContactRow,
        "Save contact",
      );
      await contactEditForm.getByLabel("Name").fill(updatedContactName);
      await contactEditForm.getByLabel("Contact type").selectOption("vendor");
      await contactEditForm.getByLabel("Role").fill("Operations lead");
      await contactEditForm.getByLabel("Company").fill("Known Associates Studio");
      await contactEditForm
        .getByLabel("Email")
        .fill(`contact-${suffix}@example.com`);
      await contactEditForm.getByLabel("Phone").fill("");
      await contactEditForm.getByLabel("Notes").fill(updatedContactNotes);
      await contactEditForm
        .getByRole("button", { name: "Save contact" })
        .click();

      const updatedContactRow = getArticleByHeading(
        contactsSection,
        updatedContactName,
      );

      await expect(updatedContactRow).toBeVisible();
      await expect(
        updatedContactRow.getByText("Vendor", { exact: true }),
      ).toBeVisible();
      await expect(
        updatedContactRow.getByText("Operations lead | Known Associates Studio"),
      ).toBeVisible();
      await expect(
        updatedContactRow.getByRole("link", {
          name: `contact-${suffix}@example.com`,
        }),
      ).toBeVisible();
      await expect(updatedContactRow.getByText(updatedContactNotes)).toBeVisible();

      await openWorkspaceTab(page, "Notes");
      const notesSection = getWorkspaceSection(page, "notes");
      const noteCreateForm = await openSectionCreateForm(
        notesSection,
        page,
        "New note",
        "Add note",
      );

      await noteCreateForm.getByLabel("Title").fill(initialNoteTitle);
      await noteCreateForm.getByLabel("Category").selectOption("random");
      await noteCreateForm
        .getByRole("textbox", { name: "Note", exact: true })
        .fill(initialNoteBody);
      await noteCreateForm.getByRole("button", { name: "Add note" }).click();

      const initialNoteRow = getArticleByText(notesSection, initialNoteBody);

      await expect(initialNoteRow).toBeVisible();
      await expect(initialNoteRow.getByText(initialNoteTitle)).toBeVisible();

      await page.reload();

      const reloadedNotesSection = getWorkspaceSection(page, "notes");
      const reloadedNoteRow = getArticleByText(
        reloadedNotesSection,
        initialNoteBody,
      );

      await expect(reloadedNoteRow).toBeVisible();

      const noteEditForm = await openInlineEditForm(
        page,
        reloadedNoteRow,
        "Save note",
      );
      await noteEditForm.getByLabel("Title").fill(updatedNoteTitle);
      await noteEditForm.getByLabel("Category").selectOption("strategy");
      await noteEditForm.getByLabel("Pin this note near the top").check();
      await noteEditForm
        .getByRole("textbox", { name: "Note", exact: true })
        .fill(updatedNoteBody);
      await noteEditForm.getByRole("button", { name: "Save note" }).click();

      const updatedNoteRow = getArticleByText(notesSection, updatedNoteBody);

      await expect(updatedNoteRow).toBeVisible();
      await expect(updatedNoteRow.getByText(updatedNoteTitle)).toBeVisible();
      await expect(updatedNoteRow.getByText(updatedNoteBody)).toBeVisible();

      const reopenedNoteEditForm = await openInlineEditForm(
        page,
        updatedNoteRow,
        "Save note",
      );

      await expect(reopenedNoteEditForm.getByLabel("Title")).toHaveValue(
        updatedNoteTitle,
      );
      await expect(reopenedNoteEditForm.getByLabel("Category")).toHaveValue(
        "strategy",
      );
      await expect(reopenedNoteEditForm.getByLabel("Pin this note near the top")).toBeChecked();
      await expect(
        reopenedNoteEditForm.getByRole("textbox", {
          name: "Note",
          exact: true,
        }),
      ).toHaveValue(updatedNoteBody);

      await reopenedNoteEditForm
        .getByRole("button", { name: "Cancel" })
        .click();
      await expect(updatedNoteRow.getByRole("button", { name: "Edit" })).toBeVisible();
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

async function createCampaignInWorkspace(page: Page, campaignTitle: string) {
  const campaignsSection = getWorkspaceSection(page, "campaigns");
  const createForm = await openSectionCreateForm(
    campaignsSection,
    page,
    "New campaign",
    "Add campaign",
  );

  await createForm.getByLabel("Campaign title").fill(campaignTitle);
  await createForm.getByRole("button", { name: "Add campaign" }).click();

  await expect(getArticleByHeading(campaignsSection, campaignTitle)).toBeVisible();
}

function buildFutureDate(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekdayDateForAssertion(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getWorkspaceSection(page: Page, sectionId: string) {
  return page.locator(`section#${sectionId}`);
}

async function openSectionCreateForm(
  section: Locator,
  page: Page,
  toggleButtonName: string,
  submitButtonName: string,
) {
  const toggleButton = section.getByRole("button", { name: toggleButtonName });
  await expect(toggleButton).toBeVisible();
  await toggleButton.click();

  const form = page.locator("form").filter({ hasText: submitButtonName }).last();
  await expect(form).toBeVisible();

  return form;
}

function getArticleByHeading(section: Locator, title: string) {
  return section.locator("article").filter({ hasText: title }).first();
}

function getArticleByText(section: Locator, text: string) {
  return section.locator("article").filter({ hasText: text }).first();
}

function getTaskCard(page: Page, title: string) {
  return page
    .getByRole("group", {
      name: `Task card for ${title}`,
    })
    .first();
}

async function openInlineEditForm(
  page: Page,
  item: Locator,
  saveButtonName: string,
) {
  const editButton = item.getByRole("button", { name: "Edit" }).first();

  await expect(editButton).toBeVisible();
  await editButton.click();

  const form = page.locator("form").filter({ hasText: saveButtonName }).last();

  if (!(await form.isVisible().catch(() => false))) {
    await editButton.evaluate((button: HTMLButtonElement) => button.click());
  }

  await expect(form).toBeVisible({ timeout: 10_000 });

  return form;
}

async function openWorkspaceTab(page: Page, tabName: string) {
  const tabLink = page.getByRole("link", {
    name: new RegExp(`^${tabName}(\\s+\\d+)?$`),
  });

  await expect(tabLink).toBeVisible();
  await tabLink.click();
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
