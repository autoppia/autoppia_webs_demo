#!/usr/bin/env node
/**
 * 🧪 EVENT COVERAGE TEST
 *
 * Validates that events defined in EVENT_TYPES are referenced in code.
 * Usage: node tests/test-events.js
 */

const MIN_EVENT_COVERAGE = 1.0; // 100%

function isBrowser() {
  return typeof window !== "undefined";
}

function readFileContent(filePath) {
  if (isBrowser()) return "";
  const fs = require("fs");
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function getAllSourceFiles() {
  if (isBrowser()) return [];
  const fs = require("fs");
  const path = require("path");
  const srcDir = path.join(process.cwd(), "src");

  function walkDir(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (
          stat.isDirectory() &&
          !filePath.includes("node_modules") &&
          !filePath.includes(".next") &&
          !filePath.includes("__pycache__")
        ) {
          walkDir(filePath, fileList);
        } else if ((file.endsWith(".tsx") || file.endsWith(".ts")) && !file.includes("test-")) {
          fileList.push(filePath);
        }
      } catch {
        // ignore unreadable
      }
    });
    return fileList;
  }

  return walkDir(srcDir);
}

function testEventCoverage() {
  console.log("\n" + "📡".repeat(30));
  console.log("📡 EVENT COVERAGE TEST");
  console.log("📡".repeat(30));

  const results = {
    passed: 0,
    failed: 0,
    errors: [],
    stats: {
      totalEvents: 0,
      usedEvents: 0,
      unusedEvents: [],
      eventUsages: {},
    },
  };

  if (isBrowser()) {
    console.log("   ⚠️  This test only works in Node.js");
    return results;
  }

  const fs = require("fs");
  const path = require("path");

  const possiblePaths = [
    "src/library/events.ts",
    "src/lib/events.ts",
    "src/library/event.ts",
    "src/lib/event.ts",
  ];

  let eventsFilePath = null;
  let eventsContent = "";

  for (const relPath of possiblePaths) {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      eventsFilePath = fullPath;
      eventsContent = readFileContent(fullPath);
      console.log(`\n📄 Events file found: ${relPath}`);
      break;
    }
  }

  if (!eventsFilePath) {
    console.log("\n❌ Could not find events.ts");
    console.log("   Searched in:");
    possiblePaths.forEach((p) => console.log(`      - ${p}`));
    results.failed++;
    results.errors.push("events.ts file not found in common locations");
    return results;
  }

  const eventTypesMatch = eventsContent.match(/export\s+const\s+EVENT_TYPES\s*=\s*\{([^}]+)\}/s);
  if (!eventTypesMatch) {
    console.log("\n❌ Could not extract EVENT_TYPES from the file");
    results.failed++;
    results.errors.push("EVENT_TYPES not found in the events file");
    return results;
  }

  const eventTypesBlock = eventTypesMatch[1];
  const eventNamePattern = /(\w+)\s*:\s*["']([^"']+)["']/g;
  const eventNames = [];
  let match;

  while ((match = eventNamePattern.exec(eventTypesBlock)) !== null) {
    const eventKey = match[1];
    const eventValue = match[2];
    eventNames.push({ key: eventKey, value: eventValue });
  }

  const commentedPattern = /\/\/\s*(\w+)\s*:\s*["']([^"']+)["']/g;
  while ((match = commentedPattern.exec(eventTypesBlock)) !== null) {
    const eventKey = match[1];
    const eventValue = match[2];
    if (!eventNames.find((e) => e.key === eventKey)) {
      eventNames.push({ key: eventKey, value: eventValue });
    }
  }

  results.stats.totalEvents = eventNames.length;
  console.log(`\n📊 Total defined events: ${results.stats.totalEvents}`);

  if (eventNames.length === 0) {
    console.log("\n⚠️  No events found in EVENT_TYPES");
    results.failed++;
    results.errors.push("No events could be extracted from EVENT_TYPES");
    return results;
  }

  const sourceFiles = getAllSourceFiles();
  console.log(`📂 Source files analyzed: ${sourceFiles.length}`);

  eventNames.forEach(({ key, value }) => {
    const pattern1 = new RegExp(`logEvent\\([^)]*EVENT_TYPES\\.${key}[^)]*\\)`, "g");
    const pattern2 = new RegExp(`logEvent\\([^)]*EVENT_TYPES\\['${key}'\\][^)]*\\)`, "g");
    const pattern3 = new RegExp(`EVENT_TYPES\\.${key}`, "g");
    const pattern4 = new RegExp(`EVENT_TYPES\\['${key}'\\]`, "g");
    const pattern5 = new RegExp(`["']${value}["']`, "g");

    let usageCount = 0;
    sourceFiles.forEach((file) => {
      const content = readFileContent(file);
      if (file === eventsFilePath) return;

      const matches1 = content.match(pattern1);
      const matches2 = content.match(pattern2);
      const matches3 = content.match(pattern3);
      const matches4 = content.match(pattern4);
      const matches5 = content.match(pattern5);

      usageCount += matches1 ? matches1.length : 0;
      usageCount += matches2 ? matches2.length : 0;
      if (file !== eventsFilePath) {
        usageCount += matches3 ? matches3.length : 0;
        usageCount += matches4 ? matches4.length : 0;
      }
      if (matches5) {
        const logEventContext = content.match(new RegExp(`logEvent\\([^)]*["']${value}["'][^)]*\\)`, "g"));
        if (logEventContext) usageCount += logEventContext.length;
      }
    });

    results.stats.eventUsages[key] = usageCount;
    if (usageCount > 0) {
      results.stats.usedEvents++;
    } else {
      results.stats.unusedEvents.push(key);
    }
  });

  console.log(`\n📊 Events used: ${results.stats.usedEvents} / ${results.stats.totalEvents}`);

  if (results.stats.unusedEvents.length > 0) {
    console.log(`\n⚠️  Unused events (${results.stats.unusedEvents.length}):`);
    results.stats.unusedEvents.forEach((eventKey) => {
      const eventInfo = eventNames.find((e) => e.key === eventKey);
      console.log(`   ❌ ${eventKey} (${eventInfo ? eventInfo.value : "N/A"})`);
    });
  }

  const coverageRatio = results.stats.totalEvents > 0 ? results.stats.usedEvents / results.stats.totalEvents : 0;
  const coveragePercent = (coverageRatio * 100).toFixed(1);
  console.log(`📈 Coverage: ${coveragePercent}%`);

  if (coverageRatio >= MIN_EVENT_COVERAGE) {
    console.log(`\n✅ Event coverage: ${results.stats.usedEvents}/${results.stats.totalEvents} meets ${(MIN_EVENT_COVERAGE * 100).toFixed(0)}% threshold`);
    results.passed++;
  } else {
    console.log(`\n❌ Event coverage: ${results.stats.usedEvents}/${results.stats.totalEvents} below ${(MIN_EVENT_COVERAGE * 100).toFixed(0)}% threshold`);
    results.failed++;
    results.errors.push(`Coverage ${coveragePercent}% is below ${(MIN_EVENT_COVERAGE * 100).toFixed(0)}%`);
  }

  return results;
}

