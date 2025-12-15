# 🔧 Flujo de Trabajo: Añadir V1 (Wrappers/Decoys) a Elementos

## 📋 Proceso

1. **Tienes la web diseñada** → Seed=1 es tu versión original (sin wrappers/decoys)
2. **Haces capturas** → Identificas elementos que quieres que varíen
3. **Me dices qué cambiar** → "En este elemento quiero wrappers/decoys"
4. **Yo lo implemento** → Añado `dyn.v1.wrap()` con opciones específicas

## 🎯 Cómo Funciona Actualmente

### Elementos que YA tienen wrappers V1:

```tsx
// Ejemplo: Header
{dyn.v1.wrap("home-header", (
  <div>...</div>
))}

// Ejemplo: Search Section
{dyn.v1.wrap("home-search-section", (
  <div>...</div>
))}

// Ejemplo: Stats Card
{dyn.v1.wrap("stats-movies-card", (
  <div>...</div>
))}
```

### Comportamiento:

- **Seed=1**: Sin wrappers ni decoys (versión original)
- **Seed=2-999**: Con wrappers/decoys dinámicos

## 🔨 Cómo Añadir Wrappers a Nuevos Elementos

### Opción 1: Wrapper Simple (por defecto)

```tsx
// Antes (sin wrapper)
<div className="mi-elemento">
  Contenido
</div>

// Después (con wrapper)
{dyn.v1.wrap("mi-elemento-key", (
  <div className="mi-elemento">
    Contenido
  </div>
))}
```

### Opción 2: Wrapper con Opciones Personalizadas

```tsx
// Con opciones específicas
{dyn.v1.wrap("mi-elemento-key", (
  <div className="mi-elemento">
    Contenido
  </div>
), {
  wrapperVariants: 3,  // 3 variantes: sin wrapper, wrapper tipo 1, wrapper tipo 2
  decoyVariants: 2,    // 2 variantes: sin decoy, con decoy antes
})}
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Añadir wrapper a un botón

**Tú dices:** "Quiero que el botón 'View Details' tenga wrappers"

**Yo implemento:**
```tsx
// Antes
<Button>View Details</Button>

// Después
{dyn.v1.wrap("view-details-button", (
  <Button>View Details</Button>
))}
```

### Ejemplo 2: Añadir wrapper a una sección completa

**Tú dices:** "Quiero que toda la sección de Featured Movies tenga wrappers"

**Yo implemento:**
```tsx
// Antes
<div className="featured-section">
  {/* contenido */}
</div>

// Después
{dyn.v1.wrap("featured-movies-section", (
  <div className="featured-section">
    {/* contenido */}
  </div>
))}
```

### Ejemplo 3: Añadir wrapper con múltiples variantes

**Tú dices:** "Quiero que el search input tenga 3 tipos diferentes de wrappers"

**Yo implemento:**
```tsx
{dyn.v1.wrap("search-input-container", (
  <div className="relative">
    <Input />
  </div>
), {
  wrapperVariants: 3,  // 3 tipos de wrappers
})}
```

## 🎨 Opciones Disponibles

### `wrapperVariants`
- **2** (por defecto): Con wrapper o sin wrapper
- **3+**: Múltiples tipos de wrappers

### `decoyVariants`
- **3** (por defecto): Sin decoy, decoy antes, decoy después
- **2**: Sin decoy, con decoy
- **4+**: Más variantes de posición

## 🔍 Cómo Identificar Elementos para Wrappers

Cuando me digas "en este elemento quiero wrappers", necesito:

1. **El componente/elemento específico** (ej: "el botón Search", "la card de Movies")
2. **La key única** (ej: "search-button", "movie-card")
3. **Opciones** (opcional): si quieres múltiples variantes

## ✅ Estado Actual

### Elementos que YA tienen wrappers:
- ✅ `home-header` - Header principal
- ✅ `home-search-section` - Sección de búsqueda
- ✅ `search-input-container` - Contenedor del input
- ✅ `stats-movies-card` - Card de Movies
- ✅ `stats-genres-card` - Card de Genres
- ✅ `stats-rating-card` - Card de Rating
- ✅ `stats-duration-card` - Card de Duration
- ✅ `featured-movie-{index}` - Cards de películas destacadas
- ✅ `home-genres-section` - Sección de géneros
- ✅ `home-features-section` - Sección de features

### Elementos que NO tienen wrappers (puedes pedirlos):
- ❌ Botones individuales (View Details, etc.)
- ❌ Links (SeedLink)
- ❌ Secciones específicas que quieras

## 🚀 Próximos Pasos

**Dime qué elementos quieres que tengan wrappers y yo los añado.**

Por ejemplo:
- "Quiero que el botón 'View Details' tenga wrappers"
- "Quiero que los genre cards tengan wrappers"
- "Quiero que la sección de spotlight tenga wrappers"
