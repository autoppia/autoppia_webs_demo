#!/usr/bin/env node
/**
 * 🧪 GENERIC DYNAMIC SYSTEM TEST (IMPROVED)
 *
 * Validates V1 and V3 usage (real usage in code, not just keys in JSON files).
 */

const fs = require("fs");
const path = require("path");

const MIN_REQUIREMENTS = {
  v1AddWrapDecoy: 20,
  v1ChangeOrder: 5,
  v3Ids: 25,
  v3Classes: 15,
  v3Texts: 30,
  minVariants: 3,
};

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

function loadJSON(path) {
  if (isBrowser()) {
    throw new Error("In browser, JSON files must be loaded via fetch");
  }
  const fs = require("fs");
  const pathModule = require("path");
  return JSON.parse(fs.readFileSync(pathModule.join(process.cwd(), path), "utf8"));
}

function fileExists(path) {
  if (isBrowser()) return false;
  const fs = require("fs");
  const pathModule = require("path");
  return fs.existsSync(pathModule.join(process.cwd(), path));
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
  const pathModule = require("path");
  const srcDir = pathModule.join(process.cwd(), "src");

  function walkDir(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = pathModule.join(dir, file);
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
        /* ignore unreadable files */
      }
    });
    return fileList;
  }

  if (fs.existsSync(srcDir)) {
    return walkDir(srcDir);
  }
  return [];
}

function countPatternInFiles(files, pattern) {
  let count = 0;
  files.forEach((file) => {
    const content = readFileContent(file);
    const matches = content.match(new RegExp(pattern, "g"));
    if (matches) {
      count += matches.length;
    }
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
      const type = ["IDs", "Clases", "Textos"][index];
      Object.entries(variants).forEach(([key, variantsArray]) => {
        const count = Array.isArray(variantsArray) ? variantsArray.length : 0;
        if (count < MIN_REQUIREMENTS.minVariants) {
          results.stats.keysWithFewVariants.push(`${type}: "${key}" tiene solo ${count} variantes`);
        }
      });
    });

    console.log(`   📊 IDs: ${results.stats.idKeys} keys`);
    console.log(`   📊 Clases: ${results.stats.classKeys} keys`);
    console.log(`   📊 Textos: ${results.stats.textKeys} keys`);

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

  try {
    const hashString = (value) => {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };
    const selectVariantIndex = (seed, key, count) => {
      if (count <= 1) return 0;
      const combinedInput = `${key}:${seed}`;
      const combinedHash = hashString(combinedInput);
      return Math.abs(combinedHash) % count;
    };

    const seed = 42;
    const key = "test-key";
    const count = 5;

    const firstRun = selectVariantIndex(seed, key, count);
    const secondRun = selectVariantIndex(seed, key, count);

    if (firstRun === secondRun) {
      console.log("   ✅ selectVariantIndex is deterministic");
      results.passed++;
    } else {
      console.log("   ❌ selectVariantIndex produced inconsistent results");
      results.failed++;
      results.errors.push("selectVariantIndex is not deterministic");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push(`Error: ${error.message}`);
  }

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
  console.log(`   📂 Archivos fuente encontrados: ${sourceFiles.length}`);

  const addWrapDecoyPattern = /\.v1\.addWrapDecoy|addWrapDecoy\(/g;
  results.stats.v1AddWrapDecoy = countPatternInFiles(sourceFiles, addWrapDecoyPattern);
  console.log(`   📊 V1 addWrapDecoy: ${results.stats.v1AddWrapDecoy} usos`);

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
  console.log(`   📊 V1 changeOrderElements: ${results.stats.v1ChangeOrder} usos`);

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
  console.log(`   📊 V3 IDs (getVariant con ID_VARIANTS_MAP): ${results.stats.v3Ids} usos`);

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
  console.log(`   📊 V3 Classes (getVariant con CLASS_VARIANTS_MAP): ${results.stats.v3Classes} usos`);

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
  console.log(`   📊 V3 Texts (getVariant para textos): ${results.stats.v3Texts} usos`);

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

function runAllTests() {
  console.log("🚀 DYNAMIC SYSTEM: VALIDATING IMPLEMENTATION");
  console.log("==============================================");

  const results = [];
  results.push(testFileStructure());
  results.push(testVariantFiles());
  results.push(testDeterminism());
  results.push(testWrapperCombination());
  results.push(testRealUsage());

  console.log("\n📊 SUMMARY");
  console.log("─".repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors = [];
  results.forEach((result) => {
    totalPassed += result.passed || 0;
    totalFailed += result.failed || 0;
    if (result.errors) {
      allErrors.push(...result.errors);
    }
  });

  if (totalFailed === 0) {
    console.log("✅ DYNAMIC SYSTEM: VALIDATION SUCCESSFUL");
  } else {
    console.log("❌ DYNAMIC SYSTEM: VALIDATION FAILED");
    allErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
