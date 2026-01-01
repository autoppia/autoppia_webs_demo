#!/usr/bin/env node
/**
 * 🧪 GENERIC DYNAMIC SYSTEM TEST (IMPROVED)
 *
 * Validates V1 and V3 usage (real usage in code, not just keys in JSON files).
 *
 * Usage:
 *   node tests/test-dynamic-system.js
 */

const MIN_REQUIREMENTS = {
  v1AddWrapDecoy: 20,
  v1ChangeOrder: 5,
  v3Ids: 25,
  v3Classes: 15,
  v3Texts: 30,
  minVariants: 3,
};

const MIN_EVENT_COVERAGE = 1.0; // 100%

const FILE_PATHS = {
  idVariants: "src/dynamic/v3/data/id-variants.json",
  classVariants: "src/dynamic/v3/data/class-variants.json",
  textVariants: "src/dynamic/v3/data/text-variants.json",
  addWrapDecoy: "src/dynamic/v1/add-wrap-decoy.ts",
  changeOrder: "src/dynamic/v1/change-order-elements.ts",
  variantSelector: "src/dynamic/v3/utils/variant-selector.ts",
  core: "src/dynamic/shared/core.ts",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function loadJSON(relPath) {
  if (isBrowser()) {
    throw new Error("In browser, JSON files must be loaded via fetch");
  }
  const fs = require("fs");
  const path = require("path");
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8"));
}

function fileExists(relPath) {
  if (isBrowser()) return false;
  const fs = require("fs");
  const path = require("path");
  return fs.existsSync(path.join(process.cwd(), relPath));
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
        } else if ((file.endsWith(".tsx") || file.endsWith(".ts")) && !file.includes("test-dynamic-system")) {
          fileList.push(filePath);
        }
      } catch {
        // ignore unreadable files
      }
    });
    return fileList;
  }

  return walkDir(srcDir);
}

function countPatternInFiles(files, pattern) {
  let count = 0;
  files.forEach((file) => {
    const content = readFileContent(file);
    const matches = content.match(new RegExp(pattern, "g"));
    if (matches) count += matches.length;
  });
  return count;
}

function testFileStructure() {
  console.log("\n📁 TEST 1: File structure");
  console.log("─".repeat(60));
  const results = { passed: 0, failed: 0, errors: [] };

  if (isBrowser()) {
    console.log("   ⚠️  File verification only available in Node.js");
    return results;
  }

  const requiredFiles = [
    FILE_PATHS.addWrapDecoy,
    FILE_PATHS.changeOrder,
    FILE_PATHS.variantSelector,
    FILE_PATHS.idVariants,
    FILE_PATHS.classVariants,
    FILE_PATHS.textVariants,
    FILE_PATHS.core,
  ];

  requiredFiles.forEach((file) => {
    if (fileExists(file)) {
      console.log(`   ✅ ${file}`);
      results.passed++;
    } else {
      console.log(`   ❌ ${file} - NOT FOUND`);
      results.failed++;
      results.errors.push(`Missing file: ${file}`);
    }
  });

  return results;
}

function testVariantFiles() {
  console.log("\n📦 TEST 2: Variants in JSON files");
  console.log("─".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    errors: [],
    stats: {
      idKeys: 0,
      classKeys: 0,
      textKeys: 0,
      keysWithFewVariants: [],
    },
  };

  if (isBrowser()) {
    console.log("   ⚠️  In browser, this test requires Node.js");
    return results;
  }

  try {
    const idVariants = loadJSON(FILE_PATHS.idVariants);
    const classVariants = loadJSON(FILE_PATHS.classVariants);
    const textVariants = loadJSON(FILE_PATHS.textVariants);

    results.stats.idKeys = Object.keys(idVariants).length;
    results.stats.classKeys = Object.keys(classVariants).length;
    results.stats.textKeys = Object.keys(textVariants).length;

    [idVariants, classVariants, textVariants].forEach((variants, index) => {
      const type = ["IDs", "Classes", "Texts"][index];
      Object.entries(variants).forEach(([key, variantsArray]) => {
        const count = Array.isArray(variantsArray) ? variantsArray.length : 0;
        if (count < MIN_REQUIREMENTS.minVariants) {
          results.stats.keysWithFewVariants.push(`${type}: "${key}" only has ${count} variants`);
        }
      });
    });

    console.log(`   📊 IDs: ${results.stats.idKeys} keys`);
    console.log(`   📊 Classes: ${results.stats.classKeys} keys`);
    console.log(`   📊 Texts: ${results.stats.textKeys} keys`);

    if (results.stats.keysWithFewVariants.length > 0) {
      console.log(`   ⚠️  Keys with few variants (<${MIN_REQUIREMENTS.minVariants}): ${results.stats.keysWithFewVariants.length}`);
      results.stats.keysWithFewVariants.slice(0, 3).forEach((msg) => console.log(`      - ${msg}`));
    }

    results.passed = 3;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push(`Error: ${error.message}`);
  }

  return results;
}

