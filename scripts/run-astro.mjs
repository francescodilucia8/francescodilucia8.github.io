import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// The optional desktop runtime avoids changing the system Node installation.
const [major, minor] = process.versions.node.split(".").map(Number);
let runtime = process.execPath;
if (major < 22 || (major === 22 && minor < 19)) {
  const bundled = join(
    homedir(),
    ".cache",
    "codex-runtimes",
    "codex-primary-runtime",
    "dependencies",
    "node",
    "bin",
    "node.exe",
  );
  if (process.platform === "win32" && existsSync(bundled)) runtime = bundled;
  else {
    console.error("Use Node.js 22.19+ (Node 24 LTS recommended).");
    process.exit(1);
  }
}
const child = spawn(
  runtime,
  ["node_modules/astro/bin/astro.mjs", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
  },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
