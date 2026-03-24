import fs from "node:fs";
import path from "node:path";

const DEFAULT_APPS = [
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
  "webs_server",
];

function pct(covered, total) {
  if (!total) return null;
  return (covered / total) * 100;
}

function formatPct(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "n/a";
  return `${v.toFixed(2)}%`;
}

function shouldColorize() {
  if (process.env.FORCE_COLOR === "1") return true;
  if (process.env.NO_COLOR) return false;
  // If not a TTY, keep output plain for clean logs.
  return Boolean(process.stdout.isTTY);
}

const COLOR = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

const METRIC_THRESHOLDS = {
  statements: 90,
  lines: 90,
  functions: 90,
  branches: 60,
};

function parseBoolArg(name, defaultValue) {
  const v = argValue(name);
  if (v === null) return defaultValue;
  return v === "1" || v === "true";
}

function formatPctWithColor(metricName, v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "n/a";
  const plain = formatPct(v);
  if (!shouldColorize()) return plain;
  const threshold = METRIC_THRESHOLDS[metricName] ?? 0;
  const good = v >= threshold;
  const color = good ? COLOR.green : COLOR.red;
  return `${color}${plain}${COLOR.reset}`;
}

function aggregateFromJestCoverageFinal(coverageFinalJson) {
  let statementsCovered = 0;
  let statementsTotal = 0;
  let linesCovered = 0;
  let linesTotal = 0;
  let functionsCovered = 0;
  let functionsTotal = 0;
  let branchesCovered = 0;
  let branchesTotal = 0;

  for (const file of Object.values(coverageFinalJson)) {
    if (!file || typeof file !== "object") continue;

    // Statements
    const statementMap = file.statementMap ?? {};
    const s = file.s ?? {};
    statementsTotal += Object.keys(statementMap).length;
    statementsCovered += Object.values(s).filter((c) => (c ?? 0) > 0).length;

    // Lines
    const lineMap = file.lineMap ?? {};
    const l = file.l ?? {};
    if (Object.keys(lineMap).length > 0) {
      linesTotal += Object.keys(lineMap).length;
      linesCovered += Object.values(l).filter((c) => (c ?? 0) > 0).length;
    }

    // Functions
    const fnMap = file.fnMap ?? {};
    const f = file.f ?? {};
    functionsTotal += Object.keys(fnMap).length;
    functionsCovered += Object.values(f).filter((c) => (c ?? 0) > 0).length;

    // Branches
    const branchMap = file.branchMap ?? {};
    const b = file.b ?? {};
    for (const branchId of Object.keys(branchMap)) {
      const bArr = b[branchId] ?? [];
      const totalForBranch = bArr.length || branchMap?.[branchId]?.locations?.length || 0;
      branchesTotal += totalForBranch;
      branchesCovered += bArr.filter((c) => (c ?? 0) > 0).length;
    }
  }

  // Some Jest v30/v8 coverage outputs include only statementMap/s (no lineMap/l).
  // In those cases, "lines" in Jest reports matches "statements" for global reporting,
  // so we mirror that to keep a consistent monorepo summary.
  if (linesTotal === 0 && statementsTotal > 0) {
    linesTotal = statementsTotal;
    linesCovered = statementsCovered;
  }

  return {
    statements: { covered: statementsCovered, total: statementsTotal },
    lines: { covered: linesCovered, total: linesTotal },
    functions: { covered: functionsCovered, total: functionsTotal },
    branches: { covered: branchesCovered, total: branchesTotal },
  };
}

function parseCoveragePyXml(coverageXmlText) {
  // coverage.py XML root element includes aggregate fields like:
  // lines-covered, lines-valid, branches-covered, branches-valid, line-rate, branch-rate.
  const reInt = (name) => new RegExp(`${name}="(\\d+)"`, "m");

  const linesCovered = Number((coverageXmlText.match(reInt("lines-covered"))?.[1] ?? "").trim());
  const linesValid = Number((coverageXmlText.match(reInt("lines-valid"))?.[1] ?? "").trim());
  const branchesCovered = Number((coverageXmlText.match(reInt("branches-covered"))?.[1] ?? "").trim());
  const branchesValid = Number((coverageXmlText.match(reInt("branches-valid"))?.[1] ?? "").trim());

  const hasLines = Number.isFinite(linesCovered) && Number.isFinite(linesValid) && linesValid > 0;
  // Match lines: if there are zero branch points, omit branch stats (rate is undefined, not 0%).
  const hasBranches =
    Number.isFinite(branchesCovered) &&
    Number.isFinite(branchesValid) &&
    branchesValid > 0;

  return {
    lines: hasLines ? { covered: linesCovered, total: linesValid } : null,
    branches: hasBranches ? { covered: branchesCovered, total: branchesValid } : null,
  };
}

