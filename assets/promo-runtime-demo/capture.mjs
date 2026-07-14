import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "screenshots");
const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
];

const chrome = chromeCandidates.find((candidate) => existsSync(candidate));
if (!chrome) {
  console.error("No Chrome-compatible browser found for headless screenshots.");
  process.exit(1);
}

const server = spawn(process.execPath, ["server.mjs"], {
  cwd: here,
  stdio: ["ignore", "pipe", "pipe"]
});

let ready = "";
server.stdout.on("data", (chunk) => {
  ready += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

await new Promise((resolveReady, rejectReady) => {
  const startedAt = Date.now();
  const timer = setInterval(() => {
    if (ready.includes("promo-demo-server")) {
      clearInterval(timer);
      resolveReady();
    }
    if (Date.now() - startedAt > 5000) {
      clearInterval(timer);
      rejectReady(new Error("Timed out waiting for screenshot server."));
    }
  }, 50);
});

const shots = [
  ["game", "game-runtime.png"],
  ["compare", "agent-comparison.png"],
  ["life", "school-district-decision.png"],
  ["invest", "investment-framework.png"]
];

for (const [hash, file] of shots) {
  const target = `http://127.0.0.1:41739/?view=${hash}`;
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1440,1000",
    "--virtual-time-budget=2200",
    `--screenshot=${join(out, file)}`,
    target
  ], { stdio: "inherit" });
}

server.kill("SIGTERM");
console.log(`Screenshots written to ${resolve(out)}`);
