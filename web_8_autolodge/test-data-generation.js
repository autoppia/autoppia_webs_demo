#!/usr/bin/env node

/**
 * Test script for data generation system
 * Run with: node test-data-generation.js
 */

const { generateProjectData, isDataGenerationEnabled } = require('./src/shared/data-generator.ts');

async function testDataGeneration() {
  console.log('🧪 Testing Autolodge Data Generation System');
  console.log('==========================================');
  
  // Check if data generation is enabled
  console.log('📊 Data generation enabled:', isDataGenerationEnabled());
  
  if (!isDataGenerationEnabled()) {
    console.log('⚠️  Data generation is disabled. Set ENABLE_DATA_GENERATION=true to test.');
    return;
  }
  
  try {
    console.log('🚀 Generating 5 test hotels...');
    const result = await generateProjectData('web_8_autolodge', 5);
    
    if (result.success) {
      console.log('✅ Generation successful!');
      console.log(`📈 Generated ${result.count} hotels in ${result.generationTime}s`);
      console.log('🏨 Sample hotel:', JSON.stringify(result.data[0], null, 2));
    } else {
      console.log('❌ Generation failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testDataGeneration();
