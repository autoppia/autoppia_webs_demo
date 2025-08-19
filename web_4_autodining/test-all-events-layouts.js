// Test script to demonstrate layout changes for ALL events
// Run this in the browser console after the app is loaded

console.log("🎯 Testing Layout Changes for ALL Events");
console.log("========================================");

// Mock the SeedVariationManager for testing
class SeedVariationManager {
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
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-yellow-50",
        dataTestId: "page-layout-search-active",
        layoutType: 'block'
      },
      "cardContainer": {
        className: "flex overflow-x-auto gap-4 bg-yellow-100 p-2 rounded-lg",
        dataTestId: "card-container-search-active",
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
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-blue-50",
        dataTestId: "page-layout-view-active",
        layoutType: 'block'
      },
      "sectionLayout": {
        className: "mb-8 bg-blue-100 p-4 rounded-lg",
        dataTestId: "section-layout-view-active",
        layoutType: 'block'
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
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-green-50",
        dataTestId: "page-layout-booking-active",
        layoutType: 'block'
      },
      "sectionLayout": {
        className: "mb-8 bg-green-100 p-4 rounded-lg",
        dataTestId: "section-layout-booking-active",
        layoutType: 'block'
      }
    },
    "TIME_DROPDOWN_OPENED": {
      "dropdown": {
        className: "absolute z-20 bg-orange-50 border-2 rounded-xl shadow-xl p-3",
        dataTestId: "dropdown-time-active",
        position: 'absolute'
      },
      "searchBar": {
        className: "w-full px-4 py-2 border-2 rounded-lg bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500",
        dataTestId: "search-bar-time-dropdown-active",
        position: 'relative'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-orange-50",
        dataTestId: "page-layout-time-dropdown-active",
        layoutType: 'block'
      }
    },
    "DATE_DROPDOWN_OPENED": {
      "dropdown": {
        className: "absolute z-20 bg-purple-50 border-2 rounded-xl shadow-xl p-3",
        dataTestId: "dropdown-date-active",
        position: 'absolute'
      },
      "searchBar": {
        className: "w-full px-4 py-2 border-2 rounded-lg bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500",
        dataTestId: "search-bar-date-dropdown-active",
        position: 'relative'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-purple-50",
        dataTestId: "page-layout-date-dropdown-active",
        layoutType: 'block'
      }
    },
    "PEOPLE_DROPDOWN_OPENED": {
      "dropdown": {
        className: "absolute z-20 bg-pink-50 border-2 rounded-xl shadow-xl p-3",
        dataTestId: "dropdown-people-active",
        position: 'absolute'
      },
      "searchBar": {
        className: "w-full px-4 py-2 border-2 rounded-lg bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500",
        dataTestId: "search-bar-people-dropdown-active",
        position: 'relative'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-pink-50",
        dataTestId: "page-layout-people-dropdown-active",
        layoutType: 'block'
      }
    },
    "SCROLL_VIEW": {
      "cardContainer": {
        className: "flex overflow-x-auto gap-4 bg-gray-50 p-2 rounded-lg",
        dataTestId: "card-container-scrolling",
        layoutType: 'flex'
      },
      "restaurantCard": {
        className: "rounded-xl border-2 shadow-lg bg-gray-100 w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-scrolling",
        layoutType: 'flex'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-gray-50",
        dataTestId: "page-layout-scrolling",
        layoutType: 'block'
      }
    },
    "COUNTRY_SELECTED": {
      "form": {
        className: "space-y-4 bg-blue-50 p-4 rounded-lg",
        dataTestId: "form-country-selected",
        layoutType: 'block'
      },
      "searchBar": {
        className: "w-full px-4 py-2 border-2 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
        dataTestId: "search-bar-country-selected",
        position: 'relative'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-blue-50",
        dataTestId: "page-layout-country-selected",
        layoutType: 'block'
      },
      "sectionLayout": {
        className: "mb-8 bg-blue-100 p-4 rounded-lg",
        dataTestId: "section-layout-country-selected",
        layoutType: 'block'
      }
    },
    "OCCASION_SELECTED": {
      "form": {
        className: "space-y-4 bg-green-50 p-4 rounded-lg",
        dataTestId: "form-occasion-selected",
        layoutType: 'block'
      },
      "searchBar": {
        className: "w-full px-4 py-2 border-2 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500",
        dataTestId: "search-bar-occasion-selected",
        position: 'relative'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-green-50",
        dataTestId: "page-layout-occasion-selected",
        layoutType: 'block'
      },
      "sectionLayout": {
        className: "mb-8 bg-green-100 p-4 rounded-lg",
        dataTestId: "section-layout-occasion-selected",
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
      },
      "restaurantCard": {
        className: "rounded-xl border-2 shadow-xl bg-purple-50 w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-complete",
        layoutType: 'flex'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-purple-50",
        dataTestId: "page-layout-reservation-complete",
        layoutType: 'block'
      },
      "sectionLayout": {
        className: "mb-8 bg-purple-100 p-4 rounded-lg",
        dataTestId: "section-layout-reservation-complete",
        layoutType: 'block'
      }
    },
    "VIEW_FULL_MENU": {
      "restaurantCard": {
        className: "rounded-xl border-2 shadow-xl bg-indigo-50 w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-menu-viewed",
        layoutType: 'flex'
      },
      "bookButton": {
        className: "bg-indigo-800 hover:bg-indigo-900 text-white px-6 py-3 rounded-lg font-bold",
        dataTestId: "book-btn-menu-viewed",
        position: 'relative'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-indigo-50",
        dataTestId: "page-layout-menu-viewed",
        layoutType: 'block'
      },
      "sectionLayout": {
        className: "mb-8 bg-indigo-100 p-4 rounded-lg",
        dataTestId: "section-layout-menu-viewed",
        layoutType: 'block'
      }
    },
    "COLLAPSE_MENU": {
      "restaurantCard": {
        className: "rounded-xl border shadow-sm bg-white w-[255px] flex-shrink-0 overflow-hidden flex flex-col justify-between",
        dataTestId: "restaurant-card-menu-collapsed",
        layoutType: 'flex'
      },
      "bookButton": {
        className: "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold",
        dataTestId: "book-btn-menu-collapsed",
        position: 'relative'
      },
      "pageLayout": {
        className: "max-w-6xl mx-auto px-4 py-8 bg-white",
        dataTestId: "page-layout-menu-collapsed",
        layoutType: 'block'
      },
      "sectionLayout": {
        className: "mb-8 bg-white p-4 rounded-lg",
        dataTestId: "section-layout-menu-collapsed",
        layoutType: 'block'
      }
    }
  };

  static getEventVariation(eventType, componentType) {
    if (this.eventVariations[eventType] && this.eventVariations[eventType][componentType]) {
      return this.eventVariations[eventType][componentType];
    }
    return null;
  }

  static getEventClassName(eventType, componentType) {
    const variation = this.getEventVariation(eventType, componentType);
    return variation ? variation.className : "";
  }

  static getEventDataTestId(eventType, componentType) {
    const variation = this.getEventVariation(eventType, componentType);
    return variation ? variation.dataTestId : "";
  }
}

