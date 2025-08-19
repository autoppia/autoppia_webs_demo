// Test script to demonstrate search button variations based on seed values and events
// Run this in the browser console after the app is loaded

console.log("🔍 Testing Search Button Variations Based on Seed Values and Events");
console.log("==================================================================");

// Mock the SeedVariationManager for testing
class SeedVariationManager {
  static variations = {
    searchButton: [
      // Layout A: Right side positioned buttons (Seeds 1, 4, 7, 10)
      { 
        className: "px-5 py-2 rounded text-lg bg-[#46a758] text-white hover:bg-[#3d8f4a] ml-2", 
        dataTestId: "search-btn-layout-a-right",
        position: 'relative'
      },
      // Layout B: Left side positioned buttons (Seeds 2, 5, 8)
      { 
        className: "px-6 py-3 rounded-lg text-lg bg-[#46a758] text-white hover:bg-[#3d8f4a] mr-2", 
        dataTestId: "search-btn-layout-b-left",
        position: 'relative'
      },
      // Layout C: Right side fixed positioned buttons (Seeds 3, 6, 9)
      { 
        className: "px-4 py-2 rounded-full text-lg bg-[#46a758] text-white hover:bg-[#3d8f4a] fixed bottom-4 right-4", 
        dataTestId: "search-btn-layout-c-right",
        position: 'fixed'
      },
    ],
  };

  static eventVariations = {
    "SEARCH_RESTAURANT": {
      "searchButton": {
        className: "px-6 py-3 rounded-xl text-lg bg-yellow-600 text-white hover:bg-yellow-700 animate-pulse",
        dataTestId: "search-btn-event-active",
        position: 'relative'
      }
    },
    "TIME_DROPDOWN_OPENED": {
      "searchButton": {
        className: "px-5 py-2 rounded-lg text-lg bg-orange-600 text-white hover:bg-orange-700",
        dataTestId: "search-btn-time-dropdown-active",
        position: 'relative'
      }
    },
    "DATE_DROPDOWN_OPENED": {
      "searchButton": {
        className: "px-5 py-2 rounded-lg text-lg bg-purple-600 text-white hover:bg-purple-700",
        dataTestId: "search-btn-date-dropdown-active",
        position: 'relative'
      }
    },
    "PEOPLE_DROPDOWN_OPENED": {
      "searchButton": {
        className: "px-5 py-2 rounded-lg text-lg bg-pink-600 text-white hover:bg-pink-700",
        dataTestId: "search-btn-people-dropdown-active",
        position: 'relative'
      }
    },
  };

  static getVariation(type, seed) {
    const variations = this.variations[type];
    if (!variations) {
      return {};
    }
    
    const normalizedSeed = ((seed - 1) % 3) + 1;
    return variations[normalizedSeed - 1] || variations[0];
  }

  static getEventVariation(eventType, componentType) {
    if (this.eventVariations[eventType] && this.eventVariations[eventType][componentType]) {
      return this.eventVariations[eventType][componentType];
    }
    return null;
  }

  static getClassName(type, seed, eventType) {
    // First check event-based variation
    if (eventType) {
      const eventVariation = this.getEventVariation(eventType, type);
      if (eventVariation) {
        return eventVariation.className;
      }
    }
    
    // Fall back to seed-based variation
    const variation = this.getVariation(type, seed);
    return variation.className || "";
  }

  static getDataTestId(type, seed, eventType) {
    // First check event-based variation
    if (eventType) {
      const eventVariation = this.getEventVariation(eventType, type);
      if (eventVariation) {
        return eventVariation.dataTestId;
      }
    }
    
    // Fall back to seed-based variation
    const variation = this.getVariation(type, seed);
    return variation.dataTestId || `${type}-${seed}`;
  }

  static getPosition(type, seed, eventType) {
    // First check event-based variation
    if (eventType) {
      const eventVariation = this.getEventVariation(eventType, type);
      if (eventVariation) {
        return eventVariation.position;
      }
    }
    
    // Fall back to seed-based variation
    const variation = this.getVariation(type, seed);
    return variation.position || 'relative';
  }
}

