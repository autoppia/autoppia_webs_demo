// Test script to demonstrate structural layout changes based on seed values
// Run this in the browser console after the app is loaded

console.log("🏗️ Testing Structural Layout Changes Based on Seed Values");
console.log("=========================================================");

// Mock the SeedVariationManager for testing
class SeedVariationManager {
  static variations = {
    pageLayout: [
      // Layout A: Traditional layout (Seeds 1, 4, 7, 10)
      { 
        className: "max-w-6xl mx-auto px-4 py-8", 
        dataTestId: "page-layout-a",
        layoutType: 'block'
      },
      // Layout B: Grid-based layout (Seeds 2, 5, 8)
      { 
        className: "max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 gap-8", 
        dataTestId: "page-layout-b",
        layoutType: 'grid'
      },
      // Layout C: Flex-based layout (Seeds 3, 6, 9)
      { 
        className: "max-w-5xl mx-auto px-3 py-6 flex flex-col space-y-6", 
        dataTestId: "page-layout-c",
        layoutType: 'flex'
      },
    ],
    
    sectionLayout: [
      // Layout A: Traditional sections (Seeds 1, 4, 7, 10)
      { 
        className: "mb-8", 
        dataTestId: "section-layout-a",
        layoutType: 'block'
      },
      // Layout B: Grid sections (Seeds 2, 5, 8)
      { 
        className: "grid grid-cols-1 gap-6 mb-10", 
        dataTestId: "section-layout-b",
        layoutType: 'grid'
      },
      // Layout C: Flex sections (Seeds 3, 6, 9)
      { 
        className: "flex flex-col space-y-4 mb-6", 
        dataTestId: "section-layout-c",
        layoutType: 'flex'
      },
    ],

    cardContainer: [
      // Layout A: Horizontal scroll (Seeds 1, 4, 7, 10)
      { 
        className: "flex overflow-x-auto gap-4", 
        dataTestId: "card-container-layout-a",
        layoutType: 'flex'
      },
      // Layout B: Grid container (Seeds 2, 5, 8)
      { 
        className: "grid grid-cols-2 gap-4 overflow-y-auto", 
        dataTestId: "card-container-layout-b",
        layoutType: 'grid'
      },
      // Layout C: Vertical stack (Seeds 3, 6, 9)
      { 
        className: "block space-y-4", 
        dataTestId: "card-container-layout-c",
        layoutType: 'block'
      },
    ],

    restaurantCard: [
      // Layout A: Traditional Flexbox Cards (Seeds 1, 4, 7, 10)
      { 
        className: "rounded-xl border shadow-sm bg-white w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between", 
        dataTestId: "restaurant-card-layout-a",
        layoutType: 'flex'
      },
      // Layout B: Grid-based Cards (Seeds 2, 5, 8)
      { 
        className: "rounded-lg border-2 shadow-md bg-gray-50 w-[260px] flex-shrink-0 overflow-hidden grid grid-cols-1 gap-2 p-3", 
        dataTestId: "restaurant-card-layout-b",
        layoutType: 'grid'
      },
      // Layout C: Block-based Cards (Seeds 3, 6, 9)
      { 
        className: "rounded-2xl border shadow-lg bg-white w-[250px] flex-shrink-0 overflow-hidden block p-4", 
        dataTestId: "restaurant-card-layout-c",
        layoutType: 'block'
      },
    ],
  };

  static getVariation(type, seed) {
    const variations = this.variations[type];
    if (!variations) {
      return {};
    }
    
    const normalizedSeed = ((seed - 1) % 3) + 1;
    return variations[normalizedSeed - 1] || variations[0];
  }

  static getClassName(type, seed) {
    const variation = this.getVariation(type, seed);
    return variation.className || "";
  }

  static getDataTestId(type, seed) {
    const variation = this.getVariation(type, seed);
    return variation.dataTestId || `${type}-${seed}`;
  }

  static getLayoutType(type, seed) {
    const variation = this.getVariation(type, seed);
    return variation.layoutType || 'flex';
  }
}

