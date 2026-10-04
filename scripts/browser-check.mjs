import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";

const url = process.env.VERIFY_URL || "http://127.0.0.1:4321/";
if (!/^http:\/\/(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?\//.test(url))
  throw new Error("This check is restricted to a local preview.");
const output = "build-notes/browser";
await mkdir(output, { recursive: true });
const executable =
  process.env.VERIFY_BROWSER ||
  [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ].find(existsSync);
const browser = await chromium.launch({
  headless: true,
  ...(executable ? { executablePath: executable } : {}),
});
const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push({ name, status: "passed" });
  } catch (error) {
    results.push({ name, status: "failed", detail: error.message });
  }
  console.log(results.at(-1));
};
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
});
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
await check("Desktop home and local assets", async () => {
  await page
    .getByRole("heading", { name: "Before creating the software, I find the pattern in the data" })
    .waitFor();
  assert.equal(await page.locator("#work article").count(), 3);
  assert.equal(
    await page.locator('a[href="mailto:francescodilucia8@gmail.com"]').count(),
    2,
  );
  await page.locator(".portrait-block").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.images].every((i) => i.complete && i.naturalWidth > 0),
  );
  assert.equal(
    await page
      .locator("img")
      .evaluateAll((imgs) =>
        imgs.every((i) => i.complete && i.naturalWidth > 0),
      ),
    true,
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${output}/desktop-home.png`, fullPage: true });
});
for (const [w, h] of [
  [320, 568],
  [360, 800],
  [390, 844],
  [430, 932],
  [844, 390],
  [768, 1024],
  [1440, 1000],
]) {
  await check(`Responsive layout ${w}×${h}`, async () => {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `Overflow at ${w}px`,
    );
    await page.screenshot({
      path: `${output}/home-${w}x${h}.png`,
      fullPage: true,
    });
  });
}
await check("Keyboard skip link and mobile disclosure", async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement?.textContent),
    "Skip to content",
  );
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "main");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  assert.equal(await menu.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.equal(
    await page.evaluate(() => document.activeElement?.className),
    "nav-toggle",
  );
  await menu.click();
  await page.getByRole("link", { name: "About", exact: true }).click();
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.ok(page.url().endsWith("#about"));
});
await check(
  "Representative alignment transition and one-shot timeline",
  async () => {
    await page.goto(url);
    const scene = page.locator("[data-thesis]");
    await scene.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => document.querySelector("[data-thesis]")?.dataset.stage === "1",
    );
    await page.screenshot({ path: `${output}/alignment-transition.png` });
    await page.getByRole("button", { name: "Pause thesis animation" }).click();
    assert.equal(await scene.getAttribute("data-playing"), "false");
    const paused = await scene.getAttribute("data-stage");
    await page.waitForTimeout(700);
    assert.equal(await scene.getAttribute("data-stage"), paused);
    await page.getByRole("button", { name: "Replay thesis animation" }).focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () => document.querySelector("[data-thesis]")?.dataset.stage === "7",
    );
    await page.waitForFunction(
      () =>
        document.querySelector("[data-thesis]")?.dataset.playing === "false",
    );
    assert.equal(await scene.getAttribute("data-stage"), "7");
    await page.waitForTimeout(700);
    assert.equal(await scene.getAttribute("data-stage"), "7");
  },
);
await check("Offscreen and simulated hidden-document pause", async () => {
  const scene = page.locator("[data-thesis]");
  await scene.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Replay thesis animation" }).click();
  await page.waitForFunction(
    () => document.querySelector("[data-thesis]")?.dataset.playing === "true",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(
    () => document.querySelector("[data-thesis]")?.dataset.playing === "false",
  );
  await scene.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector("[data-thesis]")?.dataset.playing === "true",
  );
  // Handler test only: browser OS tab visibility is not claimed by this simulation.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForFunction(
    () => document.querySelector("[data-thesis]")?.dataset.playing === "false",
  );
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
});
await check(
  "Three direct case-study routes, reload and browser history",
  async () => {
    for (const slug of ["multispectral-thesis", "local-ai", "bounded-agents"]) {
      const response = await page.goto(`${url}work/${slug}/`);
      assert.equal(response.status(), 200);
      await page.reload();
      assert.equal(await page.locator("h1").count(), 1);
      assert.ok(await page.locator(".case-narrative").innerText());
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      );
      await page.screenshot({
        path: `${output}/${slug}-mobile.png`,
        fullPage: true,
      });
    }
    await page.goto(url);
    await page
      .getByRole("link", { name: "Explore the study", exact: true })
      .click();
    assert.ok(page.url().includes("multispectral-thesis"));
    await page.goBack();
    assert.equal(new URL(page.url()).pathname, new URL(url).pathname);
    await page.goForward();
    assert.ok(page.url().includes("multispectral-thesis"));
  },
);
await check("Expanded stage selectors", async () => {
  await page.goto(`${url}work/multispectral-thesis/`);
  const select = page.getByRole("button", { name: "03 / Region & mask" });
  await select.click();
  assert.equal(
    await page.locator("[data-thesis]").getAttribute("data-stage"),
    "2",
  );
  assert.equal(await select.getAttribute("aria-pressed"), "true");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: `${output}/thesis-desktop.png`,
    fullPage: true,
  });
});
await check("Replay requested while the animation library is loading", async () => {
  const slow = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const p = await slow.newPage();
  let releaseImport;
  const pendingImport = new Promise((resolve) => { releaseImport = resolve; });
  await p.route("**/*gsap*", async (route) => { await pendingImport; await route.continue(); });
  try {
    await p.goto(url + "work/multispectral-thesis/");
    await p.getByRole("button", { name: "03 / Region & mask" }).click();
    await p.getByRole("button", { name: "Replay thesis animation" }).click();
    releaseImport();
    await p.getByRole("button", { name: "Pause thesis animation" }).waitFor();
    assert.equal(await p.locator("[data-thesis]").getAttribute("data-stage"), "0");
    await p.getByRole("button", { name: "Pause thesis animation" }).click();
  } finally {
    releaseImport();
    await slow.close();
  }
});
await check("Automated accessibility: home, case studies and 404", async () => {
  const reports = [];
  for (const route of [
    "",
    "work/multispectral-thesis/",
    "work/local-ai/",
    "work/bounded-agents/",
    "404.html",
  ]) {
    await page.goto(url + route);
    const report = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    reports.push({ route, violations: report.violations });
  }
  await writeFile(`${output}/axe.json`, JSON.stringify(reports, null, 2));
  assert.deepEqual(
    reports.flatMap((r) =>
      r.violations.map((v) => `${r.route}: ${v.id} (${v.nodes.length})`),
    ),
    [],
  );
});
await check(
  "Reduced motion: still, manual stage change, no GSAP fetch",
  async () => {
    const reduced = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 390, height: 844 },
    });
    const p = await reduced.newPage();
    const requests = [];
    p.on("request", (r) => requests.push(r.url()));
    await p.goto(url);
    await p.locator("[data-thesis]").scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
    assert.equal(
      await p.locator("[data-thesis]").getAttribute("data-stage"),
      "0",
    );
    assert.equal(
      await p.locator("[data-thesis]").getAttribute("data-playing"),
      "false",
    );
    await p.getByRole("button", { name: "Show next thesis stage" }).click();
    assert.equal(
      await p.locator("[data-thesis]").getAttribute("data-stage"),
      "1",
    );
    // Visibility reconciliation must preserve a manually selected reduced-motion still.
    await p.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.locator("[data-thesis]").scrollIntoViewIfNeeded();
    assert.equal(await p.locator("[data-thesis]").getAttribute("data-stage"), "1");
    assert.ok(!requests.some((r) => /gsap/i.test(r)), requests.join("\n"));
    await p.screenshot({
      path: `${output}/reduced-motion.png`,
      fullPage: true,
    });
    await reduced.close();
  },
);
await check(
  "Without JavaScript: navigation, project content and poster",
  async () => {
    const nojs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 568 },
    });
    const p = await nojs.newPage();
    await p.goto(url);
    assert.ok(
      await p.getByRole("link", { name: "About", exact: true }).isVisible(),
    );
    await p
      .getByRole("link", { name: "Explore the study", exact: true })
      .click();
    assert.equal(await p.locator(".stage-static").count(), 8);
    assert.equal(await p.locator(".scene-controls").isVisible(), false);
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await p.screenshot({ path: `${output}/no-js.png`, fullPage: true });
    await nojs.close();
  },
);
await check(
  "Failed portrait/media and unavailable scene script fallback",
  async () => {
    const fallback = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const p = await fallback.newPage();
    await p.route("**/images/**", (route) => route.abort());
    await p.route("**/*gsap*", (route) => route.abort());
    await p.goto(url);
    await p.locator("[data-thesis]").scrollIntoViewIfNeeded();
    await p
      .getByRole("link", { name: "Explore the study", exact: true })
      .click();
    assert.ok(await p.locator(".case-narrative").isVisible());
    assert.ok(await p.locator(".stage-list").isVisible());
    await p.screenshot({ path: `${output}/failed-media.png`, fullPage: true });
    await fallback.close();
  },
);
await check("Useful 404 and no unexpected runtime errors", async () => {
  await page.goto(`${url}404.html`);
  const missing = await page.goto(`${url}missing-page/`);
  assert.equal(missing.status(), 404);
  errors.splice(
    0,
    errors.length,
    ...errors.filter((error) => !error.includes("/missing-page/")),
  );
  await page.getByRole("link", { name: "Back to the portfolio" }).click();
  assert.equal(new URL(page.url()).pathname, new URL(url).pathname);
  assert.deepEqual(errors, []);
});
await writeFile(
  `${output}/results.json`,
  JSON.stringify({ url, browser: browser.version(), results }, null, 2),
);
await browser.close();
if (results.some((r) => r.status === "failed")) process.exitCode = 1;
