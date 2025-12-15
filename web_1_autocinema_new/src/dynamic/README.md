# Sistema Dinámico V1 y V3

Sistema centralizado para variantes dinámicas que rompen XPath (V1) y evitan memorización (V3).

## 📁 Estructura

```
src/dynamic/
  ├── v1/              # V1: Wrappers y decoys (estructura DOM)
  │   ├── structure.ts  # Aplicar wrappers y decoys
  │   └── index.ts
  │
  ├── v2-data/          # V2: Data loading (ya funciona bien)
  │   ├── data-provider.ts
  │   └── index.ts
  │
  ├── v3/               # V3: Atributos y textos
  │   ├── utils/
  │   │   └── variant-selector.ts  # Función unificada getVariant()
  │   ├── data/         # JSON files (text-variants, id-variants, class-variants)
  │   └── index.ts
  │
  ├── shared/           # Compartido entre V1 y V3
  │   ├── core.ts       # Funciones base + hook useDynamicSystem()
  │   ├── flags.ts      # Flags de habilitación (isV1Enabled, isV3Enabled)
  │   ├── order-utils.ts # Generación de orden dinámico
  │   └── index.ts      # Export principal
  │
  └── index.ts          # Export principal
```

## 🎯 Cómo Funciona

### Concepto Base

Todo el sistema usa **`selectVariantIndex(seed, key, count)`** para seleccionar variantes de forma determinística:

```typescript
selectVariantIndex(seed, "movie-card", 3)  // Devuelve 0, 1 o 2
```

- **`seed`**: El seed base (1-999) que viene de la URL
- **`key`**: Identificador único del componente (ej: "movie-card", "search-button")
- **`count`**: Número de variantes disponibles
- **Resultado**: Un número determinístico (0 a count-1) que siempre será el mismo para el mismo seed+key

### V1: Wrappers y Decoys (Rompe XPath)

**¿Qué hace?**
- Añade wrappers `<div>` alrededor de elementos
- Añade elementos decoy invisibles antes/después
- **Objetivo**: Romper XPath memorizado por scrapers

**¿Cómo funciona?**
```typescript
// Siempre usa 2 variantes de wrapper (0=sin, 1=con) y 3 de decoy (0=sin, 1=antes, 2=después)
dyn.v1.addWrapDecoy("movie-card", <div>...</div>)
```

### V3: Atributos y Textos (Anti-memorización)

**¿Qué hace?**
- Cambia IDs: "movie-card" → "film-card" (según seed)
- Cambia clases: "button" → "btn-primary" (según seed)
- Cambia textos: "View detail" → "See more" (según seed)
- **Objetivo**: Evitar que scrapers memoricen selectores fijos

**¿Cómo funciona?**
Una sola función unificada `getVariant()` para todo:

```typescript
// IDs: usando diccionario local o global
<input id={dyn.v3.getVariant("search-input", ID_VARIANTS_MAP)} />

// Clases: usando diccionario global
<button className={dyn.v3.getVariant("button", CLASS_VARIANTS_MAP)} />

// Textos: busca automáticamente en TEXT_VARIANTS_MAP
<label>{dyn.v3.getVariant("search_placeholder", undefined, "Search...")}</label>

// Textos locales: usando diccionario del componente
<h3>{dyn.v3.getVariant("feature_1_title", dynamicV3TextVariants)}</h3>
```

## 🚀 Uso

### Hook Principal (Recomendado)

```typescript
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";

function MyComponent() {
  const dyn = useDynamicSystem();
  
  // Variantes locales (solo para este componente)
  const dynamicV3IdsVariants: Record<string, string[]> = {
    "section": ["hero-section", "main-hero", "primary-hero"],
  };
  
  const dynamicV3TextVariants: Record<string, string[]> = {
    "title": ["Welcome", "Bienvenido", "Hello"],
  };
  
  return (
    <>
      {/* V1: Wrappers específicos para este componente */}
      {dyn.v1.addWrapDecoy("my-component", (
        <div 
          id={dyn.v3.getVariant("section", dynamicV3IdsVariants)}  // IDs locales
          className={dyn.v3.getVariant("button", CLASS_VARIANTS_MAP)}  // Clases globales
        >
          <h1>{dyn.v3.getVariant("title", dynamicV3TextVariants)}</h1>
          <button>
            {dyn.v3.getVariant("search_placeholder", undefined, "Search...")}  // Textos globales
          </button>
        </div>
      ))}
    </>
  );
}
```

### Orden Dinámico

```typescript
// Cambiar orden de elementos basado en seed
const orderedItems = useMemo(() => {
  const order = dyn.v1.changeOrderElements("my-items", items.length);
  return order.map((idx) => items[idx]);
}, [dyn.seed, items]);
```

## 📋 Reglas Importantes

### 1. Cada componente debe usar su propio `key` único

✅ **Correcto:**
```typescript
dyn.v1.addWrapDecoy("movie-card", ...)        // Key específico del componente
dyn.v1.addWrapDecoy("movie-card-button", ...) // Key específico del botón dentro del card
dyn.v3.getVariant("movie-card", ID_VARIANTS_MAP)  // Key específico
```

