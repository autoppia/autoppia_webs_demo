# Cómo Funciona el Sistema Dinámico V1 y V3

## 📋 Resumen General

El sistema dinámico tiene **dos versiones independientes** que funcionan juntas:

- **V1**: Cambia la **estructura DOM** (añade wrappers y decoys invisibles) → Rompe XPath
- **V3**: Cambia **atributos y textos** (IDs, clases CSS, textos) → Evita memorización

Ambas funcionan **igual aunque estén OFF** (simplemente no aplican cambios).

---

## 🔑 Concepto Clave: `pickVariant(seed, key, count)`

**Esta es la función más importante del sistema:**

```typescript
pickVariant(seed: number, key: string, count: number): number
```

**¿Qué hace?**
- Dado un `seed` (ej: 42) y un `key` único (ej: "movie-card"), 
- Devuelve un número **determinístico** entre `0` y `count-1`
- **Mismo seed + mismo key = mismo resultado siempre**

**Ejemplo:**
```typescript
pickVariant(42, "movie-card", 3)  // → 1 (siempre 1 con seed 42)
pickVariant(42, "search-button", 3)  // → 2 (diferente porque key diferente)
pickVariant(100, "movie-card", 3)  // → 0 (diferente porque seed diferente)
```

**¿Por qué es importante?**
- Cada componente tiene su **propia variante independiente**
- El mismo componente siempre tiene la misma variante con el mismo seed
- Diferentes componentes pueden tener diferentes variantes

---

## 🎯 V1: Estructura DOM (Wrappers y Decoys)

### ¿Qué hace V1?

Añade elementos **invisibles** al DOM para romper XPath que los scrapers memorizan.

**Ejemplo sin V1:**
```html
<div class="movie-card">...</div>
```

**Ejemplo con V1 (variante 1):**
```html
<span data-dyn-wrap="movie-card" data-v1="true" data-wrapper-variant="1">
  <div class="movie-card">...</div>
</span>
```

**Ejemplo con V1 (variante 2 con decoy):**
```html
<span data-decoy="decoy-movie-card-123" class="hidden" aria-hidden="true"></span>
<div class="movie-card">...</div>
```

### ¿Cómo funciona?

1. **Cada componente tiene su propia variante:**
   ```typescript
   dyn.v1.wrap("movie-card", <div>...</div>)
   // Usa pickVariant(seed, "movie-card-wrapper", 2) → decide si añade wrapper
   // Usa pickVariant(seed, "movie-card-decoy", 3) → decide posición del decoy
   ```

2. **Opciones por componente:**
   ```typescript
   dyn.v1.wrap("movie-card", children, {
     wrapperVariants: 2,  // 0=sin wrapper, 1=con wrapper
     decoyVariants: 3     // 0=none, 1=before, 2=after
   })
   ```

3. **Si V1 está OFF:**
   - `dyn.v1.wrap()` simplemente devuelve `children` sin cambios
   - El código funciona igual, solo no añade wrappers

### Ejemplo Real en SpotlightRow:

```typescript
// Wrapper para toda la sección
{dyn.v1.wrap("spotlight-row", (
  <section>...</section>
))}

// Wrapper para cada card de película (dentro de un map)
{movies.map((movie, index) => (
  dyn.v1.wrap(`spotlight-movie-${index}`, (
    <div>...</div>
  ), undefined, movie.id)  // reactKey para React
))}
```

**¿Por qué `spotlight-movie-${index}`?**
- Cada card tiene su **propia variante independiente**
- Card 0 puede tener wrapper, Card 1 puede tener decoy, etc.
- Esto hace que el XPath sea diferente para cada card

---

## 🎨 V3: Atributos y Textos (IDs, Clases, Textos)

### ¿Qué hace V3?

Cambia **IDs, clases CSS y textos** para evitar que los scrapers memoricen selectores.

### 1. **IDs Dinámicos**

```typescript
dyn.v3.id("movie-card", index)
// Con seed 42 → "movie-card-1234"
// Con seed 100 → "movie-card-5678"
```

