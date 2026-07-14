# Governed memory

Memory capability is available by default, but active personal memory is earned through consent and review.

Lifecycle:

1. Minimize the content and classify sensitivity.
2. Ask before persisting personal or sensitive information.
3. Store as `quarantined` with source, timestamp, optional expiry, and version.
4. Activate only after review; retrieval uses active, unexpired entries.
5. Show which memory influenced a result.
6. Support correction, review, expiry, JSON listing/export, and forgetting.

The CLI implements `memory add`, `approve`, `update`, `list`, and `forget`. A correction returns the entry to quarantine and increments its version. Expired entries cannot be activated or updated.

Do not store secrets, crisis disclosures, inferred diagnoses, or judgments about another person. Corruption fails closed. Local JSON is not encrypted and is unsuitable for highly sensitive data.
