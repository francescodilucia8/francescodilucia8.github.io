import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const url = process.env.VERIFY_URL || "http://127.0.0.1:4322/";
const output = "build-notes/reel-review";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const reports = [];
for (const width of [320, 390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(url + "work/multispectral-thesis/");
  const scene = page.locator("[data-thesis]");
  await scene.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "03 / Region & mask" }).click();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    [...document.images].every((i) => i.complete && i.naturalWidth > 0),
  );
  for (let stage = 0; stage < 8; stage++) {
    const time = stage * 2.4 + 1.8;
    await scene.evaluate(
      (el, time) =>
        el.dispatchEvent(new CustomEvent("thesis:seek", { detail: { time } })),
      time,
    );
    assert.equal(await scene.getAttribute("data-stage"), String(stage));
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await scene.screenshot({ path: `${output}/${width}-stage-${stage}.png` });
    const first = await scene.locator(".reel-view").screenshot();
    await scene.evaluate((el) =>
      el.dispatchEvent(new CustomEvent("thesis:seek", { detail: { time: 0 } })),
    );
    await scene.evaluate(
      (el, time) =>
        el.dispatchEvent(new CustomEvent("thesis:seek", { detail: { time } })),
      time,
    );
    const after = await scene.locator(".reel-view").screenshot();
    const a = await sharp(first).raw().toBuffer();
    const b = await sharp(after).raw().toBuffer();
    let changed = 0,
      maxDifference = 0;
    assert.equal(a.length, b.length);
    for (let n = 0; n < a.length; n++) {
      const difference = Math.abs(a[n] - b[n]);
      maxDifference = Math.max(maxDifference, difference);
      if (difference > 2) changed++;
    }
    assert.ok(
      changed / a.length < 0.001,
      "Seek mismatch: " +
        changed +
        " channels, max difference " +
        maxDifference,
    );
  }
  const cells = [];
  const cellWidth = width === 1440 ? 640 : width;
  for (let stage = 0; stage < 8; stage++) {
    const data = await sharp(`${output}/${width}-stage-${stage}.png`)
      .resize({ width: cellWidth })
      .png()
      .toBuffer();
    const meta = await sharp(data).metadata();
    cells.push({ input: data, meta });
  }
  const h = Math.max(...cells.map((c) => c.meta.height));
  await sharp({
    create: {
      width: cellWidth * 4,
      height: h * 2,
      channels: 3,
      background: "#f5f3eb",
    },
  })
    .composite(
      cells.map((c, i) => ({
        input: c.input,
        left: (i % 4) * cellWidth,
        top: Math.floor(i / 4) * h,
      })),
    )
    .png()
    .toFile(`${output}/${width}-sheet.png`);
  reports.push({ width, stages: 8, overflow: false, deterministic: true });
  await page.close();
}
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(url + "work/multispectral-thesis/");
const scene = page.locator("[data-thesis]");
await scene.scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "02 / Align the bands" }).click();
for (const time of [2.4, 2.6, 2.8, 3, 3.2, 3.6, 7.2, 7.5, 7.8, 8.2]) {
  await scene.evaluate(
    (el, time) =>
      el.dispatchEvent(new CustomEvent("thesis:seek", { detail: { time } })),
    time,
  );
  await scene
    .locator(".reel-canvas")
    .screenshot({ path: `${output}/transition-${time}.png` });
}
await writeFile(`${output}/results.json`, JSON.stringify(reports, null, 2));
await browser.close();
console.log(reports);