function firstExistingPath(candidates) {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function argValue(argName) {
  const idx = process.argv.indexOf(argName);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

const coverageBaseDir = argValue("--coverageBaseDir") ?? process.cwd();
const appsArg = argValue("--apps");
const apps = appsArg
  ? appsArg.split(",").map((s) => s.trim()).filter(Boolean)
  : DEFAULT_APPS;

const results = [];

let total = {
  statements: { covered: 0, total: 0 },
  lines: { covered: 0, total: 0 },
  functions: { covered: 0, total: 0 },
  branches: { covered: 0, total: 0 },
};

const sources = {
  jest: false,
  coveragePy: false,
};

for (const app of apps) {
  const projectDir = path.join(coverageBaseDir, app);
  const jestCoveragePath = firstExistingPath([
    // Common local/CI layout
    path.join(projectDir, "coverage", "coverage-final.json"),
    // actions/download-artifact may flatten single-file artifacts
    path.join(projectDir, "coverage-final.json"),
  ]);

  if (jestCoveragePath) {
    const raw = fs.readFileSync(jestCoveragePath, "utf8");
    const coverageFinalJson = JSON.parse(raw);
    const agg = aggregateFromJestCoverageFinal(coverageFinalJson);

    sources.jest = true;
    results.push({
      app,
      source: "jest",
      rates: {
        statements: pct(agg.statements.covered, agg.statements.total),
        lines: pct(agg.lines.covered, agg.lines.total),
        functions: pct(agg.functions.covered, agg.functions.total),
        branches: pct(agg.branches.covered, agg.branches.total),
      },
      totals: agg,
    });

    total.statements.covered += agg.statements.covered;
    total.statements.total += agg.statements.total;
    total.lines.covered += agg.lines.covered;
    total.lines.total += agg.lines.total;
    total.functions.covered += agg.functions.covered;
    total.functions.total += agg.functions.total;
    total.branches.covered += agg.branches.covered;
    total.branches.total += agg.branches.total;
    continue;
  }

  // Backend: coverage.py
  const coveragePyXmlPath = firstExistingPath([
    path.join(projectDir, "coverage.xml"),
    // Defensive fallback if artifact contains nested folder
    path.join(projectDir, "webs_server", "coverage.xml"),
  ]);
  if (coveragePyXmlPath) {
    const xml = fs.readFileSync(coveragePyXmlPath, "utf8");
    const parsed = parseCoveragePyXml(xml);
    const lineRate = parsed.lines ? pct(parsed.lines.covered, parsed.lines.total) : null;
    const branchRate = parsed.branches ? pct(parsed.branches.covered, parsed.branches.total) : null;

    sources.coveragePy = true;
    results.push({
      app,
      source: "coverage.py",
      rates: { statements: null, lines: lineRate, functions: null, branches: branchRate },
    });

    if (parsed.lines) {
      total.lines.covered += parsed.lines.covered;
      total.lines.total += parsed.lines.total;
    }
    if (parsed.branches) {
      total.branches.covered += parsed.branches.covered;
      total.branches.total += parsed.branches.total;
    }
    continue;
  }

  results.push({
    app,
    source: "missing",
    rates: { statements: null, lines: null, functions: null, branches: null },
  });
}

const totalRates = {
  statements: pct(total.statements.covered, total.statements.total),
  lines: pct(total.lines.covered, total.lines.total),
  functions: pct(total.functions.covered, total.functions.total),
  branches: pct(total.branches.covered, total.branches.total),
};

// Print a short clarification for CI logs about metric origins.
console.log("Metric sources:");
console.log(
  `- statements/functions: ${
    sources.jest ? "Jest only (frontend web_* projects)" : "n/a (no Jest coverage found)"
  }`,
);
console.log(
  `- lines/branches: ${
    sources.jest && sources.coveragePy
      ? "Jest + coverage.py (webs_server)"
      : sources.coveragePy
        ? "coverage.py (webs_server) only"
        : sources.jest
          ? "Jest only (frontend web_* projects)"
          : "n/a (no coverage artifacts found)"
  }`,
);
console.log("");

// Print a compact, workflow-friendly table.
console.log("Monorepo coverage summary");
console.log(`coverageBaseDir: ${coverageBaseDir}`);
console.log("");
for (const r of results) {
  const s = formatPctWithColor("statements", r.rates.statements);
  const l = formatPctWithColor("lines", r.rates.lines);
  const f = formatPctWithColor("functions", r.rates.functions);
  const b = formatPctWithColor("branches", r.rates.branches);
  const src = r.source;
  console.log(`${r.app}\t${src}\tstm:${s}\tln:${l}\tfn:${f}\tbr:${b}`);
}

console.log("");
console.log(
  `TOTAL(project-weighted)\tstm:${formatPctWithColor("statements", totalRates.statements)}\tln:${formatPctWithColor("lines", totalRates.lines)}\tfn:${formatPctWithColor(
    "functions",
    totalRates.functions,
  )}\tbr:${formatPctWithColor("branches", totalRates.branches)}`,
);

const enforce = parseBoolArg("--enforce", false);
if (enforce) {
  const minStatements = Number(argValue("--minStatements") ?? METRIC_THRESHOLDS.statements);
  const minLines = Number(argValue("--minLines") ?? METRIC_THRESHOLDS.lines);
  const minFunctions = Number(argValue("--minFunctions") ?? METRIC_THRESHOLDS.functions);
  const minBranches = Number(argValue("--minBranches") ?? METRIC_THRESHOLDS.branches);

  // If false, we only enforce thresholds for apps that actually produced coverage artifacts.
  // This reduces brittleness when new web_* apps are added but don't have tests configured yet.
  const failMissing = parseBoolArg("--failOnMissing", false);

  const failures = [];

  const metricOk = (metricName, value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return false;
    const threshold =
      metricName === "statements"
        ? minStatements
        : metricName === "lines"
          ? minLines
          : metricName === "functions"
            ? minFunctions
            : metricName === "branches"
              ? minBranches
              : 0;
    return value >= threshold;
  };

  for (const r of results) {
    if (r.source === "missing") {
      if (failMissing) failures.push(`${r.app}: missing coverage artifacts`);
      continue;
    }

    if (r.source === "jest") {
      if (!metricOk("statements", r.rates.statements)) failures.push(`${r.app}: statements below threshold`);
      if (!metricOk("lines", r.rates.lines)) failures.push(`${r.app}: lines below threshold`);
      if (!metricOk("functions", r.rates.functions)) failures.push(`${r.app}: functions below threshold`);
      if (!metricOk("branches", r.rates.branches)) failures.push(`${r.app}: branches below threshold`);
    } else if (r.source === "coverage.py") {
      // Backend: only lines/branches are available from coverage.py.
      // If branch data is absent (e.g. branches-valid=0), rate is null — do not fail enforcement.
      if (!metricOk("lines", r.rates.lines)) failures.push(`${r.app}: lines below threshold`);
      if (
        r.rates.branches != null &&
        !metricOk("branches", r.rates.branches)
      ) {
        failures.push(`${r.app}: branches below threshold`);
      }
    }
  }

  // Global checks (project-weighted) across the aggregated totals.
  // Only enforce global metrics that have a non-zero denominator (i.e. some coverage artifacts were found).
  if (total.statements.total > 0 && !metricOk("statements", totalRates.statements)) {
    failures.push(`TOTAL: statements below threshold (${minStatements}%)`);
  }
  if (total.lines.total > 0 && !metricOk("lines", totalRates.lines)) {
    failures.push(`TOTAL: lines below threshold (${minLines}%)`);
  }
  if (total.functions.total > 0 && !metricOk("functions", totalRates.functions)) {
    failures.push(`TOTAL: functions below threshold (${minFunctions}%)`);
  }
  if (total.branches.total > 0 && !metricOk("branches", totalRates.branches)) {
    failures.push(`TOTAL: branches below threshold (${minBranches}%)`);
  }

  // If no artifacts were found at all, fail (enforcement would be meaningless).
  if (!sources.jest && !sources.coveragePy) {
    failures.push("No coverage artifacts found for any project.");
  }

  if (failures.length > 0) {
    console.error("");
    console.error("Coverage enforcement failed:");
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }
}