// Test function to demonstrate structural layout changes
function testStructuralLayouts() {
  console.log("\n🎯 STRUCTURAL LAYOUT CHANGES BY SEED:");
  console.log("=====================================");
  
  const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const layoutTypes = ['pageLayout', 'sectionLayout', 'cardContainer', 'restaurantCard'];
  
  seeds.forEach(seed => {
    console.log(`\n🌱 Seed ${seed}:`);
    console.log(`   Layout Pattern: ${getLayoutPattern(seed)}`);
    
    layoutTypes.forEach(type => {
      const className = SeedVariationManager.getClassName(type, seed);
      const dataTestId = SeedVariationManager.getDataTestId(type, seed);
      const layoutType = SeedVariationManager.getLayoutType(type, seed);
      
      console.log(`   ${type}:`);
      console.log(`     Class: ${className}`);
      console.log(`     Data Test ID: ${dataTestId}`);
      console.log(`     Layout Type: ${layoutType}`);
    });
  });

  console.log("\n🏗️ STRUCTURAL LAYOUT PATTERNS:");
  console.log("===============================");
  
  console.log("\n📐 Layout A (Seeds 1, 4, 7, 10) - Traditional Layout:");
  console.log("   • Page: max-w-6xl mx-auto px-4 py-8 (block layout)");
  console.log("   • Sections: mb-8 (block layout)");
  console.log("   • Card Container: flex overflow-x-auto gap-4 (flex layout)");
  console.log("   • Restaurant Cards: flex flex-col justify-between (flex layout)");
  
  console.log("\n📐 Layout B (Seeds 2, 5, 8) - Grid-Based Layout:");
  console.log("   • Page: max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 gap-8 (grid layout)");
  console.log("   • Sections: grid grid-cols-1 gap-6 mb-10 (grid layout)");
  console.log("   • Card Container: grid grid-cols-2 gap-4 overflow-y-auto (grid layout)");
  console.log("   • Restaurant Cards: grid grid-cols-1 gap-2 p-3 (grid layout)");
  
  console.log("\n📐 Layout C (Seeds 3, 6, 9) - Flex-Based Layout:");
  console.log("   • Page: max-w-5xl mx-auto px-3 py-6 flex flex-col space-y-6 (flex layout)");
  console.log("   • Sections: flex flex-col space-y-4 mb-6 (flex layout)");
  console.log("   • Card Container: block space-y-4 (block layout)");
  console.log("   • Restaurant Cards: block p-4 (block layout)");
}

function getLayoutPattern(seed) {
  if ([1, 4, 7, 10].includes(seed)) return "Layout A (Traditional)";
  if ([2, 5, 8].includes(seed)) return "Layout B (Grid-based)";
  if ([3, 6, 9].includes(seed)) return "Layout C (Flex-based)";
  return "Unknown";
}

// Interactive testing functions
window.testStructuralLayouts = testStructuralLayouts;

window.testSeedLayout = (seed) => {
  console.log(`\n🧪 Testing Layout for Seed ${seed}:`);
  console.log(`   Pattern: ${getLayoutPattern(seed)}`);
  
  const types = ['pageLayout', 'sectionLayout', 'cardContainer', 'restaurantCard'];
  types.forEach(type => {
    const className = SeedVariationManager.getClassName(type, seed);
    const dataTestId = SeedVariationManager.getDataTestId(type, seed);
    const layoutType = SeedVariationManager.getLayoutType(type, seed);
    
    console.log(`   ${type}:`);
    console.log(`     Class: ${className}`);
    console.log(`     Data Test ID: ${dataTestId}`);
    console.log(`     Layout Type: ${layoutType}`);
  });
};

window.compareSeeds = (seed1, seed2) => {
  console.log(`\n🔍 Comparing Seeds ${seed1} vs ${seed2}:`);
  console.log(`   Seed ${seed1}: ${getLayoutPattern(seed1)}`);
  console.log(`   Seed ${seed2}: ${getLayoutPattern(seed2)}`);
  
  const types = ['pageLayout', 'sectionLayout', 'cardContainer', 'restaurantCard'];
  types.forEach(type => {
    const class1 = SeedVariationManager.getClassName(type, seed1);
    const class2 = SeedVariationManager.getClassName(type, seed2);
    const data1 = SeedVariationManager.getDataTestId(type, seed1);
    const data2 = SeedVariationManager.getDataTestId(type, seed2);
    
    console.log(`   ${type}:`);
    console.log(`     Seed ${seed1}: ${class1} (${data1})`);
    console.log(`     Seed ${seed2}: ${class2} (${data2})`);
    console.log(`     Different: ${class1 !== class2 ? '✅' : '❌'}`);
  });
};

console.log("\n🧪 TESTING FUNCTIONS AVAILABLE:");
console.log("===============================");
console.log("testStructuralLayouts() - Show all layout variations");
console.log("testSeedLayout(1) - Test specific seed layout");
console.log("compareSeeds(1, 2) - Compare two seed layouts");

// Auto-run the test when script is loaded
setTimeout(() => {
  console.log("\n🚀 Auto-running structural layout test...");
  testStructuralLayouts();
}, 1000); 