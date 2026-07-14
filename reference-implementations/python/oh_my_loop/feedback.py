"""Optional feedback store - persists loop outcomes across sessions.

This is OPTIONAL. Skills are stateless by default; this module provides
a simple JSON store for users who want feedback accumulation.
"""
import json
import os
import tempfile
import threading
from datetime import datetime, timezone
from typing import Optional


class FeedbackStore:
    """Simple JSON file store for loop outcomes. Optional component."""

    def __init__(self, path: str = "feedback.json", *, consent: bool = False, max_entries: int = 500):
        if max_entries < 1:
            raise ValueError("max_entries must be >= 1")
        self.path = path
        self.consent = consent
        self.max_entries = max_entries
        self._lock = threading.RLock()

    def record(self, task: str, pattern: str, success: bool, cost_tokens: int, failure_mode: Optional[str] = None):
        if not self.consent:
            raise PermissionError("feedback persistence requires explicit consent")
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "task": task,
            "pattern": pattern,
            "success": success,
            "cost_tokens": cost_tokens,
            "failure_mode": failure_mode,
        }
        history = self._read()
        history.append(entry)
        self._write(history[-self.max_entries :])

    def get_recent(self, n: int = 20) -> list:
        if n <= 0:
            return []
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
        with self._lock:
            if not os.path.exists(self.path):
                return []
            with open(self.path, encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except json.JSONDecodeError as exc:
                    raise ValueError(f"feedback store is corrupted: {exc}") from exc
            if not isinstance(data, list):
                raise ValueError("feedback store must contain a JSON list")
            return data

    def _write(self, data: list):
        with self._lock:
            directory = os.path.dirname(os.path.abspath(self.path))
            os.makedirs(directory, exist_ok=True)
            fd, tmp_path = tempfile.mkstemp(prefix=".feedback.", dir=directory)
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                    f.flush()
                    os.fsync(f.fileno())
                os.replace(tmp_path, self.path)
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