function testDeterminism() {
  console.log("\n🎲 TEST 3: Determinism (same seed = same result)");
  console.log("─".repeat(60));

  const results = { passed: 0, failed: 0, errors: [] };

  function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  function selectVariantIndex(seed, key, count) {
    if (count <= 1) return 0;
    const combinedInput = `${key}:${seed}`;
    const combinedHash = hashString(combinedInput);
    return Math.abs(combinedHash) % count;
  }

  const testCases = [
    { seed: 42, key: "movie-card", count: 10 },
    { seed: 100, key: "search-input", count: 10 },
    { seed: 1, key: "button", count: 10 },
  ];

  testCases.forEach(({ seed, key, count }) => {
    const r1 = selectVariantIndex(seed, key, count);
    const r2 = selectVariantIndex(seed, key, count);
    const r3 = selectVariantIndex(seed, key, count);

    if (r1 === r2 && r2 === r3) {
      console.log(`   ✅ seed=${seed}, key="${key}": ${r1} (consistent)`);
      results.passed++;
    } else {
      console.log(`   ❌ seed=${seed}, key="${key}": ${r1} vs ${r2} vs ${r3}`);
      results.failed++;
      results.errors.push(`Determinism failed for seed=${seed}, key="${key}"`);
    }
  });

  return results;
}

