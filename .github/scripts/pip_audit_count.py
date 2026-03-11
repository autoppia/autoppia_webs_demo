#!/usr/bin/env python3
"""
Count vulnerabilities from pip-audit JSON for direct dependencies only.
Reads requirements.txt (direct deps) and reports/pip-audit.json; prints total
vuln count for packages that appear in requirements.txt (PEP 503 normalized).
"""

import json
import re
import sys
from pathlib import Path


def _normalize_name(name: str) -> str:
    """PEP 503: lowercase, replace _ with -."""
    return name.lower().replace("_", "-")


def _parse_requirements(path: Path) -> set[str]:
    """Extract direct package names from requirements.txt (before ==, >=, etc.)."""
    direct = set()
    if not path.exists():
        return direct
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip().split("#")[0].strip()
        if not line or line.startswith("-"):
            continue
        # Name before version specifier (==, >=, <=, <, >, ~=)
        match = re.match(r"^([a-zA-Z0-9][a-zA-Z0-9_.-]*)", line)
        if match:
            direct.add(_normalize_name(match.group(1)))
    return direct


def _count_from_dependencies_format(data: dict, direct: set[str]) -> int:
    """Format: {"dependencies": [{"name": "pkg", "version": "x.y", "vulns": [...]}, ...]}."""
    total = 0
    for dep in data.get("dependencies", []):
        name = dep.get("name")
        if not name or _normalize_name(name) not in direct:
            continue
        vulns = dep.get("vulns", [])
        total += len(vulns)
    return total


def _count_from_mapping_format(data: dict, direct: set[str]) -> int:
    """Format: {"pkg==1.0": [vuln, ...], ...}."""
    total = 0
    for spec, vulns in data.items():
        if not isinstance(vulns, list):
            continue
        match = re.match(r"^([a-zA-Z0-9][a-zA-Z0-9_.-]*)", str(spec).strip())
        name = match.group(1) if match else ""
        if name and _normalize_name(name) in direct:
            total += len(vulns)
    return total


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent.parent
    req_path = repo_root / "webs_server" / "requirements.txt"
    audit_path = repo_root / "reports" / "pip-audit.json"

    if len(sys.argv) >= 2:
        req_path = Path(sys.argv[1])
    if len(sys.argv) >= 3:
        audit_path = Path(sys.argv[2])

    direct = _parse_requirements(req_path)
    if not audit_path.exists():
        print(0)
        return

    try:
        raw = audit_path.read_text(encoding="utf-8", errors="replace")
        data = json.loads(raw)
    except (json.JSONDecodeError, OSError):
        print(0)
        return

    if isinstance(data, list):
        print(0)
        return

    total = _count_from_dependencies_format(data, direct)
    if total == 0:
        total = _count_from_mapping_format(data, direct)

    print(total)


if __name__ == "__main__":
    main()
