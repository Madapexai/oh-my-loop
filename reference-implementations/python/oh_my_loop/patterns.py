"""Loop patterns - executable skeletons for each pattern.

Each pattern is a class with a run() method. They use LoopConfig for limits.
These are skeletons - you provide the actual LLM calls and tools.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Callable, Any, Optional
from .config import LoopConfig


@dataclass
class LoopResult:
    success: bool
    output: Any = None
    attempts: int = 0
    iterations: int = 0
    cost_tokens: int = 0
    failure_reason: Optional[str] = None
    history: list = field(default_factory=list)


class Pattern(ABC):
    """Base class for all loop patterns."""

    name: str = "base"

    def __init__(self, config: LoopConfig = None):
        self.config = config or LoopConfig()

    @abstractmethod
    def run(self, task: str, **kwargs) -> LoopResult:
        ...


class ReactPattern(Pattern):
    """Reason + Act. For tasks with unknown steps."""

    name = "react"

    def run(self, task: str, think_fn: Callable, act_fn: Callable, **kwargs) -> LoopResult:
        history = []
        for i in range(self.config.react_max_iterations):
            thought = think_fn(task, history)
            action_result = act_fn(thought, history)
            history.append({"thought": thought, "action_result": action_result, "iteration": i + 1})

            if "i have the answer" in thought.lower() or "done" in thought.lower():
                return LoopResult(
                    success=True,
                    output=thought,
                    iterations=i + 1,
                    history=history,
                )

        return LoopResult(
            success=False,
            output=history[-1]["thought"] if history else None,
            iterations=self.config.react_max_iterations,
            failure_reason=f"max iterations ({self.config.react_max_iterations}) reached without answer",
            history=history,
        )


class ReflexionPattern(Pattern):
    """Try, reflect on failure, retry. For tasks likely to fail first try."""

    name = "reflexion"

    def run(self, task: str, attempt_fn: Callable, verify_fn: Callable, reflect_fn: Callable, **kwargs) -> LoopResult:
        history = []
        best_output = None

        for attempt in range(self.config.reflexion_max_attempts):
            output = attempt_fn(task, history)
            verification = verify_fn(output)

            history.append({
                "attempt": attempt + 1,
                "output": output,
                "verification": verification,
            })

            if verification.get("pass", False):
                return LoopResult(
                    success=True,
                    output=output,
                    attempts=attempt + 1,
                    history=history,
                )

            best_output = output if best_output is None else best_output
            reflection = reflect_fn(task, output, verification, history)
            history[-1]["reflection"] = reflection

        return LoopResult(
            success=False,
            output=best_output,
            attempts=self.config.reflexion_max_attempts,
            failure_reason=f"max attempts ({self.config.reflexion_max_attempts}) reached, verifier still failing",
            history=history,
        )


class PlanExecutePattern(Pattern):
    """Plan first, then execute. For tasks with known steps."""

    name = "plan_execute"

    def run(self, task: str, plan_fn: Callable, execute_fn: Callable, verify_fn: Callable, **kwargs) -> LoopResult:
        history = []
        for replan in range(self.config.plan_execute_max_replans + 1):
            plan = plan_fn(task, history)
            history.append({"plan": plan, "replan": replan})

            subtask_results = []
            all_passed = True
            for subtask in plan:
                result = execute_fn(subtask)
                verification = verify_fn(subtask, result)
                subtask_results.append({"subtask": subtask, "result": result, "verification": verification})
                if not verification.get("pass", False):
                    all_passed = False
                    break

            history[-1]["subtask_results"] = subtask_results

            if all_passed:
                return LoopResult(
                    success=True,
                    output=subtask_results,
                    iterations=replan + 1,
                    history=history,
                )

        return LoopResult(
            success=False,
            output=subtask_results,
            iterations=self.config.plan_execute_max_replans + 1,
            failure_reason=f"max re-plans ({self.config.plan_execute_max_replans}) reached",
            history=history,
        )


class SelfRefinePattern(Pattern):
    """Generate, critique, refine. For polishing output."""

    name = "self_refine"

    def run(self, task: str, generate_fn: Callable, critique_fn: Callable, **kwargs) -> LoopResult:
        history = []
        output = generate_fn(task)

        for round_num in range(self.config.self_refine_max_rounds):
            critique = critique_fn(task, output)
            history.append({"round": round_num + 1, "output": output, "critique": critique})

            if "good enough" in critique.lower() or "no more improvements" in critique.lower():
                return LoopResult(
                    success=True,
                    output=output,
                    iterations=round_num + 1,
                    history=history,
                )

            output = generate_fn(task, critique=critique, previous=output)

        history.append({"round": self.config.self_refine_max_rounds, "output": output, "critique": "max rounds reached"})
        return LoopResult(
            success=True,
            output=output,
            iterations=self.config.self_refine_max_rounds,
            failure_reason="max rounds reached, returning best version",
            history=history,
        )


class MultiAgentPattern(Pattern):
    """Spawn specialized agents. For tasks needing multiple perspectives."""

    name = "multi_agent"

    def run(
        self,
        task: str,
        planner_fn: Callable,
        executor_fn: Callable,
        verifier_fn: Callable,
        reflector_fn: Callable,
        **kwargs,
    ) -> LoopResult:
        history = []
        shared_state = {}  # agents communicate via shared state

        for round_num in range(self.config.multi_agent_max_rounds):
            plan = planner_fn(task, shared_state, history)
            shared_state["plan"] = plan

            execution_results = executor_fn(plan, shared_state)
            shared_state["execution_results"] = execution_results

            verification = verifier_fn(execution_results, shared_state)
            shared_state["verification"] = verification

            history.append({
                "round": round_num + 1,
                "plan": plan,
                "execution": execution_results,
                "verification": verification,
            })

            if verification.get("pass", False):
                return LoopResult(
                    success=True,
                    output=execution_results,
                    iterations=round_num + 1,
                    history=history,
                )

            reflection = reflector_fn(verification, shared_state, history)
            shared_state["reflection"] = reflection
            history[-1]["reflection"] = reflection

        return LoopResult(
            success=False,
            output=execution_results,
            iterations=self.config.multi_agent_max_rounds,
            failure_reason=f"max rounds ({self.config.multi_agent_max_rounds}) reached, escalating",
            history=history,
        )
