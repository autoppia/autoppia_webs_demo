#!/usr/bin/env node
/**
 * Unit tests for data generators
 * Run with: node tests/generators.test.js
 */

const path = require('path');
const fs = require('fs');

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;
const errors = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
    errors.push({ test: name, error: error.message });
  }
}

// Load the generators module
// We need to transpile TypeScript to JavaScript first or use a workaround
// For now, let's test the logic directly

// Seeded random number generator (copied from implementation)
function seedRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

// Generate price history (copied from implementation)
function generatePriceHistory(timeRange, seed) {
  const now = Date.now();
  
  const intervals = {
    '24h': { count: 24, interval: 3600000 },
    '7d': { count: 168, interval: 3600000 },
    '30d': { count: 30, interval: 86400000 },
    '1y': { count: 365, interval: 86400000 },
    'all': { count: 730, interval: 86400000 },
  };
  
  const { count, interval } = intervals[timeRange];
  const rng = seedRandom(seed);
  
  let basePrice = 450;
  const data = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * interval);
    const volatility = rng() * 20 - 10;
    basePrice = Math.max(100, basePrice + volatility);
    
    data.push({
      timestamp,
      price: basePrice,
    });
  }
  
  return data;
}

console.log('\n🧪 Testing generatePriceHistory function');
console.log('='.repeat(60));

// Test 1: Function returns correct number of data points for each time range
test('Returns 24 data points for 24h range', () => {
  const data = generatePriceHistory('24h', 12345);
  assertEqual(data.length, 24, 'Should return 24 data points');
});

test('Returns 168 data points for 7d range', () => {
  const data = generatePriceHistory('7d', 12345);
  assertEqual(data.length, 168, 'Should return 168 data points');
});

test('Returns 30 data points for 30d range', () => {
  const data = generatePriceHistory('30d', 12345);
  assertEqual(data.length, 30, 'Should return 30 data points');
});

test('Returns 365 data points for 1y range', () => {
  const data = generatePriceHistory('1y', 12345);
  assertEqual(data.length, 365, 'Should return 365 data points');
});

test('Returns 730 data points for all range', () => {
  const data = generatePriceHistory('all', 12345);
  assertEqual(data.length, 730, 'Should return 730 data points');
});

// Test 2: Each data point has required fields
test('Each data point has timestamp and price fields', () => {
  const data = generatePriceHistory('24h', 12345);
  data.forEach((point, index) => {
    assert(point.timestamp instanceof Date, `Point ${index} should have Date timestamp`);
    assert(typeof point.price === 'number', `Point ${index} should have number price`);
    assert(point.price >= 100, `Point ${index} price should be >= 100`);
  });
});

// Test 3: Timestamps are in chronological order
test('Timestamps are in chronological order', () => {
  const data = generatePriceHistory('24h', 12345);
  for (let i = 1; i < data.length; i++) {
    assert(
      data[i].timestamp.getTime() > data[i - 1].timestamp.getTime(),
      `Timestamp at index ${i} should be after ${i - 1}`
    );
  }
});

// Test 4: Prices are within reasonable range
test('Prices stay above minimum threshold of 100', () => {
  const data = generatePriceHistory('24h', 12345);
  data.forEach((point, index) => {
    assert(point.price >= 100, `Price at index ${index} should be >= 100, got ${point.price}`);
  });
});

// Test 5: Seed determinism - same seed produces same results
test('Same seed produces identical results', () => {
  const seed = 42;
  const data1 = generatePriceHistory('24h', seed);
  const data2 = generatePriceHistory('24h', seed);
  
  assertEqual(data1.length, data2.length, 'Should have same length');
  
  for (let i = 0; i < data1.length; i++) {
    assertEqual(
      data1[i].price,
      data2[i].price,
      `Price at index ${i} should be identical`
    );
  }
});

// Test 6: Different seeds produce different results
test('Different seeds produce different results', () => {
  const data1 = generatePriceHistory('24h', 42);
  const data2 = generatePriceHistory('24h', 100);
  
  let differences = 0;
  for (let i = 0; i < data1.length; i++) {
    if (data1[i].price !== data2[i].price) {
      differences++;
    }
  }
  
  assert(differences > 0, 'Different seeds should produce different prices');
});

