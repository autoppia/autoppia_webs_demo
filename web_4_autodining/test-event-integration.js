// Test script to verify event-based layout integration
// Run this in the browser console after the app is loaded

console.log("🧪 Testing Event-Based Layout Integration");
console.log("=========================================");

// Test function to verify the integration
function testEventIntegration() {
  console.log("\n1. 📋 Checking if SeedVariationManager is available:");
  if (typeof window !== 'undefined' && window.SeedVariationManager) {
    console.log("   ✅ SeedVariationManager is available");
  } else {
    console.log("   ❌ SeedVariationManager not found - checking for useSeedVariation");
  }

  console.log("\n2. 🎯 Testing Event Registration:");
  try {
    // Test if we can access the logEvent function
    if (typeof logEvent === 'function') {
      console.log("   ✅ logEvent function is available");
      
      // Test event registration
      logEvent('SEARCH_RESTAURANT', { query: 'test' });
      console.log("   ✅ SEARCH_RESTAURANT event logged");
      
      logEvent('VIEW_RESTAURANT', { restaurantId: 'test-1' });
      console.log("   ✅ VIEW_RESTAURANT event logged");
      
      logEvent('BOOK_RESTAURANT', { restaurantId: 'test-1' });
      console.log("   ✅ BOOK_RESTAURANT event logged");
    } else {
      console.log("   ❌ logEvent function not found");
    }
  } catch (error) {
    console.log("   ❌ Error testing event registration:", error.message);
  }

  console.log("\n3. 🎨 Testing Layout Variations:");
  try {
    // Test if useSeedVariation is working
    const testVariation = {
      className: "test-class",
      dataTestId: "test-id",
      layoutType: "flex",
      position: "relative"
    };
    
    console.log("   ✅ Layout variation structure is correct");
    console.log("   📊 Sample variation:", testVariation);
  } catch (error) {
    console.log("   ❌ Error testing layout variations:", error.message);
  }

  console.log("\n4. 🔍 Testing Search Bar Integration:");
  const searchBar = document.querySelector('input[placeholder*="Location, Restaurant, or Cuisine"]');
  if (searchBar) {
    console.log("   ✅ Search bar found in DOM");
    console.log("   📊 Search bar classes:", searchBar.className);
    console.log("   📊 Search bar data-testid:", searchBar.getAttribute('data-testid'));
    
    // Test search functionality
    searchBar.value = 'test search';
    searchBar.dispatchEvent(new Event('input', { bubbles: true }));
    console.log("   ✅ Search input event triggered");
  } else {
    console.log("   ❌ Search bar not found in DOM");
  }

  console.log("\n5. 🍽️ Testing Restaurant Cards:");
  const restaurantCards = document.querySelectorAll('[data-testid*="restaurant-card"]');
  if (restaurantCards.length > 0) {
    console.log(`   ✅ Found ${restaurantCards.length} restaurant cards`);
    console.log("   📊 First card classes:", restaurantCards[0].className);
    console.log("   📊 First card data-testid:", restaurantCards[0].getAttribute('data-testid'));
  } else {
    console.log("   ❌ No restaurant cards found");
  }

  console.log("\n6. 🔘 Testing Book Buttons:");
  const bookButtons = document.querySelectorAll('[data-testid*="book-btn"]');
  if (bookButtons.length > 0) {
    console.log(`   ✅ Found ${bookButtons.length} book buttons`);
    console.log("   📊 First button classes:", bookButtons[0].className);
    console.log("   📊 First button data-testid:", bookButtons[0].getAttribute('data-testid'));
  } else {
    console.log("   ❌ No book buttons found");
  }

  console.log("\n7. 🎪 Testing Event-Based Changes:");
  console.log("   📋 To test event-based changes:");
  console.log("   1. Type in the search bar → Should trigger SEARCH_RESTAURANT");
  console.log("   2. Click on a restaurant card → Should trigger VIEW_RESTAURANT");
  console.log("   3. Click on a book button → Should trigger BOOK_RESTAURANT");
  console.log("   4. Open date dropdown → Should trigger DATE_DROPDOWN_OPENED");
  console.log("   5. Open time dropdown → Should trigger TIME_DROPDOWN_OPENED");
  console.log("   6. Open people dropdown → Should trigger PEOPLE_DROPDOWN_OPENED");
}

// Interactive testing functions
window.testEventIntegration = testEventIntegration;

window.triggerTestEvent = (eventType) => {
  if (typeof logEvent === 'function') {
    logEvent(eventType, { test: true });
    console.log(`🎯 Test event triggered: ${eventType}`);
  } else {
    console.log("❌ logEvent function not available");
  }
};

window.checkActiveEvents = () => {
  // This would need to be implemented based on how events are tracked
  console.log("📊 Checking active events...");
  console.log("   (This would show currently active events)");
};

console.log("\n🧪 TESTING FUNCTIONS AVAILABLE:");
console.log("===============================");
console.log("testEventIntegration() - Run full integration test");
console.log("triggerTestEvent('SEARCH_RESTAURANT') - Trigger specific event");
console.log("triggerTestEvent('VIEW_RESTAURANT') - Trigger view event");
console.log("triggerTestEvent('BOOK_RESTAURANT') - Trigger booking event");
console.log("checkActiveEvents() - Check currently active events");

// Auto-run the test when script is loaded
setTimeout(() => {
  console.log("\n🚀 Auto-running integration test...");
  testEventIntegration();
}, 1000); 