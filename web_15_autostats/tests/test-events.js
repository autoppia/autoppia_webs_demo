#!/usr/bin/env node
/**
 * EVENT COVERAGE TEST (AutoStats web_15)
 *
 * Validates that all events defined in EVENT_TYPES are used in the codebase.
 * Requires 100% coverage (all events must be used).
 *
 * USAGE:
 *   node tests/test-events.js
 */

// ============================================================================
// UTILITIES
// ============================================================================

function isBrowser() {
  return typeof window !== 'undefined';
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
        } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.includes('test-')) {
          fileList.push(filePath);
        }
      } catch (err) {
        // Skip
      }
    });
    return fileList;
  }

  if (fs.existsSync(srcDir)) {
    return walkDir(srcDir);
  }
  return [];
}

// ============================================================================
// TEST: EVENT COVERAGE
// ============================================================================

function testEventCoverage() {
  console.log('\n' + '📡'.repeat(30));
  console.log('📡 EVENT COVERAGE TEST (AutoStats)');
  console.log('📡'.repeat(30));

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
    console.log('   ⚠️  This test only works in Node.js');
    return results;
  }

  const pathModule = require('path');

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
    if (require('fs').existsSync(fullPath)) {
      eventsFilePath = fullPath;
      eventsContent = readFileContent(fullPath);
      console.log(`\n📄 Events file found: ${relPath}`);
      break;
    }
  }

  if (!eventsFilePath) {
    console.log('\n❌ events.ts file not found');
    possiblePaths.forEach(p => console.log(`      - ${p}`));
    results.failed++;
    results.errors.push('events.ts not found in common locations');
    return results;
  }

  const eventTypesMatch = eventsContent.match(/export\s+const\s+EVENT_TYPES\s*=\s*\{([^}]+)\}/s);
  if (!eventTypesMatch) {
    console.log('\n❌ Could not extract EVENT_TYPES from the file');
    results.failed++;
    results.errors.push('EVENT_TYPES not found in the events file');
    return results;
  }

  const eventTypesBlock = eventTypesMatch[1];
  const eventNamePattern = /(\w+)\s*:\s*["']([^"']+)["']/g;
  const eventNames = [];
  let match;

  while ((match = eventNamePattern.exec(eventTypesBlock)) !== null) {
    eventNames.push({ key: match[1], value: match[2] });
  }

  const commentedPattern = /\/\/\s*(\w+)\s*:\s*["']([^"']+)["']/g;
  while ((match = commentedPattern.exec(eventTypesBlock)) !== null) {
    if (!eventNames.find(e => e.key === match[1])) {
      eventNames.push({ key: match[1], value: match[2] });
    }
  }

  results.stats.totalEvents = eventNames.length;
  console.log(`\n📊 Total events defined: ${results.stats.totalEvents}`);

  if (eventNames.length === 0) {
    console.log('\n⚠️  No events found in EVENT_TYPES');
    results.failed++;
    results.errors.push('Could not extract events from EVENT_TYPES');
    return results;
  }

  const sourceFiles = getAllSourceFiles();
  console.log(`📂 Source files analyzed: ${sourceFiles.length}`);

  eventNames.forEach(({ key, value }) => {
    const pattern1 = new RegExp(`logEvent\\([^)]*EVENT_TYPES\\.${key}[^)]*\\)`, 'g');
    const pattern2 = new RegExp(`logEvent\\([^)]*EVENT_TYPES\\['${key}'\\][^)]*\\)`, 'g');
    const pattern3 = new RegExp(`EVENT_TYPES\\.${key}`, 'g');
    const pattern4 = new RegExp(`EVENT_TYPES\\['${key}'\\]`, 'g');

    let usageCount = 0;
    sourceFiles.forEach(file => {
      if (file === eventsFilePath) return;
      const content = readFileContent(file);
      usageCount += (content.match(pattern1) || []).length;
      usageCount += (content.match(pattern2) || []).length;
      usageCount += (content.match(pattern3) || []).length;
      usageCount += (content.match(pattern4) || []).length;
      const logEventContext = content.match(new RegExp(`logEvent\\([^)]*["']${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^)]*\\)`, 'g'));
      if (logEventContext) usageCount += logEventContext.length;
    });

    results.stats.eventUsages[key] = usageCount;
    if (usageCount > 0) {
      results.stats.usedEvents++;
    } else {
      results.stats.unusedEvents.push(key);
    }
  });

  console.log(`\n📊 Events used: ${results.stats.usedEvents} / ${results.stats.totalEvents}`);
  const coveragePercent = results.stats.totalEvents > 0
    ? ((results.stats.usedEvents / results.stats.totalEvents) * 100).toFixed(1)
    : 0;
  console.log(`📈 Coverage: ${coveragePercent}%`);

  if (results.stats.unusedEvents.length > 0) {
    console.log(`\n⚠️  Unused events (${results.stats.unusedEvents.length}):`);
    results.stats.unusedEvents.forEach(eventKey => {
      const eventInfo = eventNames.find(e => e.key === eventKey);
      console.log(`   ❌ ${eventKey} (${eventInfo ? eventInfo.value : 'N/A'})`);
    });
  }

  if (results.stats.usedEvents === results.stats.totalEvents) {
    console.log(`\n✅ Event coverage: ${results.stats.usedEvents}/${results.stats.totalEvents} = 100%`);
    results.passed++;
  } else {
    console.log(`\n❌ Event coverage: ${results.stats.usedEvents}/${results.stats.totalEvents} < 100%`);
    results.failed++;
    results.errors.push(`Missing ${results.stats.totalEvents - results.stats.usedEvents} unused events (must all be in use: 100%)`);
  }

  return results;
}

// ============================================================================
// REPORT
// ============================================================================

function generateReport(result) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`\n✅ Tests passed: ${result.passed}`);
  console.log(`❌ Tests failed: ${result.failed}`);
  console.log('\n📡 EVENT STATS:');
  console.log('─'.repeat(60));
  console.log(`   🔹 Total events defined: ${result.stats.totalEvents}`);
  console.log(`   🔹 Events in use: ${result.stats.usedEvents}`);
  console.log(`   🔹 Unused events: ${result.stats.unusedEvents.length}`);
  const coveragePercent = result.stats.totalEvents > 0
    ? ((result.stats.usedEvents / result.stats.totalEvents) * 100).toFixed(1)
    : 0;
  console.log(`   🔹 Coverage: ${coveragePercent}%`);
  if (result.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    result.errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
  }
  console.log('\n' + '='.repeat(60));
  if (result.failed === 0) {
    console.log('✅ EVENT COVERAGE: 100% - VALIDATION SUCCESS');
  } else {
    console.log('❌ EVENT COVERAGE: ATTENTION REQUIRED');
  }
  console.log('='.repeat(60) + '\n');
  return {
    success: result.failed === 0,
    totalPassed: result.passed,
    totalFailed: result.failed,
    errors: result.errors,
    stats: result.stats
  };
}

// ============================================================================
// EXECUTION
// ============================================================================

if (isBrowser()) {
  if (typeof window !== 'undefined') {
    window.testEvents = () => generateReport(testEventCoverage());
    console.log('💡 Run testEvents() in the console to run the test');
  }
} else {
  const result = testEventCoverage();
  const report = generateReport(result);
  process.exit(report.success ? 0 : 1);
}