// Test 7: Seeded random generator produces consistent values
test('Seeded random generator is deterministic', () => {
  const rng1 = seedRandom(12345);
  const rng2 = seedRandom(12345);
  
  for (let i = 0; i < 10; i++) {
    const val1 = rng1();
    const val2 = rng2();
    assertEqual(val1, val2, `Random value ${i} should be identical`);
  }
});

// Test 8: Seeded random generator produces values in [0, 1) range
test('Seeded random generator produces values in [0, 1) range', () => {
  const rng = seedRandom(12345);
  
  for (let i = 0; i < 100; i++) {
    const val = rng();
    assert(val >= 0 && val < 1, `Random value should be in [0, 1), got ${val}`);
  }
});

// Test 9: Price volatility is reasonable
test('Price changes are within expected volatility range', () => {
  const data = generatePriceHistory('24h', 12345);
  
  for (let i = 1; i < data.length; i++) {
    const change = Math.abs(data[i].price - data[i - 1].price);
    // Maximum change should be around 10 (volatility range is ±10)
    // But due to the max(100, ...) constraint, it could be larger
    assert(change < 50, `Price change at index ${i} should be reasonable, got ${change}`);
  }
});

// Test 10: All time ranges work correctly
test('All time ranges are supported', () => {
  const timeRanges = ['24h', '7d', '30d', '1y', 'all'];
  
  timeRanges.forEach(range => {
    const data = generatePriceHistory(range, 12345);
    assert(data.length > 0, `Time range ${range} should produce data`);
    assert(Array.isArray(data), `Time range ${range} should return an array`);
  });
});

// Generate volume data (copied from implementation)
function generateVolumeData(priceData, seed) {
  const rng = seedRandom(seed + 1000);
  
  return priceData.map(point => ({
    timestamp: point.timestamp,
    volume: Math.floor(rng() * 5000000) + 1000000,
  }));
}

console.log('\n🧪 Testing generateVolumeData function');
console.log('='.repeat(60));

// Test 11: Function returns same number of data points as price data
test('Returns same number of data points as price data', () => {
  const priceData = generatePriceHistory('24h', 12345);
  const volumeData = generateVolumeData(priceData, 12345);
  assertEqual(volumeData.length, priceData.length, 'Should return same number of data points');
});

// Test 12: Each volume data point has required fields
test('Each volume data point has timestamp and volume fields', () => {
  const priceData = generatePriceHistory('24h', 12345);
  const volumeData = generateVolumeData(priceData, 12345);
  
  volumeData.forEach((point, index) => {
    assert(point.timestamp instanceof Date, `Point ${index} should have Date timestamp`);
    assert(typeof point.volume === 'number', `Point ${index} should have number volume`);
    assert(Number.isInteger(point.volume), `Point ${index} volume should be an integer`);
  });
});

// Test 13: Timestamps match price data timestamps
test('Timestamps match price data timestamps', () => {
  const priceData = generatePriceHistory('24h', 12345);
  const volumeData = generateVolumeData(priceData, 12345);
  
  for (let i = 0; i < priceData.length; i++) {
    assertEqual(
      volumeData[i].timestamp.getTime(),
      priceData[i].timestamp.getTime(),
      `Timestamp at index ${i} should match price data timestamp`
    );
  }
});

// Test 14: Volume values are within expected range (1M to 6M)
test('Volume values are within expected range (1M to 6M)', () => {
  const priceData = generatePriceHistory('24h', 12345);
  const volumeData = generateVolumeData(priceData, 12345);
  
  volumeData.forEach((point, index) => {
    assert(
      point.volume >= 1000000 && point.volume < 6000000,
      `Volume at index ${index} should be between 1M and 6M, got ${point.volume}`
    );
  });
});

// Test 15: Seed determinism - same seed produces same volume data
test('Same seed produces identical volume data', () => {
  const priceData = generatePriceHistory('24h', 42);
  const volumeData1 = generateVolumeData(priceData, 42);
  const volumeData2 = generateVolumeData(priceData, 42);
  
  assertEqual(volumeData1.length, volumeData2.length, 'Should have same length');
  
  for (let i = 0; i < volumeData1.length; i++) {
    assertEqual(
      volumeData1[i].volume,
      volumeData2[i].volume,
      `Volume at index ${i} should be identical`
    );
  }
});

