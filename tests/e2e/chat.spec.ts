import { expect, test } from "@playwright/test";

// Drives the production build with the scripted mock model (see lib/mock-model.ts).

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#send")).toBeEnabled();
});

async function say(page: import("@playwright/test").Page, text: string) {
  // Wait for any reply still streaming: pressing Enter then would mean "Stop".
  await expect(page.locator("#send")).toHaveText("Send");
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
  await expect(page.locator(".chain li").nth(0)).toHaveClass(/now/);
  await expect(page.locator(".dial-copy")).toContainText("1 of 3 exchanges");
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
});

test("the report can be saved as Markdown", async ({ page }) => {
  await say(page, "Start");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await page.getByRole("button", { name: /Generate the report/ }).click();
  await expect(page.locator(".msg.bot").nth(2)).toContainText("NGO Strategy and Alignment Report");
  // A long conversation scrolls inside the chat log; the page itself never scrolls,
  // so the sidebar map stays in view.
  const pageScroll = await page.evaluate(() => document.scrollingElement!.scrollHeight - window.innerHeight);
  expect(pageScroll).toBeLessThanOrEqual(0);
  const sideOverflow = await page.locator(".side").evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  expect(sideOverflow).toBeLessThanOrEqual(1);
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

test("model output cannot make the browser load remote images or script links", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => { if (!r.url().startsWith("http://127.0.0.1")) external.push(r.url()); });
  await say(page, "INJECT_PLEASE");
  const reply = page.locator(".msg.bot").nth(1);
  await expect(reply).toContainText("[image: chart]");
  await expect(reply.locator("img")).toHaveCount(0);
  await expect(reply.locator('a[href^="javascript"]')).toHaveCount(0);
  await expect(reply.locator('a[href="https://example.org"]')).toHaveAttribute("rel", /noreferrer/);
  expect(external).toEqual([]);
  const csp = (await page.request.get("/")).headers()["content-security-policy"];
  expect(csp).toContain("img-src 'self'");
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

test("theory of change slides: two slides, PowerPoint download, PDF via print", async ({ page }) => {
  await page.addInitScript(() => { (window as unknown as { printed: number }).printed = 0; window.print = () => { (window as unknown as { printed: number }).printed++; }; });
  await page.reload();
  const slidesBtn = page.getByRole("button", { name: /Theory of change slides/ });
  await expect(slidesBtn).toBeDisabled();
  await say(page, "We run girls' coding clubs in Benin City.");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await slidesBtn.click();
  const dialog = page.getByRole("dialog", { name: "Theory of change slides" });
  await expect(dialog.locator(".slide")).toHaveCount(2);
  await expect(dialog.locator(".slide").first()).toContainText("How Bright Futures Coding Clubs expects change to happen");
  await expect(dialog.locator(".tc-col li.inferred")).toContainText("More girls choose STEM subjects");
  await expect(dialog.locator(".tc-assume li")).toHaveCount(4);
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download PowerPoint" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("theory-of-change.pptx");
  const bytes = await (await import("node:fs/promises")).readFile(await file.path());
  expect(bytes.subarray(0, 2).toString()).toBe("PK"); // a zip, as .pptx files are
  await dialog.getByRole("button", { name: "Save as PDF" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);
  await expect(page.locator(".print-root .slide")).toHaveCount(2);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".app")).toBeHidden();
  await expect(page.locator(".print-root .slide").first()).toBeVisible();
});

test("a model answer that isn't a theory of change shows a message instead of slides", async ({ page }) => {
  await say(page, "GARBLED_PLEASE tell me about us");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await page.getByRole("button", { name: /Theory of change slides/ }).click();
  await expect(page.getByRole("status")).toContainText("couldn't be turned into slides");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the report can be saved as a PDF through the print layout", async ({ page }) => {
  await page.addInitScript(() => { window.print = () => {}; });
  await page.reload();
  await expect(page.getByRole("button", { name: /Report as PDF/ })).toBeDisabled();
  await say(page, "Start");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await page.getByRole("button", { name: /Generate the report/ }).click();
  await expect(page.locator(".msg.bot").nth(2)).toContainText("NGO Strategy and Alignment Report");
  await page.locator(".msg.bot").nth(2).getByRole("button", { name: "Save as PDF" }).click();
  const doc = page.locator(".print-root .report-print");
  await expect(doc.locator("h1").first()).toHaveText("NGO Strategy and Alignment Report");
  await expect(doc.locator(".rp-body")).toContainText("Organizational purpose");
  await expect(doc.locator(".rp-body h1")).toHaveCount(0); // title not repeated
  await expect(doc.locator(".scorecard")).toContainText("Not examined yet");
  await expect(doc.locator(".ledger-annex")).toContainText("80% of girls complete the course");
  await expect(page.getByRole("button", { name: /Report as PDF/ })).toBeEnabled();
});

test("an area closes only after enough exchanges and a score; claims fill the ledger", async ({ page }) => {
  await say(page, "We run girls' coding clubs.");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await expect(page.getByRole("tab", { name: /Evidence/ })).toContainText("1");
  await say(page, "CLOSE_AREA too early");
  await expect(page.locator(".msg.bot").nth(2)).toContainText("Area verdict");
  await expect(page.locator(".chain li").nth(0)).not.toHaveClass(/done/); // two exchanges only
  await say(page, "CLOSE_AREA now");
  await expect(page.locator(".msg.bot").nth(3)).toContainText("Area verdict");
  await expect(page.locator(".chain li").nth(0).locator(".area-marks")).toHaveText("E2 A3");
  await page.getByRole("tab", { name: /Evidence/ }).click();
  await expect(page.locator(".ledger li")).toHaveCount(1);
  await expect(page.locator(".ledger li")).toContainText("Partly supported");
  await expect(page.locator(".ledger li")).toContainText("Attendance sheets, no follow-up");
});

test("framework views: six slides from the discussion, saved together as PDF", async ({ page }) => {
  await page.addInitScript(() => { window.print = () => {}; });
  await page.reload();
  await say(page, "We run girls' coding clubs in Benin City.");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await page.getByRole("button", { name: /Framework views/ }).click();
  const dialog = page.getByRole("dialog", { name: "Framework views" });
  await expect(dialog.locator(".slide")).toContainText("Value proposition canvas");
  await expect(dialog.locator(".slide")).toContainText("Funders count graduates; girls need jobs.");
  await dialog.getByRole("tab", { name: "Logic model" }).click();
  await expect(dialog.locator(".lm tbody tr")).toHaveCount(5);
  await expect(dialog.locator(".lm tbody tr").first()).toContainText("Impact"); // impact first, whatever order the model used
  await expect(dialog.locator(".lm tbody tr").last()).toContainText("Input");
  await expect(dialog.locator(".lm .inferred").first()).toBeVisible();
  await dialog.getByRole("tab", { name: "Strategy" }).click();
  await expect(dialog.locator(".er-type")).toHaveText("Niche strategy");
  await dialog.getByRole("tab", { name: "Accountability" }).click();
  await expect(dialog.locator(".acc-downward")).toContainText("No mechanism");
  await dialog.getByRole("tab", { name: "Power map" }).click();
  await expect(dialog.locator(".pw-dot")).toHaveCount(3);
  await dialog.getByRole("tab", { name: "Causal loops" }).click();
  await expect(dialog.locator(".cl-var")).toHaveCount(5);
  await expect(dialog.locator(".cl-link")).toHaveCount(6);
  await expect(dialog.locator(".cl-loop")).toHaveCount(2);
  await expect(dialog.locator(".cl-lev li.open")).toContainText("Share employer hiring data");
  await dialog.getByRole("button", { name: "Save all as PDF" }).click();
  await expect(page.locator(".print-root .slide")).toHaveCount(6);
});

test("the advisor can search the web on its own and lists its sources", async ({ page }) => {
  await say(page, "RESEARCH_PLEASE what does evidence say about coding clubs?");
  const reply = page.locator(".msg.bot").nth(1);
  await expect(reply).toContainText("Who defines the problem");
  await expect(reply.locator(".sources summary")).toHaveText("Searched the web: 1 source");
  await reply.locator(".sources summary").click();
  await expect(reply.locator('.sources a[href="https://example.org/evidence-review"]')).toHaveAttribute("rel", /noreferrer/);
  expect(await page.content()).not.toContain("lens-sources");
});

test("the glossary tab explains terms and can be searched", async ({ page }) => {
  await page.getByRole("tab", { name: "Glossary" }).click();
  await page.getByRole("searchbox", { name: "Find a term" }).fill("counterfactual");
  await expect(page.locator(".gl-item dt").first()).toHaveText("Counterfactual");
  await page.getByRole("searchbox", { name: "Find a term" }).fill("output");
  await expect(page.locator(".gl-item", { hasText: /^Output/ }).first()).toContainText("Not the same as: outcome");
});

test("light is the default even on a dark device, and the switch is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe("light");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const light = await bg();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await bg()).not.toBe(light);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  expect(await bg()).toBe(light);
});

