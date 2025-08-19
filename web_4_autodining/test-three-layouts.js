// Test script to demonstrate 3 completely different layouts that repeat
// Run this in the browser console or Node.js environment

// Mock the SeedVariationManager for testing
class SeedVariationManager {
  static variations = {
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
      // Layout A: Traditional Flexbox Cards (Seeds 1, 4, 7, 10)
      { 
        className: "rounded-xl border shadow-sm bg-white w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between", 
        dataTestId: "restaurant-card-layout-a",
        layoutType: 'flex'
      },
    ],
    
    bookButton: [
      // Layout A: Normal positioned buttons (Seeds 1, 4, 7, 10)
      { 
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold", 
        dataTestId: "book-btn-layout-a",
        position: 'relative'
      },
      // Layout B: Absolutely positioned buttons (Seeds 2, 5, 8)
      { 
        className: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg absolute top-2 right-2 font-semibold", 
        dataTestId: "book-btn-layout-b",
        position: 'absolute'
      },
      // Layout C: Fixed positioned buttons (Seeds 3, 6, 9)
      { 
        className: "bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-full fixed bottom-4 right-4 font-semibold", 
        dataTestId: "book-btn-layout-c",
        position: 'fixed'
      },
      // Layout A: Normal positioned buttons (Seeds 1, 4, 7, 10)
      { 
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold", 
        dataTestId: "book-btn-layout-a",
        position: 'relative'
      },
      // Layout B: Absolutely positioned buttons (Seeds 2, 5, 8)
      { 
        className: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg absolute top-2 right-2 font-semibold", 
        dataTestId: "book-btn-layout-b",
        position: 'absolute'
      },
      // Layout C: Fixed positioned buttons (Seeds 3, 6, 9)
      { 
        className: "bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-full fixed bottom-4 right-4 font-semibold", 
        dataTestId: "book-btn-layout-c",
        position: 'fixed'
      },
      // Layout A: Normal positioned buttons (Seeds 1, 4, 7, 10)
      { 
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold", 
        dataTestId: "book-btn-layout-a",
        position: 'relative'
      },
      // Layout B: Absolutely positioned buttons (Seeds 2, 5, 8)
      { 
        className: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg absolute top-2 right-2 font-semibold", 
        dataTestId: "book-btn-layout-b",
        position: 'absolute'
      },
      // Layout C: Fixed positioned buttons (Seeds 3, 6, 9)
      { 
        className: "bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-full fixed bottom-4 right-4 font-semibold", 
        dataTestId: "book-btn-layout-c",
        position: 'fixed'
      },
      // Layout A: Normal positioned buttons (Seeds 1, 4, 7, 10)
      { 
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold", 
        dataTestId: "book-btn-layout-a",
        position: 'relative'
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
      // Layout A: Horizontal scroll (Seeds 1, 4, 7, 10)
      { 
        className: "flex overflow-x-auto gap-4", 
        dataTestId: "card-container-layout-a",
        layoutType: 'flex'
      },
    ],
  };