**¿Cómo funciona?**
- Usa `pickVariant(seed, "movie-card", count)` para seleccionar un ID de una lista
- El ID cambia según el seed, pero es determinístico

**Ejemplo:**
```typescript
<div id={dyn.v3.id("spotlight-movie-card", index)}>
  {/* ID cambia según seed e index */}
</div>
```

### 2. **Clases CSS Dinámicas**

```typescript
dyn.v3.class("movie-card", "default-class")
// Con seed 42 → "card-variant-2"
// Con seed 100 → "card-variant-1"
```

**¿Cómo funciona?**
- Selecciona una clase de `class-variants.json`
- La clase cambia según el seed

**Ejemplo:**
```typescript
<div className={cn("base-class", dyn.v3.class("movie-card", ""))}>
  {/* Clase adicional cambia según seed */}
</div>
```

### 3. **Textos Dinámicos (Multi-idioma)**

```typescript
dyn.v3.text("view_details", "View Details")
// Con seed 42 → "Ver Detalles" (si está en variant 2)
// Con seed 100 → "View Details" (si está en variant 1)
```

**¿Cómo funciona?**
- Selecciona un texto de `text-variants.json`
- Cada variante puede tener diferentes idiomas o textos alternativos
- El texto cambia según el seed

**Ejemplo:**
```typescript
<button>
  {dyn.v3.text("search_button", "Search")}
  {/* Texto cambia según seed */}
</button>
```

**Estructura de text-variants.json:**
```json
{
  "1": {
    "search_button": "Search",
    "view_details": "View Details"
  },
  "2": {
    "search_button": "Buscar",
    "view_details": "Ver Detalles"
  },
  "3": {
    "search_button": "Find",
    "view_details": "See More"
  }
}
```

**¿Cómo se selecciona?**
- `pickVariant(seed, "search_button", 3)` → devuelve 0, 1 o 2
- Se suma 1 (porque JSON usa claves "1", "2", "3")
- Se busca en la variante correspondiente

---

## 🔄 Flujo Completo: Ejemplo Real

### Componente: `SpotlightRow`

```typescript
export function SpotlightRow({ title, description, movies }) {
  const dyn = useDynamic();  // 1. Obtener hook
  
  return (
    <>
      {/* 2. V1: Wrapper para toda la sección */}
      {dyn.v1.wrap("spotlight-row", (
        <section 
          {/* 3. V3: ID dinámico */}
          id={dyn.v3.id("spotlight-row")}
          {/* 4. V3: Clase dinámica */}
          className={cn("space-y-6", dyn.v3.class("spotlight-row", ""))}
        >
          {/* 5. V1: Wrapper para header */}
          {dyn.v1.wrap("spotlight-header", (
            <div>
              <h3 id={dyn.v3.id("spotlight-title")}>
                {title}
              </h3>
            </div>
          ))}
          
          {/* 6. Loop de películas */}
          {movies.map((movie, index) => (
            /* 7. V1: Wrapper para cada card (con key único) */
            dyn.v1.wrap(`spotlight-movie-${index}`, (
              <div 
                key={movie.id}
                /* 8. V3: ID dinámico con index */
                id={dyn.v3.id("spotlight-movie-card", index)}
                /* 9. V3: Clase dinámica */
                className={cn("base-classes", dyn.v3.class("movie-card", ""))}
              >
                <h4>{movie.title}</h4>
                
                {/* 10. V3: Texto dinámico */}
                <button>
                  {dyn.v3.text("view_details", "View Details")}
                </button>
              </div>
            ), undefined, movie.id)  // reactKey para React
          ))}
        </section>
      ))}
    </>
  );
}
```

### ¿Qué pasa con seed = 42?

