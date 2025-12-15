# Guía de Testing: Sistema Dinámico V1 y V3

## 🧪 Cómo Testear el Sistema Dinámico

### 1. **Verificar que V1 y V3 están Habilitados**

#### Variables de Entorno

Crea o edita `.env.local` en la raíz del proyecto:

```bash
# Habilitar V1 (estructura DOM)
NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true

# Habilitar V3 (atributos y textos)
NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true
```

#### Verificar en el Código

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar flags
console.log("V1 enabled:", process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1);
console.log("V3 enabled:", process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3);
```

---

### 2. **Testing de V1 (Wrappers y Decoys)**

#### Inspeccionar en DevTools

1. Abre DevTools (F12) → pestaña **Elements**
2. Busca elementos con `data-v1="true"`:
   ```html
   <span data-dyn-wrap="stats-movies-card" data-v1="true" data-wrapper-variant="1">
     <div>...</div>
   </span>
   ```

3. Busca decoys (elementos invisibles):
   ```html
   <span data-decoy="decoy-spotlight-movie-0-1234" class="hidden" aria-hidden="true" data-v1="true"></span>
   ```

#### Verificar que Funciona

**Con V1 ON:**
- Deberías ver elementos `<span data-dyn-wrap>` envolviendo componentes
- Deberías ver elementos `<span data-decoy>` (algunos antes, algunos después)
- Cada componente puede tener wrapper o no (independiente)

**Con V1 OFF:**
- No deberías ver elementos `data-v1="true"`
- El DOM debería ser más limpio (sin wrappers extra)
- La funcionalidad debería ser idéntica

#### Test Manual

1. **Cambiar seed en la URL:**
   ```
   http://localhost:3000/?seed=42
   http://localhost:3000/?seed=100
   ```

2. **Inspeccionar el mismo componente con diferentes seeds:**
   - Con seed 42: `stats-movies-card` puede tener wrapper
   - Con seed 100: `stats-movies-card` puede no tener wrapper
   - **Mismo seed = mismo resultado siempre**

---

### 3. **Testing de V3 (IDs, Clases, Textos)**

#### Inspeccionar IDs Dinámicos

1. Abre DevTools → Elements
2. Busca IDs que deberían ser dinámicos:
   ```html
   <!-- Con seed 42 -->
   <div id="stats-movies-card-1234">...</div>
   
   <!-- Con seed 100 -->
   <div id="stats-movies-card-5678">...</div>
   ```

3. Verifica que los IDs cambian según el seed:
   - Mismo seed = mismo ID
   - Diferente seed = diferente ID

#### Inspeccionar Clases Dinámicas

1. Busca elementos con clases dinámicas:
   ```html
   <div class="stats-card card-variant-2">...</div>
   ```

2. Verifica que las clases cambian según el seed

#### Inspeccionar Textos Dinámicos

1. Busca textos que deberían cambiar:
   ```html
   <!-- Con seed 42, variant 2 -->
   <div>Películas</div>
   
   <!-- Con seed 100, variant 1 -->
   <div>Movies</div>
   ```

2. Verifica que los textos cambian según el seed (si están en `text-variants.json`)

#### Test Manual

1. **Cambiar seed y verificar cambios:**
   ```bash
   # Seed 42
   http://localhost:3000/?seed=42
   # Anota los IDs, clases y textos
   
   # Seed 100
   http://localhost:3000/?seed=100
   # Compara: deberían ser diferentes
   
   # Volver a seed 42
   http://localhost:3000/?seed=42
   # Deberían ser iguales a la primera vez
   ```

---

### 4. **Testing Automatizado con Console**

Añade este código temporalmente en `page.tsx` para debugging:

```typescript
function HomeContent() {
  const dyn = useDynamic();
  
  // Debug en consola
  if (typeof window !== "undefined") {
    console.log("=== DYNAMIC SYSTEM DEBUG ===");
    console.log("Seed:", dyn.seed);
    console.log("V3 Seed:", dyn.v3Seed);
    console.log("V1 enabled:", isV1Enabled());
    console.log("V3 enabled:", isV3Enabled());
    
    // Ver variantes específicas
    console.log("Stats movies wrapper variant:", dyn.pickVariant("stats-movies-card-wrapper", 2));
    console.log("Stats movies decoy variant:", dyn.pickVariant("stats-movies-card-decoy", 3));
    console.log("Stats movies ID variant:", dyn.pickVariant("stats-movies-card", 10));
  }
  
  // ... resto del código
}
```

---

### 5. **Checklist de Testing**

#### V1 Testing:

- [ ] Con V1 ON: Ver elementos `data-v1="true"` en el DOM
- [ ] Con V1 OFF: No ver elementos `data-v1="true"`
- [ ] Con seed 42: Anotar qué componentes tienen wrapper
- [ ] Con seed 100: Verificar que algunos componentes tienen wrapper diferente
- [ ] Volver a seed 42: Verificar que es idéntico a la primera vez
- [ ] Verificar decoys: Algunos antes, algunos después, algunos none

#### V3 Testing:

- [ ] Con V3 ON: Ver IDs dinámicos (no son simples como "stats-movies-card")
- [ ] Con V3 OFF: Ver IDs por defecto (simples como "stats-movies-card")
- [ ] Con seed 42: Anotar IDs de elementos clave
- [ ] Con seed 100: Verificar que los IDs son diferentes
- [ ] Volver a seed 42: Verificar que los IDs son idénticos
- [ ] Verificar clases dinámicas: Cambian según seed
- [ ] Verificar textos dinámicos: Cambian según seed (si están en JSON)

#### Funcionalidad:

- [ ] Con V1/V3 ON: La página funciona correctamente
- [ ] Con V1/V3 OFF: La página funciona correctamente
- [ ] Los botones funcionan igual
- [ ] Los links funcionan igual
- [ ] No hay errores en consola
- [ ] No hay warnings de React

---

### 6. **Testing de Componentes Específicos**

#### Stats Cards (4 cards):

```javascript
// En consola del navegador
const statsCards = document.querySelectorAll('[id^="stats-"]');
console.log("Stats cards encontradas:", statsCards.length); // Debería ser 4

