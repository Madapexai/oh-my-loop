"""Consent-based, versioned local memory with quarantine and expiry."""
from __future__ import annotations

import json
import os
import tempfile
import threading
import uuid
from contextlib import contextmanager
from dataclasses import asdict, dataclass, replace
from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path
from typing import Callable, Iterable, Optional, TypeVar

try:  # Unix lock file; the in-process lock remains available elsewhere.
    import fcntl
except ImportError:  # pragma: no cover
    fcntl = None


class MemorySensitivity(str, Enum):
    PUBLIC = "public"
    PERSONAL = "personal"
    SENSITIVE = "sensitive"


class MemoryStatus(str, Enum):
    QUARANTINED = "quarantined"
    ACTIVE = "active"
    REJECTED = "rejected"


@dataclass(frozen=True)
class MemoryEntry:
    id: str
    kind: str
    content: str
    source: str
    confidence: float
    sensitivity: MemorySensitivity
    status: MemoryStatus
    created_at: str
    expires_at: Optional[str]
    version: int = 1
    supersedes: Optional[str] = None

    @property
    def expired(self) -> bool:
        if not self.expires_at:
            return False
        value = datetime.fromisoformat(self.expires_at)
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value <= datetime.now(timezone.utc)


T = TypeVar("T")


class JSONMemoryStore:
    """Small governed store, not an encrypted secrets database.

    Personal content requires consent. New entries are quarantined unless the
    caller explicitly approves them. A persistent lock file protects atomic
    read-modify-write transactions on Unix; corruption is surfaced, not erased.
    """

    def __init__(self, path: str = "memory.json", max_entries: int = 500, *, enabled: bool = True):
        if max_entries < 1:
            raise ValueError("max_entries must be >= 1")
        self.path = Path(path)
        self.lock_path = self.path.with_name(f".{self.path.name}.lock")
        self.max_entries = max_entries
        self.enabled = enabled
        self._lock = threading.RLock()

    def add(
        self,
        *,
        kind: str,
        content: str,
        source: str,
        confidence: float = 0.5,
        sensitivity: MemorySensitivity = MemorySensitivity.PERSONAL,
        consent: bool = False,
        ttl_days: Optional[int] = 90,
        approve: bool = False,
    ) -> MemoryEntry:
        if not self.enabled:
            raise RuntimeError("memory capability is disabled")
        if not kind.strip() or not content.strip() or not source.strip():
            raise ValueError("kind, content, and source are required")
        if not 0 <= confidence <= 1:
            raise ValueError("confidence must be between 0 and 1")
        if ttl_days is not None and ttl_days < 1:
            raise ValueError("ttl_days must be >= 1 when set")
        if sensitivity != MemorySensitivity.PUBLIC and not consent:
            raise PermissionError("personal or sensitive memory requires explicit consent")
        now = datetime.now(timezone.utc)
        expires = None if ttl_days is None else (now + timedelta(days=ttl_days)).isoformat()
        entry = MemoryEntry(
            id=str(uuid.uuid4()), kind=kind, content=content, source=source,
            confidence=confidence, sensitivity=sensitivity,
            status=MemoryStatus.ACTIVE if approve else MemoryStatus.QUARANTINED,
            created_at=now.isoformat(), expires_at=expires,
        )

        def append(entries):
            entries.append(entry)
            return entries[-self.max_entries :], entry

        return self._mutate(append)

    def approve(self, entry_id: str) -> MemoryEntry:
        return self._change_status(entry_id, MemoryStatus.ACTIVE)

    def reject(self, entry_id: str) -> MemoryEntry:
        return self._change_status(entry_id, MemoryStatus.REJECTED)

    def forget(self, entry_id: str) -> bool:
        def remove(entries):
            kept = [entry for entry in entries if entry.id != entry_id]
            return kept, len(kept) != len(entries)

        return self._mutate(remove)

    def correct(self, entry_id: str, content: str, *, consent: bool) -> MemoryEntry:
        if not content.strip():
            raise ValueError("corrected content is required")

        def correction(entries):
            old = next((entry for entry in entries if entry.id == entry_id), None)
            if old is None:
                raise KeyError(entry_id)
            if old.sensitivity != MemorySensitivity.PUBLIC and not consent:
                raise PermissionError("correction of personal memory requires consent")
            corrected = replace(
                old, id=str(uuid.uuid4()), content=content, status=MemoryStatus.QUARANTINED,
                created_at=datetime.now(timezone.utc).isoformat(), version=old.version + 1,
                supersedes=old.id,
            )
            changed = [replace(entry, status=MemoryStatus.REJECTED) if entry.id == entry_id else entry for entry in entries]
            changed.append(corrected)
            return changed[-self.max_entries :], corrected

        return self._mutate(correction)

    def retrieve(self, query: str = "", *, kinds: Iterable[str] = (), limit: int = 10) -> list[MemoryEntry]:
        if not self.enabled:
            return []
        wanted = set(kinds)
        terms = {term.lower() for term in query.split() if term}
        entries = [
            entry for entry in self._read()
            if entry.status == MemoryStatus.ACTIVE and not entry.expired and (not wanted or entry.kind in wanted)
        ]
        if terms:
            entries.sort(key=lambda entry: (sum(term in entry.content.lower() for term in terms), entry.confidence, entry.created_at), reverse=True)
        else:
            entries.sort(key=lambda entry: entry.created_at, reverse=True)
        return entries[: max(0, limit)]

    def purge_expired(self) -> int:
        def purge(entries):
            kept = [entry for entry in entries if not entry.expired]
            return kept, len(entries) - len(kept)

        return self._mutate(purge)

    def _change_status(self, entry_id: str, status: MemoryStatus) -> MemoryEntry:
        def change(entries):
            updated = None
            changed = []
            for entry in entries:
                if entry.id == entry_id:
                    updated = replace(entry, status=status)
                    changed.append(updated)
                else:
                    changed.append(entry)
            if updated is None:
                raise KeyError(entry_id)
            return changed, updated

        return self._mutate(change)

    def _mutate(self, operation: Callable[[list[MemoryEntry]], tuple[list[MemoryEntry], T]]) -> T:
        with self._lock, self._file_lock(exclusive=True):
            entries = self._read_unlocked()
            changed, result = operation(entries)
            self._write_unlocked(changed)
            return result

    def _read(self) -> list[MemoryEntry]:
        with self._lock, self._file_lock(exclusive=False):
            return self._read_unlocked()

    def _read_unlocked(self) -> list[MemoryEntry]:
        if not self.path.exists():
            return []
        try:
            with self.path.open("r", encoding="utf-8") as handle:
                raw = json.load(handle)
        except json.JSONDecodeError as exc:
            raise ValueError(f"memory store is corrupted: {exc}") from exc
        if not isinstance(raw, list) or not all(isinstance(item, dict) for item in raw):
            raise ValueError("memory store is corrupted: expected a list of objects")
        try:
            return [self._decode(item) for item in raw]
        except (KeyError, TypeError, ValueError) as exc:
            raise ValueError(f"memory store contains an invalid entry: {exc}") from exc

    def _write_unlocked(self, entries: list[MemoryEntry]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp_path = tempfile.mkstemp(prefix=f".{self.path.name}.", dir=str(self.path.parent))
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump([self._encode(entry) for entry in entries], handle, ensure_ascii=False, indent=2)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(tmp_path, self.path)
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    @contextmanager
    def _file_lock(self, *, exclusive: bool):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.lock_path.open("a+", encoding="utf-8") as handle:
            try:
                os.chmod(self.lock_path, 0o600)
            except OSError:  # pragma: no cover - best effort on unusual filesystems
                pass
            if fcntl:
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX if exclusive else fcntl.LOCK_SH)
            try:
                yield
            finally:
                if fcntl:
                    fcntl.flock(handle.fileno(), fcntl.LOCK_UN)

    @staticmethod
    def _encode(entry: MemoryEntry) -> dict:
        data = asdict(entry)
        data["sensitivity"] = entry.sensitivity.value
        data["status"] = entry.status.value
        return data

    @staticmethod
    def _decode(data: dict) -> MemoryEntry:
        return MemoryEntry(**{**data, "sensitivity": MemorySensitivity(data["sensitivity"]), "status": MemoryStatus(data["status"])})
