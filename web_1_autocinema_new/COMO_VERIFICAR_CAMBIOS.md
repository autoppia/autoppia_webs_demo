# 🔍 Cómo Verificar que el Sistema Dinámico Funciona

## 📋 ¿Qué Debería Cambiar con Diferentes Seeds?

### 1. **V2 (Datos) - CAMBIOS VISUALES** ✅

**Esto SÍ debería verse visualmente:**

#### Estadísticas (4 números):
- **Movies**: "50+" → puede cambiar a "45+", "60+", etc.
- **Genres**: "18" → puede cambiar a "15", "20", etc.
- **Avg Rating**: "4.7" → puede cambiar a "4.5", "4.8", etc.
- **Avg Duration**: "130m" → puede cambiar a "125m", "135m", etc.

#### Películas Destacadas (3 cards):
- **Películas diferentes**: Con seed 42 puede mostrar "The Godfather", "Pulp Fiction", "The Dark Knight"
- Con seed 100 puede mostrar películas completamente diferentes
- **Datos de cada película**: título, año, duración, director, sinopsis, rating, género

**⚠️ IMPORTANTE**: V2 solo funciona si `ENABLE_DYNAMIC_V2_DB_MODE=true` y hay datos en el servidor.

---

### 2. **V1 (Estructura DOM) - NO VISIBLE** ⚠️

**Esto NO se ve visualmente**, solo en DevTools:

- Wrappers invisibles: `<span data-dyn-wrap>` alrededor de elementos
- Decoys invisibles: `<span data-decoy class="hidden">` antes/después de elementos

**Cómo verificar:**
1. Abre DevTools (F12) → Elements
2. Busca `data-v1="true"`
3. Deberías ver elementos diferentes con seed 42 vs seed 100

---

### 3. **V3 (IDs, Clases, Textos) - PARCIALMENTE VISIBLE** ⚠️

#### IDs y Clases - NO VISIBLES
- Los IDs cambian: `stats-movies-card-1234` vs `stats-movies-card-5678`
- Las clases cambian: `stats-card card-variant-2` vs `card-variant-1`
- **No se ven visualmente** (solo en DevTools)

#### Textos - VISIBLES (si están en text-variants.json)
- Si el texto está en `text-variants.json`, puede cambiar:
  - "Movies" → "Películas" (con seed 42, variant 2)
  - "Search" → "Buscar"
  - "View Details" → "Ver Detalles"

**⚠️ IMPORTANTE**: Los textos solo cambian si:
1. V3 está habilitado (`NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true`)
2. El texto está definido en `text-variants.json`

---

## 🧪 Cómo Verificar que Funciona

### Paso 1: Verificar Variables de Entorno

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar V1
console.log("V1 enabled:", process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1);

// Verificar V3
console.log("V3 enabled:", process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3);

// Verificar V2 (en el servidor)
// Esto se ve en los logs del servidor cuando inicia
```

**O verifica en `.env.local`:**
```bash
NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true
NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true
NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true  # Para V2
```

---

### Paso 2: Verificar V2 (Datos) - CAMBIOS VISIBLES

**Esto es lo más importante y lo que deberías ver:**

1. **Abre con seed 42:**
   ```
   http://localhost:8001/?seed=42
   ```
   - Anota las 4 estadísticas (Movies, Genres, Rating, Duration)
   - Anota los 3 títulos de películas

2. **Abre con seed 100:**
   ```
   http://localhost:8001/?seed=100
   ```
   - Compara: ¿Son diferentes las estadísticas?
   - Compara: ¿Son diferentes las películas?

3. **Si NO cambian:**
   - V2 puede estar deshabilitado
   - O puede estar usando datos locales (fallback) en vez del servidor

**Verificar en consola:**
```javascript
// Ver qué seed está usando V2
console.log("V2 Seed:", window.__autocinemaV2Seed);

// Ver logs del servidor al cargar
// Deberías ver: "[autocinema] Loaded X movies from dataset (seed=Y)"
```

---

### Paso 3: Verificar V1 (Wrappers) - DevTools

1. **Abre DevTools (F12) → Elements**
2. **Con seed 42:**
   - Busca: `data-v1="true"`
   - Anota cuántos elementos encuentras
   - Anota algunos IDs de wrappers

3. **Con seed 100:**
   - Busca: `data-v1="true"`
   - Compara: ¿Son diferentes los wrappers?
   - Compara: ¿Algunos elementos tienen wrapper y otros no?

**Ejemplo de lo que deberías ver:**
```html
<!-- Con seed 42 -->
<span data-dyn-wrap="stats-movies-card" data-v1="true" data-wrapper-variant="1">
  <div>...</div>
</span>