// Test function to demonstrate search button variations
function testSearchButtonVariations() {
  console.log("\n🎯 SEARCH BUTTON VARIATIONS BY SEED:");
  console.log("====================================");
  
  const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  seeds.forEach(seed => {
    console.log(`\n🌱 Seed ${seed}:`);
    console.log(`   Layout Pattern: ${getLayoutPattern(seed)}`);
    
    const className = SeedVariationManager.getClassName('searchButton', seed);
    const dataTestId = SeedVariationManager.getDataTestId('searchButton', seed);
    const position = SeedVariationManager.getPosition('searchButton', seed);
    
    console.log(`   Search Button:`);
    console.log(`     Class: ${className}`);
    console.log(`     Data Test ID: ${dataTestId}`);
    console.log(`     Position: ${position}`);
  });

  console.log("\n🎨 SEARCH BUTTON LAYOUT PATTERNS:");
  console.log("==================================");
  
  console.log("\n📐 Layout A (Seeds 1, 4, 7, 10) - Right Side Position:");
  console.log("   • Class: px-5 py-2 rounded text-lg bg-[#46a758] text-white hover:bg-[#3d8f4a] ml-2");
  console.log("   • Position: relative (right side with ml-2)");
  console.log("   • Data Test ID: search-btn-layout-a-right");
  
  console.log("\n📐 Layout B (Seeds 2, 5, 8) - Left Side Position:");
  console.log("   • Class: px-6 py-3 rounded-lg text-lg bg-[#46a758] text-white hover:bg-[#3d8f4a] mr-2");
  console.log("   • Position: relative (left side with mr-2)");
  console.log("   • Data Test ID: search-btn-layout-b-left");
  
  console.log("\n📐 Layout C (Seeds 3, 6, 9) - Fixed Position (Right/Left alternating):");
  console.log("   • Class: px-4 py-2 rounded-full text-lg bg-[#46a758] text-white hover:bg-[#3d8f4a] fixed bottom-4 right-4/left-4");
  console.log("   • Position: fixed (alternating right/left)");
  console.log("   • Data Test ID: search-btn-layout-c-right/search-btn-layout-c-left");

  console.log("\n🎯 EVENT-BASED SEARCH BUTTON CHANGES:");
  console.log("=====================================");
  
  const events = [
    "SEARCH_RESTAURANT",
    "TIME_DROPDOWN_OPENED", 
    "DATE_DROPDOWN_OPENED",
    "PEOPLE_DROPDOWN_OPENED"
  ];
  
  events.forEach(event => {
    console.log(`\n📋 Event: ${event}`);
    console.log(`   Trigger: logEvent('${event}', { data: 'test' })`);
    
    const className = SeedVariationManager.getClassName('searchButton', 1, event);
    const dataTestId = SeedVariationManager.getDataTestId('searchButton', 1, event);
    const position = SeedVariationManager.getPosition('searchButton', 1, event);
    
    if (className) {
      console.log(`   ✅ Search Button Changes:`);
      console.log(`      Class: ${className}`);
      console.log(`      Data Test ID: ${dataTestId}`);
      console.log(`      Position: ${position}`);
    } else {
      console.log(`   ❌ No search button changes for this event`);
    }
  });

  console.log("\n🎨 EVENT-BASED SEARCH BUTTON THEMES:");
  console.log("=====================================");
  console.log("• SEARCH_RESTAURANT: Yellow theme (bg-yellow-600, hover:bg-yellow-700, animate-pulse)");
  console.log("• TIME_DROPDOWN_OPENED: Orange theme (bg-orange-600, hover:bg-orange-700)");
  console.log("• DATE_DROPDOWN_OPENED: Purple theme (bg-purple-600, hover:bg-purple-700)");
  console.log("• PEOPLE_DROPDOWN_OPENED: Pink theme (bg-pink-600, hover:bg-pink-700)");
}

function getLayoutPattern(seed) {
  if ([1, 4, 7, 10].includes(seed)) return "Layout A (Right Side Position)";
  if ([2, 5, 8].includes(seed)) return "Layout B (Left Side Position)";
  if ([3, 6, 9].includes(seed)) return "Layout C (Fixed Position - Right/Left alternating)";
  return "Unknown";
}

// Interactive testing functions
window.testSearchButtonVariations = testSearchButtonVariations;

window.testSearchButtonSeed = (seed) => {
  console.log(`\n🧪 Testing Search Button for Seed ${seed}:`);
  console.log(`   Pattern: ${getLayoutPattern(seed)}`);
  
  const className = SeedVariationManager.getClassName('searchButton', seed);
  const dataTestId = SeedVariationManager.getDataTestId('searchButton', seed);
  const position = SeedVariationManager.getPosition('searchButton', seed);
  
  console.log(`   Search Button:`);
  console.log(`     Class: ${className}`);
  console.log(`     Data Test ID: ${dataTestId}`);
  console.log(`     Position: ${position}`);
};

window.testSearchButtonEvent = (eventType) => {
  console.log(`\n🧪 Testing Search Button for Event ${eventType}:`);
  
  const className = SeedVariationManager.getClassName('searchButton', 1, eventType);
  const dataTestId = SeedVariationManager.getDataTestId('searchButton', 1, eventType);
  const position = SeedVariationManager.getPosition('searchButton', 1, eventType);
  
  if (className) {
    console.log(`   ✅ Search Button Changes:`);
    console.log(`     Class: ${className}`);
    console.log(`     Data Test ID: ${dataTestId}`);
    console.log(`     Position: ${position}`);
  } else {
    console.log(`   ❌ No search button changes for this event`);
  }
};

window.compareSearchButtonSeeds = (seed1, seed2) => {
  console.log(`\n🔍 Comparing Search Button Seeds ${seed1} vs ${seed2}:`);
  console.log(`   Seed ${seed1}: ${getLayoutPattern(seed1)}`);
  console.log(`   Seed ${seed2}: ${getLayoutPattern(seed2)}`);
  
  const class1 = SeedVariationManager.getClassName('searchButton', seed1);
  const class2 = SeedVariationManager.getClassName('searchButton', seed2);
  const data1 = SeedVariationManager.getDataTestId('searchButton', seed1);
  const data2 = SeedVariationManager.getDataTestId('searchButton', seed2);
  const pos1 = SeedVariationManager.getPosition('searchButton', seed1);
  const pos2 = SeedVariationManager.getPosition('searchButton', seed2);
  
  console.log(`   Search Button:`);
  console.log(`     Seed ${seed1}: ${class1} (${data1}, ${pos1})`);
  console.log(`     Seed ${seed2}: ${class2} (${data2}, ${pos2})`);
  console.log(`     Different: ${class1 !== class2 ? '✅' : '❌'}`);
};

console.log("\n🧪 TESTING FUNCTIONS AVAILABLE:");
console.log("===============================");
console.log("testSearchButtonVariations() - Show all search button variations");
console.log("testSearchButtonSeed(1) - Test specific seed");
console.log("testSearchButtonEvent('SEARCH_RESTAURANT') - Test specific event");
console.log("compareSearchButtonSeeds(1, 2) - Compare two seeds");

// Auto-run the test when script is loaded
setTimeout(() => {
  console.log("\n🚀 Auto-running search button variations test...");
  testSearchButtonVariations();
}, 1000); 