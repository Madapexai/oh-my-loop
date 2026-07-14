#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const result = spawnSync("oh-my-loop", ["doctor"], { stdio: "inherit" });
if (result.error?.code === "ENOENT") {
  console.error('Install the CLI first: npm install --global --prefix "$HOME/.local" .');
  process.exit(1);
}
process.exit(result.status ?? 1);
