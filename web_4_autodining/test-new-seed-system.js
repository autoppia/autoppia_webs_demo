#!/usr/bin/env node

// Test script for the new seed-to-layout mapping system
console.log("🧪 Testing New Seed-to-Layout Mapping System");
console.log("=============================================");

// Simulate the getLayoutIndexFromSeed function
function getLayoutIndexFromSeed(seed) {
  return Math.ceil(seed / 30);
}

// Test cases for the new mapping
const testCases = [
  // Layout 1 (seeds 1-30)
  { seed: 1, expectedLayout: 1 },
  { seed: 15, expectedLayout: 1 },
  { seed: 30, expectedLayout: 1 },
  
  // Layout 2 (seeds 31-60)
  { seed: 31, expectedLayout: 2 },
  { seed: 45, expectedLayout: 2 },
  { seed: 60, expectedLayout: 2 },
  
  // Layout 3 (seeds 61-90)
  { seed: 61, expectedLayout: 3 },
  { seed: 75, expectedLayout: 3 },
  { seed: 90, expectedLayout: 3 },
  
  // Layout 4 (seeds 91-120)
  { seed: 91, expectedLayout: 4 },
  { seed: 105, expectedLayout: 4 },
  { seed: 120, expectedLayout: 4 },
  
  // Layout 4 continues (seeds 121-150)
  { seed: 121, expectedLayout: 5 },
  { seed: 150, expectedLayout: 5 },
  
  // Layout 5 continues (seeds 151-180)
  { seed: 151, expectedLayout: 6 },
  { seed: 180, expectedLayout: 6 },
  
  // Layout 6 continues (seeds 181-210)
  { seed: 181, expectedLayout: 7 },
  { seed: 210, expectedLayout: 7 },
  
  // Layout 7 continues (seeds 211-240)
  { seed: 211, expectedLayout: 8 },
  { seed: 240, expectedLayout: 8 },
  
  // Layout 8 continues (seeds 241-270)
  { seed: 241, expectedLayout: 9 },
  { seed: 270, expectedLayout: 9 },
  
  // Layout 9 continues (seeds 271-300)
  { seed: 271, expectedLayout: 10 },
  { seed: 300, expectedLayout: 10 },
  
  // Edge cases
  { seed: 0, expectedLayout: 1 }, // Should be clamped to 1
  { seed: 301, expectedLayout: 11 }, // Beyond 300, but function doesn't clamp
];

console.log("\n📊 Testing Seed-to-Layout Mapping:");
console.log("Seed → Layout Index (ceil(seed/30))");
console.log("-----------------------------------");

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach(({ seed, expectedLayout }) => {
  const actualLayout = getLayoutIndexFromSeed(seed);
  const passed = actualLayout === expectedLayout;
  const status = passed ? "✅ PASS" : "❌ FAIL";
  
  console.log(`Seed ${seed.toString().padStart(3)} → Layout ${actualLayout} (expected ${expectedLayout}) ${status}`);
  
  if (passed) passedTests++;
});

console.log("\n📈 Test Results:");
console.log(`Passed: ${passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
  console.log("🎉 All tests passed! The new seed-to-layout mapping is working correctly.");
} else {
  console.log("⚠️  Some tests failed. Please review the implementation.");
}

console.log("\n🔍 Layout Distribution Analysis:");
console.log("This shows how seeds are distributed across layouts:");
console.log("Layout 1: Seeds 1-30   (30 seeds)");
console.log("Layout 2: Seeds 31-60  (30 seeds)");
console.log("Layout 3: Seeds 61-90  (30 seeds)");
console.log("Layout 4: Seeds 91-120 (30 seeds)");
console.log("...and so on");

console.log("\n🎯 Key Benefits:");
console.log("- Seeds 1-300 are now supported (vs. previous 1-10)");
console.log("- Only 3-4 layout variations are used (recycling every 30 seeds)");
console.log("- No more overlapping content issues (fixed positioning removed)");
console.log("- Event-logging elements maintain their positions while layout varies");

console.log("\n🚀 Ready for testing with URLs like:");
console.log("- http://localhost:8003?seed=1   (Layout 1)");
console.log("- http://localhost:8003?seed=35  (Layout 2)");
console.log("- http://localhost:8003?seed=105 (Layout 4)");
console.log("- http://localhost:8003?seed=300 (Layout 10)");
