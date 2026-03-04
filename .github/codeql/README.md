# CodeQL configuration

- **codeql-config.yml** excludes the `py/path-injection` query. Paths in `webs_server/src/data_handler.py` are validated with `_path_for_io_under_base()` (realpath + commonpath under `BASE_PATH`); CodeQL does not treat custom sanitizers as safe, so the query is disabled to avoid false positives.

- The workflow **.github/workflows/codeql.yml** runs CodeQL and uses this config.

- If you use GitHub **default setup** for code scanning (no custom workflow), either:
  - Disable default setup and rely on `.github/workflows/codeql.yml`, or
  - In the repo: **Security → Code scanning → CodeQL analysis → Edit** and add a query filter to exclude `py/path-injection`.