test("when the chosen model is out of quota, the next one answers and stays selected", async ({ page }) => {
  const picker = page.locator("select#model");
  await picker.selectOption("mock:exhausted");
  await say(page, "We run coding clubs for girls in Lagos.");
  await expect(page.locator(".model-note")).toContainText("Out-of-quota test model was unavailable");
  await expect(page.locator(".model-note")).toContainText("Scripted test model answered");
  await expect(page.locator(".msg.bot").last()).not.toContainText("lens-model");
  await expect(picker).toHaveValue("mock:scripted");
  await expect(page.locator(".note.err")).toHaveCount(0);
});

test("when web search is refused, the same model answers without it and says so", async ({ page }) => {
  const picker = page.locator("select#model");
  await picker.selectOption("mock:nosearch");
  await say(page, "Please look up the evidence on coding clubs for girls in Lagos.");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await expect(page.locator(".model-note")).toContainText("Web research was unavailable for this reply");
  await expect(page.locator(".model-note")).not.toContainText("answered");
  await expect(picker).toHaveValue("mock:nosearch");
  await expect(page.locator(".note.err")).toHaveCount(0);
});

test("web search is off unless the user asks or the advisor asked for it", async ({ page }) => {
  const sources = (n: number) => page.locator(".msg.bot").nth(n).locator(".sources");
  // RESEARCH_PLEASE makes the test model cite a page only when search is on.
  await say(page, "RESEARCH_PLEASE we run coding clubs for girls.");
  await expect(page.locator(".msg.bot").nth(1)).toContainText("Who defines the problem");
  await expect(sources(1)).toHaveCount(0);
  await say(page, "NEED_EVIDENCE our clubs reach 400 girls.");
  await expect(page.locator(".msg.bot").nth(2)).toContainText("I'll check the evidence");
  await say(page, "RESEARCH_PLEASE the girls choose themselves.");
  await expect(sources(3)).toHaveCount(1);
  await say(page, "RESEARCH_PLEASE and parents agree.");
  await expect(page.locator(".msg.bot").nth(4)).toContainText("Who defines the problem");
  await expect(sources(4)).toHaveCount(0);
});
