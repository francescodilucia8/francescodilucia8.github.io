import { defineConfig } from "astro/config";

const base = process.env.PORTFOLIO_BASE || "/";
const site = process.env.PORTFOLIO_SITE;
export default defineConfig({
  output: "static",
  base,
  ...(site ? { site } : {}),
  trailingSlash: "always",
  build: { format: "directory" },
  outDir: process.env.PORTFOLIO_OUT_DIR || "./dist",
  devToolbar: { enabled: false },
});
