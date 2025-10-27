const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const testTextStructure = async (seedStructure, expectedAppName, expectedSearchPlaceholder) => {
    console.log(`\n🧪 Testing seed-structure: ${seedStructure}`);
    await page.goto(`http://localhost:3000/?seed=1&seed-structure=${seedStructure}`);
    await page.waitForSelector('body');

    // Test app name
    const appName = await page.evaluate(() => {
      const element = document.querySelector('span[class*="bg-gradient-to-r from-primary"]');
      return element ? element.textContent.trim() : null;
    });
    
    // Test search placeholder
    const searchPlaceholder = await page.evaluate(() => {
      const element = document.querySelector('input[type="text"]');
      return element ? element.placeholder : null;
    });

    // Test compose button text
    const composeButtonText = await page.evaluate(() => {
      const element = document.querySelector('button[id*="compose"]');
      return element ? element.textContent.trim() : null;
    });

    // Test navigation labels
    const inboxLabel = await page.evaluate(() => {
      const element = document.querySelector('button[id*="inbox"]');
      return element ? element.textContent.trim() : null;
    });

    console.log(`  App Name: ${appName} ${appName === expectedAppName ? '✅' : '❌'}`);
    console.log(`  Search Placeholder: ${searchPlaceholder} ${searchPlaceholder === expectedSearchPlaceholder ? '✅' : '❌'}`);
    console.log(`  Compose Button: ${composeButtonText}`);
    console.log(`  Inbox Label: ${inboxLabel}`);

    return {
      appName: appName === expectedAppName,
      searchPlaceholder: searchPlaceholder === expectedSearchPlaceholder,
      composeButton: composeButtonText !== null,
      inboxLabel: inboxLabel !== null
    };
  };

  console.log('🚀 Testing Dynamic Text Structure System');
  console.log('==========================================');

  const tests = [
    { seed: 1, appName: 'AutoMail', searchPlaceholder: 'Search mail' },
    { seed: 2, appName: 'MailBox', searchPlaceholder: 'Find messages' },
    { seed: 3, appName: 'SearchMail', searchPlaceholder: 'Search everything' },
    { seed: 4, appName: 'MailHub', searchPlaceholder: 'Find in mail' },
    { seed: 5, appName: 'QuickMail', searchPlaceholder: 'Search' },
    { seed: 6, appName: 'FloatMail', searchPlaceholder: 'Discover messages' },
    { seed: 7, appName: 'CleanMail', searchPlaceholder: 'Search mail' },
    { seed: 8, appName: 'WideMail', searchPlaceholder: 'Search all messages' },
    { seed: 9, appName: 'SideMail', searchPlaceholder: 'Search messages' },
    { seed: 10, appName: 'PremiumMail', searchPlaceholder: 'Search your correspondence' }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    const result = await testTextStructure(test.seed, test.appName, test.searchPlaceholder);
    if (result.appName && result.searchPlaceholder && result.composeButton && result.inboxLabel) {
      passedTests++;
    }
  }

  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Dynamic text structure system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }

  await browser.close();
})();
