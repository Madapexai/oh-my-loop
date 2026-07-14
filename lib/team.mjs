import { callConfiguredModel, callModelJSON, starterContract } from "./model-router.mjs";
import { acquireRunLock, appendEvent, indexRun, loadRun, newRunId, saveRun } from "./storage.mjs";

const TERMINAL = new Set(["completed", "blocked", "escalated", "cancelled", "budget_exhausted", "timed_out", "failed"]);

const TEAM_PLAN_PROMPT = `You are the Agent Team planner for Oh My Loop.
Use semantic reasoning to decide the smallest set of genuinely useful roles. Do not use keyword or task-length rules.
Roles are dynamic, not a fixed Planner/Executor/Verifier template. Spawn multiple roles only when independent evidence or perspectives materially reduce error.
All roles are advisory and may not take external actions. Return JSON only:
{
  "schema_version":"1",
  "team_name":"...",
  "reason":"why multiple roles are justified",
  "max_parallel":2,
  "roles":[{"id":"role-id","purpose":"...","deliverable":"...","evidence_needed":["..."]}],
  "coordination":"how immutable proposals will be combined",
  "verification_criteria":["..."]
}`;

const TEAM_MEMBER_PROMPT = `You are one bounded member of an Oh My Loop Agent Team.
Work only on the assigned role and immutable task snapshot. Do not coordinate secretly, take external actions, or claim evidence you did not observe.
Separate evidence, inference, uncertainty, and recommendation. Return JSON only:
{"schema_version":"1","proposal":"...","evidence":["..."],"inferences":["..."],"uncertainties":["..."],"risks":["..."],"recommended_next_action":"..."}.`;

const COORDINATOR_PROMPT = `You coordinate an Oh My Loop Agent Team.
Merge immutable role proposals without erasing disagreement. Do not treat role count as corroboration when roles share a model or evidence.
Do not take external action. Return JSON only:
{"schema_version":"1","synthesis":"...","agreements":["..."],"disagreements":["..."],"evidence":["..."],"uncertainties":["..."],"recommended_next_action":"..."}.`;

const TEAM_VERIFIER_PROMPT = `You independently verify an Oh My Loop team synthesis.
Check it against the contract, role proposals, disagreements, and verification criteria. Shared-model agreement is not independent evidence.
guardrails_checked must copy every checked harm guardrail exactly from the contract.
Return JSON only: {"schema_version":"1","pass":false,"reason":"...","supported_claims":["..."],"unsupported_claims":["..."],"guardrails_checked":["..."]}.`;

function text(value, name, max = 6000) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new Error(`Invalid ${name}`);
  return value.trim();
}

function strings(value, name) {
  if (!Array.isArray(value) || value.length > 32 || value.some((item) => typeof item !== "string")) throw new Error(`Invalid ${name}`);
  return value.map((item) => text(item, `${name} item`, 2000));
}

function validatePlan(value) {
  if (!value || typeof value !== "object" || value.schema_version !== "1") throw new Error("Invalid team plan schema");
  if (!Array.isArray(value.roles) || value.roles.length < 2 || value.roles.length > 6) throw new Error("Agent Team requires 2-6 roles");
  if (!Number.isInteger(value.max_parallel) || value.max_parallel < 1 || value.max_parallel > 4) throw new Error("Invalid team max_parallel");
  const ids = new Set();
  const roles = value.roles.map((role) => {
    const id = text(role.id, "role.id", 64);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || ids.has(id)) throw new Error("Role ids must be unique lowercase slugs");
    ids.add(id);
    return {
      id,
      purpose: text(role.purpose, "role.purpose"),
      deliverable: text(role.deliverable, "role.deliverable"),
      evidence_needed: strings(role.evidence_needed, "role.evidence_needed"),
    };
  });
  return {
    team_name: text(value.team_name, "team_name", 120),
    reason: text(value.reason, "team.reason"),
    max_parallel: value.max_parallel,
    roles,
    coordination: text(value.coordination, "team.coordination"),
    verification_criteria: strings(value.verification_criteria, "verification_criteria"),
  };
}

