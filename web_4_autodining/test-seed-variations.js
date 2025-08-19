// Test script to demonstrate seed-based x-path variations
// Run this in the browser console or Node.js environment

// Mock the SeedVariationManager for testing
class SeedVariationManager {
  static variations = {
    restaurantCard: [
      { className: "rounded-xl border shadow-sm bg-white w-[255px]", dataTestId: "restaurant-card-1" },
      { className: "rounded-lg border-2 shadow-md bg-gray-50 w-[260px]", dataTestId: "restaurant-card-2" },
      { className: "rounded-2xl border shadow-lg bg-white w-[250px]", dataTestId: "restaurant-card-3" },
      { className: "rounded-md border shadow-sm bg-blue-50 w-[270px]", dataTestId: "restaurant-card-4" },
      { className: "rounded-xl border-2 shadow-xl bg-white w-[245px]", dataTestId: "restaurant-card-5" },
      { className: "rounded-lg border shadow-md bg-green-50 w-[265px]", dataTestId: "restaurant-card-6" },
      { className: "rounded-2xl border-2 shadow-lg bg-white w-[255px]", dataTestId: "restaurant-card-7" },
      { className: "rounded-md border shadow-sm bg-purple-50 w-[275px]", dataTestId: "restaurant-card-8" },
      { className: "rounded-xl border shadow-xl bg-white w-[240px]", dataTestId: "restaurant-card-9" },
      { className: "rounded-lg border-2 shadow-md bg-yellow-50 w-[280px]", dataTestId: "restaurant-card-10" },
    ],
    
    bookButton: [
      { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded", dataTestId: "book-btn-1" },
      { className: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg", dataTestId: "book-btn-2" },
      { className: "bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-full", dataTestId: "book-btn-3" },
      { className: "bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-md", dataTestId: "book-btn-4" },
      { className: "bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl", dataTestId: "book-btn-5" },
      { className: "bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg", dataTestId: "book-btn-6" },
      { className: "bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-full", dataTestId: "book-btn-7" },
      { className: "bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-md", dataTestId: "book-btn-8" },
      { className: "bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl", dataTestId: "book-btn-9" },
      { className: "bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg", dataTestId: "book-btn-10" },
    ],
    
    searchBar: [
      { className: "w-full px-4 py-2 border rounded-lg", dataTestId: "search-bar-1" },
      { className: "w-full px-6 py-3 border-2 rounded-xl", dataTestId: "search-bar-2" },
      { className: "w-full px-3 py-2 border rounded-md", dataTestId: "search-bar-3" },
      { className: "w-full px-5 py-2 border-2 rounded-lg", dataTestId: "search-bar-4" },
      { className: "w-full px-4 py-3 border rounded-xl", dataTestId: "search-bar-5" },
      { className: "w-full px-6 py-2 border-2 rounded-md", dataTestId: "search-bar-6" },
      { className: "w-full px-3 py-3 border rounded-lg", dataTestId: "search-bar-7" },
      { className: "w-full px-5 py-3 border-2 rounded-xl", dataTestId: "search-bar-8" },
      { className: "w-full px-4 py-2 border rounded-md", dataTestId: "search-bar-9" },
      { className: "w-full px-6 py-2 border-2 rounded-lg", dataTestId: "search-bar-10" },
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

  static getXPath(type, seed) {
    const variation = this.getVariation(type, seed);
    return variation.xpath || `//*[@data-testid="${variation.dataTestId}"]`;
  }

  static getClassName(type, seed) {
    const variation = this.getVariation(type, seed);
    return variation.className || "";
  }

  static getDataTestId(type, seed) {
    const variation = this.getVariation(type, seed);
    return variation.dataTestId || `${type}-${seed}`;
  }
}

// Test function to demonstrate variations
function testSeedVariations() {
  console.log("🌱 Testing Seed-Based Variations");
  console.log("================================\n");

  const variationTypes = ["restaurantCard", "bookButton", "searchBar"];

  for (let seed = 1; seed <= 10; seed++) {
    console.log(`📊 Seed ${seed}:`);
    console.log(`   URL: http://localhost:3000/?seed=${seed}`);
    
    variationTypes.forEach(type => {
      const className = SeedVariationManager.getClassName(type, seed);
      const dataTestId = SeedVariationManager.getDataTestId(type, seed);
      const xpath = SeedVariationManager.getXPath(type, seed);
      
      console.log(`   ${type}:`);
      console.log(`     Class: ${className}`);
      console.log(`     Data Test ID: ${dataTestId}`);
      console.log(`     X-Path: ${xpath}`);
    });
    
    console.log("");
  }

  console.log("🎯 Key Benefits:");
  console.log("   - Different x-paths for each seed value");
  console.log("   - Unique styling for A/B testing");
  console.log("   - Consistent behavior across components");
  console.log("   - Easy automation testing with unique selectors");
}

// Run the test
testSeedVariations();

// Example usage in automation testing
console.log("🤖 Automation Testing Examples:");
console.log("===============================");

// Example: Selenium WebDriver
console.log("\nSelenium WebDriver:");
console.log("// For seed=1");
console.log("WebElement bookButton = driver.findElement(By.xpath('//*[@data-testid=\"book-btn-1\"]'));");
console.log("// For seed=2");
console.log("WebElement bookButton = driver.findElement(By.xpath('//*[@data-testid=\"book-btn-2\"]'));");

// Example: Playwright
console.log("\nPlaywright:");
console.log("// For seed=1");
console.log("await page.click('[data-testid=\"book-btn-1\"]');");
console.log("// For seed=2");
console.log("await page.click('[data-testid=\"book-btn-2\"]');");

// Example: Cypress
console.log("\nCypress:");
console.log("// For seed=1");
console.log("cy.get('[data-testid=\"book-btn-1\"]').click();");
console.log("// For seed=2");
console.log("cy.get('[data-testid=\"book-btn-2\"]').click();");

console.log("\n✅ Test completed! Each seed value now generates unique x-paths and styling."); 