// All events that trigger layout changes
const ALL_EVENTS = [
  "SEARCH_RESTAURANT",
  "TIME_DROPDOWN_OPENED",
  "DATE_DROPDOWN_OPENED",
  "PEOPLE_DROPDOWN_OPENED",
  "SCROLL_VIEW",
  "VIEW_RESTAURANT",
  "BOOK_RESTAURANT",
  "COUNTRY_SELECTED",
  "OCCASION_SELECTED",
  "RESERVATION_COMPLETE",
  "VIEW_FULL_MENU",
  "COLLAPSE_MENU"
];

// All component types that can be affected
const ALL_COMPONENTS = [
  "searchBar",
  "restaurantCard",
  "bookButton",
  "dropdown",
  "pageLayout",
  "sectionLayout",
  "cardContainer",
  "form"
];

// Test function to show all event-based layout changes
function testAllEventsLayouts() {
  console.log("\n🎯 ALL EVENTS LAYOUT CHANGES:");
  console.log("==============================");
  
  ALL_EVENTS.forEach(event => {
    console.log(`\n📋 Event: ${event}`);
    console.log(`   Trigger: logEvent('${event}', { data: 'test' })`);
    
    const affectedComponents = [];
    ALL_COMPONENTS.forEach(component => {
      const variation = SeedVariationManager.getEventVariation(event, component);
      if (variation) {
        affectedComponents.push({
          component,
          className: variation.className,
          dataTestId: variation.dataTestId,
          layoutType: variation.layoutType || 'default',
          position: variation.position || 'default'
        });
      }
    });
    
    if (affectedComponents.length > 0) {
      console.log(`   ✅ Affects ${affectedComponents.length} components:`);
      affectedComponents.forEach(comp => {
        console.log(`      • ${comp.component}:`);
        console.log(`        Class: ${comp.className}`);
        console.log(`        Data Test ID: ${comp.dataTestId}`);
        console.log(`        Layout Type: ${comp.layoutType}`);
        console.log(`        Position: ${comp.position}`);
      });
    } else {
      console.log(`   ❌ No layout changes defined`);
    }
  });

  console.log("\n🎨 EVENT COLOR SCHEMES:");
  console.log("=======================");
  console.log("• SEARCH_RESTAURANT: Yellow theme (bg-yellow-50, ring-yellow-500)");
  console.log("• VIEW_RESTAURANT: Blue theme (bg-blue-50, bg-blue-800)");
  console.log("• BOOK_RESTAURANT: Green theme (bg-green-50, bg-green-800)");
  console.log("• TIME_DROPDOWN_OPENED: Orange theme (bg-orange-50, ring-orange-500)");
  console.log("• DATE_DROPDOWN_OPENED: Purple theme (bg-purple-50, ring-purple-500)");
  console.log("• PEOPLE_DROPDOWN_OPENED: Pink theme (bg-pink-50, ring-pink-500)");
  console.log("• SCROLL_VIEW: Gray theme (bg-gray-50, bg-gray-100)");
  console.log("• COUNTRY_SELECTED: Blue theme (bg-blue-50, ring-blue-500)");
  console.log("• OCCASION_SELECTED: Green theme (bg-green-50, ring-green-500)");
  console.log("• RESERVATION_COMPLETE: Purple theme (bg-purple-50, bg-purple-800)");
  console.log("• VIEW_FULL_MENU: Indigo theme (bg-indigo-50, bg-indigo-800)");
  console.log("• COLLAPSE_MENU: Default theme (bg-white, bg-gray-600)");

  console.log("\n🔧 COMPONENT AFFECTIONS:");
  console.log("========================");
  ALL_COMPONENTS.forEach(component => {
    const affectingEvents = ALL_EVENTS.filter(event => 
      SeedVariationManager.getEventVariation(event, component)
    );
    console.log(`• ${component}: ${affectingEvents.length} events`);
    if (affectingEvents.length > 0) {
      console.log(`  Events: ${affectingEvents.join(', ')}`);
    }
  });
}

