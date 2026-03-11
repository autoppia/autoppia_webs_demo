"""Pytest configuration: add webs_server/src to Python path for imports."""

import sys
from pathlib import Path

# Allow tests to import from src (e.g. data_handler, server)
_root = Path(__file__).resolve().parent.parent
_src = _root / "src"
if str(_src) not in sys.path:
    sys.path.insert(0, str(_src))
