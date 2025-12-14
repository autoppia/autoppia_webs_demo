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
  │   ├── utils/        # Utilidades (id-generator, text-selector, class-selector)
  │   ├── data/         # JSON files (text-variants, id-variants, class-variants)
  │   └── index.ts
  │
  ├── shared/           # Compartido entre V1 y V3
  │   ├── core.ts       # Funciones base + hook useDynamic()
  │   ├── flags.ts      # Flags de habilitación (isV1Enabled, isV3Enabled)
  │   └── index.ts      # Export principal
  │
  └── index.ts          # Export principal
```

## 🎯 Cómo Funciona

### Concepto Base

Todo el sistema usa **`pickVariant(seed, key, count)`** para seleccionar variantes de forma determinística:

```typescript
pickVariant(seed, "movie-card", 3)  // Devuelve 0, 1 o 2
```

- **`seed`**: El seed base (1-999) que viene del contexto
- **`key`**: Identificador único del componente (ej: "movie-card", "search-button")
- **`count`**: Número de variantes disponibles
- **Resultado**: Un número determinístico (0 a count-1) que siempre será el mismo para el mismo seed+key

### V1: Wrappers y Decoys (Rompe XPath)

**¿Qué hace?**
- Añade `<span>` wrappers alrededor de elementos
- Añade elementos decoy invisibles antes/después
- **Objetivo**: Romper XPath memorizado por scrapers

**¿Cómo funciona?**
```typescript
// Cada componente tiene sus propias variantes
dyn.v1.wrap("movie-card", <div>...</div>)
```

Internamente:
1. `pickVariant(seed, "movie-card-wrapper", 2)` → Decide si añadir wrapper (0=sin, 1=con)
2. `pickVariant(seed, "movie-card-decoy", 3)` → Decide posición del decoy (0=none, 1=before, 2=after)

**Ejemplo:**
```typescript
// Básico: usa variantes por defecto (2 wrappers, 3 decoys)
{dyn.v1.wrap("movie-card", <div>...</div>)}

// Avanzado: define variantes personalizadas
{dyn.v1.wrap("movie-card", <div>...</div>, {
  wrapperVariants: 3,  // Este componente tiene 3 opciones de wrapper
  decoyVariants: 4     // Este componente tiene 4 opciones de decoy
})}
```

### V3: Atributos y Textos (Anti-memorización)

**¿Qué hace?**
- Cambia IDs: "movie-card" → "film-card" (según seed)
- Cambia clases: "button" → "btn-primary" (según seed)
- Cambia textos: "View detail" → "See more" (según seed)
- **Objetivo**: Evitar que scrapers memoricen selectores fijos

**¿Cómo funciona?**
Cada componente usa su propio `key` único:

```typescript
// IDs: cada componente tiene su propio key
<input id={dyn.v3.id("search-input")} />        // key: "search-input"
<button id={dyn.v3.id("submit-button")} />       // key: "submit-button"

// Clases: cada componente tiene su propio key
<div className={dyn.v3.class("movie-card", "")} />  // key: "movie-card"
<button className={dyn.v3.class("primary-btn", "")} /> // key: "primary-btn"

// Textos: cada componente tiene su propio key
<label>{dyn.v3.text("first_name", "First Name")}</label>  // key: "first_name"
<button>{dyn.v3.text("submit", "Submit")}</button>         // key: "submit"
```

Internamente:
1. `dyn.v3.id("movie-card")` → `pickVariant(seed, "movie-card", variants.length)` → Selecciona ID del JSON
2. `dyn.v3.class("button", "")` → `pickVariant(seed, "button", variants.length)` → Selecciona clase del JSON
3. `dyn.v3.text("view_details", "...")` → `pickVariant(seed, "view_details", VARIANT_COUNT)` → Selecciona texto del JSON

## 🚀 Uso

### Hook Principal (Recomendado)

```typescript
import { useDynamic } from "@/dynamic/shared";

