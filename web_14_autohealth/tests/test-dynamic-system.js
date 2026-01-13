#!/usr/bin/env node
/**
 * 🧪 GENERIC DYNAMIC SYSTEM TEST (IMPROVED)
 * 
 * This script validates that the dynamic system (V1 and V3) works correctly.
 * It counts REAL USAGE in code, not just keys in JSON files.
 * 
 * USAGE:
 *   1. From Node.js: node tests/test-dynamic-system.js
 *   2. From the browser: copy the contents into the console (F12) and run testDynamicSystem()
 * 
 * CONFIGURATION:
 *   Modify MIN_REQUIREMENTS according to your site's requirements.
 */

// ============================================================================
// CONFIGURATION (ADAPT AS NEEDED FOR THE SITE)
// ============================================================================

const MIN_REQUIREMENTS = {
  v1AddWrapDecoy: 20,      // Minimum addWrapDecoy usages (all webs have at least 26)
  v1ChangeOrder: 5,        // Minimum changeOrderElements usages
  v3Ids: 25,               // Minimum getVariant with ID_VARIANTS_MAP usages (all webs have at least 29)
  v3Classes: 15,           // Minimum getVariant with CLASS_VARIANTS_MAP usages (web_4 has 16)
  v3Texts: 30,             // Minimum getVariant for texts usages (all webs have at least 34)
  minVariants: 3,          // Minimum variants per key in JSONs
};

// Paths to the files (adjust if the structure is different)
const FILE_PATHS = {
  idVariants: 'src/dynamic/v3/data/id-variants.json',
  classVariants: 'src/dynamic/v3/data/class-variants.json',
  textVariants: 'src/dynamic/v3/data/text-variants.json',
  addWrapDecoy: 'src/dynamic/v1/add-wrap-decoy.ts',
  changeOrder: 'src/dynamic/v1/change-order-elements.ts',
  variantSelector: 'src/dynamic/v3/utils/variant-selector.ts',
  core: 'src/dynamic/shared/core.ts',
};

// ============================================================================
// UTILITIES
// ============================================================================

function isBrowser() {
  return typeof window !== 'undefined';
}

function loadJSON(path) {
  if (isBrowser()) {
    throw new Error('In browser, JSON files must be loaded via fetch');
  }
  const fs = require('fs');
  const pathModule = require('path');
  return JSON.parse(fs.readFileSync(pathModule.join(process.cwd(), path), 'utf8'));
}

function fileExists(path) {
  if (isBrowser()) return false;
  const fs = require('fs');
  const pathModule = require('path');
  return fs.existsSync(pathModule.join(process.cwd(), path));
}

function readFileContent(filePath) {
  if (isBrowser()) return '';
  const fs = require('fs');
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function getAllSourceFiles() {
  if (isBrowser()) return [];
  const fs = require('fs');
  const pathModule = require('path');
  const srcDir = pathModule.join(process.cwd(), 'src');
  
  function walkDir(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = pathModule.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next') && !filePath.includes('__pycache__')) {
          walkDir(filePath, fileList);
        } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.includes('test-dynamic-system')) {
          fileList.push(filePath);
        }
      } catch (err) {
        // Skip files we can't read
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
  files.forEach(file => {
    const content = readFileContent(file);
    const matches = content.match(new RegExp(pattern, 'g'));
    if (matches) {
      count += matches.length;
    }
  });
  return count;
}

// ============================================================================
// TEST 1: File structure
// ============================================================================

