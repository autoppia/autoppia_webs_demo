# CodeQL configuration

This repo uses GitHub **default setup** for code scanning. Advanced (custom) CodeQL workflows cannot upload results when default setup is enabled, so no custom workflow is committed.

- **codeql-config.yml** is for reference only: it shows how to exclude the `py/path-injection` query. Paths in `webs_server/src/data_handler.py` are validated with `_path_for_io_under_base()` (realpath + commonpath under `BASE_PATH`); CodeQL does not treat custom sanitizers as safe, so that query raises false positives.

- **To stop path-injection alerts:** In the repo go to **Security → Code scanning → CodeQL analysis → Edit** (or “View CodeQL configuration”) and add a **query filter** to exclude the query with id: `py/path-injection`.

- If you later switch to **advanced setup** (disable default setup), you can add a workflow that runs CodeQL with `config-file: ./.github/codeql/codeql-config.yml`.
