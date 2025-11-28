// Layout debugging utilities for development and testing

import { getSeedLayout, getAllLayouts } from "@/dynamic/v1-layouts";

/**
 * Debug utility to log layout information to console
 * @param seed - Seed value to debug
 */
export function debugLayout(seed?: number) {
  const layout = getSeedLayout(seed);
  
  console.group(`🎨 Layout Debug - Seed ${seed || 'default'}`);
  console.log('Layout Name:', layout.name);
  console.log('Description:', layout.description);
  console.log('Container Type:', layout.container.type);
  console.log('Container Direction:', layout.container.direction);
  console.log('Container Class:', layout.container.className);
  
  console.group('Element Order:');
  const elements = [
    { name: 'Header', config: layout.elements.header },
    { name: 'Sidebar', config: layout.elements.sidebar },
    { name: 'Content', config: layout.elements.content },
    { name: 'Footer', config: layout.elements.footer },
  ].sort((a, b) => a.config.order - b.config.order);
  
  elements.forEach((element, index) => {
    console.log(`${index + 1}. ${element.name} (order: ${element.config.order})`);
    console.log(`   Position: ${'position' in element.config ? element.config.position : 'static'}`);
    console.log(`   Class: ${element.config.className}`);
  });
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * Compare two layouts and show differences
 * @param seed1 - First seed to compare
 * @param seed2 - Second seed to compare
 */
export function compareLayouts(seed1: number, seed2: number) {
  const layout1 = getSeedLayout(seed1);
  const layout2 = getSeedLayout(seed2);
  
  console.group(`🔄 Layout Comparison: Seed ${seed1} vs Seed ${seed2}`);
  
  // Compare container
  if (layout1.container.type !== layout2.container.type) {
    console.log(`Container Type: ${layout1.container.type} → ${layout2.container.type}`);
  }
  if (layout1.container.direction !== layout2.container.direction) {
    console.log(`Container Direction: ${layout1.container.direction} → ${layout2.container.direction}`);
  }
  
  // Compare element order
  const elements1 = [
    { name: 'Header', order: layout1.elements.header.order },
    { name: 'Sidebar', order: layout1.elements.sidebar.order },
    { name: 'Content', order: layout1.elements.content.order },
    { name: 'Footer', order: layout1.elements.footer.order },
  ].sort((a, b) => a.order - b.order);
  
  const elements2 = [
    { name: 'Header', order: layout2.elements.header.order },
    { name: 'Sidebar', order: layout2.elements.sidebar.order },
    { name: 'Content', order: layout2.elements.content.order },
    { name: 'Footer', order: layout2.elements.footer.order },
  ].sort((a, b) => a.order - b.order);
  
  console.log('Element Order Changes:');
  elements1.forEach((element, index) => {
    const element2 = elements2[index];
    if (element.name !== element2.name) {
      console.log(`  Position ${index + 1}: ${element.name} → ${element2.name}`);
    }
  });
  
  console.groupEnd();
}

/**
 * Get all available layouts as a formatted list
 */
export function listAllLayouts() {
  const layouts = getAllLayouts();
  
  console.group('📋 All Available Layouts');
  layouts.forEach((layout, index) => {
    const seed = index + 1;
    console.log(`${seed}. ${layout.name}`);
    console.log(`   ${layout.description}`);
  });
  console.groupEnd();
}

/**
 * Generate XPath examples for different elements across layouts
 * This helps demonstrate how XPath selectors become unreliable
 */
export function generateXPathExamples() {
  const layouts = getAllLayouts();
  
  console.group('🎯 XPath Selector Examples (Anti-Scraping Demo)');
  
  const elements = ['header', 'sidebar', 'content', 'footer'];
  
  elements.forEach(element => {
    console.group(`Element: ${element.toUpperCase()}`);
    
    layouts.forEach((layout, index) => {
      const seed = index + 1;
      const elementConfig = layout.elements[element as keyof typeof layout.elements];
      const order = elementConfig.order;
      
      // Generate different XPath patterns that would be affected
      const xpaths = [
        `//div[${order}]`, // Position-based
        `//div[@class='${elementConfig.className.split(' ')[0]}']`, // Class-based
        `//div[position()=${order}]`, // Position function
      ];
      
      console.log(`Seed ${seed}: Order ${order}`);
      xpaths.forEach(xpath => {
        console.log(`  ${xpath}`);
      });
    });
    
    console.groupEnd();
  });
  
  console.log('💡 Notice how XPath selectors change dramatically between seeds!');
  console.groupEnd();
}

/**
 * Performance test for layout switching
 * @param iterations - Number of iterations to test
 */
export function performanceTest(iterations: number = 1000) {
  console.group(`⚡ Layout Performance Test (${iterations} iterations)`);
  
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    const seed = (i % 10) + 1;
    getSeedLayout(seed);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Total time: ${duration.toFixed(2)}ms`);
  console.log(`Average per layout: ${(duration / iterations).toFixed(4)}ms`);
  console.log(`Layouts per second: ${(iterations / duration * 1000).toFixed(0)}`);
  
  console.groupEnd();
}

// Type for the debug functions that will be attached to window
interface LayoutDebugInterface {
  debug: typeof debugLayout;
  compare: typeof compareLayouts;
  list: typeof listAllLayouts;
  xpath: typeof generateXPathExamples;
  perf: typeof performanceTest;
}

// Extend the Window interface to include our debug functions
declare global {
  interface Window {
    layoutDebug?: LayoutDebugInterface;
  }
}

// Auto-run debug info in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add debug functions to window for easy access in browser console
  window.layoutDebug = {
    debug: debugLayout,
    compare: compareLayouts,
    list: listAllLayouts,
    xpath: generateXPathExamples,
    perf: performanceTest,
  };
  
  console.log('🛠️ Layout debug tools available at window.layoutDebug');
  console.log('Try: window.layoutDebug.debug(5) or window.layoutDebug.list()');
}
