import assert from "node:assert/strict";
import { mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

import { callModelJSON, enforcePolicy, starterContract } from "../lib/model-router.mjs";
import { cancelRun, confirmRun, observeRun, provideInputRun, startRun } from "../lib/runtime.mjs";
import { resumeTeam, runTeam } from "../lib/team.mjs";
import { acquireRunLock, addMemory, approveMemory, forgetMemory, listMemory, listRuns, loadRun, updateMemory } from "../lib/storage.mjs";

let server;
let baseUrl;
let teamMemberFailuresRemaining = 0;

function routeFixture(overrides = {}) {
  const base = {
    schema_version: "2",
    decision: "pattern",
    pattern: "adaptive_probe",
    domain: "model-domain",
    intent: "model inferred intent",
    decision_owner: "agent",
    confidence: 0.9,
    reason: "fresh evidence is needed",
    warnings: [],
    risk: { level: "low", autonomy: "auto", reasons: [], requires_human: false, allow_external_action: true },
    governance: {
      harm_guardrails: ["Do not worsen safety or privacy"],
      allowed_actions: ["One reversible local action"],
      forbidden_actions: ["No unconfirmed external action"],
      confirmation_boundary: "Confirm every external, irreversible, or other-person action",
      privacy_boundary: "Do not disclose or store secrets",
      affected_people: [],
      time_budget_minutes: 30,
      token_budget: 12000,
    },
    loop: {
      name: "adaptive-probe",
      patterns: ["custom_observation"],
      strategy: "Act once, observe, and adapt from evidence",
      feedback_type: "objective",
      steps: ["Run one reversible probe"],
      adaptation_rules: ["Change the next step when evidence contradicts the hypothesis"],
      success_evidence: ["A fresh observation supports the bounded claim"],
      stop_conditions: ["Evidence passes or progress stops"],
      max_iterations: 3,
    },
  };
  return {
    ...base,
    ...overrides,
    risk: { ...base.risk, ...(overrides.risk ?? {}) },
    governance: { ...base.governance, ...(overrides.governance ?? {}) },
  };
}

function chat(value) {
  return { choices: [{ message: { content: JSON.stringify(value) } }] };
}

before(async () => {
  process.env.OH_MY_LOOP_HOME = mkdtempSync(join(tmpdir(), "oh-my-loop-test-"));
  process.env.OH_MY_LOOP_MODEL = "mock";
  delete process.env.OH_MY_LOOP_API_KEY;
  server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      const payload = JSON.parse(body);
      const system = payload.messages[0].content;
      const input = JSON.parse(payload.messages[1].content);
      let value;
      if (system.includes("safety and intent router")) {
        value = routeFixture(input.task.includes("direct answer") ? {
          decision: "direct_answer", pattern: null, loop: null,
        } : input.task.includes("do once") ? {
          decision: "do_once", pattern: null, loop: null,
        } : input.task.includes("tiny token budget") ? {
          governance: { token_budget: 100 },
        } : input.task.includes("confirmation") ? {
          risk: { level: "high", autonomy: "confirm_before_action", requires_human: true, allow_external_action: false },
        } : {});
      } else if (system.includes("adaptive step proposer")) {
        const observation = input.ledger.find((event) => event.type === "observation");
        const userInput = input.ledger.find((event) => event.type === "user_input");
        if (input.task.includes("needs input") && !userInput) {
          const routeEvent = input.ledger[0];
          value = {
            schema_version: "1", status: "needs_input", hypothesis: "One material preference is missing",
            basis: { event_hashes: [routeEvent.hash], summary: "The contract cannot choose a bounded probe without user context" },
            action: null, expected_evidence: [], completion: null, reason: "Ask for the missing preference",
          };
        } else if (observation && !input.task.includes("no progress")) {
          value = {
            schema_version: "1", status: "completed", hypothesis: "The observation supports the bounded claim",
            basis: { event_hashes: [observation.hash], summary: "Fresh observation is available" }, action: null,
            expected_evidence: [], completion: { claim: "The bounded probe completed", evidence_event_hashes: [observation.hash], harm_check: "Guardrails remained intact" },
            reason: "Evidence is ready for independent verification",
          };
        } else {
          const routeEvent = input.ledger[0];
          const external = input.task.includes("confirmation");
          value = {
            schema_version: "1", status: "continue", hypothesis: "One probe can reduce uncertainty",
            basis: { event_hashes: [routeEvent.hash], summary: "The route requires fresh evidence" },
            action: {
              id: "probe-1", description: external ? "Send the reviewed proposal" : "Run one reversible local probe",
              scope: external ? "Only the named review recipient" : "Only the local test fixture",
              authority_basis: "The contract allows one bounded action",
              data_disclosed: external ? ["Reviewed proposal text"] : [], estimated_cost: "zero money; under five minutes",
              external, reversible: !external, affects_others: external,
            },
            expected_evidence: ["Observe the concrete result and side effects"], completion: null, reason: "Take one bounded step",
          };
        }
      } else if (system.includes("independent progress assessor")) {
        value = {
          state: input.task.includes("no progress") ? "unchanged" : "advanced",
          reason: input.task.includes("no progress") ? "The newest observation did not reduce uncertainty" : "The newest observation materially reduced uncertainty",
          evidence_event_hashes: [input.newest_observation.hash],
        };
      } else if (system.includes("semantic pre-action policy gate")) {
        value = {
          allowed: !input.task.includes("forbidden action"),
          reason: input.task.includes("forbidden action") ? "The action crosses a forbidden contract boundary" : "The bounded action fits the contract and confirmation boundary",
          requires_confirmation: input.action.external,
          contract_basis: [input.contract.allowed_actions[0], input.contract.confirmation_boundary],
          violated_boundaries: input.task.includes("forbidden action") ? [input.contract.forbidden_actions[0]] : [],
        };
      } else if (system.includes("independent completion verifier")) {
        const hash = input.observation_events[0].hash;
        value = { pass: true, reason: "Fresh evidence and guardrails support the claim", evidence_event_hashes: [hash], guardrails_checked: input.contract.harm_guardrails };
      } else if (system.includes("Agent Team planner")) {
        value = {
          schema_version: "1", team_name: "evidence-team", reason: "Independent perspectives reduce error", max_parallel: 2,
          roles: [
            { id: "evidence-auditor", purpose: "Inspect evidence", deliverable: "Evidence assessment", evidence_needed: ["Task facts"] },
            { id: "risk-challenger", purpose: "Challenge risks", deliverable: "Risk assessment", evidence_needed: ["Contract guardrails"] },
          ],
          coordination: "Merge immutable proposals and preserve disagreement", verification_criteria: ["Claims cite evidence", "Guardrails are checked"],
        };
      } else if (system.includes("one bounded member")) {
        if (input.task_snapshot.includes("resume team") && input.role.id === "evidence-auditor" && teamMemberFailuresRemaining > 0) {
          teamMemberFailuresRemaining -= 1;
          response.writeHead(500); response.end("transient member failure"); return;
        }
        value = { schema_version: "1", proposal: `Proposal from ${input.role.id}`, evidence: ["Supplied immutable snapshot"], inferences: ["Bounded inference"], uncertainties: ["Shared model correlation"], risks: [], recommended_next_action: "Compare proposals" };
      } else if (system.includes("coordinate an Oh My Loop")) {
        value = { schema_version: "1", synthesis: "Evidence-aware synthesis", agreements: ["Use bounded evidence"], disagreements: [], evidence: ["Two immutable proposals"], uncertainties: ["Shared model correlation"], recommended_next_action: "Verify synthesis" };
      } else if (system.includes("independently verify an Oh My Loop team")) {
        value = { schema_version: "1", pass: true, reason: "Synthesis meets criteria", supported_claims: ["Bounded recommendation"], unsupported_claims: [], guardrails_checked: ["Do not worsen safety or privacy"] };
      } else {
        response.writeHead(400); response.end("unknown prompt"); return;
      }
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify(chat(value)));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  process.env.OH_MY_LOOP_BASE_URL = baseUrl;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("decision-level safety invariants override contradictory model flags", () => {
  const value = enforcePolicy(routeFixture({ decision: "assist_only", decision_owner: "agent", loop: null }));
  assert.equal(value.decision_owner, "user");
  assert.equal(value.risk.autonomy, "advisory_only");
  assert.equal(value.risk.allow_external_action, false);
});

test("starter contract includes model-authored governance", () => {
  const route = enforcePolicy(routeFixture());
  const contract = starterContract("task", route);
  assert.deepEqual(contract.harm_guardrails, route.governance.harm_guardrails);
  assert.ok(contract.allowed_actions.length);
  assert.ok(contract.forbidden_actions.length);
  assert.match(contract.confirmation_boundary, /Confirm/);
  assert.equal(contract.budgets.time_budget_minutes, 30);
});

test("remote HTTP endpoints are rejected before sending API keys", async () => {
  process.env.OH_MY_LOOP_API_KEY = "not-a-real-key";
  await assert.rejects(() => callModelJSON("prompt", { task: "x" }, { model: "mock", baseUrl: "http://example.com/v1" }), /must use HTTPS/);
  delete process.env.OH_MY_LOOP_API_KEY;
});

test("persistent run advances only from fresh observation and independent verification", async () => {
  const run = await startRun("bounded runtime test", { baseUrl });
  assert.equal(run.status, "awaiting_observation");
  assert.ok(run.pending_action.expected_evidence.length);
  const completed = await observeRun(run.id, "The local probe produced the expected result without side effects", "tool", { baseUrl });
  assert.equal(completed.status, "completed");
  assert.ok(completed.events.some((event) => event.type === "verification"));
  for (let index = 1; index < completed.events.length; index += 1) {
    assert.equal(completed.events[index].previous_hash, completed.events[index - 1].hash);
  }
  assert.equal(loadRun(run.id).status, "completed");
});

test("estimated token budget stops a run before another model step", async () => {
  const run = await startRun("tiny token budget scenario", { baseUrl });
  assert.equal(run.status, "budget_exhausted");
  assert.match(run.events.at(-1).summary, /token budget/i);
});

test("direct-answer routing does not invent a loop", async () => {
  const run = await startRun("direct answer scenario", { baseUrl });
  assert.equal(run.status, "not_applicable");
  assert.equal(run.events.some((event) => event.type === "proposal"), false);
});

test("one-action budget still permits final evidence verification", async () => {
  const run = await startRun("do once scenario", { baseUrl });
  assert.equal(run.contract.budgets.max_iterations, 1);
  const completed = await observeRun(run.id, "The one action produced its expected bounded result", "tool", { baseUrl });
  assert.equal(completed.status, "completed");
  assert.equal(completed.iteration, 1);
});

test("needs_input can accept user context and continue", async () => {
  const run = await startRun("needs input scenario", { baseUrl });
  assert.equal(run.status, "awaiting_input");
  const continued = await provideInputRun(run.id, "Prefer the reversible option with no external effect", { baseUrl });
  assert.equal(continued.status, "awaiting_observation");
  assert.ok(continued.events.some((event) => event.type === "user_input"));
});

test("semantic pre-action gate blocks a contract violation", async () => {
  const run = await startRun("forbidden action scenario", { baseUrl });
  assert.equal(run.status, "blocked");
  assert.ok(run.events.some((event) => event.type === "policy_block"));
  assert.equal(run.pending_action, null);
});

test("two semantic no-progress assessments stop a loop", async () => {
  const run = await startRun("no progress scenario", { baseUrl });
  const once = await observeRun(run.id, "The probe returned the same inconclusive state", "tool", { baseUrl });
  assert.equal(once.status, "awaiting_observation");
  assert.equal(once.stagnant_iterations, 1);
  const stopped = await observeRun(run.id, "A second independent probe remained inconclusive", "tool", { baseUrl });
  assert.equal(stopped.status, "blocked");
  assert.equal(stopped.stagnant_iterations, 2);
  assert.match(stopped.events.at(-1).summary, /No-progress/);
});

test("external team-affecting action requires exact confirmation", async () => {
  const run = await startRun("confirmation scenario", { baseUrl });
  assert.equal(run.status, "awaiting_confirmation");
  assert.throws(() => confirmRun(run.id, "a different action"), /exactly match/);
  assert.match(run.pending_action.confirmation_text, /scope:.*data:.*cost:/);
  const confirmed = confirmRun(run.id, run.pending_action.confirmation_text);
  assert.equal(confirmed.status, "awaiting_observation");
  assert.equal(confirmed.pending_action.confirmed, true);
});

test("run cancellation is persistent and terminal", async () => {
  const run = await startRun("cancel scenario", { baseUrl });
  const cancelled = cancelRun(run.id, "User changed the goal");
  assert.equal(cancelled.status, "cancelled");
  await assert.rejects(() => observeRun(run.id, "late evidence", "user", { baseUrl }), /terminal/);
});

test("concurrent mutation is rejected instead of overwriting the ledger", async () => {
  const run = await startRun("lock scenario", { baseUrl });
  const release = acquireRunLock(run.id);
  try {
    assert.throws(() => cancelRun(run.id, "concurrent cancel"), /already being modified/);
  } finally {
    release();
  }
  assert.equal(cancelRun(run.id, "serialized cancel").status, "cancelled");
});

test("agent team runs roles in bounded parallel and verifies synthesis", async () => {
  const run = await runTeam("team analysis scenario", { baseUrl });
  assert.equal(run.status, "completed");
  assert.equal(run.result.members.length, 2);
  assert.match(run.team.independence_notice, /share the same model/);
  assert.ok(run.events.filter((event) => event.type === "team_proposal").length === 2);
  assert.equal(run.result.verification.pass, true);
});

test("interrupted Agent Team resumes only missing roles", async () => {
  teamMemberFailuresRemaining = 2;
  await assert.rejects(() => runTeam("resume team scenario", { baseUrl }), /500/);
  const interrupted = listRuns().find((run) => run.task === "resume team scenario");
  assert.equal(interrupted.status, "interrupted");
  const resumed = await resumeTeam(interrupted.id, { baseUrl });
  assert.equal(resumed.status, "completed");
  assert.equal(resumed.events.filter((event) => event.type === "team_proposal").length, 2);
});

test("memory is quarantined, consent-gated, reviewable, and forgettable", () => {
  assert.throws(() => addMemory("private preference", "personal", false), /requires --consent/);
  const entry = addMemory("private preference", "personal", true);
  assert.equal(entry.status, "quarantined");
  assert.equal(statSync(join(process.env.OH_MY_LOOP_HOME, "memory.json")).mode & 0o777, 0o600);
  const active = approveMemory(entry.id, true);
  assert.equal(active.status, "active");
  assert.throws(() => updateMemory(entry.id, "corrected preference", false), /requires --consent/);
  const corrected = updateMemory(entry.id, "corrected preference", true);
  assert.equal(corrected.status, "quarantined");
  assert.equal(corrected.content, "corrected preference");
  forgetMemory(entry.id);
  assert.equal(listMemory().some((item) => item.id === entry.id), false);
});
