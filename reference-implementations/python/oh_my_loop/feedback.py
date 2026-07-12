"""Optional feedback store - persists loop outcomes across sessions.

This is OPTIONAL. Skills are stateless by default; this module provides
a simple JSON store for users who want feedback accumulation.
"""
import json
import os
from datetime import datetime
from typing import Optional


class FeedbackStore:
    """Simple JSON file store for loop outcomes. Optional component."""

    def __init__(self, path: str = "feedback.json"):
        self.path = path

    def record(self, task: str, pattern: str, success: bool, cost_tokens: int, failure_mode: Optional[str] = None):
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "task": task,
            "pattern": pattern,
            "success": success,
            "cost_tokens": cost_tokens,
            "failure_mode": failure_mode,
        }
        history = self._read()
        history.append(entry)
        self._write(history)

    def get_recent(self, n: int = 20) -> list:
        return self._read()[-n:]

    def get_failure_rate(self, pattern: Optional[str] = None) -> float:
        history = self._read()
        if pattern:
            history = [h for h in history if h["pattern"] == pattern]
        if not history:
            return 0.0
        failures = sum(1 for h in history if not h["success"])
        return failures / len(history)

    def _read(self) -> list:
        if not os.path.exists(self.path):
            return []
        with open(self.path) as f:
            return json.load(f)

    def _write(self, data: list):
        with open(self.path, "w") as f:
            json.dump(data, f, indent=2)
