import { createHash, randomUUID } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{5,63}$/;

export function stateRoot() {
  return resolve(process.env.OH_MY_LOOP_HOME || join(homedir(), ".oh-my-loop"));
}

function ensureDirectory(path) {
  mkdirSync(path, { recursive: true, mode: 0o700 });
  try { chmodSync(path, 0o700); } catch {}
}

function readJSON(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`State file is invalid JSON (${path}): ${error.message}`);
  }
}

function writeJSONAtomic(path, value) {
  ensureDirectory(resolve(path, ".."));
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    renameSync(temporary, path);
    chmodSync(path, 0o600);
  } finally {
    rmSync(temporary, { force: true });
  }
}

function validId(id, label = "id") {
  if (typeof id !== "string" || !ID_PATTERN.test(id)) throw new Error(`Invalid ${label}`);
  return id;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

export function appendEvent(run, event) {
  const events = Array.isArray(run.events) ? run.events : [];
  const previousHash = events.at(-1)?.hash || null;
  const entry = {
    sequence: events.length + 1,
    at: new Date().toISOString(),
    ...event,
    previous_hash: previousHash,
  };
  entry.hash = createHash("sha256").update(JSON.stringify(canonical(entry))).digest("hex");
  run.events = [...events, entry];
  run.updated_at = entry.at;
  return entry;
}

export function newRunId() {
  return `run-${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

export function saveRun(run) {
  validId(run.id, "run id");
  const root = join(stateRoot(), "runs");
  ensureDirectory(root);
  writeJSONAtomic(join(root, `${run.id}.json`), run);
  return run;
}

export function loadRun(id) {
  validId(id, "run id");
  const value = readJSON(join(stateRoot(), "runs", `${id}.json`));
  if (!value) throw new Error(`Run not found: ${id}`);
  return value;
}

export function acquireRunLock(id) {
  validId(id, "run id");
  const root = join(stateRoot(), "locks");
  ensureDirectory(root);
  const path = join(root, `${id}.lock`);
  const claim = () => writeFileSync(path, `${JSON.stringify({ pid: process.pid, at: new Date().toISOString() })}\n`, { mode: 0o600, flag: "wx" });
  try {
    claim();
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const ageMs = Date.now() - statSync(path).mtimeMs;
    if (ageMs <= 15 * 60 * 1000) throw new Error(`Run is already being modified: ${id}`);
    rmSync(path, { force: true });
    claim();
  }
  const heartbeat = setInterval(() => {
    try { utimesSync(path, new Date(), new Date()); } catch {}
  }, 60000);
  heartbeat.unref();
  let released = false;
  return () => {
    clearInterval(heartbeat);
    if (!released) rmSync(path, { force: true });
    released = true;
  };
}

export function listRuns() {
  const indexPath = join(stateRoot(), "run-index.json");
  return readJSON(indexPath, []);
}

export function indexRun(run) {
  const path = join(stateRoot(), "run-index.json");
  const values = readJSON(path, []);
  const summary = {
    id: run.id,
    status: run.status,
    task: run.task.slice(0, 160),
    updated_at: run.updated_at,
    team: run.kind === "team",
  };
  const next = [summary, ...values.filter((item) => item.id !== run.id)].slice(0, 500);
  writeJSONAtomic(path, next);
}

function memoryPath() {
  return join(stateRoot(), "memory.json");
}

export function listMemory() {
  const now = Date.now();
  return readJSON(memoryPath(), []).map((entry) => entry.expires_at && Date.parse(entry.expires_at) <= now
    ? { ...entry, status: "expired" }
    : entry);
}

export function addMemory(content, sensitivity, consent, options = {}) {
  if (typeof content !== "string" || !content.trim() || content.trim().length > 10000) throw new Error("Memory content must be 1-10000 characters");
  if (!["general", "personal", "sensitive"].includes(sensitivity)) throw new Error("Memory sensitivity must be general, personal, or sensitive");
  if ((sensitivity === "personal" || sensitivity === "sensitive") && !consent) {
    throw new Error("Personal or sensitive memory requires --consent before persistence");
  }
  const values = listMemory();
  const now = new Date().toISOString();
  const expiresDays = options.expiresDays == null ? null : Number(options.expiresDays);
  if (expiresDays !== null && (!Number.isInteger(expiresDays) || expiresDays < 1 || expiresDays > 3650)) {
    throw new Error("Memory --expires-days must be an integer from 1 to 3650");
  }
  const entry = {
    id: `mem-${randomUUID().replaceAll("-", "").slice(0, 16)}`,
    content: content.trim(),
    sensitivity,
    status: "quarantined",
    version: 1,
    source: typeof options.source === "string" && options.source.trim() ? options.source.trim().slice(0, 200) : "user",
    created_at: now,
    reviewed_at: null,
    updated_at: now,
    expires_at: expiresDays === null ? null : new Date(Date.now() + expiresDays * 86400000).toISOString(),
  };
  writeJSONAtomic(memoryPath(), [entry, ...values]);
  return entry;
}

export function approveMemory(id, consent) {
  if (!consent) throw new Error("Activating memory requires --consent");
  validId(id, "memory id");
  const values = listMemory();
  const entry = values.find((item) => item.id === id);
  if (!entry) throw new Error(`Memory not found: ${id}`);
  if (entry.status === "expired") throw new Error("Expired memory cannot be activated");
  entry.status = "active";
  entry.reviewed_at = new Date().toISOString();
  writeJSONAtomic(memoryPath(), values);
  return entry;
}

export function updateMemory(id, content, consent) {
  validId(id, "memory id");
  if (typeof content !== "string" || !content.trim() || content.trim().length > 10000) throw new Error("Memory content must be 1-10000 characters");
  const values = listMemory();
  const entry = values.find((item) => item.id === id);
  if (!entry) throw new Error(`Memory not found: ${id}`);
  if (entry.status === "expired") throw new Error("Expired memory cannot be updated");
  if ((entry.sensitivity === "personal" || entry.sensitivity === "sensitive") && !consent) {
    throw new Error("Correcting personal or sensitive memory requires --consent");
  }
  entry.content = content.trim();
  entry.version = (entry.version ?? 1) + 1;
  entry.status = "quarantined";
  entry.reviewed_at = null;
  entry.updated_at = new Date().toISOString();
  writeJSONAtomic(memoryPath(), values);
  return entry;
}

export function forgetMemory(id) {
  validId(id, "memory id");
  const values = listMemory();
  if (!values.some((item) => item.id === id)) throw new Error(`Memory not found: ${id}`);
  writeJSONAtomic(memoryPath(), values.filter((item) => item.id !== id));
  return { id, forgotten: true };
}
