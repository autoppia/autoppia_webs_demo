// Test script to demonstrate dramatic layout changes for confusing scraper agents
// Run this in the browser console or Node.js environment

// Mock the SeedVariationManager for testing
class SeedVariationManager {
  static variations = {
    restaurantCard: [
      { 
        className: "rounded-xl border shadow-sm bg-white w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between", 
        dataTestId: "restaurant-card-1",
        layoutType: 'flex'
      },
      { 
        className: "rounded-lg border-2 shadow-md bg-gray-50 w-[260px] flex-shrink-0 overflow-hidden grid grid-cols-1 gap-2", 
        dataTestId: "restaurant-card-2",
        layoutType: 'grid'
      },
      { 
        className: "rounded-2xl border shadow-lg bg-white w-[250px] flex-shrink-0 overflow-hidden block", 
        dataTestId: "restaurant-card-3",
        layoutType: 'block'
      },
      { 
        className: "rounded-md border shadow-sm bg-blue-50 w-[270px] flex-shrink-0 overflow-hidden flex flex-row", 
        dataTestId: "restaurant-card-4",
        layoutType: 'flex'
      },
      { 
        className: "rounded-xl border-2 shadow-xl bg-white w-[245px] flex-shrink-0 overflow-hidden grid grid-cols-2 gap-1", 
        dataTestId: "restaurant-card-5",
        layoutType: 'grid'
      },
      { 
        className: "rounded-lg border shadow-md bg-green-50 w-[265px] flex-shrink-0 overflow-hidden flex flex-col-reverse", 
        dataTestId: "restaurant-card-6",
        layoutType: 'flex'
      },
      { 
        className: "rounded-2xl border-2 shadow-lg bg-white w-[255px] flex-shrink-0 overflow-hidden inline-block", 
        dataTestId: "restaurant-card-7",
        layoutType: 'block'
      },
      { 
        className: "rounded-md border shadow-sm bg-purple-50 w-[275px] flex-shrink-0 overflow-hidden flex flex-wrap", 
        dataTestId: "restaurant-card-8",
        layoutType: 'flex'
      },
      { 
        className: "rounded-xl border shadow-xl bg-white w-[240px] flex-shrink-0 overflow-hidden table", 
        dataTestId: "restaurant-card-9",
        layoutType: 'block'
      },
      { 
        className: "rounded-lg border-2 shadow-md bg-yellow-50 w-[280px] flex-shrink-0 overflow-hidden flex flex-col items-center", 
        dataTestId: "restaurant-card-10",
        layoutType: 'flex'
      },
    ],
    
    bookButton: [
      { 
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded", 
        dataTestId: "book-btn-1",
        position: 'relative'
      },
      { 
        className: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg absolute top-0 right-0", 
        dataTestId: "book-btn-2",
        position: 'absolute'
      },
      { 
        className: "bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-full fixed bottom-4 right-4", 
        dataTestId: "book-btn-3",
        position: 'fixed'
      },
      { 
        className: "bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-md sticky top-2", 
        dataTestId: "book-btn-4",
        position: 'sticky'
      },
      { 
        className: "bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl float-right", 
        dataTestId: "book-btn-5",
        position: 'relative'
      },
      { 
        className: "bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg inline-block", 
        dataTestId: "book-btn-6",
        position: 'relative'
      },
      { 
        className: "bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-full block w-full", 
        dataTestId: "book-btn-7",
        position: 'relative'
      },
      { 
        className: "bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-md grid place-items-center", 
        dataTestId: "book-btn-8",
        position: 'relative'
      },
      { 
        className: "bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl flex items-center justify-center", 
        dataTestId: "book-btn-9",
        position: 'relative'
      },
      { 
        className: "bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg table-cell align-middle", 
        dataTestId: "book-btn-10",
        position: 'relative'
      },
    ],
    
    cardContainer: [
      { 
        className: "flex overflow-x-auto gap-4", 
        dataTestId: "card-container-1",
        layoutType: 'flex'
      },
      { 
        className: "grid grid-cols-2 gap-4 overflow-y-auto", 
        dataTestId: "card-container-2",
        layoutType: 'grid'
      },
      { 
        className: "block space-y-4", 
        dataTestId: "card-container-3",
        layoutType: 'block'
      },
      { 
        className: "flex flex-col gap-4", 
        dataTestId: "card-container-4",
        layoutType: 'flex'
      },
      { 
        className: "table w-full", 
        dataTestId: "card-container-5",
        layoutType: 'block'
      },
      { 
        className: "flex flex-row-reverse gap-4", 
        dataTestId: "card-container-6",
        layoutType: 'flex'
      },
      { 
        className: "grid grid-cols-3 gap-4", 
        dataTestId: "card-container-7",
        layoutType: 'grid'
      },
      { 
        className: "flex flex-wrap gap-4", 
        dataTestId: "card-container-8",
        layoutType: 'flex'
      },
      { 
        className: "inline-block space-x-4", 
        dataTestId: "card-container-9",
        layoutType: 'block'
      },
      { 
        className: "flex flex-col-reverse gap-4", 
        dataTestId: "card-container-10",
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

// Test function to demonstrate dramatic layout changes
function testDramaticLayouts() {
  console.log("🎭 Testing Dramatic Layout Changes for Scraper Confusion");
  console.log("========================================================\n");

  const variationTypes = ["restaurantCard", "bookButton", "cardContainer"];

  for (let seed = 1; seed <= 10; seed++) {
    console.log(`🎪 Seed ${seed} - DRAMATIC LAYOUT CHANGE:`);
    console.log(`   URL: http://localhost:3000/?seed=${seed}`);
    
    variationTypes.forEach(type => {
      const className = SeedVariationManager.getClassName(type, seed);
      const dataTestId = SeedVariationManager.getDataTestId(type, seed);
      const layoutType = SeedVariationManager.getLayoutType(type, seed);
      const position = SeedVariationManager.getPosition(type, seed);
      
      console.log(`   ${type}:`);
      console.log(`     Layout Type: ${layoutType}`);
      console.log(`     Position: ${position}`);
      console.log(`     Class: ${className}`);
      console.log(`     Data Test ID: ${dataTestId}`);
    });
    
    console.log("");
  }

  console.log("🚨 SCRAPER CONFUSION TECHNIQUES:");
  console.log("=================================");
  console.log("1. Layout Type Changes:");
  console.log("   - Seed 1: Flex layout (normal)");
  console.log("   - Seed 2: Grid layout (different structure)");
  console.log("   - Seed 3: Block layout (vertical stacking)");
  console.log("   - Seed 4: Flex row (horizontal)");
  console.log("   - Seed 5: Grid 2-column (complex structure)");
  console.log("   - Seed 6: Flex column-reverse (reversed order)");
  console.log("   - Seed 7: Inline-block (inline behavior)");
  console.log("   - Seed 8: Flex wrap (wrapping behavior)");
  console.log("   - Seed 9: Table layout (table structure)");
  console.log("   - Seed 10: Flex column center (centered)");
  
  console.log("\n2. Position Changes:");
  console.log("   - Seed 1: Relative (normal flow)");
  console.log("   - Seed 2: Absolute (positioned absolutely)");
  console.log("   - Seed 3: Fixed (fixed to viewport)");
  console.log("   - Seed 4: Sticky (sticky positioning)");
  console.log("   - Seed 5: Float right (floating)");
  console.log("   - Seed 6: Inline-block (inline behavior)");
  console.log("   - Seed 7: Block (block behavior)");
  console.log("   - Seed 8: Grid (grid positioning)");
  console.log("   - Seed 9: Flex (flex positioning)");
  console.log("   - Seed 10: Table-cell (table behavior)");

  console.log("\n3. Container Layout Changes:");
  console.log("   - Seed 1: Horizontal scroll (flex)");
  console.log("   - Seed 2: 2-column grid (grid)");
  console.log("   - Seed 3: Vertical stack (block)");
  console.log("   - Seed 4: Vertical flex (flex-col)");
  console.log("   - Seed 5: Table layout (table)");
  console.log("   - Seed 6: Reverse order (flex-row-reverse)");
  console.log("   - Seed 7: 3-column grid (grid-cols-3)");
  console.log("   - Seed 8: Wrapping flex (flex-wrap)");
  console.log("   - Seed 9: Inline horizontal (inline-block)");
  console.log("   - Seed 10: Reverse vertical (flex-col-reverse)");
}

// Run the test
testDramaticLayouts();

// Example of how this confuses scrapers
console.log("\n🤖 SCRAPER CONFUSION EXAMPLES:");
console.log("===============================");

console.log("\n1. X-Path Changes:");
console.log("   Seed 1: //*[@data-testid=\"restaurant-card-1\"]");
console.log("   Seed 2: //*[@data-testid=\"restaurant-card-2\"]");
console.log("   Seed 3: //*[@data-testid=\"restaurant-card-3\"]");
console.log("   Each seed has completely different x-paths!");

console.log("\n2. CSS Selector Changes:");
console.log("   Seed 1: .flex.flex-col (flexbox layout)");
console.log("   Seed 2: .grid.grid-cols-1 (grid layout)");
console.log("   Seed 3: .block (block layout)");
console.log("   Different CSS classes for same functionality!");

console.log("\n3. DOM Structure Changes:");
console.log("   Seed 1: <div class=\"flex flex-col\"> (flex container)");
console.log("   Seed 2: <div class=\"grid grid-cols-1\"> (grid container)");
console.log("   Seed 3: <div class=\"block\"> (block container)");
console.log("   Completely different DOM structures!");

console.log("\n4. Positioning Changes:");
console.log("   Seed 1: position: relative (normal flow)");
console.log("   Seed 2: position: absolute (positioned)");
console.log("   Seed 3: position: fixed (fixed to viewport)");
console.log("   Different positioning strategies!");

console.log("\n✅ Result: Scrapers will be completely confused!");
console.log("   - Different x-paths for each seed");
console.log("   - Different CSS classes and structures");
console.log("   - Different positioning and layout types");
console.log("   - Different DOM hierarchies");
console.log("   - Same functionality, completely different implementation!"); 