// Interactive testing functions
window.testAllEventsLayouts = testAllEventsLayouts;

window.testSpecificEvent = (eventType) => {
  console.log(`\n🧪 Testing Event: ${eventType}`);
  console.log(`   Trigger: logEvent('${eventType}', { data: 'test' })`);
  
  const affectedComponents = [];
  ALL_COMPONENTS.forEach(component => {
    const variation = SeedVariationManager.getEventVariation(eventType, component);
    if (variation) {
      affectedComponents.push({
        component,
        className: variation.className,
        dataTestId: variation.dataTestId,
        layoutType: variation.layoutType || 'default',
        position: variation.position || 'default'
      });
    }
  });
  
  if (affectedComponents.length > 0) {
    console.log(`   ✅ Affects ${affectedComponents.length} components:`);
    affectedComponents.forEach(comp => {
      console.log(`      • ${comp.component}:`);
      console.log(`        Class: ${comp.className}`);
      console.log(`        Data Test ID: ${comp.dataTestId}`);
      console.log(`        Layout Type: ${comp.layoutType}`);
      console.log(`        Position: ${comp.position}`);
    });
  } else {
    console.log(`   ❌ No layout changes defined for this event`);
  }
};

window.testComponentAffections = (componentType) => {
  console.log(`\n🧪 Testing Component: ${componentType}`);
  
  const affectingEvents = ALL_EVENTS.filter(event => 
    SeedVariationManager.getEventVariation(event, componentType)
  );
  
  if (affectingEvents.length > 0) {
    console.log(`   ✅ Affected by ${affectingEvents.length} events:`);
    affectingEvents.forEach(event => {
      const variation = SeedVariationManager.getEventVariation(event, componentType);
      console.log(`      • ${event}:`);
      console.log(`        Class: ${variation.className}`);
      console.log(`        Data Test ID: ${variation.dataTestId}`);
    });
  } else {
    console.log(`   ❌ No events affect this component`);
  }
};

window.triggerTestEvent = (eventType) => {
  if (typeof logEvent === 'function') {
    logEvent(eventType, { test: true });
    console.log(`🎯 Test event triggered: ${eventType}`);
    
    // Show what changes this event causes
    setTimeout(() => {
      testSpecificEvent(eventType);
    }, 100);
  } else {
    console.log("❌ logEvent function not available");
  }
};

console.log("\n🧪 TESTING FUNCTIONS AVAILABLE:");
console.log("===============================");
console.log("testAllEventsLayouts() - Show all event layout changes");
console.log("testSpecificEvent('SEARCH_RESTAURANT') - Test specific event");
console.log("testComponentAffections('searchBar') - Test specific component");
console.log("triggerTestEvent('SEARCH_RESTAURANT') - Trigger test event");

// Auto-run the test when script is loaded
setTimeout(() => {
  console.log("\n🚀 Auto-running all events layout test...");
  testAllEventsLayouts();
}, 1000); 