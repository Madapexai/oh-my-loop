#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { callConfiguredModel, starterContract } from "../lib/model-router.mjs";
import { cancelRun, confirmRun, observeRun, provideInputRun, resumeRun, startRun } from "../lib/runtime.mjs";
import { resumeTeam, runTeam } from "../lib/team.mjs";
import {
  addMemory,
  approveMemory,
  forgetMemory,
  listMemory,
  listRuns,
  loadRun,
  stateRoot,
  updateMemory,
} from "../lib/storage.mjs";

const VERSION = "0.6.0";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_SOURCE = join(ROOT, "skills", "oh-my-loop");

function option(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function flag(args, name) {
  return args.includes(name);
}

const VALUE_OPTIONS = new Set(["--agent", "--mode", "--scope", "--project", "--model", "--base-url", "--source", "--sensitivity", "--expires-days"]);

function positionals(args) {
  const values = [];
  for (let index = 0; index < args.length; index += 1) {
    if (VALUE_OPTIONS.has(args[index])) index += 1;
    else if (!args[index].startsWith("--")) values.push(args[index]);
  }
  return values;
}

function agentTarget(agent, scope, project) {
  const home = homedir();
  if (scope === "project") {
    if (!project) throw new Error("--project is required with --scope project");
    const roots = { codex: ".agents", claude: ".claude", gemini: ".gemini" };
    if (roots[agent]) return resolve(project, roots[agent], "skills", "oh-my-loop");
  }
  if (agent === "codex") return join(process.env.CODEX_HOME || join(home, ".codex"), "skills", "oh-my-loop");
  if (agent === "claude") return join(process.env.CLAUDE_CONFIG_DIR || join(home, ".claude"), "skills", "oh-my-loop");
  if (agent === "gemini") return join(home, ".gemini", "skills", "oh-my-loop");
  if (agent === "cursor") {
    if (!project) throw new Error("--project is required for Cursor");
    return resolve(project, ".cursor", "rules", "oh-my-loop.mdc");
  }
  throw new Error(`Unsupported agent: ${agent}`);
}

function targetExists(target) {
  try {
    lstatSync(target);
    return true;
  } catch {
    return false;
  }
}

function replaceTarget(target, force) {
  if (!targetExists(target)) return;
  if (!force) throw new Error(`Target exists: ${target}; use --force to replace it`);
  rmSync(target, { recursive: true, force: true });
}

function installSkill(target, mode, force) {
  replaceTarget(target, force);
  mkdirSync(dirname(target), { recursive: true });
  if (mode === "symlink") {
    symlinkSync(realpathSync(SKILL_SOURCE), target, "dir");
    return;
  }
  const temporary = mkdtempSync(join(dirname(target), ".oh-my-loop-"));
  const staged = join(temporary, "skill");
  try {
    cpSync(SKILL_SOURCE, staged, {
      recursive: true,
      filter: (source) => !source.includes("__pycache__") && !source.endsWith(".pyc") && !source.endsWith(".DS_Store"),
    });
    renameSync(staged, target);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

function installCursor(target, force) {
  replaceTarget(target, force);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `---\ndescription: Run adaptive, evidence-gated work through Oh My Loop\nglobs:\nalwaysApply: false\n---\n\nUse the current agent model to infer intent, risk, authority, and an adaptive strategy from context. Do not use keyword matching. Treat the plan as a hypothesis: observe, choose one bounded action, verify, and adapt. Preserve user decision ownership, require exact confirmation for external or irreversible action, and never claim completion without fresh evidence. Read skills/oh-my-loop/SKILL.md when present.\n`);
}

function install(args) {
  const selected = option(args, "--agent");
  if (!selected) throw new Error("--agent is required: codex, claude, gemini, cursor, or all");
  const mode = option(args, "--mode", "copy");
  const scope = option(args, "--scope", "user");
  const project = option(args, "--project");
  const force = flag(args, "--force");
  const agents = selected === "all" ? ["codex", "claude", "gemini"] : [selected];
  for (const agent of agents) {
    const target = agentTarget(agent, scope, project);
    if (agent === "cursor") installCursor(target, force);
    else installSkill(target, mode, force);
    console.log(`installed ${agent}: ${target}`);
  }
}

function doctor() {
  let failed = false;
  for (const agent of ["codex", "claude", "gemini"]) {
    const file = join(agentTarget(agent, "user", null), "SKILL.md");
    const installed = existsSync(file) ? readFileSync(file, "utf8") : "";
    const canonical = readFileSync(join(SKILL_SOURCE, "SKILL.md"), "utf8");
    const ready = installed.includes("name: oh-my-loop");
    const state = !ready ? "missing" : installed === canonical ? "ready" : "stale";
    console.log(`${agent}: ${state} (${file})`);
    failed ||= state !== "ready";
  }
  console.log(`standalone model: ${process.env.OH_MY_LOOP_MODEL ? "configured" : "not configured (model-backed CLI commands unavailable outside a host agent)"}`);
  console.log(`state: ${stateRoot()} (local files are permission-restricted but not encrypted)`);
  process.exitCode = failed ? 1 : 0;
}

function help() {
  console.log(`Oh My Loop ${VERSION}\n\nRoute and contract:\n  oh-my-loop route <task> [--json]\n  oh-my-loop contract <task> [--json]\n\nPersistent agentic runs:\n  oh-my-loop run <task> [--json]\n  oh-my-loop input <run-id> <requested context> [--json]\n  oh-my-loop observe <run-id> <fresh evidence> [--source user|tool] [--json]\n  oh-my-loop confirm <run-id> <exact pending action> [--json]\n  oh-my-loop status [run-id] [--json]\n  oh-my-loop resume <run-id> [--json]\n  oh-my-loop cancel <run-id> [reason] [--json]\n\nAgent Team (parallel advisory roles):\n  oh-my-loop team <task> [--json]\n\nGoverned memory:\n  oh-my-loop memory list [--json]\n  oh-my-loop memory add <content> [--sensitivity general|personal|sensitive] [--source label] [--expires-days N] [--consent] [--json]\n  oh-my-loop memory approve <memory-id> --consent [--json]\n  oh-my-loop memory update <memory-id> <content> [--consent] [--json]\n  oh-my-loop memory forget <memory-id> [--json]\n\nAgent installation:\n  oh-my-loop install --agent <codex|claude|gemini|cursor|all> [--scope user|project] [--project path] [--mode copy|symlink] [--force]\n  oh-my-loop doctor\n\nModel routing:\n  export OH_MY_LOOP_MODEL=<model>\n  export OH_MY_LOOP_API_KEY=<secret>\n  export OH_MY_LOOP_BASE_URL=https://api.openai.com/v1\n  export OH_MY_LOOP_TIMEOUT_MS=30000\n  export OH_MY_LOOP_HOME=$HOME/.oh-my-loop\n\nRemote endpoints must use HTTPS. Runs persist task and evidence locally; files are permission-restricted but not encrypted. Inside a host code agent, the current model can perform semantic routing without a second model.`);
}

function modelOptions(args) {
  return { model: option(args, "--model"), baseUrl: option(args, "--base-url") };
}

function output(value, args, summary) {
  if (flag(args, "--json")) console.log(JSON.stringify(value, null, 2));
  else console.log(summary(value));
}

function runSummary(run) {
  const next = run.pending_action?.confirmation_text || run.pending_action?.description;
  const action = next ? `\nnext: ${next}` : "";
  return `${run.id}\t${run.status}${action}`;
}

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  if (["help", "--help", "-h"].includes(command)) help();
  else if (["version", "--version", "-v"].includes(command)) console.log(VERSION);
  else if (command === "route" || command === "contract") {
    const task = positionals(args).join(" ").trim();
    if (!task) throw new Error("A non-empty task is required");
    const routed = await callConfiguredModel(task, modelOptions(args));
    const value = command === "route" ? routed : starterContract(task, routed);
    output(value, args, () => `${routed.decision}\t${routed.pattern || "-"}\t${routed.reason}`);
  } else if (command === "run") {
    const task = positionals(args).join(" ").trim();
    if (!task) throw new Error("A non-empty task is required");
    const run = await startRun(task, modelOptions(args));
    output(run, args, runSummary);
  } else if (command === "observe") {
    const [id, ...parts] = positionals(args);
    const evidence = parts.join(" ").trim();
    if (!id || !evidence) throw new Error("observe requires <run-id> and fresh evidence");
    const run = await observeRun(id, evidence, option(args, "--source", "user"), modelOptions(args));
    output(run, args, runSummary);
  } else if (command === "input") {
    const [id, ...parts] = positionals(args);
    const userInput = parts.join(" ").trim();
    if (!id || !userInput) throw new Error("input requires <run-id> and the requested context");
    const run = await provideInputRun(id, userInput, modelOptions(args));
    output(run, args, runSummary);
  } else if (command === "confirm") {
    const [id, ...parts] = positionals(args);
    const exactAction = parts.join(" ").trim();
    if (!id || !exactAction) throw new Error("confirm requires <run-id> and the exact pending action");
    const run = confirmRun(id, exactAction);
    output(run, args, runSummary);
  } else if (command === "status") {
    const [id] = positionals(args);
    const value = id ? loadRun(id) : listRuns();
    output(value, args, (item) => Array.isArray(item) ? item.map((run) => `${run.id}\t${run.status}\t${run.task}`).join("\n") : runSummary(item));
  } else if (command === "resume") {
    const [id] = positionals(args);
    if (!id) throw new Error("resume requires <run-id>");
    const existing = loadRun(id);
    const run = existing.kind === "team"
      ? await resumeTeam(id, modelOptions(args))
      : await resumeRun(id, modelOptions(args));
    output(run, args, runSummary);
  } else if (command === "cancel") {
    const [id, ...parts] = positionals(args);
    if (!id) throw new Error("cancel requires <run-id>");
    const run = cancelRun(id, parts.join(" ").trim() || "Cancelled by user");
    output(run, args, runSummary);
  } else if (command === "team") {
    const task = positionals(args).join(" ").trim();
    if (!task) throw new Error("team requires a non-empty task");
    const run = await runTeam(task, modelOptions(args));
    output(run, args, runSummary);
  } else if (command === "memory") {
    const [action, ...parts] = positionals(args);
    let value;
    if (action === "list" || !action) value = listMemory();
    else if (action === "add") value = addMemory(parts.join(" ").trim(), option(args, "--sensitivity", "general"), flag(args, "--consent"), { source: option(args, "--source", "user"), expiresDays: option(args, "--expires-days") });
    else if (action === "approve") value = approveMemory(parts[0], flag(args, "--consent"));
    else if (action === "update") value = updateMemory(parts[0], parts.slice(1).join(" ").trim(), flag(args, "--consent"));
    else if (action === "forget") value = forgetMemory(parts[0]);
    else throw new Error("memory action must be list, add, approve, update, or forget");
    output(value, args, (item) => JSON.stringify(item, null, 2));
  } else if (command === "install") install(args);
  else if (command === "doctor") doctor();
  else throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`oh-my-loop: ${error.message}`);
  process.exitCode = 1;
});
