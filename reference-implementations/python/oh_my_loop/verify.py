"""verify-before-claim gate function.

Executable version of core/components/verify-before-claim/SKILL.md.
Prevents claiming completion without fresh verification evidence.
"""
from dataclasses import dataclass
from typing import Callable, Any


@dataclass
class VerificationResult:
    can_claim: bool
    evidence: str
    checks: dict  # check_name -> bool


def verify_before_claim(
    claim: str,
    verify_fn: Callable[[], Any],
    checks: dict,  # name -> Callable[[], bool]
) -> VerificationResult:
    """Gate function: run checks, only allow claim if all pass.

    Args:
        claim: what you want to claim (e.g. "tests pass")
        verify_fn: function that runs the verification (returns output)
        checks: dict of check_name -> predicate over verify_fn output

    Returns:
        VerificationResult with can_claim + evidence + per-check results
    """
    # 1. RUN (fresh, not cached)
    output = verify_fn()

    # 2. READ + VERIFY
    check_results = {}
    for name, predicate in checks.items():
        try:
            check_results[name] = bool(predicate(output))
        except Exception as e:
            check_results[name] = False
            check_results[f"{name}_error"] = str(e)

    # 3. CLAIM only if all pass
    all_pass = all(v is True for k, v in check_results.items() if not k.endswith("_error"))

    evidence = _format_evidence(claim, output, check_results)
    return VerificationResult(can_claim=all_pass, evidence=evidence, checks=check_results)


def _format_evidence(claim: str, output: Any, checks: dict) -> str:
    lines = [f"Claim: {claim}", "", "Checks:"]
    for name, passed in checks.items():
        if name.endswith("_error"):
            continue
        emoji = "✅" if passed else "❌"
        lines.append(f"  {emoji} {name}")
    lines.append("")
    lines.append(f"Output: {str(output)[:500]}")
    return "\n".join(lines)


# Example usage:
if __name__ == "__main__":
    import subprocess

    def run_tests():
        return subprocess.run(["echo", "all tests passed"], capture_output=True, text=True)

    result = verify_before_claim(
        claim="tests pass",
        verify_fn=run_tests,
        checks={
            "exit_code_zero": lambda r: r.returncode == 0,
            "no_failures_in_output": lambda r: "fail" not in r.stdout.lower(),
        },
    )
    print(result.evidence)
    print(f"\nCan claim: {result.can_claim}")
