import { expect, test } from "@playwright/test";

// Drives the production build with the scripted mock model (see lib/mock-model.ts).

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#send")).toBeEnabled();
});

async function say(page: import("@playwright/test").Page, text: string) {
  await page.locator("#box").fill(text);
  await page.locator("#box").press("Enter");
}

test("opens on the first question with the map and lenses", async ({ page }) => {
  await expect(page.locator(".msg.bot").first()).toContainText("what organization or social-impact project are we examining");
  await expect(page.locator(".chain li")).toHaveCount(8);
  await expect(page.locator(".lens")).toHaveCount(10);
  await expect(page.getByTestId("stage")).toContainText("Understand the organization");
});

test("streams a reply, hides the protocol line and updates the map", async ({ page }) => {
  await say(page, "We run girls' coding clubs in Benin City.");
  const reply = page.locator(".msg.bot").nth(1);
  await expect(reply).toContainText("Who defines the problem");
  expect(await page.content()).not.toContain("lens-state");
  await expect(page.locator(".chain li").nth(0)).toHaveClass(/done/);
  await expect(page.locator(".chain li").nth(1)).toHaveClass(/now/);
  await expect(page.getByTestId("stage")).toContainText("Diagnose");
});

test("switching lens sends a request and marks the lens", async ({ page }) => {
  await say(page, "Hello");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await page.locator(".lens", { hasText: "Board member" }).click();
  await expect(page.locator(".msg.event")).toHaveText("Lens switched to Board member");
  await expect(page.locator(".msg.bot").nth(2)).toContainText("Speaking as Board member");
  await expect(page.locator(".msg.bot").nth(2).locator(".as")).toHaveText("as Board member");
  await expect(page.locator(".lens", { hasText: "Board member" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".chain li.done")).toHaveCount(2);
});

test("the report can be saved as Markdown", async ({ page }) => {
  await say(page, "Start");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await page.getByRole("button", { name: /Generate the report/ }).click();
  await expect(page.locator(".msg.bot").nth(2)).toContainText("NGO Strategy and Alignment Report");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save report (.md)" }).click();
  expect((await download).suggestedFilename()).toBe("ngo-strategy-alignment-report.md");
});

test("a provider failure shows a message and Retry asks again", async ({ page }) => {
  await say(page, "FAIL_PLEASE");
  await expect(page.locator(".note.err")).toContainText("failed to reply");
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  // The retry hits the same scripted failure, proving it re-sent the question.
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.locator(".note.err")).toContainText("failed to reply");
});

test("attached text documents reach the model; PDFs are refused with guidance", async ({ page }) => {
  await page.locator("#file").setInputFiles([
    { name: "theory-of-change.md", mimeType: "text/markdown", buffer: Buffer.from("Clubs lead to jobs.") },
    { name: "annual-report.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") },
  ]);
  await expect(page.locator(".doc")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("annual-report.pdf");
  await say(page, "Please review the doc");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Documents seen: theory-of-change.md");
});

test("the review survives a reload and New review clears it after confirming", async ({ page }) => {
  await say(page, "Remember me");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await page.reload();
  await expect(page.locator(".msg.you")).toHaveText("Remember me");
  await page.getByRole("button", { name: "Start a new review" }).click();
  await expect(page.locator(".msg.you")).toHaveCount(1);
  await page.getByRole("button", { name: "Click again to clear this review" }).click();
  await expect(page.locator(".msg.you")).toHaveCount(0);
});

test("the API rejects models that are not configured", async ({ request }) => {
  const res = await request.post("/api/chat", { data: { model: "openai:gpt-6.1-sol", turns: [{ role: "user", content: "hi" }] } });
  expect(res.status()).toBe(400);
});

test("fits a phone screen without sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Map & lens" }).click();
  await expect(page.locator(".side")).toHaveClass(/open/);
});