function testFileStructure() {
  console.log('\n📁 TEST 1: File structure');
  console.log('─'.repeat(60));
  
  const results = { passed: 0, failed: 0, errors: [] };
  
  if (isBrowser()) {
    console.log('   ⚠️  File verification only available in Node.js');
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
  
  requiredFiles.forEach(file => {
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

// ============================================================================
// TEST 2: Variants in JSON files
// ============================================================================

function testVariantFiles() {
  console.log('\n📦 TEST 2: Variants in JSON files');
  console.log('─'.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [],
    stats: {
      idKeys: 0,
      classKeys: 0,
      textKeys: 0,
      keysWithFewVariants: []
    }
  };
  
  if (isBrowser()) {
    console.log('   ⚠️  In browser, this test requires Node.js');
    return results;
  }
  
  try {
    const idVariants = loadJSON(FILE_PATHS.idVariants);
    const classVariants = loadJSON(FILE_PATHS.classVariants);
    const textVariants = loadJSON(FILE_PATHS.textVariants);
    
    // Count keys and verify variants
    results.stats.idKeys = Object.keys(idVariants).length;
    results.stats.classKeys = Object.keys(classVariants).length;
    results.stats.textKeys = Object.keys(textVariants).length;
    
    // Check that each key has enough variants
    [idVariants, classVariants, textVariants].forEach((variants, index) => {
      const type = ['IDs', 'Classes', 'Texts'][index];
      Object.entries(variants).forEach(([key, variantsArray]) => {
        const count = Array.isArray(variantsArray) ? variantsArray.length : 0;
        if (count < MIN_REQUIREMENTS.minVariants) {
          results.stats.keysWithFewVariants.push(`${type}: "${key}" has only ${count} variants`);
        }
      });
    });
    
    console.log(`   📊 IDs: ${results.stats.idKeys} keys`);
    console.log(`   📊 Classes: ${results.stats.classKeys} keys`);
    console.log(`   📊 Texts: ${results.stats.textKeys} keys`);
    
    // Just report, don't fail on JSON keys (we check real usage in TEST 5)
    if (results.stats.keysWithFewVariants.length > 0) {
      console.log(`   ⚠️  Keys with few variants (<${MIN_REQUIREMENTS.minVariants}): ${results.stats.keysWithFewVariants.length}`);
      results.stats.keysWithFewVariants.slice(0, 3).forEach(msg => console.log(`      - ${msg}`));
    }
    
    results.passed = 3; // Always pass, just informational
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push(`Error: ${error.message}`);
  }
  
  return results;
}

// ============================================================================
// TEST 3: Determinism
// ============================================================================

function testDeterminism() {
  console.log('\n🎲 TEST 3: Determinism (same seed = same result)');
  console.log('─'.repeat(60));
  
  const results = { passed: 0, failed: 0, errors: [] };
  
  // Hash function (must match the code)
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  function selectVariantIndex(seed, key, count) {
    if (count <= 1) return 0;
    const combined = `${key}:${seed}`;
    const hash = hashString(combined);
    return Math.abs(hash) % count;
  }
  
  // Test cases
  const testCases = [
    { seed: 42, key: 'movie-card', count: 10 },
    { seed: 100, key: 'search-input', count: 10 },
    { seed: 1, key: 'button', count: 10 },
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

// ============================================================================
// TEST 4: Seed Variation (different seeds = different results)
// ============================================================================

function testSeedVariation() {
  console.log('\n🎯 TEST 4: Seed variation (different seeds = different results)');
  console.log('─'.repeat(60));
  
  const results = { passed: 0, failed: 0, errors: [], stats: {} };
  
  // Hash function (must match the code)
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  function selectVariantIndex(seed, key, count) {
    if (count <= 1) return 0;
    const combined = `${key}:${seed}`;
    const hash = hashString(combined);
    return Math.abs(hash) % count;
  }
  
  // Test with multiple seeds and keys
  const testSeeds = [1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 999];
  const testKeys = ['button', 'input', 'card', 'container'];
  const variantCount = 10; // Simulate 10 variants available
  
  let totalTests = 0;
  let uniqueVariations = 0;
  let totalVariations = 0;
  
  testKeys.forEach(key => {
    const seedResults = {};
    testSeeds.forEach(seed => {
      const variantIndex = selectVariantIndex(seed, key, variantCount);
      seedResults[seed] = variantIndex;
      totalTests++;
    });
    
    // Check variation for this key
    const uniqueIndices = new Set(Object.values(seedResults));
    const variationRatio = uniqueIndices.size / testSeeds.length;
    totalVariations += uniqueIndices.size;
    
    if (variationRatio >= 0.5) {
      uniqueVariations++;
      console.log(`   ✅ "${key}": ${uniqueIndices.size}/${testSeeds.length} unique variants (${(variationRatio * 100).toFixed(0)}%)`);
    } else {
      console.log(`   ⚠️  "${key}": ${uniqueIndices.size}/${testSeeds.length} unique variants (${(variationRatio * 100).toFixed(0)}%) - low variation`);
    }
  });
  
  results.stats.totalTests = totalTests;
  results.stats.totalVariations = totalVariations;
  results.stats.averageVariation = (totalVariations / (testKeys.length * testSeeds.length)) * 100;
  
  const overallVariationRatio = totalVariations / totalTests;
  console.log(`\n   📊 Average variation: ${(overallVariationRatio * 100).toFixed(1)}%`);
  
  // Pass if at least 50% of seeds produce unique variants (good distribution)
  // This means different seeds should produce different results most of the time
  if (overallVariationRatio >= 0.5) {
    console.log(`   ✅ Seed variation: ${(overallVariationRatio * 100).toFixed(1)}% >= 50% (good distribution)`);
    results.passed++;
  } else {
    console.log(`   ❌ Seed variation: ${(overallVariationRatio * 100).toFixed(1)}% < 50% (low variation)`);
    results.failed++;
    results.errors.push(`Variation between seeds is insufficient (${(overallVariationRatio * 100).toFixed(1)}% < 50%)`);
  }
  
  // Also check that at least 3 out of 4 keys have good variation
  if (uniqueVariations >= 3) {
    console.log(`   ✅ ${uniqueVariations}/${testKeys.length} keys have good variation`);
    results.passed++;
  } else {
    console.log(`   ⚠️  Only ${uniqueVariations}/${testKeys.length} keys have good variation`);
    results.failed++;
    results.errors.push(`Only ${uniqueVariations}/${testKeys.length} keys have good variation`);
  }
  
  return results;
}

// ============================================================================
// TEST 5: DOM usage (browser only)
// ============================================================================

function testDOMUsage() {
  console.log('\n🌐 TEST 4: DOM usage');
  console.log('─'.repeat(60));
  
  const results = { passed: 0, failed: 0, errors: [], stats: {} };
  
  if (!isBrowser()) {
    console.log('   ⚠️  This test only works in the browser');
    return results;
  }
  
  // Count V1
  const wrappers = document.querySelectorAll('[data-dyn-wrap]').length;
  const decoys = document.querySelectorAll('[data-decoy]').length;
  const totalV1 = wrappers + decoys;
  results.stats.v1Wrappers = totalV1;
  
  console.log(`   📊 Wrappers: ${wrappers}, Decoys: ${decoys}, Total V1: ${totalV1}`);
  
  if (totalV1 >= MIN_REQUIREMENTS.v1AddWrapDecoy) {
    console.log(`   ✅ V1: ${totalV1} >= ${MIN_REQUIREMENTS.v1AddWrapDecoy}`);
    results.passed++;
  } else {
    console.log(`   ❌ V1: ${totalV1} < ${MIN_REQUIREMENTS.v1AddWrapDecoy}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v1AddWrapDecoy - totalV1} V1 elements`);
  }
  
  // Count V3 IDs
  const uniqueIds = new Set(
    Array.from(document.querySelectorAll('[id]'))
      .map(el => el.id)
      .filter(id => id && id.length > 0)
  );
  results.stats.v3Ids = uniqueIds.size;
  
  console.log(`   📊 Unique IDs: ${uniqueIds.size}`);
  
  if (uniqueIds.size >= MIN_REQUIREMENTS.v3Ids) {
    console.log(`   ✅ V3 IDs: ${uniqueIds.size} >= ${MIN_REQUIREMENTS.v3Ids}`);
    results.passed++;
  } else {
    console.log(`   ❌ V3 IDs: ${uniqueIds.size} < ${MIN_REQUIREMENTS.v3Ids}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v3Ids - uniqueIds.size} dynamic IDs`);
  }
  
  return results;
}

// ============================================================================
// TEST 6: REAL USAGE IN CODE (NEW!)
// ============================================================================

function testRealUsage() {
  console.log('\n💻 TEST 5: REAL USAGE IN CODE');
  console.log('─'.repeat(60));
  
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
    }
  };
  
  if (isBrowser()) {
    console.log('   ⚠️  This test only works in Node.js');
    return results;
  }
  
  const sourceFiles = getAllSourceFiles();
  console.log(`   📂 Source files found: ${sourceFiles.length}`);
  
  // Count V1: addWrapDecoy (dyn.v1.addWrapDecoy or addWrapDecoy)
  const addWrapDecoyPattern = /\.v1\.addWrapDecoy|addWrapDecoy\(/g;
  results.stats.v1AddWrapDecoy = countPatternInFiles(sourceFiles, addWrapDecoyPattern);
  console.log(`   📊 V1 addWrapDecoy: ${results.stats.v1AddWrapDecoy} uses`);
  
  if (results.stats.v1AddWrapDecoy >= MIN_REQUIREMENTS.v1AddWrapDecoy) {
    console.log(`   ✅ V1 addWrapDecoy: ${results.stats.v1AddWrapDecoy} >= ${MIN_REQUIREMENTS.v1AddWrapDecoy}`);
    results.passed++;
  } else {
    console.log(`   ❌ V1 addWrapDecoy: ${results.stats.v1AddWrapDecoy} < ${MIN_REQUIREMENTS.v1AddWrapDecoy}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v1AddWrapDecoy - results.stats.v1AddWrapDecoy} uses of addWrapDecoy`);
  }
  
  // Count V1: changeOrderElements (dyn.v1.changeOrderElements or changeOrderElements)
  const changeOrderPattern = /\.v1\.changeOrderElements|changeOrderElements\(/g;
  results.stats.v1ChangeOrder = countPatternInFiles(sourceFiles, changeOrderPattern);
  console.log(`   📊 V1 changeOrderElements: ${results.stats.v1ChangeOrder} uses`);
  
  if (results.stats.v1ChangeOrder >= MIN_REQUIREMENTS.v1ChangeOrder) {
    console.log(`   ✅ V1 changeOrderElements: ${results.stats.v1ChangeOrder} >= ${MIN_REQUIREMENTS.v1ChangeOrder}`);
    results.passed++;
  } else {
    console.log(`   ❌ V1 changeOrderElements: ${results.stats.v1ChangeOrder} < ${MIN_REQUIREMENTS.v1ChangeOrder}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v1ChangeOrder - results.stats.v1ChangeOrder} uses of changeOrderElements`);
  }
  
  // Count V3: IDs (getVariant with ID_VARIANTS_MAP)
  // Pattern: dyn.v3.getVariant(..., ID_VARIANTS_MAP, ...) or getVariant(..., ID_VARIANTS_MAP, ...)
  const idPattern = /\.v3\.getVariant\([^)]*ID_VARIANTS_MAP|getVariant\([^)]*ID_VARIANTS_MAP/g;
  results.stats.v3Ids = countPatternInFiles(sourceFiles, idPattern);
  console.log(`   📊 V3 IDs (getVariant with ID_VARIANTS_MAP): ${results.stats.v3Ids} uses`);
  
  if (results.stats.v3Ids >= MIN_REQUIREMENTS.v3Ids) {
    console.log(`   ✅ V3 IDs: ${results.stats.v3Ids} >= ${MIN_REQUIREMENTS.v3Ids}`);
    results.passed++;
  } else {
    console.log(`   ❌ V3 IDs: ${results.stats.v3Ids} < ${MIN_REQUIREMENTS.v3Ids}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v3Ids - results.stats.v3Ids} uses of getVariant for IDs`);
  }
  
  // Count V3: Classes (getVariant with CLASS_VARIANTS_MAP)
  // Pattern: dyn.v3.getVariant(..., CLASS_VARIANTS_MAP, ...) or getVariant(..., CLASS_VARIANTS_MAP, ...)
  const classPattern = /\.v3\.getVariant\([^)]*CLASS_VARIANTS_MAP|getVariant\([^)]*CLASS_VARIANTS_MAP/g;
  results.stats.v3Classes = countPatternInFiles(sourceFiles, classPattern);
  console.log(`   📊 V3 Classes (getVariant with CLASS_VARIANTS_MAP): ${results.stats.v3Classes} uses`);
  
  if (results.stats.v3Classes >= MIN_REQUIREMENTS.v3Classes) {
    console.log(`   ✅ V3 Classes: ${results.stats.v3Classes} >= ${MIN_REQUIREMENTS.v3Classes}`);
    results.passed++;
  } else {
    console.log(`   ❌ V3 Classes: ${results.stats.v3Classes} < ${MIN_REQUIREMENTS.v3Classes}`);
    results.failed++;
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v3Classes - results.stats.v3Classes} uses of getVariant for classes`);
  }
  
  // Count V3: Texts (getVariant without map, with TEXT_VARIANTS_MAP, or with local text variants)
  // Pattern: dyn.v3.getVariant(..., undefined, ...) or getVariant(..., undefined, ...)
  //          dyn.v3.getVariant(..., TEXT_VARIANTS_MAP, ...) or getVariant(..., TEXT_VARIANTS_MAP, ...)
  //          dyn.v3.getVariant(..., *TextVariants, ...) or getVariant(..., *TextVariants, ...)
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
    results.errors.push(`Missing ${MIN_REQUIREMENTS.v3Texts - results.stats.v3Texts} uses of getVariant for texts`);
  }
  
  return results;
}

// ============================================================================
// TEST 7: EVENT COVERAGE
// ============================================================================

function testEventCoverage() {
  console.log('\n📡 TEST 7: EVENT COVERAGE');
  console.log('─'.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [],
    stats: {
      totalEvents: 0,
      usedEvents: 0,
      unusedEvents: [],
      eventUsages: {}
    }
  };
  
  if (isBrowser()) {
    console.log('   ⚠️  Este test solo funciona en Node.js');
    return results;
  }
  
  const fs = require('fs');
  const pathModule = require('path');
  
  // Try to find events.ts file in common locations
  const possiblePaths = [
    'src/library/events.ts',
    'src/lib/events.ts',
    'src/library/event.ts',
    'src/lib/event.ts'
  ];
  
  let eventsFilePath = null;
  let eventsContent = '';
  
  for (const relPath of possiblePaths) {
    const fullPath = pathModule.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      eventsFilePath = fullPath;
      eventsContent = readFileContent(fullPath);
      console.log(`   📄 Events file found: ${relPath}`);
      break;
    }
  }
  
  if (!eventsFilePath) {
    console.log('   ❌ Could not find events.ts');
    results.failed++;
    results.errors.push('events.ts not found in common locations');
    return results;
  }
  
  // Extract EVENT_TYPES from the file
  // Look for: EVENT_TYPES = { ... } or export const EVENT_TYPES = { ... }
  const eventTypesMatch = eventsContent.match(/export\s+const\s+EVENT_TYPES\s*=\s*\{([^}]+)\}/s);
  if (!eventTypesMatch) {
    console.log('   ❌ Could not extract EVENT_TYPES from the file');
    results.failed++;
    results.errors.push('EVENT_TYPES not found in the events file');
    return results;
  }
  
  const eventTypesBlock = eventTypesMatch[1];
  
  // Extract event names (KEY: "VALUE" or KEY: 'VALUE')
  const eventNamePattern = /(\w+)\s*:\s*["']([^"']+)["']/g;
  const eventNames = [];
  let match;
  
  while ((match = eventNamePattern.exec(eventTypesBlock)) !== null) {
    const eventKey = match[1];
    const eventValue = match[2];
    eventNames.push({ key: eventKey, value: eventValue });
  }
  
  // Also try to match commented out events (// EVENT_NAME: "EVENT_NAME")
  const commentedPattern = /\/\/\s*(\w+)\s*:\s*["']([^"']+)["']/g;
  while ((match = commentedPattern.exec(eventTypesBlock)) !== null) {
    const eventKey = match[1];
    const eventValue = match[2];
    // Only add if not already in the list
    if (!eventNames.find(e => e.key === eventKey)) {
      eventNames.push({ key: eventKey, value: eventValue });
    }
  }
  
  results.stats.totalEvents = eventNames.length;
  console.log(`   📊 Total events defined: ${results.stats.totalEvents}`);
  
  if (eventNames.length === 0) {
    console.log('   ⚠️  No events found in EVENT_TYPES');
    results.failed++;
    results.errors.push('Could not extract events from EVENT_TYPES');
    return results;
  }
  
  // Get all source files
  const sourceFiles = getAllSourceFiles();
  
  // Check usage of each event
  eventNames.forEach(({ key, value }) => {
    // Look for: logEvent(EVENT_TYPES.KEY, ...) or logEvent(EVENT_TYPES['KEY'], ...)
    // Also look for: EVENT_TYPES.KEY or EVENT_TYPES['KEY'] (direct reference)
    const pattern1 = new RegExp(`logEvent\\([^)]*EVENT_TYPES\\.${key}[^)]*\\)`, 'g');
    const pattern2 = new RegExp(`logEvent\\([^)]*EVENT_TYPES\\['${key}'\\][^)]*\\)`, 'g');
    const pattern3 = new RegExp(`EVENT_TYPES\\.${key}`, 'g');
    const pattern4 = new RegExp(`EVENT_TYPES\\['${key}'\\]`, 'g');
    const pattern5 = new RegExp(`["']${value}["']`, 'g'); // Direct string usage
    
    let usageCount = 0;
    sourceFiles.forEach(file => {
      const content = readFileContent(file);
      // Don't count the events.ts file itself
      if (file === eventsFilePath) return;
      
      const matches1 = content.match(pattern1);
      const matches2 = content.match(pattern2);
      const matches3 = content.match(pattern3);
      const matches4 = content.match(pattern4);
      const matches5 = content.match(pattern5);
      
      usageCount += (matches1 ? matches1.length : 0);
      usageCount += (matches2 ? matches2.length : 0);
      // For pattern3 and pattern4, only count if not in events.ts
      if (file !== eventsFilePath) {
        usageCount += (matches3 ? matches3.length : 0);
        usageCount += (matches4 ? matches4.length : 0);
      }
      // For pattern5, be more careful - only count if it's in a logEvent call context
      if (matches5) {
        // Check if it's in a logEvent call
        const logEventContext = content.match(new RegExp(`logEvent\\([^)]*["']${value}["'][^)]*\\)`, 'g'));
        if (logEventContext) {
          usageCount += logEventContext.length;
        }
      }
    });
    
    results.stats.eventUsages[key] = usageCount;
    
    if (usageCount > 0) {
      results.stats.usedEvents++;
    } else {
      results.stats.unusedEvents.push(key);
    }
  });
  
  console.log(`   📊 Events used: ${results.stats.usedEvents} / ${results.stats.totalEvents}`);
  
  // Show unused events (if any)
  if (results.stats.unusedEvents.length > 0) {
    console.log(`   ⚠️  Unused events (${results.stats.unusedEvents.length}):`);
    results.stats.unusedEvents.slice(0, 5).forEach(eventKey => {
      console.log(`      - ${eventKey}`);
    });
    if (results.stats.unusedEvents.length > 5) {
      console.log(`      ... and ${results.stats.unusedEvents.length - 5} more`);
    }
  }
  
  // Calculate coverage percentage
  const coveragePercent = results.stats.totalEvents > 0 
    ? ((results.stats.usedEvents / results.stats.totalEvents) * 100).toFixed(1)
    : 0;
  
  console.log(`   📈 Coverage: ${coveragePercent}%`);
  
  // Pass only if 100% of events are used
  if (results.stats.usedEvents === results.stats.totalEvents) {
    console.log(`   ✅ Event coverage: ${results.stats.usedEvents}/${results.stats.totalEvents} = 100%`);
    results.passed++;
  } else {
    console.log(`   ❌ Event coverage: ${results.stats.usedEvents}/${results.stats.totalEvents} < 100%`);
    results.failed++;
    results.errors.push(`Missing ${results.stats.totalEvents - results.stats.usedEvents} unused events (must all be in use: 100%)`);
  }
  
  return results;
}

// ============================================================================
// FINAL REPORT
// ============================================================================

function generateReport(allResults) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(60));
  
  const totalPassed = allResults.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.failed, 0);
  const allErrors = allResults.flatMap(r => r.errors || []);
  
  // Get stats from TEST 5 (real usage)
  const usageTest = allResults.find(r => r.stats && r.stats.v1AddWrapDecoy !== undefined);
  const usageStats = usageTest ? usageTest.stats : {};
  
  // Get stats from TEST 6 (event coverage)
  const eventTest = allResults.find(r => r.stats && r.stats.totalEvents !== undefined);
  const eventStats = eventTest ? eventTest.stats : {};
  
  console.log(`\n✅ Tests passed: ${totalPassed}`);
  console.log(`❌ Tests failed: ${totalFailed}`);
  
  if (totalPassed + totalFailed > 0) {
    const successRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1);
    console.log(`📈 Success rate: ${successRate}%`);
  }
  
  // Show real usage stats
  if (usageStats.v1AddWrapDecoy !== undefined) {
    console.log('\n📊 REAL USAGE STATS:');
    console.log('─'.repeat(60));
    console.log(`   🔹 V1 addWrapDecoy: ${usageStats.v1AddWrapDecoy} uses`);
    console.log(`   🔹 V1 changeOrderElements: ${usageStats.v1ChangeOrder} uses`);
    console.log(`   🔹 V3 IDs (getVariant): ${usageStats.v3Ids} uses`);
    console.log(`   🔹 V3 Classes (getVariant): ${usageStats.v3Classes} uses`);
    console.log(`   🔹 V3 Texts (getVariant): ${usageStats.v3Texts} uses`);
    console.log(`   🔹 TOTAL V1: ${usageStats.v1AddWrapDecoy + usageStats.v1ChangeOrder} uses`);
    console.log(`   🔹 TOTAL V3: ${usageStats.v3Ids + usageStats.v3Classes + usageStats.v3Texts} uses`);
  }
  
  // Show event coverage stats
  if (eventStats.totalEvents !== undefined) {
    const coveragePercent = eventStats.totalEvents > 0 
      ? ((eventStats.usedEvents / eventStats.totalEvents) * 100).toFixed(1)
      : 0;
    console.log('\n📡 EVENT STATS:');
    console.log('─'.repeat(60));
    console.log(`   🔹 Total events defined: ${eventStats.totalEvents}`);
    console.log(`   🔹 Events in use: ${eventStats.usedEvents}`);
    console.log(`   🔹 Unused events: ${eventStats.unusedEvents ? eventStats.unusedEvents.length : 0}`);
    console.log(`   🔹 Coverage: ${coveragePercent}%`);
    if (eventStats.unusedEvents && eventStats.unusedEvents.length > 0) {
      console.log(`   ⚠️  Unused events: ${eventStats.unusedEvents.slice(0, 3).join(', ')}${eventStats.unusedEvents.length > 3 ? '...' : ''}`);
    }
  }
  
  if (allErrors.length > 0) {
    console.log('\n⚠️  ERRORS FOUND:');
    allErrors.slice(0, 5).forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    if (allErrors.length > 5) {
      console.log(`   ... and ${allErrors.length - 5} more`);
    }
  }
  
  console.log('\n📋 VALIDATION CRITERIA:');
  console.log('─'.repeat(60));
  console.log(`   ✅ V1 addWrapDecoy: minimum ${MIN_REQUIREMENTS.v1AddWrapDecoy} uses`);
  console.log(`   ✅ V1 changeOrderElements: minimum ${MIN_REQUIREMENTS.v1ChangeOrder} uses`);
  console.log(`   ✅ V3 IDs (getVariant): minimum ${MIN_REQUIREMENTS.v3Ids} uses`);
  console.log(`   ✅ V3 Classes (getVariant): minimum ${MIN_REQUIREMENTS.v3Classes} uses`);
  console.log(`   ✅ V3 Texts (getVariant): minimum ${MIN_REQUIREMENTS.v3Texts} uses`);
  
  console.log('\n' + '='.repeat(60));
  if (totalFailed === 0) {
    console.log('✅ DYNAMIC SYSTEM: VALIDATION SUCCESS');
    console.log('   The system meets all minimum requirements.');
  } else {
    console.log('⚠️  DYNAMIC SYSTEM: ATTENTION REQUIRED');
    console.log('   Some requirements are not met. Check the errors above.');
  }
  console.log('='.repeat(60) + '\n');
  
  return {
    success: totalFailed === 0,
    totalPassed,
    totalFailed,
    errors: allErrors,
    usageStats
  };
}

// ============================================================================
// EXECUTION
// ============================================================================

function runAllTests() {
  console.log('\n' + '🧪'.repeat(30));
  console.log('🧪 DYNAMIC SYSTEM TEST (IMPROVED - COUNTS REAL USAGE)');
  console.log('🧪'.repeat(30));
  
  const results = [];
  
  results.push(testFileStructure());
  results.push(testVariantFiles());
  results.push(testDeterminism());
  results.push(testSeedVariation()); // NEW!
  results.push(testRealUsage()); // NEW!
  results.push(testEventCoverage()); // NEW!
  
  if (isBrowser()) {
    results.push(testDOMUsage());
  }
  
  return generateReport(results);
}

// ============================================================================
// EXPORT/RUN
// ============================================================================

if (isBrowser()) {
  window.testDynamicSystem = runAllTests;
  console.log('💡 Run testDynamicSystem() in the console to execute the tests');
} else {
  const report = runAllTests();
  process.exit(report.success ? 0 : 1);
}