function validateMember(value) {
  if (!value || typeof value !== "object" || value.schema_version !== "1") throw new Error("Invalid team member output");
  return {
    proposal: text(value.proposal, "member.proposal"),
    evidence: strings(value.evidence ?? [], "member.evidence"),
    inferences: strings(value.inferences ?? [], "member.inferences"),
    uncertainties: strings(value.uncertainties ?? [], "member.uncertainties"),
    risks: strings(value.risks ?? [], "member.risks"),
    recommended_next_action: text(value.recommended_next_action, "member.recommended_next_action"),
  };
}

function validateSynthesis(value) {
  if (!value || typeof value !== "object" || value.schema_version !== "1") throw new Error("Invalid team synthesis");
  return {
    synthesis: text(value.synthesis, "synthesis"),
    agreements: strings(value.agreements ?? [], "agreements"),
    disagreements: strings(value.disagreements ?? [], "disagreements"),
    evidence: strings(value.evidence ?? [], "synthesis.evidence"),
    uncertainties: strings(value.uncertainties ?? [], "synthesis.uncertainties"),
    recommended_next_action: text(value.recommended_next_action, "synthesis.recommended_next_action"),
  };
}

function validateVerification(value, contract) {
  if (!value || typeof value !== "object" || value.schema_version !== "1" || typeof value.pass !== "boolean") throw new Error("Invalid team verification");
  const guardrails = strings(value.guardrails_checked ?? [], "guardrails_checked");
  const checked = new Set(guardrails);
  return {
    pass: value.pass && contract.harm_guardrails.every((guardrail) => checked.has(guardrail)),
    reason: text(value.reason, "verification.reason"),
    supported_claims: strings(value.supported_claims ?? [], "supported_claims"),
    unsupported_claims: strings(value.unsupported_claims ?? [], "unsupported_claims"),
    guardrails_checked: guardrails,
  };
}

async function pool(items, concurrency, worker) {
  const results = new Array(items.length);
  const errors = [];
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        errors.push(error);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  if (errors.length) throw errors[0];
  return results;
}

function persist(run) {
  saveRun(run);
  indexRun(run);
  return run;
}

async function withTeamLock(id, worker) {
  const release = acquireRunLock(id);
  try {
    return await worker();
  } finally {
    release();
  }
}

function addTokenEstimate(run, value) {
  run.tokens_used_estimate = (run.tokens_used_estimate ?? 0) + Math.ceil(JSON.stringify(value).length / 4);
  const elapsedMinutes = (Date.now() - Date.parse(run.created_at)) / 60000;
  if (run.tokens_used_estimate > run.contract.budgets.token_budget || elapsedMinutes >= run.contract.budgets.time_budget_minutes) {
    const error = new Error("Agent Team time or estimated token budget exhausted");
    error.code = "BUDGET_EXHAUSTED";
    throw error;
  }
}