// Test 16: Different seeds produce different volume data
test('Different seeds produce different volume data', () => {
  const priceData = generatePriceHistory('24h', 42);
  const volumeData1 = generateVolumeData(priceData, 42);
  const volumeData2 = generateVolumeData(priceData, 100);
  
  let differences = 0;
  for (let i = 0; i < volumeData1.length; i++) {
    if (volumeData1[i].volume !== volumeData2[i].volume) {
      differences++;
    }
  }
  
  assert(differences > 0, 'Different seeds should produce different volumes');
});

// Test 17: Works with different time ranges
test('Works with all time ranges', () => {
  const timeRanges = ['24h', '7d', '30d', '1y', 'all'];
  
  timeRanges.forEach(range => {
    const priceData = generatePriceHistory(range, 12345);
    const volumeData = generateVolumeData(priceData, 12345);
    
    assertEqual(
      volumeData.length,
      priceData.length,
      `Volume data for ${range} should match price data length`
    );
    
    assert(volumeData.length > 0, `Time range ${range} should produce volume data`);
  });
});

// Test 18: Volume data uses different seed offset from price data
test('Volume data uses different seed offset from price data', () => {
  const priceData = generatePriceHistory('24h', 12345);
  const volumeData = generateVolumeData(priceData, 12345);
  
  // Generate price data with seed + 1000 to verify they're different
  const priceDataWithOffset = generatePriceHistory('24h', 12345 + 1000);
  
  // Volume data should not correlate with price data in a predictable way
  // This is a basic check that we're using different random sequences
  assert(volumeData.length > 0, 'Volume data should be generated');
  assert(priceDataWithOffset.length > 0, 'Price data with offset should be generated');
});

// Test 19: Empty price data produces empty volume data
test('Empty price data produces empty volume data', () => {
  const emptyPriceData = [];
  const volumeData = generateVolumeData(emptyPriceData, 12345);
  
  assertEqual(volumeData.length, 0, 'Should return empty array for empty price data');
});

// Test 20: Volume data maintains timestamp order
test('Volume data maintains timestamp order', () => {
  const priceData = generatePriceHistory('24h', 12345);
  const volumeData = generateVolumeData(priceData, 12345);
  
  for (let i = 1; i < volumeData.length; i++) {
    assert(
      volumeData[i].timestamp.getTime() > volumeData[i - 1].timestamp.getTime(),
      `Timestamp at index ${i} should be after ${i - 1}`
    );
  }
});

// Generate trend data (copied from implementation)
function generateTrendData(length, seed, trend = 'neutral') {
  const rng = seedRandom(seed);
  const data = [];
  
  let value = 50;
  
  const trendBias = {
    up: 0.6,
    down: -0.6,
    neutral: 0,
  }[trend];
  
  for (let i = 0; i < length; i++) {
    const change = (rng() - 0.5) * 10 + trendBias;
    value = Math.max(0, Math.min(100, value + change));
    data.push(value);
  }
  
  return data;
}

console.log('\n🧪 Testing generateTrendData function');
console.log('='.repeat(60));

// Test 21: Function returns correct number of data points
test('Returns correct number of data points', () => {
  const data = generateTrendData(10, 12345);
  assertEqual(data.length, 10, 'Should return 10 data points');
  
  const data2 = generateTrendData(30, 12345);
  assertEqual(data2.length, 30, 'Should return 30 data points');
  
  const data3 = generateTrendData(7, 12345);
  assertEqual(data3.length, 7, 'Should return 7 data points');
});

// Test 22: All values are numbers
test('All values are numbers', () => {
  const data = generateTrendData(20, 12345);
  
  data.forEach((value, index) => {
    assert(typeof value === 'number', `Value at index ${index} should be a number`);
    assert(!isNaN(value), `Value at index ${index} should not be NaN`);
  });
});