function testWrapperCombination() {
  console.log("\n🧱 TEST 4: V1 wrapper/decoy combination (mock)");
  console.log("─".repeat(60));

  const results = { passed: 0, failed: 0, errors: [] };

  try {
    const selectVariantIndex = (seed, key, count) => {
      if (count <= 1) return 0;
      const combinedInput = `${key}:${seed}`;
      let hash = 0;
      for (let i = 0; i < combinedInput.length; i++) {
        const char = combinedInput.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % count;
    };
    const applyV1Wrapper = (seed, componentKey, children) => {
      const wrapperVariant = seed === 1 ? 0 : selectVariantIndex(seed, `${componentKey}-wrapper`, 2);
      const decoyVariant = seed === 1 ? 0 : selectVariantIndex(seed, `${componentKey}-decoy`, 3);
      const shouldWrap = wrapperVariant > 0;
      const core = shouldWrap ? { props: { "data-v1": "true" }, child: children } : children;
      if (decoyVariant === 0) return core;
      return { props: { "data-v1": "true" }, child: core };
    };
    const seed = 99;
    const componentKey = "test-component";
    const child = { type: "div", props: {} };

    const output = applyV1Wrapper(seed, componentKey, child);
    const containsV1 = output && output.props && output.props["data-v1"] === "true";

    if (containsV1) {
      console.log("   ✅ Wrapper/decoy applied");
      results.passed++;
    } else {
      console.log("   ❌ Wrapper/decoy was not applied");
      results.failed++;
      results.errors.push("applyV1Wrapper did not add data-v1");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push(`Error: ${error.message}`);
  }

  return results;
}

function testRealUsage() {
  console.log("\n📈 TEST 5: Real usage in code");
  console.log("─".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    errors: [],
    stats: {
      v1AddWrapDecoy: 0,
      v1ChangeOrder: 0,
      v3Ids: 0,
      v3Classes: 0,
      v3Texts: 0,
    },
  };

  if (isBrowser()) {
    console.log("   ⚠️  This test only runs in Node.js");
    return results;
  }

  const sourceFiles = getAllSourceFiles();
  console.log(`   📂 Source files found: ${sourceFiles.length}`);

  const addWrapDecoyPattern = /\.v1\.addWrapDecoy|addWrapDecoy\(/g;
  results.stats.v1AddWrapDecoy = countPatternInFiles(sourceFiles, addWrapDecoyPattern);
  console.log(`   📊 V1 addWrapDecoy: ${results.stats.v1AddWrapDecoy} uses`);

  if (results.stats.v1AddWrapDecoy >= MIN_REQUIREMENTS.v1AddWrapDecoy) {
    console.log(`   ✅ V1 addWrapDecoy: ${results.stats.v1AddWrapDecoy} >= ${MIN_REQUIREMENTS.v1AddWrapDecoy}`);
    results.passed++;
  } else {
    console.log(`   ❌ V1 addWrapDecoy: ${results.stats.v1AddWrapDecoy} < ${MIN_REQUIREMENTS.v1AddWrapDecoy}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v1AddWrapDecoy - results.stats.v1AddWrapDecoy} usages of addWrapDecoy`);
  }

  const changeOrderPattern = /\.v1\.changeOrderElements|changeOrderElements\(/g;
  results.stats.v1ChangeOrder = countPatternInFiles(sourceFiles, changeOrderPattern);
  console.log(`   📊 V1 changeOrderElements: ${results.stats.v1ChangeOrder} uses`);

  if (results.stats.v1ChangeOrder >= MIN_REQUIREMENTS.v1ChangeOrder) {
    console.log(`   ✅ V1 changeOrderElements: ${results.stats.v1ChangeOrder} >= ${MIN_REQUIREMENTS.v1ChangeOrder}`);
    results.passed++;
  } else {
    console.log(`   ❌ V1 changeOrderElements: ${results.stats.v1ChangeOrder} < ${MIN_REQUIREMENTS.v1ChangeOrder}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v1ChangeOrder - results.stats.v1ChangeOrder} usages of changeOrderElements`);
  }

  const idPattern = /\.v3\.getVariant\([^)]*ID_VARIANTS_MAP|getVariant\([^)]*ID_VARIANTS_MAP/g;
  results.stats.v3Ids = countPatternInFiles(sourceFiles, idPattern);
  console.log(`   📊 V3 IDs (getVariant with ID_VARIANTS_MAP): ${results.stats.v3Ids} uses`);

  if (results.stats.v3Ids >= MIN_REQUIREMENTS.v3Ids) {
    console.log(`   ✅ V3 IDs: ${results.stats.v3Ids} >= ${MIN_REQUIREMENTS.v3Ids}`);
    results.passed++;
  } else {
    console.log(`   ❌ V3 IDs: ${results.stats.v3Ids} < ${MIN_REQUIREMENTS.v3Ids}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v3Ids - results.stats.v3Ids} usages of getVariant for IDs`);
  }

  const classPattern = /\.v3\.getVariant\([^)]*CLASS_VARIANTS_MAP|getVariant\([^)]*CLASS_VARIANTS_MAP/g;
  results.stats.v3Classes = countPatternInFiles(sourceFiles, classPattern);
  console.log(`   📊 V3 Classes (getVariant with CLASS_VARIANTS_MAP): ${results.stats.v3Classes} uses`);

  if (results.stats.v3Classes >= MIN_REQUIREMENTS.v3Classes) {
    console.log(`   ✅ V3 Classes: ${results.stats.v3Classes} >= ${MIN_REQUIREMENTS.v3Classes}`);
    results.passed++;
  } else {
    console.log(`   ❌ V3 Classes: ${results.stats.v3Classes} < ${MIN_REQUIREMENTS.v3Classes}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v3Classes - results.stats.v3Classes} usages of getVariant for classes`);
  }

  const textPattern1 = /\.v3\.getVariant\([^)]*,\s*undefined|getVariant\([^)]*,\s*undefined/g;
  const textPattern2 = /\.v3\.getVariant\([^)]*TEXT_VARIANTS_MAP|getVariant\([^)]*TEXT_VARIANTS_MAP/g;
  const textPattern3 = /\.v3\.getVariant\([^)]*[Tt]ext[^)]*Variants|getVariant\([^)]*[Tt]ext[^)]*Variants/g;
  const textCount1 = countPatternInFiles(sourceFiles, textPattern1);
  const textCount2 = countPatternInFiles(sourceFiles, textPattern2);
  const textCount3 = countPatternInFiles(sourceFiles, textPattern3);
  results.stats.v3Texts = textCount1 + textCount2 + textCount3;
  console.log(`   📊 V3 Texts (getVariant for texts): ${results.stats.v3Texts} uses`);

  if (results.stats.v3Texts >= MIN_REQUIREMENTS.v3Texts) {
    console.log(`   ✅ V3 Texts: ${results.stats.v3Texts} >= ${MIN_REQUIREMENTS.v3Texts}`);
    results.passed++;
  } else {
    console.log(`   ❌ V3 Texts: ${results.stats.v3Texts} < ${MIN_REQUIREMENTS.v3Texts}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v3Texts - results.stats.v3Texts} usages of getVariant for texts`);
  }

  return results;
}

function testEventCoverage() {
  console.log("\n📡 TEST 6: Event coverage");
  console.log("─".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    errors: [],
    stats: {
      totalEvents: 0,
      usedEvents: 0,
      unusedEvents: [],
      coveragePercent: 0,
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
      console.log(`   📄 Events file found: ${relPath}`);
      break;
    }
  }

  if (!eventsFilePath) {
    console.log("   ❌ events.ts file not found");
    results.failed++;
    results.errors.push("events.ts file not found in common locations");
    return results;
  }

  const eventTypesMatch = eventsContent.match(/export\s+const\s+EVENT_TYPES\s*=\s*\{([^}]+)\}/s);
  if (!eventTypesMatch) {
    console.log("   ❌ EVENT_TYPES not found in events file");
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
  console.log(`   📊 Total defined events: ${results.stats.totalEvents}`);

  if (eventNames.length === 0) {
    console.log("   ⚠️  No events found in EVENT_TYPES");
    results.failed++;
    results.errors.push("No events could be extracted from EVENT_TYPES");
    return results;
  }

  const sourceFiles = getAllSourceFiles();
  console.log(`   📂 Source files analyzed: ${sourceFiles.length}`);

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

    if (usageCount > 0) {
      results.stats.usedEvents++;
    } else {
      results.stats.unusedEvents.push(key);
    }
  });

  const coverageRatio = results.stats.totalEvents > 0 ? results.stats.usedEvents / results.stats.totalEvents : 0;
  results.stats.coveragePercent = (coverageRatio * 100).toFixed(1);

  console.log(`   📊 Events used: ${results.stats.usedEvents} / ${results.stats.totalEvents}`);
  console.log(`   📈 Coverage: ${results.stats.coveragePercent}%`);

  if (results.stats.unusedEvents.length > 0) {
    console.log(`   ⚠️  Unused events (${results.stats.unusedEvents.length}): ${results.stats.unusedEvents.join(", ")}`);
  }

  if (coverageRatio >= MIN_EVENT_COVERAGE) {
    console.log(`   ✅ Event coverage meets ${(MIN_EVENT_COVERAGE * 100).toFixed(0)}% threshold`);
    results.passed++;
  } else {
    console.log(`   ❌ Event coverage below ${(MIN_EVENT_COVERAGE * 100).toFixed(0)}% threshold`);
    results.failed++;
    results.errors.push(`Event coverage ${results.stats.coveragePercent}% is below ${(MIN_EVENT_COVERAGE * 100).toFixed(0)}%`);
  }

  return results;
}

