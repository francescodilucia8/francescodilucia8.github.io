import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const dir = resolve(process.env.PORTFOLIO_OUT_DIR || "dist");
const base = (process.env.PORTFOLIO_BASE || "/").replace(/\/$/, "");
async function files(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = join(root, entry.name);
    if (entry.isDirectory()) result.push(...(await files(file)));
    else result.push(file);
  }
  return result;
}
let failures = [];
const all = await files(dir);
const html = all.filter((f) => f.endsWith(".html"));
if (html.length !== 5)
  failures.push(`Expected five static pages, found ${html.length}`);
let js = 0,
  gzip = 0,
  images = 0,
  fonts = 0;
for (const f of all) {
  const buffer = await readFile(f);
  if (f.endsWith(".js")) {
    js += buffer.length;
    gzip += gzipSync(buffer).length;
  }
  if (/\.(webp|png)$/.test(f)) images += buffer.length;
  if (/\.woff2?$/.test(f)) fonts += buffer.length;
  if (
    /\.(pdf|pptx|docx|npz|env|map)$/.test(f) ||
    /references|build-notes|CV_/.test(f)
  )
    failures.push(`Unintended output: ${f}`);
}
for (const f of html) {
  const text = await readFile(f, "utf8");
  if (
    /TODO|PLACEHOLDER|\bs\d{6}\b|Relative Optical Center X\/Y.*speaker/i.test(
      text,
    )
  )
    failures.push(`Private or unfinished text: ${f}`);
  for (const match of text.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const url = match[1].split("#")[0].split("?")[0];
    if (!url.startsWith("/")) continue;
    if (base && !url.startsWith(base + "/")) {
      failures.push(`Incorrect base URL ${url} in ${f}`);
      continue;
    }
    const stripped = url.slice(base.length).replace(/^\//, "");
    const destination = join(dir, stripped);
    try {
      const s = await stat(destination);
      if (s.isDirectory()) await stat(join(destination, "index.html"));
    } catch {
      failures.push(`Missing local destination ${url} in ${f}`);
    }
  }
}
if (gzip > 150 * 1024)
  failures.push(`Total JS exceeds 150 KiB gzip budget: ${gzip}`);
console.log(
  JSON.stringify(
    {
      pages: html.length,
      files: all.length,
      jsBytes: js,
      jsGzipBytes: gzip,
      imageBytes: images,
      fontBytes: fonts,
      base: base || "/",
      failures,
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
