// Test script to demonstrate event-based layout changes
// Run this in the browser console or Node.js environment

// Mock the SeedVariationManager for testing
class SeedVariationManager {
  static variations = {
    restaurantCard: [
      { 
        className: "rounded-xl border shadow-sm bg-white w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between", 
        dataTestId: "restaurant-card-layout-a",
        layoutType: 'flex'
      },
      { 
        className: "rounded-lg border-2 shadow-md bg-gray-50 w-[260px] flex-shrink-0 overflow-hidden grid grid-cols-1 gap-2 p-3", 
        dataTestId: "restaurant-card-layout-b",
        layoutType: 'grid'
      },
      { 
        className: "rounded-2xl border shadow-lg bg-white w-[250px] flex-shrink-0 overflow-hidden block p-4", 
        dataTestId: "restaurant-card-layout-c",
        layoutType: 'block'
      },
    ],
    
    bookButton: [
      { 
        className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold", 
        dataTestId: "book-btn-layout-a",
        position: 'relative'
      },
      { 
        className: "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg absolute top-2 right-2 font-semibold", 
        dataTestId: "book-btn-layout-b",
        position: 'absolute'
      },
      { 
        className: "bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-full fixed bottom-4 right-4 font-semibold", 
        dataTestId: "book-btn-layout-c",
        position: 'fixed'
      },
    ],
    
    searchBar: [
      { 
        className: "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", 
        dataTestId: "search-bar-layout-a",
        position: 'relative'
      },
      { 
        className: "w-full px-6 py-3 border-2 rounded-xl absolute top-0 left-0 focus:outline-none focus:ring-2 focus:ring-green-500", 
        dataTestId: "search-bar-layout-b",
        position: 'absolute'
      },
      { 
        className: "w-full px-3 py-2 border rounded-md fixed top-4 left-4 focus:outline-none focus:ring-2 focus:ring-purple-500", 
        dataTestId: "search-bar-layout-c",
        position: 'fixed'
      },
    ],
  };

  static eventVariations = {
    "SEARCH_RESTAURANT": {
      "searchBar": {
        className: "w-full px-6 py-3 border-2 rounded-xl bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500",
        dataTestId: "search-bar-event-active",
        position: 'relative'
      },
      "restaurantCard": {
        className: "rounded-xl border-2 shadow-lg bg-yellow-50 w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-event-active",
        layoutType: 'flex'
      }
    },
    "VIEW_RESTAURANT": {
      "restaurantCard": {
        className: "rounded-xl border-2 shadow-xl bg-blue-50 w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-viewed",
        layoutType: 'flex'
      },
      "bookButton": {
        className: "bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-bold",
        dataTestId: "book-btn-viewed",
        position: 'relative'
      }
    },
    "BOOK_RESTAURANT": {
      "bookButton": {
        className: "bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-xl font-bold animate-pulse",
        dataTestId: "book-btn-booking",
        position: 'relative'
      },
      "restaurantCard": {
        className: "rounded-xl border-2 shadow-xl bg-green-50 w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-booking",
        layoutType: 'flex'
      }
    },
    "TIME_DROPDOWN_OPENED": {
      "dropdown": {
        className: "absolute z-20 bg-orange-50 border-2 rounded-xl shadow-xl p-3",
        dataTestId: "dropdown-time-active",
        position: 'absolute'
      }
    },
    "DATE_DROPDOWN_OPENED": {
      "dropdown": {
        className: "absolute z-20 bg-purple-50 border-2 rounded-xl shadow-xl p-3",
        dataTestId: "dropdown-date-active",
        position: 'absolute'
      }
    },
    "PEOPLE_DROPDOWN_OPENED": {
      "dropdown": {
        className: "absolute z-20 bg-pink-50 border-2 rounded-xl shadow-xl p-3",
        dataTestId: "dropdown-people-active",
        position: 'absolute'
      }
    },
    "SCROLL_VIEW": {
      "cardContainer": {
        className: "flex overflow-x-auto gap-4 bg-gray-50 p-2 rounded-lg",
        dataTestId: "card-container-scrolling",
        layoutType: 'flex'
      }
    },
    "COUNTRY_SELECTED": {
      "form": {
        className: "space-y-4 bg-blue-50 p-4 rounded-lg",
        dataTestId: "form-country-selected",
        layoutType: 'block'
      }
    },
    "OCCASION_SELECTED": {
      "form": {
        className: "space-y-4 bg-green-50 p-4 rounded-lg",
        dataTestId: "form-occasion-selected",
        layoutType: 'block'
      }
    },
    "RESERVATION_COMPLETE": {
      "bookButton": {
        className: "bg-purple-800 hover:bg-purple-900 text-white px-8 py-3 rounded-xl font-bold",
        dataTestId: "book-btn-complete",
        position: 'relative'
      },
      "form": {
        className: "space-y-4 bg-purple-50 p-4 rounded-lg",
        dataTestId: "form-complete",
        layoutType: 'block'
      }
    },
    "VIEW_FULL_MENU": {
      "restaurantCard": {
        className: "rounded-xl border-2 shadow-xl bg-indigo-50 w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-menu-viewed",
        layoutType: 'flex'
      }
    },
    "COLLAPSE_MENU": {
      "restaurantCard": {
        className: "rounded-xl border shadow-sm bg-white w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-menu-collapsed",
        layoutType: 'flex'
      }
    }
  };