function MyComponent() {
  const dyn = useDynamic();
  
  return (
    <>
      {/* V1: Wrappers específicos para este componente */}
      {dyn.v1.wrap("my-component", (
        <div 
          id={dyn.v3.id("my-component")}  // V3: ID específico
          className={dyn.v3.class("my-component", "")}  // V3: Clase específica
        >
          <button
            id={dyn.v3.id("my-button")}  // V3: ID específico del botón
            className={dyn.v3.class("button", "")}  // V3: Clase específica
          >
            {dyn.v3.text("submit", "Submit")}  // V3: Texto específico
          </button>
        </div>
      ))}
    </>
  );
}
```

### Uso Directo (Si se necesita)

```typescript
import { applyV1Wrapper } from "@/dynamic/v1";
import { generateElementId, getTextForElement, getClassForElement } from "@/dynamic/v3";
import { pickVariant, isV1Enabled, isV3Enabled } from "@/dynamic/shared";
```

## 📋 Reglas Importantes

### 1. Cada componente debe usar su propio `key` único

✅ **Correcto:**
```typescript
dyn.v1.wrap("movie-card", ...)        // Key específico del componente
dyn.v1.wrap("movie-card-button", ...) // Key específico del botón dentro del card
dyn.v3.id("movie-card")               // Key específico
dyn.v3.id("view-details-btn")         // Key específico del botón
```

❌ **Incorrecto:**
```typescript
dyn.v1.wrap("card", ...)  // Demasiado genérico, puede colisionar
dyn.v3.id("button")       // Demasiado genérico, puede colisionar
```

### 2. Todo usa `pickVariant(seed, key, count)`

- **V1**: `pickVariant(seed, "movie-card-wrapper", wrapperVariants)`
- **V3 IDs**: `pickVariant(seed, "movie-card", variants.length)`
- **V3 Clases**: `pickVariant(seed, "button", variants.length)`
- **V3 Textos**: `pickVariant(seed, "view_details", VARIANT_COUNT)`

### 3. Funciona igual aunque estén OFF

- **V1 OFF**: `dyn.v1.wrap()` devuelve children sin cambios
- **V3 OFF**: `dyn.v3.text/id/class` devuelve valores por defecto

## 🔧 Configuración

### Flags de Habilitación

Controlados por variables de entorno:
- `NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true` → Habilita V1 (wrappers/decoy)
- `NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true` → Habilita V3 (atributos/textos)

### Archivos JSON de Variantes

Los archivos JSON definen las variantes disponibles:

- **`v3/data/text-variants.json`**: Variantes de textos
  ```json
  {
    "1": { "view_details": "View detail", "submit": "Submit" },
    "2": { "view_details": "See more", "submit": "Send" }
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
import { useDynamic } from "@/dynamic/shared";
import { cn } from "@/library/utils";

export function MovieCard({ movie }: { movie: Movie }) {
  const dyn = useDynamic();
  
  return (
    <>
      {/* V1: Wrapper específico para el card */}
      {dyn.v1.wrap("movie-card", (
        <div 
          id={dyn.v3.id("movie-card")}  // V3: ID específico
          className={cn(
            "card-base",
            dyn.v3.class("movie-card", "")  // V3: Clase específica
          )}
        >
          <h3>{movie.title}</h3>
          
          {/* V1: Wrapper específico para el botón dentro del card */}
          {dyn.v1.wrap("movie-card-button", (
            <button
              id={dyn.v3.id("view-details-btn")}  // V3: ID específico del botón
              className={dyn.v3.class("view-button", "")}  // V3: Clase específica
            >
              {dyn.v3.text("view_details", "View detail")}  // V3: Texto específico
            </button>
          ))}
        </div>
      ))}
    </>
  );
}
```

## 🔍 Flujo de Ejecución

1. **Componente llama a `useDynamic()`**
   - Obtiene `seed` del contexto
   - Calcula `v3Seed` si está disponible

2. **V1: `dyn.v1.wrap("movie-card", children)`**
   - `pickVariant(seed, "movie-card-wrapper", 2)` → Decide wrapper
   - `pickVariant(seed, "movie-card-decoy", 3)` → Decide decoy
   - Aplica wrappers/decoy si V1 está habilitado

3. **V3: `dyn.v3.id("movie-card")`**
   - `pickVariant(v3Seed, "movie-card", variants.length)` → Selecciona índice
   - Busca en `id-variants.json` el ID correspondiente
   - Devuelve el ID seleccionado

4. **V3: `dyn.v3.text("view_details", "View detail")`**
   - `pickVariant(v3Seed, "view_details", VARIANT_COUNT)` → Selecciona variante
   - Busca en `text-variants.json` el texto correspondiente
   - Devuelve el texto o fallback si no existe

## ✅ Ventajas

- **Determinístico**: Mismo seed = mismas variantes
- **Por componente**: Cada componente tiene variantes independientes
- **Escalable**: Fácil añadir más variantes en los JSON
- **Simple**: Todo centralizado en `useDynamic()`
- **Funciona OFF**: Si V1/V3 están deshabilitados, funciona igual