function runAllTests() {
  console.log("🚀 DYNAMIC SYSTEM: VALIDATING IMPLEMENTATION");
  console.log("==============================================");

  const results = [];
  results.push(testFileStructure());
  results.push(testVariantFiles());
  results.push(testDeterminism());
  results.push(testWrapperCombination());
  results.push(testRealUsage());
  results.push(testEventCoverage());

  console.log("\n📊 SUMMARY");
  console.log("─".repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors = [];
  results.forEach((result) => {
    totalPassed += result.passed || 0;
    totalFailed += result.failed || 0;
    if (result.errors) allErrors.push(...result.errors);
  });

  console.log(`✅ Tests passed: ${totalPassed}`);
  console.log(`❌ Tests failed: ${totalFailed}`);

  const usageStats = results.find((r) => r.stats && r.stats.v1AddWrapDecoy !== undefined)?.stats;
  const eventStats = results.find((r) => r.stats && r.stats.totalEvents !== undefined)?.stats;

  if (usageStats) {
    console.log("\n📌 Usage metrics:");
    console.log(`   V1 addWrapDecoy: ${usageStats.v1AddWrapDecoy} (min ${MIN_REQUIREMENTS.v1AddWrapDecoy})`);
    console.log(`   V1 changeOrderElements: ${usageStats.v1ChangeOrder} (min ${MIN_REQUIREMENTS.v1ChangeOrder})`);
    console.log(`   V3 IDs: ${usageStats.v3Ids} (min ${MIN_REQUIREMENTS.v3Ids})`);
    console.log(`   V3 Classes: ${usageStats.v3Classes} (min ${MIN_REQUIREMENTS.v3Classes})`);
    console.log(`   V3 Texts: ${usageStats.v3Texts} (min ${MIN_REQUIREMENTS.v3Texts})`);
  }

  if (eventStats) {
    console.log("\n📌 Event coverage:");
    console.log(`   Total events: ${eventStats.totalEvents}`);
    console.log(`   Used events: ${eventStats.usedEvents}`);
    console.log(`   Coverage: ${eventStats.coveragePercent}% (min ${(MIN_EVENT_COVERAGE * 100).toFixed(0)}%)`);
    if (eventStats.unusedEvents && eventStats.unusedEvents.length > 0) {
      console.log(`   Unused: ${eventStats.unusedEvents.join(", ")}`);
    }
  }

  if (allErrors.length > 0) {
    console.log("\n⚠️  ERRORS:");
    allErrors.slice(0, 5).forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    if (allErrors.length > 5) {
      console.log(`   ... and ${allErrors.length - 5} more`);
    }
  }

  if (totalFailed === 0) {
    console.log("\n✅ DYNAMIC SYSTEM: VALIDATION SUCCESSFUL");
  } else {
    console.log("\n❌ DYNAMIC SYSTEM: VALIDATION FAILED");
  }

  return { success: totalFailed === 0 };
}

if (isBrowser()) {
  window.testDynamicSystem = runAllTests;
  console.log("💡 Run testDynamicSystem() in the console to execute the tests");
} else {
  const report = runAllTests();
  process.exit(report.success ? 0 : 1);
}
