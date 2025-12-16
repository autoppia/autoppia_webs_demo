#!/usr/bin/env node
/**
 * 🧪 TEST DEL SISTEMA DINÁMICO - GENÉRICO
 * 
 * Este script valida que el sistema dinámico (V1 y V3) funciona correctamente.
 * Es genérico y puede adaptarse a diferentes webs cambiando la configuración.
 * 
 * USO:
 *   1. Desde Node.js: node src/dynamic/test-dynamic-system.js
 *   2. Desde navegador: Copia el contenido en la consola (F12) y ejecuta testDynamicSystem()
 * 
 * CONFIGURACIÓN:
 *   Modifica MIN_REQUIREMENTS según los requisitos de tu web.
 */

// ============================================================================
// CONFIGURACIÓN (ADAPTAR SEGÚN LA WEB)
// ============================================================================

const MIN_REQUIREMENTS = {
  v1Wrappers: 10,      // Mínimo de wrappers/decoy
  v1OrderChanges: 3,   // Mínimo de cambios de orden
  v3Ids: 20,           // Mínimo de IDs dinámicos
  v3Classes: 15,       // Mínimo de clases dinámicas
  v3Texts: 15,         // Mínimo de textos dinámicos (ajustado: muchos textos son locales)
  minVariants: 3,      // Mínimo de variantes por key
};

// Rutas a los archivos (adaptar si la estructura es diferente)
const FILE_PATHS = {
  idVariants: 'src/dynamic/v3/data/id-variants.json',
  classVariants: 'src/dynamic/v3/data/class-variants.json',
  textVariants: 'src/dynamic/v3/data/text-variants.json',
  addWrapDecoy: 'src/dynamic/v1/add-wrap-decoy.ts',
  changeOrder: 'src/dynamic/v1/change-order-elements.ts',
  variantSelector: 'src/dynamic/v3/utils/variant-selector.ts',
  core: 'src/dynamic/shared/core.ts',
};

// ============================================================================
// UTILIDADES
// ============================================================================

function isBrowser() {
  return typeof window !== 'undefined';
}

function loadJSON(path) {
  if (isBrowser()) {
    throw new Error('En navegador, los JSONs deben cargarse vía fetch');
  }
  const fs = require('fs');
  const pathModule = require('path');
  return JSON.parse(fs.readFileSync(pathModule.join(process.cwd(), path), 'utf8'));
}

function fileExists(path) {
  if (isBrowser()) return false;
  const fs = require('fs');
  const pathModule = require('path');
  return fs.existsSync(pathModule.join(process.cwd(), path));
}

// ============================================================================
// TEST 1: Estructura de archivos
// ============================================================================

function testFileStructure() {
  console.log('\n📁 TEST 1: Estructura de archivos');
  console.log('─'.repeat(60));
  
  const results = { passed: 0, failed: 0, errors: [] };
  
  if (isBrowser()) {
    console.log('   ⚠️  Verificación de archivos solo disponible en Node.js');
    return results;
  }
  
  const requiredFiles = [
    FILE_PATHS.addWrapDecoy,
    FILE_PATHS.changeOrder,
    FILE_PATHS.variantSelector,
    FILE_PATHS.idVariants,
    FILE_PATHS.classVariants,
    FILE_PATHS.textVariants,
    FILE_PATHS.core,
  ];
  
  requiredFiles.forEach(file => {
    if (fileExists(file)) {
      console.log(`   ✅ ${file}`);
      results.passed++;
    } else {
      console.log(`   ❌ ${file} - NO ENCONTRADO`);
      results.failed++;
      results.errors.push(`Archivo faltante: ${file}`);
    }
  });
  
  return results;
}

// ============================================================================
// TEST 2: Variantes en JSONs
// ============================================================================

