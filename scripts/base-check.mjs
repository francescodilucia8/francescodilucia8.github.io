// Verify the Pages-style artifact with a plain local file server, without Astro
// route handling. The server exists only for this check and closes afterward.
import { createServer } from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
import { resolve, join, extname, sep } from "node:path";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const root = resolve("dist-base");
const base = "/portfolio-test/";
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://127.0.0.1").pathname,
    );
    if (!pathname.startsWith(base)) {
      res.writeHead(404);
      res.end();
      return;
    }
    let file = resolve(root, pathname.slice(base.length));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(await readFile(join(root, "404.html")));
  }
});
await new Promise((done) => server.listen(4323, "127.0.0.1", done));
const executable = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].find(existsSync);
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(executable ? { executablePath: executable } : {}),
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const failures = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().endsWith("missing/"))
      failures.push(`${r.status()} ${r.url()}`);
  });
  page.on("pageerror", (e) => failures.push(e.message));
  const origin = "http://127.0.0.1:4323" + base;
  for (const route of [
    "",
    "work/multispectral-thesis/",
    "work/local-ai/",
    "work/bounded-agents/",
  ]) {
    assert.equal((await page.goto(origin + route)).status(), 200);
    await page.reload();
    assert.equal(await page.locator("h1").count(), 1);
    assert.ok((await page.locator('a[href^="/portfolio-test/"]').count()) > 0);
  }
  const italianContext = await browser.newContext({ locale: "it-IT" });
  const italianPage = await italianContext.newPage();
  await italianPage.goto(origin);
  await italianPage.waitForURL(origin + "it/");
  for (const route of ["", "work/multispectral-thesis/", "work/local-ai/", "work/bounded-agents/", "404/"]) {
    assert.equal((await italianPage.goto(origin + "it/" + route)).status(), 200);
    await italianPage.reload();
    assert.equal(await italianPage.locator("html").getAttribute("lang"), "it");
    assert.equal(await italianPage.locator("h1").count(), 1);
  }
  await italianPage.goto(origin + "it/work/local-ai/#main");
  await italianPage.getByRole("link", { name: "Passa all’inglese" }).click();
  await italianPage.waitForURL(origin + "work/local-ai/?lang=en#main");
  await italianContext.close();
  await page.goto(origin);
  await page.locator(".portrait-block").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.images].every((i) => i.complete && i.naturalWidth > 0),
  );
  await page.locator("[data-thesis]").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector("[data-thesis]")?.dataset.playing === "true",
  );
  await page.getByRole("button", { name: "Pause thesis animation" }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "build-notes/browser/base-desktop.png" });
  await page.setViewportSize({ width: 320, height: 568 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "About", exact: true }).click();
  assert.ok(page.url().endsWith("/portfolio-test/#about"));
  assert.equal((await page.goto(origin + "missing/")).status(), 404);
  await page.getByRole("link", { name: "Back to the portfolio" }).click();
  assert.equal(page.url(), origin);
  assert.deepEqual(failures, []);
  // Save a representative final root preview, including a fully loaded portrait.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(process.env.VERIFY_URL || "http://127.0.0.1:4321/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "build-notes/browser/desktop-cover.png" });
  await page.locator(".portrait-block").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.images].every((i) => i.complete && i.naturalWidth > 0),
  );
  await page.screenshot({ path: "build-notes/browser/about-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "build-notes/browser/mobile-cover.png" });
  await writeFile(
    "build-notes/browser/base-results.json",
    JSON.stringify(
      {
        status: "passed",
        base,
        routes: 10,
        browser: browser.version(),
        method:
          "Plain static file server; desktop, 320px, direct reloads, local assets, animation import, anchors, menu, 404",
      },
      null,
      2,
    ),
  );
  console.log(
    "Passed: Pages-style repository prefix, routes, assets, animation import, mobile navigation and 404.",
  );
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