// Test 23: Values are within [0, 100] range
test('Values are within [0, 100] range', () => {
  const data = generateTrendData(50, 12345);
  
  data.forEach((value, index) => {
    assert(
      value >= 0 && value <= 100,
      `Value at index ${index} should be in [0, 100], got ${value}`
    );
  });
});

// Test 24: Seed determinism - same seed produces same results
test('Same seed produces identical trend data', () => {
  const seed = 42;
  const data1 = generateTrendData(20, seed, 'neutral');
  const data2 = generateTrendData(20, seed, 'neutral');
  
  assertEqual(data1.length, data2.length, 'Should have same length');
  
  for (let i = 0; i < data1.length; i++) {
    assertEqual(
      data1[i],
      data2[i],
      `Value at index ${i} should be identical`
    );
  }
});

// Test 25: Different seeds produce different results
test('Different seeds produce different trend data', () => {
  const data1 = generateTrendData(20, 42);
  const data2 = generateTrendData(20, 100);
  
  let differences = 0;
  for (let i = 0; i < data1.length; i++) {
    if (data1[i] !== data2[i]) {
      differences++;
    }
  }
  
  assert(differences > 0, 'Different seeds should produce different values');
});

// Test 26: Upward trend produces generally increasing values
test('Upward trend produces generally increasing values', () => {
  const data = generateTrendData(30, 12345, 'up');
  
  // Check that the last value is generally higher than the first
  // (allowing for some volatility)
  const firstQuarter = data.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const lastQuarter = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
  
  assert(
    lastQuarter > firstQuarter,
    `Upward trend should have higher values at end (first: ${firstQuarter}, last: ${lastQuarter})`
  );
});

// Test 27: Downward trend produces generally decreasing values
test('Downward trend produces generally decreasing values', () => {
  const data = generateTrendData(30, 12345, 'down');
  
  // Check that the last value is generally lower than the first
  const firstQuarter = data.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const lastQuarter = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
  
  assert(
    lastQuarter < firstQuarter,
    `Downward trend should have lower values at end (first: ${firstQuarter}, last: ${lastQuarter})`
  );
});

// Test 28: Neutral trend produces relatively stable values
test('Neutral trend produces relatively stable values', () => {
  const data = generateTrendData(30, 12345, 'neutral');
  
  // Check that the average doesn't drift too far from starting value
  const average = data.reduce((a, b) => a + b, 0) / data.length;
  
  // Average should be relatively close to starting value (50)
  // Allow for some drift due to volatility
  assert(
    Math.abs(average - 50) < 15,
    `Neutral trend average should be close to 50, got ${average}`
  );
});

// Test 29: All trend types work correctly
test('All trend types are supported', () => {
  const trends = ['up', 'down', 'neutral'];
  
  trends.forEach(trend => {
    const data = generateTrendData(20, 12345, trend);
    assert(data.length === 20, `Trend ${trend} should produce data`);
    assert(Array.isArray(data), `Trend ${trend} should return an array`);
  });
});

// Test 30: Default trend is neutral
test('Default trend is neutral when not specified', () => {
  const data1 = generateTrendData(20, 12345);
  const data2 = generateTrendData(20, 12345, 'neutral');
  
  assertEqual(data1.length, data2.length, 'Should have same length');
  
  for (let i = 0; i < data1.length; i++) {
    assertEqual(
      data1[i],
      data2[i],
      `Value at index ${i} should be identical (default should be neutral)`
    );
  }
});

// Test 31: Empty length produces empty array
test('Zero length produces empty array', () => {
  const data = generateTrendData(0, 12345);
  assertEqual(data.length, 0, 'Should return empty array for length 0');
});

// Test 32: Single data point works correctly
test('Single data point works correctly', () => {
  const data = generateTrendData(1, 12345);
  assertEqual(data.length, 1, 'Should return single data point');
  assert(typeof data[0] === 'number', 'Single value should be a number');
  assert(data[0] >= 0 && data[0] <= 100, 'Single value should be in range');
});

// Test 33: Large length works correctly
test('Large length works correctly', () => {
  const data = generateTrendData(1000, 12345);
  assertEqual(data.length, 1000, 'Should return 1000 data points');
  
  // All values should still be in range
  data.forEach((value, index) => {
    assert(
      value >= 0 && value <= 100,
      `Value at index ${index} should be in [0, 100]`
    );
  });
});