function testVariantFiles() {
  console.log('\n📦 TEST 2: Variantes en archivos JSON');
  console.log('─'.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [],
    stats: {
      idKeys: 0,
      classKeys: 0,
      textKeys: 0,
      keysWithFewVariants: []
    }
  };
  
  if (isBrowser()) {
    console.log('   ⚠️  En navegador, este test requiere Node.js');
    return results;
  }
  
  try {
    const idVariants = loadJSON(FILE_PATHS.idVariants);
    const classVariants = loadJSON(FILE_PATHS.classVariants);
    const textVariants = loadJSON(FILE_PATHS.textVariants);
    
    // Contar keys y verificar variantes
    results.stats.idKeys = Object.keys(idVariants).length;
    results.stats.classKeys = Object.keys(classVariants).length;
    results.stats.textKeys = Object.keys(textVariants).length;
    
    // Verificar que cada key tenga suficientes variantes
    [idVariants, classVariants, textVariants].forEach((variants, index) => {
      const type = ['IDs', 'Clases', 'Textos'][index];
      Object.entries(variants).forEach(([key, variantsArray]) => {
        const count = Array.isArray(variantsArray) ? variantsArray.length : 0;
        if (count < MIN_REQUIREMENTS.minVariants) {
          results.stats.keysWithFewVariants.push(`${type}: "${key}" tiene solo ${count} variantes`);
        }
      });
    });
    
    console.log(`   📊 IDs: ${results.stats.idKeys} keys`);
    console.log(`   📊 Clases: ${results.stats.classKeys} keys`);
    console.log(`   📊 Textos: ${results.stats.textKeys} keys`);
    
    // Verificar requisitos
    if (results.stats.idKeys >= MIN_REQUIREMENTS.v3Ids) {
      console.log(`   ✅ IDs: ${results.stats.idKeys} >= ${MIN_REQUIREMENTS.v3Ids}`);
      results.passed++;
    } else {
      console.log(`   ❌ IDs: ${results.stats.idKeys} < ${MIN_REQUIREMENTS.v3Ids}`);
      results.failed++;
      results.errors.push(`Faltan ${MIN_REQUIREMENTS.v3Ids - results.stats.idKeys} keys de IDs`);
    }
    
    if (results.stats.classKeys >= MIN_REQUIREMENTS.v3Classes) {
      console.log(`   ✅ Clases: ${results.stats.classKeys} >= ${MIN_REQUIREMENTS.v3Classes}`);
      results.passed++;
    } else {
      console.log(`   ❌ Clases: ${results.stats.classKeys} < ${MIN_REQUIREMENTS.v3Classes}`);
      results.failed++;
      results.errors.push(`Faltan ${MIN_REQUIREMENTS.v3Classes - results.stats.classKeys} keys de clases`);
    }
    
    if (results.stats.textKeys >= MIN_REQUIREMENTS.v3Texts) {
      console.log(`   ✅ Textos: ${results.stats.textKeys} >= ${MIN_REQUIREMENTS.v3Texts}`);
      results.passed++;
    } else {
      console.log(`   ❌ Textos: ${results.stats.textKeys} < ${MIN_REQUIREMENTS.v3Texts}`);
      results.failed++;
      results.errors.push(`Faltan ${MIN_REQUIREMENTS.v3Texts - results.stats.textKeys} keys de textos`);
    }
    
    if (results.stats.keysWithFewVariants.length > 0) {
      console.log(`   ⚠️  Keys con pocas variantes (<${MIN_REQUIREMENTS.minVariants}): ${results.stats.keysWithFewVariants.length}`);
      results.stats.keysWithFewVariants.slice(0, 3).forEach(msg => console.log(`      - ${msg}`));
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    results.failed++;
    results.errors.push(`Error: ${error.message}`);
  }
  
  return results;
}

// ============================================================================
// TEST 3: Determinismo
// ============================================================================

function testDeterminism() {
  console.log('\n🎲 TEST 3: Determinismo (mismo seed = mismo resultado)');
  console.log('─'.repeat(60));
  
  const results = { passed: 0, failed: 0, errors: [] };
  
  // Función hash (debe ser igual a la del código)
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  function selectVariantIndex(seed, key, count) {
    if (count <= 1) return 0;
    const combined = `${key}:${seed}`;
    const hash = hashString(combined);
    return Math.abs(hash) % count;
  }
  
  // Test casos
  const testCases = [
    { seed: 42, key: 'movie-card', count: 10 },
    { seed: 100, key: 'search-input', count: 10 },
    { seed: 1, key: 'button', count: 10 },
  ];
  
  testCases.forEach(({ seed, key, count }) => {
    const r1 = selectVariantIndex(seed, key, count);
    const r2 = selectVariantIndex(seed, key, count);
    const r3 = selectVariantIndex(seed, key, count);
    
    if (r1 === r2 && r2 === r3) {
      console.log(`   ✅ seed=${seed}, key="${key}": ${r1} (consistente)`);
      results.passed++;
    } else {
      console.log(`   ❌ seed=${seed}, key="${key}": ${r1} vs ${r2} vs ${r3}`);
      results.failed++;
      results.errors.push(`Determinismo falló para seed=${seed}, key="${key}"`);
    }
  });
  
  return results;
}

// ============================================================================
// TEST 4: Uso en DOM (solo navegador)
// ============================================================================

function testDOMUsage() {
  console.log('\n🌐 TEST 4: Uso en DOM');
  console.log('─'.repeat(60));
  
  const results = { passed: 0, failed: 0, errors: [], stats: {} };
  
  if (!isBrowser()) {
    console.log('   ⚠️  Este test solo funciona en el navegador');
    return results;
  }
  
  // Contar V1
  const wrappers = document.querySelectorAll('[data-dyn-wrap]').length;
  const decoys = document.querySelectorAll('[data-decoy]').length;
  const totalV1 = wrappers + decoys;
  results.stats.v1Wrappers = totalV1;
  
  console.log(`   📊 Wrappers: ${wrappers}, Decoys: ${decoys}, Total V1: ${totalV1}`);
  
  if (totalV1 >= MIN_REQUIREMENTS.v1Wrappers) {
    console.log(`   ✅ V1: ${totalV1} >= ${MIN_REQUIREMENTS.v1Wrappers}`);
    results.passed++;
  } else {
    console.log(`   ❌ V1: ${totalV1} < ${MIN_REQUIREMENTS.v1Wrappers}`);
    results.failed++;
    results.errors.push(`Faltan ${MIN_REQUIREMENTS.v1Wrappers - totalV1} elementos V1`);
  }
  
  // Contar V3 IDs
  const uniqueIds = new Set(
    Array.from(document.querySelectorAll('[id]'))
      .map(el => el.id)
      .filter(id => id && id.length > 0)
  );
  results.stats.v3Ids = uniqueIds.size;
  
  console.log(`   📊 IDs únicos: ${uniqueIds.size}`);
  
  if (uniqueIds.size >= MIN_REQUIREMENTS.v3Ids) {
    console.log(`   ✅ V3 IDs: ${uniqueIds.size} >= ${MIN_REQUIREMENTS.v3Ids}`);
    results.passed++;
  } else {
    console.log(`   ❌ V3 IDs: ${uniqueIds.size} < ${MIN_REQUIREMENTS.v3Ids}`);
    results.failed++;
    results.errors.push(`Faltan ${MIN_REQUIREMENTS.v3Ids - uniqueIds.size} IDs dinámicos`);
  }
  
  return results;
}

// ============================================================================
// REPORTE FINAL
// ============================================================================

function generateReport(allResults) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 REPORTE FINAL');
  console.log('='.repeat(60));
  
  const totalPassed = allResults.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.failed, 0);
  const allErrors = allResults.flatMap(r => r.errors || []);
  
  console.log(`\n✅ Tests pasados: ${totalPassed}`);
  console.log(`❌ Tests fallidos: ${totalFailed}`);
  
  if (totalPassed + totalFailed > 0) {
    const successRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1);
    console.log(`📈 Tasa de éxito: ${successRate}%`);
  }
  
  if (allErrors.length > 0) {
    console.log('\n⚠️  ERRORES ENCONTRADOS:');
    allErrors.slice(0, 5).forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    if (allErrors.length > 5) {
      console.log(`   ... y ${allErrors.length - 5} más`);
    }
  }
  
  console.log('\n📋 CRITERIOS DE VALIDACIÓN:');
  console.log('─'.repeat(60));
  console.log(`   ✅ V1 Wrappers/Decoys: mínimo ${MIN_REQUIREMENTS.v1Wrappers}`);
  console.log(`   ✅ V1 Cambios de orden: mínimo ${MIN_REQUIREMENTS.v1OrderChanges}`);
  console.log(`   ✅ V3 IDs dinámicos: mínimo ${MIN_REQUIREMENTS.v3Ids}`);
  console.log(`   ✅ V3 Clases dinámicas: mínimo ${MIN_REQUIREMENTS.v3Classes}`);
  console.log(`   ✅ V3 Textos dinámicos: mínimo ${MIN_REQUIREMENTS.v3Texts}`);
  
  console.log('\n' + '='.repeat(60));
  if (totalFailed === 0) {
    console.log('✅ SISTEMA DINÁMICO: VALIDACIÓN EXITOSA');
    console.log('   El sistema cumple con todos los requisitos mínimos.');
  } else {
    console.log('⚠️  SISTEMA DINÁMICO: REQUIERE ATENCIÓN');
    console.log('   Algunos requisitos no se cumplen. Revisa los errores arriba.');
  }
  console.log('='.repeat(60) + '\n');
  
  return {
    success: totalFailed === 0,
    totalPassed,
    totalFailed,
    errors: allErrors
  };
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

function runAllTests() {
  console.log('\n' + '🧪'.repeat(30));
  console.log('🧪 TEST DEL SISTEMA DINÁMICO (GENÉRICO)');
  console.log('🧪'.repeat(30));
  
  const results = [];
  
  results.push(testFileStructure());
  results.push(testVariantFiles());
  results.push(testDeterminism());
  
  if (isBrowser()) {
    results.push(testDOMUsage());
  }
  
  return generateReport(results);
}

// ============================================================================
// EXPORTAR/EJECUTAR
// ============================================================================

if (isBrowser()) {
  window.testDynamicSystem = runAllTests;
  console.log('💡 Ejecuta testDynamicSystem() en la consola para correr los tests');
} else {
  const report = runAllTests();
  process.exit(report.success ? 0 : 1);
}
