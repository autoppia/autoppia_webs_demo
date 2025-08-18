// Test script to demonstrate the dynamic layout system
// This script can be run in the browser console to test all variants

const testLayoutVariants = () => {
  console.log('🧪 Testing AutoMail Dynamic Layout System');
  console.log('==========================================');
  
  const variants = [
    { id: 1, name: 'Classic Gmail' },
    { id: 2, name: 'Right Sidebar' },
    { id: 3, name: 'Top Navigation' },
    { id: 4, name: 'Split View' },
    { id: 5, name: 'Card Layout' },
    { id: 6, name: 'Minimalist' },
    { id: 7, name: 'Dashboard Style' },
    { id: 8, name: 'Mobile First' },
    { id: 9, name: 'Terminal Style' },
    { id: 10, name: 'Magazine Layout' }
  ];

  // Test current variant
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  const currentSeed = urlParams.get('seed') || '1';
  
  console.log(`📍 Current variant: ${currentSeed} - ${variants[currentSeed - 1]?.name}`);
  console.log(`🔗 URL: ${currentUrl}`);
  
  // Test x-path selectors for current variant
  console.log('\n🔍 Testing X-Path Selectors:');
  
  const xpathTests = [
    {
      name: 'Email Items',
      selectors: [
        "//div[contains(@class, 'email-item-hover')]",
        "//div[contains(@class, 'email-container')]",
        "//section[contains(@class, 'email-card')]",
        "//article[contains(@class, 'email-entry')]",
        "//div[contains(@class, 'email-card')]",
        "//li[contains(@class, 'email-row')]",
        "//div[contains(@class, 'widget-email')]",
        "//div[contains(@class, 'mobile-email')]",
        "//div[contains(@class, 'terminal-line')]",
        "//article[contains(@class, 'magazine-article')]"
      ]
    },
    {
      name: 'Star Buttons',
      selectors: [
        "//button[contains(@class, 'opacity-0')]//*[name()='svg']",
        "//div[contains(@class, 'star-container')]//*[name()='svg']",
        "//section[contains(@class, 'email-card')]//div[contains(@class, 'star-icon')]",
        "//article[contains(@class, 'email-entry')]//span[contains(@class, 'star-element')]",
        "//div[contains(@class, 'email-card')]//div[contains(@class, 'card-star')]",
        "//li[contains(@class, 'email-row')]//i[contains(@class, 'star-icon')]",
        "//div[contains(@class, 'widget-email')]//div[contains(@class, 'widget-star')]",
        "//div[contains(@class, 'mobile-email')]//div[contains(@class, 'mobile-star')]",
        "//div[contains(@class, 'terminal-line')]//span[contains(@class, 'line-star')]",
        "//article[contains(@class, 'magazine-article')]//div[contains(@class, 'article-star')]"
      ]
    },
    {
      name: 'Compose Buttons',
      selectors: [
        "//button[contains(text(), 'Compose')]",
        "//div[contains(@class, 'compose-fab')]//button",
        "//div[contains(@class, 'floating-compose')]//button",
        "//aside[contains(@class, 'sidebar-panel')]//span[contains(@class, 'compose-element')]",
        "//div[contains(@class, 'header-actions')]//div[contains(@class, 'header-compose')]",
        "//div[contains(@class, 'center-actions')]//button[contains(@class, 'center-compose')]",
        "//div[contains(@class, 'floating-widget')]//div[contains(@class, 'widget-compose')]",
        "//div[contains(@class, 'mobile-fab')]//div[contains(@class, 'fab-compose')]",
        "//div[contains(@class, 'terminal-header')]//span[contains(@class, 'header-compose')]",
        "//div[contains(@class, 'floating-magazine')]//div[contains(@class, 'magazine-compose')]"
      ]
    }
  ];

  xpathTests.forEach(test => {
    console.log(`\n📋 ${test.name}:`);
    test.selectors.forEach((selector, index) => {
      try {
        const elements = document.evaluate(
          selector,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        const count = elements.snapshotLength;
        const variantName = variants[index]?.name || `Variant ${index + 1}`;
        console.log(`  ${variantName}: ${count} elements found`);
      } catch (error) {
        console.log(`  ${variants[index]?.name || `Variant ${index + 1}`}: Error - ${error.message}`);
      }
    });
  });

  // Test CSS classes
  console.log('\n🎨 Testing CSS Classes:');
  
  const cssTests = [
    { name: 'Email Items', classes: ['email-item-hover', 'email-container', 'email-card', 'email-entry', 'email-row', 'widget-email', 'mobile-email', 'terminal-line', 'magazine-article'] },
    { name: 'Star Buttons', classes: ['star-container', 'star-icon', 'star-element', 'card-star', 'widget-star', 'mobile-star', 'line-star', 'article-star'] },
    { name: 'Checkboxes', classes: ['select-box', 'select-icon', 'check-element', 'card-check', 'row-check', 'widget-check', 'mobile-check', 'line-check', 'article-check'] }
  ];

  cssTests.forEach(test => {
    console.log(`\n📋 ${test.name}:`);
    test.classes.forEach(className => {
      const elements = document.getElementsByClassName(className);
      console.log(`  ${className}: ${elements.length} elements found`);
    });
  });

  // Test event functionality
  console.log('\n⚡ Testing Event Functionality:');
  
  // Test if events are working by checking for event listeners
  const testElements = document.querySelectorAll('[onclick], [onclick]');
  console.log(`  Elements with click handlers: ${testElements.length}`);
  
  // Test if logEvent function is available
  if (typeof window.logEvent === 'function') {
    console.log('  ✅ logEvent function is available');
  } else {
    console.log('  ❌ logEvent function not found');
  }

  console.log('\n✅ Layout variant test completed!');
  console.log('\n💡 Tips:');
  console.log('  - Use the numbered buttons in the top-left to switch variants');
  console.log('  - Check the browser console for event logs');
  console.log('  - Try different x-path selectors for each variant');
  console.log('  - All functionality should work identically across variants');
};

// Auto-run the test if this script is loaded
if (typeof window !== 'undefined') {
  // Wait for the page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testLayoutVariants);
  } else {
    testLayoutVariants();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testLayoutVariants };
} 