async function executeTeam(run, options = {}) {
  try {
    let plan = run.team;
    if (!plan) {
      const rawPlan = await callModelJSON(TEAM_PLAN_PROMPT, { task: run.task, contract: run.contract, route: run.route }, options);
      addTokenEstimate(run, rawPlan);
      plan = validatePlan(rawPlan);
      run.team = {
        ...plan,
        independence_notice: "Roles use separate prompts but may share the same model, provider, and evidence; agreement is correlated.",
      };
      appendEvent(run, { type: "team_plan", actor: "team_planner_model", summary: plan.reason, evidence: [run.events[0].hash], plan });
      run.status = "running";
      persist(run);
    }

    const completed = new Map(run.events
      .filter((event) => event.type === "team_proposal" && event.output && event.role)
      .map((event) => [event.role.id, { role: event.role, output: event.output }]));
    const missing = plan.roles.filter((role) => !completed.has(role.id));
    const freshMembers = await pool(missing, plan.max_parallel, async (role) => {
      const raw = await callModelJSON(TEAM_MEMBER_PROMPT, {
        task_snapshot: run.task,
        contract: run.contract,
        role,
        team_reason: plan.reason,
      }, options);
      addTokenEstimate(run, raw);
      const output = validateMember(raw);
      appendEvent(run, {
        type: "team_proposal",
        actor: role.id,
        summary: output.proposal,
        evidence: [run.events.find((event) => event.type === "team_plan").hash],
        role,
        output,
      });
      persist(run);
      return { role, output };
    });
    for (const member of freshMembers) completed.set(member.role.id, member);
    const members = plan.roles.map((role) => completed.get(role.id));
    persist(run);

    let synthesisEvent = run.events.find((event) => event.type === "team_synthesis");
    let synthesis = synthesisEvent?.synthesis;
    if (!synthesis) {
      const rawSynthesis = await callModelJSON(COORDINATOR_PROMPT, {
        task: run.task,
        contract: run.contract,
        plan,
        immutable_proposals: members,
      }, options);
      addTokenEstimate(run, rawSynthesis);
      synthesis = validateSynthesis(rawSynthesis);
      synthesisEvent = appendEvent(run, {
        type: "team_synthesis",
        actor: "coordinator_model",
        summary: synthesis.synthesis,
        evidence: run.events.filter((event) => event.type === "team_proposal").map((event) => event.hash),
        synthesis,
      });
      persist(run);
    }

    const rawVerification = await callModelJSON(TEAM_VERIFIER_PROMPT, {
      task: run.task,
      contract: run.contract,
      verification_criteria: plan.verification_criteria,
      proposals: members,
      synthesis,
    }, options);
    addTokenEstimate(run, rawVerification);
    const verification = validateVerification(rawVerification, run.contract);
    appendEvent(run, {
      type: "team_verification",
      actor: "verifier_model",
      summary: verification.reason,
      evidence: [synthesisEvent.hash],
      verification,
    });
    run.status = verification.pass ? "completed" : "blocked";
    run.result = { plan: run.team, members, synthesis, verification };
    return persist(run);
  } catch (error) {
    run.status = error.code === "BUDGET_EXHAUSTED" ? "budget_exhausted" : "interrupted";
    appendEvent(run, { type: error.code === "BUDGET_EXHAUSTED" ? "terminal" : "interruption", actor: "runtime", summary: text(error.message, "interruption"), evidence: [] });
    persist(run);
    throw error;
  }
}

export async function runTeam(task, options = {}) {
  const route = await callConfiguredModel(task, options);
  const contract = starterContract(task, route);
  const now = new Date().toISOString();
  const run = {
    schema_version: "1",
    id: newRunId(),
    kind: "team",
    task,
    route,
    contract,
    status: "planning",
    iteration: 0,
    tokens_used_estimate: Math.ceil(JSON.stringify(route).length / 4),
    pending_action: null,
    created_at: now,
    updated_at: now,
    events: [],
    team: null,
    result: null,
  };
  appendEvent(run, { type: "route", actor: "router_model", summary: route.reason, evidence: [], route_basis: route.risk.reasons });
  if (route.decision === "escalate") {
    run.status = "escalated";
    appendEvent(run, { type: "terminal", actor: "policy", summary: "Critical or escalated route cannot spawn a team", evidence: [run.events[0].hash] });
    return persist(run);
  }

  persist(run);
  return withTeamLock(run.id, () => executeTeam(run, options));
}

export async function resumeTeam(id, options = {}) {
  return withTeamLock(id, async () => {
    const run = loadRun(id);
    if (run.kind !== "team") throw new Error("Run is not an Agent Team");
    if (TERMINAL.has(run.status)) return run;
    return executeTeam(run, options);
  });
}