  static activeEvents = new Set();

  static registerEvent(eventType) {
    this.activeEvents.add(eventType);
    console.log(`🎯 Event registered: ${eventType}`);
    console.log(`📊 Active events: ${Array.from(this.activeEvents).join(', ')}`);
    
    // Auto-remove event after 5 seconds
    setTimeout(() => {
      this.activeEvents.delete(eventType);
      console.log(`⏰ Event expired: ${eventType}`);
      console.log(`📊 Active events: ${Array.from(this.activeEvents).join(', ')}`);
    }, 5000);
  }

  static getActiveEvents() {
    return Array.from(this.activeEvents);
  }

  static clearEvents() {
    this.activeEvents.clear();
    console.log("🧹 All events cleared");
  }

  static getVariation(type, seed, eventType) {
    // First check if there's an event-based variation
    if (eventType && this.eventVariations[eventType] && this.eventVariations[eventType][type]) {
      console.log(`🎯 Using event variation for ${type} with event ${eventType}`);
      return this.eventVariations[eventType][type];
    }

    // Check if any active events should override the layout
    for (const activeEvent of this.activeEvents) {
      if (this.eventVariations[activeEvent] && this.eventVariations[activeEvent][type]) {
        console.log(`🎯 Using active event variation for ${type} with event ${activeEvent}`);
        return this.eventVariations[activeEvent][type];
      }
    }

    // Fall back to seed-based variation
    const variations = this.variations[type];
    if (!variations) {
      return {};
    }
    
    const normalizedSeed = ((seed - 1) % 3) + 1;
    console.log(`🎲 Using seed variation for ${type} with seed ${seed} (normalized: ${normalizedSeed})`);
    return variations[normalizedSeed - 1] || variations[0];
  }

  static getClassName(type, seed, eventType) {
    const variation = this.getVariation(type, seed, eventType);
    return variation.className || "";
  }

  static getDataTestId(type, seed, eventType) {
    const variation = this.getVariation(type, seed, eventType);
    return variation.dataTestId || `${type}-${seed}`;
  }
}

