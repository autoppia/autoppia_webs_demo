#!/usr/bin/env python3
"""
Generate data for all entities across all web projects by calling the
/datasets/generate-smart endpoint, using webs_server/initial_data as the source
of truth for available project keys and entity types.

Usage:
  python webs_server/scripts/generate_all_data.py \
      --base-url http://127.0.0.1:8090 \
      --count 5 \
      --mode append

Optional filters:
  --projects web_2_autobooks,web_5_autocrm
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from typing import Dict, List, Set, Tuple


def discover_projects_and_entities(initial_data_dir: str) -> Dict[str, Set[str]]:
    """
    Walk initial_data/*/data and infer entity types from '<entity>_N.json' files.
    Returns mapping: { project_key: {entity_type, ...}, ... }
    """
    projects: Dict[str, Set[str]] = {}

    if not os.path.isdir(initial_data_dir):
        raise FileNotFoundError(f"Initial data directory not found: {initial_data_dir}")

    for project_key in sorted(os.listdir(initial_data_dir)):
        project_dir = os.path.join(initial_data_dir, project_key)
        if not os.path.isdir(project_dir):
            continue
        data_dir = os.path.join(project_dir, "data")
        if not os.path.isdir(data_dir):
            continue

        entity_types: Set[str] = set()
        for filename in os.listdir(data_dir):
            if not filename.endswith(".json"):
                continue
            # Expect format like '<entity>_1.json' or '<entity>_20241120.json'
            name, _ext = os.path.splitext(filename)
            if "_" not in name:
                # Skip unexpected files
                continue
            entity = name.rsplit("_", 1)[0]
            if entity:
                entity_types.add(entity)

        if entity_types:
            projects[project_key] = entity_types

    sorted_projects = dict(sorted(projects.items(), key=lambda x: int(x[0].split("_")[1])))

    return sorted_projects


def post_json(url: str, payload: dict, timeout: float = 60.0) -> Tuple[int, str]:
    """
    POST JSON payload to URL and return (status_code, response_text)
    Uses only the Python standard library.
    """
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.getcode()
            body = resp.read().decode("utf-8", errors="replace")
            return status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace") if e.fp else str(e)
        return e.code, body
    except urllib.error.URLError as e:
        return 0, f"URLError: {e}"


def main(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="Generate data for all entities via /datasets/generate-smart")
    parser.add_argument(
        "--base-url",
        default=os.environ.get("WEBS_SERVER_URL", "http://127.0.0.1:8090"),
        help="Base URL of webs_server (default: http://127.0.0.1:8090, or $WEBS_SERVER_URL)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=5,
        help="Number of items to generate per entity (default: 5)",
    )
    parser.add_argument(
        "--mode",
        choices=["append", "replace"],
        default="append",
        help="Generation mode: append to existing file or create a new one (default: append)",
    )
    parser.add_argument(
        "--projects",
        default="",
        help="Optional comma-separated list of project keys to include (default: all discovered)",
    )
    parser.add_argument(
        "--initial-data-dir",
        default=os.path.join(os.path.dirname(os.path.dirname(__file__)), "initial_data"),
        help="Path to initial_data directory (default: webs_server/initial_data)",
    )
    args = parser.parse_args(argv)

    base_url = args.base_url.rstrip("/")
    initial_data_dir = os.path.abspath(args.initial_data_dir)

    print(f"🔎 Discovering projects and entities from: {initial_data_dir}")
    projects = discover_projects_and_entities(initial_data_dir)
    if not projects:
        print("⚠️  No projects/entities discovered. Nothing to do.", file=sys.stderr)
        return 1

    if args.projects:
        include = {p.strip() for p in args.projects.split(",") if p.strip()}
        projects = {k: v for k, v in projects.items() if k in include}
        if not projects:
            print("⚠️  After filtering by --projects, nothing remains.", file=sys.stderr)
            return 1

    total_requests = 0
    successes = 0
    failures = 0

    print(f"🌐 Target API: {base_url}")
    print(f"🧮 Count per entity: {args.count}")
    print(f"📝 Mode: {args.mode}")
    print("")
    PROJECT_IDS = [
        "web_1_autocinema",
        "web_2_autobooks",
        "web_3_autozone",
        "web_4_autodining",
        "web_5_autocrm",
        "web_6_automail",
        "web_7_autodelivery",
        "web_8_autolodge",
        "web_9_autoconnect",
        "web_10_autowork",
        "web_11_autocalendar",
        "web_12_autolist",
        "web_13_autodrive",
        "web_14_autohealth",
    ]
    filtered_projects = {}
    for project_id in PROJECT_IDS:
        if project_id in projects:
            filtered_projects[project_id] = projects[project_id]

    for project_key, entity_types in filtered_projects.items():
        print(f"── Project: {project_key}")
        for entity_type in sorted(entity_types):
            payload = {
                "project_key": project_key,
                "entity_type": entity_type,
                "count": args.count,
                "mode": args.mode,
            }
            total_requests += 1
            print(f"   → Generating {args.count} for entity '{entity_type}' ... ", end="", flush=True)
            status, body = post_json(f"{base_url}/datasets/generate-smart", payload, timeout=1000.0)

            if status == 200:
                successes += 1
                # Try to extract a brief message/saved_path
                try:
                    resp = json.loads(body)
                    message = resp.get("message") or "OK"
                    saved_path = resp.get("saved_path")
                    extra = f" (saved: {saved_path})" if saved_path else ""
                    print(f"OK 200 - {message}{extra}")
                except Exception:
                    print("OK 200")
            else:
                failures += 1
                body_preview = body[:180].replace("\n", " ").strip()
                print(f"ERR {status} - {body_preview}")
            # Short delay to avoid rate limits
            time.sleep(0.2)
        print("")

    print("════════ Summary ════════")
    print(f"Total requests: {total_requests}")
    print(f"Successes:      {successes}")
    print(f"Failures:       {failures}")

    return 0 if failures == 0 else 2


if __name__ == "__main__":
    # Example usage:
    # python webs_server/scripts/generate_all_data.py   --base-url http://127.0.0.1:8090   --count 5   --mode append --initial-data-dir=~autoppia_webs_demo/webs_server/initial_data
    raise SystemExit(main(sys.argv[1:]))