<!-- Con seed 100 -->
<div>...</div>  <!-- Sin wrapper -->
```

---

### Paso 4: Verificar V3 (IDs y Clases) - DevTools

1. **Inspecciona un elemento específico:**
   ```javascript
   // En consola del navegador
   const statsCard = document.querySelector('[id^="stats-movies-card"]');
   console.log("Stats card ID:", statsCard?.id);
   console.log("Stats card classes:", statsCard?.className);
   ```

2. **Con seed 42:**
   - Anota el ID: `stats-movies-card-1234`
   - Anota las clases

3. **Con seed 100:**
   - Compara el ID: `stats-movies-card-5678` (debería ser diferente)
   - Compara las clases (pueden tener variantes diferentes)

---

### Paso 5: Verificar V3 (Textos) - VISIBLE

**Solo si los textos están en `text-variants.json`:**

1. **Verifica qué textos están definidos:**
   ```bash
   cat src/dynamic/v3/data/text-variants.json
   ```

2. **Si el texto está definido:**
   - Con seed 42: Puede mostrar "Movies"
   - Con seed 100: Puede mostrar "Películas" (si variant 2 tiene esa traducción)

3. **Si el texto NO está en text-variants.json:**
   - Siempre mostrará el fallback (ej: "Movies")
   - No cambiará aunque cambies el seed

---

## 🐛 Problemas Comunes

### ❌ "No veo cambios en las películas/estadísticas"

**Causa**: V2 está deshabilitado o usando datos locales

**Solución**:
1. Verifica `NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true`
2. Verifica que el servidor de datos esté corriendo
3. Revisa los logs del servidor para ver si carga datos del servidor o usa fallback

**Verificar en consola:**
```javascript
// Ver si V2 está usando datos del servidor
// Revisa los logs del servidor cuando carga la página
// Deberías ver: "[autocinema] Loaded X movies from dataset (seed=Y)"
// Si ves: "[autocinema] v2 DB mode disabled, loading from local JSON"
// Entonces V2 está deshabilitado
```

---

### ❌ "No veo cambios en los textos"

**Causa**: Los textos no están en `text-variants.json` o V3 está deshabilitado

**Solución**:
1. Verifica `NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true`
2. Añade los textos a `text-variants.json`:
   ```json
   {
     "1": {
       "stats_movies_label": "Movies",
       "search_button": "Search"
     },
     "2": {
       "stats_movies_label": "Películas",
       "search_button": "Buscar"
     }
   }
   ```

---

### ❌ "No veo wrappers V1 en DevTools"

**Causa**: V1 está deshabilitado

**Solución**:
1. Verifica `NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true`
2. Reinicia el servidor
3. Recarga la página

---

## ✅ Checklist de Verificación

### V2 (Datos) - Debería cambiar VISUALMENTE:
- [ ] Estadísticas (4 números) cambian con diferentes seeds
- [ ] Películas destacadas (3 cards) cambian con diferentes seeds
- [ ] Los datos de cada película (título, año, etc.) cambian

### V1 (Wrappers) - Solo en DevTools:
- [ ] Veo elementos `data-v1="true"` en DevTools
- [ ] Los wrappers son diferentes con seed 42 vs seed 100
- [ ] Algunos elementos tienen wrapper, otros no

### V3 (IDs/Clases) - Solo en DevTools:
- [ ] Los IDs cambian con diferentes seeds
- [ ] Las clases cambian con diferentes seeds

### V3 (Textos) - Puede cambiar VISUALMENTE:
- [ ] Los textos definidos en `text-variants.json` cambian
- [ ] Los textos no definidos siempre muestran el fallback

---

## 🎯 Resumen: ¿Qué Deberías Ver?

### ✅ Cambios VISIBLES (lo más importante):
1. **V2 - Datos**: Películas y estadísticas diferentes con diferentes seeds

### ⚠️ Cambios NO VISIBLES (solo en DevTools):
2. **V1 - Wrappers**: Elementos `data-v1="true"` en el DOM
3. **V3 - IDs/Clases**: IDs y clases diferentes en DevTools

### ⚠️ Cambios PARCIALMENTE VISIBLES:
4. **V3 - Textos**: Solo si están en `text-variants.json`

---

## 🚀 Prueba Rápida

1. **Abre con seed 42:**
   ```
   http://localhost:8001/?seed=42
   ```
   - Anota: Películas mostradas, estadísticas

2. **Abre con seed 100:**
   ```
   http://localhost:8001/?seed=100
   ```
   - Compara: ¿Son diferentes?

3. **Si NO son diferentes:**
   - V2 está deshabilitado o usando datos locales
   - Revisa `NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE`
   - Revisa los logs del servidor
