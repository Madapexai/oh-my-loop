/** A fail-closed verify-before-claim gate. */

export interface VerificationResult {
  canClaim: boolean;
  evidence: string;
  checks: Record<string, boolean | string>;
}

export type VerifyFn = () => unknown;
export type CheckPredicate = (output: unknown) => boolean;

export function verifyBeforeClaim(claim: string, verifyFn: VerifyFn, checks: Record<string, CheckPredicate>): VerificationResult {
  const checkResults: Record<string, boolean | string> = {};
  if (Object.keys(checks).length === 0) {
    checkResults.verifier_configured = false;
    return { canClaim: false, evidence: formatEvidence(claim, undefined, checkResults), checks: checkResults };
  }

  let output: unknown;
  try {
    output = verifyFn();
  } catch (e) {
    checkResults.verifier_ran = false;
    checkResults.verifier_error = e instanceof Error ? e.message : String(e);
    return { canClaim: false, evidence: formatEvidence(claim, undefined, checkResults), checks: checkResults };
  }

  for (const [name, predicate] of Object.entries(checks)) {
    try {
      checkResults[name] = predicate(output) === true;
    } catch (e) {
      checkResults[name] = false;
      checkResults[`${name}_error`] = e instanceof Error ? e.message : String(e);
    }
  }
  const booleans = Object.entries(checkResults).filter(([k]) => !k.endsWith("_error"));
  const allPass = booleans.length > 0 && booleans.every(([, v]) => v === true);
  return { canClaim: allPass, evidence: formatEvidence(claim, output, checkResults), checks: checkResults };
}

function formatEvidence(claim: string, output: unknown, checks: Record<string, boolean | string>): string {
  const lines = [`Claim: ${claim}`, "", "Checks:"];
  for (const [name, passed] of Object.entries(checks)) {
    if (!name.endsWith("_error")) lines.push(`  ${passed === true ? "PASS" : "FAIL"} ${name}`);
  }
  lines.push("", `Output: ${String(output ?? "<no output>").slice(0, 500)}`);
  return lines.join("\n");
}
