# Optional Python reference implementation

This package demonstrates the full contract kernel and governed memory for contributors. End users should use the zero-dependency `oh-my-loop` Node CLI at the repository root; Python is not required.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
python -m unittest -v test_oh_my_loop.py
```

The runtime is intentionally provider-neutral: callers supply decision and
execution callbacks. The kernel owns risk, confirmation, gates, budgets,
stagnation, cancellation, and structured termination.

```python
from oh_my_loop import route, contract_for

def classify_with_your_model(task, protocol):
    # Send protocol + task to your model and return its schema_version 2 object.
    return model_client.classify(protocol=protocol, task=task)

routed = route("your task", classify_fn=classify_with_your_model)
contract = contract_for("your task", routed)
```

Main modules:

- `router`: model classifier callback, schema validation, and deterministic safety gates
- `models`: contracts, risk, action, evidence, and terminal status
- `kernel` and `gates`: bounded execution with confirmation and fresh evidence
- `patterns`: five agent behaviors plus decision, habit, and life review
- `memory`: default-enabled capability with consent-gated, quarantined, expiring personal entries

The router has no rule-based semantic fallback: a missing classifier, classifier failure, or invalid structured result fails closed. The JSON store is not encrypted and must not hold secrets or highly sensitive records. This package is alpha and is not an emergency, medical, legal, mental-health, or financial service.
