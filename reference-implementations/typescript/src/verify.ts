/** verify-before-claim gate function.
 * Executable version of core/components/verify-before-claim/SKILL.md. */

export interface VerificationResult {
  canClaim: boolean;
  evidence: string;
  checks: Record<string, boolean | string>;
}

export type VerifyFn = () => unknown;
export type CheckPredicate = (output: unknown) => boolean;

export function verifyBeforeClaim(
  claim: string,
  verifyFn: VerifyFn,
  checks: Record<string, CheckPredicate>,
): VerificationResult {
  // 1. RUN (fresh, not cached)
  const output = verifyFn();

  // 2. READ + VERIFY
  const checkResults: Record<string, boolean | string> = {};
  for (const [name, predicate] of Object.entries(checks)) {
    try {
      checkResults[name] = Boolean(predicate(output));
    } catch (e) {
      checkResults[name] = false;
      checkResults[`${name}_error`] = e instanceof Error ? e.message : String(e);
    }
  }

  // 3. CLAIM only if all pass
  const allPass = Object.entries(checkResults)
    .filter(([k]) => !k.endsWith("_error"))
    .every(([, v]) => v === true);

  const evidence = formatEvidence(claim, output, checkResults);
  return { canClaim: allPass, evidence, checks: checkResults };
}

function formatEvidence(claim: string, output: unknown, checks: Record<string, boolean | string>): string {
  const lines = [`Claim: ${claim}`, "", "Checks:"];
  for (const [name, passed] of Object.entries(checks)) {
    if (name.endsWith("_error")) continue;
    lines.push(`  ${passed === true ? "✅" : "❌"} ${name}`);
  }
  lines.push("");
  lines.push(`Output: ${String(output).slice(0, 500)}`);
  return lines.join("\n");
}