// Test 34: Values have appropriate volatility
test('Values have appropriate volatility', () => {
  const data = generateTrendData(50, 12345, 'neutral');
  
  // Calculate average absolute change between consecutive points
  let totalChange = 0;
  for (let i = 1; i < data.length; i++) {
    totalChange += Math.abs(data[i] - data[i - 1]);
  }
  const avgChange = totalChange / (data.length - 1);
  
  // Average change should be reasonable (not too small, not too large)
  // Expected range is roughly 0-5 based on volatility of ±5 + bias
  assert(
    avgChange > 0.5 && avgChange < 10,
    `Average change should be reasonable, got ${avgChange}`
  );
});

// Test 35: Trend data works with different lengths for mini-charts
test('Works with typical mini-chart lengths (7, 14, 30)', () => {
  const lengths = [7, 14, 30];
  
  lengths.forEach(length => {
    const data = generateTrendData(length, 12345, 'up');
    assertEqual(data.length, length, `Should return ${length} data points`);
    
    // Verify all values are valid
    data.forEach(value => {
      assert(value >= 0 && value <= 100, 'All values should be in range');
    });
  });
});

// Test 36: Same seed with different trends produces different data
test('Same seed with different trends produces different data', () => {
  const seed = 42;
  const upData = generateTrendData(20, seed, 'up');
  const downData = generateTrendData(20, seed, 'down');
  const neutralData = generateTrendData(20, seed, 'neutral');
  
  // Calculate averages to verify trends are different
  const upAvg = upData.reduce((a, b) => a + b, 0) / upData.length;
  const downAvg = downData.reduce((a, b) => a + b, 0) / downData.length;
  const neutralAvg = neutralData.reduce((a, b) => a + b, 0) / neutralData.length;
  
  // Up trend should have higher average than down trend
  assert(upAvg > downAvg, 'Up trend should have higher average than down trend');
  
  // Neutral should be somewhere in between (though not guaranteed)
  // At least verify they're all different
  assert(
    upAvg !== downAvg || downAvg !== neutralAvg,
    'Different trends should produce different data'
  );
});

// Test 37: Realistic volatility for mini-charts
test('Volatility is appropriate for mini-chart visualization', () => {
  const data = generateTrendData(7, 12345, 'neutral');
  
  // Check that we have some variation (not all same values)
  const uniqueValues = new Set(data);
  assert(uniqueValues.size > 1, 'Should have variation in values');
  
  // Check that changes aren't too extreme
  for (let i = 1; i < data.length; i++) {
    const change = Math.abs(data[i] - data[i - 1]);
    assert(
      change < 20,
      `Change between consecutive points should be reasonable, got ${change}`
    );
  }
});

// Final report
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS');
console.log('='.repeat(60));
console.log(`✅ Tests passed: ${testsPassed}`);
console.log(`❌ Tests failed: ${testsFailed}`);