❌ **Incorrecto:**
```typescript
dyn.v1.addWrapDecoy("card", ...)  // Demasiado genérico, puede colisionar
dyn.v3.getVariant("button", ID_VARIANTS_MAP)  // Demasiado genérico
```

### 2. Organización de Variantes

- **Globales** (en JSONs): Elementos que se reutilizan en múltiples componentes
  - `id-variants.json`: IDs reutilizables
  - `class-variants.json`: Clases reutilizables
  - `text-variants.json`: Textos reutilizables

- **Locales** (en componentes): Elementos específicos de un solo componente
  ```typescript
  const dynamicV3IdsVariants: Record<string, string[]> = {
    "hero-section": ["hero", "main-hero", "primary-hero"],
  };
  ```

### 3. Funciona igual aunque estén OFF

- **V1 OFF**: `dyn.v1.wrap()` devuelve children sin cambios
- **V3 OFF**: `dyn.v3.getVariant()` devuelve fallback o key

### 4. Seed = 1 siempre es la versión original

- `seed=1` siempre devuelve la primera variante (índice 0)
- Esto asegura que la versión "base" siempre sea la misma

## 🔧 Configuración

### Flags de Habilitación

Controlados por variables de entorno:
- `NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true` → Habilita V1 (wrappers/decoy)
- `NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true` → Habilita V3 (atributos/textos)

### Archivos JSON de Variantes

Los archivos JSON definen las variantes disponibles (solo para elementos reutilizables):

- **`v3/data/text-variants.json`**: Variantes de textos (formato key-based)
  ```json
  {
    "search_placeholder": ["Search...", "Find...", "Look for..."],
    "view_details": ["View Details", "See More", "More Info"]
  }
  ```

- **`v3/data/id-variants.json`**: Variantes de IDs
  ```json
  {
    "movie-card": ["movie-card", "film-card", "movie-tile"],
    "search-input": ["search-input", "query-box", "filter-input"]
  }
  ```

- **`v3/data/class-variants.json`**: Variantes de clases
  ```json
  {
    "button": ["button", "btn", "btn-primary"],
    "card": ["card", "tile", "panel"]
  }
  ```

## 📝 Ejemplo Completo

```typescript
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { generateDynamicOrder } from "@/dynamic/v1";

export function MovieCard({ movie }: { movie: Movie }) {
  const dyn = useDynamicSystem();
  
  // Variantes locales específicas de este componente
  const dynamicV3IdsVariants: Record<string, string[]> = {
    "card": ["movie-card", "film-card", "movie-tile"],
  };
  
  return (
    <>
      {/* V1: Wrapper específico para el card */}
      {dyn.v1.addWrapDecoy("movie-card", (
        <div 
          id={dyn.v3.getVariant("card", dynamicV3IdsVariants)}  // ID local
          className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP)}  // Clase global
        >
          <h3>{movie.title}</h3>
          
          {/* V1: Wrapper específico para el botón dentro del card */}
          {dyn.v1.addWrapDecoy("movie-card-button", (
            <button
              id={dyn.v3.getVariant("view-details-btn", ID_VARIANTS_MAP)}  // ID global
              className={dyn.v3.getVariant("button", CLASS_VARIANTS_MAP)}  // Clase global
            >
              {dyn.v3.getVariant("view_details", undefined, "View Details")}  // Texto global
            </button>
          ))}
        </div>
      ))}
    </>
  );
}
```

## 🔍 Flujo de Ejecución

1. **Componente llama a `useDynamicSystem()`**
   - Obtiene `seed` del contexto (que lo lee de la URL)
   - El seed se pasa automáticamente a todas las funciones

2. **V1: `dyn.v1.addWrapDecoy("movie-card", children)`**
   - `selectVariantIndex(seed, "movie-card-wrapper", 2)` → Decide wrapper
   - `selectVariantIndex(seed, "movie-card-decoy", 3)` → Decide decoy
   - Aplica wrappers/decoy si V1 está habilitado

3. **V3: `dyn.v3.getVariant("movie-card", ID_VARIANTS_MAP)`**
   - Busca primero en el diccionario proporcionado (si existe)
   - Si no, busca en `ID_VARIANTS_MAP`, `CLASS_VARIANTS_MAP`, o `TEXT_VARIANTS_MAP`
   - `selectVariantIndex(seed, "movie-card", variants.length)` → Selecciona índice
   - Devuelve la variante seleccionada (o fallback si no existe)

4. **V1: `dyn.v1.changeOrderElements("features", 4)`**
   - Genera un orden dinámico basado en el seed
   - `seed=1` siempre devuelve el orden original [0, 1, 2, 3]
   - Otros seeds generan permutaciones determinísticas

## ✅ Ventajas

- **Determinístico**: Mismo seed = mismas variantes
- **Por componente**: Cada componente tiene variantes independientes
- **Organizado**: Globales en JSON, locales en componentes
- **Escalable**: Fácil añadir más variantes
- **Simple**: Una sola función `getVariant()` para todo
- **Funciona OFF**: Si V1/V3 están deshabilitados, funciona igual
