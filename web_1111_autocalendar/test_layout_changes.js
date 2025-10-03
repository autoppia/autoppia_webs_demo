#!/usr/bin/env node

// Test script to verify different seeds produce different layouts
const layouts = {
  1: { name: "Classic Month Grid", sidebar: 'left', navigation: 'top' },
  2: { name: "Agenda View", sidebar: 'right', navigation: 'left' },
  3: { name: "Split View", sidebar: 'bottom', navigation: 'top' },
  5: { name: "Agenda View (Special)", sidebar: 'right', navigation: 'left' },
  8: { name: "Classic Month Grid (Special)", sidebar: 'left', navigation: 'top' },
  50: { name: "Layout 11", sidebar: 'left', navigation: 'right' },
  100: { name: "Layout 11", sidebar: 'left', navigation: 'right' },
  160: { name: "Split View (Special)", sidebar: 'bottom', navigation: 'top' },
  180: { name: "Ultra-wide Timeline", sidebar: 'none', navigation: 'top' },
  200: { name: "Asymmetric Calendar", sidebar: 'right', navigation: 'top' }
};

console.log('🎯 Testing Dynamic Layout Seeds (1-300)');
console.log('=====================================');

function testSeed(name, seed, expected) {
  console.log(`\n📊 Seed ${seed} (${name})`);
  console.log(`   Expected: ${expected.name}`);
  console.log(`   Sidebar: ${expected.sidebar}`);
  console.log(`   Navigation: ${expected.navigation}`);
  console.log(`   ✅ This should be visible when visiting: http://localhost:8002/?seed=${seed}`);
}

Object.entries(layouts).forEach(([seed, layout]) => {
  testSeed(layout.name, seed, layout);
});

console.log('\n🔧 How to Test:');
console.log('1. Run: bash scripts/setup.sh --demo=autocalender --web_port=8002 --enable_dynamic_html=true');
console.log('2. Visit http://localhost:8002/?seed=N (where N is any seed 1-300)');
console.log('3. Observe different layouts: sidebar position, navigation placement');
console.log('4. Try seeds: 1, 2, 3, 5, 8, 50, 100, 160, 180, 200');
console.log('\n❌ Dynamic HTML Disabled Test:');
console.log('1. Run: bash scripts/setup.sh --demo=autocalender --web_port=8002 --enable_dynamic_html=false');
console.log('2. Visit http://localhost:8002/?seed=ANY_VALUE');
console.log('3. Should always show default layout regardless of seed');
