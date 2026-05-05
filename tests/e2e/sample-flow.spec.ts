import { expect, test } from "@playwright/test";

test("loads a sample, edits facts, generates actions, and exports PDF", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Load sample case Flight cancellation/i }).click();

  await expect(page.getByRole("heading", { name: /Gate-change cancellation/i })).toBeVisible();
  await expect(page.getByText("Editable facts")).toBeVisible();

  const firstFactValue = page.getByLabel("Value").first();
  await firstFactValue.fill("Oceanic Air support notice and hotel receipt reviewed");
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/cases/sample-flight/analyze") &&
        response.request().method() === "PATCH" &&
        response.status() === 200
    ),
    page.getByRole("button", { name: /Save facts/i }).click(),
  ]);

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/cases/sample-flight/actions") &&
        response.request().method() === "POST" &&
        response.status() === 200
    ),
    page.getByRole("button", { name: /Generate action plan/i }).click(),
  ]);
  await expect(page.getByLabel("Action title").first()).toHaveValue(
    /Submit the reimbursement packet/i
  );

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: /Export polished PDF/i }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/summary\.pdf$/);
});