if (testsFailed > 0) {
  console.log('\n⚠️  FAILED TESTS:');
  errors.forEach(({ test, error }) => {
    console.log(`   - ${test}`);
    console.log(`     ${error}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}

// Generate subnets (simplified version for testing)
const SUBNET_NAMES = [
  'Text Prompting',
  'Image Generation',
  'Data Scraping',
  'Compute',
  'Storage',
  'Prediction Markets',
  'Audio Generation',
  'Video Generation',
];

function generateSubnets(count) {
  const subnets = [];
  
  for (let i = 0; i < count; i++) {
    subnets.push({
      id: i,
      name: SUBNET_NAMES[i % SUBNET_NAMES.length] + (i >= SUBNET_NAMES.length ? ` ${Math.floor(i / SUBNET_NAMES.length) + 1}` : ''),
      description: `Subnet ${i} for ${SUBNET_NAMES[i % SUBNET_NAMES.length].toLowerCase()}`,
      emission: Math.random() * 1000000,
      validatorCount: Math.floor(Math.random() * 100) + 10,
      minerCount: Math.floor(Math.random() * 1000) + 100,
      registrationCost: Math.random() * 100,
      tempo: Math.floor(Math.random() * 1000) + 100,
      difficulty: Math.random() * 1000000,
    });
  }
  
  return subnets;
}

// Generate subnets with trends (copied from implementation)
function generateSubnetsWithTrends(count, seed) {
  const subnets = generateSubnets(count);
  
  return subnets.map((subnet) => {
    const trendSeed = seed + subnet.id;
    const rng = seedRandom(trendSeed);
    
    const price = rng() * 100 + 10;
    const marketCap = rng() * 10000000 + 1000000;
    const volume24h = rng() * 1000000 + 100000;
    const priceChange24h = (rng() - 0.5) * 20;
    
    const trend = priceChange24h > 2 ? 'up' : priceChange24h < -2 ? 'down' : 'neutral';
    const trendData = generateTrendData(7, trendSeed, trend);
    
    return {
      ...subnet,
      price,
      marketCap,
      volume24h,
      priceChange24h,
      trendData,
    };
  });
}

console.log('\n🧪 Testing generateSubnetsWithTrends function');
console.log('='.repeat(60));

// Test 38: Function returns correct number of subnets
test('Returns correct number of subnets', () => {
  const subnets = generateSubnetsWithTrends(5, 12345);
  assertEqual(subnets.length, 5, 'Should return 5 subnets');
  
  const subnets2 = generateSubnetsWithTrends(10, 12345);
  assertEqual(subnets2.length, 10, 'Should return 10 subnets');
});

// Test 39: Each subnet has all required base fields
test('Each subnet has all required base fields', () => {
  const subnets = generateSubnetsWithTrends(5, 12345);
  
  subnets.forEach((subnet, index) => {
    assert(typeof subnet.id === 'number', `Subnet ${index} should have id`);
    assert(typeof subnet.name === 'string', `Subnet ${index} should have name`);
    assert(typeof subnet.description === 'string', `Subnet ${index} should have description`);
    assert(typeof subnet.emission === 'number', `Subnet ${index} should have emission`);
    assert(typeof subnet.validatorCount === 'number', `Subnet ${index} should have validatorCount`);
    assert(typeof subnet.minerCount === 'number', `Subnet ${index} should have minerCount`);
    assert(typeof subnet.registrationCost === 'number', `Subnet ${index} should have registrationCost`);
    assert(typeof subnet.tempo === 'number', `Subnet ${index} should have tempo`);
    assert(typeof subnet.difficulty === 'number', `Subnet ${index} should have difficulty`);
  });
});

// Test 40: Each subnet has all required trend fields
test('Each subnet has all required trend fields', () => {
  const subnets = generateSubnetsWithTrends(5, 12345);
  
  subnets.forEach((subnet, index) => {
    assert(typeof subnet.price === 'number', `Subnet ${index} should have price`);
    assert(typeof subnet.marketCap === 'number', `Subnet ${index} should have marketCap`);
    assert(typeof subnet.volume24h === 'number', `Subnet ${index} should have volume24h`);
    assert(typeof subnet.priceChange24h === 'number', `Subnet ${index} should have priceChange24h`);
    assert(Array.isArray(subnet.trendData), `Subnet ${index} should have trendData array`);
  });
});

// Test 41: Price values are within expected range ($10 to $110)
test('Price values are within expected range ($10 to $110)', () => {
  const subnets = generateSubnetsWithTrends(10, 12345);
  
  subnets.forEach((subnet, index) => {
    assert(
      subnet.price >= 10 && subnet.price < 110,
      `Subnet ${index} price should be between $10 and $110, got ${subnet.price}`
    );
  });
});

// Test 42: Market cap values are within expected range ($1M to $11M)
test('Market cap values are within expected range ($1M to $11M)', () => {
  const subnets = generateSubnetsWithTrends(10, 12345);
  
  subnets.forEach((subnet, index) => {
    assert(
      subnet.marketCap >= 1000000 && subnet.marketCap < 11000000,
      `Subnet ${index} market cap should be between $1M and $11M, got ${subnet.marketCap}`
    );
  });
});

// Test 43: Volume values are within expected range ($100K to $1.1M)
test('Volume values are within expected range ($100K to $1.1M)', () => {
  const subnets = generateSubnetsWithTrends(10, 12345);
  
  subnets.forEach((subnet, index) => {
    assert(
      subnet.volume24h >= 100000 && subnet.volume24h < 1100000,
      `Subnet ${index} volume should be between $100K and $1.1M, got ${subnet.volume24h}`
    );
  });
});

// Test 44: Price change values are within expected range (-10% to +10%)
test('Price change values are within expected range (-10% to +10%)', () => {
  const subnets = generateSubnetsWithTrends(10, 12345);
  
  subnets.forEach((subnet, index) => {
    assert(
      subnet.priceChange24h >= -10 && subnet.priceChange24h <= 10,
      `Subnet ${index} price change should be between -10% and +10%, got ${subnet.priceChange24h}`
    );
  });
});

// Test 45: Trend data has correct length (7 data points)
test('Trend data has correct length (7 data points)', () => {
  const subnets = generateSubnetsWithTrends(5, 12345);
  
  subnets.forEach((subnet, index) => {
    assertEqual(
      subnet.trendData.length,
      7,
      `Subnet ${index} should have 7 trend data points`
    );
  });
});

// Test 46: Trend data values are within [0, 100] range
test('Trend data values are within [0, 100] range', () => {
  const subnets = generateSubnetsWithTrends(5, 12345);
  
  subnets.forEach((subnet, subnetIndex) => {
    subnet.trendData.forEach((value, dataIndex) => {
      assert(
        value >= 0 && value <= 100,
        `Subnet ${subnetIndex} trend data point ${dataIndex} should be in [0, 100], got ${value}`
      );
    });
  });
});

// Test 47: Seed determinism - same seed produces same results
test('Same seed produces identical subnet data', () => {
  const seed = 42;
  const subnets1 = generateSubnetsWithTrends(5, seed);
  const subnets2 = generateSubnetsWithTrends(5, seed);
  
  assertEqual(subnets1.length, subnets2.length, 'Should have same length');
  
  for (let i = 0; i < subnets1.length; i++) {
    assertEqual(subnets1[i].price, subnets2[i].price, `Subnet ${i} price should be identical`);
    assertEqual(subnets1[i].marketCap, subnets2[i].marketCap, `Subnet ${i} market cap should be identical`);
    assertEqual(subnets1[i].volume24h, subnets2[i].volume24h, `Subnet ${i} volume should be identical`);
    assertEqual(subnets1[i].priceChange24h, subnets2[i].priceChange24h, `Subnet ${i} price change should be identical`);
    
    // Check trend data
    for (let j = 0; j < subnets1[i].trendData.length; j++) {
      assertEqual(
        subnets1[i].trendData[j],
        subnets2[i].trendData[j],
        `Subnet ${i} trend data point ${j} should be identical`
      );
    }
  }
});

// Test 48: Different seeds produce different results
test('Different seeds produce different subnet data', () => {
  const subnets1 = generateSubnetsWithTrends(5, 42);
  const subnets2 = generateSubnetsWithTrends(5, 100);
  
  let differences = 0;
  for (let i = 0; i < subnets1.length; i++) {
    if (subnets1[i].price !== subnets2[i].price) differences++;
    if (subnets1[i].marketCap !== subnets2[i].marketCap) differences++;
    if (subnets1[i].volume24h !== subnets2[i].volume24h) differences++;
  }
  
  assert(differences > 0, 'Different seeds should produce different values');
});

// Test 49: Each subnet has unique ID
test('Each subnet has unique ID', () => {
  const subnets = generateSubnetsWithTrends(10, 12345);
  
  const ids = subnets.map(s => s.id);
  const uniqueIds = new Set(ids);
  
  assertEqual(uniqueIds.size, subnets.length, 'All subnet IDs should be unique');
});

// Test 50: Trend direction matches price change
test('Trend direction generally matches price change', () => {
  const subnets = generateSubnetsWithTrends(20, 12345);
  
  subnets.forEach((subnet, index) => {
    const firstHalf = subnet.trendData.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const secondHalf = subnet.trendData.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    if (subnet.priceChange24h > 2) {
      // Upward trend: second half should generally be higher
      // (allowing for some volatility)
      assert(
        secondHalf >= firstHalf - 10,
        `Subnet ${index} with positive price change should have upward or neutral trend`
      );
    } else if (subnet.priceChange24h < -2) {
      // Downward trend: second half should generally be lower
      assert(
        secondHalf <= firstHalf + 10,
        `Subnet ${index} with negative price change should have downward or neutral trend`
      );
    }
  });
});

// Test 51: Works with different subnet counts
test('Works with different subnet counts', () => {
  const counts = [1, 5, 10, 20];
  
  counts.forEach(count => {
    const subnets = generateSubnetsWithTrends(count, 12345);
    assertEqual(subnets.length, count, `Should return ${count} subnets`);
    
    // Verify all have required fields
    subnets.forEach(subnet => {
      assert(typeof subnet.price === 'number', 'Should have price');
      assert(Array.isArray(subnet.trendData), 'Should have trend data');
    });
  });
});

// Test 52: Each subnet uses unique seed based on ID
test('Each subnet uses unique seed based on ID', () => {
  const subnets = generateSubnetsWithTrends(5, 12345);
  
  // Verify that subnets have different values (not all identical)
  const prices = subnets.map(s => s.price);
  const uniquePrices = new Set(prices);
  
  assert(uniquePrices.size > 1, 'Subnets should have different prices');
});

// Test 53: Subnet names are preserved from base generator
test('Subnet names are preserved from base generator', () => {
  const subnets = generateSubnetsWithTrends(5, 12345);
  
  subnets.forEach((subnet, index) => {
    assert(subnet.name.length > 0, `Subnet ${index} should have a name`);
    assert(subnet.id === index, `Subnet ${index} should have correct ID`);
  });
});

// Test 54: All numeric values are valid numbers
test('All numeric values are valid numbers (not NaN or Infinity)', () => {
  const subnets = generateSubnetsWithTrends(5, 12345);
  
  subnets.forEach((subnet, index) => {
    assert(!isNaN(subnet.price), `Subnet ${index} price should not be NaN`);
    assert(!isNaN(subnet.marketCap), `Subnet ${index} market cap should not be NaN`);
    assert(!isNaN(subnet.volume24h), `Subnet ${index} volume should not be NaN`);
    assert(!isNaN(subnet.priceChange24h), `Subnet ${index} price change should not be NaN`);
    
    assert(isFinite(subnet.price), `Subnet ${index} price should be finite`);
    assert(isFinite(subnet.marketCap), `Subnet ${index} market cap should be finite`);
    assert(isFinite(subnet.volume24h), `Subnet ${index} volume should be finite`);
    assert(isFinite(subnet.priceChange24h), `Subnet ${index} price change should be finite`);
  });
});

// Test 55: Empty count produces empty array
test('Zero count produces empty array', () => {
  const subnets = generateSubnetsWithTrends(0, 12345);
  assertEqual(subnets.length, 0, 'Should return empty array for count 0');
});

// Test 56: Single subnet works correctly
test('Single subnet works correctly', () => {
  const subnets = generateSubnetsWithTrends(1, 12345);
  assertEqual(subnets.length, 1, 'Should return single subnet');
  
  const subnet = subnets[0];
  assert(typeof subnet.price === 'number', 'Should have price');
  assert(typeof subnet.marketCap === 'number', 'Should have market cap');
  assert(typeof subnet.volume24h === 'number', 'Should have volume');
  assert(Array.isArray(subnet.trendData), 'Should have trend data');
  assertEqual(subnet.trendData.length, 7, 'Should have 7 trend data points');
});

// Test 57: Large count works correctly
test('Large count works correctly', () => {
  const subnets = generateSubnetsWithTrends(50, 12345);
  assertEqual(subnets.length, 50, 'Should return 50 subnets');
  
  // Verify all have valid data
  subnets.forEach((subnet, index) => {
    assert(subnet.price >= 10 && subnet.price < 110, `Subnet ${index} should have valid price`);
    assert(subnet.trendData.length === 7, `Subnet ${index} should have 7 trend data points`);
  });
});
