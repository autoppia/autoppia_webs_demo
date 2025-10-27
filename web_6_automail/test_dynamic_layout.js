// Test script to verify dynamic layout system
const puppeteer = require('puppeteer');

async function testDynamicLayout() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🧪 Testing Dynamic Layout System for web_6_automail');
  console.log('=' .repeat(60));
  
  // Test different seed values
  const testSeeds = [1, 5, 8, 180, 200, 250];
  
  for (const seed of testSeeds) {
    console.log(`\n📊 Testing seed: ${seed}`);
    console.log('-'.repeat(30));
    
    try {
      await page.goto(`http://localhost:8000?seed=${seed}`, { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });
      
      // Wait for the page to fully load
      await page.waitForTimeout(2000);
      
      // Check if dynamic layout classes are applied
      const bodyClasses = await page.evaluate(() => {
        return document.body.className;
      });
      
      console.log(`  Body classes: ${bodyClasses}`);
      
      // Check for specific layout classes
      const layoutClasses = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="search-"], [class*="navbar-"], [class*="content-"], [class*="cards-"], [class*="buttons-"], [class*="spacing-"], [class*="email-"], [class*="sidebar-"]');
        return Array.from(elements).map(el => el.className).filter(cls => cls.includes('-'));
      });
      
      if (layoutClasses.length > 0) {
        console.log(`  ✅ Dynamic classes found: ${layoutClasses.slice(0, 3).join(', ')}${layoutClasses.length > 3 ? '...' : ''}`);
      } else {
        console.log(`  ⚠️  No dynamic classes detected`);
      }
      
      // Check if the layout configuration is being applied
      const layoutConfig = await page.evaluate(() => {
        // Check if the seed-based layout system is working
        const searchInput = document.querySelector('input[placeholder*="search"]');
        const sidebar = document.querySelector('[class*="sidebar"]');
        const emailList = document.querySelector('[class*="email"]');
        
        return {
          hasSearchInput: !!searchInput,
          hasSidebar: !!sidebar,
          hasEmailList: !!emailList,
          searchPlaceholder: searchInput ? searchInput.placeholder : null
        };
      });
      
      console.log(`  Layout elements:`, layoutConfig);
      
    } catch (error) {
      console.log(`  ❌ Error testing seed ${seed}: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log('\n🎉 Dynamic layout testing completed!');
}

// Run the test
testDynamicLayout().catch(console.error);
