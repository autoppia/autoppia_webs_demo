/**
 * Script de prueba para verificar que los IDs cambian correctamente con diferentes seeds
 * Ejecutar: node test-seed-variation.js
 */

// Simular las funciones del código
function hashString(value) {
  return value.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);
}

function pickVariant(seed, key, count) {
  if (count <= 1) return 0;
  const keyHash = hashString(key);
  const reducedHash = Math.abs(keyHash) % (count * 1000);
  const combined = (reducedHash + seed * 7919) % count;
  return Math.abs(combined);
}

// IDs disponibles para search-submit-button
const searchButtonVariants = [
  "search-submit-button",
  "search-btn",
  "submit-search",
  "query-button",
  "search-action",
  "find-button",
  "submit-query",
  "search-trigger",
  "query-submit",
  "lookup-button"
];

// Test: Verificar que diferentes seeds producen diferentes variantIndex
console.log("🧪 Test de variación de seeds para 'search-submit-button'\n");

const testedSeeds = [1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 999];
const results = {};

testedSeeds.forEach(seed => {
  const variantIndex = pickVariant(seed, "search-submit-button", searchButtonVariants.length);
  const selectedId = searchButtonVariants[variantIndex];
  results[seed] = { variantIndex, selectedId };
});

console.log("Resultados:");
testedSeeds.forEach(seed => {
  const { variantIndex, selectedId } = results[seed];
  console.log(`  Seed ${seed.toString().padStart(3)} → variantIndex: ${variantIndex.toString().padStart(2)} → ID: "${selectedId}"`);
});

// Verificar que hay variación
const uniqueVariants = new Set(Object.values(results).map(r => r.variantIndex));
const uniqueIds = new Set(Object.values(results).map(r => r.selectedId));

console.log(`\n✅ Variantes únicas: ${uniqueVariants.size} de ${testedSeeds.length} seeds probados`);
console.log(`✅ IDs únicos: ${uniqueIds.size} de ${testedSeeds.length} seeds probados`);

if (uniqueVariants.size === testedSeeds.length) {
  console.log("✅ PERFECTO: Cada seed produce un variantIndex diferente");
} else if (uniqueVariants.size > testedSeeds.length / 2) {
  console.log("⚠️  ACEPTABLE: Hay buena variación entre seeds");
} else {
  console.log("❌ PROBLEMA: Poca variación entre seeds");
}

// Test adicional: Verificar distribución
console.log("\n📊 Distribución de variantIndex:");
const distribution = {};
Object.values(results).forEach(r => {
  distribution[r.variantIndex] = (distribution[r.variantIndex] || 0) + 1;
});

Object.keys(distribution).sort((a, b) => a - b).forEach(index => {
  const count = distribution[index];
  const bar = "█".repeat(count);
  console.log(`  Index ${index}: ${bar} (${count})`);
});
