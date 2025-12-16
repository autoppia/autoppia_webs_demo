// 🔍 VERIFICATION SCRIPT - Copy and paste this into the browser console (F12)

console.log("=== 🔍 VERIFICACIÓN DEL SISTEMA DINÁMICO ===\n");

// 1. Get the seed from the URL
const urlParams = new URLSearchParams(window.location.search);
const seedFromUrl = urlParams.get('seed') || '1';
console.log("1️⃣ SEED ACTUAL:");
console.log("   Seed de la URL:", seedFromUrl);
console.log("");

// 2. Check V1 and V3 (verify elements in the DOM)
console.log("2️⃣ VERIFICACIÓN DE HABILITACIÓN:");
const hasV1Elements = document.querySelectorAll('[data-v1="true"]').length > 0;
const statsCard = document.querySelector('[id^="stats-movies-card"]');
const hasV3DynamicIds = statsCard && statsCard.id !== 'stats-movies-card' && statsCard.id.includes('-');
console.log("   V1 activo (elementos encontrados):", hasV1Elements);
console.log("   V3 activo (IDs dinámicos encontrados):", hasV3DynamicIds);
if (!hasV1Elements && !hasV3DynamicIds) {
  console.log("   ⚠️ ADVERTENCIA: No se encontraron elementos V1/V3.");
  console.log("   Esto puede significar que V1/V3 están deshabilitados.");
  console.log("   Verifica los logs del servidor al iniciar.");
}
console.log("");

// 2. Check V2 Seed
console.log("2️⃣ V2 SEED (para datos):");
console.log("   V2 Seed:", window.__autocinemaV2Seed || "No encontrado");
console.log("");

// 3. Check V1 (Wrappers)
console.log("3️⃣ V1 - WRAPPERS (deberías ver elementos con data-v1='true'):");
const v1Elements = document.querySelectorAll('[data-v1="true"]');
console.log("   Elementos V1 encontrados:", v1Elements.length);
if (v1Elements.length > 0) {
  console.log("   Primeros 3 elementos:");
  Array.from(v1Elements).slice(0, 3).forEach((el, i) => {
    console.log(`   ${i + 1}.`, el.tagName, el.getAttribute('data-dyn-wrap') || el.getAttribute('data-decoy'));
  });
} else {
  console.log("   ⚠️ No se encontraron elementos V1. ¿Está V1 habilitado?");
}
console.log("");

// 4. Check V3 (Dynamic IDs)
console.log("4️⃣ V3 - IDs DINÁMICOS:");
const statsCard = document.querySelector('[id^="stats-movies-card"]');
const featuredCard = document.querySelector('[id^="featured-movie-card"]');
if (statsCard) {
  console.log("   Stats card ID:", statsCard.id);
  console.log("   ¿Es dinámico?", statsCard.id.includes('-') && !isNaN(statsCard.id.split('-').pop()));
} else {
  console.log("   ⚠️ No se encontró stats card");
}
if (featuredCard) {
  console.log("   Featured card ID:", featuredCard.id);
} else {
  console.log("   ⚠️ No se encontró featured card");
}
console.log("");

// 5. Check V3 (Dynamic classes)
console.log("5️⃣ V3 - CLASES DINÁMICAS:");
if (statsCard) {
  const classes = statsCard.className.split(' ').filter(c => c.includes('variant') || c.includes('card-'));
  console.log("   Clases dinámicas en stats card:", classes.length > 0 ? classes : "Ninguna encontrada");
}
console.log("");

// 6. Check V3 (Texts)
console.log("6️⃣ V3 - TEXTOS:");
const searchButton = document.querySelector('button[type="submit"]');
const statsLabel = document.querySelector('[id^="stats-movies-card"]')?.parentElement?.querySelector('.text-xs');
if (searchButton) {
  console.log("   Texto del botón Search:", searchButton.textContent.trim());
}
if (statsLabel) {
  console.log("   Label de stats:", statsLabel.textContent.trim());
}
console.log("");

// 7. Check V2 (Data - most important)
console.log("7️⃣ V2 - DATOS (esto SÍ debería cambiar visualmente):");
const statsValues = {
  movies: document.querySelector('[id^="stats-movies-card"]')?.textContent.match(/\d+\+/)?.[0],
  genres: document.querySelector('[id^="stats-genres-card"]')?.textContent.match(/\d+/)?.[0],
  rating: document.querySelector('[id^="stats-rating-card"]')?.textContent.match(/[\d.]+/)?.[0],
  duration: document.querySelector('[id^="stats-duration-card"]')?.textContent.match(/\d+m/)?.[0]
};
console.log("   Estadísticas actuales:");
console.log("   - Movies:", statsValues.movies || "No encontrado");
console.log("   - Genres:", statsValues.genres || "No encontrado");
console.log("   - Rating:", statsValues.rating || "No encontrado");
console.log("   - Duration:", statsValues.duration || "No encontrado");

const movieTitles = Array.from(document.querySelectorAll('[id^="featured-movie-title"]')).map(el => el.textContent.trim());
console.log("   Películas destacadas:", movieTitles.length > 0 ? movieTitles : "No encontradas");
console.log("");

// 8. Summary
console.log("📊 RESUMEN:");
console.log("   ✅ V1 (Wrappers):", v1Elements.length > 0 ? "Funcionando" : "No encontrado");
console.log("   ✅ V3 (IDs):", statsCard && statsCard.id.includes('-') ? "Funcionando" : "Verificar");
console.log("   ✅ V2 (Datos):", "Compara con otro seed para verificar");
console.log("");
console.log("💡 CONSEJO: Cambia el seed en la URL (?seed=42 vs ?seed=100)");
console.log("   y compara las estadísticas y películas. Deberían ser diferentes.");
