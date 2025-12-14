# Sistema Dinámico

Sistema organizado para V1 (wrappers/decoy), V2 (data) y V3 (atributos/textos).

**IMPORTANTE**: Cada componente debe usar su propio `key` único para tener variantes independientes.

## Estructura

```
src/dynamic/
  ├── v1/              # V1: Wrappers y decoys (estructura DOM)
  │   ├── structure.ts  # Aplicar wrappers y decoys
  │   └── index.ts
  │
  ├── v2-data/          # V2: Data loading
  │   ├── data-provider.ts
  │   └── index.ts
  │
  ├── v3/               # V3: Atributos y textos
  │   ├── attributes.ts # Funciones V3 (text, id, class)
  │   ├── utils/        # Utilidades (id-generator, text-selector, class-selector)
  │   ├── data/         # JSON files (text-variants, id-variants, class-variants)
  │   └── index.ts
  │
  ├── shared/           # Compartido entre V1 y V3
  │   ├── core.ts       # Funciones base (hash, pickVariant)
  │   ├── flags.ts      # Flags de habilitación
  │   ├── types.ts      # Tipos TypeScript
  │   ├── useDynamic.ts # Hook centralizado que unifica V1 y V3
  │   └── index.ts
  │
  └── index.ts          # Export principal
```

## Uso

### Hook Principal (Recomendado)

```typescript
import { useDynamic } from "@/dynamic/shared";  // O simplemente: import { useDynamic } from "@/dynamic";

const dyn = useDynamic();
dyn.v1.wrap()      // V1: Wrappers y decoys (por componente)
dyn.v3.text()      // V3: Textos (por componente)
dyn.v3.id()        // V3: IDs (por componente)
dyn.v3.class()     // V3: Clases (por componente)
```

### Uso Directo (Si se necesita)

```typescript
import { applyV1Wrapper } from "@/dynamic/v1";
import { getV3Text, getV3Id, getV3Class } from "@/dynamic/v3";
import { pickVariant, isV1Enabled, isV3Enabled } from "@/dynamic/shared";
```

## V1: Wrappers y Decoys (Por Componente)

Añade elementos invisibles al DOM para romper XPath. **Cada componente tiene sus propias variantes**.

```typescript
// Básico: usa variantes por defecto (2 wrappers, 3 decoys)
{dyn.v1.wrap("movie-card", <div>...</div>)}

// Avanzado: define variantes personalizadas para este componente
{dyn.v1.wrap("movie-card", <div>...</div>, {
  wrapperVariants: 3,  // 3 opciones de wrapper para este componente
  decoyVariants: 4     // 4 opciones de decoy para este componente
})}
```

**¿Cómo funciona?**
- Usa `pickVariant(seed, "movie-card-wrapper", 3)` para wrappers
- Usa `pickVariant(seed, "movie-card-decoy", 4)` para decoys
- Cada componente con su propio `key` tiene variantes independientes

## V2: Data Loading

Carga datos basados en seed. Ya funciona bien.

```typescript
import { getMovies, searchMovies } from "@/dynamic/v2-data";
```

## V3: Atributos y Textos (Por Componente)

Cambia IDs, clases y textos para evitar memorización. **Cada componente usa su propio key**.

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

**¿Cómo funciona?**
- `dyn.v3.id("search-input")` → `pickVariant(seed, "search-input", variants.length)`
- `dyn.v3.class("movie-card", "")` → `pickVariant(seed, "movie-card", variants.length)`
- `dyn.v3.text("first_name", "...")` → `pickVariant(seed, "first_name", VARIANT_COUNT)`
- Cada key único tiene sus propias variantes determinísticas

## Ejemplo Completo por Componente

```typescript
import { useDynamic } from "@/dynamic/shared";
import { cn } from "@/library/utils";

export function MovieCard({ movie }: { movie: Movie }) {
  const dyn = useDynamic();
  
  return (
    <>
      {/* V1: Wrappers específicos para este componente */}
      {dyn.v1.wrap("movie-card", (
        <div 
          id={dyn.v3.id("movie-card")}  // V3: ID específico del componente
          className={cn(
            "card-base",
            dyn.v3.class("movie-card", "")  // V3: Clase específica del componente
          )}
        >
          <h3>{movie.title}</h3>
          
          {/* V1: Wrapper específico para el botón dentro del card */}
          {dyn.v1.wrap("movie-card-button", (
            <button
              id={dyn.v3.id("view-details-btn")}  // V3: ID específico del botón
              className={dyn.v3.class("view-button", "")}  // V3: Clase específica del botón
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

## Reglas Importantes

1. **Cada componente debe usar su propio `key` único**
   - ✅ `dyn.v1.wrap("movie-card", ...)` 
   - ✅ `dyn.v1.wrap("movie-card-button", ...)`
   - ❌ `dyn.v1.wrap("card", ...)` (demasiado genérico, puede colisionar)

2. **V3 también usa keys por componente**
   - ✅ `dyn.v3.id("movie-card")` 
   - ✅ `dyn.v3.class("movie-card", "")`
   - ✅ `dyn.v3.text("view_details", "...")`

3. **Todo usa `pickVariant(seed, key, count)`**
   - V1: `pickVariant(seed, "movie-card-wrapper", wrapperVariants)`
   - V3: `pickVariant(seed, "movie-card", variants.length)`

## Funciona Igual Aunque Estén OFF

- **V1 OFF**: `dyn.v1.wrap()` devuelve children sin cambios
- **V3 OFF**: `dyn.v3.text/id/class` devuelve valores por defecto