  static getVariation(type, seed) {
    const variations = this.variations[type];
    if (!variations) {
      return {};
    }
    
    const normalizedSeed = ((seed - 1) % 10) + 1;
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

  static getPosition(type, seed) {
    const variation = this.getVariation(type, seed);
    return variation.position || 'relative';
  }
}

// Test function to demonstrate 3 different layouts
function testThreeLayouts() {
  console.log("🎨 Testing 3 Completely Different Layouts");
  console.log("========================================\n");

  const variationTypes = ["restaurantCard", "bookButton", "cardContainer"];

  console.log("📋 LAYOUT PATTERN:");
  console.log("==================");
  console.log("Layout A: Seeds 1, 4, 7, 10 - Traditional Flexbox Layout");
  console.log("Layout B: Seeds 2, 5, 8     - Grid-based Layout");
  console.log("Layout C: Seeds 3, 6, 9     - Block-based Layout");
  console.log("");

  for (let seed = 1; seed <= 10; seed++) {
    // Determine which layout this seed uses
    let layoutType;
    if ([1, 4, 7, 10].includes(seed)) {
      layoutType = "A";
    } else if ([2, 5, 8].includes(seed)) {
      layoutType = "B";
    } else {
      layoutType = "C";
    }

    console.log(`🎪 Seed ${seed} - Layout ${layoutType}:`);
    console.log(`   URL: http://localhost:3000/?seed=${seed}`);
    
    variationTypes.forEach(type => {
      const className = SeedVariationManager.getClassName(type, seed);
      const dataTestId = SeedVariationManager.getDataTestId(type, seed);
      const layoutType = SeedVariationManager.getLayoutType(type, seed);
      const position = SeedVariationManager.getPosition(type, seed);
      
      console.log(`   ${type}:`);
      console.log(`     Layout Type: ${layoutType}`);
      console.log(`     Position: ${position}`);
      console.log(`     Data Test ID: ${dataTestId}`);
    });
    
    console.log("");
  }

  console.log("🎯 LAYOUT COMPARISON:");
  console.log("=====================");
  
  console.log("\n1. Restaurant Cards:");
  console.log("   Layout A (1,4,7,10): Flexbox cards with justify-between");
  console.log("   Layout B (2,5,8):    Grid cards with 1 column and gap");
  console.log("   Layout C (3,6,9):    Block cards with padding");
  
  console.log("\n2. Book Buttons:");
  console.log("   Layout A (1,4,7,10): Normal positioned blue buttons");
  console.log("   Layout B (2,5,8):    Absolutely positioned green buttons");
  console.log("   Layout C (3,6,9):    Fixed positioned purple buttons");
  
  console.log("\n3. Card Containers:");
  console.log("   Layout A (1,4,7,10): Horizontal scroll (flex)");
  console.log("   Layout B (2,5,8):    2-column grid");
  console.log("   Layout C (3,6,9):    Vertical stack (block)");

  console.log("\n🚨 SCRAPER CONFUSION TECHNIQUES:");
  console.log("=================================");
  console.log("1. X-Path Changes:");
  console.log("   Layout A: //*[@data-testid=\"restaurant-card-layout-a\"]");
  console.log("   Layout B: //*[@data-testid=\"restaurant-card-layout-b\"]");
  console.log("   Layout C: //*[@data-testid=\"restaurant-card-layout-c\"]");
  
  console.log("\n2. CSS Class Changes:");
  console.log("   Layout A: .flex.flex-col (flexbox)");
  console.log("   Layout B: .grid.grid-cols-1 (grid)");
  console.log("   Layout C: .block (block)");
  
  console.log("\n3. Positioning Changes:");
  console.log("   Layout A: position: relative (normal flow)");
  console.log("   Layout B: position: absolute (positioned)");
  console.log("   Layout C: position: fixed (fixed to viewport)");
  
  console.log("\n4. Container Changes:");
  console.log("   Layout A: .flex.overflow-x-auto (horizontal scroll)");
  console.log("   Layout B: .grid.grid-cols-2 (2-column grid)");
  console.log("   Layout C: .block.space-y-4 (vertical stack)");
}

// Run the test
testThreeLayouts();

// Example of how this confuses scrapers
console.log("\n🤖 SCRAPER CONFUSION EXAMPLES:");
console.log("===============================");

console.log("\n1. X-Path Inconsistency:");
console.log("   Seed 1:  //*[@data-testid=\"restaurant-card-layout-a\"]");
console.log("   Seed 2:  //*[@data-testid=\"restaurant-card-layout-b\"]");
console.log("   Seed 3:  //*[@data-testid=\"restaurant-card-layout-c\"]");
console.log("   Seed 4:  //*[@data-testid=\"restaurant-card-layout-a\"] (repeats!)");
console.log("   Seed 5:  //*[@data-testid=\"restaurant-card-layout-b\"] (repeats!)");

console.log("\n2. CSS Selector Inconsistency:");
console.log("   Seed 1:  .flex.flex-col (flexbox)");
console.log("   Seed 2:  .grid.grid-cols-1 (grid)");
console.log("   Seed 3:  .block (block)");
console.log("   Seed 4:  .flex.flex-col (flexbox - repeats!)");
console.log("   Seed 5:  .grid.grid-cols-1 (grid - repeats!)");

console.log("\n3. DOM Structure Inconsistency:");
console.log("   Seed 1:  <div class=\"flex flex-col\"> (flex container)");
console.log("   Seed 2:  <div class=\"grid grid-cols-1\"> (grid container)");
console.log("   Seed 3:  <div class=\"block\"> (block container)");
console.log("   Seed 4:  <div class=\"flex flex-col\"> (flex container - repeats!)");
console.log("   Seed 5:  <div class=\"grid grid-cols-1\"> (grid container - repeats!)");

console.log("\n✅ Result: Scrapers will be confused by the repeating patterns!");
console.log("   - Same x-paths repeat across different seeds");
console.log("   - Same CSS classes repeat across different seeds");
console.log("   - Same DOM structures repeat across different seeds");
console.log("   - But the visual layout is completely different!");
console.log("   - Makes it impossible to rely on consistent selectors!"); 