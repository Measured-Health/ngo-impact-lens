// Records a captioned walkthrough of the app as a .webm video.
// Run against a running server:  BASE_URL=http://127.0.0.1:3200 MODEL_ID=google:gemini-3.8-flash node scripts/record-demo.mjs
// Output: demo/ngo-impact-lens-demo.webm (convert to MP4 with ffmpeg; see README).
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3200";
const MODEL_ID = process.env.MODEL_ID ?? "";
const OUT = path.resolve(process.env.OUT_DIR ?? "demo");
const SIZE = { width: 1280, height: 800 };
const REPLY_TIMEOUT = 240_000;

// The walkthrough script. Defaults to a fictional organization; pass
// SCENARIO=path/to/scenario.json to describe a real one (same keys as below).
const DEFAULT_SCENARIO = {
  file: "ngo-impact-lens-demo",
  intro: "It opens by asking what organization we are examining.",
  describeCaption: "Step 1: describe the organization (this one is fictional).",
  org:
    "We are Bright Futures Coding Clubs, a fictional 3-year-old NGO in Benin City, Nigeria. " +
    "We run free after-school coding clubs for girls aged 12-17 in 6 public secondary schools, about 240 girls a year. " +
    "The problem we see: very few young women from these schools go into tech jobs. " +
    "We are funded by two foundation grants and one corporate sponsor. I am the founder, preparing for a board strategy retreat.",
  lens: "Donor or foundation officer",
  lensCaption: "Step 2: choose whose eyes to see it through, here a foundation officer.",
  evidence:
    "Our evidence so far: attendance is 78% across the year, and in a survey of 2024 leavers, 31 of 90 girls said they planned to study a STEM subject. " +
    "We have no comparison group and we do not track what girls do after school. Teachers tell us confidence goes up, but we have not measured it.",
  stress:
    "We would protect the clubs in the 3 schools with the strongest teacher champions, ask the corporate sponsor for laptops instead of cash, " +
    "and train older girls as paid peer mentors so we can cut one paid facilitator role. We would tell parents and schools early and explain why.",
};
const S = { ...DEFAULT_SCENARIO, ...(process.env.SCENARIO ? JSON.parse(fs.readFileSync(process.env.SCENARIO, "utf8")) : {}) };

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: OUT, size: SIZE }, colorScheme: "light" });
const page = await context.newPage();
const pause = (ms) => page.waitForTimeout(ms);

async function overlay(html, ms, full = false) {
  await page.evaluate(({ html, full }) => {
    let el = document.getElementById("demo-overlay");
    if (!el) {
      el = document.createElement("div");
      el.id = "demo-overlay";
      document.body.appendChild(el);
    }
    el.setAttribute("style", full
      ? "position:fixed;inset:0;z-index:9999;display:grid;place-items:center;text-align:center;background:#1C0D0A radial-gradient(60% 50% at 85% 0%,rgba(255,92,0,.35),transparent 70%);color:#FFF6EF;font:800 44px/1.1 var(--font-display),system-ui;letter-spacing:-.03em;padding:60px"
      : "position:fixed;left:50%;bottom:130px;transform:translateX(-50%);z-index:9999;max-width:780px;background:rgba(28,13,10,.94);color:#FFF6EF;font:500 20px/1.4 var(--font-text),system-ui;padding:14px 24px;border-radius:18px;box-shadow:0 18px 40px -12px rgba(0,0,0,.45);text-align:center;border:1px solid rgba(255,92,0,.5)");
    el.innerHTML = full ? "<div>" + html + "</div>" : html;
  }, { html, full });
  if (ms) await pause(ms);
}
const caption = (text, ms = 3200) => overlay(text, ms);
const clearOverlay = () => page.evaluate(() => document.getElementById("demo-overlay")?.remove());

const SUB = "<div style='font:400 21px/1.5 var(--font-text),system-ui;letter-spacing:0;margin-top:16px;opacity:.85'>";

// Clicking a sidebar button scrolls the rail to it; put the progress map back in view.
const showMap = () => page.evaluate(() => document.querySelector(".side")?.scrollTo({ top: 0, behavior: "smooth" }));

async function waitForReply() {
  await page.locator("#send").filter({ hasText: "Stop" }).waitFor({ timeout: 10_000 }).catch(() => {});
  await page.locator("#send").filter({ hasText: "Send" }).waitFor({ timeout: REPLY_TIMEOUT });
  // Free and busy models fail now and then; press Retry like a user would.
  for (let attempt = 1; (await page.locator(".note.err").count()) > 0; attempt++) {
    const why = await page.locator(".note.err").first().innerText();
    if (attempt > 4) throw new Error("Model failed: " + why);
    console.log(`retry ${attempt}: ${why}`);
    await pause(8000 * attempt);
    await page.getByRole("button", { name: "Retry" }).click();
    await page.locator("#send").filter({ hasText: "Stop" }).waitFor({ timeout: 10_000 }).catch(() => {});
    await page.locator("#send").filter({ hasText: "Send" }).waitFor({ timeout: REPLY_TIMEOUT });
  }
  await showMap();
  await pause(2500);
}