// Test function to demonstrate event-based layout changes
function testEventLayouts() {
  console.log("🎯 Testing Event-Based Layout Changes");
  console.log("=====================================\n");

  const events = [
    "SEARCH_RESTAURANT",
    "VIEW_RESTAURANT", 
    "BOOK_RESTAURANT",
    "TIME_DROPDOWN_OPENED",
    "DATE_DROPDOWN_OPENED",
    "PEOPLE_DROPDOWN_OPENED",
    "SCROLL_VIEW",
    "COUNTRY_SELECTED",
    "OCCASION_SELECTED",
    "RESERVATION_COMPLETE",
    "VIEW_FULL_MENU",
    "COLLAPSE_MENU"
  ];

  console.log("📋 AVAILABLE EVENTS:");
  console.log("====================");
  events.forEach(event => {
    console.log(`   - ${event}`);
  });
  console.log("");

  console.log("🎪 EVENT-BASED LAYOUT CHANGES:");
  console.log("===============================");
  
  events.forEach(event => {
    console.log(`\n🎯 Event: ${event}`);
    console.log(`   Trigger: SeedVariationManager.registerEvent("${event}")`);
    
    // Register the event
    SeedVariationManager.registerEvent(event);
    
    // Show the changes for different components
    const components = ["restaurantCard", "bookButton", "searchBar", "dropdown", "form", "cardContainer"];
    
    components.forEach(component => {
      const className = SeedVariationManager.getClassName(component, 1, event);
      const dataTestId = SeedVariationManager.getDataTestId(component, 1, event);
      
      if (className) {
        console.log(`   ${component}:`);
        console.log(`     Class: ${className}`);
        console.log(`     Data Test ID: ${dataTestId}`);
      }
    });
  });

  console.log("\n🚨 SCRAPER CONFUSION TECHNIQUES:");
  console.log("=================================");
  console.log("1. Dynamic X-Path Changes:");
  console.log("   - X-paths change when events are triggered");
  console.log("   - Same element gets different data-testid based on events");
  console.log("   - Events auto-expire after 5 seconds");
  
  console.log("\n2. Event-Based Styling:");
  console.log("   - Search bar changes to yellow background when searching");
  console.log("   - Restaurant cards change to blue when viewed");
  console.log("   - Book buttons change to green when booking");
  console.log("   - Dropdowns change color based on type");
  
  console.log("\n3. Temporal Layout Changes:");
  console.log("   - Layouts change temporarily when events occur");
  console.log("   - Changes revert after 5 seconds");
  console.log("   - Multiple events can be active simultaneously");
  
  console.log("\n4. Event Priority System:");
  console.log("   - Event-based variations override seed-based variations");
  console.log("   - Most recent event takes priority");
  console.log("   - Fallback to seed-based variation when no events active");
}

// Run the test
testEventLayouts();

// Interactive testing functions
console.log("\n🧪 INTERACTIVE TESTING FUNCTIONS:");
console.log("==================================");
console.log("registerEvent('SEARCH_RESTAURANT') - Trigger search event");
console.log("registerEvent('VIEW_RESTAURANT') - Trigger view event");
console.log("registerEvent('BOOK_RESTAURANT') - Trigger booking event");
console.log("clearEvents() - Clear all active events");
console.log("getActiveEvents() - Show currently active events");

// Make functions globally available for testing
window.registerEvent = (eventType) => {
  SeedVariationManager.registerEvent(eventType);
  console.log(`🎯 Event registered: ${eventType}`);
  console.log(`📊 Active events: ${SeedVariationManager.getActiveEvents().join(', ')}`);
};

window.clearEvents = () => {
  SeedVariationManager.clearEvents();
  console.log("🧹 All events cleared");
};

window.getActiveEvents = () => {
  const events = SeedVariationManager.getActiveEvents();
  console.log(`📊 Active events: ${events.join(', ')}`);
  return events;
};

window.testComponent = (componentType, seed = 1, eventType = null) => {
  const className = SeedVariationManager.getClassName(componentType, seed, eventType);
  const dataTestId = SeedVariationManager.getDataTestId(componentType, seed, eventType);
  console.log(`🧪 Testing ${componentType} (seed: ${seed}, event: ${eventType || 'none'}):`);
  console.log(`   Class: ${className}`);
  console.log(`   Data Test ID: ${dataTestId}`);
};

console.log("\n✅ Test completed! Use the interactive functions to test event-based layouts."); 