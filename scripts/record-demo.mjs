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

// A fictional organization, so the video shows no real NGO's data.
const ORG =
  "We are Bright Futures Coding Clubs, a fictional 3-year-old NGO in Benin City, Nigeria. " +
  "We run free after-school coding clubs for girls aged 12-17 in 6 public secondary schools, about 240 girls a year. " +
  "The problem we see: very few young women from these schools go into tech jobs. " +
  "We are funded by two foundation grants and one corporate sponsor. I am the founder, preparing for a board strategy retreat.";
const EVIDENCE =
  "Our evidence so far: attendance is 78% across the year, and in a survey of 2024 leavers, 31 of 90 girls said they planned to study a STEM subject. " +
  "We have no comparison group and we do not track what girls do after school. Teachers tell us confidence goes up, but we have not measured it.";
const STRESS =
  "We would protect the clubs in the 3 schools with the strongest teacher champions, ask the corporate sponsor for laptops instead of cash, " +
  "and train older girls as paid peer mentors so we can cut one paid facilitator role. We would tell parents and schools early and explain why.";

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
      ? "position:fixed;inset:0;z-index:9999;display:grid;place-items:center;text-align:center;background:#1d2a2f;color:#eef0ea;font:600 34px/1.3 var(--display),system-ui;padding:60px"
      : "position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:9999;max-width:760px;background:rgba(29,42,47,.94);color:#fff;font:500 21px/1.35 var(--ui),system-ui;padding:14px 22px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.25);text-align:center");
    el.innerHTML = full ? "<div>" + html + "</div>" : html;
  }, { html, full });
  if (ms) await pause(ms);
}
const caption = (text, ms = 3200) => overlay(text, ms);
const clearOverlay = () => page.evaluate(() => document.getElementById("demo-overlay")?.remove());

async function waitForReply() {
  await page.locator("#send").filter({ hasText: "Stop" }).waitFor({ timeout: 10_000 }).catch(() => {});
  await page.locator("#send").filter({ hasText: "Send" }).waitFor({ timeout: REPLY_TIMEOUT });
  const failed = await page.locator(".note.err").count();
  if (failed) throw new Error("Model failed: " + (await page.locator(".note.err").first().innerText()));
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

  await overlay("NGO Strategy &amp; Impact Lens<div style='font:400 22px/1.5 var(--ui),system-ui;margin-top:14px;opacity:.85'>A tough, friendly interviewer that checks whether an NGO's mission, theory of change,<br>strategy, funding and accountability fit together.</div>", 5500, true);
  await clearOverlay();

  await caption("It opens by asking what organization we are examining.", 4000);
  await caption("Left: the review stages, the 8 areas it will examine, and the stakeholder lenses.", 4500);
  await clearOverlay();

  await caption("1 · Describe the organization (this one is fictional).", 2500);
  await clearOverlay();
  await type(ORG);
  await waitForReply();
  await readReply(9000);

  await caption("2 · Choose whose eyes to see it through, here a foundation officer.", 3500);
  await clearOverlay();
  await page.locator(".lens", { hasText: "Donor or foundation officer" }).click();
  await waitForReply();
  await readReply(9000);

  await caption("3 · Answer its questions. It challenges claims that lack evidence.", 3500);
  await clearOverlay();
  await type(EVIDENCE);
  await waitForReply();
  await readReply(10000);
  await caption("The map on the left updates as areas are covered.", 3500);
  await clearOverlay();

  await caption("4 · Stress-test the model with a realistic shock.", 3000);
  await clearOverlay();
  await page.getByRole("button", { name: /Run a stress test/ }).click();
  await waitForReply();
  await readReply(9000);
  await type(STRESS);
  await waitForReply();
  await readReply(9000);

  await caption("5 · Generate the NGO Strategy and Alignment Report.", 3000);
  await clearOverlay();
  await page.getByRole("button", { name: /Generate the report/ }).click();
  await waitForReply();
  await readReply(24000);
  await caption("Save it as Markdown, or copy it into a document for the board.", 4000);

  await overlay("Works with Claude, GPT, Gemini, or a self-hosted model.<div style='font:400 22px/1.5 var(--ui),system-ui;margin-top:14px;opacity:.85'>Conversations stay in the user's browser.<br>Measured-Health/ngo-impact-lens</div>", 6000, true);
} finally {
  const video = page.video();
  await context.close();
  await browser.close();
  if (video) {
    const target = path.join(OUT, "ngo-impact-lens-demo.webm");
    fs.renameSync(await video.path(), target);
    console.log("VIDEO", target);
  }
}