1. **V1 Wrappers:**
   - `spotlight-row`: `pickVariant(42, "spotlight-row-wrapper", 2)` → 1 → **añade wrapper**
   - `spotlight-header`: `pickVariant(42, "spotlight-header-wrapper", 2)` → 0 → **sin wrapper**
   - `spotlight-movie-0`: `pickVariant(42, "spotlight-movie-0-wrapper", 2)` → 1 → **añade wrapper**
   - `spotlight-movie-1`: `pickVariant(42, "spotlight-movie-1-wrapper", 2)` → 0 → **sin wrapper**

2. **V3 IDs:**
   - `spotlight-row`: `pickVariant(42, "spotlight-row", count)` → ID específico
   - `spotlight-movie-card` (index 0): `pickVariant(42, "spotlight-movie-card", count)` → ID específico

3. **V3 Textos:**
   - `view_details`: `pickVariant(42, "view_details", 3)` → 1 → busca en variant "2" → "Ver Detalles"

### ¿Qué pasa con seed = 100?

**Todo cambia de forma determinística:**
- Mismos componentes, pero diferentes variantes
- Mismo seed = mismo resultado siempre
- Diferente seed = diferentes variantes

---

## ✅ Reglas Importantes

### 1. **Keys Únicos por Componente**

```typescript
// ✅ CORRECTO: Cada componente tiene su key único
dyn.v1.wrap("movie-card", ...)
dyn.v1.wrap("search-button", ...)
dyn.v1.wrap("hero-section", ...)

// ❌ INCORRECTO: Mismo key en diferentes componentes
dyn.v1.wrap("card", ...)  // En MovieCard
dyn.v1.wrap("card", ...)  // En GenreCard (conflicto!)
```

### 2. **Keys Únicos en Loops**

```typescript
// ✅ CORRECTO: Key único por item
{movies.map((movie, index) => (
  dyn.v1.wrap(`movie-card-${index}`, ...)
))}

// ✅ TAMBIÉN CORRECTO: Usar ID del item
{movies.map((movie) => (
  dyn.v1.wrap(`movie-card-${movie.id}`, ...)
))}
```

### 3. **V3 Keys Consistentes**

```typescript
// ✅ CORRECTO: Mismo key para mismo tipo de elemento
dyn.v3.id("movie-card")      // En MovieCard
dyn.v3.id("movie-card", 0)   // En MovieCard con index
dyn.v3.text("view_details")  // En todos los botones "View Details"
```

### 4. **Funciona Aunque Esté OFF**

```typescript
// Si V1 está OFF:
dyn.v1.wrap("movie-card", <div>...</div>)
// → Devuelve <div>...</div> sin cambios

// Si V3 está OFF:
dyn.v3.text("view_details", "View Details")
// → Devuelve "View Details" (fallback)
dyn.v3.id("movie-card")
// → Devuelve "movie-card" (ID por defecto)
```

---

## 🎛️ Configuración

### Variables de Entorno

```bash
# Habilitar V1
NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true

# Habilitar V3
NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true
```

### Archivos de Variantes

- `text-variants.json`: Textos multi-idioma/variantes
- `id-variants.json`: IDs alternativos
- `class-variants.json`: Clases CSS alternativas

---

## 🔍 Debugging

### Ver qué variante se está usando:

```typescript
const dyn = useDynamic();
console.log("Seed:", dyn.seed);
console.log("V3 Seed:", dyn.v3Seed);
console.log("Variant:", dyn.pickVariant("movie-card", 3));
```

### Verificar si está habilitado:

```typescript
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

console.log("V1 enabled:", isV1Enabled());
console.log("V3 enabled:", isV3Enabled());
```

---

## 📝 Resumen

1. **`useDynamic()`** → Hook central que unifica V1 y V3
2. **`pickVariant(seed, key, count)`** → Función base determinística
3. **V1** → Añade wrappers/decoy al DOM (rompe XPath)
4. **V3** → Cambia IDs, clases y textos (evita memorización)
5. **Keys únicos** → Cada componente tiene su propia variante
6. **Funciona OFF** → Si está deshabilitado, no aplica cambios pero funciona igual

**Todo es determinístico:** Mismo seed = mismo resultado siempre.