statsCards.forEach((card, index) => {
  console.log(`Card ${index}:`, {
    id: card.id,
    hasV1Wrapper: card.closest('[data-v1="true"]') !== null,
    classes: card.className
  });
});
```

#### Featured Movies (3 cards):

```javascript
const featuredCards = document.querySelectorAll('[id^="featured-movie-card"]');
console.log("Featured cards encontradas:", featuredCards.length); // Debería ser 3

featuredCards.forEach((card, index) => {
  console.log(`Card ${index}:`, {
    id: card.id,
    hasV1Wrapper: card.closest('[data-v1="true"]') !== null,
    titleId: card.querySelector('[id^="featured-movie-title"]')?.id,
    buttonId: card.querySelector('[id^="featured-movie-view-details-btn"]')?.id
  });
});
```

#### Search Bar:

```javascript
const searchForm = document.getElementById('search-form');
const searchInput = document.querySelector('input[type="search"]');
const searchButton = document.getElementById('search-submit-button');

console.log("Search elements:", {
  formId: searchForm?.id,
  formHasV1Wrapper: searchForm?.closest('[data-v1="true"]') !== null,
  inputId: searchInput?.id,
  buttonId: searchButton?.id,
  buttonText: searchButton?.textContent
});
```

---

### 7. **Testing de Determinismo**

El sistema debe ser **determinístico**: mismo seed = mismo resultado.

#### Test:

1. Abre la página con `?seed=42`
2. Anota todos los IDs, clases y wrappers
3. Recarga la página (F5)
4. Verifica que todo es idéntico
5. Cambia a `?seed=100`
6. Verifica que todo es diferente
7. Vuelve a `?seed=42`
8. Verifica que todo vuelve a ser idéntico al paso 2

---

### 8. **Testing de Rendimiento**

Verifica que V1/V3 no afectan el rendimiento:

1. Abre DevTools → Performance
2. Graba la carga de la página
3. Verifica que no hay lag o delays
4. Compara con V1/V3 OFF

---

### 9. **Testing de Accesibilidad**

Verifica que V1/V3 no rompen accesibilidad:

1. Los decoys tienen `aria-hidden="true"` ✅
2. Los decoys tienen `class="hidden"` ✅
3. Los elementos importantes mantienen sus roles
4. Los screen readers funcionan correctamente

---

### 10. **Errores Comunes y Soluciones**

#### Error: "Elementos no tienen IDs dinámicos"
- **Causa**: V3 está OFF o no se está usando `dyn.v3.id()`
- **Solución**: Verificar `NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true` y código

#### Error: "No veo wrappers V1"
- **Causa**: V1 está OFF o `dyn.v1.wrap()` no se está usando
- **Solución**: Verificar `NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true` y código

#### Error: "IDs son iguales con diferentes seeds"
- **Causa**: No se está usando `index` o el `key` no es único
- **Solución**: Verificar que cada elemento tiene un `key` único

#### Error: "Textos no cambian"
- **Causa**: No están en `text-variants.json` o V3 está OFF
- **Solución**: Añadir textos a `text-variants.json` o verificar V3

---

## 🎯 Resumen Rápido

1. **Habilitar V1/V3** en `.env.local`
2. **Abrir DevTools** y buscar `data-v1="true"`
3. **Cambiar seed** en URL (`?seed=42`, `?seed=100`)
4. **Verificar cambios** en IDs, clases, textos, wrappers
5. **Verificar determinismo**: mismo seed = mismo resultado
6. **Verificar funcionalidad**: todo funciona igual con V1/V3 ON/OFF

¡Listo para testear! 🚀