function generateReport(result) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL REPORT");
  console.log("=".repeat(60));

  console.log(`\n✅ Tests passed: ${result.passed}`);
  console.log(`❌ Tests failed: ${result.failed}`);

  console.log("\n📡 EVENT STATS:");
  console.log("─".repeat(60));
  console.log(`   🔹 Total defined events: ${result.stats.totalEvents}`);
  console.log(`   🔹 Events in use: ${result.stats.usedEvents}`);
  console.log(`   🔹 Unused events: ${result.stats.unusedEvents.length}`);
  const coveragePercent = result.stats.totalEvents > 0
    ? ((result.stats.usedEvents / result.stats.totalEvents) * 100).toFixed(1)
    : 0;
  console.log(`   🔹 Coverage: ${coveragePercent}%`);

  if (result.errors.length > 0) {
    console.log("\n⚠️  ERRORS:");
    result.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  if (result.failed === 0) {
    console.log("✅ EVENT COVERAGE: VALIDATION PASSED");
    console.log("   Coverage meets the required threshold.");
  } else {
    console.log("❌ EVENT COVERAGE: NEEDS ATTENTION");
    console.log("   Some events are not being used enough.");
  }
  console.log("=".repeat(60) + "\n");

  return {
    success: result.failed === 0,
    totalPassed: result.passed,
    totalFailed: result.failed,
    errors: result.errors,
    stats: result.stats,
  };
}

if (isBrowser()) {
  window.testEvents = () => generateReport(testEventCoverage());
  console.log("💡 Run testEvents() in the console to execute the test");
} else {
  const result = testEventCoverage();
  const report = generateReport(result);
  process.exit(report.success ? 0 : 1);
}
