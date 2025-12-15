# 🔄 Cómo Añadir Orden Dinámico a Cualquier Elemento

## 📋 Sistema Automático

Ya no necesitas hardcodear órdenes. El sistema **calcula automáticamente** todas las variantes posibles según el número de elementos.

## 🎯 Uso Básico

### Ejemplo: 6 elementos que quieres reordenar

```tsx
// Antes (hardcodeado)
const elementos = [elem1, elem2, elem3, elem4, elem5, elem6];
const orden = [0, 1, 2, 3, 4, 5]; // Orden fijo

// Después (automático)
const elementos = [elem1, elem2, elem3, elem4, elem5, elem6];
const orden = dyn.generateOrder("mi-seccion-key", elementos.length); // count = 6
const elementosOrdenados = orden.map(i => elementos[i]);
```

## 🔧 Cómo Funciona

### 1. **Detecta automáticamente el count**
- Si tienes 3 elementos → genera variantes para 3
- Si tienes 6 elementos → genera variantes para 6
- Si tienes 10 elementos → genera variantes para 10

### 2. **Genera variantes automáticamente**
- Rotaciones: [0,1,2,3] → [1,2,3,0] → [2,3,0,1] → [3,0,1,2]
- Intercambios de pares: [0,1,2,3] → [1,0,2,3]
- Inversiones parciales: [0,1,2,3] → [1,0,2,3]
- Shuffle basado en hash: orden completamente aleatorio pero determinístico

### 3. **Selecciona variante según seed**
- Seed=1 → Orden original [0, 1, 2, ..., count-1]
- Seed=2-999 → Una de las variantes generadas automáticamente

## 📝 Ejemplos de Implementación

### Ejemplo 1: Stats Cards (4 elementos)

```tsx
const statsCards = [moviesCard, genresCard, ratingCard, durationCard];

// Orden automático - no necesitas hardcodear nada
const order = dyn.generateOrder("stats-cards", statsCards.length); // count = 4
const orderedCards = order.map(i => statsCards[i]);

return (
  <div>
    {orderedCards.map((card, displayIndex) => (
      <Card key={card.id}>{card.content}</Card>
    ))}
  </div>
);
```

### Ejemplo 2: Featured Movies (3 elementos)

```tsx
const movies = featuredMovies.slice(0, 3);

// Orden automático - count = 3
const order = dyn.generateOrder("featured-movies", movies.length);
const orderedMovies = order.map(i => movies[i]);

return (
  <div>
    {orderedMovies.map((movie, displayIndex) => (
      <MovieCard key={movie.id}>{movie.title}</MovieCard>
    ))}
  </div>
);
```

### Ejemplo 3: Genre Cards (6 elementos)

```tsx
const genres = ["Drama", "Action", "Comedy", "Thriller", "Horror", "Sci-Fi"];

// Orden automático - count = 6
const order = dyn.generateOrder("genre-cards", genres.length);
const orderedGenres = order.map(i => genres[i]);

return (
  <div>
    {orderedGenres.map((genre, displayIndex) => (
      <GenreCard key={genre}>{genre}</GenreCard>
    ))}
  </div>
);
```

## 🎨 Flujo de Trabajo

1. **Tú me dices:** "Quiero que estos 6 elementos cambien de orden"
2. **Yo implemento:**
   ```tsx
   const order = dyn.generateOrder("mi-seccion-key", 6);
   const elementosOrdenados = order.map(i => elementos[i]);
   ```
3. **Resultado:**
   - Seed=1 → Orden original
   - Seed=5 → Orden diferente (calculado automáticamente)
   - Seed=10 → Otro orden diferente

## ✅ Ventajas

- ✅ **No necesitas hardcodear órdenes** - El sistema los genera automáticamente
- ✅ **Funciona con cualquier número de elementos** (3, 4, 6, 10, etc.)
- ✅ **Seed=1 siempre es original** - Tu diseño base se mantiene intacto
- ✅ **Determinístico** - El mismo seed siempre produce el mismo orden

## 🔍 Cómo Verificar

1. Abre `?seed=1` → Orden original
2. Abre `?seed=5` → Orden diferente
3. Abre `?seed=10` → Otro orden diferente

Cada seed produce un orden único y determinístico.