async function type(text) {
  await page.locator("#box").click();
  await page.locator("#box").pressSequentially(text, { delay: 6 });
  await pause(600);
  await page.locator("#box").press("Enter");
}

async function readReply(ms = 7000) {
  // Scroll the newest reply into view slowly so viewers can read it.
  const log = page.locator(".log");
  const last = page.locator(".msg.bot").last();
  // Scroll only the chat log, never the page, so the sidebar stays put.
  await last.evaluate((el) => {
    const log = el.closest(".log");
    log.scrollTo({ top: el.offsetTop - log.offsetTop - 20, behavior: "smooth" });
  });
  await pause(ms / 2);
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    await log.evaluate((el) => el.scrollBy({ top: 140, behavior: "smooth" }));
    await pause(ms / 2 / steps);
  }
}

try {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (MODEL_ID && (await page.locator("#model").count())) await page.selectOption("#model", MODEL_ID);
  await page.locator("#send").waitFor();
  // Hide a failed reply while the recorder retries it, so viewers don't see transient model errors.
  await page.addStyleTag({ content: ".msg.bot:has(.note.err) { opacity: 0; }" });

  await overlay("Impact Lens" + SUB + "A coach that helps NGO leaders think: it draws out their value proposition,<br>theory of change and strategy with questions, tests the evidence, and writes it up.</div>", 6000, true);
  await clearOverlay();

  await caption(S.intro, 4000);
  await caption("Left: the 8 areas it examines, with a dial that fills as each is tested. Top: the 5 stages.", 4500);
  await clearOverlay();

  await caption(S.describeCaption, 3000);
  await clearOverlay();
  await type(S.org);
  await waitForReply();
  await readReply(9000);

  await caption(S.lensCaption, 3500);
  await clearOverlay();
  await page.locator(".lens", { hasText: S.lens }).click();
  await waitForReply();
  await readReply(9000);

  await caption("Step 3: answer its questions. It asks for evidence and won't move on from a vague answer.", 3800);
  await clearOverlay();
  await type(S.evidence);
  await waitForReply();
  await readReply(10000);
  await caption("Every claim is logged in the Evidence tab, with how well it is backed up.", 3500);
  await page.getByRole("tab", { name: /Evidence/ }).click();
  await pause(5000);
  await page.getByRole("tab", { name: "Map" }).click();
  await clearOverlay();

  await caption("Step 4: stress-test the model with a realistic shock.", 3000);
  await clearOverlay();
  await page.getByRole("button", { name: /Run a stress test/ }).click();
  await waitForReply();
  await readReply(9000);
  await type(S.stress);
  await waitForReply();
  await readReply(9000);

  await caption("Step 5: generate the NGO Strategy and Alignment Report.", 3000);
  await clearOverlay();
  await page.getByRole("button", { name: /Generate the report/ }).click();
  await waitForReply();
  await readReply(26000);
  await caption("It ends with a scorecard, prioritised recommendations, a 90-day plan, the claims ledger and references. Save it as PDF.", 5000);
  await clearOverlay();

  await caption("Step 6: framework views, drawn from the whole conversation.", 3000);
  await clearOverlay();
  for (let attempt = 1; ; attempt++) {
    await page.getByRole("button", { name: /Framework views/ }).click();
    const opened = await page.getByRole("dialog", { name: "Framework views" }).waitFor({ timeout: REPLY_TIMEOUT }).then(() => true).catch(() => false);
    if (opened) break;
    if (attempt >= 4) throw new Error("Framework views failed: " + (await page.getByRole("status").innerText().catch(() => "")));
    console.log("retry frameworks", attempt);
    await pause(8000 * attempt);
  }
  const fwd = page.getByRole("dialog", { name: "Framework views" });
  for (const [tab, note] of [
    ["Value proposition", "Who benefits, who pays, and what each needs."],
    ["Logic model", "Each level with indicators, sources of evidence and assumptions."],
    ["Strategy", "Ebrahim and Rangan: what it is fair to hold the organization accountable for."],
    ["Accountability", "Who it answers to, and how."],
    ["Causal loops", "The loops that drive or hold back the work, and where the leverage is."],
  ]) {
    await fwd.getByRole("tab", { name: tab }).click();
    await caption(note, 6500);
  }
  await clearOverlay();
  await fwd.getByRole("button", { name: "Close" }).click();
  await caption("A glossary keeps the vocabulary precise: output, outcome and impact are not the same thing.", 3000);
  await page.getByRole("tab", { name: "Glossary" }).click();
  await page.getByRole("searchbox", { name: "Find a term" }).pressSequentially("outcome", { delay: 60 });
  await pause(3500);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await caption("Light and dark themes.", 3000);
  await clearOverlay();

  await overlay("Works with Gemini, Claude, GPT, or a self-hosted model." + SUB + "It can search the web, cites its sources, and keeps conversations in the user's browser.<br>impact-lens-mh.vercel.app</div>", 6500, true);
} finally {
  const video = page.video();
  await context.close();
  await browser.close();
  if (video) {
    const target = path.join(OUT, S.file + ".webm");
    fs.renameSync(await video.path(), target);
    console.log("VIDEO", target);
  }
}
